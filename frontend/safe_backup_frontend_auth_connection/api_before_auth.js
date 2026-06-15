import TodayPlanFinal from "../pages/TodayPlanFinal";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE
});

function inferProgress(config, response) {
  const url = String(config?.url || "").toLowerCase();
  const method = String(config?.method || "").toLowerCase();
  const data = config?.data ? safeJson(config.data) : {};
  const res = response?.data || {};

  if (method === "get") return null;
  if (url.includes("/progress")) return null;

  if (url.includes("/resume")) {
    return {
      itemType: "Resume Analysis",
      section: "Resume Coach",
      topic: data.roleName || data.role || "Resume analyzed",
      status: "completed",
      score: res.roleMatchScore || res.score || 0,
      company: data.companyName || "",
      role: data.roleName || ""
    };
  }

  if (url.includes("/interview/analyze-code")) {
    return {
      itemType: "Coding Interview Answer",
      section: "Interview Coach",
      topic: data.question || "Coding answer submitted",
      status: res.correct ? "passed" : "needs improvement",
      score: res.score || 0,
      role: data.roleName || ""
    };
  }

  if (url.includes("/interview/analyze-answer")) {
    return {
      itemType: "Interview Answer",
      section: "Interview Coach",
      topic: data.question || "Voice answer submitted",
      status: "completed",
      score: res.score || 0,
      role: data.roleName || ""
    };
  }

  if (url.includes("/interview/questions")) {
    return {
      itemType: "Interview Generated",
      section: "Interview Coach",
      topic: `${data.companyName || "Company"} - ${data.roleName || "Role"}`,
      status: "completed",
      total: Array.isArray(res.questions) ? res.questions.length : 0,
      company: data.companyName || "",
      role: data.roleName || ""
    };
  }

  if (url.includes("/practice") || url.includes("/mcq") || url.includes("/quiz")) {
    return {
      itemType: "MCQ Practice",
      section: "Practice MCQs",
      topic: data.topic || data.subject || "Practice attempted",
      status: "completed",
      score: res.score || data.score || 0,
      total: res.total || data.total || 0,
      correct: res.correct || data.correct || 0,
      difficulty: data.difficulty || ""
    };
  }

  if (url.includes("/dsa")) {
    return {
      itemType: "DSA Problem",
      section: "DSA Tracker",
      topic: data.topic || data.title || data.problem || "DSA activity",
      status: data.status || "completed",
      difficulty: data.difficulty || ""
    };
  }

  if (url.includes("/today") || url.includes("/task") || url.includes("/todo")) {
    return {
      itemType: "Task",
      section: "Today Plan",
      topic: data.title || data.task || data.topic || "Task activity",
      status: data.status || "completed"
    };
  }

  return {
    itemType: "Backend Action",
    section: "General",
    topic: url,
    status: "completed"
  };
}

function safeJson(value) {
  try {
    if (typeof value === "string") return JSON.parse(value);
    return value || {};
  } catch {
    return {};
  }
}

async function saveProgress(payload) {
  if (!payload) return;

  try {
    await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn("Progress auto-save failed:", err?.message || err);
  }
}

api.interceptors.response.use(
  (response) => {
    const payload = inferProgress(response.config, response);
    saveProgress(payload);
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
