
require("dotenv").config();

const connectDB = require("../utils/db");
const User = require("../models/User");
const Resource = require("../models/Resource");
const Question = require("../models/Question");
const PracticeQuestion = require("../models/PracticeQuestion");
const CompanyPlan = require("../models/CompanyPlan");
const InterviewQuestion = require("../models/InterviewQuestion");


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

  // DSA and Practice questions are NOT seeded manually.
  // They are imported strictly from ZIP datasets using npm run import:all.
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
