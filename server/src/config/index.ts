import path from "path";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  jwtSecret: process.env.JWT_SECRET || "seeme-dev-secret-change-in-production",
  jwtExpiry: process.env.JWT_EXPIRY || "7d",
  aiProvider: (process.env.AI_PROVIDER || "local") as "openai" | "gemini" | "azure" | "local",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  azureApiKey: process.env.AZURE_OPENAI_API_KEY || "",
  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
  azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini",
  azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2023-05-15",
  dbUrl: process.env.DATABASE_URL || `file:${path.join(__dirname, "../../prisma/seeme.db")}`,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL || "3600", 10),
  },
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

export type Config = typeof config;
