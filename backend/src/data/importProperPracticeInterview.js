require("dotenv").config();
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { parse } = require("csv-parse/sync");
const mongoose = require("mongoose");

const DATASET_DIR = path.join(__dirname, "datasets");

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
      return String(row[k]).trim();
    }
  }
  return "";
}

function clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function normalizeAnswer(ans, options) {
  ans = clean(ans);

  if (!ans) return "";

  const lower = ans.toLowerCase();

  if (["a", "option a", "1"].includes(lower)) return options[0] || ans;
  if (["b", "option b", "2"].includes(lower)) return options[1] || ans;
  if (["c", "option c", "3"].includes(lower)) return options[2] || ans;
  if (["d", "option d", "4"].includes(lower)) return options[3] || ans;

  for (const opt of options) {
    if (clean(opt).toLowerCase() === lower) return opt;
  }

  return ans;
}

function inferDifficulty(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("easy")) return "Easy";
  if (t.includes("hard")) return "Hard";
  return "Medium";
}

function inferAptitudeTopic(text) {
  const t = String(text || "").toLowerCase();

  if (/profit|loss|percentage|percent|ratio|average|interest|time|work|speed|distance|pipe|cistern|number|simplification|mensuration|algebra/.test(t)) {
    return "Quantitative Aptitude";
  }

  if (/reasoning|series|coding|decoding|blood|relation|direction|ranking|puzzle|syllogism|arrangement/.test(t)) {
    return "Logical Reasoning";
  }

  if (/grammar|sentence|synonym|antonym|verbal|reading|comprehension|para|vocabulary/.test(t)) {
    return "Verbal Ability";
  }

  if (/chart|table|data interpretation|pie|bar graph/.test(t)) {
    return "Data Interpretation";
  }

  return "General Aptitude";
}

function isAptitudeZip(name) {
  const n = name.toLowerCase();
  return (
    n.includes("aptitude") ||
    n.includes("mcqplacement") ||
    n.includes("placement_nqt") ||
    n.includes("nqt")
  );
}

function isInterviewZip(name) {
  const n = name.toLowerCase();
  return (
    n.includes("interview") ||
    n.includes("hr") ||
    n.includes("technical") ||
    n.includes("software")
  );
}

function readZipDataFiles(zipPath) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const rows = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const fileName = entry.entryName;
    const lower = fileName.toLowerCase();

    if (!lower.endsWith(".csv") && !lower.endsWith(".json")) continue;

    try {
      const content = entry.getData().toString("utf8");

      if (lower.endsWith(".csv")) {
        const parsed = parse(content, {
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true,
          bom: true
        });

        parsed.forEach((r) => rows.push({ row: r, fileName }));
      }

      if (lower.endsWith(".json")) {
        const json = JSON.parse(content);
        const arr = Array.isArray(json) ? json : json.data || json.questions || json.intents || [];

        if (Array.isArray(arr)) {
          arr.forEach((r) => rows.push({ row: r, fileName }));
        }
      }
    } catch (e) {
      console.log("Skipped unreadable file:", fileName);
    }
  }

  return rows;
}

function makePractice(row, sourceDataset, fileName) {
  const question = clean(
    pick(row, [
      "question",
      "Question",
      "QUESTION",
      "questions",
      "Questions",
      "title",
      "Title",
      "prompt",
      "Prompt",
      "Problem",
      "problem"
    ])
  );

  const options = [
    pick(row, ["optionA", "OptionA", "option_a", "Option A", "A", "a", "choice1", "Choice1", "option1", "Option1"]),
    pick(row, ["optionB", "OptionB", "option_b", "Option B", "B", "b", "choice2", "Choice2", "option2", "Option2"]),
    pick(row, ["optionC", "OptionC", "option_c", "Option C", "C", "c", "choice3", "Choice3", "option3", "Option3"]),
    pick(row, ["optionD", "OptionD", "option_d", "Option D", "D", "d", "choice4", "Choice4", "option4", "Option4"])
  ].map(clean).filter(Boolean);

  let rawOptions = pick(row, ["options", "Options", "choices", "Choices"]);
  if (options.length < 4 && rawOptions) {
    const split = rawOptions
      .replace(/^\[|\]$/g, "")
      .split(/\||,|;/)
      .map(clean)
      .filter(Boolean);

    if (split.length >= 4) {
      options.splice(0, options.length, ...split.slice(0, 4));
    }
  }

  const rawAnswer = pick(row, [
    "correctAnswer",
    "CorrectAnswer",
    "correct_answer",
    "Correct Answer",
    "answer",
    "Answer",
    "ANSWER",
    "correct",
    "Correct",
    "solution",
    "Solution"
  ]);

  const correctAnswer = normalizeAnswer(rawAnswer, options);

  if (!question || options.length < 4 || !correctAnswer) return null;

  const allText = `${question} ${sourceDataset} ${fileName}`;

  return {
    question,
    options: options.slice(0, 4),
    correctAnswer,
    explanation: pick(row, ["explanation", "Explanation", "solutionExplanation", "Solution Explanation", "reason"]) || "Explanation is not available in dataset.",
    category: "Aptitude",
    subject: "Aptitude",
    topic: pick(row, ["topic", "Topic", "subject", "Subject", "category", "Category"]) || inferAptitudeTopic(allText),
    difficulty: pick(row, ["difficulty", "Difficulty", "level", "Level"]) || inferDifficulty(allText),
    sourceDataset,
    createdAt: new Date()
  };
}

function makeInterview(row, sourceDataset, fileName) {
  const question = clean(
    pick(row, [
      "question",
      "Question",
      "QUESTION",
      "questions",
      "Questions",
      "interview_question",
      "Interview Question",
      "prompt",
      "Prompt",
      "title",
      "Title"
    ])
  );

  const answer = clean(
    pick(row, [
      "answer",
      "Answer",
      "ANSWER",
      "ideal_answer",
      "Ideal Answer",
      "goodAnswer",
      "Good Answer",
      "sample_answer",
      "Sample Answer",
      "response",
      "Response"
    ])
  );

  if (!question || question.length < 8) return null;

  const text = `${question} ${answer} ${sourceDataset} ${fileName}`.toLowerCase();

  let type = "Technical";

  if (
    text.includes("hr") ||
    text.includes("tell me about yourself") ||
    text.includes("strength") ||
    text.includes("weakness") ||
    text.includes("why should we hire") ||
    text.includes("salary") ||
    text.includes("relocate")
  ) {
    type = "HR";
  }

  return {
    question,
    goodAnswer: answer || "Answer using STAR format: Situation, Task, Action, Result.",
    answerFormat: "Answer like a real interview: concept, explanation, project/example, and final impact.",
    type,
    role: pick(row, ["role", "Role", "job_role", "Job Role", "domain", "Domain"]) || "General",
    difficulty: pick(row, ["difficulty", "Difficulty", "level", "Level"]) || "Medium",
    sourceDataset,
    tags: [],
    createdAt: new Date()
  };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected:", mongoose.connection.name);

  const db = mongoose.connection.db;

  const files = fs.readdirSync(DATASET_DIR).filter((f) => f.toLowerCase().endsWith(".zip"));

  console.log("ZIP files found:", files.length);

  const practice = [];
  const interview = [];
  const seenPractice = new Set();
  const seenInterview = new Set();

  for (const file of files) {
    const zipPath = path.join(DATASET_DIR, file);

    if (isAptitudeZip(file)) {
      console.log("Reading aptitude:", file);
      const rows = readZipDataFiles(zipPath);

      for (const item of rows) {
        const q = makePractice(item.row, file, item.fileName);
        if (!q) continue;

        const key = q.question.toLowerCase();
        if (seenPractice.has(key)) continue;

        seenPractice.add(key);
        practice.push(q);
      }
    }

    if (isInterviewZip(file)) {
      console.log("Reading interview:", file);
      const rows = readZipDataFiles(zipPath);

      for (const item of rows) {
        const q = makeInterview(item.row, file, item.fileName);
        if (!q) continue;

        const key = q.question.toLowerCase();
        if (seenInterview.has(key)) continue;

        seenInterview.add(key);
        interview.push(q);
      }
    }
  }

  console.log("Prepared practice MCQs:", practice.length);
  console.log("Prepared interview questions:", interview.length);

  await db.collection("practicequestions").deleteMany({});
  await db.collection("interviewquestions").deleteMany({});

  if (practice.length) {
    await db.collection("practicequestions").insertMany(practice, { ordered: false });
  }

  if (interview.length) {
    await db.collection("interviewquestions").insertMany(interview, { ordered: false });
  }

  console.log("Inserted practicequestions:", await db.collection("practicequestions").countDocuments());
  console.log("Inserted interviewquestions:", await db.collection("interviewquestions").countDocuments());
  console.log("Interview type counts:");
  console.log("HR:", await db.collection("interviewquestions").countDocuments({ type: "HR" }));
  console.log("Technical:", await db.collection("interviewquestions").countDocuments({ type: "Technical" }));

  await mongoose.disconnect();
})();
