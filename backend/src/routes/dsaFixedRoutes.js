const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

function clean(value) {
  return String(value || "").trim();
}

function normalizePlatform(value) {
  const v = clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!v || v === "all") return "All";
  if (v.includes("leetcode")) return "LeetCode";
  if (v.includes("geeksforgeeks") || v === "gfg") return "GeeksForGeeks";
  if (v.includes("codeforces")) return "Codeforces";
  if (v.includes("codechef")) return "CodeChef";

  return clean(value);
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function platformRegex(platform) {
  const p = normalizePlatform(platform);

  if (p === "All") return null;
  if (p === "GeeksForGeeks") return /^(GeeksForGeeks|GFG|Geeks For Geeks)$/i;
  if (p === "LeetCode") return /^(LeetCode|Leetcode)$/i;
  if (p === "Codeforces") return /^Codeforces$/i;
  if (p === "CodeChef") return /^CodeChef$/i;

  return new RegExp(`^${escapeRegex(p)}$`, "i");
}

async function getCollection() {
  const db = mongoose.connection.db;

  const names = await db.listCollections().toArray();
  const collectionNames = names.map((item) => item.name);

  if (collectionNames.includes("dsaquestions")) {
    return db.collection("dsaquestions");
  }

  if (collectionNames.includes("dsa_questions")) {
    return db.collection("dsa_questions");
  }

  return db.collection("dsaquestions");
}

router.get("/questions", async (req, res) => {
  try {
    const col = await getCollection();

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50000, Math.max(1, Number(req.query.limit || 25)));
    const skip = (page - 1) * limit;

    const topic = clean(req.query.topic || "All");
    const difficulty = clean(req.query.difficulty || "All");
    const search = clean(req.query.search || "");
    const platform = normalizePlatform(req.query.platform || "All");

    const filter = {};

    if (topic && topic !== "All") {
      filter.topic = new RegExp(`^${escapeRegex(topic)}$`, "i");
    }

    if (difficulty && difficulty !== "All") {
      filter.difficulty = new RegExp(`^${escapeRegex(difficulty)}$`, "i");
    }

    const pRegex = platformRegex(platform);
    if (pRegex) {
      filter.platform = pRegex;
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(escapeRegex(search), "i") },
        { topic: new RegExp(escapeRegex(search), "i") },
        { platform: new RegExp(escapeRegex(search), "i") },
        { difficulty: new RegExp(escapeRegex(search), "i") }
      ];
    }

    const [questions, total, totalAll, topicAgg, platformAgg] = await Promise.all([
      col
        .find(filter)
        .sort({ platform: 1, topic: 1, difficulty: 1, title: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      col.countDocuments(filter),
      col.countDocuments({}),
      col.aggregate([
        { $group: { _id: "$topic", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray(),
      col.aggregate([
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray()
    ]);

    const topicCounts = {};
    topicAgg.forEach((item) => {
      if (item._id) topicCounts[item._id] = item.count;
    });

    const topics = [
      "All",
      ...topicAgg.map((item) => item._id).filter(Boolean)
    ];

    const platforms = [
      "All",
      ...platformAgg.map((item) => item._id).filter(Boolean)
    ];

    res.json({
      ok: true,
      page,
      limit,
      total,
      totalAll,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      questions: questions.map((q) => ({
        id: q.id || String(q._id),
        title: q.title || q.question || q.problem || "Untitled Question",
        url: q.url || q.link || "",
        topic: q.topic || "DSA",
        platform: q.platform || "Platform",
        difficulty: q.difficulty || "Medium",
        description: q.description || ""
      })),
      topics,
      platforms,
      topicCounts
    });
  } catch (err) {
    console.error("DSA fixed route error:", err);
    res.status(500).json({
      ok: false,
      message: "DSA questions route failed.",
      error: err.message
    });
  }
});

module.exports = router;
