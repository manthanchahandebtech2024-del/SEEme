import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Eye,
  User,
  Users,
  Shield,
  Brain,
  Gamepad2,
  ArrowRight,
  Zap,
  GitCompare,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Unbiased Scoring",
    description:
      "Strips all demographic identifiers before evaluation. Gender, name origin, institution prestige = irrelevant.",
    color: "text-seeme-accent",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    description:
      'Every score comes with a human-readable breakdown. Not "75/100" but WHY: which skills matched, what\'s missing.',
    color: "text-seeme-accent2",
  },
  {
    icon: Gamepad2,
    title: "Gamified Coaching",
    description:
      "Earn XP, unlock resume tiers (Bronze to Unicorn), get streak rewards for iterating on your resume.",
    color: "text-seeme-gold",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen pt-16">
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-seeme-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-seeme-accent2/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative text-center max-w-3xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-seeme-card border border-seeme-border mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Eye size={16} className="text-seeme-accent" />
            <span className="text-xs font-medium text-seeme-muted">
              AI-Powered Resume Intelligence
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Your resume,{" "}
            <span className="gradient-text">truly seen.</span>
          </h1>

          <p className="text-lg text-seeme-muted mt-6 max-w-xl mx-auto leading-relaxed">
            Unbiased scoring. Explainable AI. Gamified coaching. The resume
            platform that levels the playing field.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link to="/seeker">
              <motion.button
                className="btn-primary flex items-center gap-2 text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <User size={18} />
                I'm a Job Seeker
                <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/recruiter">
              <motion.button
                className="px-6 py-3 rounded-lg font-semibold border border-seeme-border text-seeme-text hover:bg-seeme-card transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users size={18} />
                I'm a Recruiter
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-24"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="glass-card p-6 hover:neon-border transition-shadow"
              variants={{
                hidden: { y: 20, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              whileHover={{ y: -4 }}
            >
              <feature.icon size={28} className={feature.color} />
              <h3 className="text-lg font-bold mt-4">{feature.title}</h3>
              <p className="text-sm text-seeme-muted mt-2 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-24 glass-card p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <GitCompare size={24} className="text-seeme-accent" />
            <h2 className="text-2xl font-black">Resume Diff Engine</h2>
            <span className="text-xs px-2 py-1 rounded bg-seeme-accent/10 text-seeme-accent border border-seeme-accent/20 font-mono">
              EXCLUSIVE
            </span>
          </div>
          <p className="text-seeme-muted max-w-2xl">
            Side-by-side animated diff between your original resume and the AI-improved
            version. Every change highlighted and justified—like a git diff for your career.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-seeme-bg rounded-lg p-4 font-mono text-xs space-y-1">
              <div className="text-red-400 text-[10px] uppercase font-bold mb-2">Original</div>
              <div className="diff-removed px-2 py-0.5">- Worked on backend systems</div>
              <div className="diff-unchanged px-2 py-0.5">  5 years experience</div>
              <div className="diff-removed px-2 py-0.5">- Know Python and JavaScript</div>
            </div>
            <div className="bg-seeme-bg rounded-lg p-4 font-mono text-xs space-y-1">
              <div className="text-green-400 text-[10px] uppercase font-bold mb-2">Improved</div>
              <div className="diff-added px-2 py-0.5">+ Architected microservices handling 10K RPS</div>
              <div className="diff-unchanged px-2 py-0.5">  5 years experience</div>
              <div className="diff-added px-2 py-0.5">+ Python, TypeScript, Node.js, FastAPI, AWS</div>
            </div>
          </div>
        </motion.div>

        <div className="mt-24 grid grid-cols-3 gap-6">
          {[
            { icon: Zap, value: "0-100", label: "ATS Battle Score" },
            { icon: BarChart3, value: "4", label: "Score Dimensions" },
            { icon: Gamepad2, value: "4", label: "Achievement Tiers" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
            >
              <stat.icon size={24} className="text-seeme-accent mx-auto mb-2" />
              <div className="text-3xl font-black font-mono gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-seeme-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
