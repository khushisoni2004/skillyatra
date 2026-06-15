const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");

const qMatch = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
const gMatch = text.match(/export const MCQ_GROUPS = ([\s\S]*?);\s*export const MCQ_COUNTS/);

if (!qMatch) {
  console.error("MCQ_QUESTIONS not found.");
  process.exit(1);
}

let oldQuestions = JSON.parse(qMatch[1]);

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

const existingText = new Set(
  oldQuestions.map((q) => String(q.question || "").trim().toLowerCase())
);

function option(key, text) {
  return { key, text };
}

function makeQuestion(topic, index, code, correct, wrongs, explanation) {
  const question = `What will be the output of this ${topic} code?\n\n${code}`;

  return {
    id: `manual-output-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(index).padStart(3, "0")}`,
    subject: "Programming",
    topic,
    difficulty: index <= 18 ? "Easy" : index <= 38 ? "Medium" : "Hard",
    question,
    options: [
      option("A", correct),
      option("B", wrongs[0]),
      option("C", wrongs[1]),
      option("D", wrongs[2])
    ],
    correctAnswer: "A",
    answer: "A",
    explanation,
    sourceDataset: "Manual Curated Coding Output MCQs"
  };
}

const languageSeeds = {
  C: {
    code: (i) => {
      const a = i + 2;
      const b = (i % 7) + 3;
      const op = i % 5;
      if (op === 0) return [`#include <stdio.h>\nint main() {\n  int a = ${a};\n  printf("%d", a++ + ++a);\n  return 0;\n}`, String(a + (a + 2)), [`${a + a + 1}`, `${a + a + 3}`, "Compilation error"], "Post-increment uses old value first, pre-increment increases before use, so expression becomes old a plus updated a."];
      if (op === 1) return [`#include <stdio.h>\nint main() {\n  int x = ${a}, y = ${b};\n  printf("%d", x % y + x / y);\n  return 0;\n}`, String((a % b) + Math.trunc(a / b)), [`${a % b}`, `${Math.trunc(a / b)}`, `${a + b}`], "Integer division removes decimal part and modulo gives remainder; both results are added."];
      if (op === 2) return [`#include <stdio.h>\nint main() {\n  int arr[] = {${i}, ${i + 1}, ${i + 2}};\n  printf("%d", arr[1] + arr[2]);\n  return 0;\n}`, String(i + 1 + i + 2), [`${i + 2}`, `${i + 3}`, `${i}`], "Array index starts at 0, so arr[1] and arr[2] are the second and third values."];
      if (op === 3) return [`#include <stdio.h>\nint main() {\n  int sum = 0;\n  for(int k = 1; k <= ${b}; k++) sum += k;\n  printf("%d", sum);\n  return 0;\n}`, String((b * (b + 1)) / 2), [`${b}`, `${b * b}`, `${b + 1}`], "The loop adds numbers from 1 to n, so the sum is n(n+1)/2."];
      return [`#include <stdio.h>\nint main() {\n  int x = ${a};\n  if(x % 2 == 0) printf("Even");\n  else printf("Odd");\n  return 0;\n}`, a % 2 === 0 ? "Even" : "Odd", [a % 2 === 0 ? "Odd" : "Even", "0", "1"], "The if condition checks whether the number is divisible by 2."];
    }
  },

  Python: {
    code: (i) => {
      const a = i + 1;
      const b = (i % 6) + 2;
      const op = i % 5;
      if (op === 0) return [`x = [${a}, ${a + 1}, ${a + 2}]\nprint(x[-1] + x[0])`, String((a + 2) + a), [`${a + 1}`, `${a + 2}`, "IndexError"], "Negative index -1 accesses the last element, and x[0] accesses the first element."];
      if (op === 1) return [`s = "SkillYatra"\nprint(s[0:5])`, "Skill", ["Yatra", "SkillY", "Error"], "Python slicing includes the start index and excludes the end index."];
      if (op === 2) return [`x = ${a}\ny = ${b}\nprint(x // y, x % y)`, `${Math.floor(a / b)} ${a % b}`, [`${a / b} ${a % b}`, `${a % b} ${Math.floor(a / b)}`, "Error"], "// gives floor division and % gives remainder."];
      if (op === 3) return [`nums = [1, 2, 3, 4]\nprint(sum(nums[:${(i % 4) + 1}]))`, String([1,2,3,4].slice(0,(i%4)+1).reduce((x,y)=>x+y,0)), ["10", "4", "0"], "The slice selects the first given number of elements and sum adds them."];
      return [`d = {"a": ${a}, "b": ${b}}\nprint(d["a"] + d["b"])`, String(a + b), [`${a}${b}`, `${a}`, "KeyError"], "Dictionary values are accessed by keys and integer values are added."];
    }
  },

  Java: {
    code: (i) => {
      const a = i + 2;
      const b = (i % 5) + 2;
      const op = i % 5;
      if (op === 0) return [`class Main {\n  public static void main(String[] args) {\n    int x = ${a};\n    System.out.print(x++ + ++x);\n  }\n}`, String(a + (a + 2)), [`${a + a + 1}`, `${a + a + 3}`, "Compilation error"], "x++ uses current value first, then ++x increments before use."];
      if (op === 1) return [`class Main {\n  public static void main(String[] args) {\n    String s = "Java";\n    System.out.print(s.length());\n  }\n}`, "4", ["3", "5", "Error"], "length() returns the number of characters in the string."];
      if (op === 2) return [`class Main {\n  public static void main(String[] args) {\n    int[] a = {${i}, ${i + 1}, ${i + 2}};\n    System.out.print(a[0] + a[2]);\n  }\n}`, String(i + i + 2), [`${i + 1}`, `${i + 2}`, "ArrayIndexOutOfBoundsException"], "Java arrays use zero-based indexing, so a[0] and a[2] are first and third elements."];
      if (op === 3) return [`class Main {\n  public static void main(String[] args) {\n    int x = ${a};\n    System.out.print(x % ${b});\n  }\n}`, String(a % b), [`${Math.floor(a / b)}`, `${a + b}`, "0"], "% returns the remainder after division."];
      return [`class Main {\n  public static void main(String[] args) {\n    for(int k=0; k<3; k++) System.out.print(k);\n  }\n}`, "012", ["123", "0123", "Compilation error"], "The loop starts from 0 and runs while k is less than 3."];
    }
  },

  "C++": {
    code: (i) => {
      const a = i + 3;
      const b = (i % 4) + 2;
      const op = i % 5;
      if (op === 0) return [`#include <iostream>\nusing namespace std;\nint main() {\n  int x = ${a};\n  cout << x++ + ++x;\n  return 0;\n}`, String(a + (a + 2)), [`${a + a + 1}`, `${a + a + 3}`, "Compilation error"], "Post-increment uses the old value and pre-increment uses the incremented value."];
      if (op === 1) return [`#include <iostream>\nusing namespace std;\nint main() {\n  string s = "Code";\n  cout << s.size();\n  return 0;\n}`, "4", ["3", "5", "Error"], "size() returns the number of characters in the string."];
      if (op === 2) return [`#include <iostream>\nusing namespace std;\nint main() {\n  int a[] = {${i}, ${i + 2}, ${i + 4}};\n  cout << a[1];\n  return 0;\n}`, String(i + 2), [`${i}`, `${i + 4}`, "Garbage value"], "Array index 1 gives the second element."];
      if (op === 3) return [`#include <iostream>\nusing namespace std;\nint main() {\n  int x = ${a};\n  cout << (x % ${b});\n  return 0;\n}`, String(a % b), [`${Math.floor(a / b)}`, `${a + b}`, "0"], "Modulo operator returns the remainder."];
      return [`#include <iostream>\nusing namespace std;\nint main() {\n  for(int i=1; i<=3; i++) cout << i;\n  return 0;\n}`, "123", ["012", "1234", "Compilation error"], "The loop prints i from 1 to 3."];
    }
  },

  React: {
    code: (i) => {
      const a = i + 1;
      const op = i % 5;
      if (op === 0) return [`function App() {\n  const name = "SkillYatra";\n  return <h1>{name}</h1>;\n}`, "SkillYatra", ["name", "{name}", "Error"], "JSX evaluates JavaScript expressions inside curly braces."];
      if (op === 1) return [`function App() {\n  const items = ["A", "B", "C"];\n  return <p>{items.length}</p>;\n}`, "3", ["2", "ABC", "Error"], "items.length returns the number of elements in the array."];
      if (op === 2) return [`function App() {\n  const isReady = ${a % 2 === 0 ? "true" : "false"};\n  return <p>{isReady ? "Ready" : "Wait"}</p>;\n}`, a % 2 === 0 ? "Ready" : "Wait", [a % 2 === 0 ? "Wait" : "Ready", "true", "false"], "The ternary operator renders one text based on the boolean value."];
      if (op === 3) return [`function App() {\n  const count = ${a};\n  return <button>{count + 1}</button>;\n}`, String(a + 1), [`${a}`, "count + 1", "Error"], "The expression inside JSX braces is evaluated before rendering."];
      return [`function App() {\n  const user = { name: "Dev" };\n  return <p>{user.name}</p>;\n}`, "Dev", ["user.name", "name", "Error"], "Object property user.name is evaluated inside JSX braces."];
    }
  },

  WebDev: {
    code: (i) => {
      const a = i + 2;
      const op = i % 5;
      if (op === 0) return [`console.log(typeof "SkillYatra");`, "string", ["String", "text", "object"], "typeof on a string literal returns string."];
      if (op === 1) return [`console.log(2 + "3");`, "23", ["5", "Error", "undefined"], "When number is added to string, JavaScript performs string concatenation."];
      if (op === 2) return [`console.log(Boolean(0));`, "false", ["true", "0", "undefined"], "0 is a falsy value in JavaScript."];
      if (op === 3) return [`let x = ${a};\nx += 3;\nconsole.log(x);`, String(a + 3), [`${a}`, "3", "undefined"], "x += 3 adds 3 to the current value of x."];
      return [`const arr = [10, 20, 30];\nconsole.log(arr[1]);`, "20", ["10", "30", "undefined"], "Array indexing starts from 0, so arr[1] is the second element."];
    }
  },

  Go: {
    code: (i) => {
      const a = i + 2;
      const b = (i % 5) + 2;
      const op = i % 5;
      if (op === 0) return [`package main\nimport "fmt"\nfunc main() {\n  x := ${a}\n  fmt.Print(x + ${b})\n}`, String(a + b), [`${a}`, `${b}`, "Compilation error"], "The short variable declaration creates x, then x and the constant are added."];
      if (op === 1) return [`package main\nimport "fmt"\nfunc main() {\n  s := "GoLang"\n  fmt.Print(len(s))\n}`, "6", ["5", "7", "Error"], "len returns the byte length of the string; GoLang has 6 ASCII characters."];
      if (op === 2) return [`package main\nimport "fmt"\nfunc main() {\n  nums := []int{${i}, ${i + 1}, ${i + 2}}\n  fmt.Print(nums[1])\n}`, String(i + 1), [`${i}`, `${i + 2}`, "panic"], "Slice indexing starts at 0, so nums[1] is the second value."];
      if (op === 3) return [`package main\nimport "fmt"\nfunc main() {\n  x := ${a}\n  fmt.Print(x % ${b})\n}`, String(a % b), [`${Math.floor(a / b)}`, `${a + b}`, "0"], "The % operator returns the remainder."];
      return [`package main\nimport "fmt"\nfunc main() {\n  for i := 0; i < 3; i++ {\n    fmt.Print(i)\n  }\n}`, "012", ["123", "0123", "Compilation error"], "The loop starts from 0 and runs while i is less than 3."];
    }
  },

  "General Coding": {
    code: (i) => {
      const a = i + 1;
      const op = i % 5;
      if (op === 0) return [`Pseudo-code:\nx = ${a}\ny = x * 2\nprint(y + 1)`, String(a * 2 + 1), [`${a * 2}`, `${a + 1}`, "Error"], "First x is doubled, then 1 is added."];
      if (op === 1) return [`Pseudo-code:\narr = [2, 4, 6, 8]\nprint(arr[2])`, "6", ["4", "8", "2"], "Index 2 means the third element in zero-based indexing."];
      if (op === 2) return [`Pseudo-code:\nsum = 0\nfor i from 1 to 4:\n  sum = sum + i\nprint(sum)`, "10", ["4", "6", "15"], "The loop adds 1 + 2 + 3 + 4."];
      if (op === 3) return [`Pseudo-code:\nif ${a} > ${a - 1}:\n  print("Yes")\nelse:\n  print("No")`, "Yes", ["No", "True", "False"], "The condition is true because the first number is greater."];
      return [`Pseudo-code:\nx = ${a}\nwhile x < ${a + 3}:\n  x = x + 1\nprint(x)`, String(a + 3), [`${a}`, `${a + 2}`, "Infinite loop"], "The loop increases x until it becomes equal to the limit."];
    }
  }
};

const newQuestions = [];

for (const topic of Object.keys(languageSeeds)) {
  for (let i = 1; i <= 50; i++) {
    const [code, correct, wrongs, explanation] = languageSeeds[topic].code(i);
    const q = makeQuestion(topic, i, code, correct, wrongs, explanation);

    const key = q.question.trim().toLowerCase();
    if (!existingText.has(key)) {
      existingText.add(key);
      newQuestions.push(q);
    }
  }
}

const merged = [...oldQuestions, ...newQuestions];

const counts = {};
for (const group of GROUPS) {
  counts[group] =
    group === "All"
      ? merged.length
      : merged.filter((q) => q.subject === group).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Added coding output MCQs:", newQuestions.length);
console.log("✅ Total MCQs:", merged.length);
console.log("✅ Counts:", counts);
