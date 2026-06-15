const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");

const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
if (!match) {
  console.error("MCQ_QUESTIONS not found");
  process.exit(1);
}

const questions = JSON.parse(match[1]);

const GROUPS = [
  "All",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Placement / NQT",
  "Programming",
  "Core CS",
  "Python",
  "Data Science",
  "HR / Technical Interview"
];

function n(v) {
  return String(v || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function textOf(q) {
  return n([
    q.question,
    q.topic,
    q.difficulty,
    q.sourceDataset,
    ...(q.options || []).map((o) => o.text)
  ].join(" "));
}

function hasAny(text, words) {
  return words.some((w) => text.includes(w));
}

function topicHas(topic, words) {
  return words.some((w) => topic === w || topic.includes(w));
}

function classify(q) {
  const t = textOf(q);
  const topic = n(q.topic);
  const source = n(q.sourceDataset);

  // 1. Python first, so it never goes to Quant
  if (
    topicHas(topic, ["python"]) ||
    hasAny(t, [
      "python", "with statement", "'with' statement", "pass in python",
      "'pass' in python", "pickle module", "virtual environment in python",
      "property in python", "itertools module", "counter in collections",
      "__getitem__", "numpy", "pip install", "modulo", "% operator in python",
      "list comprehension", "tuple", "dictionary", "lambda", "decorator",
      "generator", "asyncio", "walrus", "pandas", "django", "flask",
      "*args", "**kwargs", "gil", "mro"
    ])
  ) {
    return "Python";
  }

  // 2. DevOps / Docker / K8s / Git / Tools are placement technical, not Quant/Core
  if (
    topicHas(topic, [
      "docker", "kubernetes", "k8s", "git", "terraform", "monitoring",
      "security", "redux", "components", "testing", "hana", "abap",
      "basis", "ci/cd", "devops", "cloud"
    ]) ||
    hasAny(t, [
      "docker", "container", "docker hub", "docker-compose", "dockerfile",
      "buildkit", "kubernetes", "k8s", "pod", "ingress", "loadbalancer",
      "coredns", "git ", "git branch", "git checkout", "git switch",
      "terraform", "prometheus", "grafana", "loki", "elk stack",
      "monitoring", "tls", "bcrypt", "redux", "react-table",
      "typescript", "hana", "abap", "sap", "ci runners"
    ])
  ) {
    return "Placement / NQT";
  }

  // 3. Data Science / ML / AI / NLP / Statistics
  if (
    topicHas(topic, [
      "ml", "machine learning", "deep learning", "ai", "models",
      "preprocessing", "statistics", "data science", "nlp", "concepts"
    ]) ||
    hasAny(t, [
      "machine learning", "deep learning", "artificial intelligence",
      "neural network", "turing test", "expected value", "kl divergence",
      "monte carlo", "arima", "stationarity", "autocorrelation",
      "time series", "text augmentation", "corpus in nlp",
      "vocabulary in nlp", "out-of-vocabulary", "oov", "tokenization",
      "embedding", "language model", "knn", "svm", "scikit-learn",
      "regression", "classification", "clustering", "overfitting",
      "underfitting", "feature scaling", "label encoding",
      "one-hot encoding", "random forest", "decision tree", "naive bayes",
      "lstm", "bert", "transformer", "rmse", "mae"
    ])
  ) {
    return "Data Science";
  }

  // 4. Core CS only
  if (
    topicHas(topic, [
      "os", "operating system", "dbms", "database", "computer network",
      "computer networks", "cn", "networking", "oop", "oops",
      "object oriented", "data structure", "data structures", "dsa"
    ]) ||
    hasAny(t, [
      "operating system", "cpu scheduling", "deadlock", "semaphore",
      "paging", "segmentation", "virtual memory", "dbms",
      "database management", "normalization", "acid property",
      "primary key", "foreign key", "computer network", "osi model",
      "tcp/ip", "dns", "ip address", "subnet", "object oriented",
      "inheritance", "polymorphism", "encapsulation", "abstraction",
      "stack", "queue", "linked list", "binary tree", "graph traversal",
      "heap", "hash table"
    ])
  ) {
    return "Core CS";
  }

  // 5. Logical Reasoning
  if (
    topicHas(topic, [
      "reasoning", "logical", "coding-decoding", "coding decoding",
      "number series", "blood relation", "direction", "seating",
      "puzzle", "syllogism", "input-output", "analogies", "analogy"
    ]) ||
    hasAny(t, [
      "coding-decoding", "coding decoding", "blood relation",
      "direction sense", "seating arrangement", "syllogism",
      "statement conclusion", "odd one out", "calendar", "clock",
      "ranking", "number series", "find the next", "find the missing",
      "in a code", "arranges numbers", "paw : cat", "brick : house"
    ])
  ) {
    return "Logical Reasoning";
  }

  // 6. Verbal Ability only English
  if (
    topicHas(topic, ["verbal", "english", "grammar", "vocabulary"]) ||
    hasAny(t, [
      "choose the word most similar", "choose the word opposite",
      "synonym", "antonym", "sentence correction", "reading comprehension",
      "grammar", "vocabulary", "cloze", "para jumble", "error spotting",
      "fill in the blank"
    ])
  ) {
    return "Verbal Ability";
  }

  // 7. Quantitative Aptitude only real aptitude
  if (
    topicHas(topic, ["aptitude", "quant", "arithmetic"]) ||
    hasAny(t, [
      "percentage", "profit", "loss", "ratio", "average",
      "simple interest", "compound interest", "time and work",
      "speed", "distance", "boat", "stream", "pipe", "cistern",
      "mensuration", "permutation", "combination", "number system",
      "lcm", "hcf", "mixture", "allegation", "ages", "discount",
      "partnership", "train crosses", "work together"
    ])
  ) {
    return "Quantitative Aptitude";
  }

  // 8. Programming
  if (
    hasAny(source, ["leetcode", "gfg", "codechef", "codeforces"]) ||
    topicHas(topic, ["programming", "algorithm", "coding"]) ||
    hasAny(t, [
      "array problem", "string problem", "recursion",
      "dynamic programming", "binary search", "sorting algorithm",
      "time complexity", "space complexity", "write a program"
    ])
  ) {
    return "Programming";
  }

  // 9. HR
  if (
    hasAny(source, ["hr interview", "interview questions hr"]) ||
    hasAny(t, [
      "tell me about yourself", "why should we hire you", "strength",
      "weakness", "salary expectation", "where do you see yourself",
      "notice period", "resume gap", "team conflict", "leadership",
      "relocation"
    ])
  ) {
    return "HR / Technical Interview";
  }

  return "Placement / NQT";
}

function orderPriority(q) {
  const s = q.subject;
  const topic = n(q.topic);

  const groupOrder = {
    "Quantitative Aptitude": 1,
    "Logical Reasoning": 2,
    "Verbal Ability": 3,
    "Placement / NQT": 4,
    "Programming": 5,
    "Core CS": 6,
    "Python": 7,
    "Data Science": 8,
    "HR / Technical Interview": 9
  };

  let topicOrder = 50;

  if (s === "Quantitative Aptitude") {
    if (topic.includes("percentage")) topicOrder = 1;
    else if (topic.includes("profit")) topicOrder = 2;
    else if (topic.includes("ratio")) topicOrder = 3;
    else if (topic.includes("average")) topicOrder = 4;
    else if (topic.includes("time")) topicOrder = 5;
    else topicOrder = 20;
  }

  if (s === "Logical Reasoning") {
    if (topic.includes("number series")) topicOrder = 1;
    else if (topic.includes("coding")) topicOrder = 2;
    else if (topic.includes("blood")) topicOrder = 3;
    else if (topic.includes("direction")) topicOrder = 4;
    else topicOrder = 20;
  }

  if (s === "Core CS") {
    if (topic.includes("data structure")) topicOrder = 1;
    else if (topic.includes("dbms")) topicOrder = 2;
    else if (topic.includes("operating")) topicOrder = 3;
    else if (topic.includes("network")) topicOrder = 4;
    else if (topic.includes("oop")) topicOrder = 5;
    else topicOrder = 20;
  }

  return `${groupOrder[s] || 99}-${topicOrder}-${topic}`;
}

const fixed = questions
  .map((q) => ({ ...q, subject: classify(q) }))
  .sort((a, b) => orderPriority(a).localeCompare(orderPriority(b)));

const counts = {};
for (const g of GROUPS) {
  counts[g] = g === "All" ? fixed.length : fixed.filter((q) => q.subject === g).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(fixed, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Final MCQs arranged properly.");
console.log(counts);

console.log("\\nQuant sample:");
fixed.filter(q => q.subject === "Quantitative Aptitude").slice(0, 10).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));

console.log("\\nPython sample:");
fixed.filter(q => q.subject === "Python").slice(0, 5).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));

console.log("\\nPlacement sample:");
fixed.filter(q => q.subject === "Placement / NQT").slice(0, 5).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));
