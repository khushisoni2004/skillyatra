require("dotenv").config();

const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const csv = require("csv-parser");

const connectDB = require("../utils/db");
const PracticeQuestion = require("../models/PracticeQuestion");

const DATASET_DIR = path.join(__dirname, "datasets");

const APTITUDE_ZIPS = [
  "engineering_aptitude_questions.zip",
  "aptitude.zip",
  "mcqplacements.zip",
  "placement_nqt_mcq_questions.zip",
  "aptitude_for_placements.zip"
];

function safe(v = "") {
  return String(v ?? "").trim();
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && safe(row[key]) !== "") return row[key];
  }
  return "";
}

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

function extractZip(zipPath) {
  const outDir = zipPath.replace(/\.zip$/i, "_extracted");

  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  fs.mkdirSync(outDir, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outDir, true);

  return outDir;
}

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function loadRows(filePath) {
  if (/\.csv$/i.test(filePath)) return await parseCsv(filePath);

  if (/\.json$/i.test(filePath)) {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.questions)) return raw.questions;
    if (Array.isArray(raw.results)) return raw.results;
  }

  return [];
}

function parseOptions(row) {
  let options = [];

  const combined = pick(row, [
    "options",
    "Options",
    "choices",
    "Choices",
    "option",
    "Option"
  ]);

  if (combined) {
    try {
      const parsed = JSON.parse(combined);
      if (Array.isArray(parsed)) options = parsed.map(safe);
    } catch {
      options = String(combined)
        .split(/\||;|,/)
        .map(safe)
        .filter(Boolean);
    }
  }

  if (options.length < 4) {
    options = [
      pick(row, ["optionA", "OptionA", "Option A", "A", "a", "option_1", "option1", "1"]),
      pick(row, ["optionB", "OptionB", "Option B", "B", "b", "option_2", "option2", "2"]),
      pick(row, ["optionC", "OptionC", "Option C", "C", "c", "option_3", "option3", "3"]),
      pick(row, ["optionD", "OptionD", "Option D", "D", "d", "option_4", "option4", "4"])
    ]
      .map(safe)
      .filter(Boolean);
  }

  return [...new Set(options)].filter((x) => x.length > 0 && x.length < 400);
}

function normalizeAnswer(answer, options) {
  let a = safe(answer);
  if (!a) return "";

  const map = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3
  };

  const clean = a.replace(/^option\s*/i, "").trim().toUpperCase();

  if (map[clean] !== undefined && options[map[clean]]) {
    return options[map[clean]];
  }

  return a;
}

function inferAptitudeTopic(row, sourceDataset) {
  const text = [
    sourceDataset,
    pick(row, ["topic", "Topic"]),
    pick(row, ["category", "Category"]),
    pick(row, ["subject", "Subject"]),
    pick(row, ["section", "Section"]),
    pick(row, ["type", "Type"]),
    pick(row, ["question", "Question"])
  ]
    .join(" ")
    .toLowerCase();

  if (/percentage|profit|loss|interest|ratio|proportion|average|number|ages|time and work|time work|pipe|cistern|speed|distance|train|boat|mixture|alligation|permutation|combination|probability|mensuration|simple interest|compound interest/.test(text)) {
    return "Quantitative Aptitude";
  }

  if (/series|coding|decoding|blood relation|direction|seating|arrangement|syllogism|puzzle|analogy|classification|statement|assumption|conclusion|reasoning/.test(text)) {
    return "Logical Reasoning";
  }

  if (/grammar|sentence|synonym|antonym|reading|comprehension|vocabulary|idiom|phrase|para|verbal/.test(text)) {
    return "Verbal Ability";
  }

  if (/data interpretation|bar chart|pie chart|line graph|table|caselet|graph/.test(text)) {
    return "Data Interpretation";
  }

  if (/numerical/.test(text)) return "Numerical Ability";

  return "General Aptitude";
}

function inferDifficulty(row) {
  const d = safe(pick(row, ["difficulty", "Difficulty", "level", "Level"])).toLowerCase();

  if (d.includes("easy") || d.includes("beginner") || d.includes("basic")) return "Easy";
  if (d.includes("hard") || d.includes("advanced")) return "Hard";
  return "Medium";
}

function normalizeAptitudeRow(row, sourceDataset) {
  const question = safe(
    pick(row, [
      "question",
      "Question",
      "questions",
      "Questions",
      "problem",
      "Problem",
      "prompt",
      "Prompt",
      "title",
      "Title"
    ])
  );

  if (!question || question.length < 6 || question.length > 1000) return null;

  const options = parseOptions(row);
  if (options.length < 4) return null;

  const rawAnswer = pick(row, [
    "answer",
    "Answer",
    "correct_answer",
    "Correct Answer",
    "correctAnswer",
    "CorrectAnswer",
    "solution",
    "Solution",
    "ans",
    "Ans"
  ]);

  const correctAnswer = normalizeAnswer(rawAnswer, options);
  if (!correctAnswer) return null;

  const topic = inferAptitudeTopic(row, sourceDataset);

  return {
    question,
    options,
    correctAnswer,
    explanation:
      safe(
        pick(row, [
          "explanation",
          "Explanation",
          "solutionExplanation",
          "Solution Explanation",
          "rationale",
          "Rationale"
        ])
      ) || "Review the aptitude concept and compare all options carefully.",
    category: "Aptitude",
    subject: topic,
    topic,
    subTopic:
      safe(pick(row, ["subTopic", "SubTopic", "sub_topic", "Sub Topic"])) || topic,
    difficulty: inferDifficulty(row),
    type: "MCQ",
    sourceDataset,
    companyRelevance: ["TCS", "Infosys", "Wipro", "Accenture", "Capgemini", "Cognizant"],
    examRelevance: ["Placement", "NQT", "Campus", "Aptitude Test"],
    tags: ["Aptitude", topic, sourceDataset],
    lastVerifiedDate: new Date()
  };
}

async function main() {
  await connectDB();

  let inserted = 0;
  let duplicate = 0;
  let invalid = 0;

  const byTopic = {};
  const byDifficulty = {};
  const byDataset = {};

  const available = fs
    .readdirSync(DATASET_DIR)
    .filter((f) => f.toLowerCase().endsWith(".zip"));

  const selected = available.filter((file) =>
    APTITUDE_ZIPS.some((z) => z.toLowerCase() === file.toLowerCase()) ||
    file.toLowerCase().includes("aptitude")
  );

  console.log("Available ZIP files:", available);
  console.log("Selected aptitude ZIP files:", selected);

  for (const zipName of selected) {
    const zipPath = path.join(DATASET_DIR, zipName);

    console.log("\\nReading ZIP:", zipName);

    let extractedDir;
    try {
      extractedDir = extractZip(zipPath);
    } catch {
      console.log("Invalid ZIP skipped:", zipName);
      continue;
    }

    const dataFiles = walk(extractedDir).filter((f) => /\.(csv|json)$/i.test(f));
    console.log("Data files found:", dataFiles.length);

    for (const file of dataFiles) {
      let rows = [];

      try {
        rows = await loadRows(file);
      } catch {
        console.log("Could not read:", file);
        continue;
      }

      console.log("Rows found:", rows.length, "in", path.basename(file));

      for (const row of rows) {
        const normalized = normalizeAptitudeRow(row, zipName);

        if (!normalized) {
          invalid++;
          continue;
        }

        const exists = await PracticeQuestion.findOne({
          question: normalized.question,
          category: "Aptitude"
        });

        if (exists) {
          duplicate++;
          continue;
        }

        await PracticeQuestion.create(normalized);

        inserted++;
        byTopic[normalized.topic] = (byTopic[normalized.topic] || 0) + 1;
        byDifficulty[normalized.difficulty] = (byDifficulty[normalized.difficulty] || 0) + 1;
        byDataset[zipName] = (byDataset[zipName] || 0) + 1;
      }
    }
  }

  console.log("\\nAptitude dataset import completed");
  console.log("Inserted:", inserted);
  console.log("Duplicate skipped:", duplicate);
  console.log("Invalid skipped:", invalid);
  console.log("Count by topic:", byTopic);
  console.log("Count by difficulty:", byDifficulty);
  console.log("Count by dataset:", byDataset);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
