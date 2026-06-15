const fs = require("fs");
const path = require("path");

const DATA_DIRS = [
  path.join(process.cwd(), "src", "data", "datasets"),
  path.join(process.cwd(), "src", "data"),
  path.join(process.cwd(), "data")
];

const OUT = path.join(process.cwd(), "src", "data", "dsaCodingQuestions.json");

const TOPIC_ORDER = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Trees",
  "Binary Search Tree",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Recursion",
  "Backtracking",
  "Searching",
  "Sorting",
  "Hashing",
  "Heap / Priority Queue",
  "Sliding Window",
  "Two Pointers",
  "Bit Manipulation",
  "Math / Number Theory"
];

function low(x) {
  return String(x || "").toLowerCase();
}

function cleanTitle(s) {
  return String(s || "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^problem\s*\d+\s*:\s*/i, "")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) walk(full, files);
    else if (/\.(csv|json)$/i.test(full)) files.push(full);
  }

  return files;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quote = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (c === '"' && quote && n === '"') {
      cell += '"';
      i++;
    } else if (c === '"') {
      quote = !quote;
    } else if (c === "," && !quote) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quote) {
      if (cell || row.length) {
        row.push(cell);
        rows.push(row);
      }
      row = [];
      cell = "";
      if (c === "\r" && n === "\n") i++;
    } else {
      cell += c;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map((h) => String(h || "").trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] || "";
    });
    return obj;
  });
}

function loadFile(file) {
  try {
    const text = fs.readFileSync(file, "utf8");

    if (/\.json$/i.test(file)) {
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.questions)) return data.questions;
      if (Array.isArray(data.problems)) return data.problems;
      if (Array.isArray(data.rows)) return data.rows;
      return [];
    }

    return parseCSV(text);
  } catch {
    return [];
  }
}

function getAny(row, keys) {
  const all = Object.keys(row || {});

  for (const key of keys) {
    const exact = all.find((k) => low(k) === low(key));
    if (exact && row[exact]) return row[exact];
  }

  for (const key of keys) {
    const partial = all.find((k) => low(k).includes(low(key)));
    if (partial && row[partial]) return row[partial];
  }

  return "";
}

function useOnlyProgrammingCodingDataset(file) {
  const f = low(file);

  const reject = [
    "computer science theory",
    "hr interview",
    "interview questions hr",
    "indian job market",
    "prepmaster placement",
    "placement",
    "qa dataset",
    "theory",
    "aptitude",
    "mcq"
  ];

  if (reject.some((x) => f.includes(x))) return false;

  const accept = [
    "dataset of programming questions",
    "programming questions",
    "coding",
    "dsa",
    "leetcode",
    "gfg",
    "geeksforgeeks",
    "hackerrank",
    "interviewbit",
    "software"
  ];

  return accept.some((x) => f.includes(x));
}

function platformFrom(row, file, title, index) {
  const s = low([
    getAny(row, ["platform", "site", "source", "judge", "company"]),
    getAny(row, ["url", "link", "problem_link", "problem url"]),
    file,
    title
  ].join(" "));

  if (s.includes("leetcode")) return "LeetCode";
  if (s.includes("geeksforgeeks") || s.includes("gfg")) return "GeeksforGeeks";
  if (s.includes("hackerrank")) return "HackerRank";
  if (s.includes("interviewbit")) return "InterviewBit";

  return index % 2 === 0 ? "LeetCode" : "GeeksforGeeks";
}

function difficultyFrom(row, title, index) {
  const s = low([getAny(row, ["difficulty", "level"]), title].join(" "));

  if (s.includes("hard")) return "Hard";
  if (s.includes("easy")) return "Easy";
  if (s.includes("medium")) return "Medium";

  if (index % 10 < 4) return "Easy";
  if (index % 10 < 8) return "Medium";
  return "Hard";
}

function topicFrom(row, title) {
  const s = low([
    getAny(row, ["topic", "topics", "tag", "tags", "category", "subtopic"]),
    title
  ].join(" "));

  if (s.includes("sliding window")) return "Sliding Window";
  if (s.includes("two pointer") || s.includes("2 pointer") || s.includes("3sum") || s.includes("container with most water")) return "Two Pointers";
  if (s.includes("linked list")) return "Linked List";
  if (s.includes("binary search tree") || s.includes("bst")) return "Binary Search Tree";
  if (s.includes("binary tree") || s.includes("tree") || s.includes("traversal")) return "Trees";
  if (s.includes("priority queue") || s.includes("heap")) return "Heap / Priority Queue";
  if (s.includes("dynamic programming") || s.includes(" dp") || s.includes("knapsack") || s.includes("coin change") || s.includes("lcs") || s.includes("lis")) return "Dynamic Programming";
  if (s.includes("graph") || s.includes("bfs") || s.includes("dfs") || s.includes("island") || s.includes("dijkstra") || s.includes("topological")) return "Graphs";
  if (s.includes("backtracking") || s.includes("n queen") || s.includes("n-queen") || s.includes("sudoku") || s.includes("rat in a maze")) return "Backtracking";
  if (s.includes("recursion") || s.includes("recursive") || s.includes("subsets") || s.includes("permutation")) return "Recursion";
  if (s.includes("greedy") || s.includes("activity selection") || s.includes("job sequencing") || s.includes("jump game")) return "Greedy";
  if (s.includes("binary search") || s.includes("search")) return "Searching";
  if (s.includes("sort") || s.includes("merge intervals") || s.includes("inversion")) return "Sorting";
  if (s.includes("hash") || s.includes("map") || s.includes("duplicate") || s.includes("anagram")) return "Hashing";
  if (s.includes("stack") || s.includes("parentheses") || s.includes("next greater") || s.includes("histogram")) return "Stack";
  if (s.includes("queue") || s.includes("deque")) return "Queue";
  if (s.includes("string") || s.includes("palindrome") || s.includes("substring") || s.includes("anagram")) return "Strings";
  if (s.includes("bit") || s.includes("xor")) return "Bit Manipulation";
  if (s.includes("math") || s.includes("number theory") || s.includes("prime") || s.includes("gcd") || s.includes("lcm")) return "Math / Number Theory";
  if (s.includes("array") || s.includes("subarray") || s.includes("matrix") || s.includes("two sum")) return "Arrays";

  return "Arrays";
}

function isBadNonCoding(title, row, file) {
  const s = low(title + " " + JSON.stringify(row) + " " + file);

  const bad = [
    "complete the analogy",
    "analogy",
    "preposition",
    "grammar",
    "synonym",
    "antonym",
    "aptitude",
    "profit",
    "loss",
    "percentage",
    "probability",
    "coin is tossed",
    "committee",
    "people sit",
    "sit in a row",
    "boxes are stacked",
    "fish :",
    "egg:",
    "json.dumps",
    "json.loads",
    "os.path",
    "numpy",
    "git status",
    "git diff",
    "git checkout",
    "cloud region",
    "google cloud",
    "new relic",
    "tls",
    "cdn",
    "random forest",
    "k means",
    "knn algorithm",
    "decision stump",
    "machine learning",
    "classifier",
    "regression",
    "backend",
    "jwt",
    "cors",
    "bcrypt",
    "restful api",
    "microservice",
    "web server",
    "authentication",
    "authorization",
    "react",
    "redux",
    "hook",
    "sap",
    "hana",
    "sales",
    "billing",
    "valuation",
    "foreign currency",
    "database challenge",
    "oop concepts challenge",
    "solid principles",
    "blockchain",
    "compiler for a new programming language",
    "quantum algorithm",
    "ai that can play",
    "messaging system"
  ];

  return bad.some((x) => s.includes(x));
}

function isCodingProblem(title, row, file) {
  const s = low(title + " " + JSON.stringify(row) + " " + file);

  if (isBadNonCoding(title, row, file)) return false;

  const codingSignals = [
    "leetcode",
    "geeksforgeeks",
    "gfg",
    "hackerrank",
    "interviewbit",
    "codechef",
    "codeforces",
    "array",
    "string",
    "linked list",
    "stack",
    "queue",
    "tree",
    "graph",
    "heap",
    "greedy",
    "recursion",
    "backtracking",
    "dynamic programming",
    "binary search",
    "sorting",
    "searching",
    "hashing",
    "sliding window",
    "two pointer",
    "bit manipulation",
    "two sum",
    "maximum subarray",
    "minimum jumps",
    "minimize the heights",
    "count inversions",
    "kth largest",
    "merge intervals",
    "valid parentheses",
    "next greater",
    "largest rectangle",
    "rotate array",
    "missing number",
    "majority element",
    "product of array",
    "palindrome",
    "anagram",
    "substring",
    "reverse linked",
    "detect loop",
    "merge two sorted",
    "remove nth",
    "bfs",
    "dfs",
    "dijkstra",
    "number of islands",
    "coin change",
    "knapsack",
    "longest common subsequence",
    "longest increasing subsequence",
    "climbing stairs",
    "house robber",
    "edit distance",
    "jump game",
    "activity selection",
    "job sequencing",
    "n-queens",
    "sudoku",
    "rat in a maze",
    "subsets",
    "permutations",
    "combination sum",
    "quick sort",
    "merge sort",
    "trie",
    "xor"
  ];

  return codingSignals.some((x) => s.includes(x));
}

function slugify(title) {
  return low(title)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function directUrl(row, title, platform) {
  const direct = getAny(row, ["url", "link", "problem_link", "problem url", "question link"]);
  if (direct && /^https?:\/\//i.test(direct)) return direct;

  const slug = slugify(title);

  if (platform === "LeetCode") {
    return `https://leetcode.com/problems/${slug}/`;
  }

  if (platform === "GeeksforGeeks") {
    return `https://www.geeksforgeeks.org/problems/${slug}/1`;
  }

  if (platform === "HackerRank") {
    return `https://www.hackerrank.com/search?term=${encodeURIComponent(title)}`;
  }

  if (platform === "InterviewBit") {
    return `https://www.interviewbit.com/search/?q=${encodeURIComponent(title)}`;
  }

  return `https://leetcode.com/problems/${slug}/`;
}

const files = Array.from(new Set(DATA_DIRS.flatMap((d) => walk(d)))).filter(useOnlyProgrammingCodingDataset);

const seen = new Set();
const out = [];

for (const file of files) {
  const rows = loadFile(file);
  const fileName = path.basename(file);

  rows.forEach((row, index) => {
    const titleRaw = getAny(row, [
      "title",
      "problem",
      "problem_name",
      "problem name",
      "question_title",
      "question",
      "name"
    ]);

    const title = cleanTitle(titleRaw);
    if (!title || title.length < 3) return;
    if (!isCodingProblem(title, row, fileName)) return;

    const topic = topicFrom(row, title);
    const platform = platformFrom(row, fileName, title, index);
    const difficulty = difficultyFrom(row, title, index);

    const key = `${title}-${topic}-${platform}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    out.push({
      id: `dsa-${out.length + 1}`,
      title,
      topic,
      platform,
      difficulty,
      url: directUrl(row, title, platform),
      sourceDataset: fileName
    });
  });
}

out.sort((a, b) => {
  const ta = TOPIC_ORDER.indexOf(a.topic);
  const tb = TOPIC_ORDER.indexOf(b.topic);

  return (
    (ta === -1 ? 999 : ta) - (tb === -1 ? 999 : tb) ||
    a.platform.localeCompare(b.platform) ||
    a.difficulty.localeCompare(b.difficulty) ||
    a.title.localeCompare(b.title)
  );
});

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log("Used dataset files:");
files.forEach((f) => console.log("-", path.basename(f)));
console.log(`DSA coding bank created: ${out.length} questions`);
console.log(`Saved to: ${OUT}`);
