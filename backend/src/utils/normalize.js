
const slugify = require("slugify");

const safe = (v = "") => String(v ?? "").trim();

const pick = (row, keys) => {
  for (const k of keys) {
    if (row && row[k] !== undefined && safe(row[k]) !== "") return row[k];
  }
  return "";
};

const normalizeText = (s = "") =>
  safe(s).replace(/\s+/g, " ").toLowerCase();

const titleCase = (s = "") =>
  safe(s)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
    /#include\s*</i,
    /class\s+Solution/i,
    /public\s*:/i,
    /private\s*:/i,
    /int\s+main\s*\(/i,
    /return\s+/i,
    /select\s+.+\s+from\s+/i,
    /inner\s+join/i,
    /group\s+by/i,
    /order\s+by/i,
    /union\s+all/i,
    /you\s+are\s+given/i,
    /write\s+a\s+program/i,
    /function\s+should/i,
    /input\s*:/i,
    /output\s*:/i,
    /constraints\s*:/i,
    /\/\*\*/i,
    /\{.*\}/,
    /;\s*$/
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
      "Challenge Name",
      "slug",
      "Slug",
      "titleSlug",
      "title_slug",
      "url",
      "URL",
      "link",
      "Link",
      "problem_url",
      "originalUrl"
    ])
  );

  const raw = safe(
    [
      title,
      pick(row, ["topic", "Topic"]),
      pick(row, ["category", "Category"]),
      pick(row, ["tags", "Tags", "tag", "topics", "Topics", "problem_tag"]),
      pick(row, ["pattern", "Pattern"]),
      pick(row, ["subTopic", "sub_topic", "Sub Topic"])
    ].join(" ")
  ).toLowerCase();

  const checks = [
    ["Dynamic Programming", ["dynamic programming", " dp ", "memoization", "tabulation", "knapsack", "lis", "lcs", "minimum path", "maximum path", "coin change", "subset sum", "matrix chain"]],
    ["Graphs", ["graph", "bfs", "dfs", "shortest path", "dijkstra", "bellman", "floyd", "mst", "topological", "disjoint", "union find", "kruskal", "prims", "island", "course schedule"]],
    ["Trees", ["tree", "binary tree", "traversal", "inorder", "preorder", "postorder", "level order", "diameter", "ancestor", "lca", "height of tree", "path sum"]],
    ["Binary Search Tree", ["bst", "binary search tree", "validate bst", "kth smallest"]],
    ["Linked List", ["linked list", "linkedlist", "list node", "listnode", "reverse list", "merge list", "cycle in linked", "remove nth"]],
    ["Stack", ["stack", "parentheses", "bracket", "next greater", "previous greater", "min stack", "largest rectangle", "monotonic stack"]],
    ["Queue", ["queue", "deque", "circular queue", "sliding window maximum", "rotten oranges", "first negative"]],
    ["Heap / Priority Queue", ["heap", "priority queue", "k largest", "k smallest", "median finder", "merge k", "top k", "kth largest", "kth smallest"]],
    ["Backtracking", ["backtracking", "backtrack", "permutation", "combination", "subsets", "n queens", "sudoku", "rat in maze", "word search"]],
    ["Sliding Window", ["sliding window", "window", "longest substring", "minimum window", "subarray with", "at most k", "maximum sum subarray of size"]],
    ["Two Pointers", ["two pointer", "two pointers", "3sum", "three sum", "4sum", "container with most water", "remove duplicates", "sorted array", "pair sum"]],
    ["Bit Manipulation", ["bit", "xor", "and", "or", "single number", "power of two", "set bit", "clear bit", "bitwise"]],
    ["Greedy", ["greedy", "activity selection", "fractional knapsack", "minimum platforms", "job sequencing", "jump game", "gas station", "candy"]],
    ["Sorting", ["sort", "sorting", "merge sort", "quick sort", "insertion sort", "selection sort", "bubble sort", "counting sort", "radix sort"]],
    ["Searching", ["search", "binary search", "lower bound", "upper bound", "rotated sorted", "peak element", "first and last"]],
    ["Hashing", ["hash", "hashmap", "hash map", "frequency", "anagram", "two sum", "duplicate", "subarray sum", "isomorphic"]],
    ["Strings", ["string", "substring", "subsequence", "palindrome", "anagram", "roman", "word", "character", "prefix", "suffix", "pattern matching"]],
    ["Math / Number Theory", ["math", "prime", "gcd", "lcm", "number", "integer", "factorial", "fibonacci", "sieve", "modulo", "power", "sqrt"]],
    ["Recursion", ["recursion", "recursive", "tower of hanoi", "generate parentheses"]],
    ["Arrays", ["array", "matrix", "subarray", "sum", "maximum", "minimum", "rotate", "merge intervals", "interval"]]
  ];

  const padded = " " + raw.replace(/[-_\/]+/g, " ") + " ";

  for (const [topic, keys] of checks) {
    if (keys.some((k) => padded.includes(k))) return topic;
  }

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
      .replace(/\b\w/g, (c) => c.toUpperCase());
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

  a = a.replace(/^option\s*/i, "").trim();
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
  if (/class\s+Solution|#include|public\s*:|select\s+.+from/i.test(question)) return null;

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
