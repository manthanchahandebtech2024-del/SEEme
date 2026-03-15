import { DiffChange } from "../utils/types";

export interface IDiffEngine {
  generateDiff(
    originalText: string,
    improvedSuggestions: string[],
    missingSkills: string[],
    aiRewriteSuggestions?: string[]
  ): { original: string; improved: string; changes: DiffChange[] };
}
