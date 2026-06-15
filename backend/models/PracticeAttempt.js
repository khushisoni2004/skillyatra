const mongoose = require("mongoose");

const practiceAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "guest" },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeQuestion" },
    question: { type: String, default: "" },
    selectedAnswer: { type: String, default: "" },
    correctAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    topic: { type: String, default: "Practice MCQ" },
    subject: { type: String, default: "" },
    difficulty: { type: String, default: "" },
    section: { type: String, default: "Practice MCQs" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeAttempt", practiceAttemptSchema);
