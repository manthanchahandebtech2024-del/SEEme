import { AzureOpenAI } from "openai";
import { IAIProvider, AIAnalysisResult, AIBiasAnalysis } from "../../interfaces/IAIProvider";
import { ChatMessage } from "../../utils/types";
import { createLogger } from "../../utils/logger";

const logger = createLogger("AzureOpenAIProvider");

export class AzureOpenAIProvider implements IAIProvider {
  readonly name = "azure";
  private client: AzureOpenAI;
  private apiKey: string;
  private deployment: string;

  constructor(apiKey: string, endpoint: string, deployment: string, apiVersion: string = "2023-05-15") {
    this.apiKey = apiKey;
    this.deployment = deployment;
    this.client = new AzureOpenAI({
      apiKey,
      apiVersion,
      endpoint: endpoint.replace(/\/$/, ""),
    });
  }

  get isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  private async callAPI(messages: { role: string; content: string }[], jsonMode = false): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.deployment,
      messages: messages as any,
      temperature: 0.3,
      max_tokens: 2000,
      ...(jsonMode && { response_format: { type: "json_object" } }),
    });

    return response.choices[0]?.message?.content || "";
  }

  async analyzeResumeVsJD(resumeText: string, jdText: string): Promise<AIAnalysisResult> {
    logger.info("Running Azure OpenAI semantic analysis");
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

    try {
      const raw = await this.callAPI(
        [{ role: "system", content: "You are an expert resume analyst. Return valid JSON only." }, { role: "user", content: prompt }],
        true
      );
      return JSON.parse(raw);
    } catch (err) {
      logger.error("Azure analysis failed", err);
      return { semanticScore: 50, insights: ["Analysis could not be completed"], rewriteSuggestions: [], missingContextualSkills: [], strengthSummary: "Unable to determine", gapSummary: "Unable to determine" };
    }
  }

  async detectSubtleBias(resumeText: string): Promise<AIBiasAnalysis> {
    const prompt = `Analyze this resume text for subtle bias indicators a recruiter might unconsciously be influenced by. Return JSON:
{
  "subtleBiasIndicators": [<list of subtle bias signals>],
  "toneIssues": [<tone issues affecting perception>],
  "recommendations": [<how to make it more neutral>]
}

TEXT: ${resumeText.substring(0, 2000)}`;

    try {
      const raw = await this.callAPI(
        [{ role: "system", content: "You are a DEI expert analyzing for bias. Return valid JSON only." }, { role: "user", content: prompt }],
        true
      );
      return JSON.parse(raw);
    } catch {
      return { subtleBiasIndicators: [], toneIssues: [], recommendations: [] };
    }
  }

  async rewriteBulletPoints(bullets: string[], jdContext: string): Promise<string[]> {
    const prompt = `Rewrite these resume bullet points to better match this job context. Use strong action verbs, quantify impact.

JOB CONTEXT: ${jdContext.substring(0, 1000)}

BULLETS:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Return JSON: { "rewritten": ["<improved bullet 1>", "<improved bullet 2>", ...] }`;

    try {
      const raw = await this.callAPI(
        [{ role: "system", content: "You are an expert resume writer. Return valid JSON only." }, { role: "user", content: prompt }],
        true
      );
      return JSON.parse(raw).rewritten || bullets;
    } catch {
      return bullets;
    }
  }

  async chat(messages: ChatMessage[], resumeContext?: string, jdContext?: string): Promise<string> {
    const systemPrompt = `You are SEEme's AI Resume Coach. You help job seekers improve their resumes to pass ATS systems and impress recruiters. Be specific, actionable, and encouraging. Use markdown formatting.
${resumeContext ? `\nThe user's resume context: ${resumeContext.substring(0, 1500)}` : ""}
${jdContext ? `\nTarget job description: ${jdContext.substring(0, 1000)}` : ""}`;

    return this.callAPI([
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]);
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

    try {
      const raw = await this.callAPI(
        [{ role: "system", content: "You are an expert job description parser. Return valid JSON only." }, { role: "user", content: prompt }],
        true
      );
      return JSON.parse(raw);
    } catch {
      return { title: "Position", requiredSkills: [], preferredSkills: [], requiredExperience: 3, responsibilities: [], companyValues: [] };
    }
  }
}
