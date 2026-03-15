import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, User, Users, Flame, Star, LogIn, LogOut } from "lucide-react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const tierColors = {
  bronze: "text-bronze",
  silver: "text-silver",
  gold: "text-gold",
  unicorn: "text-unicorn",
};

export default function Navbar() {
  const location = useLocation();
  const { state } = useGame();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: Eye },
    { to: "/seeker", label: "Job Seeker", icon: User },
    { to: "/recruiter", label: "Recruiter", icon: Users },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-seeme-bg/80 backdrop-blur-xl border-b border-seeme-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Eye size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              SEE<span className="gradient-text">me</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} className="relative px-4 py-2 rounded-lg transition-colors">
                  <span className={`flex items-center gap-2 text-sm font-medium ${active ? "text-white" : "text-seeme-muted hover:text-seeme-text"}`}>
                    <Icon size={16} />
                    {label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-seeme-accent/10 border border-seeme-accent/30 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Flame size={14} className="text-orange-400" />
              <span className="font-mono">{state.streak}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star size={14} className={tierColors[state.tier]} />
              <span className="font-mono">{state.totalXP} XP</span>
            </div>
            <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${tierColors[state.tier]} bg-seeme-card border border-seeme-border`}>
              {state.tier}
            </div>
            {user ? (
              <button onClick={logout} className="flex items-center gap-1 text-sm text-seeme-muted hover:text-seeme-text transition-colors" title={user.email}>
                <LogOut size={14} />
                <span className="max-w-[80px] truncate">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-seeme-accent/10 text-seeme-accent border border-seeme-accent/30 hover:bg-seeme-accent/20 transition-colors">
                <LogIn size={14} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
