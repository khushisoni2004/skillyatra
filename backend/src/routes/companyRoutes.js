const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const INDEX_PATH = path.join(__dirname, "..", "data", "companyRoleIndex.json");

const PRIORITY_COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Flipkart",
  "Tata Consultancy Services",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Capgemini",
  "IBM",
  "Deloitte",
  "EY",
  "KPMG",
  "HCLTech",
  "Tech Mahindra",
  "Oracle",
  "Cognizant",
  "Tata Elxsi",
  "LTIMindtree",
  "Mphasis",
  "Paytm",
  "Swiggy",
  "Meesho",
  "IndiaMART",
  "NoBroker"
];

function loadIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    return {
      ok: false,
      totalCompanies: 0,
      totalJobRows: 0,
      companies: [],
      disclaimer: "Company index not found. Build companyRoleIndex.json first."
    };
  }

  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
}

function getCompanyName(company) {
  if (typeof company === "string") return company;
  return company.companyName || company.name || "Unknown Company";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function priorityScore(company) {
  const name = normalizeText(getCompanyName(company));
  const exactIndex = PRIORITY_COMPANIES.findIndex(
    (p) => normalizeText(p) === name
  );

  if (exactIndex !== -1) return 100000 - exactIndex;

  const partialIndex = PRIORITY_COMPANIES.findIndex((p) =>
    name.includes(normalizeText(p))
  );

  if (partialIndex !== -1) return 90000 - partialIndex;

  return Number(company.totalJobCount || 0);
}

function rolePackage(role) {
  const samples = role.salarySamples || [];
  const range = role.salaryRange || {};

  if (samples.length) return samples[0];

  if (range.minimumSalary || range.maximumSalary) {
    const min = range.minimumSalary || "NA";
    const max = range.maximumSalary || "NA";
    return `${min} - ${max}`;
  }

  return "Package not specified in dataset";
}

function roleExperience(role) {
  const exp = role.experience || role.experienceRange || [];

  if (Array.isArray(exp) && exp.length) return exp[0];

  if (typeof exp === "string" && exp.trim()) return exp;

  return "Experience not specified in dataset";
}

function cleanSkill(skill) {
  const s = String(skill || "").trim();
  if (!s) return "";

  const map = {
    css: "CSS",
    html: "HTML",
    sql: "SQL",
    ui: "UI",
    ux: "UX",
    api: "API",
    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",
    python: "Python",
    java: "Java",
    javascript: "JavaScript",
    typescript: "TypeScript",
    react: "React",
    node: "Node.js",
    mongodb: "MongoDB",
    mysql: "MySQL",
    sap: "SAP",
    rest: "REST",
    c: "C",
    "c#": "C#",
    "c++": "C++"
  };

  return map[s.toLowerCase()] || s;
}

function uniqueSkills(skills) {
  const seen = new Set();
  const output = [];

  for (const skill of skills || []) {
    const clean = cleanSkill(skill);
    const key = clean.toLowerCase();

    if (!clean || seen.has(key)) continue;

    seen.add(key);
    output.push(clean);
  }

  return output.slice(0, 14);
}

function normalizeRole(role, index = 0) {
  const skills = uniqueSkills(
    role.skills || role.requiredSkills || role.preparationFocus || []
  );

  return {
    ...role,
    roleId: role.roleId || `${index + 1}`,
    roleName: role.roleName || role.title || `Role ${index + 1}`,
    skills,
    requiredSkills: skills,
    preparationFocus: skills,
    expectedPackage: rolePackage(role),
    expectedExperience: roleExperience(role),
    locations: Array.isArray(role.locations) ? role.locations.slice(0, 8) : [],
    howToPrepare: Array.isArray(role.howToPrepare) ? role.howToPrepare : []
  };
}

function normalizeCompany(company) {
  const roles = Array.isArray(company.roles)
    ? company.roles.map((role, index) => normalizeRole(role, index))
    : [];

  const topSkills = [];
  const seen = new Set();

  for (const role of roles) {
    for (const skill of role.skills || []) {
      const key = skill.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        topSkills.push(skill);
      }
    }
  }

  return {
    ...company,
    companyName: getCompanyName(company),
    totalJobCount: company.totalJobCount || 0,
    roles,
    companyInfo: company.companyInfo || {},
    topSkills: topSkills.slice(0, 18)
  };
}

router.get("/", (req, res) => {
  try {
    const index = loadIndex();

    const q = normalizeText(req.query.q || "");
    const limit = Math.min(Number(req.query.limit || 2000), 2000);

    let companies = Array.isArray(index.companies)
      ? index.companies.map(normalizeCompany)
      : [];

    if (q) {
      companies = companies.filter((company) =>
        normalizeText(company.companyName).includes(q)
      );
    }

    companies = companies
      .sort((a, b) => priorityScore(b) - priorityScore(a))
      .slice(0, limit);

    return res.json({
      ok: true,
      totalCompanies: companies.length,
      totalAllCompanies: index.totalCompanies || companies.length,
      totalJobRows: index.totalJobRows || 0,
      companies,
      priorityCompanies: PRIORITY_COMPANIES,
      disclaimer:
        index.disclaimer ||
        "Data is generated only from the uploaded Indian job market dataset. Students should verify latest official company career pages before applying."
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Companies API failed.",
      error: err.message
    });
  }
});

router.get("/:companyName", (req, res) => {
  try {
    const index = loadIndex();
    const requested = decodeURIComponent(req.params.companyName || "");

    const company = (index.companies || []).find(
      (c) => normalizeText(getCompanyName(c)) === normalizeText(requested)
    );

    if (!company) {
      return res.status(404).json({
        ok: false,
        message: "Company not found in dataset."
      });
    }

    return res.json({
      ok: true,
      company: normalizeCompany(company),
      disclaimer: index.disclaimer
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Company detail API failed.",
      error: err.message
    });
  }
});

router.get("/:companyName/roles", (req, res) => {
  try {
    const index = loadIndex();
    const requested = decodeURIComponent(req.params.companyName || "");

    const company = (index.companies || []).find(
      (c) => normalizeText(getCompanyName(c)) === normalizeText(requested)
    );

    if (!company) {
      return res.status(404).json({
        ok: false,
        message: "Company not found in dataset.",
        roles: []
      });
    }

    const normalized = normalizeCompany(company);

    return res.json({
      ok: true,
      companyName: normalized.companyName,
      totalJobCount: normalized.totalJobCount,
      companyInfo: normalized.companyInfo,
      topSkills: normalized.topSkills,
      roles: normalized.roles,
      company: normalized
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Company roles API failed.",
      error: err.message
    });
  }
});

router.get("/:companyName/roles/:roleId", (req, res) => {
  try {
    const index = loadIndex();
    const requested = decodeURIComponent(req.params.companyName || "");
    const roleId = decodeURIComponent(req.params.roleId || "");

    const company = (index.companies || []).find(
      (c) => normalizeText(getCompanyName(c)) === normalizeText(requested)
    );

    if (!company) {
      return res.status(404).json({
        ok: false,
        message: "Company not found in dataset."
      });
    }

    const normalized = normalizeCompany(company);
    const role =
      normalized.roles[Number(roleId) - 1] ||
      normalized.roles.find((r) => normalizeText(r.roleId) === normalizeText(roleId));

    if (!role) {
      return res.status(404).json({
        ok: false,
        message: "Role not found in dataset."
      });
    }

    return res.json({
      ok: true,
      company: normalized,
      role,
      disclaimer: index.disclaimer
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Role detail API failed.",
      error: err.message
    });
  }
});

router.post("/skill-gap", (req, res) => {
  try {
    const index = loadIndex();

    const { companyName, roleName, resumeText = "" } = req.body;

    const company = (index.companies || []).find(
      (c) => normalizeText(getCompanyName(c)) === normalizeText(companyName)
    );

    if (!company) {
      return res.status(404).json({
        ok: false,
        message: "Company not found in dataset."
      });
    }

    const normalized = normalizeCompany(company);

    const role = normalized.roles.find(
      (r) => normalizeText(r.roleName) === normalizeText(roleName)
    );

    if (!role) {
      return res.status(404).json({
        ok: false,
        message: "Role not found in dataset."
      });
    }

    const requiredSkills = role.skills || [];
    const resumeLower = String(resumeText || "").toLowerCase();

    const matchedSkills = requiredSkills.filter((skill) =>
      resumeLower.includes(String(skill).toLowerCase())
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !matchedSkills.includes(skill)
    );

    const readinessScore = requiredSkills.length
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    return res.json({
      ok: true,
      companyName: normalized.companyName,
      roleName: role.roleName,
      expectedPackage: role.expectedPackage,
      expectedExperience: role.expectedExperience,
      requiredSkills,
      matchedSkills,
      missingSkills,
      readinessScore,
      skillGap: 100 - readinessScore,
      improvementSuggestions: missingSkills.slice(0, 8).map(
        (skill) => `Add clear project, internship, or resume proof for ${skill}.`
      ),
      personalizedPlan: missingSkills.slice(0, 8).map(
        (skill, index) =>
          `Day ${index + 1}: Learn ${skill}, practice it, and add one proof point in your resume.`
      ),
      disclaimer: index.disclaimer
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to calculate skill gap.",
      error: err.message
    });
  }
});

module.exports = router;
