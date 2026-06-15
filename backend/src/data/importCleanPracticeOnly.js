require("dotenv").config();
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { parse } = require("csv-parse/sync");
const mongoose = require("mongoose");

const DATASET_DIR = path.join(__dirname, "datasets");

const ALLOWED_ZIPS = [
  "prepmaster placement and interview quiz questions.zip",
  "dataset of programming questions and solutions tyagi586.zip",
  "computer science theory qa dataset.zip"
];

function clean(v) {
  return String(v || "").replace(/\s+/g, " ").trim();
}

function short(v) {
  const s = clean(v);
  return s.length > 160 ? s.slice(0, 157) + "..." : s;
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && clean(row[k]) !== "") {
      return clean(row[k]);
    }
  }
  return "";
}

function readZipRows(zipPath) {
  const zip = new AdmZip(zipPath);
  const rows = [];

  for (const entry of zip.getEntries()) {
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

        parsed.forEach((row) => rows.push({ row, fileName }));
      }

      if (lower.endsWith(".json")) {
        const json = JSON.parse(content);

        let arr = [];

        if (Array.isArray(json)) {
          arr = json;
        } else if (Array.isArray(json.data)) {
          arr = json.data;
        } else if (Array.isArray(json.questions)) {
          arr = json.questions;
        } else if (Array.isArray(json.items)) {
          arr = json.items;
        } else if (Array.isArray(json.intents)) {
          for (const intent of json.intents) {
            const tag = clean(intent.tag || intent.intent || intent.category || "Core CS");
            const patterns = Array.isArray(intent.patterns) ? intent.patterns : [];
            const responses = Array.isArray(intent.responses) ? intent.responses : [];

            for (const pattern of patterns) {
              rows.push({
                row: {
                  question: pattern,
                  answer: responses[0] || tag,
                  category: tag,
                  topic: tag,
                  subject: tag
                },
                fileName
              });
            }
          }

          continue;
        }

        arr.forEach((row) => rows.push({ row, fileName }));
      }
    } catch (err) {
      console.log("Skipped unreadable file:", fileName, err.message);
    }
  }

  return rows;
}

function getOptions(row) {
  let options = [
    pick(row, ["optionA", "OptionA", "option_a", "Option A", "A", "a", "choice1", "option1"]),
    pick(row, ["optionB", "OptionB", "option_b", "Option B", "B", "b", "choice2", "option2"]),
    pick(row, ["optionC", "OptionC", "option_c", "Option C", "C", "c", "choice3", "option3"]),
    pick(row, ["optionD", "OptionD", "option_d", "Option D", "D", "d", "choice4", "option4"])
  ].filter(Boolean);

  const raw = pick(row, ["options", "Options", "choices", "Choices"]);

  if (options.length < 4 && raw) {
    const split = raw
      .replace(/^\[|\]$/g, "")
      .replace(/["']/g, "")
      .split(/\||;|,/)
      .map(clean)
      .filter(Boolean);

    if (split.length >= 4) options = split.slice(0, 4);
  }

  return options.map(short).slice(0, 4);
}

function detect(text, sourceDataset) {
  const t = text.toLowerCase();

  if (sourceDataset.includes("computer science")) {
    if (/data structure|dsa|algorithm|array|stack|queue|tree|graph|linked list|sorting|searching|hashing/.test(t)) {
      return { category: "Core CS", topic: "DSA", language: "" };
    }

    if (/object oriented|oops|oop|class|inheritance|polymorphism|encapsulation|abstraction/.test(t)) {
      return { category: "Core CS", topic: "OOP", language: "" };
    }

    if (/dbms|database|sql|normalization|transaction|index|primary key|foreign key|join/.test(t)) {
      return { category: "Core CS", topic: "DBMS", language: "" };
    }

    if (/operating system|\bos\b|process|thread|deadlock|memory management|scheduling|semaphore/.test(t)) {
      return { category: "Core CS", topic: "OS", language: "" };
    }

    if (/computer network|\bcn\b|network|tcp|udp|ip address|osi|http|dns|routing/.test(t)) {
      return { category: "Core CS", topic: "CN", language: "" };
    }

    return { category: "Core CS", topic: "Core CS", language: "" };
  }

  if (/node|express|backend|server|api|mongodb|rest|jwt|middleware|route|controller/.test(t)) {
    return { category: "Backend", topic: "Backend", language: "Backend" };
  }

  if (/react|jsx|component|hook|props|state/.test(t)) {
    return { category: "Programming", topic: "React", language: "React" };
  }

  if (sourceDataset.includes("programming")) {
    if (/\bpython\b/.test(t)) return { category: "Programming", topic: "Python", language: "Python" };
    if (/\bjava\b/.test(t) && !/\bjavascript\b/.test(t)) return { category: "Programming", topic: "Java", language: "Java" };
    if (/\bc\+\+\b|\bcpp\b/.test(t)) return { category: "Programming", topic: "C++", language: "C++" };
    if (/\bc programming\b|\bc language\b/.test(t)) return { category: "Programming", topic: "C", language: "C" };
    if (/\bjavascript\b|\bjs\b/.test(t)) return { category: "Programming", topic: "JavaScript", language: "JavaScript" };
    return { category: "Programming", topic: "Programming", language: "General" };
  }

  if (/profit|loss|percentage|ratio|average|interest|speed|distance|time and work|mensuration|number system/.test(t)) {
    return { category: "Quantitative Aptitude", topic: "Quantitative Aptitude", language: "" };
  }

  if (/reasoning|series|blood relation|direction|puzzle|syllogism|arrangement|analogy|coding decoding/.test(t)) {
    return { category: "Logical Reasoning", topic: "Logical Reasoning", language: "" };
  }

  if (/verbal|grammar|sentence|synonym|antonym|vocabulary|comprehension|english/.test(t)) {
    return { category: "Verbal Ability", topic: "Verbal Ability", language: "" };
  }

  return { category: "Placement / NQT", topic: "Placement / NQT", language: "" };
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected:", mongoose.connection.name);

  const db = mongoose.connection.db;
  const rawQuestions = [];
  const answerPoolByCategory = {};

  for (const file of ALLOWED_ZIPS) {
    const zipPath = path.join(DATASET_DIR, file);

    if (!fs.existsSync(zipPath)) {
      console.log("Missing ZIP skipped:", file);
      continue;
    }

    console.log("Reading:", file);
    const rows = readZipRows(zipPath);
    console.log("Rows found:", rows.length);

    for (const item of rows) {
      const row = item.row;

      const question = pick(row, [
        "question", "Question", "QUESTION",
        "questions", "Questions",
        "title", "Title",
        "prompt", "Prompt",
        "problem", "Problem"
      ]);

      const answer = pick(row, [
        "correctAnswer", "CorrectAnswer",
        "correct_answer", "Correct Answer",
        "answer", "Answer", "ANSWER",
        "correct", "Correct",
        "solution", "Solution",
        "response", "Response"
      ]);

      if (!question || !answer) continue;
      if (question.length > 450) continue;

      const fullText = `${question} ${answer} ${item.fileName} ${file}`;
      const detected = detect(fullText, file.toLowerCase());

      if (!answerPoolByCategory[detected.category]) {
        answerPoolByCategory[detected.category] = [];
      }

      answerPoolByCategory[detected.category].push(short(answer));

      rawQuestions.push({
        row,
        question,
        answer: short(answer),
        detected,
        sourceDataset: file.toLowerCase()
      });
    }
  }

  const finalQuestions = [];
  const seen = new Set();

  for (const item of rawQuestions) {
    let options = getOptions(item.row);

    if (options.length < 4) {
      const pool = [...new Set(answerPoolByCategory[item.detected.category] || [])]
        .filter((x) => x && x !== item.answer);

      if (pool.length >= 3) {
        options = shuffle([item.answer, ...shuffle(pool).slice(0, 3)]);
      }
    }

    if (options.length < 4) continue;

    const key = item.question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    finalQuestions.push({
      question: item.question,
      options,
      correctAnswer: item.answer,
      explanation: item.answer,
      category: item.detected.category,
      subject: item.detected.category,
      topic: item.detected.topic,
      language: item.detected.language,
      difficulty: "Easy",
      sourceDataset: item.sourceDataset,
      createdAt: new Date()
    });
  }

  await db.collection("practicequestions").deleteMany({});

  if (finalQuestions.length) {
    await db.collection("practicequestions").insertMany(finalQuestions, { ordered: false });
  }

  console.log("Clean practice questions inserted:", await db.collection("practicequestions").countDocuments());

  console.log("Category counts:");
  console.table(await db.collection("practicequestions").aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray());

  console.log("Topic counts:");
  console.table(await db.collection("practicequestions").aggregate([
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray());

  await mongoose.disconnect();
})();
