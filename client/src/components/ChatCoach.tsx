import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  resumeContext?: string;
  jdContext?: string;
}

export default function ChatCoach({ resumeContext, jdContext }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI Resume Coach. Ask me anything about improving your resume, boosting your ATS score, or filling skill gaps." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/chat/message`, {
        messages: newMessages,
        resumeContext,
        jdContext,
      });
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-accent flex items-center justify-center shadow-lg shadow-seeme-accent/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <MessageCircle size={24} className="text-white" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-50 bg-seeme-surface border border-seeme-border rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden ${
          minimized ? "bottom-6 right-6 w-72 h-12" : "bottom-6 right-6 w-96 h-[32rem]"
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        layout
      >
        <div className="flex items-center justify-between px-4 py-3 bg-seeme-card border-b border-seeme-border cursor-pointer" onClick={() => setMinimized(!minimized)}>
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-seeme-accent" />
            <span className="text-sm font-semibold">AI Resume Coach</span>
            <span className="w-2 h-2 rounded-full bg-seeme-xp animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            {minimized ? <Maximize2 size={14} className="text-seeme-muted" /> : <Minimize2 size={14} className="text-seeme-muted" />}
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} className="text-seeme-muted hover:text-seeme-text">
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-seeme-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={12} className="text-seeme-accent" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user" ? "bg-seeme-accent text-white" : "bg-seeme-card text-seeme-text"
                  }`}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>")
                    }} />
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-seeme-accent2/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={12} className="text-seeme-accent2" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-seeme-accent/20 flex items-center justify-center">
                    <Bot size={12} className="text-seeme-accent" />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-seeme-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-seeme-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-seeme-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-seeme-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about your resume..."
                  className="flex-1 bg-seeme-bg border border-seeme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-seeme-accent/50"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="px-3 rounded-lg bg-seeme-accent text-white disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
