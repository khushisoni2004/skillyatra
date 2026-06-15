require("dotenv").config();

const fs = require("fs");
const path = require("path");
const os = require("os");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");
const mongoose = require("mongoose");

const POSSIBLE_ZIP_PATHS = [
  path.join(__dirname, "..", "src", "data", "datasets", "Indian Job Market Dataset 2025 97k Data Points.zip"),
  path.join(__dirname, "..", "src", "dta", "datasets", "Indian Job Market Dataset 2025 97k Data Points.zip"),
  path.join(__dirname, "..", "data", "datasets", "Indian Job Market Dataset 2025 97k Data Points.zip")
];

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  process.env.ATLAS_URI;

if (!MONGO_URI) {
  console.error("❌ MongoDB URI missing. Add MONGODB_URI in backend/.env");
  process.exit(1);
}

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeKey(key) {
  return String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getValue(row, possibleNames) {
  const keys = Object.keys(row || {});
  const normalizedMap = new Map(keys.map((k) => [normalizeKey(k), k]));

  for (const name of possibleNames) {
    const realKey = normalizedMap.get(normalizeKey(name));
    if (realKey && row[realKey] !== undefined && row[realKey] !== null) {
      return clean(row[realKey]);
    }
  }

  return "";
}

function splitSkills(value) {
  if (!value) return [];

  return String(value)
    .split(/[,;|/]+/)
    .map((x) => clean(x))
    .filter(Boolean)
    .filter((x, i, arr) => arr.findIndex((y) => y.toLowerCase() === x.toLowerCase()) === i)
    .slice(0, 30);
}

function findZipPath() {
  for (const p of POSSIBLE_ZIP_PATHS) {
    if (fs.existsSync(p)) return p;
  }

  const root = path.join(__dirname, "..");
  const matches = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else if (
        item.toLowerCase().includes("indian job market dataset") &&
        item.toLowerCase().endsWith(".zip")
      ) {
        matches.push(full);
      }
    }
  }

  walk(root);

  return matches[0] || null;
}

function readRowsFromZip(zipPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "indian-jobs-2025-"));
  const zip = new AdmZip(zipPath);

  zip.extractAllTo(tempDir, true);

  const files = [];

  function walk(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else if (/\.(xlsx|xls|csv|json)$/i.test(item)) files.push(full);
    }
  }

  walk(tempDir);

  if (!files.length) {
    throw new Error("No CSV/XLSX/JSON file found inside dataset zip.");
  }

  console.log("📦 Dataset files found:");
  files.forEach((f) => console.log(" -", path.basename(f)));

  let allRows = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (ext === ".json") {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      const rows = Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
      allRows.push(...rows);
      continue;
    }

    const workbook = XLSX.readFile(file, { raw: false });
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      allRows.push(...rows);
    });
  }

  return allRows;
}

function buildCompanyDocs(rows) {
  const companyMap = new Map();

  for (const row of rows) {
    const companyName =
      getValue(row, [
        "company",
        "company name",
        "company_name",
        "Company",
        "Company Name",
        "employer",
        "organization",
        "Organisation",
        "firm"
      ]) || "Unknown Company";

    const roleName =
      getValue(row, [
        "job title",
        "job_title",
        "title",
        "role",
        "role name",
        "designation",
        "position",
        "Job Title",
        "Role"
      ]) || "Software Engineer";

    const location =
      getValue(row, [
        "location",
        "job location",
        "city",
        "state",
        "Location",
        "Job Location"
      ]) || "India";

    const skillsRaw =
      getValue(row, [
        "skills",
        "required skills",
        "key skills",
        "job skills",
        "Skills",
        "Required Skills",
        "Key Skills"
      ]) || "";

    const salary =
      getValue(row, [
        "salary",
        "package",
        "ctc",
        "expected package",
        "salary range",
        "Salary",
        "CTC"
      ]) || "Not disclosed";

    const experience =
      getValue(row, [
        "experience",
        "experience level",
        "required experience",
        "experience required",
        "Experience"
      ]) || "Not specified";

    const companyKey = companyName.toLowerCase();

    if (!companyMap.has(companyKey)) {
      companyMap.set(companyKey, {
        companyName,
        totalJobCount: 0,
        totalJobs: 0,
        rolesMap: new Map()
      });
    }

    const company = companyMap.get(companyKey);
    company.totalJobCount += 1;
    company.totalJobs += 1;

    const roleKey = roleName.toLowerCase();

    if (!company.rolesMap.has(roleKey)) {
      company.rolesMap.set(roleKey, {
        roleName,
        jobCount: 0,
        skillsSet: new Set(),
        locationsSet: new Set(),
        expectedPackage: salary,
        expectedExperience: experience
      });
    }

    const role = company.rolesMap.get(roleKey);
    role.jobCount += 1;

    splitSkills(skillsRaw).forEach((skill) => role.skillsSet.add(skill));

    if (location) role.locationsSet.add(location);

    if (salary && salary !== "Not disclosed") role.expectedPackage = salary;
    if (experience && experience !== "Not specified") role.expectedExperience = experience;
  }

  const docs = [];

  for (const company of companyMap.values()) {
    const roles = Array.from(company.rolesMap.values())
      .map((role) => ({
        roleName: role.roleName,
        jobCount: role.jobCount,
        skills: Array.from(role.skillsSet).slice(0, 30),
        locations: Array.from(role.locationsSet).slice(0, 25),
        expectedPackage: role.expectedPackage || "Not disclosed",
        expectedExperience: role.expectedExperience || "Not specified"
      }))
      .sort((a, b) => b.jobCount - a.jobCount);

    docs.push({
      companyName: company.companyName,
      totalJobCount: company.totalJobCount,
      totalJobs: company.totalJobs,
      roles,
      sourceDataset: "Indian Job Market Dataset 2025 97k Data Points",
      updatedAt: new Date()
    });
  }

  return docs.sort((a, b) => a.companyName.localeCompare(b.companyName));
}

async function main() {
  const zipPath = findZipPath();

  if (!zipPath) {
    console.error("❌ Dataset zip not found.");
    console.error("Expected path:");
    console.error("backend/src/data/datasets/Indian Job Market Dataset 2025 97k Data Points.zip");
    console.error("or:");
    console.error("backend/src/dta/datasets/Indian Job Market Dataset 2025 97k Data Points.zip");
    process.exit(1);
  }

  console.log("✅ Dataset zip found:", zipPath);

  const rows = readRowsFromZip(zipPath);
  console.log("✅ Raw rows loaded:", rows.length);

  if (!rows.length) {
    console.error("❌ Dataset rows are empty.");
    process.exit(1);
  }

  const docs = buildCompanyDocs(rows);
  console.log("✅ Companies parsed:", docs.length);

  const totalRoleCount = docs.reduce((sum, c) => sum + c.roles.length, 0);
  const totalJobRows = docs.reduce((sum, c) => sum + c.totalJobCount, 0);

  console.log("✅ Roles parsed:", totalRoleCount);
  console.log("✅ Job rows parsed:", totalJobRows);

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const companiesCol = db.collection("companies");

  console.log("🧹 Removing old imported Indian Job Market dataset companies...");
  await companiesCol.deleteMany({
    sourceDataset: "Indian Job Market Dataset 2025 97k Data Points"
  });

  console.log("⬆️ Upserting companies into MongoDB collection: companies");

  const bulk = docs.map((doc) => ({
    updateOne: {
      filter: { companyName: doc.companyName },
      update: {
        $set: doc,
        $setOnInsert: { createdAt: new Date() }
      },
      upsert: true
    }
  }));

  if (bulk.length) {
    const chunkSize = 500;

    for (let i = 0; i < bulk.length; i += chunkSize) {
      const chunk = bulk.slice(i, i + chunkSize);
      await companiesCol.bulkWrite(chunk, { ordered: false });
      console.log(`✅ Imported ${Math.min(i + chunkSize, bulk.length)} / ${bulk.length}`);
    }
  }

  await db.collection("dataset_import_logs").insertOne({
    dataset: "Indian Job Market Dataset 2025 97k Data Points",
    rows: rows.length,
    companies: docs.length,
    roles: totalRoleCount,
    jobRows: totalJobRows,
    importedAt: new Date()
  });

  console.log("🎉 Dataset import completed successfully.");
  console.log("Companies:", docs.length);
  console.log("Roles:", totalRoleCount);
  console.log("Job rows:", totalJobRows);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("❌ Import failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
