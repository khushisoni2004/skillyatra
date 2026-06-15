import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

import { BACKEND_BASE } from "../lib/config";
import {
  fallbackRolesForCompany,
  getAllCompanyPool,
  mergeCompanyLists,
  normalizeCompanyName,
  rankCompanies
} from "../lib/companySearch";
const API_BASE = BACKEND_BASE;

const INTERVIEW_COMPANIES_CACHE_KEY = "skillyatra_interview_companies_cache_v3";

const INTERVIEW_INSTANT_COMPANIES = [
  {
    companyName: "Google",
    totalJobCount: 75,
    roles: [
      { roleName: "Software Engineer III, Front End", jobCount: 1, skills: ["React.js", "Data Structures", "Programming"] },
      { roleName: "Cloud Engineer AI", jobCount: 3, skills: ["Python", "Machine Learning", "Cloud Computing"] },
      { roleName: "Analyst, Trust and Safety", jobCount: 2, skills: ["Python", "Data Analysis", "SQL"] }
    ]
  },
  {
    companyName: "Amazon",
    totalJobCount: 248,
    roles: [
      { roleName: "Software Development Engineer", jobCount: 5, skills: ["C++", "Coding", "Computer Science"] },
      { roleName: "Software Dev Engineer", jobCount: 3, skills: ["Python", "C++", "Distributed Computing"] },
      { roleName: "Financial Analyst", jobCount: 3, skills: ["Excel", "Data Analysis", "Business Analysis"] }
    ]
  },
  {
    companyName: "Microsoft",
    totalJobCount: 80,
    roles: [
      { roleName: "Software Engineer", jobCount: 3, skills: ["C#", ".NET", "Azure"] },
      { roleName: "Cloud Engineer", jobCount: 2, skills: ["Azure", "Networking", "Cloud"] }
    ]
  },
  {
    companyName: "Infosys",
    totalJobCount: 120,
    roles: [
      { roleName: "System Engineer", jobCount: 8, skills: ["Java", "SQL", "Web Development"] },
      { roleName: "Specialist Programmer", jobCount: 4, skills: ["DSA", "Java", "Problem Solving"] }
    ]
  },
  {
    companyName: "TCS",
    totalJobCount: 150,
    roles: [
      { roleName: "Assistant System Engineer", jobCount: 10, skills: ["Java", "SQL", "Aptitude"] },
      { roleName: "Digital Role", jobCount: 5, skills: ["DSA", "React", "Node.js"] }
    ]
  },
  {
    companyName: "Wipro",
    totalJobCount: 110,
    roles: [
      { roleName: "Project Engineer", jobCount: 6, skills: ["Java", "Python", "SQL"] }
    ]
  },
  {
    companyName: "Accenture",
    totalJobCount: 130,
    roles: [
      { roleName: "Associate Software Engineer", jobCount: 7, skills: ["Java", "Cloud", "Communication"] }
    ]
  }
];

function readInterviewCompaniesCache() {
  try {
    const raw = sessionStorage.getItem(INTERVIEW_COMPANIES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.companies) ? parsed.companies : null;
  } catch {
    return null;
  }
}

function writeInterviewCompaniesCache(companies) {
  try {
    sessionStorage.setItem(
      INTERVIEW_COMPANIES_CACHE_KEY,
      JSON.stringify({ time: Date.now(), companies: Array.isArray(companies) ? companies : [] })
    );
  } catch {}
}


const INTERVIEW_EXTRA_COMPANIES = [
  { companyName: "IBM", totalJobCount: 90, roles: [{ roleName: "Software Engineer", jobCount: 4, skills: ["Java", "Python", "SQL"] }] },
  { companyName: "Flipkart", totalJobCount: 60, roles: [{ roleName: "Software Development Engineer", jobCount: 4, skills: ["DSA", "Java", "System Design"] }] },
  { companyName: "Deloitte", totalJobCount: 85, roles: [{ roleName: "Analyst", jobCount: 5, skills: ["SQL", "Excel", "Data Analysis"] }] },
  { companyName: "HCL", totalJobCount: 70, roles: [{ roleName: "Software Engineer", jobCount: 3, skills: ["Java", "SQL", "Support"] }] },
  { companyName: "Tech Mahindra", totalJobCount: 75, roles: [{ roleName: "Associate Software Engineer", jobCount: 3, skills: ["Java", "Python", "DBMS"] }] },
  { companyName: "LTIMindtree", totalJobCount: 65, roles: [{ roleName: "Graduate Engineer Trainee", jobCount: 3, skills: ["Aptitude", "Java", "SQL"] }] },
  { companyName: "Mastercard", totalJobCount: 40, roles: [{ roleName: "Software Engineer", jobCount: 2, skills: ["Java", "Spring Boot", "SQL"] }] },
  { companyName: "Oracle", totalJobCount: 55, roles: [{ roleName: "Application Developer", jobCount: 3, skills: ["Java", "Oracle", "SQL"] }] },
  { companyName: "Adobe", totalJobCount: 45, roles: [{ roleName: "Software Engineer", jobCount: 2, skills: ["DSA", "JavaScript", "React"] }] },
  { companyName: "Paytm", totalJobCount: 35, roles: [{ roleName: "Backend Engineer", jobCount: 2, skills: ["Node.js", "MongoDB", "API"] }] },
  { companyName: "PhonePe", totalJobCount: 38, roles: [{ roleName: "Software Engineer", jobCount: 2, skills: ["Java", "DSA", "Microservices"] }] },
  { companyName: "Zomato", totalJobCount: 34, roles: [{ roleName: "Software Engineer", jobCount: 2, skills: ["React", "Node.js", "SQL"] }] },
  { companyName: "Swiggy", totalJobCount: 32, roles: [{ roleName: "Software Engineer", jobCount: 2, skills: ["Java", "DSA", "System Design"] }] }
];

const COMPANY_ALIAS_MAP = {
  ibm: ["international business machines", "ibm india"],
  flipkart: ["flip kart", "flipkart internet"],
  deloitte: ["deloitte usi", "deloitte india", "deloitte consulting", "deloitree", "deloitee"],
  tcs: ["tata consultancy services", "tata consultancy service"],
  capgemini: ["cap gemini"],
  cognizant: ["cts", "cognizant technology solutions"],
  hcl: ["hcltech", "hcl technologies"],
  techmahindra: ["tech mahindra"],
  ltimindtree: ["lti", "mindtree", "lti mindtree"],
  mastercard: ["master card"],
  phonepe: ["phone pe"]
};

function normalizeCompany(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCompanyAliases(name = "") {
  return COMPANY_ALIAS_MAP[normalizeCompany(name)] || [];
}

function uniqueCompanies(list = []) {
  const map = new Map();

  list.forEach((item) => {
    if (!item?.companyName) return;
    const key = normalizeCompany(item.companyName);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, item);
    } else {
      map.set(key, {
        ...existing,
        ...item,
        roles: Array.isArray(item.roles) && item.roles.length ? item.roles : existing.roles,
        totalJobCount:
          Number(item.totalJobCount || 0) > Number(existing.totalJobCount || 0)
            ? item.totalJobCount
            : existing.totalJobCount
      });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    String(a.companyName || "").localeCompare(String(b.companyName || ""))
  );
}

function readCompaniesFromAnyCache() {
  const keys = [
    INTERVIEW_COMPANIES_CACHE_KEY,
    "skillyatra_companies_cache_v7",
    "skillyatra_companies_cache_v6",
    "skillyatra_companies_cache_v5",
    "skillyatra_companies_cache_v2"
  ];

  const all = [];

  try {
    keys.forEach((key) => {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const list =
        parsed?.companies ||
        parsed?.data?.companies ||
        parsed?.data?.data?.companies ||
        [];

      if (Array.isArray(list)) all.push(...list);
    });
  } catch {}

  return uniqueCompanies([
    ...INTERVIEW_INSTANT_COMPANIES,
    ...INTERVIEW_EXTRA_COMPANIES,
    ...all
  ]);
}

function writeAllInterviewCompanies(companies) {
  const finalList = uniqueCompanies(companies);

  try {
    sessionStorage.setItem(
      INTERVIEW_COMPANIES_CACHE_KEY,
      JSON.stringify({ time: Date.now(), companies: finalList })
    );
  } catch {}

  return finalList;
}

function companySearchScore(company, query) {
  const q = normalizeCompany(query);
  if (!q) return 0;

  const name = normalizeCompany(company?.companyName || "");
  const aliases = getCompanyAliases(company?.companyName || "").map(normalizeCompany);
  const all = [name, ...aliases].filter(Boolean);

  if (all.some((item) => item === q)) return 100;
  if (all.some((item) => item.startsWith(q))) return 95;
  if (all.some((item) => item.includes(q))) return 88;

  // small typo support
  let best = 0;
  all.forEach((item) => {
    if (!item) return;

    let same = 0;
    const min = Math.min(q.length, item.length);
    for (let i = 0; i < min; i += 1) {
      if (q[i] === item[i]) same += 1;
    }

    const similarity = same / Math.max(q.length, item.length);
    if (similarity >= 0.55) best = Math.max(best, Math.round(similarity * 70));
  });

  return best;
}

function instantRolesForCompany(companyName) {
  return [
    { roleName: "Software Engineer", jobCount: 4, skills: ["DSA", "Java", "Python", "SQL"] },
    { roleName: "Associate Software Engineer", jobCount: 3, skills: ["Programming", "OOPs", "DBMS", "Aptitude"] },
    { roleName: "Data Analyst", jobCount: 3, skills: ["Excel", "SQL", "Python", "Data Analysis"] },
    { roleName: `${companyName} Interview Preparation`, jobCount: 1, skills: ["HR Questions", "Projects", "Communication"] }
  ];
}


function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    danger: "bg-rose-50 text-rose-700 ring-rose-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    primary: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    dark: "bg-slate-900 text-white ring-slate-800"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
}

function cleanText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/react\.js/g, "reactjs")
    .replace(/node\.js/g, "nodejs")
    .replace(/c\+\+/g, "cplusplus")
    .replace(/c#/g, "csharp")
    .replace(/\.net/g, "dotnet")
    .replace(/[^a-z0-9\s+#./-]/g, " ")
    .replace(/[./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function uniqueSkillList(list) {
  const seen = new Set();

  return (list || [])
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item) => {
      const key = cleanText(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function isActualTechnicalSkill(skill) {
  const s = cleanText(skill);

  if (!s) return false;

  const genericSkills = new Set([
    "software development",
    "software design",
    "technical support",
    "software engineering",
    "project management",
    "team management",
    "software management",
    "management",
    "leadership",
    "communication",
    "good communication",
    "problem solving",
    "analytical skills",
    "team work",
    "teamwork",
    "collaboration",
    "coordination",
    "documentation",
    "client handling",
    "customer handling",
    "business understanding",
    "domain knowledge",
    "training",
    "support",
    "development",
    "design",
    "engineering"
  ]);

  if (genericSkills.has(s)) return false;

  if (
    s.includes("management") ||
    s.includes("technical support") ||
    s.includes("software development") ||
    s.includes("software engineering") ||
    s.includes("software design")
  ) {
    return false;
  }

  return true;
}

function actualTechnicalSkillList(list) {
  return uniqueSkillList(list).filter(isActualTechnicalSkill);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseExists(phrase, resumeClean) {
  const clean = cleanText(phrase);
  if (!clean || !resumeClean) return false;

  const parts = clean.split(" ").filter(Boolean);
  if (!parts.length) return false;

  const pattern = parts.map(escapeRegExp).join("\\s+");
  const regex = new RegExp(`(^|\\s)${pattern}(\\s|$)`, "i");
  return regex.test(resumeClean);
}

function skillInResume(skill, resumeText) {
  const skillClean = cleanText(skill);
  const resumeClean = cleanText(resumeText);

  if (!skillClean || !resumeClean) return false;

  const aliases = {
    javascript: ["javascript", "js"],
    react: ["react", "reactjs", "react js"],
    reactjs: ["react", "reactjs", "react js"],
    node: ["node", "nodejs", "node js"],
    "node.js": ["node", "nodejs", "node js"],
    mongodb: ["mongodb", "mongo db", "mongo"],
    sql: ["sql", "mysql", "postgresql", "database queries"],
    mysql: ["mysql", "sql"],
    java: ["java"],
    python: ["python"],
    html: ["html"],
    css: ["css"],
    express: ["express", "expressjs", "express js"],
    fastapi: ["fastapi", "fast api"],
    flask: ["flask"],
    api: ["api", "rest api", "apis"],
    git: ["git", "github"],
    github: ["github", "git"],
    docker: ["docker"],
    postman: ["postman"],
    jira: ["jira"],
    "machine learning": ["machine learning", "ml"],
    "computer vision": ["computer vision", "opencv"],
    opencv: ["opencv", "computer vision"],
    numpy: ["numpy"],
    pandas: ["pandas"],
    sap: ["sap", "sap fi", "sap fico"],
    oracle: ["oracle", "oracle database"],
    servicenow: ["servicenow", "service now"],
    ".net": ["dotnet", ".net", "asp net", "aspnet"],
    dotnet: ["dotnet", ".net", "asp net", "aspnet"],
    excel: ["excel", "ms excel", "microsoft excel"],
    powerbi: ["powerbi", "power bi"],
    "power bi": ["powerbi", "power bi"],
    crm: ["crm", "customer relationship management"]
  };

  const checks = aliases[skillClean] || [skillClean];
  return checks.some((word) => phraseExists(word, resumeClean));
}

function getRoleSkillsForInterview(selectedRoleData, questionStats) {
  return actualTechnicalSkillList([
    ...(selectedRoleData?.skills || []),
    ...(selectedRoleData?.requiredSkills || []),
    ...(selectedRoleData?.topSkills || []),
    ...(questionStats?.roleSkills || []),
    ...(questionStats?.requiredSkills || []),
    ...(questionStats?.targetSkills || []),
    ...(questionStats?.matchedSkills || []),
    ...(questionStats?.missingSkills || [])
  ]);
}

function formatTime(value) {
  const min = Math.floor(value / 60);
  const sec = value % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function scoreAnswerLocally(answer) {
  const text = cleanText(answer);
  const words = String(answer || "").trim().split(/\s+/).filter(Boolean);

  const feedback = [];
  const improve = [];

  let score = 30;

  if (words.length >= 35) score += 25;
  else improve.push("Answer is short. Explain in 35-70 words with example.");

  if (/project|built|developed|implemented|created|worked|used/.test(text)) score += 20;
  else improve.push("Add one project, internship, or real task example.");

  if (/result|impact|improved|reduced|increased|accuracy|performance|learned/.test(text)) score += 15;
  else improve.push("Add result or impact.");

  if (/because|therefore|for example|first|second|finally/.test(text)) score += 10;
  else improve.push("Structure your answer clearly.");

  score = Math.min(score, 100);

  feedback.push(score >= 70 ? "Good interview answer." : "Needs improvement before real interview.");

  return {
    ok: true,
    score,
    feedback,
    improve
  };
}

export default function InterviewCoach() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const postureTimerRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const lastPostureVoiceRef = useRef(0);

  const [companies, setCompanies] = useState(() => getAllCompanyPool());
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeRound, setActiveRound] = useState(1);
  const [questionStats, setQuestionStats] = useState(null);

  const [answer, setAnswer] = useState("");
  const [answerReport, setAnswerReport] = useState(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [postureStatus, setPostureStatus] = useState("Camera off");
  const [postureScore, setPostureScore] = useState(0);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [error, setError] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [codeReport, setCodeReport] = useState(null);

  const activeQuestion = questions[activeIndex];
  const isCodingQuestion = activeQuestion?.answerMode === "code" || activeQuestion?.type === "Coding";

  const roundList = [
    { round: 1, name: "Round 1: HR Screening", expected: 6 },
    { round: 2, name: "Round 2: Technical + Coding", expected: 15 },
    { round: 3, name: "Round 3: Resume & Project Deep Dive", expected: 5 },
    { round: 4, name: "Round 4: Final HR & Readiness", expected: 7 }
  ];

  const questionsByRound = roundList.map((round) => {
    const items = questions.filter((q) => Number(q.round || 1) === round.round);
    const answered = interviewHistory.filter((h) => Number(h.round || 1) === round.round).length;

    return {
      ...round,
      items,
      total: items.length,
      answered,
      complete: items.length > 0 && answered >= items.length
    };
  });

  function isRoundUnlocked(roundNo) {
    if (roundNo === 1) return true;

    return questionsByRound
      .filter((r) => r.round < roundNo)
      .every((r) => r.complete);
  }

  function openRound(roundNo) {
    if (!isRoundUnlocked(roundNo)) {
      setError(`Complete Round ${roundNo - 1} first. Real interview rounds cannot be skipped.`);
      speakText(`Please complete round ${roundNo - 1} first.`);
      return;
    }

    const firstIndex = questions.findIndex((q) => Number(q.round || 1) === roundNo);

    if (firstIndex >= 0) {
      setActiveRound(roundNo);
      setActiveIndex(firstIndex);
      setAnswer("");
      setAnswerReport(null);
      setCodeAnswer("");
      setCodeReport(null);
      setError("");
    }
  }

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim();

    if (!q) {
      return uniqueCompanies(companies).slice(0, 300);
    }

    return uniqueCompanies(companies)
      .map((company) => ({
        company,
        score: companySearchScore(company, q)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.company.companyName || "").localeCompare(
          String(b.company.companyName || "")
        );
      })
      .map((item) => item.company)
      .slice(0, 300);
  }, [companies, companySearch]);

  const selectedCompanyData = useMemo(() => {
    return companies.find(
      (company) => normalizeCompany(company.companyName) === normalizeCompany(selectedCompany)
    );
  }, [companies, selectedCompany]);

  const roles =
    Array.isArray(selectedCompanyData?.roles) && selectedCompanyData.roles.length
      ? selectedCompanyData.roles
      : selectedCompany
        ? instantRolesForCompany(selectedCompany)
        : [];

  const selectedRoleData = useMemo(() => {
    return roles.find((role) => role.roleName === selectedRole) || null;
  }, [roles, selectedRole]);

  const interviewRequiredSkills = useMemo(() => {
    return getRoleSkillsForInterview(selectedRoleData, questionStats);
  }, [selectedRoleData, questionStats]);

  const interviewMatchedSkills = useMemo(() => {
    return actualTechnicalSkillList(
      interviewRequiredSkills.filter((skill) => skillInResume(skill, resumeText))
    );
  }, [interviewRequiredSkills, resumeText]);

  const interviewMissingSkills = useMemo(() => {
    return actualTechnicalSkillList(
      interviewRequiredSkills.filter((skill) => !skillInResume(skill, resumeText))
    );
  }, [interviewRequiredSkills, resumeText]);

  const interviewResumeMatchScore = useMemo(() => {
    const total = interviewMatchedSkills.length + interviewMissingSkills.length;
    if (!selectedRole || !resumeText.trim() || !total) return "--";
    return `${Math.round((interviewMatchedSkills.length / total) * 100)}%`;
  }, [selectedRole, resumeText, interviewMatchedSkills, interviewMissingSkills]);


  const resumeWordCount = resumeText.trim()
    ? resumeText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  async function loadCompanies() {
    const instant = getAllCompanyPool();
    setCompanies(instant);
    setLoading(false);

    const urls = [
      `${API_BASE}/api/interview/companies`,
      `${API_BASE}/api/resume/companies`,
      `${API_BASE}/api/companies?limit=50000`,
      `${API_BASE}/companies?limit=50000`
    ];

    urls.forEach((url) => {
      fetch(url, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      })
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data?.companies) ? data.companies : [];
          if (!list.length) return;

          setCompanies((prev) => mergeCompanyLists(prev, list));
        })
        .catch(() => {});
    });
  }

  useEffect(() => {
    loadCompanies();

    return () => {
      stopCamera();
      stopVoice();
      stopListening(false);
    };
  }, []);

  useEffect(() => {
    if (!interviewStarted) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted]);

  async function uploadResumeFile(file) {
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setQuestions([]);
      setQuestionStats(null);

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_BASE}/api/interview/extract-resume`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Could not read resume file.");
        return;
      }

      setResumeText(data.extractedText || "");
    } catch {
      setError("Resume upload failed. Check backend /api/interview/extract-resume.");
    } finally {
      setUploading(false);
    }
  }

  async function startCamera() {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
      setPostureStatus("Detecting face posture... sit straight and look at camera.");
      setPostureScore(50);
      startPostureLoop();
    } catch {
      setCameraOn(false);
      setPostureStatus("Camera blocked");
      setError("Camera permission denied. Allow camera and microphone from Chrome address bar.");
    }
  }

  function stopCamera() {
    if (postureTimerRef.current) {
      clearInterval(postureTimerRef.current);
      postureTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setPostureStatus("Camera off");
    setPostureScore(0);
  }

  
async function initFaceLandmarker() {
    if (faceLandmarkerRef.current) return faceLandmarkerRef.current;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      try {
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });
      } catch {
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });
      }

      return faceLandmarkerRef.current;
    } catch (err) {
      setPostureStatus("Face model not loaded. Check internet once.");
      setPostureScore(40);
      return null;
    }
  }

  function speakPostureWarning(message) {
    const now = Date.now();

    if (now - lastPostureVoiceRef.current < 9000) return;
    if (speaking || listening) return;

    lastPostureVoiceRef.current = now;
    speakText(message);
  }

  function startPostureLoop() {
    if (postureTimerRef.current) clearInterval(postureTimerRef.current);

    postureTimerRef.current = setInterval(async () => {
      const video = videoRef.current;

      if (!video || !streamRef.current || video.readyState < 2) {
        setPostureStatus("Camera not ready.");
        setPostureScore(20);
        return;
      }

      const detector = await initFaceLandmarker();

      if (!detector) {
        setPostureStatus("Advanced posture detector not ready.");
        setPostureScore(45);
        return;
      }

      try {
        const result = detector.detectForVideo(video, performance.now());
        const face = result.faceLandmarks?.[0];

        if (!face || !face.length) {
          setPostureStatus("Face not visible. Look at the camera.");
          setPostureScore(25);
          speakPostureWarning("I cannot see your face clearly. Please look at the camera.");
          return;
        }

        const nose = face[1];
        const leftEye = face[33];
        const rightEye = face[263];
        const forehead = face[10];
        const chin = face[152];

        const eyeMidX = (leftEye.x + rightEye.x) / 2;
        const eyeTilt = Math.abs(leftEye.y - rightEye.y);
        const sideLook = nose.x - eyeMidX;
        const faceHeight = Math.abs(chin.y - forehead.y);

        let score = 100;
        const issues = [];

        if (nose.x < 0.34 || nose.x > 0.66) {
          score -= 22;
          issues.push("keep your face in center");
        }

        if (nose.y < 0.22) {
          score -= 16;
          issues.push("sit slightly lower");
        }

        if (nose.y > 0.67) {
          score -= 18;
          issues.push("sit straight, do not bend down");
        }

        if (Math.abs(sideLook) > 0.035) {
          score -= 25;
          issues.push(sideLook > 0 ? "do not look right side" : "do not look left side");
        }

        if (eyeTilt > 0.035) {
          score -= 14;
          issues.push("keep your head straight");
        }

        if (faceHeight < 0.22) {
          score -= 12;
          issues.push("come closer to camera");
        }

        score = Math.max(15, Math.min(100, Math.round(score)));

        setPostureScore(score);

        if (score >= 85) {
          setPostureStatus("Good posture. Face centered and straight.");
        } else if (score >= 65) {
          setPostureStatus(`Improve posture: ${issues.slice(0, 2).join(", ")}.`);
          speakPostureWarning(`Please ${issues[0] || "sit straight and look at the camera"}.`);
        } else {
          setPostureStatus(`Bad posture: ${issues.slice(0, 3).join(", ")}.`);
          speakPostureWarning(`Posture alert. Please ${issues.slice(0, 2).join(" and ")}.`);
        }
      } catch (err) {
        setPostureStatus("Posture detection running. Keep face clear.");
        setPostureScore(60);
      }
    }, 1800);
  }

  function getInterviewVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];

    return (
      voices.find((voice) => /female|zira|samantha|victoria|karen|moira|tessa/i.test(voice.name)) ||
      voices.find((voice) => /en/i.test(voice.lang)) ||
      voices[0]
    );
  }

  function speakText(text, onEnd) {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getInterviewVoice();

    if (voice) utterance.voice = voice;

    utterance.lang = "en-IN";
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopVoice() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }


  function getRoundQuestionSpeech(question) {
    if (!question?.question) return "";

    const roundName = String(
      question.roundName || `Round ${question.round || activeRound}`
    ).trim();

    return `${roundName}. ${question.question}`;
  }

  function speakQuestion() {
    if (!activeQuestion?.question) return;

    speakText(getRoundQuestionSpeech(activeQuestion), () => {
      if (autoMode) setTimeout(() => startListening(), 700);
    });
  }


  function startListening() {
    try {
      setError("");
      setVoiceStatus("");
      setAnswerReport(null);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("Voice answer works best in Chrome. Allow microphone.");
        return;
      }

      stopVoice();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      transcriptRef.current = "";
      setAnswer("");

      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setVoiceStatus("Listening... answer like a real interview.");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalText = transcriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) finalText += transcript + " ";
          else interim += transcript;
        }

        transcriptRef.current = finalText;
        setAnswer((finalText + interim).trim());
      };

      recognition.onerror = (event) => {
        setListening(false);
        setVoiceStatus("");

        if (event.error === "aborted") {
          return;
        }

        if (event.error === "no-speech") {
          setError("No voice detected. Speak clearly and try again.");
          return;
        }

        setError(`Voice recognition error: ${event.error}. Allow microphone and try again.`);
      };

      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setError("Could not start voice answer. Use Chrome and allow microphone.");
    }
  }

  function stopListening(shouldAnalyze = true) {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListening(false);
    setVoiceStatus("");

    if (shouldAnalyze) {
      setTimeout(() => {
        const finalAnswer = transcriptRef.current.trim() || answer.trim();

        if (!finalAnswer) {
          setError("No voice answer detected. Speak again clearly.");
          speakText("I could not hear your answer clearly. Please answer again.");
          return;
        }

        analyzeAnswer(finalAnswer, true);
      }, 500);
    }
  }

  async function generateQuestions() {
    try {
      setError("");
      setQuestions([]);
      setQuestionStats(null);
      setActiveIndex(0);
      setActiveRound(1);
      setAnswer("");
      setAnswerReport(null);
      setInterviewHistory([]);
      setFinalReport(null);
      setCodeAnswer("");
      setCodeReport(null);

      if (!selectedCompany) {
        setError("Search and select company first.");
        return;
      }

      if (!selectedRole) {
        setError("Select role first.");
        return;
      }

      setQuestionLoading(true);

      const res = await fetch(`${API_BASE}/api/interview/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyName: selectedCompany,
          roleName: selectedRole,
          resumeText,
          seed: Date.now()
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Questions not loaded.");
        return;
      }

      const cleanQuestions = (data.questions || [])
        .filter((question) => question.type === "HR" || question.type === "Technical")
        .filter((question) => String(question.question || "").trim().length > 10)
        ;

      setQuestions(cleanQuestions);
      setQuestionStats(data);
      setActiveIndex(0);
      setAnswer("");
      setAnswerReport(null);

      setTimeout(() => {
        speakText("Interview questions are ready. Start the camera and begin your mock interview.");
      }, 400);
    } catch {
      setError("Failed to generate questions. Check backend.");
    } finally {
      setQuestionLoading(false);
    }
  }

  async function analyzeAnswer(customAnswer = "", fromVoice = false) {
    try {
      setError("");
      setAnswerReport(null);

      const finalAnswer = (customAnswer || answer).trim();

      if (!finalAnswer) {
        setError("Write or speak your answer first.");
        speakText("Please answer first.");
        return;
      }

      setAnswer(finalAnswer);
      setAnalyzing(true);

      let data = null;

      try {
        const res = await fetch(`${API_BASE}/api/interview/analyze-answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            answer: finalAnswer,
            question: activeQuestion?.question,
            roleName: selectedRole,
            resumeText
          })
        });

        data = await res.json();
      } catch {
        data = scoreAnswerLocally(finalAnswer);
      }

      if (!data?.ok) data = scoreAnswerLocally(finalAnswer);

      setAnswerReport(data);

      if (fromVoice) {
        const entry = {
          question: activeQuestion?.question || "",
          answer: finalAnswer,
          score: data.score || 0,
          feedback: data.feedback || [],
          improve: data.improve || [],
          type: activeQuestion?.type || "Interview",
          round: activeQuestion?.round || activeRound,
          questionId: activeQuestion?.id || activeIndex
        };

        setInterviewHistory((prev) => [...prev, entry]);

        const mistakes = (data.improve || []).slice(0, 2).join(" ");
        const scoreText = `Your score is ${data.score || 0} percent.`;

        if ((data.score || 0) >= 70) {
          speakText(`Good answer. ${scoreText} Moving to the next question.`, () => {
            setTimeout(() => goNext(true), 800);
          });
        } else {
          speakText(`This answer needs improvement. ${scoreText} Mistake: ${mistakes || "Add a clear example, role skill, and result."} Please answer again more clearly.`);
        }
      }
    } catch {
      setError("Answer analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  
async function analyzeCodeAnswer() {
    try {
      setError("");
      setCodeReport(null);

      if (!codeAnswer.trim()) {
        setError("Write your code answer first.");
        speakText("Please write your code first, then submit.");
        return;
      }

      setAnalyzing(true);

      const res = await fetch(`${API_BASE}/api/interview/analyze-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: codeAnswer,
          question: activeQuestion?.question || "",
          expectedSkill: activeQuestion?.expectedSkill || "",
          roleName: selectedRole,
          resumeText
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Code analysis failed.");
        return;
      }

      setCodeReport(data);

      const entry = {
        question: activeQuestion?.question || "",
        answer: codeAnswer,
        score: data.score || 0,
        feedback: data.feedback || [],
        improve: data.mistakes || [],
        type: "Coding",
        round: activeQuestion?.round || activeRound,
        questionId: activeQuestion?.id || activeIndex
      };

      setInterviewHistory((prev) => [...prev, entry]);

      if (data.correct) {
        speakText(data.spokenFeedback || "Good code. Moving to the next question.", () => {
          setTimeout(() => goNext(true), 800);
        });
      } else {
        speakText(data.spokenFeedback || "There are mistakes in your code. Please correct them.");
      }
    } catch (err) {
      setError("Code analysis failed. Check backend.");
    } finally {
      setAnalyzing(false);
    }
  }

function goNext(autoSpeak = false) {
    stopVoice();
    stopListening(false);
    setAnswer("");
    setAnswerReport(null);
    setCodeAnswer("");
    setCodeReport(null);

    setActiveIndex((prev) => {
      if (prev >= questions.length - 1) {
        finishInterview();
        return prev;
      }

      const next = Math.min(prev + 1, questions.length - 1);
      const currentRoundNo = Number(questions[prev]?.round || 1);
      const nextRoundNo = Number(questions[next]?.round || 1);

      if (nextRoundNo > currentRoundNo) {
        const currentRoundQuestions = questions.filter((q) => Number(q.round || 1) === currentRoundNo);
        const answeredCurrentRound = interviewHistory.filter((h) => Number(h.round || 1) === currentRoundNo).length;

        if (answeredCurrentRound < currentRoundQuestions.length - 1) {
          setError(`Complete Round ${currentRoundNo} first.`);
          speakText(`Please complete round ${currentRoundNo} first.`);
          return prev;
        }

        setActiveRound(nextRoundNo);
        speakText(`Round ${currentRoundNo} completed. Starting round ${nextRoundNo}.`);
      }

      if (autoSpeak && questions[next]) {
        setTimeout(() => {
          speakText(getRoundQuestionSpeech(questions[next]), () => {
            if (autoMode) setTimeout(() => startListening(), 700);
          });
        }, 500);
      }

      return next;
    });
  }

  function goPrev() {
    stopVoice();
    stopListening(false);
    setAnswer("");
    setAnswerReport(null);

    setActiveIndex((prev) => {
      const nextIndex = Math.max(prev - 1, 0);
      const q = questions[nextIndex];

      if (q) {
        setTimeout(() => {
          speakText(getRoundQuestionSpeech(q), () => {
            if (autoMode) setTimeout(() => startListening(), 700);
          });
        }, 300);
      }

      return nextIndex;
    });
  }


  
function finishInterview() {
    stopVoice();
    stopListening(false);
    setInterviewStarted(false);

    const total = interviewHistory.length;
    const avg = total
      ? Math.round(interviewHistory.reduce((sum, item) => sum + (item.score || 0), 0) / total)
      : 0;

    const weakAnswers = interviewHistory.filter((item) => (item.score || 0) < 70);
    const strongAnswers = interviewHistory.filter((item) => (item.score || 0) >= 70);

    const report = {
      total,
      averageScore: avg,
      strongAnswers: strongAnswers.length,
      weakAnswers: weakAnswers.length,
      verdict:
        avg >= 75
          ? "Interview Ready"
          : avg >= 55
            ? "Needs Practice"
            : "High Improvement Required",
      improvements: uniqueText([
        ...weakAnswers.flatMap((item) => item.improve || []),
        "Use STAR format: Situation, Task, Action, Result.",
        "Give project examples from your resume.",
        "Mention tools, skills, and measurable outcome.",
        "Keep posture straight and speak formally."
      ]).slice(0, 6)
    };

    setFinalReport(report);

    speakText(
      `Interview completed. Your average score is ${avg} percent. Verdict: ${report.verdict}. Main improvement: ${report.improvements[0] || "Practice with project based answers."}`
    );
  }

  function uniqueText(list) {
    const seen = new Set();
    return (list || []).filter(Boolean).filter((item) => {
      const key = String(item).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

function startInterview() {
    if (!activeQuestion) {
      setError("Generate questions first.");
      return;
    }

    if (!cameraOn) {
      setError("Start camera first for face-to-face mock interview.");
      return;
    }

    setAutoMode(true);
    setInterviewStarted(true);
    speakQuestion();
  }

  return (
    <main className="sy-interview-theme min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-7">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-700 p-7 text-white shadow-2xl shadow-indigo-200">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
          <div className="absolute -bottom-28 left-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-indigo-200">
              Interview Coach
            </p>
            <h1 className="mt-3 text-[34px] font-black leading-tight sm:text-[42px]">
              FaceFit Interview Room
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-indigo-100">
              Role-wise real interview rounds with camera, voice, coding answers, posture check and final feedback.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Interview Target</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Select company and role from dataset.
                </p>
              </div>
              {false && loading && <Badge type="primary">Loading...</Badge>}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-black text-slate-700">Search Company</label>
              <input
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setSelectedCompany("");
                  setSelectedRole("");
                  setRoleMenuOpen(false);
                  setQuestions([]);
                  setQuestionStats(null);
                  setError("");
                }}
                placeholder="Search company..."
                className="w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {companySearch.trim() && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800">Matching Companies</h3>
                  <span className="text-xs font-bold text-slate-500">{filteredCompanies.length} results</span>
                </div>

                {filteredCompanies.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                    No company found for "{companySearch}".
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto rounded-[28px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredCompanies.map((company, index) => {
                        const active = selectedCompany === company.companyName;

                        return (
                          <button
                            key={`${company.companyName}-${index}`}
                            type="button"
                            onClick={() => {
                              const safeRoles =
                                Array.isArray(company.roles) && company.roles.length
                                  ? company.roles
                                  : instantRolesForCompany(company.companyName);

                              setSelectedCompany(company.companyName);
                              setSelectedRole("");
                              setRoleMenuOpen(false);
                              setQuestions([]);
                              setQuestionStats(null);
                              setError("");

                              setCompanies((prev) =>
                                writeAllInterviewCompanies([
                                  ...prev,
                                  { ...company, roles: safeRoles }
                                ])
                              );
                            }}
                            className={`rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                              active
                                ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-100"
                                : "border-indigo-100 bg-white text-slate-900"
                            }`}
                          >
                            <p className="truncate text-sm font-black">{company.companyName}</p>
                            <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                              {company.totalJobCount || 0} jobs
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!companySearch.trim() && (
              <div className="mt-5 rounded-[28px] border border-indigo-100 bg-indigo-50/60 p-8 text-center">
                <div className="text-4xl">🎯</div>
                <h3 className="mt-3 text-lg font-black text-slate-900">Search company to start</h3>
              </div>
            )}

            {selectedCompany && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-black text-slate-700">Choose Role</label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen((value) => !value)}
                    className="flex w-full items-center justify-between rounded-[22px] border border-indigo-100 bg-gradient-to-r from-white via-indigo-50/80 to-violet-50 px-5 py-4 text-left text-sm font-black text-slate-800 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <span className="max-w-[85%] truncate">{selectedRole || "Select role"}</span>
                    <span className="rounded-2xl bg-white px-3 py-1 text-indigo-700 shadow-sm">
                      {roleMenuOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute left-0 right-0 top-[66px] z-50 overflow-hidden rounded-[26px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100">
                      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                          Select role from dataset
                        </p>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-2">
                        {roles.map((role, index) => {
                          const active = selectedRole === role.roleName;

                          return (
                            <button
                              key={`${role.roleName}-${index}`}
                              type="button"
                              onClick={() => {
                                setSelectedRole(role.roleName);
                                setRoleMenuOpen(false);
                                setQuestions([]);
                                setQuestionStats(null);
                                setError("");
                              }}
                              className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                                active ? "bg-indigo-600 text-white" : "text-slate-800 hover:bg-indigo-50"
                              }`}
                            >
                              <p className="text-sm font-black">{role.roleName}</p>
                              <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                                {role.jobCount || 0} jobs
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-black text-slate-700">Resume Context</label>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => uploadResumeFile(e.target.files?.[0])}
                className="w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-white to-indigo-50 px-4 py-3 text-sm font-bold text-slate-700"
              />

              {uploading && (
                <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-black text-indigo-700">
                  Reading resume file...
                </div>
              )}

              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setQuestions([]);
                  setQuestionStats(null);
                }}
                placeholder="Paste resume text here or upload PDF/DOCX/TXT..."
                rows={5}
                className="mt-4 w-full rounded-[24px] border border-indigo-100 bg-slate-50/80 p-4 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

              {resumeText.trim() && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <p className="text-xs font-black text-slate-500">Resume Words</p>
                    <p className="text-lg font-black text-slate-900">{resumeWordCount}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <p className="text-xs font-black text-slate-500">Total Questions</p>
                    <p className="text-lg font-black text-slate-900">{questions.length}</p>
                  </div>
                </div>
              )}
            </div>


              {selectedRole && resumeText.trim() && (
                <div className="mt-4 rounded-[26px] border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-emerald-50/60 p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-700">
                        Actual Resume Role Match
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-900">
                        {selectedRole}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-sky-200 bg-white px-5 py-3 text-center shadow-sm">
                      <p className="text-xs font-black text-slate-500">Match</p>
                      <h3 className="text-3xl font-black text-sky-700">
                        {interviewResumeMatchScore}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-100">
                      <p className="text-xs font-black text-slate-500">Actual Skills Checked</p>
                      <h3 className="mt-1 text-2xl font-black text-slate-900">
                        {interviewRequiredSkills.length}
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                      <p className="text-xs font-black text-emerald-700">Matched</p>
                      <h3 className="mt-1 text-2xl font-black text-emerald-700">
                        {interviewMatchedSkills.length}
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
                      <p className="text-xs font-black text-rose-700">Missing</p>
                      <h3 className="mt-1 text-2xl font-black text-rose-700">
                        {interviewMissingSkills.length}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-emerald-700">
                        Matched in Resume
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {interviewMatchedSkills.length ? (
                          interviewMatchedSkills.slice(0, 18).map((skill, index) => (
                            <span key={`${skill}-${index}`} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm font-bold text-slate-500">
                            No actual role skills detected yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-rose-700">
                        Missing from Resume
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {interviewMissingSkills.length ? (
                          interviewMissingSkills.slice(0, 18).map((skill, index) => (
                            <span key={`${skill}-${index}`} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm font-bold text-emerald-700">
                            No major actual technical skill gap found.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-bold leading-5 text-slate-500">
                    This score checks only actual technical/tool skills from selected role against your resume text. Generic skills like management, communication, technical support, and software development are not counted.
                  </p>
                </div>
              )}

            <button
              onClick={generateQuestions}
              disabled={questionLoading}
              className="mt-5 w-full rounded-[22px] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {questionLoading ? "Generating..." : "Generate Real Interview Rounds →"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Face-to-Face Room</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Camera, voice interviewer, posture and answer check.
                </p>
              </div>
              <Badge type={cameraOn ? "success" : "default"}>
                {cameraOn ? "Camera On" : "Camera Off"}
              </Badge>
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950">
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline muted className="h-[360px] w-full bg-slate-950 object-cover" />

                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-6xl">👤</div>
                    <p className="mt-3 text-lg font-black">Camera Preview</p>
                    <p className="text-sm font-semibold text-slate-300">Start camera for real interview mode</p>
                  </div>
                )}

                {cameraOn && (
                  <div className="absolute left-4 top-4 rounded-2xl bg-black/60 px-4 py-2 text-xs font-black text-white backdrop-blur">
                    {listening ? "Listening..." : speaking ? "Interviewer Speaking" : "Ready"}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black text-slate-500">Posture</p>
                <p className="mt-1 text-sm font-black text-slate-900">{postureStatus}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black text-slate-500">Posture Score</p>
                <p className="mt-1 text-2xl font-black text-indigo-700">{postureScore}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black text-slate-500">Time</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{formatTime(seconds)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button onClick={cameraOn ? stopCamera : startCamera} className="rounded-[18px] bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
                {cameraOn ? "Stop Camera" : "Start Camera"}
              </button>

              <button
                onClick={startInterview}
                disabled={!activeQuestion || !cameraOn}
                className="rounded-[18px] bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-300"
              >
                Start Interview
              </button>

              <button
                onClick={speakQuestion}
                disabled={!activeQuestion}
                className="rounded-[18px] bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:bg-slate-300"
              >
                Repeat Question
              </button>

              <button
                onClick={listening ? () => stopListening(true) : startListening}
                disabled={!activeQuestion}
                className="rounded-[18px] bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700 disabled:bg-slate-300"
              >
                {listening ? "Submit Voice Answer" : "Start Voice Answer"}
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-[20px] bg-indigo-50 p-4 text-sm font-black text-indigo-800">
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="h-4 w-4"
              />
              Auto mode: ask → listen → check → next
            </label>

            {voiceStatus && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-black text-indigo-700">
                {voiceStatus}
              </div>
            )}

            {questionStats && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Role Match</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">{questionStats.roleMatchScore || 0}%</h3>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Matched</p>
                  <h3 className="mt-1 text-2xl font-black text-emerald-700">{questionStats.matchedSkills?.length || 0}</h3>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Missing</p>
                  <h3 className="mt-1 text-2xl font-black text-rose-700">{questionStats.missingSkills?.length || 0}</h3>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Live Interview</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Complete each round step-by-step. Next round unlocks only after current round is completed.
              </p>
            </div>

            {questions.length > 0 && (
              <Badge type="primary">
                Question {activeIndex + 1} / {questions.length}
              </Badge>
            )}
          </div>

          {questions.length === 0 && (
            <div className="mt-6 rounded-[28px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-10 text-center">
              <div className="text-5xl">🎙️</div>
              <h3 className="mt-4 text-xl font-black text-slate-900">No questions loaded yet</h3>
              <p className="mt-2 text-sm font-bold text-slate-500">
                Select company and role, then generate dataset interview.
              </p>
            </div>
          )}

          
          {questions.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {questionsByRound.map((round) => {
                const unlocked = isRoundUnlocked(round.round);
                const active = activeRound === round.round;

                return (
                  <button
                    key={round.round}
                    type="button"
                    onClick={() => openRound(round.round)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                        : unlocked
                          ? "border-indigo-100 bg-white text-slate-900 hover:-translate-y-0.5 hover:shadow-lg"
                          : "border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em]">
                        Round {round.round}
                      </p>
                      <span className="text-lg">
                        {round.complete ? "✅" : unlocked ? "🔓" : "🔒"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-black leading-snug">
                      {round.name.replace(`Round ${round.round}: `, "")}
                    </h3>

                    <p className={`mt-2 text-xs font-bold ${active ? "text-indigo-100" : unlocked ? "text-slate-500" : "text-slate-400"}`}>
                      {round.answered}/{round.total || round.expected} completed
                    </p>

                    <div className={`mt-3 h-2 overflow-hidden rounded-full ${active ? "bg-white/20" : "bg-slate-200"}`}>
                      <div
                        className={`h-full rounded-full ${active ? "bg-white" : "bg-indigo-600"}`}
                        style={{
                          width: `${round.total ? Math.min(100, (round.answered / round.total) * 100) : 0}%`
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

{activeQuestion && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] border border-indigo-100 bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge type={activeQuestion.type === "Technical" ? "primary" : "warning"}>
                    {activeQuestion.type}
                  </Badge>

                  <div className="flex gap-2">
                    <button
                      onClick={goPrev}
                      disabled={activeIndex === 0}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <button
                      onClick={() => goNext(true)}
                      disabled={activeIndex === questions.length - 1}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Badge type="dark">{activeQuestion.roundName || `Round ${activeQuestion.round || 1}`}</Badge>
                  <p className="text-sm font-black text-slate-500">
                    Question {activeIndex + 1} of {questions.length}
                  </p>
                </div>

                <h3 className="mt-3 text-2xl font-black leading-snug text-slate-900">
                  {activeQuestion.question}
                </h3>

                <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-indigo-100">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500">Interview Progress</p>
                    <p className="text-xs font-black text-indigo-700">
                      {activeIndex + 1} of {questions.length}
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-indigo-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                      style={{
                        width: `${questions.length ? ((activeIndex + 1) / questions.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-indigo-100 bg-white p-6">
                <h3 className="text-xl font-black text-slate-900">Live Answer Mode</h3>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  For HR/technical explanation, answer by voice. For coding questions, write code in the code box and submit.
                </p>

                <div className="mt-5 rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                    Current Status
                  </p>
                  <h4 className="mt-2 text-2xl font-black text-slate-900">
                    {isCodingQuestion ? "Coding question: write code below" : listening ? "Listening to your answer..." : speaking ? "Interviewer is speaking..." : interviewStarted ? "Interview in progress" : "Ready to start"}
                  </h4>

                  {answer && (
                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-xs font-black text-slate-500">Detected Voice Answer</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{answer}</p>
                    </div>
                  )}
                </div>

                {answerReport && (
                  <div className="mt-5 rounded-[24px] border border-indigo-100 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900">Last Answer Score</h4>
                      <Badge type={answerReport.score >= 70 ? "success" : answerReport.score >= 45 ? "warning" : "danger"}>
                        {answerReport.score}%
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      {(answerReport.feedback || []).map((item, index) => (
                        <p key={index} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                          {item}
                        </p>
                      ))}
                    </div>

                    {(answerReport.improve || answerReport.missing || []).length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-black text-slate-900">Mistakes Spoken by Interviewer</h5>
                        <div className="mt-2 space-y-2">
                          {(answerReport.improve || answerReport.missing || []).map((item, index) => (
                            <p key={index} className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                
                {isCodingQuestion && (
                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-950 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">
                          Coding Answer
                        </p>
                        <h4 className="mt-1 text-lg font-black text-white">
                          {activeQuestion?.expectedSkill || "Code"} Question
                        </h4>
                      </div>

                      <Badge type={codeReport?.correct ? "success" : codeReport ? "danger" : "default"}>
                        {codeReport ? (codeReport.correct ? "Correct" : "Needs Fix") : "Not Checked"}
                      </Badge>
                    </div>

                    <textarea
                      value={codeAnswer}
                      onChange={(e) => {
                        setCodeAnswer(e.target.value);
                        setCodeReport(null);
                      }}
                      placeholder="Write your code here..."
                      rows={12}
                      className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 font-mono text-sm font-semibold text-emerald-100 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                    />

                    <button
                      onClick={analyzeCodeAnswer}
                      disabled={analyzing}
                      className="mt-4 w-full rounded-[18px] bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-600"
                    >
                      {analyzing ? "Analyzing Code..." : "Submit Code Answer"}
                    </button>

                    {codeReport && (
                      <div className={`mt-4 rounded-2xl p-4 ring-1 ${
                        codeReport.correct
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                          : "bg-rose-50 text-rose-800 ring-rose-100"
                      }`}>
                        <h5 className="font-black">
                          {codeReport.correct ? "Green Signal: Code Accepted" : "Mistakes Found"}
                        </h5>

                        <p className="mt-2 text-sm font-bold">
                          Score: {codeReport.score}%
                        </p>

                        {(codeReport.mistakes || []).length > 0 && (
                          <div className="mt-3 space-y-2">
                            {codeReport.mistakes.map((item, index) => (
                              <p key={index} className="rounded-xl bg-white/70 p-3 text-sm font-bold">
                                {index + 1}. {item}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

<div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={listening ? () => stopListening(true) : startListening}
                    disabled={!activeQuestion || speaking || isCodingQuestion}
                    className="rounded-[18px] bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700 disabled:bg-slate-300"
                  >
                    {listening ? "Submit Voice Answer" : "Answer Now"}
                  </button>

                  <button
                    onClick={finishInterview}
                    disabled={!interviewStarted && interviewHistory.length === 0}
                    className="rounded-[18px] bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:bg-slate-300"
                  >
                    Finish Interview
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      
        {finalReport && (
          <section className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Final Interview Report</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Marks and feedback based on your live answers.
                </p>
              </div>

              <Badge type={finalReport.averageScore >= 75 ? "success" : finalReport.averageScore >= 55 ? "warning" : "danger"}>
                {finalReport.verdict}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black text-slate-500">Average Score</p>
                <h3 className="mt-1 text-3xl font-black text-indigo-700">{finalReport.averageScore}%</h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black text-slate-500">Answered</p>
                <h3 className="mt-1 text-3xl font-black text-slate-900">{finalReport.total}</h3>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-black text-emerald-700">Strong</p>
                <h3 className="mt-1 text-3xl font-black text-emerald-700">{finalReport.strongAnswers}</h3>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
                <p className="text-xs font-black text-rose-700">Weak</p>
                <h3 className="mt-1 text-3xl font-black text-rose-700">{finalReport.weakAnswers}</h3>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="font-black text-slate-900">Improvement Plan</h3>
              <div className="mt-3 space-y-2">
                {finalReport.improvements.map((item, index) => (
                  <p key={index} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                    {index + 1}. {item}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
