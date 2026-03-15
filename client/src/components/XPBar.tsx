import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { Sparkles } from "lucide-react";

const tierThresholds = [
  { name: "Bronze", min: 0, max: 99, color: "#cd7f32" },
  { name: "Silver", min: 100, max: 299, color: "#c0c0c0" },
  { name: "Gold", min: 300, max: 599, color: "#ffd700" },
  { name: "Unicorn", min: 600, max: Infinity, color: "#e056fd" },
];

export default function XPBar({ xpGained }: { xpGained?: number }) {
  const { state } = useGame();
  const current = tierThresholds.find(
    (t) => state.totalXP >= t.min && state.totalXP <= t.max
  ) || tierThresholds[0];
  const next = tierThresholds[tierThresholds.indexOf(current) + 1];

  const progress = next
    ? ((state.totalXP - current.min) / (next.min - current.min)) * 100
    : 100;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: current.color }} />
          <span className="text-sm font-semibold">{current.name}</span>
          <span className="text-xs text-seeme-muted">Lv.{state.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{state.totalXP} XP</span>
          {next && (
            <span className="text-xs text-seeme-muted">/ {next.min} to {next.name}</span>
          )}
        </div>
      </div>

      <div className="relative h-3 bg-seeme-bg rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${current.color}, ${next?.color || current.color})` }}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 shimmer-bg rounded-full" />
      </div>

      {xpGained && xpGained > 0 && (
        <motion.div
          className="flex items-center justify-center mt-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-seeme-xp font-bold text-sm">+{xpGained} XP earned!</span>
        </motion.div>
      )}
    </div>
  );
}
