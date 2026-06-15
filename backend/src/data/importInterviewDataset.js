require("dotenv").config();

const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const csv = require("csv-parser");

const connectDB = require("../utils/db");
const InterviewQuestion = require("../models/InterviewQuestion");

const DATASET_DIR = path.join(__dirname, "datasets");

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

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", row => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function extractZip(zipPath) {
  const outDir = zipPath.replace(/\.zip$/i, "_extracted");
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outDir, true);
  return outDir;
}

function isInterviewOrResumeZip(file) {
  const name = file.toLowerCase();

  return (
    name.includes("hr") ||
    name.includes("interview") ||
    name.includes("qa") ||
    name.includes("resume")
  );
}

function inferType(row, sourceDataset) {
  const text = [
    sourceDataset,
    pick(row, ["type", "Type"]),
    pick(row, ["category", "Category"]),
    pick(row, ["subject", "Subject"]),
    pick(row, ["domain", "Domain"]),
    pick(row, ["section", "Section"]),
    pick(row, ["topic", "Topic"])
  ].join(" ").toLowerCase();

  if (text.includes("hr") || text.includes("behavioral") || text.includes("behavioural")) {
    return "HR";
  }

  if (text.includes("resume")) {
    return "Resume";
  }

  return "Technical";
}

function inferRole(row) {
  return safe(
    pick(row, [
      "role",
      "Role",
      "job_role",
      "Job Role",
      "position",
      "Position",
      "job_title",
      "Job Title",
      "domain",
      "Domain",
      "category",
      "Category",
      "subject",
      "Subject"
    ])
  ) || "General";
}

function normalizeInterviewRow(row, sourceDataset) {
  const question = safe(
    pick(row, [
      "question",
      "Question",
      "questions",
      "Questions",
      "prompt",
      "Prompt",
      "interview_question",
      "Interview Question",
      "interview questions",
      "Interview Questions",
      "title",
      "Title",
      "Query",
      "query"
    ])
  );

  if (!question || question.length < 8 || question.length > 1200) return null;

  const goodAnswer = safe(
    pick(row, [
      "answer",
      "Answer",
      "ideal_answer",
      "Ideal Answer",
      "ideal answer",
      "Good Answer",
      "goodAnswer",
      "sample_answer",
      "Sample Answer",
      "response",
      "Response",
      "solution",
      "Solution",
      "accepted_answer",
      "Accepted Answer"
    ])
  );

  const type = inferType(row, sourceDataset);
  const role = inferRole(row);
  const difficulty = safe(pick(row, ["difficulty", "Difficulty", "level", "Level"])) || "Medium";
  const topic = safe(pick(row, ["topic", "Topic", "skill", "Skill", "technology", "Technology"])) || role;

  return {
    question,
    type,
    role,
    difficulty,
    answerFormat:
      safe(pick(row, ["answerFormat", "Answer Format", "format", "Format"])) ||
      "Use STAR format: Situation, Task, Action, Result.",
    badAnswer:
      safe(pick(row, ["badAnswer", "Bad Answer", "bad_answer", "Bad answer"])) ||
      "Short, vague, or unrelated answer.",
    goodAnswer:
      goodAnswer ||
      "Dataset has no ideal answer. Give a structured answer with concept, resume/project example, and result.",
    tips: [
      safe(pick(row, ["tips", "Tips"])) || "Be specific.",
      "Connect the answer with your resume or project.",
      "Add measurable result if possible."
    ],
    sourceDataset,
    tags: [type, role, difficulty, topic].filter(Boolean)
  };
}

async function loadRowsFromFile(filePath) {
  if (/\.csv$/i.test(filePath)) return await parseCsv(filePath);

  if (/\.json$/i.test(filePath)) {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.questions)) return raw.questions;
    if (Array.isArray(raw.results)) return raw.results;
    return [];
  }

  return [];
}

async function main() {
  await connectDB();

  let inserted = 0;
  let duplicate = 0;
  let invalid = 0;

  const byType = {};
  const byDataset = {};

  const availableZips = fs
    .readdirSync(DATASET_DIR)
    .filter(file => file.toLowerCase().endsWith(".zip"));

  const selectedZips = availableZips.filter(isInterviewOrResumeZip);

  console.log("Available ZIP files:", availableZips);
  console.log("Selected interview/resume ZIP files:", selectedZips);

  if (selectedZips.length === 0) {
    console.log("No interview/resume ZIP found.");
    process.exit(0);
  }

  for (const zipName of selectedZips) {
    const zipPath = path.join(DATASET_DIR, zipName);
    console.log("\\nReading ZIP:", zipName);

    let extractedDir;
    try {
      extractedDir = extractZip(zipPath);
    } catch (err) {
      console.log("Invalid ZIP skipped:", zipName);
      continue;
    }

    const dataFiles = walk(extractedDir).filter(file => /\.(csv|json)$/i.test(file));
    console.log("Data files found:", dataFiles.length);

    for (const file of dataFiles) {
      let rows = [];

      try {
        rows = await loadRowsFromFile(file);
      } catch {
        console.log("Could not read file:", file);
        continue;
      }

      console.log("Rows found:", rows.length, "in", path.basename(file));

      for (const row of rows) {
        const normalized = normalizeInterviewRow(row, zipName);

        if (!normalized) {
          invalid++;
          continue;
        }

        const exists = await InterviewQuestion.findOne({
          question: normalized.question,
          type: normalized.type
        });

        if (exists) {
          duplicate++;
          continue;
        }

        await InterviewQuestion.create(normalized);

        inserted++;
        byType[normalized.type] = (byType[normalized.type] || 0) + 1;
        byDataset[zipName] = (byDataset[zipName] || 0) + 1;
      }
    }
  }

  console.log("\\nInterview dataset import completed");
  console.log("Inserted:", inserted);
  console.log("Duplicate skipped:", duplicate);
  console.log("Invalid skipped:", invalid);
  console.log("Count by type:", byType);
  console.log("Count by dataset:", byDataset);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
