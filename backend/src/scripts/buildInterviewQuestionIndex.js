const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");

const DATASET_DIR = path.join(__dirname, "../data/datasets");
const OUTPUT_FILE = path.join(__dirname, "../data/interviewQuestionIndex.json");

function cleanText(value) {
  return String(value || "")
    .replace(/\uFEFF/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function norm(value) {
  return cleanText(value).toLowerCase();
}

function pick(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && cleanText(row[name])) {
      return cleanText(row[name]);
    }
  }

  const keys = Object.keys(row || {});
  for (const key of keys) {
    const k = norm(key).replace(/[_-]/g, " ");
    for (const name of names) {
      const n = norm(name).replace(/[_-]/g, " ");
      if (k === n || k.includes(n) || n.includes(k)) {
        if (cleanText(row[key])) return cleanText(row[key]);
      }
    }
  }

  return "";
}

function readCsv(buffer) {
  try {
    return parse(buffer.toString("utf8"), {
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

function readExcel(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const rows = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      rows.push(...XLSX.utils.sheet_to_json(sheet, { defval: "" }));
    }

    return rows;
  } catch {
    return [];
  }
}

function readAllRows() {
  if (!fs.existsSync(DATASET_DIR)) {
    throw new Error(`Dataset folder not found: ${DATASET_DIR}`);
  }

  const files = fs.readdirSync(DATASET_DIR);
  const allRows = [];

  for (const file of files) {
    const fullPath = path.join(DATASET_DIR, file);
    const lower = file.toLowerCase();

    console.log("Reading:", file);

    if (lower.endsWith(".csv")) {
      readCsv(fs.readFileSync(fullPath)).forEach((row) =>
        allRows.push({ row, source: file })
      );
    }

    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      readExcel(fs.readFileSync(fullPath)).forEach((row) =>
        allRows.push({ row, source: file })
      );
    }

    if (lower.endsWith(".zip")) {
      const zip = new AdmZip(fullPath);

      for (const entry of zip.getEntries()) {
        if (entry.isDirectory) continue;

        const entryName = entry.entryName.toLowerCase();
        const buffer = entry.getData();

        if (entryName.endsWith(".csv")) {
          readCsv(buffer).forEach((row) =>
            allRows.push({ row, source: `${file}/${entry.entryName}` })
          );
        }

        if (entryName.endsWith(".xlsx") || entryName.endsWith(".xls")) {
          readExcel(buffer).forEach((row) =>
            allRows.push({ row, source: `${file}/${entry.entryName}` })
          );
        }
      }
    }
  }

  return allRows;
}

function extractQuestion(row) {
  return pick(row, [
    "question",
    "Question",
    "questions",
    "Questions",
    "interview_question",
    "Interview Question",
    "prompt",
    "Prompt",
    "text",
    "Text"
  ]);
}

function extractAnswer(row) {
  return pick(row, [
    "answer",
    "Answer",
    "answers",
    "Answers",
    "ideal_answer",
    "Ideal Answer",
    "sample_answer",
    "Sample Answer",
    "response",
    "Response",
    "goodAnswer",
    "Good Answer"
  ]);
}

function detectType(question, source) {
  const t = norm(`${question} ${source}`);

  if (
    /tell me about|why should|strength|weakness|salary|relocate|conflict|team|hr|human resource|behavioral|behavioural/.test(
      t
    )
  ) {
    return "HR";
  }

  return "Technical";
}

function detectRole(row, source) {
  const raw = pick(row, [
    "role",
    "Role",
    "job_role",
    "Job Role",
    "job_title",
    "Job Title",
    "designation",
    "Designation",
    "category",
    "Category",
    "domain",
    "Domain"
  ]);

  if (raw) return raw;

  const s = norm(source);
  if (/software|engineering|developer|technical/.test(s)) return "Software";
  if (/hr/.test(s)) return "HR";

  return "General";
}

function detectDifficulty(row, question) {
  const raw = pick(row, ["difficulty", "Difficulty", "level", "Level"]);
  if (raw) return raw;

  const q = norm(question);

  if (/system design|architecture|scalability|distributed|microservices/.test(q)) {
    return "Advanced";
  }

  if (/explain|difference|implement|project|database|api|react|node|java|python/.test(q)) {
    return "Medium";
  }

  return "Basic";
}

function detectSkill(row, question, role) {
  const raw = pick(row, [
    "skill",
    "Skill",
    "skills",
    "Skills",
    "topic",
    "Topic",
    "subject",
    "Subject",
    "technology",
    "Technology",
    "tag",
    "Tag"
  ]);

  if (raw) return raw;

  const q = norm(`${question} ${role}`);

  const skills = [
    "React.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "SQL",
    "DBMS",
    "OOPs",
    "Data Structures",
    "Algorithms",
    "Operating System",
    "Computer Networks",
    "System Design",
    "REST API",
    "HTML",
    "CSS",
    "Redux",
    "Jest",
    "Unit Testing",
    "Git",
    "Java",
    "Python",
    "C++",
    "C#",
    ".NET Core",
    "Angular",
    "Machine Learning",
    "Pandas",
    "NumPy",
    "Power BI",
    "Excel"
  ];

  for (const skill of skills) {
    if (q.includes(norm(skill))) return skill;
  }

  return role || "General";
}

function buildIndex() {
  const rows = readAllRows();
  const questions = [];
  const seen = new Set();

  for (const item of rows) {
    const row = item.row;
    const source = item.source;

    const question = extractQuestion(row);
    if (!question || question.length < 10) continue;

    const key = norm(question);
    if (seen.has(key)) continue;
    seen.add(key);

    const goodAnswer = extractAnswer(row);
    const role = detectRole(row, source);
    const skill = detectSkill(row, question, role);
    const type = detectType(question, source);
    const difficulty = detectDifficulty(row, question);

    questions.push({
      id: `q_${questions.length + 1}`,
      question,
      goodAnswer,
      type,
      role,
      skill,
      difficulty,
      sourceDataset: source
    });
  }

  const index = {
    ok: true,
    generatedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    questions
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));

  console.log("Interview question index created.");
  console.log("Total questions:", questions.length);
  console.log("Saved:", OUTPUT_FILE);

  if (questions.length < 20) {
    console.log("WARNING: Very few questions found. Send dataset file list/output.");
  }
}

buildIndex();
