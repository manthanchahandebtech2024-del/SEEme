import { motion, AnimatePresence } from "framer-motion";
import { Award, Zap, Flame, Trophy, Star, Target, Scan } from "lucide-react";
import { Badge } from "../utils/types";
import { useGame } from "../context/GameContext";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Award, Zap, Flame, Trophy, Star, Target, Scan,
};

export default function BadgeDisplay() {
  const { state, newBadges, clearNewBadges } = useGame();

  return (
    <>
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-seeme-muted mb-3 uppercase tracking-wider">Badges</h3>
        <div className="grid grid-cols-4 gap-2">
          {state.badges.map((badge) => {
            const Icon = iconMap[badge.icon] || Award;
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  badge.earned
                    ? "bg-seeme-accent/10 border border-seeme-accent/30"
                    : "bg-seeme-bg/50 border border-seeme-border/30 opacity-40"
                }`}
                title={badge.description}
              >
                <Icon size={20} className={badge.earned ? "text-seeme-accent" : "text-seeme-muted"} />
                <span className="text-[10px] mt-1 text-center leading-tight">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {newBadges.length > 0 && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={clearNewBadges}
          >
            <motion.div
              className="glass-card neon-border p-8 text-center max-w-sm"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 2, duration: 0.3 }}
              >
                <Award size={48} className="text-seeme-gold mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-black mt-4 gradient-text">Badge Unlocked!</h2>
              {newBadges.map((b) => (
                <div key={b.id} className="mt-3">
                  <p className="text-lg font-bold">{b.name}</p>
                  <p className="text-sm text-seeme-muted">{b.description}</p>
                </div>
              ))}
              <button
                onClick={clearNewBadges}
                className="btn-primary mt-6 text-sm"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
