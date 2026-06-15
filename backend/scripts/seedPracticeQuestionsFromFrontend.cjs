const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const PracticeQuestion = require("../src/models/PracticeQuestion");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/skillyatra";

async function main() {
  const file = path.resolve(__dirname, "../../frontend/src/data/generatedMcqs.js");
  const text = fs.readFileSync(file, "utf8");

  const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
  if (!match) throw new Error("MCQ_QUESTIONS not found");

  const questions = JSON.parse(match[1]);

  await mongoose.connect(MONGO_URI);

  let upserted = 0;

  for (const q of questions) {
    await PracticeQuestion.updateOne(
      { qid: q.id },
      {
        $set: {
          qid: q.id,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer || q.answer,
          answer: q.answer || q.correctAnswer,
          explanation: q.explanation,
          sourceDataset: q.sourceDataset
        }
      },
      { upsert: true }
    );

    upserted++;
  }

  console.log("Seeded practice questions:", upserted);
  console.log("MongoDB:", MONGO_URI);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
