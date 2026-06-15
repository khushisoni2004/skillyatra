const express = require("express");
const router = express.Router();

let PracticeQuestion = null;
let InterviewQuestion = null;

try {
  PracticeQuestion = require("../models/PracticeQuestion");
} catch {}

try {
  InterviewQuestion = require("../models/InterviewQuestion");
} catch {}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function getValue(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && clean(row[key])) return clean(row[key]);
  }
  return "";
}

function getOptions(row) {
  let options = [];

  if (Array.isArray(row.options)) options = row.options;
  else if (Array.isArray(row.Options)) options = row.Options;
  else if (Array.isArray(row.choices)) options = row.choices;
  else if (Array.isArray(row.Choices)) options = row.Choices;
  else {
    options = [
      row.optionA, row.optionB, row.optionC, row.optionD,
      row.A, row.B, row.C, row.D,
      row.a, row.b, row.c, row.d,
      row.option_1, row.option_2, row.option_3, row.option_4,
      row.option1, row.option2, row.option3, row.option4,
      row.choice1, row.choice2, row.choice3, row.choice4
    ];
  }

  return options
    .map(clean)
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, 4);
}

function getQuestion(row) {
  return getValue(row, [
    "question",
    "Question",
    "question_text",
    "Question Text",
    "title",
    "Title",
    "prompt",
    "Prompt"
  ]);
}

function getAnswer(row) {
  return clean(
    getValue(row, [
      "answer",
      "Answer",
      "correctAnswer",
      "CorrectAnswer",
      "correct_answer",
      "Correct Answer",
      "correct",
      "Correct"
    ])
  )
    .replace(/^answer\s*[:\-]\s*/i, "")
    .replace(/^option\s*/i, "")
    .trim();
}

function baseText(row) {
  return lower([
    getQuestion(row),
    getValue(row, ["topic", "Topic"]),
    getValue(row, ["subtopic", "Subtopic"]),
    getValue(row, ["subject", "Subject"]),
    getValue(row, ["source", "Source"]),
    getValue(row, ["dataset", "Dataset"]),
    getValue(row, ["file", "File"])
  ].join(" "));
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function classifyCategory(row) {
  const text = baseText(row);

  const reactWords = [
    "react", "jsx", "useeffect", "usestate", "usememo", "useref", "usereducer",
    "react hook", "hooks", "props", "component", "virtual dom", "react router",
    "redux", "context api", "controlled component", "uncontrolled component"
  ];

  const backendWords = [
    "backend", "node.js", "node ", "express", "rest api", "api endpoint",
    "http status", "middleware", "jwt", "authentication", "authorization",
    "bcrypt", "cors", "server", "mongodb", "mongoose", "postman",
    "request body", "response json", "route handler"
  ];

  const verbalWords = [
    "verbal", "english", "grammar", "synonym", "antonym", "vocabulary",
    "sentence correction", "sentence completion", "reading comprehension",
    "comprehension", "idiom", "phrase", "para jumble", "one word"
  ];

  const logicalWords = [
    "logical reasoning", "reasoning", "number series", "letter series",
    "mixed series", "blood relation", "direction sense", "coding decoding",
    "coding-decoding", "syllogism", "seating arrangement", "puzzle",
    "analogy", "classification", "odd one", "clock hands", "calendar",
    "circular arrangement", "arrangement"
  ];

  const aptitudeWords = [
    "quantitative", "aptitude", "numerical", "percentage", "percent",
    "profit", "loss", "ratio", "proportion", "average", "simple interest",
    "compound interest", "time and work", "work and time", "speed",
    "distance", "train", "boat", "stream", "pipe", "cistern",
    "mensuration", "area", "volume", "permutation", "combination",
    "probability", "ages", "mixture", "allegation", "salary", "discount",
    "marked price", "cost price", "selling price"
  ];

  const coreWords = [
    "dbms", "database management", "normalization", "transaction",
    "operating system", " os ", "process scheduling", "deadlock",
    "disk scheduling", "dma", "memory management", "paging", "kernel",
    "computer network", "networking", "tcp", "ip address", "subnet",
    "osi", "http", "compiler", "software engineering", "sdlc",
    "data structure", "algorithm", "microprocessor", "interrupt",
    "cache memory", "machine learning", "neural network", "regression",
    "classification", "training", "testing", "vc dimension",
    "bias-variance", "sgd", "backpropagation", "generalization",
    "confusion matrix", "pca", "arima", "time series", "terraform",
    "kubernetes", "k8s", "git hook", "webhook"
  ];

  const programmingWords = [
    "programming", "coding", "python", "java ", "c++", "javascript",
    "array", "string", "loop", "function", "recursion", "oops",
    "object oriented", "class", "inheritance", "polymorphism",
    "exception", "decorator", "generator", "list", "tuple", "dictionary"
  ];

  const placementWords = [
    "placement", "nqt", "tcs", "wipro", "infosys", "accenture",
    "cognizant", "capgemini", "campus", "company", "interview quiz"
  ];

  if (hasAny(text, reactWords)) return "React";
  if (hasAny(text, backendWords)) return "Backend";
  if (hasAny(text, verbalWords)) return "Verbal Ability";
  if (hasAny(text, logicalWords)) return "Logical Reasoning";
  if (hasAny(text, aptitudeWords)) return "Quantitative Aptitude";
  if (hasAny(text, coreWords)) return "Core CS";
  if (hasAny(text, programmingWords)) return "Programming";
  if (hasAny(text, placementWords)) return "Placement / NQT";

  return "Placement / NQT";
}

function classifyTopic(row, category) {
  const rawTopic = clean(getValue(row, ["topic", "Topic", "subtopic", "Subtopic", "subject", "Subject"]));
  const text = baseText(row);

  if (category === "Quantitative Aptitude") {
    if (text.includes("percentage") || text.includes("percent")) return "Percentage";
    if (text.includes("profit") || text.includes("loss")) return "Profit and Loss";
    if (text.includes("ratio") || text.includes("proportion")) return "Ratio";
    if (text.includes("average")) return "Average";
    if (text.includes("time and work") || text.includes("work and time")) return "Time and Work";
    if (text.includes("speed") || text.includes("distance") || text.includes("train")) return "Speed Distance";
    if (text.includes("interest")) return "Interest";
    if (text.includes("mensuration") || text.includes("area") || text.includes("volume")) return "Mensuration";
    return rawTopic || "Quantitative Aptitude";
  }

  if (category === "Logical Reasoning") {
    if (text.includes("number series") || text.includes("letter series") || text.includes("series")) return "Series";
    if (text.includes("blood")) return "Blood Relation";
    if (text.includes("direction")) return "Direction Sense";
    if (text.includes("coding")) return "Coding Decoding";
    if (text.includes("syllogism")) return "Syllogism";
    if (text.includes("clock")) return "Clock";
    if (text.includes("calendar")) return "Calendar";
    if (text.includes("seating") || text.includes("arrangement")) return "Arrangement";
    return rawTopic || "Logical Reasoning";
  }

  if (category === "React") return "React";
  if (category === "Backend") return rawTopic || "Backend";
  if (category === "Verbal Ability") return rawTopic || "Verbal Ability";
  if (category === "Programming") return rawTopic || "Programming";
  if (category === "Core CS") return rawTopic || "Core CS";

  return rawTopic || category;
}

function isValidMCQ(row) {
  const question = getQuestion(row);
  const options = getOptions(row);
  const answer = getAnswer(row);

  if (!question || question.length < 6) return false;
  if (options.length < 2) return false;
  if (!answer) return false;

  return true;
}

function normalizeQuestion(row, index) {
  const category = classifyCategory(row);
  const topic = classifyTopic(row, category);

  return {
    id: String(row._id || row.id || row.question_id || `mcq-${index}`),
    question: getQuestion(row),
    options: getOptions(row),
    answer: getAnswer(row),
    category,
    topic,
    difficulty: getValue(row, ["difficulty", "Difficulty", "level", "Level"]) || "Easy",
    source: getValue(row, ["source", "Source", "dataset", "Dataset", "file", "File"]) || "Dataset"
  };
}

async function collect(Model) {
  if (!Model) return [];

  try {
    return await Model.find({}).limit(20000).lean();
  } catch {
    return [];
  }
}

router.get("/questions", async (req, res) => {
  try {
    const rows = [
      ...(await collect(PracticeQuestion)),
      ...(await collect(InterviewQuestion))
    ];

    const seen = new Set();

    const questions = rows
      .filter(isValidMCQ)
      .map(normalizeQuestion)
      .filter((item) => {
        const key = item.question.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const counts = {
      All: questions.length,
      Aptitude: questions.filter((q) => q.category === "Quantitative Aptitude").length,
      "Quantitative Aptitude": 0,
      "Logical Reasoning": 0,
      "Verbal Ability": 0,
      "Placement / NQT": 0,
      Programming: 0,
      React: 0,
      Backend: 0,
      "Core CS": 0
    };

    questions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });

    return res.json({
      ok: true,
      total: questions.length,
      counts,
      questions
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to load grouped MCQs.",
      error: err.message
    });
  }
});

module.exports = router;
