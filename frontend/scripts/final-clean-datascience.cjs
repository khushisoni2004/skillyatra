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

function txt(q) {
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

function isRealDataScience(q) {
  const t = txt(q);
  const topic = n(q.topic);

  return (
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
      "auc",
      "roc",
      "rmse",
      "mae",
      "mse",
      "gradient descent",
      "backpropagation",
      "cnn",
      "rnn",
      "lstm",
      "bert",
      "transformer",
      "gan",
      "generator creates fakes",
      "discriminator",
      "tokenization",
      "stemming",
      "lemmatization",
      "corpus in nlp",
      "vocabulary in nlp",
      "oov",
      "out-of-vocabulary",
      "embedding",
      "time series",
      "arima",
      "stationarity",
      "autocorrelation",
      "kl divergence",
      "monte carlo",
      "expected value",
      "null hypothesis",
      "p-value",
      "statistical inference"
    ])
  );
}

function fix(q) {
  const t = txt(q);
  const topic = n(q.topic);

  // Classification / odd-one-out ko user ke according Aptitude me rakho
  if (
    topic === "classification" ||
    hasAny(t, ["find the odd one", "odd one"])
  ) {
    return { ...q, subject: "Quantitative Aptitude" };
  }

  // Aptitude questions
  if (
    topic === "aptitude" ||
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
      "hcf"
    ])
  ) {
    return { ...q, subject: "Quantitative Aptitude" };
  }

  // Verbal questions
  if (
    topic === "reading comprehension" ||
    topic === "fill in the blanks" ||
    topic === "analogies" ||
    topic === "analogy" ||
    hasAny(t, [
      "passage:",
      "reading comprehension",
      "fill in the blanks",
      "she was _____",
      "he had an _____",
      "biologist : life",
      "synonym",
      "antonym",
      "grammar",
      "vocabulary"
    ])
  ) {
    return { ...q, subject: "Verbal Ability" };
  }

  // Logical Reasoning
  if (
    topic === "logical" ||
    topic === "input-output" ||
    topic === "reasoning" ||
    hasAny(t, [
      "statement-conclusion",
      "statement:",
      "conclusion?",
      "step process",
      "input:",
      "ranking:",
      "blood relation",
      "coding-decoding",
      "number series"
    ])
  ) {
    return { ...q, subject: "Logical Reasoning" };
  }

  // SAP / business / pipeline / technical placement
  if (
    ["co", "fi", "mm", "sd", "pipelines", "hana", "abap", "basis", "fiori", "cloud", "components"].includes(topic) ||
    hasAny(t, [
      "controlling area",
      "cost center",
      "profit center",
      "new g/l",
      "quota arrangement",
      "sales area",
      "condition record",
      "rebate processing",
      "pipeline stage",
      "ci/cd",
      "supply chain security",
      "sap",
      "hana",
      "abap",
      "aws",
      "lambda"
    ])
  ) {
    return { ...q, subject: "Placement / NQT" };
  }

  // Real Data Science only
  if (isRealDataScience(q)) {
    return { ...q, subject: "Data Science" };
  }

  // Agar Data Science me kuch unknown bacha hai, Placement/NQT me bhejo
  if (q.subject === "Data Science") {
    return { ...q, subject: "Placement / NQT" };
  }

  return q;
}

function dsPriority(q) {
  const topic = n(q.topic);
  const t = txt(q);

  if (topic === "ml basics") return 1;
  if (topic === "ml") return 2;
  if (topic === "models") return 3;
  if (topic === "preprocessing") return 4;
  if (topic === "training") return 5;
  if (topic === "deep learning") return 6;
  if (topic === "nlp") return 7;
  if (topic === "statistics") return 8;
  if (t.includes("time series") || t.includes("arima")) return 9;
  return 20;
}

const fixed = questions
  .map(fix)
  .sort((a, b) => {
    if (a.subject === "Data Science" && b.subject === "Data Science") {
      return dsPriority(a) - dsPriority(b);
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

console.log("✅ Data Science cleaned. Classification moved to Quantitative Aptitude.");
console.log(counts);

console.log("\nData Science sample:");
fixed.filter(q => q.subject === "Data Science").slice(0, 15).forEach((q, i) => {
  console.log(`${i + 1}. [${q.topic}] ${q.question}`);
});

console.log("\nClassification now in Quantitative Aptitude:");
fixed.filter(q => q.subject === "Quantitative Aptitude" && String(q.topic || "").toLowerCase() === "classification").slice(0, 10).forEach((q, i) => {
  console.log(`${i + 1}. [${q.topic}] ${q.question}`);
});
