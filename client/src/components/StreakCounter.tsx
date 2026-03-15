import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useGame } from "../context/GameContext";

export default function StreakCounter() {
  const { state } = useGame();

  return (
    <motion.div
      className={`glass-card p-4 flex items-center gap-4 ${
        state.streak >= 3 ? "animate-streak-glow" : ""
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative">
        <Flame
          size={32}
          className={state.streak > 0 ? "text-orange-400" : "text-seeme-muted"}
        />
        {state.streak >= 7 && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </div>
      <div>
        <div className="text-2xl font-black font-mono">
          {state.streak}
          <span className="text-sm font-normal text-seeme-muted ml-1">day streak</span>
        </div>
        <div className="text-xs text-seeme-muted">
          {state.streak === 0
            ? "Start analyzing to build your streak!"
            : state.streak >= 7
              ? "You're on fire! Unstoppable!"
              : state.streak >= 3
                ? "Keep the momentum going!"
                : "Come back tomorrow to keep it alive!"}
        </div>
      </div>
    </motion.div>
  );
}
