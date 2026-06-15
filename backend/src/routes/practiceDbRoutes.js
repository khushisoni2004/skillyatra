const express = require("express");
const PracticeQuestion = require("../models/PracticeQuestion");
const PracticeAttempt = require("../models/PracticeAttempt");

const router = express.Router();

router.get("/questions", async (req, res) => {
  try {
    const group = req.query.group || "All";
    const topic = req.query.topic || "All Topics";
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));

    const filter = {};
    if (group !== "All") filter.subject = group;
    if (topic !== "All Topics") filter.topic = topic;

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } }
      ];
    }

    const total = await PracticeQuestion.countDocuments(filter);
    const questions = await PracticeQuestion.find(filter)
      .sort({ subject: 1, topic: 1, qid: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const all = await PracticeQuestion.find({}, { subject: 1, topic: 1 }).lean();

    const groups = [
      "All",
      "Quantitative Aptitude",
      "Logical Reasoning",
      "Verbal Ability",
      "Placement / NQT",
      "Programming",
      "Core CS",
      "Python",
      "Data Science",
      "HR / Technical Interview"
    ];

    const counts = {};
    for (const g of groups) {
      counts[g] = g === "All" ? all.length : all.filter((q) => q.subject === g).length;
    }

    const topics = ["All Topics", ...new Set(all.filter((q) => group === "All" || q.subject === group).map((q) => q.topic).filter(Boolean))];

    res.json({
      ok: true,
      groups,
      counts,
      topics,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      questions: questions.map((q) => ({
        id: q.qid,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        answer: q.answer,
        explanation: q.explanation,
        sourceDataset: q.sourceDataset
      }))
    });
  } catch (error) {
    console.error("Practice DB questions error:", error);
    res.status(500).json({ ok: false, message: "Could not load DB questions." });
  }
});

router.post("/attempt", async (req, res) => {
  try {
    const { sessionId = "guest", qid, selectedAnswer } = req.body || {};

    const q = await PracticeQuestion.findOne({ qid }).lean();
    if (!q) {
      return res.status(404).json({ ok: false, message: "Question not found." });
    }

    const correctAnswer = q.correctAnswer || q.answer;
    const isCorrect = String(selectedAnswer).toLowerCase() === String(correctAnswer).toLowerCase();

    const attempt = await PracticeAttempt.create({
      sessionId,
      qid,
      subject: q.subject,
      topic: q.topic,
      question: q.question,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      explanation: q.explanation
    });

    res.json({
      ok: true,
      attemptId: attempt._id,
      isCorrect,
      correctAnswer,
      explanation: q.explanation
    });
  } catch (error) {
    console.error("Practice attempt error:", error);
    res.status(500).json({ ok: false, message: "Could not save attempt." });
  }
});

router.get("/attempts", async (req, res) => {
  try {
    const sessionId = req.query.sessionId || "guest";
    const attempts = await PracticeAttempt.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ ok: true, attempts });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Could not load attempts." });
  }
});

module.exports = router;
