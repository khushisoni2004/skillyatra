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
  "Python", "Java", "JavaScript", "React", "Node.js", "Express.js",
  "MongoDB", "SQL", "Git", "REST API", "HTML", "CSS",
  "DSA", "OOP", "DBMS", "Operating System", "Computer Network"
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
    return { companies: [] };
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
  return unique(role.skills || role.requiredSkills || role.preparationFocus || []).slice(0, 40);
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

function seededShuffle(list, seedValue) {
  const arr = [...list];
  let seed = Number(seedValue || Date.now());

  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function dedupeQuestions(questions) {
  const seen = new Set();
  const out = [];

  for (const q of questions) {
    const key = lower(q.question);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }

  return out.map((q, index) => ({
    ...q,
    id: `${q.type.toLowerCase()}-${index + 1}`
  }));
}

function extractResumeSkills(resumeText, roleSkills) {
  const body = lower(resumeText);
  const allSkills = unique([...roleSkills, ...FALLBACK_SKILLS]);

  return allSkills.filter((skill) => {
    const s = lower(skill);

    if (!s) return false;
    if (body.includes(s)) return true;

    if (s === "javascript" && body.includes("js")) return true;
    if (s === "machine learning" && body.includes("ml")) return true;
    if (s === "artificial intelligence" && body.includes("ai")) return true;
    if (s === "react" && body.includes("react.js")) return true;
    if (s === "node.js" && body.includes("node")) return true;
    if (s === "express.js" && body.includes("express")) return true;
    if (s === "mongodb" && body.includes("mongo")) return true;
    if (s === "rest api" && (body.includes("rest") || body.includes("api"))) return true;

    return false;
  });
}

function buildHrQuestions(companyName, roleName) {
  const company = companyName || "this company";
  const role = roleName || "this role";

  return [
    "Tell me about yourself.",
    `Why do you want to join ${company}?`,
    `Why are you interested in the ${role} role?`,
    "Why should we hire you?",
    "What are your strengths?",
    "What is your biggest weakness?",
    "Tell me about your final year project.",
    "Tell me about your best technical project.",
    "Describe a challenge you faced in a project.",
    "Tell me about a time you worked in a team.",
    "How do you handle pressure?",
    "How do you handle feedback?",
    "What motivates you?",
    "Where do you see yourself in three years?",
    "Are you comfortable learning new technologies quickly?",
    "What makes you different from other candidates?",
    "Tell me about a mistake you made and what you learned.",
    "How do you prioritize tasks when deadlines are close?",
    "Describe a situation where you solved a problem independently.",
    "Why should we select you for this role?",
    "What do you know about our company?",
    "What are your salary expectations?",
    "Are you open to relocation or flexible work location?",
    "Do you prefer working alone or in a team?",
    "How do you stay updated with technology?"
  ].map((question) => ({
    type: "HR",
    question
  }));
}

function buildTechnicalQuestions(roleName, skills) {
  const role = lower(roleName);
  const finalSkills = skills.length ? skills : FALLBACK_SKILLS;
  const questions = [];

  finalSkills.forEach((skill) => {
    questions.push(
      {
        type: "Technical",
        question: `Explain your practical experience with ${skill}.`
      },
      {
        type: "Technical",
        question: `What are the important concepts of ${skill} for this role?`
      },
      {
        type: "Technical",
        question: `Tell me about a project where you used ${skill}.`
      }
    );
  });

  questions.push(
    { type: "Technical", question: "Explain one project from your resume end to end." },
    { type: "Technical", question: "How do you debug an issue in your project?" },
    { type: "Technical", question: "How do you test your code before deployment?" },
    { type: "Technical", question: "Explain the difference between frontend and backend." },
    { type: "Technical", question: "Explain REST API with an example." },
    { type: "Technical", question: "What is authentication and authorization?" },
    { type: "Technical", question: "Explain database indexing in simple terms." },
    { type: "Technical", question: "What is normalization in DBMS?" },
    { type: "Technical", question: "Explain primary key and foreign key." },
    { type: "Technical", question: "Explain HTTP methods GET, POST, PUT and DELETE." },
    { type: "Technical", question: "What is the difference between SQL and NoSQL databases?" },
    { type: "Technical", question: "Explain time complexity with an example." },
    { type: "Technical", question: "Explain OOP concepts with examples." },
    { type: "Technical", question: "What is Git and why is it used?" },
    { type: "Technical", question: "How do you handle errors in an application?" }
  );

  if (role.includes("full") || role.includes("developer") || role.includes("software") || role.includes("engineer")) {
    questions.push(
      { type: "Technical", question: "Explain the complete flow of a full-stack application." },
      { type: "Technical", question: "How does React communicate with a Node.js backend?" },
      { type: "Technical", question: "How do you manage state in a frontend application?" },
      { type: "Technical", question: "How do you structure backend routes and controllers?" },
      { type: "Technical", question: "How do you connect backend with MongoDB or SQL database?" }
    );
  }

  if (role.includes("data") || role.includes("analyst")) {
    questions.push(
      { type: "Technical", question: "Explain SQL joins with examples." },
      { type: "Technical", question: "How do you clean a dataset?" },
      { type: "Technical", question: "How do you find insights from raw data?" },
      { type: "Technical", question: "Explain group by and aggregate functions in SQL." },
      { type: "Technical", question: "How do you handle missing values in data?" }
    );
  }

  if (role.includes("cloud") || role.includes("devops")) {
    questions.push(
      { type: "Technical", question: "Explain deployment flow for a web application." },
      { type: "Technical", question: "What is Docker and why is it useful?" },
      { type: "Technical", question: "What are environment variables?" },
      { type: "Technical", question: "How do you check logs after deployment?" }
    );
  }

  return questions;
}

function analyzeAnswer(answer) {
  const text = clean(answer);
  const words = text.split(/\s+/).filter(Boolean);
  const body = lower(text);

  let score = 0;
  const feedback = [];
  const improve = [];

  if (words.length >= 90) score += 25;
  else if (words.length >= 50) score += 18;
  else if (words.length >= 25) score += 10;
  else {
    score += 4;
    improve.push("Answer is too short. Explain more clearly.");
  }

  if (body.includes("project") || body.includes("internship") || body.includes("experience")) {
    score += 20;
  } else {
    improve.push("Add one real project, internship, or experience example.");
  }

  if (body.includes("built") || body.includes("developed") || body.includes("implemented") || body.includes("designed") || body.includes("created")) {
    score += 20;
  } else {
    improve.push("Use strong action words like built, developed, implemented, designed.");
  }

  if (body.includes("result") || body.includes("improved") || body.includes("reduced") || body.includes("increased") || body.includes("%")) {
    score += 20;
  } else {
    improve.push("Add result, impact, metric, or learning outcome.");
  }

  if (body.includes("team") || body.includes("collaborated") || body.includes("communication") || body.includes("client")) {
    score += 15;
  } else {
    improve.push("Add teamwork, communication, or ownership point if relevant.");
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 80) feedback.push("Strong answer. Clear, structured and example-based.");
  else if (score >= 60) feedback.push("Good answer. Add stronger result and role keywords.");
  else if (score >= 40) feedback.push("Average answer. Use example, action and result.");
  else feedback.push("Weak answer. Please answer again with more details.");

  return {
    score,
    feedback,
    improve
  };
}

router.get("/companies", (req, res) => {
  try {
    const index = loadIndex();

    const companies = (index.companies || []).map((company) => ({
      companyName: getCompanyName(company),
      totalJobCount: company.totalJobCount || 0,
      roles: (company.roles || []).map((role, index) => ({
        roleName: getRoleName(role, index),
        jobCount: role.jobCount || 0
      }))
    }));

    return res.json({ ok: true, companies });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to load companies.",
      error: err.message
    });
  }
});

router.post("/extract-resume", upload.single("resume"), async (req, res) => {
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
        message: "Could not extract text. If PDF is scanned, use DOCX/TXT or paste manually."
      });
    }

    return res.json({
      ok: true,
      fileName: originalName,
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

router.post("/questions", (req, res) => {
  try {
    const {
      companyName = "",
      roleName = "",
      resumeText = "",
      seed = Date.now()
    } = req.body || {};

    if (!clean(companyName)) {
      return res.status(400).json({ ok: false, message: "Select company first." });
    }

    if (!clean(roleName)) {
      return res.status(400).json({ ok: false, message: "Select role first." });
    }

    const index = loadIndex();
    const company = findCompany(index, companyName);

    if (!company) {
      return res.status(404).json({ ok: false, message: "Company not found." });
    }

    const role = findRole(company, roleName);

    if (!role) {
      return res.status(404).json({ ok: false, message: "Role not found." });
    }

    const roleSkills = getRoleSkills(role);
    const finalSkills = roleSkills.length ? roleSkills : FALLBACK_SKILLS;
    const resumeSkills = clean(resumeText) ? extractResumeSkills(resumeText, finalSkills) : [];

    const matchedSkills = finalSkills.filter((skill) =>
      resumeSkills.some((s) => lower(s) === lower(skill))
    );

    const missingSkills = finalSkills.filter((skill) =>
      !matchedSkills.some((s) => lower(s) === lower(skill))
    );

    const hr = buildHrQuestions(getCompanyName(company), getRoleName(role));
    const technical = buildTechnicalQuestions(getRoleName(role), finalSkills);

    const allQuestions = dedupeQuestions([...hr, ...technical]);
    const shuffledQuestions = seededShuffle(allQuestions, seed);

    return res.json({
      ok: true,
      companyName: getCompanyName(company),
      roleName: getRoleName(role),
      roleSkills: finalSkills,
      resumeSkills,
      matchedSkills,
      missingSkills,
      roleMatchScore: finalSkills.length
        ? Math.round((matchedSkills.length / finalSkills.length) * 100)
        : 0,
      totalQuestions: shuffledQuestions.length,
      questions: shuffledQuestions
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to generate questions.",
      error: err.message
    });
  }
});

router.post("/analyze-answer", (req, res) => {
  try {
    const { answer = "" } = req.body || {};

    if (!clean(answer)) {
      return res.status(400).json({
        ok: false,
        message: "Answer is required."
      });
    }

    return res.json({
      ok: true,
      ...analyzeAnswer(answer)
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Answer analysis failed.",
      error: err.message
    });
  }
});

module.exports = router;
