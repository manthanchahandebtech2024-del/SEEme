import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import FileUpload from "../components/FileUpload";
import ScoreGauge from "../components/ScoreGauge";
import ScoreExplainer from "../components/ScoreExplainer";
import PowerMoves from "../components/PowerMoves";
import ResumeDiff from "../components/ResumeDiff";
import XPBar from "../components/XPBar";
import BadgeDisplay from "../components/BadgeDisplay";
import StreakCounter from "../components/StreakCounter";
import { useGame } from "../context/GameContext";
import { analyzeResume, analyzeResumeText } from "../utils/api";
import { AnalysisResponse } from "../utils/types";

export default function JobSeeker() {
  const [files, setFiles] = useState<File[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const { addXP, recordAnalysis } = useGame();

  const canSubmit = (inputMode === "file" ? files.length > 0 : resumeText.trim().length > 0) && jd.trim().length > 0;

  const handleAnalyze = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let data: AnalysisResponse;
      if (inputMode === "file" && files[0]) {
        data = await analyzeResume(files[0], jd);
      } else {
        data = await analyzeResumeText(resumeText, jd);
      }
      setResult(data);
      addXP(data.xpEarned);
      recordAnalysis();
    } catch (err: any) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black">
            Job Seeker <span className="gradient-text">Battle Station</span>
          </h1>
          <p className="text-seeme-muted mt-1">
            Upload your resume + paste a job description to get your ATS Battle Score
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInputMode("file")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputMode === "file" ? "bg-seeme-accent text-white" : "bg-seeme-bg text-seeme-muted hover:text-seeme-text"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputMode("paste")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputMode === "paste" ? "bg-seeme-accent text-white" : "bg-seeme-bg text-seeme-muted hover:text-seeme-text"
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {inputMode === "file" ? (
                <FileUpload files={files} onFilesChange={setFiles} label="Drop your resume here" />
              ) : (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-40 bg-seeme-bg border border-seeme-border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-seeme-accent/50 transition-colors"
                />
              )}
            </div>

            <div className="glass-card p-5">
              <label className="text-sm font-semibold text-seeme-muted uppercase tracking-wider block mb-3">
                Job Description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 bg-seeme-bg border border-seeme-border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-seeme-accent/50 transition-colors"
              />
            </div>

            <motion.button
              onClick={handleAnalyze}
              disabled={!canSubmit || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                canSubmit && !loading
                  ? "btn-primary"
                  : "bg-seeme-card text-seeme-muted cursor-not-allowed"
              }`}
              whileHover={canSubmit && !loading ? { scale: 1.01 } : {}}
              whileTap={canSubmit && !loading ? { scale: 0.99 } : {}}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Analyze Resume
                </>
              )}
            </motion.button>

            {error && (
              <motion.div
                className="p-4 bg-seeme-danger/10 border border-seeme-danger/30 rounded-lg text-sm text-seeme-danger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence>
              {result && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="glass-card p-8 flex flex-col items-center">
                    <ScoreGauge score={result.result.score.overall} tier={result.result.tier} />
                    <div className={`mt-4 text-lg font-black uppercase tier-${result.result.tier}`}>
                      {result.result.tier} Tier
                    </div>
                  </div>

                  <XPBar xpGained={result.xpEarned} />
                  <ScoreExplainer score={result.result.score} />

                  <div className="glass-card p-5">
                    <PowerMoves moves={result.result.powerMoves} />
                  </div>

                  <ResumeDiff changes={result.diff.changes} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <XPBar />
            <StreakCounter />
            <BadgeDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
