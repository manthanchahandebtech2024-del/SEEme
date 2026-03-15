import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Tier } from "../utils/types";

const tierConfig = {
  bronze: { color: "#cd7f32", glow: "rgba(205,127,50,0.4)" },
  silver: { color: "#c0c0c0", glow: "rgba(192,192,192,0.4)" },
  gold: { color: "#ffd700", glow: "rgba(255,215,0,0.4)" },
  unicorn: { color: "#e056fd", glow: "rgba(224,86,253,0.5)" },
};

interface Props {
  score: number;
  tier: Tier;
  label?: string;
}

export default function ScoreGauge({ score, tier, label = "ATS Battle Score" }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const motionScore = useMotionValue(0);
  const config = tierConfig[tier];

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return controls.stop;
  }, [score]);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
    >
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90 score-ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#1a1a2e" strokeWidth="8" />
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 10px ${config.glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-black font-mono"
            style={{ color: config.color }}
            animate={displayScore === score ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {displayScore}
          </motion.span>
          <span className="text-seeme-muted text-xs mt-1">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-seeme-muted mt-3">{label}</span>
    </motion.div>
  );
}
