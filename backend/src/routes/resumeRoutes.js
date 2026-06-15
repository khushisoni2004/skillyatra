const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const router = express.Router();

const INDEX_PATH = path.join(__dirname, "..", "data", "companyRoleIndex.json");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const FALLBACK_SKILLS = [
  "Python", "Java", "JavaScript", "React", "Node.js", "SQL", "MongoDB",
  "Git", "REST API", "HTML", "CSS", "DSA", "OOP", "DBMS"
];

function clean(v) {
  return String(v || "").trim();
}

function lower(v) {
  return clean(v).toLowerCase();
}

function unique(list) {
  const seen = new Set();
  const out = [];

  for (const item of list || []) {
    const value = clean(item);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }

  return out;
}

function loadIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    return { companies: [], totalCompanies: 0, totalJobRows: 0 };
  }

  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
}

function getCompanyName(company) {
  return clean(company.companyName || company.name || "Unknown Company");
}

function getRoleName(role, index = 0) {
  return clean(role.roleName || role.title || role.name || `Role ${index + 1}`);
}

function getRoleSkills(role) {
  return unique(role.skills || role.requiredSkills || role.preparationFocus || []).slice(0, 20);
}

function getExpectedPackage(role) {
  if (role.expectedPackage) return clean(role.expectedPackage);

  if (Array.isArray(role.salarySamples) && role.salarySamples.length) {
    return clean(role.salarySamples[0]) || "Not specified in dataset";
  }

  if (role.salaryRange) {
    const min = role.salaryRange.minimumSalary || role.salaryRange.min || "";
    const max = role.salaryRange.maximumSalary || role.salaryRange.max || "";
    if (min || max) return `${min || "NA"} - ${max || "NA"}`;
  }

  return "Not specified in dataset";
}

function getExpectedExperience(role) {
  if (role.expectedExperience) return clean(role.expectedExperience);

  if (Array.isArray(role.experience) && role.experience.length) {
    return clean(role.experience[0]) || "Not specified in dataset";
  }

  if (role.experienceRange) {
    const min = role.experienceRange.minimumExperience || role.experienceRange.min || "";
    const max = role.experienceRange.maximumExperience || role.experienceRange.max || "";
    if (min || max) return `${min || 0}-${max || "NA"} Yrs`;
  }

  return "Not specified in dataset";
}

function findCompany(index, companyName) {
  return (index.companies || []).find(
    (company) => lower(getCompanyName(company)) === lower(companyName)
  );
}

function findRole(company, roleName) {
  return (company.roles || []).find(
    (role, index) => lower(getRoleName(role, index)) === lower(roleName)
  );
}

function buildAtsChecklist(resumeText) {
  const body = lower(resumeText);
  const has = (words) => words.some((word) => body.includes(word));

  const make = (label, present, weak, suggestion) => ({
    label,
    status: !present ? "Missing" : weak ? "Weak" : "Present",
    suggestion
  });

  return [
    make("Education", has(["education", "b.tech", "bachelor", "degree", "college", "university"]), false, "Add degree, college, year and CGPA clearly."),
    make("Technical Skills", has(["skills", "technical skills", "technologies", "programming"]), false, "Add a clear Technical Skills section with role keywords."),
    make("Projects", has(["project", "projects"]), !has(["github", "deployed", "api", "database", "authentication", "dashboard", "model"]), "Add projects with tech stack, GitHub/live link and impact."),
    make("Internship / Experience", has(["experience", "internship", "intern", "work experience"]), false, "Add internship, training, freelance or project experience."),
    make("GitHub", has(["github", "github.com"]), false, "Add GitHub profile and project repository links."),
    make("LinkedIn", has(["linkedin", "linkedin.com"]), false, "Add LinkedIn profile link."),
    make("Live Project Link", has(["vercel.app", "netlify.app", "render.com", "onrender.com", "deployed", "live"]), false, "Add live project deployment link."),
    make("Achievements / Certifications", has(["achievement", "achievements", "certification", "certifications", "award", "hackathon"]), false, "Add certifications, achievements, coding profiles or hackathon proof.")
  ];
}

function extractResumeSkills(resumeText, requiredSkills) {
  const body = lower(resumeText);
  return unique([...requiredSkills, ...FALLBACK_SKILLS]).filter((skill) =>
    body.includes(lower(skill))
  );
}

function detectWeakPoints(resumeText) {
  const lines = resumeText.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  const checks = [
    {
      pattern: /made a website/i,
      issue: "Too simple. It does not show tech stack or impact.",
      improvedVersion: "Developed a responsive web application with reusable components, REST API integration, and clean user flow."
    },
    {
      pattern: /worked on project/i,
      issue: "Generic wording. It does not explain your contribution.",
      improvedVersion: "Built and integrated key project modules including frontend UI, backend APIs, database operations, and deployment-ready documentation."
    },
    {
      pattern: /used react/i,
      issue: "Weak skill mention. Show what you built using React.",
      improvedVersion: "Developed reusable React components, managed state-driven UI flows, and improved page responsiveness using Tailwind CSS."
    },
    {
      pattern: /created app/i,
      issue: "Too vague. Mention features, stack, and outcome.",
      improvedVersion: "Created a full-stack application with authentication, dashboard analytics, REST APIs, and persistent database storage."
    },
    {
      pattern: /learned python/i,
      issue: "Learning is not proof. Show practical application.",
      improvedVersion: "Implemented Python scripts to clean, transform, and analyze structured datasets for project insights."
    },
    {
      pattern: /responsible for/i,
      issue: "Passive wording. Use strong action verbs.",
      improvedVersion: "Led implementation of project features, coordinated module integration, and improved functionality through testing."
    }
  ];

  const out = [];

  for (const line of lines) {
    for (const check of checks) {
      if (check.pattern.test(line)) {
        out.push({
          weakLine: line,
          issue: check.issue,
          improvedVersion: check.improvedVersion
        });
        break;
      }
    }
  }

  return out.slice(0, 8);
}

function calculateAtsScore(resumeText, checklist, roleMatchScore) {
  let score = 0;

  if (resumeText.length >= 1500) score += 15;
  else if (resumeText.length >= 900) score += 12;
  else if (resumeText.length >= 500) score += 8;
  else score += 4;

  checklist.forEach((item) => {
    if (item.status === "Present") score += 8;
    if (item.status === "Weak") score += 4;
  });

  score += Math.round(roleMatchScore * 0.3);

  const body = lower(resumeText);
  const qualityWords = [
    "developed", "built", "implemented", "designed", "deployed",
    "optimized", "integrated", "api", "database", "authentication",
    "dashboard", "model", "testing", "docker", "cloud"
  ];

  score += Math.min(15, qualityWords.filter((word) => body.includes(word)).length * 2);

  return Math.max(0, Math.min(100, score));
}

function readinessLabel(score) {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Needs Improvement";
  return "High Skill Gap";
}

function buildMustAdd(missingSkills, roleName) {
  return missingSkills.slice(0, 10).map((skill) => ({
    skill,
    whatToLearn: `Learn ${skill} basics, interview questions, and practical usage for ${roleName}.`,
    resumeProof: `Use ${skill} in a role-based project and add GitHub/live proof in resume.`,
    bulletExample: `Implemented ${skill} in a project and documented setup, features, and outcomes in the GitHub README.`
  }));
}

function buildProjectSuggestions(roleName, missingSkills) {
  const role = lower(roleName);
  const skills = missingSkills.slice(0, 5);

  if (role.includes("data") || role.includes("analyst")) {
    return [{
      title: "SQL + Dashboard Analytics Project",
      skillsCovered: skills,
      whatToBuild: "Build a dashboard using SQL analysis, Excel/Power BI/Tableau, and business insights.",
      resumeBulletExample: "Built an analytics dashboard using SQL and visualization tools to identify trends and present actionable insights."
    }];
  }

  if (role.includes("cloud") || role.includes("devops")) {
    return [{
      title: "Cloud Deployment Project",
      skillsCovered: skills,
      whatToBuild: "Deploy a full-stack app using Docker/cloud hosting and document deployment steps.",
      resumeBulletExample: "Deployed a full-stack application using containerized setup and documented cloud deployment workflow."
    }];
  }

  if (role.includes("qa") || role.includes("test")) {
    return [{
      title: "Testing Portfolio Project",
      skillsCovered: skills,
      whatToBuild: "Create test cases, bug reports, API tests, and Selenium automation for a sample app.",
      resumeBulletExample: "Designed manual and automated test cases, reported defects, and validated critical user journeys."
    }];
  }

  if (role.includes("ai") || role.includes("ml") || role.includes("machine learning")) {
    return [{
      title: "AI/ML Model Demo Project",
      skillsCovered: skills,
      whatToBuild: "Build an ML model with dataset preprocessing, evaluation, and a small demo interface.",
      resumeBulletExample: "Developed an ML model pipeline with preprocessing, model training, evaluation metrics, and demo-ready documentation."
    }];
  }

  return [{
    title: "Role-Based Full Stack Project",
    skillsCovered: skills,
    whatToBuild: "Build a full-stack app with frontend, backend, API, database, authentication, and deployment proof.",
    resumeBulletExample: "Developed a full-stack web application with REST APIs, database integration, authentication, and deployment-ready documentation."
  }];
}

function buildImprovementPlan(missingSkills) {
  const topSkill = missingSkills[0] || "top missing skill";

  return [
    { day: "Day 1", task: "Fix resume structure and add missing sections." },
    { day: "Day 2", task: "Add role keywords from selected job role." },
    { day: "Day 3", task: "Improve weak project bullet points." },
    { day: "Day 4", task: "Add GitHub, LinkedIn and live project links." },
    { day: "Day 5", task: `Learn and practice ${topSkill}.` },
    { day: "Day 6", task: "Build or update one proof project." },
    { day: "Day 7", task: "Final ATS polish and role-wise review." }
  ];
}

router.get("/companies", (req, res) => {
  try {
    const index = loadIndex();

    const companies = (index.companies || []).map((company) => ({
      companyName: getCompanyName(company),
      totalJobCount: company.totalJobCount || 0,
      roles: (company.roles || []).map((role, index) => ({
        roleName: getRoleName(role, index),
        jobCount: role.jobCount || 0,
        expectedPackage: getExpectedPackage(role),
        expectedExperience: getExpectedExperience(role)
      }))
    }));

    return res.json({
      ok: true,
      totalCompanies: companies.length,
      totalJobRows: index.totalJobRows || 0,
      companies
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to load companies.",
      error: err.message
    });
  }
});

router.post("/extract-text", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Resume file is required."
      });
    }

    const originalName = req.file.originalname || "";
    const ext = path.extname(originalName).toLowerCase();

    let extractedText = "";

    if (ext === ".txt") {
      extractedText = req.file.buffer.toString("utf-8");
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value || "";
    } else if (ext === ".pdf") {
      const result = await pdfParse(req.file.buffer);
      extractedText = result.text || "";
    } else {
      return res.status(400).json({
        ok: false,
        message: "Only PDF, DOCX, and TXT resume files are supported."
      });
    }

    extractedText = clean(extractedText);

    if (!extractedText) {
      return res.status(400).json({
        ok: false,
        message: "Could not extract text from this file. Try DOCX/TXT or paste text manually."
      });
    }

    return res.json({
      ok: true,
      fileName: originalName,
      fileType: ext.replace(".", ""),
      extractedText,
      characterCount: extractedText.length
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to extract resume text.",
      error: err.message
    });
  }
});


function roleCategory(roleName) {
  const r = cleanText(roleName);

  if (/software|developer|engineer|sde|programmer|backend|frontend|full stack|fullstack|web/.test(r)) return "tech";
  if (/data scientist|data analyst|data engineer|machine learning|ai|ml|analytics/.test(r)) return "data";
  if (/sales|business development|account manager|customer success/.test(r)) return "sales";
  if (/accountant|finance|audit|tax|payable|receivable|r2r/.test(r)) return "finance";
  if (/hr|recruiter|talent acquisition|human resource/.test(r)) return "hr";
  if (/marketing|seo|digital marketing|content/.test(r)) return "marketing";
  if (/qa|tester|testing|quality analyst/.test(r)) return "qa";

  return "general";
}

function canonicalSkill(skill) {
  const s = cleanText(skill);

  const map = {
    "c plus plus": "C++",
    "cpp": "C++",
    "c++": "C++",
    "c sharp": "C#",
    "c#": "C#",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "react": "React.js",
    "react.js": "React.js",
    "reactjs": "React.js",
    "reacts": "React.js",
    "reaction": "React.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "mongo db": "MongoDB",
    "mongodb": "MongoDB",
    "ds": "Data Structures",
    "dsa": "Data Structures and Algorithms",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "algo": "Algorithms",
    "oops": "OOPs",
    "oop": "OOPs",
    "dbms": "DBMS",
    "os": "Operating System",
    "cn": "Computer Networks",
    "ps": "Problem Solving",
    ".net core": ".NET Core",
    "dot net core": ".NET Core",
    "tsql": "T-SQL",
    "t sql": "T-SQL",
    "powerbi": "Power BI",
    "power bi": "Power BI"
  };

  return map[s] || String(skill || "").trim();
}

function isBadNoise(skill) {
  const s = cleanText(skill);

  const bad = [
    "administration",
    "teaching",
    "personal assistance",
    "personal assistant",
    "front office",
    "back office",
    "recruitment",
    "sourcing",
    "training",
    "good communication",
    "communication",
    "english",
    "ms office",
    "office",
    "typing",
    "calling",
    "telecalling",
    "field work",
    "documentation",
    "coordination"
  ];

  return bad.includes(s);
}

function filterSkillsByRole(roleName, skills) {
  const category = roleCategory(roleName);

  const allow = {
    tech: [
      "java", "python", "c++", "c#", "javascript", "typescript", "react.js", "angular", "node.js",
      ".net core", ".net", "spring boot", "html", "css", "sql", "mysql", "mongodb", "postgresql",
      "data structures", "data structures and algorithms", "algorithms", "problem solving",
      "oops", "dbms", "operating system", "computer networks", "rest api", "api", "microservices",
      "system design", "git", "github", "docker", "kubernetes", "aws", "azure", "cloud",
      "frontend", "backend", "full stack", "testing", "debugging"
    ],
    data: [
      "python", "sql", "excel", "statistics", "mathematics", "machine learning", "deep learning",
      "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "power bi", "tableau",
      "data analysis", "data visualization", "data cleaning", "eda", "pyspark", "spark",
      "data pipeline", "etl", "azure", "aws", "big data", "nlp", "computer vision", "cuda"
    ],
    sales: [
      "sales", "crm", "crm software", "cold calling", "customer service", "business development",
      "lead generation", "outbound sales", "channel sales", "market research", "sales strategy",
      "sales growth", "client handling", "negotiation", "customer relationship management"
    ],
    finance: [
      "accounting", "balance sheet", "balance sheet reconciliation", "gaap", "journal entries",
      "bank reconciliation", "ledger", "audit", "taxation", "sap", "sap fi", "r2r",
      "accounts payable", "accounts receivable", "financial reporting"
    ],
    hr: [
      "recruitment", "sourcing", "screening", "onboarding", "payroll", "talent acquisition",
      "employee engagement", "hr operations", "interview scheduling"
    ],
    marketing: [
      "seo", "digital marketing", "social media", "google ads", "content marketing",
      "campaign management", "analytics", "email marketing", "branding"
    ],
    qa: [
      "manual testing", "automation testing", "selenium", "test cases", "bug reporting",
      "api testing", "performance testing", "jira", "quality assurance"
    ],
    general: []
  };

  let cleaned = unique((skills || []).map(canonicalSkill))
    .filter((skill) => skill && cleanText(skill).length >= 2)
    .filter((skill) => cleanText(skill).length <= 45);

  if (category !== "general") {
    const allowed = allow[category] || [];
    cleaned = cleaned.filter((skill) => {
      const s = cleanText(skill);
      if (isBadNoise(skill)) return false;
      return allowed.some((a) => s === a || s.includes(a) || a.includes(s));
    });
  } else {
    cleaned = cleaned.filter((skill) => !isBadNoise(skill));
  }

  if (category === "tech" && cleaned.length < 6) {
    cleaned = unique([
      ...cleaned,
      "Data Structures and Algorithms",
      "Problem Solving",
      "OOPs",
      "DBMS",
      "Operating System",
      "Computer Networks",
      "System Design",
      "REST API",
      "Git"
    ]);
  }

  if (category === "data" && cleaned.length < 6) {
    cleaned = unique([
      ...cleaned,
      "Python",
      "SQL",
      "Statistics",
      "Machine Learning",
      "Pandas",
      "NumPy",
      "Data Visualization"
    ]);
  }

  return cleaned.slice(0, 18);
}



function getStrictRoleCategory(roleName) {
  const r = cleanText(roleName);

  if (/react|frontend|front end|ui developer|web developer|javascript developer/.test(r)) return "frontend";
  if (/backend|node|api developer|server/.test(r)) return "backend";
  if (/full stack|fullstack|mern|mean/.test(r)) return "fullstack";
  if (/software|sde|developer|engineer|programmer/.test(r)) return "software";
  if (/data scientist|machine learning|ml engineer|ai engineer/.test(r)) return "datascience";
  if (/data analyst|business analyst|analytics/.test(r)) return "dataanalyst";
  if (/sales|business development|customer success/.test(r)) return "sales";
  if (/accountant|finance|audit|tax|r2r|payable|receivable/.test(r)) return "finance";
  if (/hr|recruiter|talent acquisition|human resource/.test(r)) return "hr";
  if (/qa|tester|testing|quality analyst/.test(r)) return "qa";

  return "general";
}

function normalizeDatasetSkill(skill) {
  const s = cleanText(skill);

  const map = {
    "rest": "REST API",
    "rest api": "REST API",
    "api": "API Integration",
    "css": "CSS",
    "html": "HTML",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "react": "React.js",
    "react.js": "React.js",
    "reactjs": "React.js",
    "reacts": "React.js",
    "reaction": "React.js",
    "redux": "Redux",
    "jest": "Jest",
    "ajax": "AJAX",
    "single page app": "Single Page Application",
    "spa": "Single Page Application",
    "unit testing": "Unit Testing",
    "debugging": "Debugging",
    "sdlc": "SDLC",
    "agile methodology": "Agile Methodology",
    "agile": "Agile Methodology",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "mongo db": "MongoDB",
    "mongodb": "MongoDB",
    "ds": "Data Structures",
    "dsa": "Data Structures and Algorithms",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "ps": "Problem Solving",
    "oops": "OOPs",
    "oop": "OOPs",
    "dbms": "DBMS",
    "os": "Operating System",
    "cn": "Computer Networks",
    "c plus plus": "C++",
    "cpp": "C++",
    "c++": "C++",
    "c sharp": "C#",
    "c#": "C#",
    ".net core": ".NET Core",
    "dot net core": ".NET Core",
    "tsql": "T-SQL",
    "t sql": "T-SQL",
    "pyspark": "PySpark",
    "powerbi": "Power BI",
    "power bi": "Power BI"
  };

  return map[s] || String(skill || "").trim();
}

function getAllowedSkillsForCategory(category) {
  const sets = {
    frontend: [
      "HTML", "CSS", "JavaScript", "TypeScript", "React.js", "Redux",
      "Single Page Application", "REST API", "API Integration", "AJAX",
      "Jest", "Unit Testing", "Debugging", "Responsive UI",
      "User Interface Designing", "Git", "Agile Methodology", "SDLC"
    ],
    backend: [
      "Node.js", "Express.js", "Java", "Python", "Spring Boot", "REST API",
      "API Integration", "SQL", "MongoDB", "PostgreSQL", "DBMS",
      "Authentication", "Microservices", "Unit Testing", "Debugging", "Git"
    ],
    fullstack: [
      "HTML", "CSS", "JavaScript", "TypeScript", "React.js", "Angular",
      "Node.js", "Express.js", "REST API", "API Integration", "SQL",
      "MongoDB", "DBMS", "Authentication", "Unit Testing", "Debugging", "Git"
    ],
    software: [
      "C++", "Java", "Python", "Data Structures", "Algorithms",
      "Data Structures and Algorithms", "Problem Solving", "OOPs",
      "DBMS", "Operating System", "Computer Networks", "System Design",
      "REST API", "Git", "Debugging", "Unit Testing"
    ],
    datascience: [
      "Python", "SQL", "Statistics", "Mathematics", "Machine Learning",
      "Deep Learning", "Pandas", "NumPy", "Scikit-learn", "TensorFlow",
      "PyTorch", "Data Cleaning", "EDA", "Data Visualization",
      "PySpark", "Data Pipeline", "Azure", "AWS"
    ],
    dataanalyst: [
      "Excel", "SQL", "Python", "Pandas", "Power BI", "Tableau",
      "Data Cleaning", "EDA", "Data Visualization", "Statistics",
      "Dashboard", "Business Analysis"
    ],
    sales: [
      "Sales", "CRM", "CRM Software", "Cold Calling", "Customer Service",
      "Business Development", "Lead Generation", "Outbound Sales",
      "Channel Sales", "Market Research", "Sales Strategy", "Sales Growth",
      "Client Handling", "Negotiation"
    ],
    finance: [
      "Accounting", "Balance Sheet", "Balance Sheet Reconciliation",
      "GAAP", "Journal Entries", "Bank Reconciliation", "Ledger",
      "Audit", "Taxation", "SAP", "R2R", "Accounts Payable",
      "Accounts Receivable", "Financial Reporting"
    ],
    hr: [
      "Recruitment", "Sourcing", "Screening", "Onboarding", "Payroll",
      "Talent Acquisition", "Employee Engagement", "HR Operations",
      "Interview Scheduling"
    ],
    qa: [
      "Manual Testing", "Automation Testing", "Selenium", "Test Cases",
      "Bug Reporting", "API Testing", "Performance Testing", "Jira",
      "Quality Assurance"
    ]
  };

  return sets[category] || [];
}

function getStrictRoleSkills(roleName, rawSkills) {
  const category = getStrictRoleCategory(roleName);
  const allowed = getAllowedSkillsForCategory(category);

  let cleaned = unique((rawSkills || []).map(normalizeDatasetSkill));

  if (allowed.length) {
    const allowedClean = allowed.map((x) => cleanText(x));

    cleaned = cleaned.filter((skill) => {
      const s = cleanText(skill);
      return allowedClean.some((a) => s === a || s.includes(a) || a.includes(s));
    });

    cleaned = unique(cleaned);
  }

  // If dataset gives too little/dirty data, use safe role baseline.
  if (cleaned.length < 5 && allowed.length) {
    cleaned = allowed.slice(0, 10);
  }

  return cleaned.slice(0, 14);
}

function makeStrictMustAdd(missingSkills, roleName) {
  const category = getStrictRoleCategory(roleName);

  return missingSkills.slice(0, 8).map((skill) => {
    if (category === "frontend") {
      return {
        skill,
        whatToLearn: `Build one React/frontend proof using ${skill}.`,
        resumeProof: `Add a real project bullet showing where you used ${skill}, with feature name, UI/API flow, GitHub/live link, and result.`,
        bulletExample: `Implemented ${skill} in a React project to improve UI flow, API handling, testing, or user experience with documented GitHub proof.`
      };
    }

    if (category === "software") {
      return {
        skill,
        whatToLearn: `Practice ${skill} for coding rounds and software engineering interviews.`,
        resumeProof: `Add project/coding proof, problem-solving practice, or implementation detail where ${skill} was used.`,
        bulletExample: `Applied ${skill} while solving engineering problems and documented approach, complexity, and implementation details.`
      };
    }

    if (category === "datascience" || category === "dataanalyst") {
      return {
        skill,
        whatToLearn: `Use ${skill} in a data project or analysis workflow.`,
        resumeProof: `Add notebook/dashboard/model proof with dataset, metric, chart, insight, or pipeline step.`,
        bulletExample: `Used ${skill} in a data project to clean, analyze, visualize, or model data and generate measurable insights.`
      };
    }

    if (category === "sales") {
      return {
        skill,
        whatToLearn: `Use ${skill} in a sales/customer workflow.`,
        resumeProof: `Add proof like leads handled, CRM usage, follow-ups, calls, client communication, or conversion support.`,
        bulletExample: `Used ${skill} to manage leads, track follow-ups, improve customer communication, and support sales pipeline progress.`
      };
    }

    return {
      skill,
      whatToLearn: `Add real role proof for ${skill}.`,
      resumeProof: `Use only real project, internship, training, certification, tool usage, or work task proof.`,
      bulletExample: `Applied ${skill} in a role-related task with clear tools, process, and outcome.`
    };
  });
}

router.post("/analyze", (req, res) => {
  try {
    const { resumeText = "", companyName = "", roleName = "" } = req.body || {};

    if (!clean(companyName)) {
      return res.status(400).json({ ok: false, message: "Search and select company first." });
    }

    if (!clean(roleName)) {
      return res.status(400).json({ ok: false, message: "Select target role first." });
    }

    if (!clean(resumeText)) {
      return res.status(400).json({ ok: false, message: "Paste resume text first." });
    }

    const index = loadIndex();
    const company = findCompany(index, companyName);

    if (!company) {
      return res.status(404).json({ ok: false, message: "Company not found in dataset." });
    }

    const role = findRole(company, roleName);

    if (!role) {
      return res.status(404).json({ ok: false, message: "Role not found in dataset." });
    }

    const requiredSkills = getRoleSkills(role);
    const finalRequiredSkills = requiredSkills.length ? requiredSkills : FALLBACK_SKILLS;

    const resumeSkills = extractResumeSkills(resumeText, finalRequiredSkills);

    const matchedSkills = finalRequiredSkills.filter((skill) =>
      resumeSkills.some((resumeSkill) => lower(resumeSkill) === lower(skill))
    );

    const missingSkills = finalRequiredSkills.filter((skill) =>
      !matchedSkills.some((matched) => lower(matched) === lower(skill))
    );

    const roleMatchScore = finalRequiredSkills.length
      ? Math.round((matchedSkills.length / finalRequiredSkills.length) * 100)
      : 0;

    const atsChecklist = buildAtsChecklist(resumeText);
    const atsScore = calculateAtsScore(resumeText, atsChecklist, roleMatchScore);
    const weakPoints = detectWeakPoints(resumeText);

    return res.json({
      ok: true,
      companyName: getCompanyName(company),
      roleName: getRoleName(role),
      expectedPackage: getExpectedPackage(role),
      expectedExperience: getExpectedExperience(role),
      atsScore,
      roleMatchScore,
      readinessLabel: readinessLabel(roleMatchScore),
      requiredSkills: finalRequiredSkills,
      matchedSkills,
      missingSkills,
      resumeSkills,
      atsChecklist,
      weakPoints,
      sectionSuggestions: atsChecklist.filter((item) => item.status !== "Present").map((item) => item.suggestion),
      mustAdd: buildMustAdd(missingSkills, roleName),
      projectSuggestions: buildProjectSuggestions(roleName, missingSkills),
      improvementPlan: buildImprovementPlan(missingSkills),
      improvedBulletExamples: weakPoints.map((item) => item.improvedVersion),
      disclaimer: "Analysis is based on pasted resume text and role skills extracted from companyRoleIndex.json only. Verify latest official job descriptions before applying."
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Resume analysis failed.",
      error: err.message
    });
  }
});

module.exports = router;
