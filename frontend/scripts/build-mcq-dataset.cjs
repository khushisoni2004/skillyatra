const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");

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
  "Quantitative Aptitude": ["quant", "aptitude", "percentage", "profit", "loss", "ratio", "average", "time", "speed", "distance", "interest", "number", "algebra", "geometry", "mensuration", "mixture", "work", "pipe", "cistern"],
  "Logical Reasoning": ["reasoning", "logical", "series", "coding", "decoding", "blood", "direction", "seating", "puzzle", "analogy", "syllogism", "calendar", "clock"],
  "Verbal Ability": ["verbal", "english", "grammar", "synonym", "antonym", "sentence", "reading", "comprehension", "vocabulary", "error", "para", "cloze"],
  "Placement / NQT": ["placement", "nqt", "company", "tcs", "infosys", "wipro", "accenture", "cognizant", "job", "market", "prepmaster"],
  "Programming": ["programming", "coding", "code", "array", "string", "loop", "function", "recursion", "dsa", "algorithm", "leetcode", "codechef", "codeforces", "gfg", "java", "cpp", "c++"],
  "Core CS": ["dbms", "database", "operating system", "os", "oops", "oop", "computer network", "cn", "sql", "deadlock", "process", "thread", "normalization"],
  "Python": ["python", "list", "tuple", "dictionary", "pandas", "numpy", "flask", "django", "fastapi"],
  "Data Science": ["data science", "machine learning", "ml", "ai", "statistics", "probability", "regression", "classification", "clustering", "model", "eda"],
  "HR / Technical Interview": ["hr", "technical interview", "interview questions", "ideal answer", "tell me about yourself", "resume", "project explanation", "strength", "weakness"]
};

function text(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.map(text).join(" ");
  if (typeof v === "object") return Object.values(v).map(text).join(" ");
  return String(v);
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return row[k];
  }
  return "";
}

function detectSubject(row, source = "") {
  const direct = String(pick(row, ["subject", "Subject", "group", "Group", "category", "Category", "section", "Section"])).trim();
  const exact = GROUPS.find((g) => g.toLowerCase() === direct.toLowerCase());
  if (exact) return exact;

  const body = `${source} ${text(row)}`.toLowerCase();
  for (const g of GROUPS) {
    if (g === "All") continue;
    if ((KEYWORDS[g] || []).some((w) => body.includes(w.toLowerCase()))) return g;
  }
  return "Programming";
}

function parseOptions(row) {
  const keys = ["A", "B", "C", "D", "E", "F"];

  let raw =
    row.options || row.Options || row.choices || row.Choices || row.mcqOptions ||
    row.answerOptions || row.optionList || row.opts || [];

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = raw.split(/\||;|,/).map((x) => x.trim()).filter(Boolean);
    }
  }

  if (raw && !Array.isArray(raw) && typeof raw === "object") raw = Object.values(raw);

  if (!Array.isArray(raw) || raw.length === 0) {
    raw = [
      row.optionA, row.optionB, row.optionC, row.optionD, row.optionE,
      row.OptionA, row.OptionB, row.OptionC, row.OptionD, row.OptionE,
      row["Option A"], row["Option B"], row["Option C"], row["Option D"], row["Option E"],
      row.A, row.B, row.C, row.D, row.E,
      row.a, row.b, row.c, row.d, row.e
    ].filter(Boolean);
  }

  return raw.map((opt, i) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { key: keys[i] || String(i + 1), text: String(opt).trim() };
    }
    return {
      key: opt.key || opt.label || opt.id || keys[i] || String(i + 1),
      text: String(opt.text || opt.value || opt.option || opt.label || opt.name || "").trim()
    };
  }).filter((o) => o.text);
}

function parseAnswer(row, options) {
  const raw = pick(row, [
    "answer", "Answer", "correctAnswer", "CorrectAnswer", "correct_answer",
    "correct", "Correct", "solution", "Solution", "correctOption",
    "correct_option", "answerKey", "Answer Key", "Correct Answer"
  ]);

  const ans = String(raw || "").trim();
  if (!ans) return "";

  const byKey = options.find((o) => String(o.key).toLowerCase() === ans.toLowerCase());
  if (byKey) return byKey.key;

  const byText = options.find((o) => String(o.text).toLowerCase() === ans.toLowerCase());
  if (byText) return byText.key;

  if (/^[1-6]$/.test(ans) && options[Number(ans) - 1]) return options[Number(ans) - 1].key;

  return ans;
}

function normalize(row, index, source) {
  const options = parseOptions(row);
  const question = String(pick(row, [
    "question", "Question", "title", "Title", "problem", "Problem",
    "prompt", "Prompt", "text", "Text", "statement", "Statement",
    "questionText", "QuestionText", "Problem Statement"
  ])).trim();

  const subject = detectSubject(row, source);

  return {
    id: String(row.id || row.ID || row._id || row.qid || row.question_id || `${source}-${index}`),
    subject,
    topic: String(pick(row, ["topic", "Topic", "subtopic", "Subtopic", "category", "Category", "subject", "Subject"]) || subject),
    difficulty: String(pick(row, ["difficulty", "Difficulty", "level", "Level"]) || "Mixed"),
    question,
    options,
    correctAnswer: parseAnswer(row, options),
    explanation: String(pick(row, ["explanation", "Explanation", "solutionText", "reason", "description"]) || ""),
    sourceDataset: source
  };
}

function parseCsv(content) {
  try {
    return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true, bom: true });
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
    return [];
  }
}

function parseXlsxBuffer(buffer) {
  try {
    const wb = XLSX.read(buffer, { type: "buffer" });
    return wb.SheetNames.flatMap((name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" }));
  } catch {
    return [];
  }
}

function readOne(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file);
  let rows = [];

  try {
    if (ext === ".csv") rows = parseCsv(fs.readFileSync(file, "utf8"));
    else if (ext === ".json") rows = parseJson(fs.readFileSync(file, "utf8"));
    else if (ext === ".xlsx" || ext === ".xls") rows = parseXlsxBuffer(fs.readFileSync(file));
    else if (ext === ".txt") {
      const content = fs.readFileSync(file, "utf8");
      rows = [...parseJson(content), ...parseCsv(content)];
    } else if (ext === ".zip") {
      const zip = new AdmZip(file);
      for (const entry of zip.getEntries()) {
        if (entry.isDirectory) continue;
        const name = entry.entryName.toLowerCase();
        const source = `${base}/${path.basename(entry.entryName)}`;
        const buf = entry.getData();
        let inner = [];
        if (name.endsWith(".csv")) inner = parseCsv(buf.toString("utf8"));
        else if (name.endsWith(".json")) inner = parseJson(buf.toString("utf8"));
        else if (name.endsWith(".txt")) inner = [...parseJson(buf.toString("utf8")), ...parseCsv(buf.toString("utf8"))];
        else if (name.endsWith(".xlsx") || name.endsWith(".xls")) inner = parseXlsxBuffer(buf);
        rows.push(...inner.map((r) => ({ ...r, sourceDataset: source })));
      }
    }
  } catch (e) {
    console.log("Skipped:", base, e.message);
  }

  return rows.map((r) => ({ ...r, sourceDataset: r.sourceDataset || base }));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith(".") && e.name !== "node_modules") walk(full, out);
    } else if (/\.(zip|csv|json|txt|xlsx|xls)$/i.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

const roots = [
  path.resolve(process.cwd(), "../datasets"),
  path.resolve(process.cwd(), "datasets"),
  path.resolve(process.cwd(), "public/datasets"),
  path.resolve(process.cwd(), "../frontend/datasets"),
  path.resolve(process.cwd(), "../frontend/public/datasets"),
  path.resolve(process.cwd(), "../../datasets")
];

const files = [...new Set(roots.flatMap((r) => walk(r)))];

console.log("Dataset files found:", files.length);
files.forEach((f) => console.log("-", f));

const rows = files.flatMap(readOne);
console.log("Raw rows found:", rows.length);

const seen = new Set();
const questions = rows
  .map((row, i) => normalize(row, i, row.sourceDataset || "Dataset"))
  .filter((q) => q.question && q.options.length >= 2)
  .filter((q) => {
    const key = q.question.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

const counts = {};
GROUPS.forEach((g) => {
  counts[g] = g === "All" ? questions.length : questions.filter((q) => q.subject === g).length;
});

const out = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};\n\nexport const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};\n\nexport const MCQ_QUESTIONS = ${JSON.stringify(questions, null, 2)};\n`;

fs.writeFileSync(path.resolve(process.cwd(), "src/data/generatedMcqs.js"), out);

console.log("Generated MCQs:", questions.length);
console.log("Counts:", counts);
