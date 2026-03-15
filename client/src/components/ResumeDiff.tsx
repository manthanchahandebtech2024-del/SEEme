import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";
import { DiffChange } from "../utils/types";

interface Props {
  changes: DiffChange[];
}

export default function ResumeDiff({ changes }: Props) {
  if (!changes || changes.length === 0) return null;

  const hasChanges = changes.some((c) => c.type !== "unchanged");
  if (!hasChanges) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <GitCompare size={20} className="text-seeme-accent" />
        Resume Diff Engine
        <span className="text-xs text-seeme-muted font-normal ml-2">
          Side-by-side comparison
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Original
          </div>
          <div className="bg-seeme-bg rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-96 overflow-y-auto">
            {changes.map((change, i) => (
              <motion.div
                key={i}
                className={`px-2 py-0.5 rounded-sm ${
                  change.type === "removed"
                    ? "diff-removed"
                    : change.type === "added"
                      ? "invisible h-0 p-0 m-0"
                      : "diff-unchanged"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                {change.type === "removed" ? `- ${change.value}` : change.value}
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Improved
          </div>
          <div className="bg-seeme-bg rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-96 overflow-y-auto">
            {changes.map((change, i) => (
              <motion.div
                key={i}
                className={`px-2 py-0.5 rounded-sm ${
                  change.type === "added"
                    ? "diff-added"
                    : change.type === "removed"
                      ? "invisible h-0 p-0 m-0"
                      : "diff-unchanged"
                }`}
                initial={change.type === "added" ? { x: -10, opacity: 0 } : { opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.02 + 0.3 }}
              >
                {change.type === "added" ? `+ ${change.value}` : change.value}
                {change.type === "added" && change.reason && (
                  <span className="text-green-400/50 ml-2 italic">// {change.reason}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
