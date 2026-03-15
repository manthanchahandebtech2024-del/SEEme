import { IDiffEngine } from "../interfaces/IDiffEngine";
import { DiffChange } from "../utils/types";

export class DiffEngineService implements IDiffEngine {
  generateDiff(originalText: string, improvedSuggestions: string[], missingSkills: string[], aiRewriteSuggestions?: string[]) {
    let improved = originalText;

    for (const skill of missingSkills.slice(0, 5)) {
      const match = improved.match(/(?:skills|technical skills|technologies)[:\s]*\n/i);
      if (match) {
        const pos = improved.indexOf(match[0]) + match[0].length;
        const nl = improved.indexOf("\n", pos);
        const line = improved.substring(pos, nl);
        improved = improved.substring(0, pos) + line.trimEnd() + `, ${skill}` + improved.substring(nl);
      }
    }

    const lines = originalText.split("\n");
    const improvedLines = improved.split("\n");
    const changes: DiffChange[] = [];
    const maxLen = Math.max(lines.length, improvedLines.length);

    for (let i = 0; i < maxLen; i++) {
      const orig = lines[i] || "";
      const imp = improvedLines[i] || "";
      if (orig === imp) {
        changes.push({ type: "unchanged", value: orig });
      } else if (!orig) {
        changes.push({ type: "added", value: imp, reason: "New content" });
      } else if (!imp) {
        changes.push({ type: "removed", value: orig, reason: "Replaced" });
      } else {
        changes.push({ type: "removed", value: orig, reason: "Original" });
        changes.push({ type: "added", value: imp, reason: "Improved" });
      }
    }

    if (aiRewriteSuggestions) {
      for (const suggestion of aiRewriteSuggestions) {
        changes.push({ type: "added", value: suggestion, reason: "AI-powered improvement" });
      }
    }

    return { original: originalText, improved, changes };
  }
}
