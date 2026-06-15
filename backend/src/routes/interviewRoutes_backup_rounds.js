const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ROLE_INDEX = path.join(__dirname, "../data/companyRoleIndex.json");
const QUESTION_INDEX = path.join(__dirname, "../data/interviewQuestionIndex.json");

function loadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function cleanText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s.+#/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function unique(list) {
  const seen = new Set();
  return (list || [])
    .filter(Boolean)
    .map((x) => displayText(x))
    .filter(Boolean)
    .filter((x) => {
      const key = cleanText(x);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function findCompany(index, companyName) {
  return (index.companies || []).find(
    (c) => cleanText(c.companyName) === cleanText(companyName)
  );
}

function findRole(company, roleName) {
  return (company?.roles || []).find(
    (r) => cleanText(r.roleName) === cleanText(roleName)
  );
}

function roleCategory(roleName) {
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

  return "software";
}

function normalizeSkill(skill) {
  const s = cleanText(skill);

  const map = {
    js: "JavaScript",
    javascript: "JavaScript",
    react: "React.js",
    reactjs: "React.js",
    "react.js": "React.js",
    reacts: "React.js",
    reaction: "React.js",
    node: "Node.js",
    nodejs: "Node.js",
    "node.js": "Node.js",
    rest: "REST API",
    "rest api": "REST API",
    api: "API Integration",
    css: "CSS",
    html: "HTML",
    redux: "Redux",
    jest: "Jest",
    ajax: "AJAX",
    "single page app": "Single Page Application",
    spa: "Single Page Application",
    "unit testing": "Unit Testing",
    debugging: "Debugging",
    sdlc: "SDLC",
    agile: "Agile Methodology",
    "agile methodology": "Agile Methodology",
    ds: "Data Structures",
    dsa: "Data Structures and Algorithms",
    "data structures": "Data Structures",
    algorithms: "Algorithms",
    ps: "Problem Solving",
    oops: "OOPs",
    oop: "OOPs",
    dbms: "DBMS",
    os: "Operating System",
    cn: "Computer Networks",
    "c++": "C++",
    cpp: "C++",
    "c#": "C#",
    ".net core": ".NET Core",
    mongodb: "MongoDB",
    "mongo db": "MongoDB",
    sql: "SQL",
    python: "Python",
    java: "Java"
  };

  return map[s] || displayText(skill);
}

function baselineSkills(category) {
  const sets = {
    frontend: ["HTML", "CSS", "JavaScript", "React.js", "Redux", "REST API", "API Integration", "Jest", "Unit Testing", "Debugging", "Git", "SDLC"],
    backend: ["Node.js", "Express.js", "Java", "Python", "REST API", "SQL", "MongoDB", "DBMS", "Authentication", "Debugging", "Git", "Unit Testing"],
    fullstack: ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "Express.js", "REST API", "SQL", "MongoDB", "DBMS", "Git", "Debugging"],
    software: ["Java", "Python", "C++", "Data Structures", "Algorithms", "Problem Solving", "OOPs", "DBMS", "Operating System", "Computer Networks", "System Design", "Git"],
    datascience: ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy", "Data Cleaning", "EDA", "Data Visualization", "Scikit-learn"],
    dataanalyst: ["Excel", "SQL", "Python", "Power BI", "Tableau", "Data Cleaning", "EDA", "Data Visualization", "Statistics", "Dashboard"],
    sales: ["Sales", "CRM", "Cold Calling", "Customer Service", "Business Development", "Lead Generation", "Client Handling"],
    finance: ["Accounting", "Balance Sheet", "Journal Entries", "Bank Reconciliation", "Ledger", "Audit", "SAP", "Financial Reporting"],
    hr: ["Recruitment", "Sourcing", "Screening", "Onboarding", "Payroll", "Talent Acquisition", "HR Operations"],
    qa: ["Manual Testing", "Automation Testing", "Selenium", "Test Cases", "Bug Reporting", "API Testing", "Jira"]
  };

  return sets[category] || sets.software;
}

function skillPresent(skill, resumeText) {
  const resume = cleanText(resumeText);
  const s = cleanText(skill);

  const aliases = {
    "react.js": ["react", "reactjs", "react.js"],
    "node.js": ["node", "nodejs", "node.js"],
    "rest api": ["rest", "rest api", "api"],
    "api integration": ["api", "rest", "rest api", "api integration"],
    "data structures": ["data structures", "dsa"],
    "data structures and algorithms": ["data structures and algorithms", "dsa"],
    "problem solving": ["problem solving"],
    "computer networks": ["computer networks"],
    "operating system": ["operating system"],
    mongodb: ["mongodb", "mongo db"],
    javascript: ["javascript", "js"],
    "unit testing": ["unit testing", "jest", "testing"],
    git: ["git", "github"]
  };

  const checks = aliases[s] || [s];
  return checks.some((x) => resume.includes(cleanText(x)));
}

function cleanRoleSkills(roleName, rawSkills) {
  const category = roleCategory(roleName);
  const base = baselineSkills(category);
  const baseClean = base.map(cleanText);

  let skills = unique((rawSkills || []).map(normalizeSkill));

  skills = skills.filter((skill) => {
    const s = cleanText(skill);
    return baseClean.some((b) => s === b || s.includes(b) || b.includes(s));
  });

  if (skills.length < 8) {
    skills = unique([...skills, ...base]).slice(0, 12);
  }

  return skills.slice(0, 14);
}

function scoreQuestion(question, context) {
  const q = cleanText(`${question.question} ${question.role} ${question.skill}`);
  const role = cleanText(context.roleName);
  const category = context.category;
  const skills = context.roleSkills.map(cleanText);
  const matched = context.matchedSkills.map(cleanText);
  const missing = context.missingSkills.map(cleanText);

  let score = 0;

  if (question.type === "HR") score += 15;
  if (question.type === "Technical") score += 15;
  if (q.includes(role)) score += 30;
  if (q.includes(category)) score += 15;

  for (const skill of skills) {
    if (skill && q.includes(skill)) score += 20;
  }

  for (const skill of matched) {
    if (skill && q.includes(skill)) score += 25;
  }

  for (const skill of missing) {
    if (skill && q.includes(skill)) score += 25;
  }

  if (/project|resume|experience|work|built|implemented/.test(q)) score += 10;

  return score;
}


function isGoodInterviewQuestion(question) {
  const q = cleanText(question.question || "");

  if (!q || q.length < 20) return false;

  const badPatterns = [
    /^problem\s+\d+/,
    /solve a .* challenge/,
    /write a program/,
    /coding challenge/,
    /leetcode/,
    /hackerrank/,
    /input format/,
    /output format/,
    /sample input/,
    /sample output/,
    /constraints/,
    /given an array/,
    /print the/,
    /return the/,
    /find the maximum/,
    /find the minimum/
  ];

  if (badPatterns.some((pattern) => pattern.test(q))) return false;

  const goodPatterns = [
    /explain/,
    /describe/,
    /difference/,
    /how would you/,
    /what is/,
    /why/,
    /project/,
    /experience/,
    /implemented/,
    /used/,
    /design/,
    /debug/,
    /test/,
    /database/,
    /api/,
    /system/,
    /architecture/
  ];

  return goodPatterns.some((pattern) => pattern.test(q));
}


function makeCodingQuestion(skill, index, roleName) {
  const s = cleanText(skill);

  if (s.includes("python")) {
    return {
      id: `r2-code-python-${index}`,
      type: "Coding",
      answerMode: "code",
      role: roleName,
      difficulty: "Coding Basic",
      sourceDataset: "Resume Skill Coding",
      question: "Write a Python function to count the frequency of each character in a string. Explain the time complexity.",
      expectedKeywords: ["def", "dict", "for", "return"],
      goodAnswer: "Use a dictionary, loop through characters, update count, return dictionary. Time complexity O(n)."
    };
  }

  if (s.includes("javascript") || s.includes("react")) {
    return {
      id: `r2-code-js-${index}`,
      type: "Coding",
      answerMode: "code",
      role: roleName,
      difficulty: "Coding Basic",
      sourceDataset: "Resume Skill Coding",
      question: "Write a JavaScript function to reverse a string without using built-in reverse directly. Explain the logic.",
      expectedKeywords: ["function", "for", "return"],
      goodAnswer: "Loop from end to start, append characters into result, return result. Time complexity O(n)."
    };
  }

  if (s.includes("java")) {
    return {
      id: `r2-code-java-${index}`,
      type: "Coding",
      answerMode: "code",
      role: roleName,
      difficulty: "Coding Basic",
      sourceDataset: "Resume Skill Coding",
      question: "Write a Java method to check whether a number is prime. Explain the time complexity.",
      expectedKeywords: ["boolean", "for", "return", "%"],
      goodAnswer: "Check divisibility from 2 to sqrt(n). Return false if divisible, otherwise true."
    };
  }

  if (s.includes("c++") || s.includes("data structures") || s.includes("algorithms")) {
    return {
      id: `r2-code-dsa-${index}`,
      type: "Coding",
      answerMode: "code",
      role: roleName,
      difficulty: "DSA Basic",
      sourceDataset: "DSA Coding",
      question: "Write code to find the second largest element in an array. Explain edge cases.",
      expectedKeywords: ["for", "if", "return"],
      goodAnswer: "Track largest and second largest while iterating. Handle duplicates and arrays with less than 2 unique values."
    };
  }

  if (s.includes("sql") || s.includes("dbms")) {
    return {
      id: `r2-code-sql-${index}`,
      type: "Coding",
      answerMode: "code",
      role: roleName,
      difficulty: "SQL Basic",
      sourceDataset: "SQL Coding",
      question: "Write an SQL query to find the second highest salary from an Employees table.",
      expectedKeywords: ["select", "salary", "order by", "limit"],
      goodAnswer: "Use ORDER BY salary DESC with LIMIT/OFFSET, or use MAX with salary less than max salary."
    };
  }

  return {
    id: `r2-code-general-${index}`,
    type: "Coding",
    answerMode: "code",
    role: roleName,
    difficulty: "Coding Basic",
    sourceDataset: "Role Skill Coding",
    question: `Write a small example or pseudocode showing how you would use ${skill} in a real ${roleName} task.`,
    expectedKeywords: [],
    goodAnswer: `A good answer should show practical use of ${skill}, logic, and explanation.`
  };
}

function pickDatasetQuestions(context, allQuestions) {
  const hr = [];
  const technical = [];

  for (const q of allQuestions) {
    if (typeof isGoodInterviewQuestion === "function" && !isGoodInterviewQuestion(q)) continue;

    const item = { ...q, score: scoreQuestion(q, context) };

    if (item.type === "HR") hr.push(item);
    else technical.push(item);
  }

  hr.sort((a, b) => b.score - a.score);
  technical.sort((a, b) => b.score - a.score);

  const selected = [];

  function addQuestion(q, round, roundName, order, answerMode = "voice") {
    selected.push({
      id: q.id || `${round}-${order}`,
      round,
      roundName,
      roundOrder: order,
      type: q.type || "Technical",
      answerMode: q.answerMode || answerMode,
      role: q.role || context.roleName,
      difficulty: q.difficulty || "Medium",
      sourceDataset: q.sourceDataset || "Interview Dataset",
      question: q.question,
      expectedKeywords: q.expectedKeywords || [],
      goodAnswer: q.goodAnswer || ""
    });
  }

  // ROUND 1 — HR SCREENING: 6 QUESTIONS
  const round1 = [
    {
      id: "r1-hr-intro",
      type: "HR",
      difficulty: "Basic",
      sourceDataset: "Resume + Role",
      question: `Tell me about yourself for the ${context.roleName} role at ${context.companyName}. Connect your resume, projects, and strongest skills.`,
      goodAnswer: "Mention education, current skills, 1-2 relevant projects, and why this role fits you."
    },
    {
      id: "r1-hr-company",
      type: "HR",
      difficulty: "Basic",
      sourceDataset: "Company + Role",
      question: `Why do you want to join ${context.companyName} for the ${context.roleName} role?`,
      goodAnswer: "Connect company, role, skills, and career goal."
    },
    {
      id: "r1-hr-strength",
      type: "HR",
      difficulty: "Basic",
      sourceDataset: "HR Ideal Answer Dataset",
      question: `What are your top two strengths for the ${context.roleName} role? Give proof from your resume.`,
      goodAnswer: "Give strengths with proof, project, internship, or achievement."
    },
    {
      id: "r1-hr-weakness",
      type: "HR",
      difficulty: "Basic",
      sourceDataset: "HR Ideal Answer Dataset",
      question: "Tell me one weakness or improvement area and how you are working on it.",
      goodAnswer: "Be honest, avoid harmful weakness, and give improvement action."
    },
    {
      id: "r1-hr-team",
      type: "HR",
      difficulty: "Behavioral",
      sourceDataset: "HR Dataset",
      question: "Tell me about a time you worked in a team and handled a conflict or responsibility.",
      goodAnswer: "Use STAR format with team situation, action, and result."
    },
    {
      id: "r1-hr-goal",
      type: "HR",
      difficulty: "Basic",
      sourceDataset: "HR Dataset",
      question: `Where do you see yourself after one year in a ${context.roleName} role?`,
      goodAnswer: "Talk about learning, contribution, ownership, and growth."
    }
  ];

  round1.forEach((q, index) => addQuestion(q, 1, "Round 1: HR Screening", index + 1));

  // ROUND 2 — TECHNICAL + CODING: 10-15 QUESTIONS
  const techSkills = unique([
    ...context.matchedSkills,
    ...context.roleSkills,
    ...context.missingSkills
  ]).slice(0, 8);

  techSkills.slice(0, 6).forEach((skill, index) => {
    addQuestion({
      id: `r2-tech-${index}`,
      type: "Technical",
      difficulty: "Technical",
      sourceDataset: "Job Dataset Skills",
      question: `Explain ${skill} for the ${context.roleName} role. Where have you used it or how would you apply it in a real project?`,
      goodAnswer: `Explain ${skill}, practical use, project connection, and common mistake.`
    }, 2, "Round 2: Technical + Coding", index + 1);
  });

  techSkills.slice(0, 5).forEach((skill, index) => {
    addQuestion(makeCodingQuestion(skill, index, context.roleName), 2, "Round 2: Technical + Coding", index + 7, "code");
  });

  technical.slice(0, 4).forEach((q, index) => {
    addQuestion(q, 2, "Round 2: Technical + Coding", index + 12);
  });

  // ROUND 3 — RESUME + PROJECT DEEP DIVE: 5 QUESTIONS
  context.matchedSkills.slice(0, 3).forEach((skill, index) => {
    addQuestion({
      id: `r3-resume-${index}`,
      type: "Technical",
      difficulty: "Resume Based",
      sourceDataset: "Resume + Dataset Match",
      question: `Your resume shows ${skill}. Explain one project or task where you used ${skill}, your exact contribution, challenge faced, and final result.`,
      goodAnswer: `Use STAR format. Explain where ${skill} was used, your contribution, challenge, and measurable output.`
    }, 3, "Round 3: Resume & Project Deep Dive", index + 1);
  });

  addQuestion({
    id: "r3-project-main",
    type: "Technical",
    difficulty: "Project Based",
    sourceDataset: "Resume Based",
    question: "Pick your strongest resume project and explain the problem, tech stack, architecture, your contribution, challenges, and final result.",
    goodAnswer: "Use STAR format: Situation, Task, Action, Result. Mention tech stack, architecture, and outcome."
  }, 3, "Round 3: Resume & Project Deep Dive", 4);

  addQuestion({
    id: "r3-project-debug",
    type: "Technical",
    difficulty: "Project Based",
    sourceDataset: "Resume Based",
    question: "Tell me one bug, error, or challenge you faced in your project and how you solved it.",
    goodAnswer: "Mention issue, debugging process, tool/logs used, fix, and learning."
  }, 3, "Round 3: Resume & Project Deep Dive", 5);

  // ROUND 4 — FINAL HR + READINESS: 6-7 QUESTIONS
  context.missingSkills.slice(0, 3).forEach((skill, index) => {
    addQuestion({
      id: `r4-gap-${index}`,
      type: "HR",
      difficulty: "Skill Gap",
      sourceDataset: "Missing Role Skill",
      question: `${skill} is required for this ${context.roleName} role, but it is not clearly visible in your resume. How will you learn it and prove it before joining?`,
      goodAnswer: `Accept the gap honestly, explain learning plan, mini-project/training proof, and timeline.`
    }, 4, "Round 4: Final HR & Readiness", index + 1);
  });

  const finalHr = [
    {
      id: "r4-final-pressure",
      type: "HR",
      difficulty: "Final HR",
      sourceDataset: "HR Ideal Answer Dataset",
      question: "How do you handle pressure, deadlines, or multiple tasks?",
      goodAnswer: "Explain prioritization, planning, communication, and example."
    },
    {
      id: "r4-final-feedback",
      type: "HR",
      difficulty: "Final HR",
      sourceDataset: "HR Ideal Answer Dataset",
      question: "How do you handle feedback from seniors or team members?",
      goodAnswer: "Show learning attitude and example."
    },
    {
      id: "r4-final-readiness",
      type: "HR",
      difficulty: "Final HR",
      sourceDataset: "HR Ideal Answer Dataset",
      question: `Why should we select you for the ${context.roleName} role?`,
      goodAnswer: "Summarize skills, projects, attitude, and fit."
    },
    {
      id: "r4-final-questions",
      type: "HR",
      difficulty: "Final HR",
      sourceDataset: "HR Ideal Answer Dataset",
      question: "Do you have any questions for the interviewer?",
      goodAnswer: "Ask about team, role expectations, training, tech stack, project ownership, and growth path."
    }
  ];

  finalHr.forEach((q, index) => addQuestion(q, 4, "Round 4: Final HR & Readiness", context.missingSkills.slice(0, 3).length + index + 1));

  const deduped = [];
  const seen = new Set();

  for (const q of selected) {
    const key = cleanText(q.question);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(q);
  }

  return deduped;
}


function analyzeAnswerLocal(answer, question = "", roleName = "", resumeText = "") {
  const text = cleanText(answer);
  const q = cleanText(question);
  const role = cleanText(roleName);
  const resume = cleanText(resumeText);
  const words = displayText(answer).split(/\s+/).filter(Boolean);

  const feedback = [];
  const improve = [];
  let score = 25;

  if (words.length >= 35) score += 20;
  else improve.push("Your answer is too short. Give a 35-70 word answer.");

  if (words.length >= 70) score += 10;

  if (/project|built|developed|implemented|created|worked|used|designed/.test(text)) {
    score += 18;
  } else {
    improve.push("You did not connect the answer with a real project, internship, or task.");
  }

  if (/result|impact|improved|reduced|increased|accuracy|performance|optimized|learned/.test(text)) {
    score += 15;
  } else {
    improve.push("You did not mention result, impact, metric, or learning.");
  }

  if (/first|second|because|therefore|for example|finally|my approach/.test(text)) {
    score += 10;
  } else {
    improve.push("Your answer needs better structure. Use STAR format.");
  }

  const questionKeywords = q
    .split(" ")
    .filter((w) => w.length > 4)
    .slice(0, 10);

  const matchedQuestionWords = questionKeywords.filter((w) => text.includes(w));

  if (matchedQuestionWords.length >= 2) {
    score += 10;
  } else {
    improve.push("Your answer is not specific enough to the question asked.");
  }

  const roleWords = role.split(" ").filter((w) => w.length > 3);
  if (roleWords.some((w) => text.includes(w))) score += 5;

  const resumeWords = resume
    .split(" ")
    .filter((w) => w.length > 5)
    .slice(0, 80);

  const resumeMatch = resumeWords.filter((w) => text.includes(w)).slice(0, 5);
  if (resumeMatch.length >= 2) score += 7;

  score = Math.min(score, 100);

  if (score >= 75) {
    feedback.push("Strong answer. It is clear, role-specific, and interview-ready.");
  } else if (score >= 55) {
    feedback.push("Average answer. It has some relevant points but needs stronger proof.");
  } else {
    feedback.push("Weak answer. It needs clear example, structure, and result.");
  }

  return {
    ok: true,
    score,
    feedback,
    improve,
    spokenFeedback: improve.slice(0, 2).join(" ")
  };
}

router.get("/companies", (req, res) => {
  const index = loadJson(ROLE_INDEX, { ok: false, companies: [] });

  if (!index.ok) {
    return res.json({
      ok: false,
      message: "companyRoleIndex.json not found. Build role dataset index first.",
      companies: []
    });
  }

  return res.json({
    ok: true,
    companies: index.companies || [],
    totalCompanies: index.totalCompanies || 0,
    totalJobRows: index.totalJobRows || 0
  });
});

router.post("/extract-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ ok: false, message: "No resume uploaded." });
    }

    const name = req.file.originalname.toLowerCase();

    if (name.endsWith(".txt")) {
      return res.json({ ok: true, extractedText: req.file.buffer.toString("utf8") });
    }

    if (name.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(req.file.buffer);
      return res.json({ ok: true, extractedText: data.text || "" });
    }

    if (name.endsWith(".docx")) {
      const mammoth = require("mammoth");
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      return res.json({ ok: true, extractedText: data.value || "" });
    }

    return res.json({ ok: false, message: "Only PDF, DOCX and TXT are supported." });
  } catch {
    return res.json({ ok: false, message: "Could not extract resume text." });
  }
});

router.post("/questions", (req, res) => {
  const { companyName, roleName, resumeText = "" } = req.body || {};

  const roleIndex = loadJson(ROLE_INDEX, { ok: false, companies: [] });
  const questionIndex = loadJson(QUESTION_INDEX, { ok: false, questions: [] });

  if (!roleIndex.ok) {
    return res.json({
      ok: false,
      message: "Role dataset index missing. Run node src/scripts/buildCompanyRoleIndex.js"
    });
  }

  if (!questionIndex.ok || !Array.isArray(questionIndex.questions)) {
    return res.json({
      ok: false,
      message: "Interview question index missing. Run node src/scripts/buildInterviewQuestionIndex.js"
    });
  }

  if (!companyName || !roleName) {
    return res.json({
      ok: false,
      message: "Company and role are required."
    });
  }

  const company = findCompany(roleIndex, companyName);
  const role = findRole(company, roleName);

  if (!company || !role) {
    return res.json({
      ok: false,
      message: "Selected company/role not found in job dataset."
    });
  }

  const category = roleCategory(role.roleName);
  const roleSkills = cleanRoleSkills(role.roleName, role.skills || []);
  const matchedSkills = roleSkills.filter((skill) => skillPresent(skill, resumeText));
  const missingSkills = roleSkills.filter((skill) => !skillPresent(skill, resumeText));
  const roleMatchScore = Math.round((matchedSkills.length / Math.max(roleSkills.length, 1)) * 100);

  const context = {
    companyName: company.companyName,
    roleName: role.roleName,
    category,
    roleSkills,
    matchedSkills,
    missingSkills,
    resumeText
  };

  const questions = pickDatasetQuestions(context, questionIndex.questions);

  return res.json({
    ok: true,
    source: "Indian Job Market Dataset + Interview Question Datasets + Resume",
    companyName: company.companyName,
    roleName: role.roleName,
    category,
    roleSkills,
    matchedSkills,
    missingSkills,
    roleMatchScore,
    totalInterviewDatasetQuestions: questionIndex.totalQuestions || questionIndex.questions.length,
    questions
  });
});

router.post("/analyze-answer", (req, res) => {
  const { answer } = req.body || {};

  if (!answer || !displayText(answer)) {
    return res.json({ ok: false, message: "Answer is required." });
  }

  return res.json(analyzeAnswerLocal(answer, req.body.question || "", req.body.roleName || "", req.body.resumeText || ""));
});


function analyzeCodeAnswer({ code = "", question = "", expectedSkill = "" }) {
  const raw = String(code || "");
  const c = cleanText(raw);
  const q = cleanText(question);
  const skill = cleanText(expectedSkill);

  const mistakes = [];
  const feedback = [];

  let score = 20;

  if (raw.trim().length >= 40) score += 15;
  else mistakes.push("Code is too short. Write complete logic, not only one line.");

  if (/def |function |class |public static|#include|return |print|console\.log|cout|system\.out/.test(raw.toLowerCase())) {
    score += 15;
  } else {
    mistakes.push("Code should include proper function/logic and output/return.");
  }

  if (/todo|your code|write here|dummy/.test(c)) {
    score -= 20;
    mistakes.push("Remove placeholder/dummy code.");
  }

  if (/reverse string|reverse a string/.test(q)) {
    if (/reverse|\[::-1\]|reversed|split|join|for|while/.test(c)) score += 30;
    else mistakes.push("Reverse string logic is missing.");
  } else if (/palindrome/.test(q)) {
    if ((/reverse|\[::-1\]|reversed|split|join/.test(c)) && andCompare(c)) score += 30;
    else mistakes.push("Palindrome check should compare original string with reversed string.");
  } else if (/prime/.test(q)) {
    if (/%|mod|sqrt|for|while/.test(c) && /2|<=|<|range/.test(c)) score += 30;
    else mistakes.push("Prime logic should check divisibility from 2 to sqrt(n) and handle n <= 1.");
  } else if (/second largest/.test(q)) {
    if (/second|largest|max|sort|for|while/.test(c)) score += 30;
    else mistakes.push("Second largest logic is missing. Track largest and second largest.");
  } else if (/frequency/.test(q)) {
    if (/dict|map|object|counter|frequency|count|\{\}|for|while/.test(c)) score += 30;
    else mistakes.push("Frequency counting needs a hash map/dictionary/object.");
  } else {
    if (/if|for|while|return|print|console|cout/.test(c)) score += 25;
    else mistakes.push("Core programming logic is missing.");
  }

  if (/python/.test(skill)) {
    if (/def |print\(|return /.test(raw)) score += 10;
    else mistakes.push("For Python, use def/return/print properly.");
  }

  if (/javascript/.test(skill)) {
    if (/function |=>|console\.log|return /.test(raw)) score += 10;
    else mistakes.push("For JavaScript, use function/arrow function and return/console.log.");
  }

  if (/c\+\+|dsa/.test(skill)) {
    if (/#include|int main|cout|vector|return/.test(raw.toLowerCase())) score += 10;
  }

  score = Math.max(0, Math.min(score, 100));

  const correct = score >= 65 && mistakes.length <= 2;

  if (correct) {
    feedback.push("Code logic looks acceptable for interview level.");
  } else {
    feedback.push("Code is not strong enough. Fix the mistakes and try again.");
  }

  return {
    ok: true,
    correct,
    score,
    feedback,
    mistakes,
    spokenFeedback: correct
      ? "Good. Your code logic is acceptable. Moving to the next question."
      : `This code has mistakes. ${mistakes.slice(0, 2).join(" ")} Please correct it.`
  };
}

function andCompare(codeText) {
  return /==|===|equals|compare/.test(codeText);
}

router.post("/analyze-code", (req, res) => {
  const { code = "", question = "", expectedSkill = "" } = req.body || {};

  if (!displayText(code)) {
    return res.json({
      ok: false,
      message: "Code answer is required."
    });
  }

  return res.json(analyzeCodeAnswer({ code, question, expectedSkill }));
});


module.exports = router;
