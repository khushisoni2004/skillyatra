const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");

const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
if (!match) {
  console.error("MCQ_QUESTIONS not found.");
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

function norm(v) {
  return String(v || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function fullText(q) {
  return norm([
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
  const t = fullText(q);
  const topic = norm(q.topic);
  const source = norm(q.sourceDataset);

  // Data Science / NLP / ML first
  if (
    topicHas(topic, [
      "ml", "machine learning", "deep learning", "ai", "models",
      "preprocessing", "statistics", "data science", "nlp", "concepts"
    ]) ||
    hasAny(t, [
      "text augmentation", "corpus in nlp", "vocabulary in nlp",
      "out-of-vocabulary", "oov", "tokenization", "stemming",
      "lemmatization", "embedding", "language model", "machine learning",
      "deep learning", "artificial intelligence", "neural network",
      "turing test", "expected value", "kl divergence", "monte carlo",
      "arima", "stationarity", "autocorrelation", "time series",
      "knn", "svm", "scikit-learn", "regression", "classification",
      "clustering", "overfitting", "underfitting", "feature scaling",
      "label encoding", "one-hot encoding", "random forest", "decision tree",
      "naive bayes", "lstm", "bert", "transformer", "rmse", "mae"
    ])
  ) {
    return "Data Science";
  }

  // Verbal Ability: only actual English/verbal questions
  if (
    topicHas(topic, [
      "verbal", "english", "grammar", "vocabulary", "analogies", "analogy"
    ]) ||
    hasAny(t, [
      "choose the word most similar", "choose the word opposite",
      "synonym", "antonym", "sentence correction", "reading comprehension",
      "grammar", "vocabulary", "cloze", "para jumble", "error spotting",
      "fill in the blank", "analogies", "analogy", "opposite :: synonym",
      "paw : cat", "brick : house", "smile : happy"
    ])
  ) {
    return "Verbal Ability";
  }

  // Logical Reasoning
  if (
    topicHas(topic, [
      "reasoning", "logical", "coding-decoding", "coding decoding",
      "number series", "blood relation", "direction", "seating",
      "puzzle", "syllogism", "input-output"
    ]) ||
    hasAny(t, [
      "coding-decoding", "coding decoding", "blood relation",
      "direction sense", "seating arrangement", "syllogism",
      "statement conclusion", "odd one out", "calendar", "clock",
      "ranking", "number series", "find the next", "find the missing",
      "in a code", "arranges numbers"
    ])
  ) {
    return "Logical Reasoning";
  }

  // Quantitative Aptitude
  if (
    topicHas(topic, ["aptitude", "quant", "math"]) ||
    hasAny(t, [
      "percentage", "profit", "loss", "ratio", "average",
      "simple interest", "compound interest", "time and work",
      "speed", "distance", "boat", "stream", "pipe", "cistern",
      "mensuration", "permutation", "combination", "number system",
      "lcm", "hcf", "mixture", "allegation", "ages", "discount"
    ])
  ) {
    return "Quantitative Aptitude";
  }

  // Python
  if (
    topicHas(topic, ["python"]) ||
    hasAny(t, [
      "python", "list comprehension", "tuple", "dictionary", "lambda",
      "decorator", "generator", "asyncio", "walrus", "pandas", "numpy",
      "django", "flask", "pickle module", "itertools", "__getitem__",
      "__slots__", "*args", "**kwargs"
    ])
  ) {
    return "Python";
  }

  // Core CS only
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

  // Programming
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

  // HR
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

  // HANA / Docker / Git / DevOps / Technical placement
  return "Placement / NQT";
}

function priority(q) {
  const topic = norm(q.topic);
  const text = fullText(q);

  if (topic.includes("vocabulary")) return 1;
  if (topic.includes("analogies") || topic.includes("analogy")) return 2;
  if (topic.includes("grammar")) return 3;
  if (text.includes("reading comprehension")) return 4;
  return 9;
}

const fixed = questions
  .map((q) => ({
    ...q,
    subject: classify(q)
  }))
  .sort((a, b) => {
    if (a.subject === "Verbal Ability" && b.subject === "Verbal Ability") {
      return priority(a) - priority(b);
    }
    return 0;
  });

const counts = {};
for (const g of GROUPS) {
  counts[g] = g === "All" ? fixed.length : fixed.filter((q) => q.subject === g).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(fixed, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Verbal Ability and grouping arranged correctly.");
console.log(counts);

console.log("\\nVerbal Ability sample:");
fixed.filter((q) => q.subject === "Verbal Ability").slice(0, 12).forEach((q, i) => {
  console.log(`${i + 1}. [${q.topic}] ${q.question}`);
});
