import { IScoreAnalyzer } from "../../interfaces/IScoringEngine";
import { ResumeData } from "../../utils/types";

export class EducationAnalyzer implements IScoreAnalyzer {
  readonly name = "education";
  readonly weight = 0.15;

  async analyze(resume: ResumeData) {
    if (resume.education.length === 0) {
      return { score: 50, details: { description: "No formal education detected (experience-based evaluation)" } };
    }
    const degreeScores = [
      { pattern: /ph\.?d|doctorate/i, score: 100 },
      { pattern: /master|m\.s\.|m\.a\.|mba|m\.eng/i, score: 90 },
      { pattern: /bachelor|b\.s\.|b\.a\.|b\.eng/i, score: 75 },
      { pattern: /associate|diploma/i, score: 60 },
    ];
    let maxScore = 50;
    let bestDegree = "unknown";
    for (const edu of resume.education) {
      for (const { pattern, score } of degreeScores) {
        if (pattern.test(edu.degree) && score > maxScore) { maxScore = score; bestDegree = edu.degree; }
      }
    }
    return {
      score: maxScore,
      details: {
        description: bestDegree !== "unknown"
          ? `Highest detected: ${bestDegree} in ${resume.education[0]?.field || "their field"}`
          : "Education level could not be determined",
      },
    };
  }
}
