const mongoose = require("mongoose");

const PracticeQuestionSchema = new mongoose.Schema(
  {
    qid: { type: String, unique: true, index: true },
    subject: String,
    topic: String,
    difficulty: String,
    question: String,
    options: Array,
    correctAnswer: String,
    answer: String,
    explanation: String,
    sourceDataset: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeQuestion", PracticeQuestionSchema);
