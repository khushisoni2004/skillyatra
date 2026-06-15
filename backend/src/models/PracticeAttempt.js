const mongoose = require("mongoose");

const PracticeAttemptSchema = new mongoose.Schema(
  {
    sessionId: { type: String, index: true },
    qid: { type: String, index: true },
    subject: String,
    topic: String,
    question: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeAttempt", PracticeAttemptSchema);
