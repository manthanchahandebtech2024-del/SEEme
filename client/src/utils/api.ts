import axios from "axios";
import { AnalysisResponse, RankingResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API_BASE });

export async function analyzeResume(file: File, jobDescription: string): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);
  const { data } = await api.post("/resume/analyze", formData);
  return data;
}

export async function analyzeResumeText(resumeText: string, jobDescription: string): Promise<AnalysisResponse> {
  const { data } = await api.post("/resume/analyze-text", { resumeText, jobDescription });
  return data;
}

export async function rankResumes(files: File[], jobDescription: string): Promise<RankingResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("resumes", f));
  formData.append("jobDescription", jobDescription);
  const { data } = await api.post("/recruiter/rank", formData);
  return data;
}

export async function sendChatMessage(messages: { role: string; content: string }[], resumeContext?: string, jdContext?: string) {
  const { data } = await api.post("/chat/message", { messages, resumeContext, jdContext });
  return data;
}

export async function getHealth() {
  const { data } = await api.get("/health");
  return data;
}
