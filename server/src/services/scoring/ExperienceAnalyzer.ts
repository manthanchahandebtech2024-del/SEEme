import { IScoreAnalyzer } from "../../interfaces/IScoringEngine";
import { ResumeData } from "../../utils/types";

export class ExperienceAnalyzer implements IScoreAnalyzer {
  readonly name = "experience";
  readonly weight = 0.25;

  async analyze(resume: ResumeData, jdText: string) {
    const expMatch = jdText.match(/(\d+)\+?\s*years?/i);
    const required = expMatch ? parseInt(expMatch[1]) : 3;
    const actual = resume.yearsOfExperience;

    if (required === 0) return { score: 80, details: { description: "No specific experience requirement" } };

    const ratio = actual / required;
    let score: number;
    let description: string;

    if (ratio >= 1.5) { score = 100; description = `${actual} years exceeds the ${required}-year requirement significantly`; }
    else if (ratio >= 1) { score = 85 + Math.round((ratio - 1) * 30); description = `${actual} years meets the ${required}-year requirement`; }
    else if (ratio >= 0.7) { score = 60 + Math.round(ratio * 25); description = `${actual} years is close to the ${required}-year requirement`; }
    else { score = Math.max(10, Math.round(ratio * 60)); description = `${actual} years falls short of ${required}-year requirement`; }

    return { score: Math.min(100, score), details: { description } };
  }
}
