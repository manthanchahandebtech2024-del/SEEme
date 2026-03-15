import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Users, Download, BarChart3 } from "lucide-react";
import FileUpload from "../components/FileUpload";
import LeaderBoard from "../components/LeaderBoard";
import { rankResumes } from "../utils/api";
import { RankingResponse, Tier } from "../utils/types";

const tierColors: Record<Tier, string> = {
  unicorn: "bg-unicorn",
  gold: "bg-gold",
  silver: "bg-silver",
  bronze: "bg-bronze",
};

export default function Recruiter() {
  const [files, setFiles] = useState<File[]>([]);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankingResponse | null>(null);
  const [error, setError] = useState("");

  const canSubmit = files.length > 0 && jd.trim().length > 0;

  const handleRank = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await rankResumes(files, jd);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ranking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const rows = [
      ["Rank", "File", "Score", "Tier", "Skills Match", "Experience", "Education", "Keywords", "Bias Flags"],
      ...result.results.map((r, i) => [
        i + 1,
        r.fileName,
        r.score.overall,
        r.tier,
        r.score.skillsMatch.score,
        r.score.experienceMatch.score,
        r.score.educationMatch.score,
        r.score.keywordDensity.score,
        r.biasFlags.length,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seeme-rankings.csv";
    a.click();
    URL.revokeObjectURL(url);
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
            Recruiter <span className="gradient-text">Command Center</span>
          </h1>
          <p className="text-seeme-muted mt-1">
            Upload multiple resumes + a job description to get a bias-free ranked leaderboard
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5">
              <label className="text-sm font-semibold text-seeme-muted uppercase tracking-wider block mb-3">
                Candidate Resumes
              </label>
              <FileUpload
                files={files}
                onFilesChange={setFiles}
                multiple
                label="Drop multiple resumes here"
              />
              {files.length > 0 && (
                <div className="mt-2 text-xs text-seeme-muted">
                  {files.length} resume{files.length > 1 ? "s" : ""} ready for analysis
                </div>
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
              onClick={handleRank}
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
                  Ranking {files.length} Candidates...
                </>
              ) : (
                <>
                  <Users size={20} />
                  Rank Candidates
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
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Results</h2>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-seeme-card border border-seeme-border hover:border-seeme-accent/50 transition-colors"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>

                  <LeaderBoard results={result.results} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            {result && (
              <>
                <motion.div
                  className="glass-card p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-sm font-semibold text-seeme-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 size={14} />
                    Summary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-black font-mono gradient-text">
                        {result.totalCandidates}
                      </div>
                      <div className="text-xs text-seeme-muted">Total Candidates</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black font-mono text-seeme-xp">
                        {result.summary.topScore}
                      </div>
                      <div className="text-xs text-seeme-muted">Top Score</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black font-mono text-seeme-accent2">
                        {result.summary.averageScore}
                      </div>
                      <div className="text-xs text-seeme-muted">Average Score</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="glass-card p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-sm font-semibold text-seeme-muted uppercase tracking-wider mb-4">
                    Tier Distribution
                  </h3>
                  <div className="space-y-3">
                    {(["unicorn", "gold", "silver", "bronze"] as Tier[]).map((tier) => {
                      const count = result.summary.tierDistribution[tier];
                      const pct = result.totalCandidates > 0 ? (count / result.totalCandidates) * 100 : 0;
                      return (
                        <div key={tier}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className={`font-medium capitalize tier-${tier}`}>{tier}</span>
                            <span className="font-mono">{count}</span>
                          </div>
                          <div className="h-2 bg-seeme-bg rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${tierColors[tier]}`}
                              initial={{ width: "0%" }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}

            {!result && (
              <div className="glass-card p-6 text-center">
                <Users size={48} className="text-seeme-muted/30 mx-auto mb-3" />
                <p className="text-sm text-seeme-muted">
                  Upload resumes and a job description to see the ranked leaderboard with bias audit results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
