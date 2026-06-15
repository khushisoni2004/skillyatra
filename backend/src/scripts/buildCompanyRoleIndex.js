const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");

const DATASET_DIR = path.join(__dirname, "../data/datasets");
const OUTPUT_FILE = path.join(__dirname, "../data/companyRoleIndex.json");

function clean(v) {
  return String(v || "").trim();
}

function norm(v) {
  return clean(v).toLowerCase();
}

function pick(row, names) {
  const keys = Object.keys(row || {});

  for (const name of names) {
    const found = keys.find((k) => norm(k) === norm(name));
    if (found && clean(row[found])) return clean(row[found]);
  }

  for (const name of names) {
    const found = keys.find((k) => norm(k).includes(norm(name)));
    if (found && clean(row[found])) return clean(row[found]);
  }

  return "";
}

function unique(arr) {
  const seen = new Set();

  return (arr || [])
    .map(clean)
    .filter(Boolean)
    .filter((item) => {
      const key = norm(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function splitSkills(value) {
  if (!value) return [];

  return String(value)
    .replace(/[\[\]{}"'`]/g, "")
    .split(/[,;|•]+|\s{2,}/)
    .map(clean)
    .filter((s) => s.length >= 2)
    .filter((s) => s.length <= 45)
    .filter((s) => s.split(" ").length <= 6)
    .filter((s) => !["nan", "none", "null", "not specified", "not disclosed"].includes(norm(s)));
}

function mode(values, fallback = "Not disclosed") {
  const counts = new Map();

  for (const value of values || []) {
    const v = clean(value);
    if (!v) continue;
    if (["nan", "none", "null", "not specified"].includes(norm(v))) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }

  let best = fallback;
  let bestCount = 0;

  for (const [value, count] of counts.entries()) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }

  return best;
}

function rowsFromCsvBuffer(buffer, name) {
  const content = buffer.toString("utf8");

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true
  });

  console.log(`✅ CSV loaded: ${name} -> ${rows.length} rows`);
  return rows;
}

function rowsFromExcelBuffer(buffer, name) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    rows.push(...sheetRows);
    console.log(`✅ Excel loaded: ${name} / ${sheetName} -> ${sheetRows.length} rows`);
  }

  return rows;
}

function readRowsFromZip(zipPath) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);

  console.log("ZIP files found:");
  entries.slice(0, 30).forEach((entry) => console.log(" -", entry.entryName));

  const rows = [];

  for (const entry of entries) {
    const name = entry.entryName.toLowerCase();
    const buffer = entry.getData();

    try {
      if (name.endsWith(".csv")) {
        rows.push(...rowsFromCsvBuffer(buffer, entry.entryName));
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        rows.push(...rowsFromExcelBuffer(buffer, entry.entryName));
      }
    } catch (err) {
      console.log(`⚠️ Skipped ${entry.entryName}: ${err.message}`);
    }
  }

  return rows;
}

function readRowsFromFile(filePath) {
  const lower = filePath.toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (lower.endsWith(".zip")) return readRowsFromZip(filePath);
  if (lower.endsWith(".csv")) return rowsFromCsvBuffer(buffer, path.basename(filePath));
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return rowsFromExcelBuffer(buffer, path.basename(filePath));

  return [];
}

function loadAllRows() {
  if (!fs.existsSync(DATASET_DIR)) {
    throw new Error(`Dataset folder not found: ${DATASET_DIR}`);
  }

  const files = fs.readdirSync(DATASET_DIR);
  console.log("Dataset folder files:", files);

  const targetFiles = files.filter((file) => {
    const lower = file.toLowerCase();
    return lower.endsWith(".zip") || lower.endsWith(".csv") || lower.endsWith(".xlsx") || lower.endsWith(".xls");
  });

  const rows = [];

  for (const file of targetFiles) {
    const full = path.join(DATASET_DIR, file);
    console.log(`\nReading dataset file: ${file}`);
    rows.push(...readRowsFromFile(full));
  }

  if (!rows.length) {
    throw new Error("No usable rows found. Zip opened, but no CSV/XLSX rows were readable.");
  }

  return rows;
}

function buildIndex(rows) {
  const companyMap = new Map();

  for (const row of rows) {
    const companyName =
      pick(row, ["companyName", "company_name", "company", "Company Name", "Company", "Company_Name", "Employer"]) ||
      "Unknown Company";

    const roleName =
      pick(row, ["roleName", "job_title", "jobTitle", "title", "Job Title", "Role", "Designation", "Job_Title", "Position"]) ||
      "Unknown Role";

    const rawSkills =
      pick(row, ["skills", "Skills", "required_skills", "Required Skills", "Skills Required", "Key Skills", "Key_Skills", "skills_desc", "Skill"]) ||
      "";

    const packageValue =
      pick(row, ["salary", "Salary", "package", "Package", "expectedPackage", "ctc", "CTC", "pay", "Salary Range", "Salary_Range"]) ||
      "Not disclosed";

    const experienceValue =
      pick(row, ["experience", "Experience", "expectedExperience", "Experience Required", "Experience_Required", "exp", "Work Experience"]) ||
      "Not specified";

    const location =
      pick(row, ["location", "Location", "city", "City", "job_location", "Job Location", "Job_Location"]) ||
      "Not specified";

    const description =
      pick(row, ["description", "Description", "job_description", "Job Description", "Job_Description", "About"]) ||
      "";

    let skills = unique([
      ...splitSkills(rawSkills)
    ]).filter((skill) => {
      const s = norm(skill);
      if (["job", "jobs", "role", "work", "team", "good", "must", "should", "required"].includes(s)) return false;
      return true;
    });

    const roleText = norm(roleName);

    const softwareWords = [
      "software", "developer", "frontend", "front end", "backend", "full stack",
      "engineer", "react", "javascript", "java", "python", "node", "web"
    ];

    const nonTechNoise = [
      "front office", "recruitment", "sourcing", "hr", "human resource",
      "payroll", "calling", "cold calling", "sales", "channel sales",
      "customer service", "business development", "telecalling", "telesales"
    ];

    if (softwareWords.some((w) => roleText.includes(w))) {
      skills = skills.filter((skill) => !nonTechNoise.includes(norm(skill)));
    }

    const hrWords = ["hr", "recruiter", "recruitment", "talent acquisition"];
    const techNoiseForHr = ["react.js", "react", "node.js", "node", "mongodb", "express", "frontend", "backend"];

    if (hrWords.some((w) => roleText.includes(w))) {
      skills = skills.filter((skill) => !techNoiseForHr.includes(norm(skill)));
    }

    if (!skills.length && softwareWords.some((w) => roleText.includes(w))) {
      skills = [
        "JavaScript",
        "React.js",
        "HTML",
        "CSS",
        "Data Structures",
        "Algorithms",
        "Programming",
        "User Interface Designing"
      ];
    }

    if (!companyMap.has(companyName)) {
      companyMap.set(companyName, {
        companyName,
        totalJobCount: 0,
        rolesMap: new Map()
      });
    }

    const company = companyMap.get(companyName);
    company.totalJobCount += 1;

    if (!company.rolesMap.has(roleName)) {
      company.rolesMap.set(roleName, {
        roleName,
        jobCount: 0,
        skills: [],
        packages: [],
        experiences: [],
        locations: []
      });
    }

    const role = company.rolesMap.get(roleName);
    role.jobCount += 1;
    role.skills.push(...skills);
    role.packages.push(packageValue);
    role.experiences.push(experienceValue);
    role.locations.push(location);
  }

  const companies = Array.from(companyMap.values())
    .map((company) => {
      const roles = Array.from(company.rolesMap.values())
        .map((role) => ({
          roleName: role.roleName,
          jobCount: role.jobCount,
          skills: unique(role.skills).slice(0, 35),
          expectedPackage: mode(role.packages, "Not disclosed"),
          expectedExperience: mode(role.experiences, "Not specified"),
          locations: unique(role.locations).slice(0, 10)
        }))
        .sort((a, b) => b.jobCount - a.jobCount);

      return {
        companyName: company.companyName,
        totalJobCount: company.totalJobCount,
        roles
      };
    })
    .filter((company) => company.companyName !== "Unknown Company")
    .filter((company) => company.roles.length)
    .sort((a, b) => b.totalJobCount - a.totalJobCount);

  return {
    ok: true,
    source: "Indian Job Market Dataset 2025 97k",
    generatedAt: new Date().toISOString(),
    totalCompanies: companies.length,
    totalJobRows: rows.length,
    companies
  };
}

function main() {
  const rows = loadAllRows();

  console.log(`\nTotal raw rows loaded: ${rows.length}`);
  console.log("Sample columns:", Object.keys(rows[0] || {}));

  const index = buildIndex(rows);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));

  console.log(`\n✅ Done: ${OUTPUT_FILE}`);
  console.log(`✅ Companies: ${index.totalCompanies}`);
  console.log(`✅ Rows: ${index.totalJobRows}`);
}

main();
