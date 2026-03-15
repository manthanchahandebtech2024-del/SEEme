import { motion } from "framer-motion";
import { BarChart3, CheckCircle, XCircle, BookOpen, Search } from "lucide-react";
import { ScoreBreakdown } from "../utils/types";

interface Props {
  score: ScoreBreakdown;
}

const sections = [
  { key: "skillsMatch" as const, label: "Skills Match", icon: CheckCircle, weight: "40%" },
  { key: "experienceMatch" as const, label: "Experience", icon: BookOpen, weight: "25%" },
  { key: "educationMatch" as const, label: "Education", icon: BookOpen, weight: "15%" },
  { key: "keywordDensity" as const, label: "Keyword Density", icon: Search, weight: "20%" },
];

export default function ScoreExplainer({ score }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-seeme-accent2" />
        Score Breakdown
        <span className="text-xs text-seeme-muted font-normal ml-1">Why this score?</span>
      </h3>

      <div className="space-y-4">
        {sections.map(({ key, label, icon: Icon, weight }, i) => {
          const sectionScore = key === "skillsMatch"
            ? score.skillsMatch.score
            : key === "experienceMatch"
              ? score.experienceMatch.score
              : key === "educationMatch"
                ? score.educationMatch.score
                : score.keywordDensity.score;

          const barColor =
            sectionScore >= 80 ? "bg-seeme-xp" :
            sectionScore >= 60 ? "bg-seeme-gold" :
            sectionScore >= 40 ? "bg-seeme-warn" :
            "bg-seeme-danger";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-seeme-muted" />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-[10px] text-seeme-muted">({weight})</span>
                </div>
                <span className="font-mono font-bold text-sm">{sectionScore}</span>
              </div>
              <div className="h-2 bg-seeme-bg rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${sectionScore}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                />
              </div>

              {key === "skillsMatch" && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {score.skillsMatch.matched.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-seeme-xp/10 text-seeme-xp border border-seeme-xp/20">
                      <CheckCircle size={8} /> {s}
                    </span>
                  ))}
                  {score.skillsMatch.missing.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-seeme-danger/10 text-seeme-danger border border-seeme-danger/20">
                      <XCircle size={8} /> {s}
                    </span>
                  ))}
                </div>
              )}

              {key === "experienceMatch" && (
                <p className="text-xs text-seeme-muted mt-1">{score.experienceMatch.details}</p>
              )}

              {key === "educationMatch" && (
                <p className="text-xs text-seeme-muted mt-1">{score.educationMatch.details}</p>
              )}

              {key === "keywordDensity" && (
                <p className="text-xs text-seeme-muted mt-1">
                  {score.keywordDensity.found.length} of {score.keywordDensity.total} JD keywords found
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
