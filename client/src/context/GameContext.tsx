import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GameState, Badge, Tier } from "../utils/types";

const BADGES: Badge[] = [
  { id: "first_scan", name: "First Scan", icon: "Scan", description: "Analyze your first resume", earned: false },
  { id: "triple_threat", name: "Triple Threat", icon: "Zap", description: "Analyze 3 resumes", earned: false },
  { id: "power_user", name: "Power User", icon: "Flame", description: "Analyze 10 resumes", earned: false },
  { id: "silver_tier", name: "Silver Achiever", icon: "Award", description: "Reach Silver tier", earned: false },
  { id: "gold_tier", name: "Gold Standard", icon: "Trophy", description: "Reach Gold tier", earned: false },
  { id: "unicorn", name: "Unicorn Status", icon: "Star", description: "Reach Unicorn tier", earned: false },
  { id: "streak_3", name: "On Fire", icon: "Flame", description: "3-day streak", earned: false },
  { id: "streak_7", name: "Unstoppable", icon: "Target", description: "7-day streak", earned: false },
];

const DEFAULT_STATE: GameState = {
  totalXP: 0,
  level: 1,
  tier: "bronze",
  streak: 0,
  lastActivity: "",
  analysisCount: 0,
  badges: BADGES,
};

function getTier(xp: number): Tier {
  if (xp >= 600) return "unicorn";
  if (xp >= 300) return "gold";
  if (xp >= 100) return "silver";
  return "bronze";
}

function getLevel(xp: number): number {
  return Math.floor(xp / 50) + 1;
}

interface GameContextValue {
  state: GameState;
  addXP: (amount: number) => void;
  recordAnalysis: () => void;
  newBadges: Badge[];
  clearNewBadges: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem("seeme_game");
      return saved ? JSON.parse(saved) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    localStorage.setItem("seeme_game", JSON.stringify(state));
  }, [state]);

  const addXP = (amount: number) => {
    setState((prev) => {
      const totalXP = prev.totalXP + amount;
      const tier = getTier(totalXP);
      const level = getLevel(totalXP);
      const badges = [...prev.badges];
      const justEarned: Badge[] = [];

      if (tier === "silver" && !badges.find((b) => b.id === "silver_tier")?.earned) {
        const idx = badges.findIndex((b) => b.id === "silver_tier");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }
      if (tier === "gold" && !badges.find((b) => b.id === "gold_tier")?.earned) {
        const idx = badges.findIndex((b) => b.id === "gold_tier");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }
      if (tier === "unicorn" && !badges.find((b) => b.id === "unicorn")?.earned) {
        const idx = badges.findIndex((b) => b.id === "unicorn");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }

      if (justEarned.length > 0) setNewBadges((p) => [...p, ...justEarned]);
      return { ...prev, totalXP, tier, level, badges };
    });
  };

  const recordAnalysis = () => {
    setState((prev) => {
      const today = new Date().toDateString();
      const lastDay = prev.lastActivity ? new Date(prev.lastActivity).toDateString() : "";
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let streak = prev.streak;
      if (lastDay === yesterday) streak += 1;
      else if (lastDay !== today) streak = 1;

      const analysisCount = prev.analysisCount + 1;
      const badges = [...prev.badges];
      const justEarned: Badge[] = [];

      if (analysisCount === 1 && !badges.find((b) => b.id === "first_scan")?.earned) {
        const idx = badges.findIndex((b) => b.id === "first_scan");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }
      if (analysisCount >= 3 && !badges.find((b) => b.id === "triple_threat")?.earned) {
        const idx = badges.findIndex((b) => b.id === "triple_threat");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }
      if (analysisCount >= 10 && !badges.find((b) => b.id === "power_user")?.earned) {
        const idx = badges.findIndex((b) => b.id === "power_user");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }
      if (streak >= 3 && !badges.find((b) => b.id === "streak_3")?.earned) {
        const idx = badges.findIndex((b) => b.id === "streak_3");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }
      if (streak >= 7 && !badges.find((b) => b.id === "streak_7")?.earned) {
        const idx = badges.findIndex((b) => b.id === "streak_7");
        badges[idx] = { ...badges[idx], earned: true, earnedAt: new Date().toISOString() };
        justEarned.push(badges[idx]);
      }

      if (justEarned.length > 0) setNewBadges((p) => [...p, ...justEarned]);
      return { ...prev, streak, lastActivity: today, analysisCount, badges };
    });
  };

  const clearNewBadges = () => setNewBadges([]);

  return (
    <GameContext.Provider value={{ state, addXP, recordAnalysis, newBadges, clearNewBadges }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
