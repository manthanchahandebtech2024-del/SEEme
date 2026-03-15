import { ResumeData, ExperienceEntry, EducationEntry } from "../../utils/types";
import { v4 as uuidv4 } from "uuid";

const COMMON_SKILLS = [
  "javascript","typescript","python","java","c++","c#","go","rust","ruby","swift","kotlin","php","sql","nosql","html","css",
  "react","angular","vue","svelte","next.js","node.js","express","fastapi","django","flask","spring",
  "aws","azure","gcp","docker","kubernetes","terraform","jenkins","ci/cd","git",
  "mongodb","postgresql","mysql","redis","elasticsearch","graphql","rest","grpc","microservices","serverless",
  "machine learning","deep learning","nlp","tensorflow","pytorch","agile","scrum","jira",
  "figma","tableau","power bi","project management","leadership","communication","problem solving",
  "devops","security","oauth","jwt","react native","flutter","blockchain","salesforce","sap",
];

export function parseResumeText(text: string, fileName: string): ResumeData {
  const id = uuidv4();
  const lowerText = text.toLowerCase();
  const skills = COMMON_SKILLS.filter((s) => {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(lowerText);
  });

  let anonymized = text;
  anonymized = anonymized.replace(/^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gm, "[CANDIDATE]");
  anonymized = anonymized.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[EMAIL]");
  anonymized = anonymized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE]");

  return {
    id, rawText: text, anonymizedText: anonymized, skills,
    experience: extractExperience(text),
    education: extractEducation(text),
    yearsOfExperience: estimateYears(text),
    fileName,
  };
}

function extractExperience(text: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  const lines = text.split("\n");
  let inExp = false;
  for (const line of lines) {
    const t = line.trim();
    if (/(?:experience|work history|employment)/i.test(t)) { inExp = true; continue; }
    if (/(?:education|academic|qualification)/i.test(t) && inExp) break;
    if (inExp && t.length > 10) {
      const title = t.match(/^(.+?)(?:\s*[-|,]\s*|\s+at\s+)/i);
      const dur = t.match(/(\d{4}\s*[-–]\s*(?:\d{4}|present|current))/i);
      if (title || dur) entries.push({ title: title?.[1] || t.substring(0, 60), duration: dur?.[1] || "unknown", keywords: [] });
    }
  }
  return entries;
}

function extractEducation(text: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const patterns = [/\b(?:ph\.?d|doctorate)\b/i, /\b(?:master'?s?|m\.?s\.?|m\.?a\.?|mba)\b/i, /\b(?:bachelor'?s?|b\.?s\.?|b\.?a\.?|b\.?eng|b\.?tech)\b/i, /\b(?:associate'?s?|diploma)\b/i];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) {
      const ctx = text.substring(Math.max(0, text.indexOf(match[0]) - 50), Math.min(text.length, text.indexOf(match[0]) + 100));
      const field = ctx.match(/(?:in|of)\s+([\w\s]+?)(?:\s*[,.\n]|$)/i);
      entries.push({ degree: match[0], field: field?.[1]?.trim() || "General" });
    }
  }
  return entries;
}

function estimateYears(text: string): number {
  const ranges = text.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi);
  if (!ranges) {
    const m = text.match(/(\d+)\+?\s*years?\s*(?:of\s+)?experience/i);
    return m ? parseInt(m[1]) : 0;
  }
  const now = new Date().getFullYear();
  return ranges.reduce((total, range) => {
    const parts = range.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
    if (!parts) return total;
    const end = /present|current/i.test(parts[2]) ? now : parseInt(parts[2]);
    return total + Math.max(0, end - parseInt(parts[1]));
  }, 0);
}
