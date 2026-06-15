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

function isPythonQuestion(q) {
  const t = allText(q);
  const topic = n(q.topic);

  return (
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
      "virtual environment",
      "counter in collections",
      "os.path.join",
      "range(",
      "len([",
      "pass in python",
      "'pass' in python",
      "'with' statement"
    ])
  );
}

function reclassify(q) {
  const t = allText(q);
  const topic = n(q.topic);

  // Real Python questions should always be Python
  if (isPythonQuestion(q)) {
    return { ...q, subject: "Python" };
  }

  // Remove wrong questions from Python group
  if (q.subject === "Python") {
    if (
      hasAny(topic, ["abap", "basis", "fiori", "hana", "cloud", "components", "testing", "security"]) ||
      hasAny(t, [
        "sap",
        "abap",
        "se11",
        "se80",
        "se93",
        "se38",
        "pfcg",
        "fiori",
        "sapui5",
        "hana",
        "sqlscript",
        "cds",
        "aws",
        "lambda",
        "faas",
        "cloud",
        "component-driven"
      ])
    ) {
      return { ...q, subject: "Placement / NQT" };
    }

    if (
      hasAny(topic, ["ml", "deep learning", "ai", "data science"]) ||
      hasAny(t, [
        "gan",
        "generator",
        "discriminator",
        "mode collapse",
        "machine learning",
        "deep learning",
        "neural network",
        "predictive analysis",
        "automated predictive"
      ])
    ) {
      return { ...q, subject: "Data Science" };
    }

    if (
      hasAny(topic, ["logical", "classification", "reasoning"]) ||
      hasAny(t, [
        "find the odd one",
        "statement:",
        "conclusion",
        "all glass is fragile",
        "odd one"
      ])
    ) {
      return { ...q, subject: "Logical Reasoning" };
    }

    return { ...q, subject: "Placement / NQT" };
  }

  return q;
}

function priority(q) {
  const topic = n(q.topic);
  const txt = allText(q);

  if (topic === "python") return 1;
  if (txt.includes("list")) return 2;
  if (txt.includes("dictionary")) return 3;
  if (txt.includes("tuple")) return 4;
  if (txt.includes("lambda")) return 5;
  if (txt.includes("decorator")) return 6;
  if (txt.includes("generator")) return 7;
  if (txt.includes("async")) return 8;
  if (txt.includes("pandas") || txt.includes("numpy")) return 9;
  return 20;
}

const fixed = questions
  .map(reclassify)
  .sort((a, b) => {
    if (a.subject === "Python" && b.subject === "Python") {
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

console.log("✅ Python group arranged correctly.");
console.log(counts);

console.log("\nPython sample:");
fixed
  .filter((q) => q.subject === "Python")
  .slice(0, 20)
  .forEach((q, i) => console.log(`${i + 1}. [${q.topic}] ${q.question}`));
