import { IAIProvider, AIAnalysisResult, AIBiasAnalysis } from "../../interfaces/IAIProvider";
import { ChatMessage } from "../../utils/types";
import { createLogger } from "../../utils/logger";

const logger = createLogger("LocalProvider");

const COMMON_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby",
  "swift", "kotlin", "php", "sql", "nosql", "html", "css", "sass",
  "react", "angular", "vue", "svelte", "next.js", "nuxt",
  "node.js", "express", "fastapi", "django", "flask", "spring", "rails",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
  "ci/cd", "git", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
  "graphql", "rest", "grpc", "microservices", "serverless",
  "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
  "agile", "scrum", "jira", "figma", "tableau", "power bi",
  "project management", "leadership", "communication", "problem solving",
  "devops", "security", "oauth", "jwt", "react native", "flutter",
  "blockchain", "salesforce", "sap",
];

export class LocalProvider implements IAIProvider {
  readonly name = "local";
  readonly isAvailable = true;

  async analyzeResumeVsJD(resumeText: string, jdText: string): Promise<AIAnalysisResult> {
    logger.info("Running local semantic analysis");
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    const resumeSkills = COMMON_SKILLS.filter((s) => resumeLower.includes(s));
    const jdSkills = COMMON_SKILLS.filter((s) => jdLower.includes(s));
    const matched = jdSkills.filter((s) => resumeSkills.includes(s));
    const missing = jdSkills.filter((s) => !resumeSkills.includes(s));

    const semanticScore = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : 70;
    const insights: string[] = [];
    const rewriteSuggestions: string[] = [];

    if (matched.length > 0) insights.push(`Strong alignment in: ${matched.slice(0, 5).join(", ")}`);
    if (missing.length > 0) {
      insights.push(`Consider highlighting experience with: ${missing.slice(0, 3).join(", ")}`);
      rewriteSuggestions.push(`Add a "Technical Skills" section featuring: ${missing.slice(0, 5).join(", ")}`);
    }
    if (resumeText.match(/\d+%|\d+x|\$\d+/)) {
      insights.push("Good use of quantified achievements");
    } else {
      rewriteSuggestions.push("Quantify achievements: use percentages, dollar amounts, or multipliers");
    }

    const hasActionVerbs = /\b(built|designed|led|architected|optimized|shipped|launched|reduced|increased|managed)\b/i.test(resumeText);
    if (!hasActionVerbs) {
      rewriteSuggestions.push("Start bullet points with strong action verbs: Built, Designed, Led, Optimized, Shipped");
    }

    return {
      semanticScore,
      insights,
      rewriteSuggestions,
      missingContextualSkills: missing.slice(0, 5),
      strengthSummary: matched.length > 3 ? "Strong technical overlap with job requirements" : "Some relevant skills detected",
      gapSummary: missing.length > 3 ? "Several key skills from the JD are not explicitly mentioned" : "Minor gaps in skill coverage",
    };
  }

  async detectSubtleBias(resumeText: string): Promise<AIBiasAnalysis> {
    const indicators: string[] = [];
    const toneIssues: string[] = [];
    const recommendations: string[] = [];

    if (/\b(young|energetic|digital native|fresh)\b/i.test(resumeText)) {
      indicators.push("Age-suggestive language detected");
      recommendations.push("Replace age-suggestive terms with skill-based descriptions");
    }
    if (/\b(culture fit|cultural fit)\b/i.test(resumeText)) {
      indicators.push("'Culture fit' can mask unconscious bias");
      recommendations.push("Focus on 'culture add' - what new perspectives does the candidate bring?");
    }

    return { subtleBiasIndicators: indicators, toneIssues, recommendations };
  }

  async rewriteBulletPoints(bullets: string[], jdContext: string): Promise<string[]> {
    return bullets.map((bullet) => {
      let improved = bullet;
      if (!/^(Built|Designed|Led|Architected|Optimized|Shipped|Launched|Managed|Developed|Created|Implemented)/i.test(improved)) {
        improved = "Developed " + improved.charAt(0).toLowerCase() + improved.slice(1);
      }
      if (!/\d/.test(improved)) {
        improved += " resulting in measurable impact";
      }
      return improved;
    });
  }

  async chat(messages: ChatMessage[], resumeContext?: string, jdContext?: string): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const lowerMsg = lastMessage.toLowerCase();

    if (lowerMsg.includes("score") || lowerMsg.includes("improve")) {
      return "To improve your score, focus on three areas:\n\n1. **Skills Alignment** - Make sure every required skill from the job description appears explicitly in your resume.\n\n2. **Quantified Impact** - Replace vague descriptions with numbers. Instead of 'improved performance', write 'improved API response time by 40%'.\n\n3. **Keywords** - Mirror the exact language from the job posting. ATS systems match on specific terms.\n\nWould you like specific advice on any of these areas?";
    }
    if (lowerMsg.includes("experience") || lowerMsg.includes("bullet")) {
      return "For stronger experience bullets, use the **STAR method**:\n\n- **S**ituation: Brief context\n- **T**ask: What was your responsibility\n- **A**ction: What you specifically did (use strong verbs)\n- **R**esult: Quantified outcome\n\nExample: 'Led migration of monolithic app to microservices architecture (Action), reducing deployment time by 60% and improving system reliability to 99.9% uptime (Result).'\n\nWant me to help rewrite any of your bullets?";
    }
    if (lowerMsg.includes("skill") || lowerMsg.includes("missing")) {
      return "For missing skills:\n\n1. **If you have the skill** - Add it explicitly. Don't assume the reader will infer it.\n2. **If you're learning** - Include it with context: 'Currently building proficiency in Kubernetes through personal projects and certifications.'\n3. **If you don't have it** - Highlight transferable skills. 'Docker' experience transfers well to 'Kubernetes' discussions.\n\nWhich skills are you concerned about?";
    }

    return "I'm your AI resume coach! I can help with:\n\n- **Score improvement** - Ask 'How can I improve my score?'\n- **Experience writing** - Ask 'How should I write my bullet points?'\n- **Skills gaps** - Ask 'What about missing skills?'\n- **Resume formatting** - Ask about structure and layout\n\nWhat would you like to work on?";
  }

  async parseJobDescription(jdText: string) {
    const lower = jdText.toLowerCase();
    const allSkills = COMMON_SKILLS.filter((s) => lower.includes(s));
    const reqSection = jdText.match(/(?:required|must have|minimum|essential)[^]*?(?=preferred|nice to have|bonus|$)/i);
    const prefSection = jdText.match(/(?:preferred|nice to have|bonus|plus)[^]*$/i);

    const requiredSkills = reqSection ? COMMON_SKILLS.filter((s) => reqSection[0].toLowerCase().includes(s)) : allSkills.slice(0, Math.ceil(allSkills.length * 0.7));
    const preferredSkills = prefSection ? COMMON_SKILLS.filter((s) => prefSection[0].toLowerCase().includes(s)) : allSkills.slice(Math.ceil(allSkills.length * 0.7));

    const expMatch = jdText.match(/(\d+)\+?\s*years?/i);
    const titleMatch = jdText.match(/(?:^|\n)\s*(.+?(?:engineer|developer|manager|analyst|designer|architect|lead|director|scientist|specialist))/i);

    return {
      title: titleMatch?.[1]?.trim() || "Position",
      requiredSkills,
      preferredSkills,
      requiredExperience: expMatch ? parseInt(expMatch[1]) : 3,
      responsibilities: [],
      companyValues: [],
    };
  }
}
