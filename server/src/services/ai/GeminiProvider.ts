import { IAIProvider, AIAnalysisResult, AIBiasAnalysis } from "../../interfaces/IAIProvider";
import { ChatMessage } from "../../utils/types";
import { createLogger } from "../../utils/logger";

const logger = createLogger("GeminiProvider");

export class GeminiProvider implements IAIProvider {
  readonly name = "gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  get isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  private async callAPI(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error("Gemini API error", { status: res.status, error: err });
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  private extractJSON(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : "{}";
  }

  async analyzeResumeVsJD(resumeText: string, jdText: string): Promise<AIAnalysisResult> {
    logger.info("Running Gemini semantic analysis");
    const prompt = `You are an expert ATS resume analyst. Analyze this resume against the job description.

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jdText.substring(0, 2000)}

Return ONLY a JSON object (no markdown, no code fences):
{"semanticScore": <0-100>, "insights": [<3-5 strings>], "rewriteSuggestions": [<3-5 strings>], "missingContextualSkills": [<strings>], "strengthSummary": "<string>", "gapSummary": "<string>"}`;

    const raw = await this.callAPI(prompt);
    try {
      return JSON.parse(this.extractJSON(raw));
    } catch {
      return { semanticScore: 50, insights: [], rewriteSuggestions: [], missingContextualSkills: [], strengthSummary: "Unable to determine", gapSummary: "Unable to determine" };
    }
  }

  async detectSubtleBias(resumeText: string): Promise<AIBiasAnalysis> {
    const prompt = `Analyze for subtle bias indicators. Return ONLY JSON (no code fences):
{"subtleBiasIndicators": [<strings>], "toneIssues": [<strings>], "recommendations": [<strings>]}

TEXT: ${resumeText.substring(0, 2000)}`;
    const raw = await this.callAPI(prompt);
    try {
      return JSON.parse(this.extractJSON(raw));
    } catch {
      return { subtleBiasIndicators: [], toneIssues: [], recommendations: [] };
    }
  }

  async rewriteBulletPoints(bullets: string[], jdContext: string): Promise<string[]> {
    const prompt = `Rewrite these resume bullets for this job. Return ONLY JSON: {"rewritten": ["<bullet>", ...]}

JOB: ${jdContext.substring(0, 1000)}
BULLETS:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}`;
    const raw = await this.callAPI(prompt);
    try {
      return JSON.parse(this.extractJSON(raw)).rewritten || bullets;
    } catch {
      return bullets;
    }
  }

  async chat(messages: ChatMessage[], resumeContext?: string, jdContext?: string): Promise<string> {
    const context = `You are SEEme's AI Resume Coach. Be specific and actionable. Use markdown.
${resumeContext ? `Resume context: ${resumeContext.substring(0, 1500)}` : ""}
${jdContext ? `Job: ${jdContext.substring(0, 1000)}` : ""}

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Respond as the assistant:`;
    return this.callAPI(context);
  }

  async parseJobDescription(jdText: string) {
    const prompt = `Parse this JD. Return ONLY JSON: {"title": "<string>", "requiredSkills": [<strings>], "preferredSkills": [<strings>], "requiredExperience": <number>, "responsibilities": [<strings>], "companyValues": [<strings>]}

${jdText.substring(0, 3000)}`;
    const raw = await this.callAPI(prompt);
    try {
      return JSON.parse(this.extractJSON(raw));
    } catch {
      return { title: "Position", requiredSkills: [], preferredSkills: [], requiredExperience: 3, responsibilities: [], companyValues: [] };
    }
  }
}
