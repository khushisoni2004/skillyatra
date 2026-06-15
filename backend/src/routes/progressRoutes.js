const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const STORE_FILE = path.join(__dirname, "../data/progressStore.json");

function ensureStore() {
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(
        {
          activities: []
        },
        null,
        2
      )
    );
  }
}

function readStore() {
  ensureStore();

  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch {
    return { activities: [] };
  }
}

function writeStore(data) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value || "").trim();
}

function normalizeActivity(body = {}) {
  return {
    id: body.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemType: clean(body.itemType || body.type || "Activity"),
    topic: clean(body.topic || body.title || "General"),
    status: clean(body.status || "completed"),
    section: clean(body.section || "General"),
    score: Number(body.score || 0),
    total: Number(body.total || 0),
    correct: Number(body.correct || 0),
    difficulty: clean(body.difficulty || ""),
    company: clean(body.company || ""),
    role: clean(body.role || ""),
    durationSeconds: Number(body.durationSeconds || 0),
    createdAt: body.createdAt || new Date().toISOString()
  };
}

router.get("/", (req, res) => {
  const store = readStore();

  const activities = [...(store.activities || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 100);

  return res.json(activities);
});

router.get("/summary", (req, res) => {
  const store = readStore();
  const activities = store.activities || [];

  const completedTasks = activities.filter((a) =>
    ["completed", "done", "submitted", "passed"].includes(String(a.status || "").toLowerCase())
  ).length;

  const submittedDsa = activities.filter((a) =>
    String(a.itemType || "").toLowerCase().includes("dsa") ||
    String(a.section || "").toLowerCase().includes("dsa")
  ).length;

  const practiceItems = activities.filter((a) =>
    String(a.itemType || "").toLowerCase().includes("mcq") ||
    String(a.section || "").toLowerCase().includes("practice")
  );

  const correct = practiceItems.reduce((sum, a) => sum + Number(a.correct || 0), 0);
  const total = practiceItems.reduce((sum, a) => sum + Number(a.total || 0), 0);

  const practiceAccuracy = total ? Math.round((correct / total) * 100) : 0;

  const interviewItems = activities.filter((a) =>
    String(a.section || "").toLowerCase().includes("interview") ||
    String(a.itemType || "").toLowerCase().includes("interview")
  ).length;

  const resumeItems = activities.filter((a) =>
    String(a.section || "").toLowerCase().includes("resume") ||
    String(a.itemType || "").toLowerCase().includes("resume")
  ).length;

  const today = new Date().toISOString().slice(0, 10);
  const todayActivities = activities.filter((a) =>
    String(a.createdAt || "").startsWith(today)
  ).length;

  const readiness = Math.min(
    100,
    Math.round(
      completedTasks * 3 +
        submittedDsa * 4 +
        practiceAccuracy * 0.25 +
        interviewItems * 5 +
        resumeItems * 4
    )
  );

  return res.json({
    totalActivities: activities.length,
    completedTasks,
    submittedDsa,
    practiceAttempted: practiceItems.length,
    practiceAccuracy,
    interviewSessions: interviewItems,
    resumeAnalyses: resumeItems,
    todayActivities,
    readiness
  });
});

router.post("/", (req, res) => {
  const store = readStore();
  const activity = normalizeActivity(req.body || {});

  store.activities = [activity, ...(store.activities || [])].slice(0, 500);
  writeStore(store);

  return res.json({
    ok: true,
    activity
  });
});

router.delete("/", (req, res) => {
  writeStore({ activities: [] });

  return res.json({
    ok: true,
    message: "Progress cleared."
  });
});

module.exports = router;
