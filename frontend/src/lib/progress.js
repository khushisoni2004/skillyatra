const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

function safeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export async function trackProgress(payload = {}) {
  try {
    const activity = {
      itemType: safeText(payload.itemType || "Activity"),
      section: safeText(payload.section || "General"),
      topic: safeText(payload.topic || payload.title || "General Activity"),
      status: safeText(payload.status || "completed"),
      score: Number(payload.score || 0),
      total: Number(payload.total || 0),
      correct: Number(payload.correct || 0),
      difficulty: safeText(payload.difficulty || ""),
      company: safeText(payload.company || ""),
      role: safeText(payload.role || ""),
      durationSeconds: Number(payload.durationSeconds || 0),
      createdAt: new Date().toISOString()
    };

    await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(activity)
    });
  } catch (err) {
    console.warn("Progress tracking failed:", err?.message || err);
  }
}
