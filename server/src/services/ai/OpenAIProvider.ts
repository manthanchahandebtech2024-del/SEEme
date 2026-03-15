import { IAIProvider, AIAnalysisResult, AIBiasAnalysis } from "../../interfaces/IAIProvider";
import { ChatMessage } from "../../utils/types";
import { createLogger } from "../../utils/logger";

const logger = createLogger("OpenAIProvider");

export class OpenAIProvider implements IAIProvider {
  readonly name = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  get isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  private async callAPI(messages: { role: string; content: string }[], jsonMode = false): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: 0.3,
      max_tokens: 2000,
    };
    if (jsonMode) body.response_format = { type: "json_object" };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error("OpenAI API error", { status: res.status, error: err });
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message?.content || "";
  }

  async analyzeResumeVsJD(resumeText: string, jdText: string): Promise<AIAnalysisResult> {
    logger.info("Running OpenAI semantic analysis");
    const prompt = `You are an expert ATS resume analyst. Analyze this resume against the job description.

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jdText.substring(0, 2000)}

Return a JSON object with:
{
  "semanticScore": <0-100 semantic match score>,
  "insights": [<3-5 specific insights about alignment>],
  "rewriteSuggestions": [<3-5 specific rewrite suggestions for weak bullets>],
  "missingContextualSkills": [<skills the JD needs that resume lacks>],
  "strengthSummary": "<one sentence about what's strong>",
  "gapSummary": "<one sentence about main gaps>"
}`;

    const raw = await this.callAPI([{ role: "system", content: "You are an expert resume analyst. Return valid JSON only." }, { role: "user", content: prompt }], true);
    try {
      return JSON.parse(raw);
    } catch {
      logger.warn("Failed to parse OpenAI response, using fallback");
      return { semanticScore: 50, insights: ["Analysis could not be parsed"], rewriteSuggestions: [], missingContextualSkills: [], strengthSummary: "Unable to determine", gapSummary: "Unable to determine" };
    }
  }

  async detectSubtleBias(resumeText: string): Promise<AIBiasAnalysis> {
    const prompt = `Analyze this resume text for any subtle bias indicators that a recruiter might unconsciously be influenced by. Return JSON:
{
  "subtleBiasIndicators": [<list of subtle bias signals>],
  "toneIssues": [<any tone issues that might affect perception>],
  "recommendations": [<how to make it more neutral>]
}

TEXT: ${resumeText.substring(0, 2000)}`;

    const raw = await this.callAPI([{ role: "system", content: "You are a DEI expert analyzing for bias. Return valid JSON only." }, { role: "user", content: prompt }], true);
    try {
      return JSON.parse(raw);
    } catch {
      return { subtleBiasIndicators: [], toneIssues: [], recommendations: [] };
    }
  }

  async rewriteBulletPoints(bullets: string[], jdContext: string): Promise<string[]> {
    const prompt = `Rewrite these resume bullet points to better match this job context. Use strong action verbs, quantify impact where possible, and incorporate relevant keywords.

JOB CONTEXT: ${jdContext.substring(0, 1000)}

BULLETS TO REWRITE:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Return JSON: { "rewritten": ["<improved bullet 1>", "<improved bullet 2>", ...] }`;

    const raw = await this.callAPI([{ role: "system", content: "You are an expert resume writer. Return valid JSON only." }, { role: "user", content: prompt }], true);
    try {
      const parsed = JSON.parse(raw);
      return parsed.rewritten || bullets;
    } catch {
      return bullets;
    }
  }

  async chat(messages: ChatMessage[], resumeContext?: string, jdContext?: string): Promise<string> {
    const systemPrompt = `You are SEEme's AI Resume Coach. You help job seekers improve their resumes to pass ATS systems and impress recruiters. Be specific, actionable, and encouraging. Use markdown formatting.
${resumeContext ? `\nThe user's resume context: ${resumeContext.substring(0, 1500)}` : ""}
${jdContext ? `\nTarget job description: ${jdContext.substring(0, 1000)}` : ""}`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    return this.callAPI(apiMessages);
  }

  async parseJobDescription(jdText: string) {
    const prompt = `Parse this job description into structured data. Return JSON:
{
  "title": "<job title>",
  "requiredSkills": ["<skill1>", ...],
  "preferredSkills": ["<skill1>", ...],
  "requiredExperience": <number of years>,
  "responsibilities": ["<resp1>", ...],
  "companyValues": ["<value1>", ...]
}

JOB DESCRIPTION:
${jdText.substring(0, 3000)}`;

    const raw = await this.callAPI([{ role: "system", content: "You are an expert job description parser. Return valid JSON only." }, { role: "user", content: prompt }], true);
    try {
      return JSON.parse(raw);
    } catch {
      return { title: "Position", requiredSkills: [], preferredSkills: [], requiredExperience: 3, responsibilities: [], companyValues: [] };
    }
  }
}
