import { motion } from "framer-motion";
import { Trophy, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { CandidateResult } from "../utils/types";
import ScoreGauge from "./ScoreGauge";

const tierStyles = {
  bronze: "tier-bronze",
  silver: "tier-silver",
  gold: "tier-gold",
  unicorn: "tier-unicorn",
};

const tierBg = {
  bronze: "bg-bronze/5 border-bronze/20",
  silver: "bg-silver/5 border-silver/20",
  gold: "bg-gold/5 border-gold/20",
  unicorn: "bg-unicorn/5 border-unicorn/20",
};

export default function LeaderBoard({ results }: { results: CandidateResult[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Trophy size={20} className="text-seeme-gold" />
        Candidate Leaderboard
      </h3>

      {results.map((candidate, rank) => (
        <motion.div
          key={candidate.id}
          className={`rounded-xl border overflow-hidden ${tierBg[candidate.tier]}`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: rank * 0.08 }}
        >
          <div
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={() => setExpanded(expanded === candidate.id ? null : candidate.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
              rank === 0 ? "bg-gold/20 text-gold" : rank === 1 ? "bg-silver/20 text-silver" : rank === 2 ? "bg-bronze/20 text-bronze" : "bg-seeme-card text-seeme-muted"
            }`}>
              {rank + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{candidate.fileName}</span>
                <span className={`text-xs font-bold uppercase ${tierStyles[candidate.tier]}`}>
                  {candidate.tier}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-2 bg-seeme-bg rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: `${candidate.score.overall}%` }}
                    transition={{ duration: 1, delay: rank * 0.08 + 0.2 }}
                  />
                </div>
                <span className="font-mono font-bold text-sm w-8 text-right">
                  {candidate.score.overall}
                </span>
              </div>
            </div>

            {candidate.biasFlags.length > 0 && (
              <div className="flex items-center gap-1" title="Bias audit flags">
                <Shield size={14} className="text-seeme-warn" />
                <span className="text-xs text-seeme-warn">{candidate.biasFlags.length}</span>
              </div>
            )}

            {expanded === candidate.id ? (
              <ChevronUp size={16} className="text-seeme-muted" />
            ) : (
              <ChevronDown size={16} className="text-seeme-muted" />
            )}
          </div>

          {expanded === candidate.id && (
            <motion.div
              className="px-4 pb-4 border-t border-seeme-border/30"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <ScorePill label="Skills" value={candidate.score.skillsMatch.score} />
                <ScorePill label="Experience" value={candidate.score.experienceMatch.score} />
                <ScorePill label="Education" value={candidate.score.educationMatch.score} />
                <ScorePill label="Keywords" value={candidate.score.keywordDensity.score} />
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-xs text-seeme-muted">Matched Skills: </span>
                  <span className="text-xs text-seeme-xp">
                    {candidate.score.skillsMatch.matched.join(", ") || "None detected"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-seeme-muted">Missing Skills: </span>
                  <span className="text-xs text-seeme-danger">
                    {candidate.score.skillsMatch.missing.join(", ") || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-seeme-muted">Experience: </span>
                  <span className="text-xs">{candidate.score.experienceMatch.details}</span>
                </div>
              </div>

              {candidate.biasFlags.length > 0 && (
                <div className="mt-3 p-3 bg-seeme-warn/5 rounded-lg border border-seeme-warn/20">
                  <span className="text-xs font-semibold text-seeme-warn uppercase">Bias Audit</span>
                  {candidate.biasFlags.map((flag, i) => (
                    <div key={i} className="text-xs mt-1 text-seeme-muted">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        flag.severity === "critical" ? "bg-red-500" : flag.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      {flag.description}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-seeme-xp" : value >= 60 ? "text-seeme-gold" : value >= 40 ? "text-seeme-warn" : "text-seeme-danger";
  return (
    <div className="bg-seeme-bg/50 rounded-lg p-2 text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[10px] text-seeme-muted uppercase">{label}</div>
    </div>
  );
}
