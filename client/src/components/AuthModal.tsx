import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Props { open: boolean; onClose: () => void; }

export default function AuthModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="glass-card neon-border p-8 w-full max-w-md" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
            <button onClick={onClose} className="text-seeme-muted hover:text-seeme-text"><X size={20} /></button>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === "login" ? "bg-seeme-accent text-white" : "bg-seeme-bg text-seeme-muted"}`}>
              <LogIn size={14} className="inline mr-1" /> Log In
            </button>
            <button onClick={() => setMode("register")} className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === "register" ? "bg-seeme-accent text-white" : "bg-seeme-bg text-seeme-muted"}`}>
              <UserPlus size={14} className="inline mr-1" /> Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-seeme-bg border border-seeme-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-seeme-accent/50" />
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full bg-seeme-bg border border-seeme-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-seeme-accent/50" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="w-full bg-seeme-bg border border-seeme-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-seeme-accent/50" />

            {error && <div className="text-sm text-seeme-danger">{error}</div>}

            <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
