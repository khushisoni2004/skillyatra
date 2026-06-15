const express = require("express");
const mongoose = require("mongoose");
const PracticeQuestion = require("../models/PracticeQuestion");
const PracticeAttempt = require("../models/PracticeAttempt");
const Progress = require("../models/Progress");

const router = express.Router();

function clean(value) {
  return String(value || "").toLowerCase().trim();
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeAnswer(value) {
  return clean(value).replace(/\s+/g, " ");
}

function getQuestionText(q = {}) {
  return (
    q.question ||
    q.questionText ||
    q.title ||
    q.problem ||
    q.prompt ||
    q.text ||
    "Practice Question"
  );
}

function getCorrectAnswer(q = {}) {
  return (
    q.correctAnswer ||
    q.answer ||
    q.correct_option ||
    q.correctOption ||
    q.solution ||
    q.correct ||
    ""
  );
}

function getSelectedAnswer(body = {}) {
  return (
    body.selectedAnswer ||
    body.selectedOption ||
    body.answer ||
    body.userAnswer ||
    body.option ||
    ""
  );
}

function getRoleKeywords(role = "") {
  const r = clean(role);

  const common = ["computer", "programming", "database", "oops", "operating system"];

  if (r.includes("mern")) {
    return [
      "mern",
      "react",
      "reactjs",
      "node",
      "nodejs",
      "express",
      "expressjs",
      "mongodb",
      "mongo",
      "javascript",
      "html",
      "css",
      "api",
      "rest",
      "backend",
      "frontend",
      "authentication",
      "jwt",
      "bcrypt",
      "cors",
      "database",
      ...common
    ];
  }

  if (r.includes("full stack") || r.includes("web developer") || r.includes("frontend") || r.includes("backend")) {
    return [
      "react",
      "javascript",
      "node",
      "express",
      "mongodb",
      "sql",
      "html",
      "css",
      "api",
      "backend",
      "frontend",
      "database",
      ...common
    ];
  }

  if (r.includes("data science") || r.includes("data analyst") || r.includes("machine learning")) {
    return [
      "python",
      "machine learning",
      "data science",
      "neural network",
      "regression",
      "classification",
      "pandas",
      "numpy",
      "statistics",
      "sql",
      "database",
      ...common
    ];
  }

  if (r.includes("software") || r.includes("developer") || r.includes("engineer")) {
    return [
      "programming",
      "oops",
      "database",
      "sql",
      "operating system",
      "computer network",
      "data structure",
      "algorithm",
      "javascript",
      "java",
      "python",
      ...common
    ];
  }

  return role
    .split(/[^a-zA-Z0-9+#.]+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 2)
    .concat(common);
}

function buildKeywordFilter(keywords) {
  const unique = [...new Set((keywords || []).filter(Boolean))].slice(0, 28);

  if (!unique.length) return {};

  const regexes = unique.map((word) => new RegExp(escapeRegex(word), "i"));

  return {
    $or: [
      { question: { $in: regexes } },
      { questionText: { $in: regexes } },
      { title: { $in: regexes } },
      { topic: { $in: regexes } },
      { subject: { $in: regexes } },
      { category: { $in: regexes } },
      { skill: { $in: regexes } },
      { role: { $in: regexes } },
      { tags: { $in: regexes } },
      { description: { $in: regexes } }
    ]
  };
}

function normalizeQuestion(q = {}) {
  const options =
    q.options ||
    q.choices ||
    [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);

  return {
    ...q,
    _id: q._id,
    question: getQuestionText(q),
    options: Array.isArray(options) ? options : [],
    correctAnswer: getCorrectAnswer(q),
    topic: q.topic || q.subject || q.category || "Core CS",
    subject: q.subject || q.category || "Core CS",
    difficulty: q.difficulty || "Easy",
    sourceDataset: q.sourceDataset || q.source || "MongoDB Dataset"
  };
}

router.get("/questions", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 300);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || req.query.roleName || "").trim();
    const topic = String(req.query.topic || "").trim();
    const difficulty = String(req.query.difficulty || "").trim();

    const andFilters = [];

    if (difficulty && difficulty.toLowerCase() !== "all") {
      andFilters.push({ difficulty: { $regex: escapeRegex(difficulty), $options: "i" } });
    }

    if (topic && topic.toLowerCase() !== "all") {
      andFilters.push({
        $or: [
          { topic: { $regex: escapeRegex(topic), $options: "i" } },
          { subject: { $regex: escapeRegex(topic), $options: "i" } },
          { category: { $regex: escapeRegex(topic), $options: "i" } }
        ]
      });
    }

    if (search) {
      andFilters.push(buildKeywordFilter([search]));
    }

    if (role) {
      andFilters.push(buildKeywordFilter(getRoleKeywords(role)));
    }

    let filter = andFilters.length ? { $and: andFilters } : {};

    let questions = await PracticeQuestion.find(filter).limit(limit).lean();

    if (!questions.length && role) {
      questions = await PracticeQuestion.find(buildKeywordFilter(getRoleKeywords(role))).limit(limit).lean();
    }

    if (!questions.length && search) {
      questions = await PracticeQuestion.find(buildKeywordFilter([search])).limit(limit).lean();
    }

    if (!questions.length) {
      questions = await PracticeQuestion.find({}).limit(limit).lean();
    }

    return res.json(questions.map(normalizeQuestion));
  } catch (err) {
    console.error("Practice questions error:", err);
    return res.status(500).json({
      ok: false,
      message: "Practice questions not loaded.",
      error: err.message
    });
  }
});

router.get("/questions/:id", async (req, res) => {
  try {
    const id = req.params.id;

    let question = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      question = await PracticeQuestion.findById(id).lean();
    }

    if (!question) {
      question = await PracticeQuestion.findOne({ id }).lean();
    }

    if (!question) {
      return res.status(404).json({ ok: false, message: "Question not found." });
    }

    return res.json(normalizeQuestion(question));
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Question fetch failed." });
  }
});

async function saveAttempt(req, res) {
  try {
    const body = req.body || {};
    const questionId = body.questionId || body._id || body.id || "";

    let question = null;

    if (mongoose.Types.ObjectId.isValid(questionId)) {
      question = await PracticeQuestion.findById(questionId).lean();
    }

    if (!question && questionId) {
      question = await PracticeQuestion.findOne({ id: questionId }).lean().catch(() => null);
    }

    if (!question) {
      question = {
        question: body.question || body.questionText || "Practice Question",
        correctAnswer: body.correctAnswer || body.correctOption || body.correct || "",
        topic: body.topic || "Practice MCQ",
        subject: body.subject || "",
        difficulty: body.difficulty || ""
      };
    }

    const selectedAnswer = getSelectedAnswer(body);
    const correctAnswer = getCorrectAnswer(question) || body.correctAnswer || body.correctOption || "";
    const isCorrect =
      normalizeAnswer(selectedAnswer) &&
      normalizeAnswer(correctAnswer) &&
      normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

    const score = isCorrect ? 100 : 0;

    const attempt = await PracticeAttempt.create({
      userId: body.userId || "guest",
      questionId: mongoose.Types.ObjectId.isValid(questionId) ? questionId : undefined,
      question: getQuestionText(question),
      selectedAnswer,
      correctAnswer,
      isCorrect,
      score,
      topic: question.topic || question.subject || body.topic || "Practice MCQ",
      subject: question.subject || body.subject || "",
      difficulty: question.difficulty || body.difficulty || "",
      role: body.role || body.roleName || "",
      section: "Practice MCQs"
    });

    await Progress.create({
      userId: body.userId || "guest",
      section: "Practice MCQs",
      itemType: "MCQ Attempt",
      topic: question.topic || question.subject || getQuestionText(question),
      status: "submitted",
      score,
      role: body.role || body.roleName || "",
      difficulty: question.difficulty || body.difficulty || ""
    });

    return res.json({
      ok: true,
      message: "Practice attempt saved.",
      isCorrect,
      score,
      correctAnswer,
      attempt
    });
  } catch (err) {
    console.error("Practice attempt error:", err);
    return res.status(500).json({
      ok: false,
      message: "Practice attempt not saved.",
      error: err.message
    });
  }
}

router.post("/answer", saveAttempt);
router.post("/attempt", saveAttempt);

router.get("/summary", async (req, res) => {
  try {
    const total = await PracticeAttempt.countDocuments();
    const correct = await PracticeAttempt.countDocuments({ isCorrect: true });
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    return res.json({
      ok: true,
      total,
      correct,
      accuracy
    });
  } catch {
    return res.status(500).json({ ok: false, message: "Summary failed." });
  }
});

module.exports = router;
