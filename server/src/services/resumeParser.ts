import { ResumeData, ExperienceEntry, EducationEntry } from "../utils/types";
import { stripBias } from "./biasStrip";
import { v4 as uuidv4 } from "uuid";

const COMMON_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby",
  "swift", "kotlin", "php", "sql", "nosql", "html", "css", "sass", "less",
  "react", "angular", "vue", "svelte", "next.js", "nuxt", "gatsby",
  "node.js", "express", "fastapi", "django", "flask", "spring", "rails",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
  "ci/cd", "git", "github", "gitlab", "bitbucket",
  "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "dynamodb",
  "graphql", "rest", "grpc", "websocket", "microservices", "serverless",
  "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
  "pytorch", "scikit-learn", "pandas", "numpy",
  "agile", "scrum", "kanban", "jira", "confluence",
  "figma", "sketch", "adobe xd", "photoshop", "illustrator",
  "tableau", "power bi", "excel", "data analysis", "data science",
  "project management", "leadership", "communication", "problem solving",
  "devops", "sre", "monitoring", "logging", "observability",
  "security", "oauth", "jwt", "encryption", "penetration testing",
  "react native", "flutter", "ios", "android", "mobile development",
  "blockchain", "solidity", "web3", "smart contracts",
  "salesforce", "hubspot", "sap", "erp", "crm",
];

const DEGREE_PATTERNS = [
  { pattern: /\b(?:ph\.?d|doctorate|doctoral)\b/i, level: 4 },
  { pattern: /\b(?:master'?s?|m\.?s\.?|m\.?a\.?|mba|m\.?eng|m\.?tech)\b/i, level: 3 },
  { pattern: /\b(?:bachelor'?s?|b\.?s\.?|b\.?a\.?|b\.?eng|b\.?tech|undergraduate)\b/i, level: 2 },
  { pattern: /\b(?:associate'?s?|a\.?s\.?|a\.?a\.?|diploma)\b/i, level: 1 },
];

const EXPERIENCE_SECTION = /(?:experience|work history|employment|professional background)/i;
const EDUCATION_SECTION = /(?:education|academic|qualification|degree)/i;

export function parseResume(text: string, fileName: string): ResumeData {
  const id = uuidv4();
  const { anonymized } = stripBias(text);
  const lowerText = text.toLowerCase();

  const skills = extractSkills(lowerText);
  const experience = extractExperience(text);
  const education = extractEducation(text);
  const yearsOfExperience = estimateYears(text);

  return {
    id,
    rawText: text,
    anonymizedText: anonymized,
    skills,
    experience,
    education,
    yearsOfExperience,
    fileName,
  };
}

function extractSkills(lowerText: string): string[] {
  return COMMON_SKILLS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(lowerText);
  });
}

function extractExperience(text: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  const lines = text.split("\n");
  let inExperience = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (EXPERIENCE_SECTION.test(line)) {
      inExperience = true;
      continue;
    }
    if (EDUCATION_SECTION.test(line) && inExperience) break;

    if (inExperience && line.length > 10) {
      const titleMatch = line.match(/^(.+?)(?:\s*[-|,]\s*|\s+at\s+)/i);
      const durationMatch = line.match(
        /(\d{4}\s*[-–]\s*(?:\d{4}|present|current)|\d+\s*(?:year|yr|month|mo)s?)/i
      );
      if (titleMatch || durationMatch) {
        entries.push({
          title: titleMatch?.[1] || line.substring(0, 60),
          duration: durationMatch?.[1] || "unknown",
          keywords: extractSkills(line.toLowerCase()),
        });
      }
    }
  }

  if (entries.length === 0) {
    const jobTitles = text.match(
      /\b(?:engineer|developer|manager|analyst|designer|architect|lead|director|specialist|consultant|coordinator|intern)\b/gi
    );
    if (jobTitles) {
      entries.push({
        title: jobTitles[0],
        duration: "detected",
        keywords: extractSkills(text.toLowerCase()),
      });
    }
  }

  return entries;
}

function extractEducation(text: string): EducationEntry[] {
  const entries: EducationEntry[] = [];

  for (const { pattern } of DEGREE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const context = text.substring(
        Math.max(0, text.indexOf(match[0]) - 50),
        Math.min(text.length, text.indexOf(match[0]) + 100)
      );
      const fieldMatch = context.match(
        /(?:in|of)\s+([\w\s]+?)(?:\s*[,.\n]|$)/i
      );
      entries.push({
        degree: match[0],
        field: fieldMatch?.[1]?.trim() || "General",
      });
    }
  }

  return entries;
}

function estimateYears(text: string): number {
  const yearRanges = text.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi);
  if (!yearRanges) {
    const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s+)?experience/i);
    return yearsMatch ? parseInt(yearsMatch[1]) : 0;
  }

  let totalYears = 0;
  const currentYear = new Date().getFullYear();
  for (const range of yearRanges) {
    const parts = range.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
    if (parts) {
      const start = parseInt(parts[1]);
      const end = /present|current/i.test(parts[2])
        ? currentYear
        : parseInt(parts[2]);
      totalYears += Math.max(0, end - start);
    }
  }

  return totalYears;
}

export function parseJobDescription(text: string): {
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: number;
  keywords: string[];
  title: string;
} {
  const lowerText = text.toLowerCase();
  const allSkills = extractSkills(lowerText);

  const requiredSection = text.match(
    /(?:required|must have|minimum|essential)[^]*?(?=preferred|nice to have|bonus|$)/i
  );
  const preferredSection = text.match(
    /(?:preferred|nice to have|bonus|plus)[^]*$/i
  );

  const requiredSkills = requiredSection
    ? extractSkills(requiredSection[0].toLowerCase())
    : allSkills.slice(0, Math.ceil(allSkills.length * 0.7));

  const preferredSkills = preferredSection
    ? extractSkills(preferredSection[0].toLowerCase())
    : allSkills.slice(Math.ceil(allSkills.length * 0.7));

  const expMatch = text.match(/(\d+)\+?\s*years?/i);
  const requiredExperience = expMatch ? parseInt(expMatch[1]) : 3;

  const titleMatch = text.match(
    /(?:^|\n)\s*(.+?(?:engineer|developer|manager|analyst|designer|architect|lead|director|scientist|specialist))/i
  );

  const keywords = [
    ...new Set(
      lowerText
        .match(
          /\b[a-z]{3,}(?:\s+[a-z]+)?\b/g
        )
        ?.filter(
          (w) =>
            !["the", "and", "for", "are", "with", "you", "will", "our", "this", "that", "from", "have", "has", "been", "were", "being", "their", "them", "they", "what", "when", "where", "which", "who", "about", "into", "your", "can", "all", "would", "there", "but", "not", "also", "more", "other", "than", "then", "these", "some", "could", "each", "make", "like"].includes(w) &&
            w.length > 3
        ) || []
    ),
  ].slice(0, 50);

  return {
    requiredSkills,
    preferredSkills,
    requiredExperience,
    keywords,
    title: titleMatch?.[1]?.trim() || "Position",
  };
}
