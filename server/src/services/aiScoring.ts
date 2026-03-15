import {
  ResumeData,
  ScoreBreakdown,
  PowerMove,
  CandidateResult,
  Tier,
} from "../utils/types";
import { parseJobDescription } from "./resumeParser";
import { stripBias } from "./biasStrip";

const WEIGHTS = {
  skills: 0.4,
  experience: 0.25,
  education: 0.15,
  keywords: 0.2,
};

export function scoreResume(
  resume: ResumeData,
  jdText: string
): CandidateResult {
  const jd = parseJobDescription(jdText);
  const { flags: biasFlags } = stripBias(resume.rawText);

  const skillsScore = calculateSkillsScore(resume.skills, jd.requiredSkills, jd.preferredSkills);
  const expScore = calculateExperienceScore(resume.yearsOfExperience, jd.requiredExperience);
  const eduScore = calculateEducationScore(resume.education);
  const kwScore = calculateKeywordScore(resume.anonymizedText, jd.keywords);

  const overall = Math.round(
    skillsScore.score * WEIGHTS.skills +
    expScore.score * WEIGHTS.experience +
    eduScore.score * WEIGHTS.education +
    kwScore.score * WEIGHTS.keywords
  );

  const scoreBreakdown: ScoreBreakdown = {
    overall,
    skillsMatch: {
      score: skillsScore.score,
      matched: skillsScore.matched,
      missing: skillsScore.missing,
      weight: WEIGHTS.skills,
    },
    experienceMatch: {
      score: expScore.score,
      details: expScore.details,
      weight: WEIGHTS.experience,
    },
    educationMatch: {
      score: eduScore.score,
      details: eduScore.details,
      weight: WEIGHTS.education,
    },
    keywordDensity: {
      score: kwScore.score,
      found: kwScore.found,
      total: jd.keywords.length,
      weight: WEIGHTS.keywords,
    },
  };

  const powerMoves = generatePowerMoves(scoreBreakdown, jd.requiredSkills);
  const tier = calculateTier(overall);

  return {
    id: resume.id,
    fileName: resume.fileName,
    score: scoreBreakdown,
    powerMoves,
    biasFlags,
    tier,
  };
}

function calculateSkillsScore(
  resumeSkills: string[],
  required: string[],
  preferred: string[]
): { score: number; matched: string[]; missing: string[] } {
  const allJdSkills = [...new Set([...required, ...preferred])];
  if (allJdSkills.length === 0) return { score: 70, matched: resumeSkills, missing: [] };

  const matched = allJdSkills.filter((s) =>
    resumeSkills.some(
      (rs) => rs.toLowerCase() === s.toLowerCase() || rs.toLowerCase().includes(s.toLowerCase())
    )
  );
  const missing = allJdSkills.filter((s) => !matched.includes(s));

  const requiredMatched = required.filter((s) => matched.includes(s));
  const preferredMatched = preferred.filter((s) => matched.includes(s));

  const requiredRatio = required.length > 0 ? requiredMatched.length / required.length : 1;
  const preferredRatio = preferred.length > 0 ? preferredMatched.length / preferred.length : 0;

  const score = Math.round(requiredRatio * 80 + preferredRatio * 20);
  return { score: Math.min(100, score), matched, missing };
}

function calculateExperienceScore(
  resumeYears: number,
  requiredYears: number
): { score: number; details: string } {
  if (requiredYears === 0) return { score: 80, details: "No specific experience requirement" };
  
  const ratio = resumeYears / requiredYears;
  let score: number;
  let details: string;

  if (ratio >= 1.5) {
    score = 100;
    details = `${resumeYears} years exceeds the ${requiredYears}-year requirement significantly`;
  } else if (ratio >= 1) {
    score = 85 + Math.round((ratio - 1) * 30);
    details = `${resumeYears} years meets the ${requiredYears}-year requirement`;
  } else if (ratio >= 0.7) {
    score = 60 + Math.round(ratio * 25);
    details = `${resumeYears} years is close to the ${requiredYears}-year requirement`;
  } else if (ratio >= 0.3) {
    score = 30 + Math.round(ratio * 40);
    details = `${resumeYears} years is below the ${requiredYears}-year requirement`;
  } else {
    score = Math.round(ratio * 50);
    details = `${resumeYears} years falls short of ${requiredYears}-year requirement`;
  }

  return { score: Math.min(100, score), details };
}

function calculateEducationScore(
  education: { degree: string; field: string }[]
): { score: number; details: string } {
  if (education.length === 0) {
    return { score: 50, details: "No formal education detected (experience-based evaluation)" };
  }

  const degreeRegex = [
    { pattern: /ph\.?d|doctorate/i, score: 100 },
    { pattern: /master|m\.s\.|m\.a\.|mba|m\.eng/i, score: 90 },
    { pattern: /bachelor|b\.s\.|b\.a\.|b\.eng/i, score: 75 },
    { pattern: /associate|diploma/i, score: 60 },
  ];

  let maxScore = 50;
  let bestDegree = "unknown";

  for (const edu of education) {
    for (const { pattern, score } of degreeRegex) {
      if (pattern.test(edu.degree) && score > maxScore) {
        maxScore = score;
        bestDegree = edu.degree;
      }
    }
  }

  return {
    score: maxScore,
    details: bestDegree !== "unknown"
      ? `Highest detected: ${bestDegree} in ${education[0]?.field || "their field"}`
      : "Education level could not be determined",
  };
}

function calculateKeywordScore(
  anonymizedText: string,
  jdKeywords: string[]
): { score: number; found: string[] } {
  if (jdKeywords.length === 0) return { score: 70, found: [] };

  const lowerText = anonymizedText.toLowerCase();
  const found = jdKeywords.filter((kw) => lowerText.includes(kw.toLowerCase()));
  const ratio = found.length / jdKeywords.length;
  const score = Math.round(ratio * 100);

  return { score: Math.min(100, score), found };
}

function generatePowerMoves(
  score: ScoreBreakdown,
  requiredSkills: string[]
): PowerMove[] {
  const moves: PowerMove[] = [];
  let id = 1;

  if (score.skillsMatch.missing.length > 0) {
    const topMissing = score.skillsMatch.missing.slice(0, 3);
    moves.push({
      id: id++,
      category: "skill",
      action: `Add these missing skills to your resume: ${topMissing.join(", ")}. If you have experience with them, make it explicit.`,
      impact: "high",
      xpReward: 50,
    });
  }

  if (score.experienceMatch.score < 70) {
    moves.push({
      id: id++,
      category: "experience",
      action: "Quantify your achievements with metrics (e.g., 'Increased performance by 40%' instead of 'Improved performance').",
      impact: "high",
      xpReward: 40,
    });
  }

  if (score.keywordDensity.score < 60) {
    moves.push({
      id: id++,
      category: "keyword",
      action: "Mirror the job description's language. Use the exact phrases from the posting in your experience bullets.",
      impact: "medium",
      xpReward: 30,
    });
  }

  if (score.skillsMatch.score < 80) {
    moves.push({
      id: id++,
      category: "skill",
      action: "Create a dedicated 'Technical Skills' section organized by category (Languages, Frameworks, Tools, Cloud).",
      impact: "medium",
      xpReward: 25,
    });
  }

  moves.push({
    id: id++,
    category: "format",
    action: "Start each bullet with a strong action verb (Built, Designed, Led, Optimized, Shipped) followed by measurable impact.",
    impact: score.overall < 60 ? "high" : "low",
    xpReward: 20,
  });

  if (score.overall < 50) {
    moves.push({
      id: id++,
      category: "experience",
      action: "Add a 'Projects' section showcasing relevant side projects, open source contributions, or certifications.",
      impact: "high",
      xpReward: 35,
    });
  }

  return moves.slice(0, 5);
}

function calculateTier(score: number): Tier {
  if (score >= 90) return "unicorn";
  if (score >= 75) return "gold";
  if (score >= 55) return "silver";
  return "bronze";
}

export function rankCandidates(
  resumes: ResumeData[],
  jdText: string
): CandidateResult[] {
  return resumes
    .map((resume) => scoreResume(resume, jdText))
    .sort((a, b) => b.score.overall - a.score.overall);
}
