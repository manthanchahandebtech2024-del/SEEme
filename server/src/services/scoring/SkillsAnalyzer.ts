import { IScoreAnalyzer } from "../../interfaces/IScoringEngine";
import { ResumeData } from "../../utils/types";
import { AIAnalysisResult } from "../../interfaces/IAIProvider";

const JD_SKILLS = [
  "javascript","typescript","python","java","c++","c#","go","rust","ruby",
  "sql","nosql","react","angular","vue","next.js","node.js","express",
  "django","flask","spring","aws","azure","gcp","docker","kubernetes",
  "terraform","ci/cd","git","mongodb","postgresql","mysql","redis",
  "graphql","rest","microservices","machine learning","deep learning",
  "agile","scrum","communication","problem solving","leadership",
  "devops","security","react native","flutter",
];

export class SkillsAnalyzer implements IScoreAnalyzer {
  readonly name = "skills";
  readonly weight = 0.35;

  async analyze(resume: ResumeData, jdText: string, aiResult?: AIAnalysisResult) {
    const jdLower = jdText.toLowerCase();
    const jdSkills = JD_SKILLS.filter((s) => jdLower.includes(s));
    const matched = jdSkills.filter((s) => resume.skills.some((rs) => rs.toLowerCase().includes(s)));
    const missing = jdSkills.filter((s) => !matched.includes(s));

    if (aiResult?.missingContextualSkills) {
      for (const skill of aiResult.missingContextualSkills) {
        if (!missing.includes(skill) && !matched.includes(skill)) missing.push(skill);
      }
    }

    const score = jdSkills.length > 0 ? Math.min(100, Math.round((matched.length / jdSkills.length) * 100)) : 70;
    return { score, details: { matched, missing } };
  }
}
