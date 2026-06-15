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

function hasExactWord(text, word) {
  const escaped = String(word || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(String(text || ""));
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
    backend: ["Node.js", "Express.js", "Python", "REST API", "SQL", "MongoDB", "DBMS", "Authentication", "Debugging", "Git", "Unit Testing"],
    fullstack: ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "Express.js", "REST API", "SQL", "MongoDB", "DBMS", "Git", "Debugging"],
    software: ["Python", "C++", "Data Structures", "Algorithms", "Problem Solving", "OOPs", "DBMS", "Operating System", "Computer Networks", "System Design", "Git"],
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
    "rest api": ["rest api", "rest"],
    "api integration": ["api integration", "api", "rest api"],
    "data structures": ["data structures", "dsa", "algorithm", "algorithms"],
    "data structures and algorithms": ["data structures and algorithms", "dsa", "algorithm", "algorithms"],
    "problem solving": ["problem solving", "dsa", "algorithm", "algorithms"],
    "computer networks": ["computer networks", "cn", "networking"],
    "operating system": ["operating system", "os"],
    mongodb: ["mongodb", "mongo db"],
    javascript: ["javascript", "js"],
    oops: ["oops", "oop", "object oriented", "inheritance", "polymorphism", "encapsulation", "abstraction"],
    algorithms: ["algorithms", "algorithm", "dsa"],
    java: [" java ", "\njava\n", "\tjava\t"],
    "unit testing": ["unit testing", "jest", "testing"],
    git: ["git", "github"]
  };

  if (s === "java") {
    return hasExactWord(resumeText, "java") && !/javascript|java script/.test(cleanText(resumeText));
  }

  const checks = aliases[s] || [s];
  return checks.some((x) => {
    const cx = cleanText(x);
    if (["oop", "oops", "os", "cn", "dsa"].includes(cx)) {
      return hasExactWord(resumeText, cx);
    }
    return resume.includes(cx);
  });
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

  const fullText = `${roleName} ${(rawSkills || []).join(" ")}`;

  skills = skills.filter((skill) => {
    const s = cleanText(skill);

    if (s === "java") {
      return hasExactWord(fullText, "java") && !/javascript|java script/.test(cleanText(fullText));
    }

    return true;
  });

  return skills.slice(0, 14);
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

  for (const skill of skills) if (skill && q.includes(skill)) score += 20;
  for (const skill of matched) if (skill && q.includes(skill)) score += 25;
  for (const skill of missing) if (skill && q.includes(skill)) score += 25;

  if (/project|resume|experience|work|built|implemented/.test(q)) score += 10;

  return score;
}


function inferCodingLanguage(context) {
  const text = cleanText(`${context.roleName} ${context.resumeText} ${context.roleSkills.join(" ")}`);

  if (/c\+\+|cpp/.test(text)) return "C++";
  if (/python/.test(text)) return "Python";
  if (/javascript|react|node/.test(text)) return "JavaScript";
  if (hasExactWord(text, "java") && !/javascript|java script/.test(text)) return "Java";

  return "C++";
}



function hasAny(text, words) {
  const t = cleanText(text);
  return words.some((word) => t.includes(cleanText(word)));
}

function getResumeRoleTopicProfile(context) {
  const resume = cleanText(context.resumeText || "");
  const role = cleanText(context.roleName || "");
  const roleSkills = cleanText((context.roleSkills || []).join(" "));
  const matchedSkills = cleanText((context.matchedSkills || []).join(" "));
  const all = `${resume} ${role} ${roleSkills} ${matchedSkills}`;

  const profile = {
    cpp: hasAny(all, ["c++", "cpp", "stl", "pointer", "reference"]),
    java: (hasExactWord(all, "java") && !/javascript|java script/.test(all)) || hasAny(all, ["spring boot", "spring framework"]),
    python: hasAny(all, ["python", "pandas", "numpy", "flask", "django"]),
    dsa: hasAny(all, ["dsa", "data structures", "algorithm", "algorithms", "problem solving", "array", "linked list", "stack", "queue"]),
    oops: hasAny(all, ["oops", "oop", "object oriented", "class", "inheritance", "polymorphism"]),
    dbms: hasAny(all, ["dbms", "sql", "mysql", "database", "mongodb", "nosql"]),
    os: hasAny(all, ["operating system", "os", "process", "thread", "deadlock"]),
    cn: hasAny(all, ["computer networks", "networking", "tcp", "ip", "http", "https", "dns"]),
    react: hasAny(all, ["react", "react.js", "frontend", "vite", "redux", "hooks"]),
    javascript: hasAny(all, ["javascript", "js", "frontend", "node", "react"]),
    backend: hasAny(all, ["backend", "node", "express", "api", "rest", "server", "authentication"]),
    mongodb: hasAny(all, ["mongodb", "mongo db", "nosql"]),
    fullstack: hasAny(all, ["full stack", "fullstack", "mern", "frontend backend", "react node", "node react"]),
    datascience: hasAny(all, ["data science", "data analyst", "pandas", "numpy", "statistics", "eda", "visualization"]),
    aiml: hasAny(all, ["machine learning", "ml", "ai", "model", "classification", "regression", "scikit", "sklearn"]),
    genai: hasAny(all, ["genai", "gen ai", "generative ai", "llm", "rag", "prompt", "langchain", "huggingface", "transformer"]),
    cloud: hasAny(all, ["cloud", "aws", "azure", "gcp", "docker", "deployment", "render", "vercel", "ci/cd", "cicd"])
  };

  const softwareRole = hasAny(role, ["software", "sde", "developer", "engineer", "programmer", "full stack", "backend", "frontend"]);
  const dataRole = hasAny(role, ["data", "machine learning", "ai", "analyst", "scientist"]);
  const frontendRole = hasAny(role, ["frontend", "react", "ui", "web"]);
  const backendRole = hasAny(role, ["backend", "node", "api", "server"]);
  const fullstackRole = hasAny(role, ["full stack", "fullstack", "mern"]);

  // Role-based mandatory core only when role actually needs it.
  if (softwareRole) {
    profile.dsa = true;
    profile.oops = true;
    profile.dbms = true;
  }

  if (backendRole || fullstackRole) {
    profile.backend = true;
    profile.dbms = true;
  }

  if (frontendRole || fullstackRole) {
    profile.react = profile.react || hasAny(all, ["react", "javascript", "html", "css"]);
    profile.javascript = true;
  }

  if (dataRole) {
    profile.python = true;
    profile.datascience = true;
    profile.aiml = true;
  }

  return profile;
}

function realConceptQuestions(context) {
  const profile = getResumeRoleTopicProfile(context);
  const q = [];

  function add(topicKey, skill, question) {
    if (!profile[topicKey]) return;
    q.push([skill, question]);
  }

  // C++ only if C++ present in resume/role/skills
  add("cpp", "C++", "What is the difference between pointer and reference in C++?");
  add("cpp", "C++", "Explain constructor, destructor, and copy constructor in C++.");
  add("cpp", "C++", "What is STL in C++? Explain vector, map, set, and unordered_map.");
  add("cpp", "C++", "What is the difference between compile-time and runtime polymorphism in C++?");
  add("cpp", "C++", "Explain stack memory and heap memory in C++.");

  // Java only if Java present
  add("java", "Java", "Explain JVM, JDK, and JRE in Java.");
  add("java", "Java", "Explain class, object, constructor, inheritance, and interface in Java.");
  add("java", "Java", "What is exception handling in Java?");
  add("java", "Java", "What is the difference between ArrayList and LinkedList in Java?");

  // Python only if Python/Data role present
  add("python", "Python", "Explain list, tuple, set, and dictionary differences in Python.");
  add("python", "Python", "What is the difference between shallow copy and deep copy in Python?");
  add("python", "Python", "Explain exception handling in Python with try, except, else, and finally.");
  add("python", "Python", "What are lambda functions, list comprehension, and generators in Python?");
  add("python", "Python", "How do you read a CSV file and clean missing values in Python?");

  // Data Science only if data science present/role
  add("datascience", "Data Science", "What is data cleaning and why is it important before model training?");
  add("datascience", "Data Science", "Explain mean, median, mode, variance, and standard deviation.");
  add("datascience", "Data Science", "What is EDA and what steps do you follow in EDA?");
  add("datascience", "Data Science", "How do you handle missing values and outliers in a dataset?");
  add("datascience", "Data Science", "What are precision, recall, accuracy, and F1-score?");

  // AI/ML only if ML/AI present/role
  add("aiml", "Machine Learning", "What is the difference between classification and regression?");
  add("aiml", "Machine Learning", "Explain supervised, unsupervised, and reinforcement learning with examples.");
  add("aiml", "Machine Learning", "What is overfitting and how do you reduce it?");
  add("aiml", "Machine Learning", "What is train-test split and why is it used?");
  add("aiml", "Machine Learning", "Explain decision tree, random forest, and K-means at a basic level.");

  // GenAI only if GenAI/RAG/LLM present
  add("genai", "GenAI", "What is Generative AI and how is it different from traditional AI?");
  add("genai", "GenAI", "What is an LLM and what are tokens, prompt, and context window?");
  add("genai", "GenAI", "Explain prompt engineering with one good and one bad prompt example.");
  add("genai", "GenAI", "What is RAG and why is it useful?");
  add("genai", "GenAI", "What are hallucinations in LLMs and how can we reduce them?");

  // React/frontend only if React/frontend present/role
  add("react", "React.js", "Explain props, state, hooks, and components in React.");
  add("react", "React.js", "What is the difference between useState and useEffect?");
  add("react", "React.js", "How do you call an API in React and show loading/error states?");
  add("react", "React.js", "What is conditional rendering and list rendering in React?");
  add("react", "React.js", "How do you pass data from parent to child component in React?");

  add("javascript", "JavaScript", "Explain var, let, and const in JavaScript.");
  add("javascript", "JavaScript", "What is closure in JavaScript?");
  add("javascript", "JavaScript", "Explain promise, async-await, and event loop.");
  add("javascript", "JavaScript", "What is the difference between map, filter, and reduce?");

  // Backend/API only if backend/fullstack present/role
  add("backend", "Backend", "What is REST API? Explain GET, POST, PUT, PATCH, and DELETE.");
  add("backend", "Backend", "How do authentication and authorization work in a backend application?");
  add("backend", "Backend", "How do you handle validation, errors, and status codes in APIs?");
  add("backend", "Node.js", "What is Node.js and how does it handle asynchronous operations?");
  add("backend", "Express.js", "Explain middleware, routing, controllers, and request-response cycle in Express.");

  // MongoDB only if MongoDB present/role skills
  add("mongodb", "MongoDB", "What is MongoDB and how is it different from SQL databases?");
  add("mongodb", "MongoDB", "Explain collection, document, schema, ObjectId, and basic CRUD operations.");
  add("mongodb", "MongoDB", "What is indexing in MongoDB and why is it useful?");
  add("mongodb", "MongoDB", "How do you design a MongoDB schema for a user and orders system?");

  // Full Stack only if fullstack/MERN present
  add("fullstack", "Full Stack", "Explain how frontend, backend, database, and API connect in a MERN project.");
  add("fullstack", "Full Stack", "How does a login request flow from React frontend to backend and database?");
  add("fullstack", "Full Stack", "How do you deploy frontend and backend separately?");
  add("fullstack", "Full Stack", "How do you handle CORS and environment variables in full stack apps?");

  // Cloud only if cloud/deployment present
  add("cloud", "Cloud", "What is cloud computing and what are IaaS, PaaS, and SaaS?");
  add("cloud", "Cloud", "What is the difference between hosting frontend and backend?");
  add("cloud", "Cloud", "Explain environment variables and why they are important in deployment.");
  add("cloud", "Cloud", "What is Docker at a basic level and why do developers use it?");
  add("cloud", "Cloud", "What is CI/CD and how does it help in software deployment?");

  // Core CS only if software/backend/fullstack/developer role or resume has those topics
  add("dsa", "DSA", "Explain time complexity and space complexity with one simple example.");
  add("dsa", "DSA", "What is the difference between array and linked list?");
  add("dsa", "DSA", "What is the difference between stack and queue?");
  add("dsa", "DSA", "What is the difference between linear search and binary search?");

  add("oops", "OOPs", "Explain four pillars of OOPs with real project examples.");
  add("oops", "OOPs", "Explain method overloading and method overriding.");
  add("oops", "OOPs", "What is abstraction and encapsulation?");

  add("dbms", "DBMS", "Explain primary key, foreign key, joins, and normalization.");
  add("dbms", "DBMS", "What is the difference between SQL and NoSQL databases?");
  add("dbms", "DBMS", "What is indexing in a database and why is it useful?");

  add("os", "Operating System", "Explain process, thread, deadlock, and scheduling.");
  add("cn", "Computer Networks", "Explain TCP/IP, HTTP/HTTPS, DNS, and client-server architecture.");

  const seen = new Set();

  return q
    .filter(([skill, question]) => {
      const key = cleanText(question);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(([skill, question], index) => ({
      id: `concept-${index + 1}`,
      type: "Technical",
      answerMode: "voice",
      expectedSkill: skill,
      difficulty: "Easy/Medium Technical",
      sourceDataset: "Resume Skills + Selected Role + Job Dataset",
      question,
      goodAnswer: "Answer in simple words, give one example, and connect it with your project or role."
    }));
}

function datasetBasicQuestions(context, allQuestions) {
  const profile = getResumeRoleTopicProfile(context);

  const activeTopics = Object.entries(profile)
    .filter(([, yes]) => yes)
    .map(([key]) => key);

  const topicWords = {
    cpp: ["c++", "cpp", "stl", "pointer"],
    java: ["java", "jvm", "spring"],
    python: ["python"],
    dsa: ["dsa", "data structure", "algorithm"],
    oops: ["oops", "oop", "object oriented"],
    dbms: ["dbms", "sql", "database"],
    os: ["operating system", "process", "thread"],
    cn: ["network", "tcp", "http", "dns"],
    react: ["react", "frontend"],
    javascript: ["javascript", "js"],
    oops: ["oops", "oop", "object oriented", "inheritance", "polymorphism", "encapsulation", "abstraction"],
    algorithms: ["algorithms", "algorithm", "dsa"],
    java: [" java ", "\njava\n", "\tjava\t"],
    backend: ["backend", "node", "express", "api"],
    mongodb: ["mongodb", "mongo"],
    fullstack: ["full stack", "fullstack", "mern"],
    datascience: ["data science", "statistics", "eda"],
    aiml: ["machine learning", "ml", "ai"],
    genai: ["genai", "generative ai", "llm", "rag", "prompt"],
    cloud: ["cloud", "aws", "docker", "deployment"]
  };

  const allowedWords = activeTopics.flatMap((topic) => topicWords[topic] || []);

  if (!allowedWords.length) return [];

  const picked = [];

  for (const q of allQuestions || []) {
    const question = displayText(q.question || "");
    const clean = cleanText(`${q.question} ${q.role} ${q.skill} ${q.difficulty} ${q.sourceDataset}`);

    if (!question || question.length < 20) continue;
    if (!isGoodInterviewQuestion(q)) continue;
    if (/hard|expert|advanced/.test(clean)) continue;

    const relevant = allowedWords.some((word) => clean.includes(cleanText(word)));

    if (!relevant) continue;

    picked.push({
      id: q.id || `dataset-basic-${picked.length + 1}`,
      type: "Technical",
      answerMode: "voice",
      expectedSkill: q.skill || q.role || "Technical",
      difficulty: q.difficulty || "Easy/Medium",
      sourceDataset: q.sourceDataset || "Interview Dataset",
      question,
      goodAnswer: q.goodAnswer || "Explain basic concept with example and project use."
    });

    if (picked.length >= 8) break;
  }

  return picked;
}

function codingQuestionBank(context) {
  const language = inferCodingLanguage(context);

  return [
    {
      id: "code-array-swap",
      question: `Write code in ${language} to swap two elements in an array by index.`,
      goodAnswer: "Use a temporary variable or language-specific swap syntax.",
      expectedSkill: language
    },
    {
      id: "code-linear-search",
      question: `Write code in ${language} for linear search in an array.`,
      goodAnswer: "Loop through array and return index if target is found.",
      expectedSkill: language
    },
    {
      id: "code-binary-search",
      question: `Write code in ${language} for binary search in a sorted array.`,
      goodAnswer: "Use low, high, mid and reduce search space.",
      expectedSkill: language
    },
    {
      id: "code-palindrome",
      question: `Write code in ${language} to check whether a string is palindrome.`,
      goodAnswer: "Compare normalized string with reverse.",
      expectedSkill: language
    },
    {
      id: "code-prime",
      question: `Write code in ${language} to check whether a number is prime.`,
      goodAnswer: "Check divisibility from 2 to sqrt(n).",
      expectedSkill: language
    },
    {
      id: "code-second-largest",
      question: `Write code in ${language} to find the second largest element in an array.`,
      goodAnswer: "Track largest and second largest in one pass.",
      expectedSkill: language
    },
    {
      id: "code-frequency",
      question: `Write code in ${language} to count character frequency in a string.`,
      goodAnswer: "Use dictionary/map/object to count characters.",
      expectedSkill: language
    },
    {
      id: "code-reverse-string",
      question: `Write code in ${language} to reverse a string.`,
      goodAnswer: "Use loop/slicing/reverse method.",
      expectedSkill: language
    },
    {
      id: "code-factorial",
      question: `Write code in ${language} to find factorial of a number.`,
      goodAnswer: "Use loop or recursion and handle 0/1.",
      expectedSkill: language
    },
    {
      id: "code-missing-number",
      question: `Write code in ${language} to find the missing number from 1 to n in an array.`,
      goodAnswer: "Use sum formula or XOR approach.",
      expectedSkill: language
    },
    {
      id: "code-vowels-count",
      question: `Write code in ${language} to count vowels in a string.`,
      goodAnswer: "Loop through characters and count a/e/i/o/u.",
      expectedSkill: language
    },
    {
      id: "code-even-odd",
      question: `Write code in ${language} to separate even and odd numbers from an array.`,
      goodAnswer: "Use modulo operator and two arrays/lists.",
      expectedSkill: language
    }
  ];
}



function uniqueQuestionObjects(list) {
  const seen = new Set();
  return (list || []).filter((q) => {
    const key = cleanText(q.question || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}



function selectBalancedConceptQuestions(context, allQuestions) {
  const all = uniqueQuestionObjects([
    ...realConceptQuestions(context),
    ...datasetBasicQuestions(context, allQuestions)
  ]);

  const priority = [
    "C++",
    "Python",
    "React.js",
    "JavaScript",
    "Backend",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Full Stack",
    "DSA",
    "OOPs",
    "DBMS",
    "Operating System",
    "Computer Networks",
    "Machine Learning",
    "Data Science",
    "GenAI",
    "Cloud"
  ];

  const selected = [];
  const used = new Set();

  // First pass: pick 1 question from each active topic
  for (const skill of priority) {
    const found = all.find((q) => {
      const key = cleanText(q.question || "");
      return !used.has(key) && cleanText(q.expectedSkill || "").includes(cleanText(skill));
    });

    if (found) {
      selected.push(found);
      used.add(cleanText(found.question || ""));
    }

    if (selected.length >= 14) return selected;
  }

  // Second pass: fill remaining with role/resume relevant questions
  for (const q of all) {
    const key = cleanText(q.question || "");
    if (used.has(key)) continue;

    selected.push(q);
    used.add(key);

    if (selected.length >= 14) break;
  }

  return selected.slice(0, 14);
}


function pickDatasetQuestions(context, allQuestions) {
  const selected = [];

  function addQuestion(q, round, roundName, order) {
    selected.push({
      id: q.id || `r${round}-${order}`,
      round,
      roundName,
      roundOrder: order,
      type: q.type || "Technical",
      answerMode: q.answerMode || "voice",
      expectedSkill: q.expectedSkill || q.skill || "",
      role: q.role || context.roleName,
      difficulty: q.difficulty || "Medium",
      sourceDataset: q.sourceDataset || "Interview Dataset",
      question: q.question,
      goodAnswer: q.goodAnswer || ""
    });
  }

  // ROUND 1 — HR SCREENING: 6 questions
  [
    `Tell me about yourself for the ${context.roleName} role at ${context.companyName}. Connect your resume, projects, and strongest skills.`,
    `Why do you want to join ${context.companyName} for the ${context.roleName} role?`,
    `What are your top two strengths for the ${context.roleName} role? Give proof from your resume.`,
    "Tell me one improvement area and what you are doing to improve it.",
    "Describe a time when you worked in a team or handled a difficult situation.",
    "Are you comfortable with learning new technologies, deadlines, and project ownership?"
  ].forEach((question, i) => {
    addQuestion({
      id: `r1-${i + 1}`,
      type: "HR",
      answerMode: "voice",
      difficulty: "HR Screening",
      sourceDataset: "HR + Resume",
      question,
      goodAnswer: "Answer formally with resume proof and STAR format."
    }, 1, "Round 1: HR Screening", i + 1);
  });

  // ROUND 2 — TECHNICAL + CODING: 15 questions
  // 10 easy/medium concept questions + 5 basic coding questions
  const conceptQuestions = selectBalancedConceptQuestions(context, allQuestions);

  conceptQuestions.forEach((q, i) => {
    addQuestion(q, 2, "Round 2: Technical + Coding", i + 1);
  });

  const codeQuestions = codingQuestionBank(context).slice(0, 6);
  codeQuestions.forEach((q, i) => {
    addQuestion({
      ...q,
      type: "Coding",
      answerMode: "code",
      difficulty: "Basic Coding",
      sourceDataset: "Resume Skill + DSA Coding"
    }, 2, "Round 2: Technical + Coding", i + 15);
  });

  // ROUND 3 — RESUME + PROJECT DEEP DIVE: 5 questions
  const matched = context.matchedSkills.length ? context.matchedSkills : context.roleSkills;

  matched.slice(0, 3).forEach((skill, i) => {
    addQuestion({
      id: `r3-resume-${i + 1}`,
      type: "Technical",
      answerMode: "voice",
      difficulty: "Resume Based",
      sourceDataset: "Resume + Dataset Match",
      question: `Your resume shows ${skill}. Explain one project or task where you used ${skill}, your exact contribution, challenge faced, and final result.`,
      goodAnswer: "Use STAR format with exact contribution and outcome."
    }, 3, "Round 3: Resume & Project Deep Dive", i + 1);
  });

  addQuestion({
    id: "r3-project-main",
    type: "Technical",
    answerMode: "voice",
    difficulty: "Project Based",
    sourceDataset: "Resume Based",
    question: "Pick your strongest resume project and explain the problem, tech stack, architecture, your contribution, challenges, and final result.",
    goodAnswer: "Explain problem, tech stack, architecture, your work, challenge, and result."
  }, 3, "Round 3: Resume & Project Deep Dive", 4);

  addQuestion({
    id: "r3-project-improve",
    type: "Technical",
    answerMode: "voice",
    difficulty: "Project Based",
    sourceDataset: "Resume Based",
    question: "If you had to improve your project for production use, what changes would you make?",
    goodAnswer: "Mention scalability, authentication, database, testing, deployment, monitoring, and security."
  }, 3, "Round 3: Resume & Project Deep Dive", 5);

  // ROUND 4 — FINAL HR + READINESS: 7 questions
  const missing = context.missingSkills.slice(0, 3);

  missing.forEach((skill, i) => {
    addQuestion({
      id: `r4-gap-${i + 1}`,
      type: "HR",
      answerMode: "voice",
      difficulty: "Skill Gap",
      sourceDataset: "Missing Role Skill",
      question: `${skill} is required for this ${context.roleName} role, but it is not clearly visible in your resume. How will you learn it and prove it before joining?`,
      goodAnswer: "Accept gap honestly, explain learning plan and proof."
    }, 4, "Round 4: Final HR & Readiness", i + 1);
  });

  [
    `Why should we hire you for the ${context.roleName} role?`,
    "How do you handle pressure, deadlines, and feedback?",
    "Are you open to training, relocation, or working with different teams if required?",
    "What salary expectation or growth expectation do you have?",
    "If selected, how will you prepare yourself before joining?",
    "Do you have any questions for the interviewer?"
  ].forEach((question, i) => {
    addQuestion({
      id: `r4-final-${i + 1}`,
      type: "HR",
      answerMode: "voice",
      difficulty: "Final HR",
      sourceDataset: "HR Ideal Answer Dataset",
      question,
      goodAnswer: "Answer honestly, formally, and connect with role readiness."
    }, 4, "Round 4: Final HR & Readiness", missing.length + i + 1);
  });

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

  if (/project|built|developed|implemented|created|worked|used|designed/.test(text)) score += 18;
  else improve.push("You did not connect the answer with a real project, internship, or task.");

  if (/result|impact|improved|reduced|increased|accuracy|performance|optimized|learned/.test(text)) score += 15;
  else improve.push("You did not mention result, impact, metric, or learning.");

  if (/first|second|because|therefore|for example|finally|my approach/.test(text)) score += 10;
  else improve.push("Your answer needs better structure. Use STAR format.");

  const questionKeywords = q.split(" ").filter((w) => w.length > 4).slice(0, 10);
  const matchedQuestionWords = questionKeywords.filter((w) => text.includes(w));

  if (matchedQuestionWords.length >= 2) score += 10;
  else improve.push("Your answer is not specific enough to the question asked.");

  const roleWords = role.split(" ").filter((w) => w.length > 3);
  if (roleWords.some((w) => text.includes(w))) score += 5;

  const resumeWords = resume.split(" ").filter((w) => w.length > 5).slice(0, 80);
  const resumeMatch = resumeWords.filter((w) => text.includes(w)).slice(0, 5);
  if (resumeMatch.length >= 2) score += 7;

  score = Math.min(score, 100);

  if (score >= 75) feedback.push("Strong answer. It is clear, role-specific, and interview-ready.");
  else if (score >= 55) feedback.push("Average answer. It has some relevant points but needs stronger proof.");
  else feedback.push("Weak answer. It needs clear example, structure, and result.");

  const crossQuestion = score < 70
    ? "Can you give one real project example with your exact contribution and result?"
    : "";

  return {
    ok: true,
    score,
    feedback,
    improve,
    crossQuestion,
    spokenFeedback: improve.slice(0, 2).join(" ")
  };
}

function codeContainsAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

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

  if (codeContainsAny(raw.toLowerCase(), [/def /, /function /, /class /, /public static/, /#include/, /return /, /print/, /console\.log/, /cout/, /system\.out/])) {
    score += 15;
  } else {
    mistakes.push("Code should include proper function, return, or output.");
  }

  if (/todo|your code|write here|dummy/.test(c)) {
    score -= 20;
    mistakes.push("Remove placeholder or dummy code.");
  }

  if (/swap/.test(q)) {
    if (/temp|swap|\[.*\].*=|\w+,\s*\w+\s*=/.test(raw)) score += 30;
    else mistakes.push("Array swap logic is missing. Use temp variable or tuple/swap.");
  } else if (/linear search/.test(q)) {
    if (/for|while/.test(c) && /==|===|equals/.test(c)) score += 30;
    else mistakes.push("Linear search needs loop and comparison with target.");
  } else if (/binary search/.test(q)) {
    if (/low|high|mid|while|left|right/.test(c)) score += 30;
    else mistakes.push("Binary search needs low, high, mid and loop.");
  } else if (/palindrome/.test(q)) {
    if ((/reverse|\[::-1\]|reversed|split|join/.test(c)) && /==|===|equals/.test(c)) score += 30;
    else mistakes.push("Palindrome should compare original string with reversed string.");
  } else if (/prime/.test(q)) {
    if (/%|mod|sqrt|for|while/.test(c) && /2|range|<=|</.test(c)) score += 30;
    else mistakes.push("Prime logic should check divisibility from 2 to sqrt(n) and handle n <= 1.");
  } else if (/second largest/.test(q)) {
    if (/second|largest|max|sort|for|while/.test(c)) score += 30;
    else mistakes.push("Second largest logic is missing. Track largest and second largest.");
  } else if (/frequency/.test(q)) {
    if (/dict|map|object|counter|frequency|count|\{\}|for|while/.test(c)) score += 30;
    else mistakes.push("Frequency counting needs hash map, dictionary, or object.");
  } else if (/reverse string/.test(q)) {
    if (/reverse|\[::-1\]|reversed|split|join|for|while/.test(c)) score += 30;
    else mistakes.push("Reverse string logic is missing.");
  } else if (/factorial/.test(q)) {
    if (/for|while|recursion|return|factorial|\*/.test(c)) score += 30;
    else mistakes.push("Factorial needs loop or recursion and multiplication.");
  } else if (/missing number/.test(q)) {
    if (/sum|xor|total|for|while/.test(c)) score += 30;
    else mistakes.push("Missing number should use sum formula, loop, or XOR.");
  } else {
    if (/if|for|while|return|print|console|cout/.test(c)) score += 25;
    else mistakes.push("Core programming logic is missing.");
  }

  if (/python/.test(skill)) {
    if (/def |print\(|return /.test(raw)) score += 10;
    else mistakes.push("For Python, use def, return, or print properly.");
  }

  if (/javascript/.test(skill)) {
    if (/function |=>|console\.log|return /.test(raw)) score += 10;
    else mistakes.push("For JavaScript, use function/arrow function and return/console.log.");
  }

  if (/c\+\+/.test(skill)) {
    if (/#include|int main|cout|vector|return/.test(raw.toLowerCase())) score += 10;
  }

  score = Math.max(0, Math.min(score, 100));
  const correct = score >= 65 && mistakes.length <= 2;

  feedback.push(correct ? "Code logic looks acceptable for interview level." : "Code is not strong enough. Fix the mistakes and try again.");

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
    if (!req.file) return res.json({ ok: false, message: "No resume uploaded." });

    const name = req.file.originalname.toLowerCase();

    if (name.endsWith(".txt")) return res.json({ ok: true, extractedText: req.file.buffer.toString("utf8") });

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

  if (!roleIndex.ok) return res.json({ ok: false, message: "Role dataset index missing." });
  if (!questionIndex.ok || !Array.isArray(questionIndex.questions)) return res.json({ ok: false, message: "Interview question index missing." });
  if (!companyName || !roleName) return res.json({ ok: false, message: "Company and role are required." });

  const company = findCompany(roleIndex, companyName);
  const role = findRole(company, roleName);

  if (!company || !role) return res.json({ ok: false, message: "Selected company/role not found in job dataset." });

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
  if (!answer || !displayText(answer)) return res.json({ ok: false, message: "Answer is required." });
  return res.json(analyzeAnswerLocal(answer, req.body.question || "", req.body.roleName || "", req.body.resumeText || ""));
});

router.post("/analyze-code", (req, res) => {
  const { code = "", question = "", expectedSkill = "" } = req.body || {};
  if (!displayText(code)) return res.json({ ok: false, message: "Code answer is required." });
  return res.json(analyzeCodeAnswer({ code, question, expectedSkill }));
});

module.exports = router;
