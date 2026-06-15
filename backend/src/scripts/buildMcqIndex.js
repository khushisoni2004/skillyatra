const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { parse } = require("csv-parse/sync");
const XLSX = require("xlsx");

const DATASET_DIR = path.join(__dirname, "../data/datasets");
const OUTPUT = path.join(__dirname, "../data/mcqQuestionIndex.json");

function clean(v) {
  return String(v || "").replace(/\s+/g, " ").trim();
}

function pick(row, names) {
  const keys = Object.keys(row || {});
  for (const name of names) {
    const found = keys.find((k) => clean(k).toLowerCase() === clean(name).toLowerCase());
    if (found && clean(row[found])) return clean(row[found]);
  }

  for (const key of keys) {
    const k = clean(key).toLowerCase();
    if (names.some((n) => k.includes(clean(n).toLowerCase())) && clean(row[key])) {
      return clean(row[key]);
    }
  }

  return "";
}

function detectSubject(text) {
  const t = clean(text).toLowerCase();

  if (/react|hook|jsx|component|props|state/.test(t)) return "React";
  if (/node|express|api|backend|server|mongodb|mongo|sql|database/.test(t)) return "Backend";
  if (/python|java|c\+\+|javascript|program|code|array|string|loop/.test(t)) return "Programming";
  if (/dbms|os|operating system|network|oops|data structure|algorithm|dsa/.test(t)) return "Core CS";
  if (/average|percentage|profit|loss|ratio|time|speed|work|interest/.test(t)) return "Quantitative Aptitude";
  if (/series|blood|direction|coding decoding|reasoning|statement/.test(t)) return "Logical Reasoning";
  if (/grammar|synonym|antonym|sentence|comprehension|verbal/.test(t)) return "Verbal Ability";

  return "Placement / NQT";
}

function normalizeAnswer(ans, options) {
  const a = clean(ans).toLowerCase();

  if (["a", "1", "option a"].includes(a)) return "A";
  if (["b", "2", "option b"].includes(a)) return "B";
  if (["c", "3", "option c"].includes(a)) return "C";
  if (["d", "4", "option d"].includes(a)) return "D";

  const found = options.find((o) => clean(o.text).toLowerCase() === a);
  return found ? found.key : "";
}

function makeMcq(row, source) {
  const question = pick(row, [
    "question",
    "Question",
    "questions",
    "MCQ",
    "prompt",
    "Problem",
    "title"
  ]);

  const a = pick(row, ["A", "Option A", "option_a", "option1", "choice1", "a"]);
  const b = pick(row, ["B", "Option B", "option_b", "option2", "choice2", "b"]);
  const c = pick(row, ["C", "Option C", "option_c", "option3", "choice3", "c"]);
  const d = pick(row, ["D", "Option D", "option_d", "option4", "choice4", "d"]);

  const answerRaw = pick(row, [
    "answer",
    "Answer",
    "correct_answer",
    "Correct Answer",
    "correct",
    "Correct",
    "solution",
    "Solution"
  ]);

  if (!question || question.length < 8) return null;
  if (!a || !b || !c || !d) return null;

  const options = [
    { key: "A", text: a },
    { key: "B", text: b },
    { key: "C", text: c },
    { key: "D", text: d }
  ];

  const answer = normalizeAnswer(answerRaw, options);
  if (!answer) return null;

  const topic =
    pick(row, ["topic", "Topic", "category", "Category", "subject", "Subject"]) ||
    detectSubject(`${question} ${a} ${b} ${c} ${d}`);

  const subject = detectSubject(`${topic} ${question}`);

  return {
    id: `${source}-${Math.random().toString(36).slice(2, 10)}`,
    subject,
    topic,
    difficulty: pick(row, ["difficulty", "Difficulty", "level", "Level"]) || "Easy",
    question,
    options,
    answer,
    explanation: pick(row, ["explanation", "Explanation", "reason", "Reason"]) || "",
    sourceDataset: source
  };
}

function rowsFromBuffer(buffer, filename) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".csv")) {
    return parse(buffer.toString("utf8"), {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    });
  }

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }

  return [];
}

function build() {
  const files = fs.readdirSync(DATASET_DIR);
  const mcqs = [];

  for (const file of files) {
    const full = path.join(DATASET_DIR, file);
    const lower = file.toLowerCase();

    try {
      if (lower.endsWith(".zip")) {
        const zip = new AdmZip(full);

        for (const entry of zip.getEntries()) {
          const name = entry.entryName;
          const n = name.toLowerCase();

          if (!(n.endsWith(".csv") || n.endsWith(".xlsx") || n.endsWith(".xls"))) continue;

          const rows = rowsFromBuffer(entry.getData(), name);

          for (const row of rows) {
            const mcq = makeMcq(row, file);
            if (mcq) mcqs.push(mcq);
          }
        }
      } else if (lower.endsWith(".csv") || lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        const rows = rowsFromBuffer(fs.readFileSync(full), file);

        for (const row of rows) {
          const mcq = makeMcq(row, file);
          if (mcq) mcqs.push(mcq);
        }
      }
    } catch (err) {
      console.log("Skipped:", file, err.message);
    }
  }

  const seen = new Set();
  const unique = mcqs.filter((q) => {
    const key = q.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        totalQuestions: unique.length,
        questions: unique
      },
      null,
      2
    )
  );

  console.log("MCQ index created.");
  console.log("Total MCQs:", unique.length);
  console.log("Saved:", OUTPUT);
}

build();
