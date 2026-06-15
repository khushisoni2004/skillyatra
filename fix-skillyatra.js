const fs = require("fs");
const path = require("path");

function write(file, content) {
  const full = path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("updated:", file);
}

write("backend/src/utils/normalize.js", `
const slugify = require("slugify");

const safe = (v = "") => String(v ?? "").trim();

const pick = (row, keys) => {
  for (const k of keys) {
    if (row && row[k] !== undefined && safe(row[k]) !== "") return row[k];
  }
  return "";
};

const normalizeText = (s = "") =>
  safe(s).replace(/\\s+/g, " ").toLowerCase();

const titleCase = (s = "") =>
  safe(s)
    .toLowerCase()
    .replace(/\\b\\w/g, (c) => c.toUpperCase());

const DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Recursion",
  "Searching",
  "Sorting",
  "Hashing",
  "Trees",
  "Binary Search Tree",
  "Heap / Priority Queue",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Sliding Window",
  "Two Pointers",
  "Bit Manipulation",
  "Math / Number Theory"
];

function looksLikeCodeOrStatement(text = "") {
  const t = safe(text);
  const lower = t.toLowerCase();

  if (!t || t.length < 3) return true;
  if (t.length > 140) return true;

  const badPatterns = [
    /#include\\s*</i,
    /class\\s+Solution/i,
    /public\\s*:/i,
    /private\\s*:/i,
    /int\\s+main\\s*\\(/i,
    /return\\s+/i,
    /select\\s+.+\\s+from\\s+/i,
    /inner\\s+join/i,
    /group\\s+by/i,
    /order\\s+by/i,
    /union\\s+all/i,
    /you\\s+are\\s+given/i,
    /write\\s+a\\s+program/i,
    /function\\s+should/i,
    /input\\s*:/i,
    /output\\s*:/i,
    /constraints\\s*:/i,
    /\\/\\*\\*/i,
    /\\{.*\\}/,
    /;\\s*$/
  ];

  if (badPatterns.some((r) => r.test(t))) return true;

  const codeChars = ["{", "}", ";", "->", "::", "==", "!=", "<=", ">=", "++"];
  const count = codeChars.filter((x) => t.includes(x)).length;
  if (count >= 2) return true;

  if (lower.split(" ").length > 18) return true;

  return false;
}

function normalizeDifficulty(v = "") {
  const x = safe(v).toLowerCase();
  if (["easy", "beginner", "basic", "school"].some((a) => x.includes(a))) return "Easy";
  if (["hard", "advanced", "expert"].some((a) => x.includes(a))) return "Hard";
  if (["medium", "intermediate", "moderate"].some((a) => x.includes(a))) return "Medium";
  return "Medium";
}

function inferPlatform(file = "", row = {}) {
  const f = file.toLowerCase();
  const p = safe(pick(row, ["platform", "Platform", "sourcePlatform", "source", "Source", "site"]));

  if (p) {
    const low = p.toLowerCase();
    if (low.includes("leetcode")) return "LeetCode";
    if (low.includes("hackerrank")) return "HackerRank";
    if (low.includes("codechef")) return "CodeChef";
    if (low.includes("gfg") || low.includes("geeks")) return "GeeksforGeeks";
    return titleCase(p);
  }

  if (f.includes("leetcode")) return "LeetCode";
  if (f.includes("hackerrank")) return "HackerRank";
  if (f.includes("codechef")) return "CodeChef";
  if (f.includes("gfg") || f.includes("geeks")) return "GeeksforGeeks";
  return "Other";
}

function inferTopic(row = {}) {
  const raw = safe(
    pick(row, [
      "topic",
      "Topic",
      "category",
      "Category",
      "tags",
      "Tags",
      "tag",
      "problem_tag",
      "pattern",
      "Pattern"
    ])
  ).toLowerCase();

  if (raw.includes("array")) return "Arrays";
  if (raw.includes("string")) return "Strings";
  if (raw.includes("linked")) return "Linked List";
  if (raw.includes("stack")) return "Stack";
  if (raw.includes("queue")) return "Queue";
  if (raw.includes("recursion")) return "Recursion";
  if (raw.includes("search")) return "Searching";
  if (raw.includes("sort")) return "Sorting";
  if (raw.includes("hash") || raw.includes("map")) return "Hashing";
  if (raw.includes("bst")) return "Binary Search Tree";
  if (raw.includes("tree")) return "Trees";
  if (raw.includes("heap") || raw.includes("priority")) return "Heap / Priority Queue";
  if (raw.includes("graph")) return "Graphs";
  if (raw.includes("dp") || raw.includes("dynamic")) return "Dynamic Programming";
  if (raw.includes("greedy")) return "Greedy";
  if (raw.includes("backtrack")) return "Backtracking";
  if (raw.includes("sliding")) return "Sliding Window";
  if (raw.includes("two pointer")) return "Two Pointers";
  if (raw.includes("bit")) return "Bit Manipulation";
  if (raw.includes("math") || raw.includes("number")) return "Math / Number Theory";

  return "Arrays";
}

function cleanTitle(row = {}) {
  const title = safe(
    pick(row, [
      "title",
      "Title",
      "problem_title",
      "Problem Title",
      "name",
      "Name",
      "question_title",
      "Question Title",
      "challenge_name",
      "Challenge Name"
    ])
  );

  if (title && !looksLikeCodeOrStatement(title)) return title;

  const slug = safe(pick(row, ["slug", "Slug", "titleSlug", "title_slug", "question_slug", "challenge_slug", "problem_slug"]));
  if (slug) {
    const fromSlug = slug
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\\b\\w/g, (c) => c.toUpperCase());
    if (!looksLikeCodeOrStatement(fromSlug)) return fromSlug;
  }

  const code = safe(pick(row, ["code", "problem_code", "problemCode", "Problem Code"]));
  if (code && code.length <= 20) return code.toUpperCase();

  return "";
}

function directUrl(platform, row = {}, title = "") {
  let url = safe(
    pick(row, [
      "url",
      "URL",
      "link",
      "Link",
      "problem_url",
      "problemUrl",
      "originalUrl",
      "Original URL",
      "href"
    ])
  );

  if (url.startsWith("http")) return url;

  const slug = safe(
    pick(row, [
      "slug",
      "Slug",
      "titleSlug",
      "title_slug",
      "question_slug",
      "challenge_slug",
      "problem_slug"
    ])
  );

  const code = safe(pick(row, ["code", "problem_code", "problemCode", "Problem Code"]));

  if (platform === "LeetCode" && (slug || title)) {
    return "https://leetcode.com/problems/" + (slug || slugify(title, { lower: true, strict: true })) + "/";
  }

  if (platform === "HackerRank" && slug) {
    return "https://www.hackerrank.com/challenges/" + slug + "/problem";
  }

  if (platform === "CodeChef" && (code || slug)) {
    return "https://www.codechef.com/problems/" + safe(code || slug).toUpperCase();
  }

  if (platform === "GeeksforGeeks" && url.startsWith("http")) {
    return url;
  }

  return "";
}

function splitList(v = "") {
  if (Array.isArray(v)) return v.map(safe).filter(Boolean);
  return safe(v).split(/[|,;]/).map(safe).filter(Boolean);
}

function normalizeDsaRow(row = {}, sourceDataset = "manual") {
  const platform = inferPlatform(sourceDataset, row);
  const title = cleanTitle(row);

  if (!title || looksLikeCodeOrStatement(title)) return null;

  const originalUrl = directUrl(platform, row, title);
  if (!originalUrl || !originalUrl.startsWith("http")) return null;

  const topic = inferTopic(row);
  const tagsRaw = pick(row, ["tags", "Tags", "tag", "topics", "Topics", "problem_tag"]);
  const tags = splitList(tagsRaw);
  const companies = splitList(pick(row, ["companies", "Companies", "company", "Company"]));

  return {
    title,
    topic,
    subTopic: safe(pick(row, ["subTopic", "sub_topic", "Sub Topic"])) || topic,
    difficulty: normalizeDifficulty(pick(row, ["difficulty", "Difficulty", "level", "Level"])),
    platform,
    sourcePlatform: platform,
    originalUrl,
    estimatedTime: Number(pick(row, ["estimatedTime", "time", "Time"])) || 30,
    companies,
    tags,
    pattern: safe(pick(row, ["pattern", "Pattern"])) || tags[0] || "Problem Solving",
    sourceDataset,
    lastVerifiedDate: new Date(),
    subject: "DSA"
  };
}

function normalizeAnswer(answer, options) {
  let a = safe(answer);
  if (!a) return "";

  const map = { A: 0, B: 1, C: 2, D: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
  const key = a.toUpperCase();

  if (map[key] !== undefined && options[map[key]]) return options[map[key]];

  a = a.replace(/^option\\s*/i, "").trim();
  if (map[a.toUpperCase()] !== undefined && options[map[a.toUpperCase()]]) {
    return options[map[a.toUpperCase()]];
  }

  return a;
}

function parseOptions(row = {}) {
  let options = [];
  const choices = pick(row, ["choices", "Choices", "options", "Options"]);

  if (choices) {
    try {
      const parsed = JSON.parse(choices);
      if (Array.isArray(parsed)) options = parsed.map(safe);
    } catch {
      options = String(choices)
        .split(/[|;]/)
        .map(safe)
        .filter(Boolean);
    }
  }

  if (options.length < 4) {
    options = [
      pick(row, ["optionA", "OptionA", "Option A", "A", "a", "option_1", "option1"]),
      pick(row, ["optionB", "OptionB", "Option B", "B", "b", "option_2", "option2"]),
      pick(row, ["optionC", "OptionC", "Option C", "C", "c", "option_3", "option3"]),
      pick(row, ["optionD", "OptionD", "Option D", "D", "d", "option_4", "option4"])
    ].map(safe).filter(Boolean);
  }

  return [...new Set(options)].filter((x) => x.length > 0 && x.length < 300);
}

function inferPracticeCategory(sourceDataset = "", row = {}) {
  const f = sourceDataset.toLowerCase();
  const raw = safe(pick(row, ["category", "Category", "section", "domain", "type"]));

  if (raw) return titleCase(raw);
  if (f.includes("aptitude")) return "Aptitude";
  if (f.includes("mcq")) return "Placement / NQT";
  if (f.includes("coding")) return "DSA Concepts";
  if (f.includes("technical")) return "Core CS";
  if (f.includes("hr") || f.includes("interview")) return "HR / Technical Interview";
  return "Practice";
}

function normalizePracticeRow(row = {}, sourceDataset = "manual") {
  const question = safe(
    pick(row, ["question", "Question", "questions", "Questions", "problem", "prompt", "Prompt"])
  );

  if (!question || question.length < 8 || question.length > 800) return null;
  if (/class\\s+Solution|#include|public\\s*:|select\\s+.+from/i.test(question)) return null;

  const options = parseOptions(row);
  if (options.length < 4) return null;

  const rawAnswer = pick(row, [
    "answer",
    "Answer",
    "correct_answer",
    "Correct Answer",
    "correctAnswer",
    "solution",
    "Solution",
    "ans"
  ]);

  const correctAnswer = normalizeAnswer(rawAnswer, options);

  if (!correctAnswer) return null;

  const isAnswerInOptions = options.some(
    (o) => normalizeText(o) === normalizeText(correctAnswer)
  );

  if (!isAnswerInOptions && correctAnswer.length > 150) return null;

  const category = inferPracticeCategory(sourceDataset, row);
  const subject = safe(pick(row, ["subject", "Subject"])) || category;
  const topic = safe(pick(row, ["topic", "Topic", "subTopic", "Sub Topic"])) || subject;

  return {
    question,
    options,
    correctAnswer,
    explanation:
      safe(pick(row, ["explanation", "Explanation", "rationale", "solutionExplanation"])) ||
      "Check the concept carefully and compare each option.",
    category,
    subject,
    topic,
    subTopic: safe(pick(row, ["subTopic", "sub_topic", "Sub Topic"])) || "",
    difficulty: normalizeDifficulty(pick(row, ["difficulty", "Difficulty", "level", "Level"])),
    type: "MCQ",
    sourceDataset,
    companyRelevance: splitList(pick(row, ["company", "companyRelevance", "Companies"])),
    examRelevance: splitList(pick(row, ["exam", "examRelevance"])),
    tags: splitList(pick(row, ["tags", "Tags"])),
    lastVerifiedDate: new Date()
  };
}

module.exports = {
  safe,
  pick,
  normalizeText,
  normalizeDsaRow,
  normalizePracticeRow,
  DSA_TOPICS
};
`);

write("backend/src/data/seed.js", `
require("dotenv").config();

const connectDB = require("../utils/db");
const User = require("../models/User");
const Resource = require("../models/Resource");
const Question = require("../models/Question");
const PracticeQuestion = require("../models/PracticeQuestion");
const CompanyPlan = require("../models/CompanyPlan");
const InterviewQuestion = require("../models/InterviewQuestion");

const dsa = require("./dsaDataset");
const practice = require("./practiceDataset");

const resources = [
  {
    title: "Love Babbar / CodeHelp DSA Playlists",
    description: "DSA placement preparation lectures by Love Babbar / CodeHelp.",
    subject: "DSA",
    topic: "DSA",
    type: "Video Playlist",
    level: "Beginner to Advanced",
    language: "Hindi",
    url: "https://www.youtube.com/@CodeHelp/playlists",
    usefulnessScore: 95,
    tags: ["DSA", "Love Babbar", "CodeHelp", "Placement"],
    companyRelevance: ["TCS", "Infosys", "Wipro", "Amazon", "Microsoft"]
  },
  {
    title: "Striver A2Z DSA Sheet",
    description: "Structured DSA roadmap and practice sheet by Striver / TakeUForward.",
    subject: "DSA",
    topic: "DSA Sheet",
    type: "Practice Sheet",
    level: "Beginner to Advanced",
    language: "English",
    url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    usefulnessScore: 98,
    tags: ["Striver", "TakeUForward", "DSA", "Placement"],
    companyRelevance: ["Amazon", "Microsoft", "Deloitte", "EY"]
  },
  {
    title: "TakeUForward YouTube Playlists",
    description: "DSA, system design, interview and placement preparation playlists.",
    subject: "DSA",
    topic: "Interview Preparation",
    type: "Video Playlist",
    level: "Intermediate",
    language: "English",
    url: "https://www.youtube.com/@takeUforward/playlists",
    usefulnessScore: 95,
    tags: ["Striver", "DSA", "Interview"]
  },
  {
    title: "CodeWithHarry Python Course",
    description: "Python lectures useful for beginner programming and placement basics.",
    subject: "Programming",
    topic: "Python",
    type: "Video Playlist",
    level: "Beginner",
    language: "Hindi",
    url: "https://www.youtube.com/@CodeWithHarry/playlists",
    usefulnessScore: 90,
    tags: ["Python", "CodeWithHarry", "Programming"]
  },
  {
    title: "React Official Learning",
    description: "Modern React documentation with concepts, hooks and project patterns.",
    subject: "Web Development",
    topic: "React",
    type: "Documentation",
    level: "Beginner to Advanced",
    language: "English",
    url: "https://react.dev/learn",
    usefulnessScore: 94,
    tags: ["React", "Frontend", "Hooks"]
  },
  {
    title: "JavaScript MDN Guide",
    description: "Complete JavaScript reference for frontend and interview preparation.",
    subject: "Web Development",
    topic: "JavaScript",
    type: "Documentation",
    level: "Beginner to Advanced",
    language: "English",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    usefulnessScore: 92,
    tags: ["JavaScript", "Frontend", "Web Dev"]
  },
  {
    title: "Node.js Official Docs",
    description: "Backend JavaScript documentation for APIs and server-side development.",
    subject: "Web Development",
    topic: "Node.js",
    type: "Documentation",
    level: "Intermediate",
    language: "English",
    url: "https://nodejs.org/en/learn",
    usefulnessScore: 88,
    tags: ["Node.js", "Backend", "Express"]
  },
  {
    title: "freeCodeCamp Web Development",
    description: "Full web development tutorials and project-based learning.",
    subject: "Web Development",
    topic: "Full Stack",
    type: "Video Lectures",
    level: "Beginner to Advanced",
    language: "English",
    url: "https://www.youtube.com/@freecodecamp/playlists",
    usefulnessScore: 91,
    tags: ["HTML", "CSS", "JavaScript", "React"]
  },
  {
    title: "Python Official Tutorial",
    description: "Official Python language tutorial for fundamentals and interviews.",
    subject: "Programming",
    topic: "Python",
    type: "Documentation",
    level: "Beginner",
    language: "English",
    url: "https://docs.python.org/3/tutorial/",
    usefulnessScore: 90,
    tags: ["Python", "Programming"]
  },
  {
    title: "Kaggle Learn Data Science",
    description: "Free micro-courses for Python, Pandas, ML and Data Visualization.",
    subject: "Data Science",
    topic: "Data Science",
    type: "Course",
    level: "Beginner",
    language: "English",
    url: "https://www.kaggle.com/learn",
    usefulnessScore: 92,
    tags: ["Data Science", "Python", "Pandas", "ML"]
  },
  {
    title: "Google Machine Learning Crash Course",
    description: "Free machine learning crash course for AIML fundamentals.",
    subject: "AIML",
    topic: "Machine Learning",
    type: "Course",
    level: "Beginner to Intermediate",
    language: "English",
    url: "https://developers.google.com/machine-learning/crash-course",
    usefulnessScore: 93,
    tags: ["AI", "ML", "AIML"]
  },
  {
    title: "DBMS GeeksforGeeks",
    description: "DBMS notes for normalization, SQL, indexing, transactions and interviews.",
    subject: "Core CS",
    topic: "DBMS",
    type: "Notes",
    level: "Placement",
    language: "English",
    url: "https://www.geeksforgeeks.org/dbms/",
    usefulnessScore: 90,
    tags: ["DBMS", "SQL", "Core CS"]
  },
  {
    title: "Operating System GeeksforGeeks",
    description: "OS concepts: processes, threads, scheduling, deadlock, memory management.",
    subject: "Core CS",
    topic: "OS",
    type: "Notes",
    level: "Placement",
    language: "English",
    url: "https://www.geeksforgeeks.org/operating-systems/",
    usefulnessScore: 90,
    tags: ["OS", "Core CS", "Interview"]
  },
  {
    title: "Computer Networks GeeksforGeeks",
    description: "CN topics: OSI, TCP/IP, routing, DNS, HTTP, congestion control.",
    subject: "Core CS",
    topic: "CN",
    type: "Notes",
    level: "Placement",
    language: "English",
    url: "https://www.geeksforgeeks.org/computer-network-tutorials/",
    usefulnessScore: 90,
    tags: ["CN", "Networking", "Core CS"]
  },
  {
    title: "Computer Organization and Architecture",
    description: "COA topics: instruction cycle, memory hierarchy, pipelining and cache.",
    subject: "Core CS",
    topic: "COA",
    type: "Notes",
    level: "Placement",
    language: "English",
    url: "https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/",
    usefulnessScore: 86,
    tags: ["COA", "Core CS"]
  }
];

const companies = [
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Capgemini",
  "Cognizant",
  "Deloitte",
  "EY",
  "HCL",
  "LTIMindtree",
  "Hexaware",
  "Amazon",
  "Microsoft"
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Resource.deleteMany({}),
    Question.deleteMany({}),
    PracticeQuestion.deleteMany({}),
    CompanyPlan.deleteMany({}),
    InterviewQuestion.deleteMany({})
  ]);

  await User.create([
    {
      name: "Demo Student",
      email: "student@skillyatra.in",
      password: "password123",
      role: "student",
      profile: {
        college: "SGSITS Indore",
        branch: "IT",
        year: "Final Year",
        skillLevel: "Beginner",
        targetGoal: "Placement",
        targetCompany: "TCS",
        dailyTime: "2 hours",
        preferredLanguage: "Hinglish",
        weakAreas: ["DP", "Aptitude"],
        strongAreas: ["Web Development"]
      }
    },
    {
      name: "Admin",
      email: "admin@skillyatra.in",
      password: "admin123",
      role: "admin"
    }
  ]);

  await Question.insertMany(dsa, { ordered: false }).catch(() => {});
  await PracticeQuestion.insertMany(practice, { ordered: false }).catch(() => {});
  await Resource.insertMany(resources, { ordered: false }).catch(() => {});

  await CompanyPlan.insertMany(
    companies.map((c) => ({
      companyName: c,
      companyType: ["Amazon", "Microsoft"].includes(c) ? "Product" : "Service / Consulting",
      eligibilityNote: "Company patterns are admin-updatable. Verify latest official notification before applying.",
      testPattern: "Aptitude + coding + technical interview + HR",
      aptitudeTopics: ["Percentages", "Time & Work", "Reasoning", "Number Series"],
      codingLevel: ["Amazon", "Microsoft"].includes(c) ? "Medium to Hard" : "Easy to Medium",
      interviewTopics: ["DSA", "OOP", "DBMS", "OS", "CN", "Projects"],
      hrQuestions: ["Tell me about yourself", "Why should we hire you?", "Explain your project"],
      crashPlan7: [
        "Day 1: company pattern + aptitude basics",
        "Day 2: arrays + strings",
        "Day 3: DBMS + SQL",
        "Day 4: OS + CN",
        "Day 5: resume and project explanation",
        "Day 6: mock coding",
        "Day 7: HR + revision"
      ],
      plan30: [
        "10 days aptitude",
        "10 days DSA",
        "5 days core CS",
        "5 days mock interviews"
      ],
      difficulty: ["Amazon", "Microsoft"].includes(c) ? "Hard" : "Medium",
      focusStrategy: "Build accuracy, revise weak topics, solve real platform problems and track progress daily.",
      trendingSkills: ["JavaScript", "SQL", "React", "Python", "DSA", "DBMS"],
      lastUpdated: new Date()
    }))
  );

  await InterviewQuestion.insertMany([
    {
      question: "Tell me about yourself.",
      type: "HR",
      answerFormat: "Present + education + skills + project + target role",
      badAnswer: "Only personal details without career connection.",
      goodAnswer: "I am an IT final-year student. I have worked on React and Node projects and I am preparing for software development roles. My main strengths are problem solving, web development and consistency.",
      tips: ["Keep it under 90 seconds", "Connect your answer with the job role"]
    },
    {
      question: "Explain your final-year project.",
      type: "HR",
      answerFormat: "Problem + solution + tech stack + your role + result",
      badAnswer: "It is just a website.",
      goodAnswer: "My project solves a real student/user problem using a full-stack approach. I handled frontend, backend APIs and database integration, and focused on usability and deployment.",
      tips: ["Mention your exact contribution", "Mention technologies clearly"]
    },
    {
      question: "Explain REST API.",
      type: "Technical",
      answerFormat: "Definition + HTTP methods + example from project",
      badAnswer: "API means app only.",
      goodAnswer: "REST is an architectural style where resources are accessed using HTTP methods like GET, POST, PUT and DELETE. For example, /api/auth/login can be used for user login.",
      tips: ["Give project example", "Mention status codes"]
    },
    {
      question: "Difference between SQL and NoSQL.",
      type: "Technical",
      answerFormat: "Structure + schema + scaling + example",
      badAnswer: "SQL is old and NoSQL is new.",
      goodAnswer: "SQL databases are relational and use structured tables, while NoSQL databases store flexible document/key-value data. SQL is good for structured transactions, MongoDB is good for flexible JSON-like data.",
      tips: ["Use MySQL and MongoDB examples"]
    }
  ]);

  console.log("Seed completed successfully.");
  console.log("Demo student: student@skillyatra.in / password123");
  console.log("Demo admin: admin@skillyatra.in / admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
`);

write("frontend/src/pages/Resources.jsx", `
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import api from "../lib/api";

const subjects = [
  "All",
  "DSA",
  "Web Development",
  "Programming",
  "AIML",
  "Data Science",
  "Core CS"
];

const coreTopics = ["All", "DBMS", "CN", "OS", "COA", "DSA"];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [subject, setSubject] = useState("All");
  const [coreTopic, setCoreTopic] = useState("All");
  const [search, setSearch] = useState("");

  async function load() {
    const params = {};
    if (subject !== "All") params.subject = subject;
    if (subject === "Core CS" && coreTopic !== "All") params.topic = coreTopic;

    const { data } = await api.get("/resources", { params });
    setResources(data || []);
  }

  useEffect(() => {
    load();
  }, [subject, coreTopic]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const text = \`\${r.title} \${r.description} \${r.subject} \${r.topic} \${(r.tags || []).join(" ")}\`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [resources, search]);

  function openResource(url) {
    if (!url) return alert("Resource link missing");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Resource Library</h1>
        <p className="text-slate-500">
          Open real lectures, playlists, documentation and core subject notes directly.
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSubject(s);
                setCoreTopic("All");
              }}
              className={\`px-4 py-2 rounded-xl font-bold border \${
                subject === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200"
              }\`}
            >
              {s}
            </button>
          ))}
        </div>

        {subject === "Core CS" && (
          <div className="flex flex-wrap gap-2">
            {coreTopics.map((t) => (
              <button
                key={t}
                onClick={() => setCoreTopic(t)}
                className={\`px-4 py-2 rounded-xl font-bold border \${
                  coreTopic === t
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                }\`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            className="input pl-11"
            placeholder="Search React, Python, DBMS, OS, DSA, AIML..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <div key={r._id} className="card hover:shadow-lg transition">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">{r.title}</h2>
                <p className="text-slate-600 mt-1">{r.description}</p>
              </div>
              <span className="h-fit px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                {r.usefulnessScore || 80}%
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge">{r.subject}</span>
              <span className="badge">{r.topic}</span>
              <span className="badge">{r.type}</span>
              <span className="badge">{r.level}</span>
              <span className="badge">{r.language}</span>
            </div>

            <button
              onClick={() => openResource(r.url)}
              className="btn mt-5 flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Open Resource
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center text-slate-500">
          No resources found. Run <b>npm run seed</b> again.
        </div>
      )}
    </div>
  );
}
`);

write("frontend/src/pages/DSA.jsx", `
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import api from "../lib/api";

export default function DSA() {
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    topic: "",
    difficulty: "",
    platform: "",
    pattern: ""
  });

  async function load() {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });

    const [qRes, pRes] = await Promise.all([
      api.get("/resources/questions", { params }),
      api.get("/progress")
    ]);

    setQuestions(qRes.data || []);
    setProgress(pRes.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const solvedSet = useMemo(() => {
    return new Set(
      progress
        .filter((p) => p.itemType === "DSA Question" && p.solved)
        .map((p) => String(p.itemId))
    );
  }, [progress]);

  const stats = useMemo(() => {
    const submitted = questions.filter((q) => solvedSet.has(String(q._id))).length;
    return {
      total: questions.length,
      submitted,
      remaining: questions.length - submitted
    };
  }, [questions, solvedSet]);

  async function markDone(q) {
    await api.post("/progress", {
      itemId: q._id,
      itemType: "DSA Question",
      title: q.title,
      status: "Submitted",
      solved: true,
      completed: true,
      submittedAt: new Date()
    });
    await load();
  }

  function openQuestion(q) {
    if (!q.originalUrl || !q.originalUrl.startsWith("http")) {
      alert("Original problem link missing or invalid.");
      return;
    }
    window.open(q.originalUrl, "_blank", "noopener,noreferrer");
  }

  const topics = ["Arrays", "Strings", "Linked List", "Stack", "Queue", "Trees", "Graphs", "Dynamic Programming", "Greedy", "Backtracking", "Sliding Window", "Two Pointers", "Bit Manipulation"];
  const platforms = ["LeetCode", "GeeksforGeeks", "HackerRank", "CodeChef"];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Real Platform DSA Tracker</h1>
        <p className="text-slate-500">
          Open original platform questions directly. SkillYatra only tracks your solved progress.
        </p>
      </div>

      <div className="card grid md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            className="input pl-11"
            placeholder="Search question"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <select className="input" value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
          <option value="">All topics</option>
          {topics.map((x) => <option key={x}>{x}</option>)}
        </select>

        <select className="input" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="">All difficulty</option>
          {difficulties.map((x) => <option key={x}>{x}</option>)}
        </select>

        <select className="input" value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}>
          <option value="">All platforms</option>
          {platforms.map((x) => <option key={x}>{x}</option>)}
        </select>

        <button className="btn md:col-span-5" onClick={load}>Apply Filters</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-slate-500 font-bold">Total Questions</p>
          <h2 className="text-3xl font-black">{stats.total}</h2>
        </div>
        <div className="card">
          <p className="text-slate-500 font-bold">Submitted</p>
          <h2 className="text-3xl font-black text-emerald-600">{stats.submitted}</h2>
        </div>
        <div className="card">
          <p className="text-slate-500 font-bold">Remaining</p>
          <h2 className="text-3xl font-black">{stats.remaining}</h2>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Question</th>
              <th className="p-4 text-left">Topic</th>
              <th className="p-4 text-left">Platform</th>
              <th className="p-4 text-left">Difficulty</th>
              <th className="p-4 text-left">Pattern</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Open</th>
              <th className="p-4 text-left">Mark Done</th>
            </tr>
          </thead>

          <tbody>
            {questions.map((q, i) => {
              const solved = solvedSet.has(String(q._id));
              return (
                <tr key={q._id} className="border-t hover:bg-slate-50">
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4 font-bold text-slate-900 max-w-md">
                    <div className="line-clamp-2">{q.title}</div>
                    {q.originalUrl && (
                      <div className="text-xs text-slate-400 mt-1 truncate">{q.originalUrl}</div>
                    )}
                  </td>
                  <td className="p-4">{q.topic}</td>
                  <td className="p-4">{q.platform}</td>
                  <td className="p-4"><span className="badge">{q.difficulty}</span></td>
                  <td className="p-4">{q.pattern}</td>
                  <td className="p-4">{solved ? "Submitted" : "Not Attempted"}</td>
                  <td className="p-4">
                    <button onClick={() => openQuestion(q)} className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => markDone(q)} className="btn">
                      Mark Done
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {questions.length === 0 && (
          <div className="text-center p-10 text-slate-500">
            No DSA questions found. Run backend import again.
          </div>
        )}
      </div>
    </div>
  );
}
`);

write("frontend/src/pages/Practice.jsx", `
import { useEffect, useState } from "react";
import api from "../lib/api";

const categories = [
  "All",
  "Aptitude",
  "Core CS",
  "Programming Languages",
  "DSA Concepts",
  "Placement / NQT",
  "HR / Technical Interview"
];

export default function Practice() {
  const [questions, setQuestions] = useState([]);
  const [summary, setSummary] = useState({});
  const [category, setCategory] = useState("All");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);

  async function load() {
    const params = { limit: 200 };
    if (category !== "All") params.category = category;

    const [qRes, sRes] = await Promise.all([
      api.get("/practice/questions", { params }),
      api.get("/practice/summary")
    ]);

    setQuestions(qRes.data || []);
    setSummary(sRes.data || {});
    setIndex(0);
    setSelected("");
    setResult(null);
  }

  useEffect(() => {
    load();
  }, [category]);

  const q = questions[index];

  async function submitAnswer() {
    if (!q || !selected) return alert("Select one option first.");

    const { data } = await api.post("/practice/attempt", {
      questionId: q._id,
      selectedAnswer: selected,
      timeTaken: 30
    });

    setResult(data);
    const s = await api.get("/practice/summary");
    setSummary(s.data || {});
  }

  function next() {
    setIndex((i) => Math.min(i + 1, questions.length - 1));
    setSelected("");
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Practice MCQ Hub</h1>
        <p className="text-slate-500">
          Solve aptitude, core CS, programming, DSA concept and interview MCQs inside SkillYatra.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <div className="card"><p>Total MCQs</p><h2 className="text-3xl font-black">{summary.total || 0}</h2></div>
        <div className="card"><p>Attempted</p><h2 className="text-3xl font-black">{summary.attempted || 0}</h2></div>
        <div className="card"><p>Correct</p><h2 className="text-3xl font-black text-emerald-600">{summary.correct || 0}</h2></div>
        <div className="card"><p>Accuracy</p><h2 className="text-3xl font-black">{summary.accuracy || 0}%</h2></div>
        <div className="card"><p>Remaining</p><h2 className="text-3xl font-black">{summary.remaining || 0}</h2></div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={\`px-4 py-2 rounded-xl font-bold border \${
                category === c
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200"
              }\`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {!q && (
        <div className="card text-center text-slate-500">
          No valid MCQs found. Your dataset rows must contain question, 4 options and correct answer.
          Run <b>npm run import:all</b> again after copying datasets.
        </div>
      )}

      {q && (
        <div className="card max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge">{q.category}</span>
            <span className="badge">{q.subject}</span>
            <span className="badge">{q.topic}</span>
            <span className="badge">{q.difficulty}</span>
          </div>

          <h2 className="text-xl font-black text-slate-900">
            Q{index + 1}. {q.question}
          </h2>

          <div className="grid gap-3 mt-5">
            {(q.options || []).map((opt) => {
              const active = selected === opt;
              const correct = result && opt === result.correctAnswer;
              const wrong = result && selected === opt && !result.isCorrect;

              return (
                <button
                  key={opt}
                  onClick={() => !result && setSelected(opt)}
                  className={\`text-left p-4 rounded-xl border font-semibold \${
                    correct
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : wrong
                      ? "bg-red-50 border-red-400 text-red-800"
                      : active
                      ? "bg-indigo-50 border-indigo-400 text-indigo-800"
                      : "bg-white border-slate-200"
                  }\`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {result && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50">
              <p className={result.isCorrect ? "text-emerald-700 font-black" : "text-red-700 font-black"}>
                {result.isCorrect ? "Correct Answer" : "Wrong Answer"}
              </p>
              <p><b>Correct:</b> {result.correctAnswer}</p>
              <p className="mt-2"><b>Explanation:</b> {result.explanation}</p>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            {!result && <button className="btn" onClick={submitAnswer}>Submit Answer</button>}
            {result && <button className="btn" onClick={next}>Next Question</button>}
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log("\\nPatch applied. Now run the reset/import commands shown by ChatGPT.");
