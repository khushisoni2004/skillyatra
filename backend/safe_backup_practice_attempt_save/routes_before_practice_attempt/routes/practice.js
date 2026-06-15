const express = require("express");
const PracticeQuestion = require("../models/PracticeQuestion");
const PracticeAttempt = require("../models/PracticeAttempt");
const Progress = require("../models/Progress");

const router = express.Router();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getQuestionText(q) {
  return (
    q.question ||
    q.questionText ||
    q.title ||
    q.problem ||
    q.prompt ||
    "Practice Question"
  );
}

function getCorrectAnswer(q) {
  return (
    q.correctAnswer ||
    q.answer ||
    q.correct_option ||
    q.correctOption ||
    q.solution ||
    ""
  );
}

function getSelectedAnswer(body) {
  return (
    body.selectedAnswer ||
    body.selectedOption ||
    body.answer ||
    body.userAnswer ||
    body.option ||
    ""
  );
}

router.get("/questions", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 300);
    const search = String(req.query.search || "").trim();
    const topic = String(req.query.topic || "").trim();
    const difficulty = String(req.query.difficulty || "").trim();

    const filter = {};

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { questionText: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } }
      ];
    }

    if (topic) filter.topic = { $regex: topic, $options: "i" };
    if (difficulty) filter.difficulty = { $regex: difficulty, $options: "i" };

    const questions = await PracticeQuestion.find(filter).limit(limit).lean();
    return res.json(questions);
  } catch (err) {
    console.error("Practice questions error:", err);
    return res.status(500).json({ ok: false, message: "Practice questions not loaded." });
  }
});

router.post("/answer", async (req, res) => {
  try {
    const body = req.body || {};
    const questionId = body.questionId || body._id || body.id;

    if (!questionId) {
      return res.status(400).json({ ok: false, message: "questionId is required." });
    }

    const question = await PracticeQuestion.findById(questionId).lean();

    if (!question) {
      return res.status(404).json({ ok: false, message: "Question not found." });
    }

    const selectedAnswer = getSelectedAnswer(body);
    const correctAnswer = getCorrectAnswer(question);

    const isCorrect =
      normalize(selectedAnswer) &&
      normalize(correctAnswer) &&
      normalize(selectedAnswer) === normalize(correctAnswer);

    const score = isCorrect ? 100 : 0;

    const attempt = await PracticeAttempt.create({
      userId: body.userId || "guest",
      questionId,
      question: getQuestionText(question),
      selectedAnswer,
      correctAnswer,
      isCorrect,
      score,
      topic: question.topic || question.subject || "Practice MCQ",
      subject: question.subject || "",
      difficulty: question.difficulty || "",
      section: "Practice MCQs"
    });

    await Progress.create({
      userId: body.userId || "guest",
      section: "Practice MCQs",
      itemType: "MCQ Attempt",
      topic: question.topic || getQuestionText(question),
      status: "submitted",
      score,
      difficulty: question.difficulty || ""
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
    console.error("Practice answer error:", err);
    return res.status(500).json({ ok: false, message: "Practice attempt not saved." });
  }
});

module.exports = router;
