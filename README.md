# SEEme — AI-Powered Resume Intelligence Platform

**Live Demo:** [https://seeme-f8zb.onrender.com](https://seeme-f8zb.onrender.com)

SEEme is a next-generation resume intelligence platform that does three things no existing tool does simultaneously: **unbiased scoring**, **explainable AI**, and **gamified candidate coaching**.

![SEEme Landing](https://img.shields.io/badge/Status-Live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![Node.js](https://img.shields.io/badge/Node.js-24-339933)

---

## What Makes SEEme Different

| Feature | Traditional ATS | SEEme |
|---|---|---|
| Scoring | Black box "75/100" | Full breakdown: skills, experience, education, keywords, semantic |
| Bias | Scores influenced by name, school, gender | Strips all demographic identifiers before evaluation |
| Feedback | None or generic | 5 Power Moves with specific, actionable improvements |
| Engagement | Upload and wait | XP, tiers, streaks, badges, AI coaching chatbot |
| Transparency | None | Resume Diff Engine — git-style side-by-side comparison |

---

## Core Features

### 1. Unbiased Scoring
Strips names, emails, addresses, gender pronouns, and age indicators before evaluation. Flags prestige institution bias. Scores purely on **skills × experience × JD alignment**.

### 2. Explainable AI
Every score includes a detailed breakdown across 5 dimensions:
- **Skills Match** (35%) — matched vs. missing skills
- **Experience** (25%) — years vs. requirement
- **Education** (15%) — degree level detection
- **Keywords** (15%) — JD keyword density
- **Semantic Analysis** (10%) — AI-powered contextual understanding (when AI provider is configured)

### 3. Gamified Candidate Coaching
- **ATS Battle Score** (0–100)
- **5 Power Moves** — ranked by impact with XP rewards
- **4 Tiers**: Bronze → Silver → Gold → Unicorn
- **XP System** with level progression
- **Streak Counter** for daily engagement
- **8 Unlockable Badges** (First Scan, Triple Threat, Power User, On Fire, etc.)

### 4. Resume Diff Engine
Side-by-side animated diff between original and AI-improved resume. Every change highlighted and justified — like a git diff for careers.

### 5. AI Resume Coach
Floating chatbot on every page providing contextual advice on score improvement, bullet writing (STAR method), and skill gap strategies.

---

## Two User Modes

**Mode A — Job Seeker**
Upload resume (PDF/DOCX/TXT) or paste text + job description → ATS Battle Score + 5 Power Moves + XP reward + Resume Diff

**Mode B — Recruiter**
Upload N resumes + job description → ranked leaderboard with bias audit flags, per-candidate explainer, and one-click CSV export

---

## Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite** build system
- **Tailwind CSS** — custom dark theme (Notion × Duolingo × Bloomberg aesthetic)
- **Framer Motion** — micro-animations on scores, badges, diffs
- **React Router** — SPA routing

### Backend
- **Express 5** + TypeScript
- **Prisma** + SQLite — users, analyses, game profiles, badges
- **JWT Authentication** — register, login, persistent sessions
- **WebSocket** — real-time score/badge notifications
- **Rate Limiting** + structured logging + error handling

### AI Providers (Strategy Pattern — hot-swappable)
| Provider | Config | Use Case |
|---|---|---|
| **Local** (default) | No key needed | Keyword matching, works out of the box |
| **Azure OpenAI** | `AZURE_OPENAI_API_KEY` | Enterprise, semantic analysis |
| **OpenAI** | `OPENAI_API_KEY` | GPT-4o-mini semantic scoring |
| **Gemini** | `GEMINI_API_KEY` | Google AI alternative |

---

## Architecture — SOLID Principles

```
Client (React) ──→ API Gateway (Express) ──→ DI Container
                                                  │
                   ┌──────────────┬───────────────┼───────────────┬──────────────┐
                   │              │               │               │              │
              Auth Service   Scoring Pipeline  AI Provider    Gamification   WebSocket
              (JWT+bcrypt)   (5 Analyzers)     (Strategy)    (Observer)     (Real-time)
                   │              │               │               │              │
                   └──── Prisma + SQLite ────────┘          Event Bus      Async Queue
```

### Design Patterns Used
- **Strategy** — Swappable AI providers (Azure/OpenAI/Gemini/Local)
- **Factory** — ParserFactory (PDF/DOCX/TXT), AIProviderFactory
- **Pipeline** — ScoringPipeline with pluggable analyzers
- **Observer** — EventBus for gamification events, badge awards
- **Repository** — Data access abstraction (User, Analysis, GameProfile, Badge)
- **Dependency Injection** — Container wires all services at startup

### Interface Segregation
```
IAIProvider       — AI analysis, chat, bias detection
IResumeParser     — File format parsing
IScoringEngine    — Score calculation + ranking
IBiasDetector     — Identifier stripping + subtle bias detection
IDiffEngine       — Resume diff generation
IGamificationService — XP, tiers, streaks, badges
IRepository       — Database access
ICacheService     — In-memory caching with TTL
```

---

## Getting Started

### Prerequisites
- Node.js 20+


# Install dependencies
cd server && npm install && npx prisma generate && npx prisma db push && cd ..
cd client && npm install && cd ..
```

### Run Locally
```bash
# Terminal 1 — Backend (port 3001)
cd server && npx tsx src/index.ts

# Terminal 2 — Frontend (port 5173)
cd client && npx vite
```

Open **http://localhost:5173**

### Environment Variables
Copy `.env.example` to `server/.env`:

```env
DATABASE_URL="file:./seeme.db"
JWT_SECRET=your-secret-key
AI_PROVIDER=local

# Optional — enables semantic AI features
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2023-05-15
```

---

## Deployment

### Render (Current)
The app is deployed as a single Docker service on Render. Push to `master` triggers auto-deploy.

### Docker
```bash
docker build -t seeme .
docker run -p 3001:3001 seeme
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status + AI provider info |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Current user profile + game state |
| `POST` | `/api/resume/analyze` | Analyze uploaded resume file vs JD |
| `POST` | `/api/resume/analyze-text` | Analyze pasted resume text vs JD |
| `GET` | `/api/resume/history` | User's analysis history |
| `POST` | `/api/recruiter/rank` | Rank multiple resumes against JD |
| `POST` | `/api/chat/message` | AI coaching chat |

---

## Project Structure

```
seeme/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # ScoreGauge, PowerMoves, ResumeDiff, ChatCoach, etc.
│   │   ├── pages/             # Landing, JobSeeker, Recruiter
│   │   ├── context/           # AuthContext, GameContext
│   │   └── utils/             # API client, types
│   └── vercel.json
├── server/                    # Express backend
│   ├── prisma/                # Database schema
│   ├── src/
│   │   ├── interfaces/        # SOLID interfaces (8 contracts)
│   │   ├── services/
│   │   │   ├── ai/            # OpenAI, Azure, Gemini, Local providers
│   │   │   ├── scoring/       # Pipeline + 5 analyzers
│   │   │   └── parsing/       # PDF, DOCX, TXT parsers
│   │   ├── repositories/      # Data access layer
│   │   ├── container/         # Dependency injection
│   │   ├── events/            # EventBus (Observer pattern)
│   │   ├── queue/             # Async job processing
│   │   ├── websocket/         # Real-time updates
│   │   ├── middleware/        # Auth, rate limit, upload, errors
│   │   └── routes/            # Auth, resume, recruiter, chat
│   └── Dockerfile
├── Dockerfile                 # Unified production build
├── render.yaml                # Render deployment config
└── .env.example               # Environment template

## License
MIT

---

Built with a focus on fairness, transparency, and making the job search a little less painful.
