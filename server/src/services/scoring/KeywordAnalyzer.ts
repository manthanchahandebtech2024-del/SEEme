import { IScoreAnalyzer } from "../../interfaces/IScoringEngine";
import { ResumeData } from "../../utils/types";

const STOP_WORDS = new Set(["the","and","for","are","with","you","will","our","this","that","from","have","has","been","were","being","their","them","they","what","when","where","which","who","about","into","your","can","all","would","there","but","not","also","more","other","than","then","these","some","could","each","make","like"]);

export class KeywordAnalyzer implements IScoreAnalyzer {
  readonly name = "keywords";
  readonly weight = 0.15;

  async analyze(resume: ResumeData, jdText: string) {
    const keywords = this.extractKeywords(jdText);
    if (keywords.length === 0) return { score: 70, details: { found: [], total: 0 } };
    const lowerText = resume.anonymizedText.toLowerCase();
    const found = keywords.filter((kw) => lowerText.includes(kw));
    const score = Math.min(100, Math.round((found.length / keywords.length) * 100));
    return { score, details: { found, total: keywords.length } };
  }

  private extractKeywords(jdText: string): string[] {
    const words = jdText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    return [...new Set(words.filter((w) => !STOP_WORDS.has(w)))].slice(0, 50);
  }
}
