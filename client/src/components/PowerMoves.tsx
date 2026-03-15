import { motion } from "framer-motion";
import { Zap, ArrowUp, Star, FileText } from "lucide-react";
import { PowerMove } from "../utils/types";

const categoryIcons = {
  skill: Zap,
  experience: ArrowUp,
  keyword: Star,
  format: FileText,
};

const impactColors = {
  high: "border-red-500/50 bg-red-500/5",
  medium: "border-yellow-500/50 bg-yellow-500/5",
  low: "border-green-500/50 bg-green-500/5",
};

const impactLabels = {
  high: { text: "HIGH IMPACT", color: "text-red-400" },
  medium: { text: "MED IMPACT", color: "text-yellow-400" },
  low: { text: "LOW IMPACT", color: "text-green-400" },
};

export default function PowerMoves({ moves }: { moves: PowerMove[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Zap size={20} className="text-seeme-gold" />
        5 Power Moves
      </h3>
      {moves.map((move, i) => {
        const Icon = categoryIcons[move.category];
        const impact = impactLabels[move.impact];
        return (
          <motion.div
            key={move.id}
            className={`p-4 rounded-lg border ${impactColors[move.impact]} backdrop-blur-sm`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-seeme-card flex items-center justify-center mt-0.5">
                <Icon size={16} className="text-seeme-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${impact.color}`}>
                    {impact.text}
                  </span>
                  <span className="text-[10px] text-seeme-xp font-mono">+{move.xpReward} XP</span>
                </div>
                <p className="text-sm text-seeme-text leading-relaxed">{move.action}</p>
              </div>
              <span className="text-xl font-black text-seeme-muted/30 font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
