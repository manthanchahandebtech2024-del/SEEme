import { DiffChange } from "../utils/types";

export function generateResumeDiff(
  originalText: string,
  improvedSuggestions: string[],
  missingSkills: string[]
): { original: string; improved: string; changes: DiffChange[] } {
  let improved = originalText;
  const changes: DiffChange[] = [];

  for (const skill of missingSkills.slice(0, 5)) {
    const skillsHeaderMatch = improved.match(
      /(?:skills|technical skills|technologies)[:\s]*\n/i
    );
    if (skillsHeaderMatch) {
      const insertPoint =
        improved.indexOf(skillsHeaderMatch[0]) + skillsHeaderMatch[0].length;
      const nextLine = improved.indexOf("\n", insertPoint);
      const currentLine = improved.substring(insertPoint, nextLine);
      const newLine = currentLine.trimEnd() + `, ${skill}`;
      improved =
        improved.substring(0, insertPoint) +
        newLine +
        improved.substring(nextLine);
      changes.push({
        type: "added",
        value: skill,
        reason: `Added missing skill "${skill}" that appears in the job description`,
      });
    }
  }

  for (const suggestion of improvedSuggestions) {
    changes.push({
      type: "added",
      value: suggestion,
      reason: "AI-suggested improvement to better match job requirements",
    });
  }

  const lines = originalText.split("\n");
  const improvedLines = improved.split("\n");
  const lineChanges: DiffChange[] = [];

  const maxLen = Math.max(lines.length, improvedLines.length);
  for (let i = 0; i < maxLen; i++) {
    const origLine = lines[i] || "";
    const impLine = improvedLines[i] || "";

    if (origLine === impLine) {
      lineChanges.push({ type: "unchanged", value: origLine });
    } else if (!origLine && impLine) {
      lineChanges.push({
        type: "added",
        value: impLine,
        reason: "New content added",
      });
    } else if (origLine && !impLine) {
      lineChanges.push({
        type: "removed",
        value: origLine,
        reason: "Content removed or replaced",
      });
    } else {
      lineChanges.push({
        type: "removed",
        value: origLine,
        reason: "Original content",
      });
      lineChanges.push({
        type: "added",
        value: impLine,
        reason: "Improved content",
      });
    }
  }

  return { original: originalText, improved, changes: lineChanges };
}
