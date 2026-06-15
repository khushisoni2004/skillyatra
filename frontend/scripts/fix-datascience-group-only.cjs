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

function isDataScience(q) {
  const t = allText(q);
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
      "bias variance",
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
      "generator",
      "discriminator",
      "tokenization",
      "stemming",
      "lemmatization",
      "corpus",
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

function reclassify(q) {
  const t = allText(q);
  const topic = n(q.topic);

  // Wrong Data Science questions: classification / odd-one-out / reasoning
  if (
    q.subject === "Data Science" &&
    (
      topic === "classification" ||
      topic === "logical" ||
      topic === "reasoning" ||
      hasAny(t, [
        "find the odd one",
        "odd one",
        "statement:",
        "conclusion?",
        "all glass is fragile",
        "ranking:",
        "blood relation",
        "coding-decoding",
        "number series"
      ])
    )
  ) {
    return { ...q, subject: "Logical Reasoning" };
  }

  // Reading comprehension should not be Data Science
  if (
    q.subject === "Data Science" &&
    (
      topic === "reading comprehension" ||
      hasAny(t, ["reading comprehension", "passage"])
    )
  ) {
    return { ...q, subject: "Verbal Ability" };
  }

  // Keep only real DS questions in Data Science
  if (isDataScience(q)) {
    return { ...q, subject: "Data Science" };
  }

  // If currently Data Science but not actual DS, move to Placement/NQT
  if (q.subject === "Data Science") {
    return { ...q, subject: "Placement / NQT" };
  }

  return q;
}

function priority(q) {
  const topic = n(q.topic);
  const t = allText(q);

  if (topic.includes("ml basics")) return 1;
  if (topic === "ml") return 2;
  if (topic.includes("models")) return 3;
  if (topic.includes("preprocessing")) return 4;
  if (topic.includes("training")) return 5;
  if (topic.includes("deep learning")) return 6;
  if (topic.includes("nlp")) return 7;
  if (topic.includes("statistics")) return 8;
  if (t.includes("time series") || t.includes("arima")) return 9;
  return 20;
}

const fixed = questions
  .map(reclassify)
  .sort((a, b) => {
    if (a.subject === "Data Science" && b.subject === "Data Science") {
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

console.log("✅ Data Science group arranged correctly.");
console.log(counts);

console.log("\nData Science sample:");
fixed
  .filter((q) => q.subject === "Data Science")
  .slice(0, 20)
  .forEach((q, i) => console.log(`${i + 1}. [${q.topic}] ${q.question}`));

console.log("\nMoved Classification sample to Logical Reasoning:");
fixed
  .filter((q) => q.subject === "Logical Reasoning" && String(q.topic || "").toLowerCase().includes("classification"))
  .slice(0, 10)
  .forEach((q, i) => console.log(`${i + 1}. [${q.topic}] ${q.question}`));
