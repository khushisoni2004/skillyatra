const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const BANK = path.join(__dirname, "..", "data", "dsaCodingQuestions.json");

const TOPIC_ORDER = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Trees",
  "Binary Search Tree",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Recursion",
  "Backtracking",
  "Searching",
  "Sorting",
  "Hashing",
  "Heap / Priority Queue",
  "Sliding Window",
  "Two Pointers",
  "Bit Manipulation",
  "Math / Number Theory"
];

function low(x) {
  return String(x || "").toLowerCase();
}

function loadBank() {
  try {
    const data = JSON.parse(fs.readFileSync(BANK, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

router.get("/questions", (req, res) => {
  const topic = req.query.topic || "All";
  const platform = req.query.platform || "All";
  const difficulty = req.query.difficulty || "All";
  const search = low(req.query.search || "");
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(25, Number(req.query.limit || 100)));

  let rows = loadBank();
  const totalAll = rows.length;

  const topicCounts = {};
  for (const t of TOPIC_ORDER) topicCounts[t] = 0;
  for (const q of rows) topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;

  const topics = ["All", ...TOPIC_ORDER.filter((t) => topicCounts[t] > 0)];
  const platforms = ["All", ...Array.from(new Set(rows.map((q) => q.platform))).sort()];

  if (topic !== "All") rows = rows.filter((q) => q.topic === topic);
  if (platform !== "All") rows = rows.filter((q) => q.platform === platform);
  if (difficulty !== "All") rows = rows.filter((q) => q.difficulty === difficulty);

  if (search) {
    rows = rows.filter((q) =>
      low(`${q.title} ${q.topic} ${q.platform} ${q.difficulty}`).includes(search)
    );
  }

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  res.json({
    ok: true,
    totalAll,
    total,
    page: safePage,
    limit,
    totalPages,
    topics,
    platforms,
    difficulties: ["All", "Easy", "Medium", "Hard"],
    topicCounts,
    questions: rows.slice(start, start + limit)
  });
});

module.exports = router;
