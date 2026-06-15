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

function allText(q) {
  return n([
    q.question,
    q.topic,
    q.subject,
    q.sourceDataset,
    ...(q.options || []).map((o) => o.text)
  ].join(" "));
}

function hasAny(text, words) {
  return words.some((w) => text.includes(w));
}

function classify(q) {
  const t = allText(q);
  const topic = n(q.topic);
  const source = n(q.sourceDataset);

  // Keep manually added curated groups fixed
  if (source === "strict 50 each programming output mcqs") {
    return "Programming";
  }

  if (source === "placement core cs scenario mcqs") {
    return "Core CS";
  }

  if (source === "manual hr technical interview 100") {
    return "HR / Technical Interview";
  }

  // HR / Technical Interview only real HR/interview/resume/project communication questions
  if (
    hasAny(t, [
      "tell me about yourself",
      "why should we hire you",
      "what are your strengths",
      "what is your weakness",
      "salary expectation",
      "where do you see yourself",
      "relocation",
      "notice period",
      "team conflict",
      "leadership",
      "resume",
      "interview",
      "hr basics",
      "behavioral",
      "project interview",
      "placement scenario"
    ])
  ) {
    return "HR / Technical Interview";
  }

  // Logical Reasoning
  if (
    topic === "classification" ||
    topic === "logical" ||
    topic === "reasoning" ||
    topic === "input-output" ||
    topic === "number series" ||
    topic === "coding-decoding" ||
    topic === "blood relation" ||
    topic === "direction" ||
    topic === "ranking" ||
    topic === "syllogism" ||
    hasAny(t, [
      "find the odd one",
      "odd one",
      "statement-conclusion",
      "statement:",
      "conclusion?",
      "step process",
      "input:",
      "ranking:",
      "blood relation",
      "coding-decoding",
      "number series",
      "find the next",
      "find the missing",
      "in a code",
      "arranges numbers",
      "all vegetables are healthy",
      "all glass is fragile"
    ])
  ) {
    return "Logical Reasoning";
  }

  // Verbal Ability
  if (
    topic === "reading comprehension" ||
    topic === "fill in the blanks" ||
    topic === "analogies" ||
    topic === "analogy" ||
    topic === "vocabulary" ||
    topic === "grammar" ||
    topic === "english" ||
    hasAny(t, [
      "passage:",
      "reading comprehension",
      "fill in the blanks",
      "choose the word most similar",
      "synonym",
      "antonym",
      "grammar",
      "vocabulary",
      "para jumble",
      "error spotting",
      "biologist : life",
      "brick : house",
      "paw : cat",
      "smile : happy"
    ])
  ) {
    return "Verbal Ability";
  }

  // Quantitative Aptitude
  if (
    topic === "aptitude" ||
    topic === "quantitative aptitude" ||
    topic === "profit and loss" ||
    topic === "percentage" ||
    topic === "ratio" ||
    topic === "average" ||
    hasAny(t, [
      "fraction",
      "reciprocal",
      "profit",
      "loss",
      "percentage",
      "ratio",
      "average",
      "simple interest",
      "compound interest",
      "time and work",
      "speed",
      "distance",
      "lcm",
      "hcf",
      "pipe",
      "cistern",
      "boat",
      "stream",
      "mensuration",
      "permutation",
      "combination",
      "train crosses"
    ])
  ) {
    return "Quantitative Aptitude";
  }

  // Python only
  if (
    topic === "python" ||
    hasAny(t, [
      "python",
      "list comprehension",
      "tuple",
      "dictionary",
      "lambda",
      "decorator",
      "generator",
      "asyncio",
      "walrus",
      "pandas",
      "numpy",
      "django",
      "flask",
      "pickle module",
      "itertools",
      "__getitem__",
      "__slots__",
      "*args",
      "**kwargs",
      "gil",
      "mro",
      "pip install",
      "virtual environment"
    ])
  ) {
    return "Python";
  }

  // Data Science
  if (
    [
      "ml",
      "ml basics",
      "ml formula",
      "models",
      "deep learning",
      "preprocessing",
      "training",
      "nlp",
      "statistics",
      "data science",
      "concepts"
    ].includes(topic) ||
    hasAny(t, [
      "machine learning",
      "deep learning",
      "artificial intelligence",
      "neural network",
      "supervised learning",
      "unsupervised learning",
      "classification model",
      "regression model",
      "clustering",
      "k-means",
      "knn",
      "svm",
      "decision tree",
      "random forest",
      "naive bayes",
      "linear regression",
      "logistic regression",
      "overfitting",
      "underfitting",
      "feature scaling",
      "normalization",
      "standardization",
      "label encoding",
      "one-hot encoding",
      "train test split",
      "cross validation",
      "confusion matrix",
      "precision",
      "recall",
      "f1 score",
      "accuracy",
      "rmse",
      "mae",
      "mse",
      "gradient descent",
      "cnn",
      "rnn",
      "lstm",
      "bert",
      "transformer",
      "gan",
      "discriminator",
      "tokenization",
      "corpus in nlp",
      "vocabulary in nlp",
      "oov",
      "embedding",
      "time series",
      "arima",
      "stationarity",
      "kl divergence",
      "monte carlo",
      "expected value"
    ])
  ) {
    return "Data Science";
  }

  // Core CS only strict
  if (
    ["dbms", "computer networks", "operating system", "dsa", "oops"].includes(topic) ||
    hasAny(t, [
      "primary key",
      "foreign key",
      "normalization",
      "transaction",
      "acid",
      "inner join",
      "left join",
      "router",
      "switch",
      "dns",
      "tcp",
      "udp",
      "osi",
      "deadlock",
      "context switching",
      "paging",
      "virtual memory",
      "stack",
      "queue",
      "binary search",
      "hash table",
      "encapsulation",
      "inheritance",
      "polymorphism"
    ])
  ) {
    return "Core CS";
  }

  // Placement / NQT technical and business questions
  if (
    [
      "co",
      "fi",
      "mm",
      "sd",
      "pipelines",
      "hana",
      "abap",
      "basis",
      "fiori",
      "cloud",
      "components",
      "docker",
      "kubernetes",
      "git",
      "terraform",
      "monitoring",
      "security",
      "redux",
      "testing",
      "devops"
    ].includes(topic) ||
    hasAny(t, [
      "controlling area",
      "cost center",
      "profit center",
      "sales area",
      "condition record",
      "quota arrangement",
      "pipeline",
      "ci/cd",
      "sap",
      "hana",
      "abap",
      "aws",
      "lambda",
      "docker",
      "kubernetes",
      "git",
      "terraform",
      "prometheus",
      "grafana",
      "react-table",
      "component-driven"
    ])
  ) {
    return "Placement / NQT";
  }

  return "Placement / NQT";
}

const fixed = questions.map((q) => ({
  ...q,
  subject: classify(q)
}));

const counts = {};
for (const g of GROUPS) {
  counts[g] = g === "All" ? fixed.length : fixed.filter((q) => q.subject === g).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(fixed, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Zero groups fixed. Data arranged field/topic wise.");
console.log(counts);

console.log("\nLogical sample:");
fixed.filter(q => q.subject === "Logical Reasoning").slice(0, 5).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));

console.log("\nVerbal sample:");
fixed.filter(q => q.subject === "Verbal Ability").slice(0, 5).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));

console.log("\nPlacement/NQT sample:");
fixed.filter(q => q.subject === "Placement / NQT").slice(0, 5).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));

console.log("\nHR sample:");
fixed.filter(q => q.subject === "HR / Technical Interview").slice(0, 5).forEach((q, i) => console.log(`${i+1}. [${q.topic}] ${q.question}`));
