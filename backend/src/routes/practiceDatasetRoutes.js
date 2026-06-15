const express = require("express");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");

const router = express.Router();

const DATASET_DIR = path.join(__dirname, "..", "data", "datasets");

const GROUPS = [
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

const KEYWORDS = {
  "Quantitative Aptitude": [
    "aptitude", "quant", "percentage", "profit", "loss", "ratio", "average",
    "time", "work", "speed", "distance", "interest", "number", "algebra",
    "geometry", "mensuration", "mixture", "pipe", "cistern"
  ],
  "Logical Reasoning": [
    "reasoning", "logical", "coding", "decoding", "series", "blood",
    "direction", "seating", "puzzle", "analogy", "syllogism", "calendar",
    "clock", "statement", "conclusion"
  ],
  "Verbal Ability": [
    "verbal", "english", "grammar", "synonym", "antonym", "sentence",
    "reading", "comprehension", "vocabulary", "error", "para", "cloze"
  ],
  "Placement / NQT": [
    "placement", "nqt", "prepmaster", "tcs", "infosys", "wipro",
    "accenture", "cognizant", "job", "market", "company"
  ],
  "Programming": [
    "programming", "code", "coding", "array", "string", "loop", "function",
    "recursion", "dsa", "algorithm", "data structure", "leetcode",
    "codechef", "codeforces", "gfg", "java", "cpp", "c++", "c language"
  ],
  "Core CS": [
    "computer science", "theory", "dbms", "database", "operating system",
    "os", "oops", "oop", "computer network", "network", "sql", "deadlock",
    "process", "thread", "normalization", "compiler"
  ],
  "Python": [
    "python", "pandas", "numpy", "list", "tuple", "dictionary", "set",
    "flask", "django", "fastapi"
  ],
  "Data Science": [
    "data science", "machine learning", "ml", "ai", "statistics",
    "probability", "regression", "classification", "clustering", "model",
    "eda"
  ],
  "HR / Technical Interview": [
    "hr", "interview", "technical interview", "ideal answer",
    "tell me about yourself", "resume", "project", "strength", "weakness"
  ]
};

function toText(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(toText).join(" ");
  if (typeof value === "object") return Object.values(value).map(toText).join(" ");
  return String(value);
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return "";
}

function detectGroup(row, sourceName = "") {
  const direct = String(
    pick(row, ["subject", "Subject", "group", "Group", "category", "Category", "section", "Section", "topic", "Topic"])
  ).trim();

  const exact = GROUPS.find((g) => g.toLowerCase() === direct.toLowerCase());
  if (exact) return exact;

  const text = `${sourceName} ${toText(row)}`.toLowerCase();

  for (const group of GROUPS) {
    if (group === "All") continue;
    if ((KEYWORDS[group] || []).some((word) => text.includes(word.toLowerCase()))) {
      return group;
    }
  }

  return "Programming";
}

function parseOptions(row) {
  const keys = ["A", "B", "C", "D", "E", "F"];

  let raw =
    row.options || row.Options || row.choices || row.Choices ||
    row.mcqOptions || row.answerOptions || row.optionList || row.opts || [];

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = raw.split(/\||;|\n/).map((x) => x.trim()).filter(Boolean);
    }
  }

  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    raw = Object.values(raw);
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    raw = [
      row.optionA, row.optionB, row.optionC, row.optionD, row.optionE,
      row.OptionA, row.OptionB, row.OptionC, row.OptionD, row.OptionE,
      row["Option A"], row["Option B"], row["Option C"], row["Option D"], row["Option E"],
      row.A, row.B, row.C, row.D, row.E,
      row.a, row.b, row.c, row.d, row.e
    ].filter(Boolean);
  }

  return raw
    .map((option, index) => {
      if (typeof option === "string" || typeof option === "number") {
        return {
          key: keys[index] || String(index + 1),
          text: String(option).trim()
        };
      }

      return {
        key: option.key || option.label || option.id || keys[index] || String(index + 1),
        text: String(option.text || option.value || option.option || option.label || option.name || "").trim()
      };
    })
    .filter((option) => option.text);
}

function parseAnswer(row, options) {
  const raw = pick(row, [
    "answer", "Answer", "correctAnswer", "CorrectAnswer", "correct_answer",
    "correct", "Correct", "solution", "Solution", "correctOption",
    "correct_option", "answerKey", "Answer Key", "Correct Answer"
  ]);

  const answer = String(raw || "").trim();
  if (!answer) return "";

  const byKey = options.find((o) => String(o.key).toLowerCase() === answer.toLowerCase());
  if (byKey) return byKey.key;

  const byText = options.find((o) => String(o.text).toLowerCase() === answer.toLowerCase());
  if (byText) return byText.key;

  if (/^[1-6]$/.test(answer) && options[Number(answer) - 1]) {
    return options[Number(answer) - 1].key;
  }

  return answer;
}

function normalizeRow(row, index, sourceName) {
  const options = parseOptions(row);

  const question = String(
    pick(row, [
      "question", "Question", "title", "Title", "problem", "Problem",
      "prompt", "Prompt", "text", "Text", "statement", "Statement",
      "questionText", "QuestionText", "Problem Statement"
    ])
  ).trim();

  const subject = detectGroup(row, sourceName);
  const correctAnswer = parseAnswer(row, options);

  return {
    id: String(row.id || row.ID || row._id || row.qid || row.question_id || `${sourceName}-${index}`),
    subject,
    topic: String(pick(row, ["topic", "Topic", "subtopic", "Subtopic", "category", "Category"]) || subject),
    difficulty: String(pick(row, ["difficulty", "Difficulty", "level", "Level"]) || "Mixed"),
    question,
    options,
    correctAnswer,
    answer: correctAnswer,
    explanation: String(pick(row, ["explanation", "Explanation", "solutionText", "reason", "description"]) || ""),
    sourceDataset: sourceName
  };
}

function parseCsv(content) {
  try {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true
    });
  } catch {
    return [];
  }
}

function parseJson(content) {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.questions)) return parsed.questions;
    if (Array.isArray(parsed.data)) return parsed.data;
    if (Array.isArray(parsed.items)) return parsed.items;
    return [];
  } catch {
    const lines = content.split("\n").map((x) => x.trim()).filter(Boolean);
    const rows = [];
    for (const line of lines) {
      try {
        rows.push(JSON.parse(line));
      } catch {}
    }
    return rows;
  }
}

function parseXlsx(buffer) {
  try {
    const wb = XLSX.read(buffer, { type: "buffer" });
    return wb.SheetNames.flatMap((name) =>
      XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" })
    );
  } catch {
    return [];
  }
}

function readZip(filePath) {
  const rows = [];
  const zipName = path.basename(filePath);

  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const lower = entry.entryName.toLowerCase();
      const sourceName = `${zipName}/${path.basename(entry.entryName)}`;
      const buffer = entry.getData();

      if (lower.endsWith(".csv")) {
        rows.push(...parseCsv(buffer.toString("utf8")).map((r) => ({ ...r, sourceDataset: sourceName })));
      } else if (lower.endsWith(".json")) {
        rows.push(...parseJson(buffer.toString("utf8")).map((r) => ({ ...r, sourceDataset: sourceName })));
      } else if (lower.endsWith(".txt")) {
        const text = buffer.toString("utf8");
        rows.push(...parseJson(text).map((r) => ({ ...r, sourceDataset: sourceName })));
        rows.push(...parseCsv(text).map((r) => ({ ...r, sourceDataset: sourceName })));
      } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        rows.push(...parseXlsx(buffer).map((r) => ({ ...r, sourceDataset: sourceName })));
      }
    }
  } catch (error) {
    console.warn("ZIP skipped:", zipName, error.message);
  }

  return rows;
}

function readAllRows() {
  if (!fs.existsSync(DATASET_DIR)) return [];

  const files = fs
    .readdirSync(DATASET_DIR)
    .filter((file) => /\.(zip|csv|json|xlsx|xls|txt)$/i.test(file))
    .map((file) => path.join(DATASET_DIR, file));

  let rows = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file);

    if (ext === ".zip") rows.push(...readZip(file));
    else if (ext === ".csv") rows.push(...parseCsv(fs.readFileSync(file, "utf8")).map((r) => ({ ...r, sourceDataset: name })));
    else if (ext === ".json") rows.push(...parseJson(fs.readFileSync(file, "utf8")).map((r) => ({ ...r, sourceDataset: name })));
    else if (ext === ".txt") {
      const text = fs.readFileSync(file, "utf8");
      rows.push(...parseJson(text).map((r) => ({ ...r, sourceDataset: name })));
      rows.push(...parseCsv(text).map((r) => ({ ...r, sourceDataset: name })));
    } else if (ext === ".xlsx" || ext === ".xls") {
      rows.push(...parseXlsx(fs.readFileSync(file)).map((r) => ({ ...r, sourceDataset: name })));
    }
  }

  return rows;
}

function getAllQuestions() {
  const rows = readAllRows();
  const seen = new Set();

  return rows
    .map((row, index) => normalizeRow(row, index, row.sourceDataset || "Dataset"))
    .filter((q) => q.question && q.options.length >= 2)
    .filter((q) => {
      const key = q.question.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

router.get("/debug", (req, res) => {
  const files = fs.existsSync(DATASET_DIR) ? fs.readdirSync(DATASET_DIR) : [];
  const rows = readAllRows();
  const questions = getAllQuestions();

  res.json({
    ok: true,
    datasetDir: DATASET_DIR,
    files,
    rawRows: rows.length,
    validMcqs: questions.length,
    sample: questions.slice(0, 3)
  });
});

router.get("/questions", (req, res) => {
  try {
    const group = req.query.group || req.query.subject || "All";
    const search = String(req.query.search || "").toLowerCase().trim();
    const limit = Math.min(Number(req.query.limit || 1500), 5000);

    let questions = getAllQuestions();

    const counts = {};
    GROUPS.forEach((g) => {
      counts[g] = g === "All" ? questions.length : questions.filter((q) => q.subject === g).length;
    });

    if (group && group !== "All" && group !== "all") {
      questions = questions.filter((q) => q.subject === group);
    }

    if (search) {
      questions = questions.filter((q) =>
        [q.question, q.subject, q.topic, q.difficulty, q.sourceDataset]
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    res.json({
      ok: true,
      groups: GROUPS,
      subjects: counts,
      counts,
      total: questions.length,
      questions: questions.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message || "Practice MCQs not loaded."
    });
  }
});

router.post("/answer", (req, res) => {
  const { id, selected } = req.body || {};
  const q = getAllQuestions().find((item) => String(item.id) === String(id));

  if (!q) return res.status(404).json({ ok: false, message: "Question not found." });

  const isCorrect = String(q.correctAnswer).toLowerCase() === String(selected).toLowerCase();

  res.json({
    ok: true,
    id,
    selected,
    correctAnswer: q.correctAnswer,
    isCorrect,
    explanation: q.explanation
  });
});

module.exports = router;
