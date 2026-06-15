require("dotenv").config();

const fs = require("fs");
const path = require("path");
const os = require("os");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");
const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  process.env.ATLAS_URI;

if (!MONGO_URI) {
  console.error("❌ MongoDB URI missing in backend/.env");
  process.exit(1);
}

const DATASET_DIRS = [
  path.join(__dirname, "..", "src", "data", "datasets"),
  path.join(__dirname, "..", "src", "dta", "datasets"),
  path.join(__dirname, "..", "data", "datasets")
];

const MAX_PER_PLATFORM = 4000;

const TARGET_ZIPS = [
  "Leetcode dataset.zip",
  "GFG Problem Statements Dataset.zip",
  "Codeforces Code Dataset .zip",
  "codechef dataset.zip"
];

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizePlatform(value) {
  const v = normalize(value);

  if (v.includes("leetcode")) return "LeetCode";
  if (v.includes("geeksforgeeks") || v === "gfg") return "GeeksForGeeks";
  if (v.includes("codeforces")) return "Codeforces";
  if (v.includes("codechef")) return "CodeChef";

  return clean(value) || "Unknown";
}

function inferPlatform(fileName) {
  const v = normalize(fileName);

  if (v.includes("leetcode")) return "LeetCode";
  if (v.includes("gfg") || v.includes("geeksforgeeks")) return "GeeksForGeeks";
  if (v.includes("codeforces")) return "Codeforces";
  if (v.includes("codechef")) return "CodeChef";

  return "Unknown";
}

function normalizeDifficulty(value) {
  const v = normalize(value);

  if (v.includes("easy") || v === "800" || v === "900" || v === "1000") return "Easy";
  if (v.includes("medium") || v === "1100" || v === "1200" || v === "1300" || v === "1400" || v === "1500") return "Medium";
  if (v.includes("hard") || Number(v) >= 1600) return "Hard";

  return clean(value) || "Medium";
}

function normalizeTopic(value, fallback = "General") {
  const raw = clean(value);

  if (!raw) return fallback;

  const first = raw
    .split(/[,;|/]+/)
    .map((x) => clean(x))
    .filter(Boolean)[0];

  return first || fallback;
}

function getValue(row, names) {
  const keys = Object.keys(row || {});
  const map = new Map(keys.map((k) => [normalize(k), k]));

  for (const name of names) {
    const real = map.get(normalize(name));
    if (real && row[real] !== undefined && row[real] !== null) {
      return clean(row[real]);
    }
  }

  return "";
}

function findZipFiles() {
  const found = [];

  for (const dir of DATASET_DIRS) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!file.toLowerCase().endsWith(".zip")) continue;

      const fileNorm = normalize(file);

      const matched = TARGET_ZIPS.some((target) => {
        const targetNorm = normalize(target);
        return fileNorm.includes(targetNorm.slice(0, 8)) ||
          targetNorm.includes(fileNorm.slice(0, 8)) ||
          fileNorm.includes("leetcode") ||
          fileNorm.includes("gfg") ||
          fileNorm.includes("codeforces") ||
          fileNorm.includes("codechef");
      });

      if (matched) {
        found.push(path.join(dir, file));
      }
    }
  }

  return [...new Set(found)];
}


function readRowsFromZip(zipPath) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const dataEntries = entries.filter((entry) => {
    if (entry.isDirectory) return false;
    return /\.(csv|xlsx|xls|json)$/i.test(entry.entryName);
  });

  const allRows = [];

  for (const entry of dataEntries) {
    const entryName = path.basename(entry.entryName);
    const ext = path.extname(entryName).toLowerCase();
    const buffer = entry.getData();

    let rows = [];

    if (ext === ".json") {
      const parsed = JSON.parse(buffer.toString("utf8"));
      if (Array.isArray(parsed)) rows = parsed;
      else if (Array.isArray(parsed.data)) rows = parsed.data;
      else if (Array.isArray(parsed.rows)) rows = parsed.rows;
      else if (Array.isArray(parsed.questions)) rows = parsed.questions;
    } else {
      const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        rows.push(...XLSX.utils.sheet_to_json(sheet, { defval: "" }));
      });
    }

    console.log(`   ✅ ${entryName} rows: ${rows.length}`);
    allRows.push(...rows);
  }

  return allRows;
}

function buildQuestion(row, platformFromFile, index) {
  const platform =
    normalizePlatform(
      getValue(row, [
        "platform",
        "source",
        "website",
        "judge",
        "Platform",
        "Source"
      ]) || platformFromFile
    );

  const title =
    getValue(row, [
      "title",
      "question",
      "problem",
      "problem name",
      "problem title",
      "name",
      "Question",
      "Problem",
      "Problem Name",
      "Problem Title"
    ]) || `${platform} Question ${index + 1}`;

  const url =
    getValue(row, [
      "url",
      "link",
      "problem link",
      "question link",
      "href",
      "URL",
      "Link"
    ]) || "";

  const topic =
    normalizeTopic(
      getValue(row, [
        "topic",
        "tag",
        "tags",
        "category",
        "subtopic",
        "Topic",
        "Tags",
        "Category"
      ]),
      platform === "Codeforces" ? "Competitive Programming" : "DSA"
    );

  const difficulty = normalizeDifficulty(
    getValue(row, [
      "difficulty",
      "level",
      "rating",
      "Difficulty",
      "Level",
      "Rating"
    ])
  );

  const description =
    getValue(row, [
      "description",
      "statement",
      "problem statement",
      "Problem Statement",
      "Description"
    ]) || "";

  const idBase = `${platform}-${title}-${url || index}`;
  const id = normalize(idBase);

  return {
    id,
    title,
    url,
    topic,
    platform,
    difficulty,
    description,
    sourceDataset: platformFromFile,
    rawPlatform: platformFromFile,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function main() {
  const zipFiles = findZipFiles();

  if (!zipFiles.length) {
    console.error("❌ DSA zip datasets not found.");
    console.error("Put these files inside backend/src/data/datasets or backend/src/dta/datasets:");
    TARGET_ZIPS.forEach((f) => console.error(" -", f));
    process.exit(1);
  }

  console.log("✅ Found DSA zips:");
  zipFiles.forEach((f) => console.log(" -", f));

  let allQuestions = [];

  for (const zipPath of zipFiles) {
    const platformFromFile = inferPlatform(path.basename(zipPath));
    console.log(`📦 ${path.basename(zipPath)} → reading inside zip without extraction`);

    const rows = readRowsFromZip(zipPath);

    const questions = rows
      .map((row, index) => buildQuestion(row, platformFromFile, index))
      .filter((q) => q.title && q.title.length >= 2);

    allQuestions.push(...questions);
  }

  const platformBuckets = new Map();
  const seen = new Set();

  allQuestions.forEach((q) => {
    const platform = q.platform || "Unknown";
    const key = q.id || normalize(`${q.platform}-${q.title}-${q.url}`);

    if (seen.has(key)) return;
    seen.add(key);

    if (!platformBuckets.has(platform)) {
      platformBuckets.set(platform, []);
    }

    const bucket = platformBuckets.get(platform);

    if (bucket.length < MAX_PER_PLATFORM) {
      bucket.push(q);
    }
  });

  allQuestions = Array.from(platformBuckets.values()).flat();

  console.log("✅ Unique DSA questions parsed after 4000/platform limit:", allQuestions.length);

  const byPlatform = {};
  allQuestions.forEach((q) => {
    byPlatform[q.platform] = (byPlatform[q.platform] || 0) + 1;
  });

  console.log("✅ Platform counts:", byPlatform);

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const collections = ["dsaquestions", "dsa_questions"];

  for (const collectionName of collections) {
    const col = db.collection(collectionName);

    console.log(`🧹 Removing old imported DSA dataset from ${collectionName}...`);
    await col.deleteMany({
      sourceDataset: {
        $in: ["LeetCode", "GeeksForGeeks", "Codeforces", "CodeChef"]
      }
    });

    console.log(`⬆️ Upserting into ${collectionName}...`);

    const bulk = allQuestions.map((q) => ({
      updateOne: {
        filter: { id: q.id },
        update: {
          $set: {
            ...q,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        upsert: true
      }
    }));

    const chunkSize = 1000;

    for (let i = 0; i < bulk.length; i += chunkSize) {
      await col.bulkWrite(bulk.slice(i, i + chunkSize), { ordered: false });
      console.log(`✅ ${collectionName}: ${Math.min(i + chunkSize, bulk.length)} / ${bulk.length}`);
    }

    await col.createIndex({ platform: 1 });
    await col.createIndex({ topic: 1 });
    await col.createIndex({ difficulty: 1 });
    await col.createIndex({ title: "text", topic: "text", platform: "text" });
  }

  await db.collection("dataset_import_logs").insertOne({
    dataset: "DSA datasets",
    questions: allQuestions.length,
    platformCounts: byPlatform,
    importedAt: new Date()
  });

  console.log("🎉 DSA datasets import completed.");
  console.log("Total:", allQuestions.length);
  console.log("Platforms:", byPlatform);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("❌ DSA import failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
