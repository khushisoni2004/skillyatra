const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");

const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
if (!match) {
  console.error("MCQ_QUESTIONS not found.");
  process.exit(1);
}

let questions = JSON.parse(match[1]);

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

const PROGRAMMING_TOPICS = [
  "C",
  "Python",
  "Java",
  "C++",
  "React",
  "WebDev",
  "Go",
  "General Coding",
  "MySQL Query"
];

function opt(key, text) {
  return { key, text };
}

function makeQ(topic, i, code, correct, wrongs, explanation) {
  return {
    id: `strict-50-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(i).padStart(2, "0")}`,
    subject: "Programming",
    topic,
    difficulty: i <= 18 ? "Easy" : i <= 38 ? "Medium" : "Hard",
    question: `What will be the output of this ${topic} code?\n\n${code}`,
    options: [
      opt("A", correct),
      opt("B", wrongs[0]),
      opt("C", wrongs[1]),
      opt("D", wrongs[2])
    ],
    correctAnswer: "A",
    answer: "A",
    explanation,
    sourceDataset: "Strict 50 Each Programming Output MCQs"
  };
}

function genC(i) {
  const a = i + 2;
  const b = (i % 7) + 2;
  const m = i % 10;

  if (m === 0) return [`#include <stdio.h>
int main() {
  int x = ${a};
  printf("%d", x++ + ++x);
  return 0;
}`, String(a + a + 2), [String(a + a + 1), String(a + a + 3), "Compilation error"], "x++ uses old value first, then ++x increments before use."];

  if (m === 1) return [`#include <stdio.h>
int main() {
  int x = ${a}, y = ${b};
  printf("%d", x / y + x % y);
  return 0;
}`, String(Math.trunc(a / b) + (a % b)), [String(a % b), String(Math.trunc(a / b)), String(a + b)], "Integer division gives quotient and modulo gives remainder, then both are added."];

  if (m === 2) return [`#include <stdio.h>
int main() {
  int arr[] = {${i}, ${i + 1}, ${i + 2}};
  printf("%d", arr[0] + arr[2]);
  return 0;
}`, String(i + i + 2), [String(i + 1), String(i + 2), "Garbage value"], "Array indexing starts from 0, so arr[0] and arr[2] are first and third elements."];

  if (m === 3) return [`#include <stdio.h>
int main() {
  int sum = 0;
  for(int k = 1; k <= ${b}; k++) sum += k;
  printf("%d", sum);
  return 0;
}`, String((b * (b + 1)) / 2), [String(b), String(b * b), String(b + 1)], "Loop adds numbers from 1 to n."];

  if (m === 4) return [`#include <stdio.h>
int main() {
  int x = ${a};
  printf("%d", x % 2 == 0);
  return 0;
}`, a % 2 === 0 ? "1" : "0", [a % 2 === 0 ? "0" : "1", "Even", "Odd"], "In C, true prints as 1 and false prints as 0."];

  if (m === 5) return [`#include <stdio.h>
int main() {
  int x = ${a};
  x += ${b};
  printf("%d", x);
  return 0;
}`, String(a + b), [String(a), String(b), String(a * b)], "x += y means x = x + y."];

  if (m === 6) return [`#include <stdio.h>
int main() {
  int x = ${a};
  printf("%d", --x);
  return 0;
}`, String(a - 1), [String(a), String(a + 1), "Compilation error"], "--x decrements before printing."];

  if (m === 7) return [`#include <stdio.h>
int main() {
  int x = ${a};
  if (x > ${b}) printf("Yes");
  else printf("No");
  return 0;
}`, a > b ? "Yes" : "No", [a > b ? "No" : "Yes", "1", "0"], "The if condition compares x with the given number."];

  if (m === 8) return [`#include <stdio.h>
int main() {
  int x = ${a};
  while(x < ${a + 3}) x++;
  printf("%d", x);
  return 0;
}`, String(a + 3), [String(a), String(a + 2), "Infinite loop"], "The loop increments x until it reaches the limit."];

  return [`#include <stdio.h>
int main() {
  char ch = 'A';
  printf("%c", ch + ${i % 3});
  return 0;
}`, String.fromCharCode(65 + (i % 3)), ["A", "B", "C"].filter(x => x !== String.fromCharCode(65 + (i % 3)))[0] || "D", ["65", "Compilation error"], "Character arithmetic moves ahead in ASCII order."];
}

function genPython(i) {
  const a = i + 1;
  const b = (i % 6) + 2;
  const m = i % 10;

  if (m === 0) return [`x = [${a}, ${a + 1}, ${a + 2}]
print(x[-1] + x[0])`, String((a + 2) + a), [String(a + 1), String(a + 2), "IndexError"], "x[-1] is last element and x[0] is first element."];

  if (m === 1) return [`s = "SkillYatra"
print(s[0:5])`, "Skill", ["Yatra", "SkillY", "Error"], "Python slicing excludes the ending index."];

  if (m === 2) return [`x = ${a}
y = ${b}
print(x // y, x % y)`, `${Math.floor(a / b)} ${a % b}`, [`${a / b} ${a % b}`, `${a % b} ${Math.floor(a / b)}`, "Error"], "// gives floor division and % gives remainder."];

  if (m === 3) {
    const k = (i % 4) + 1;
    const sum = [1, 2, 3, 4].slice(0, k).reduce((x, y) => x + y, 0);
    return [`nums = [1, 2, 3, 4]
print(sum(nums[:${k}]))`, String(sum), ["10", "4", "0"], "The slice selects first k elements and sum adds them."];
  }

  if (m === 4) return [`d = {"a": ${a}, "b": ${b}}
print(d["a"] + d["b"])`, String(a + b), [`${a}${b}`, String(a), "KeyError"], "Dictionary values are integers, so they are added."];

  if (m === 5) return [`print(len("Python"))`, "6", ["5", "7", "Error"], "len returns the number of characters."];

  if (m === 6) return [`x = ${a}
x += ${b}
print(x)`, String(a + b), [String(a), String(b), String(a * b)], "x += y means x = x + y."];

  if (m === 7) return [`print(bool(${i % 2 === 0 ? 0 : 1}))`, i % 2 === 0 ? "False" : "True", [i % 2 === 0 ? "True" : "False", "0", "1"], "0 is False and non-zero numbers are True in Python."];

  if (m === 8) return [`for i in range(3):
    print(i, end="")`, "012", ["123", "0123", "Error"], "range(3) produces 0, 1, 2."];

  return [`print("Hi" * ${b})`, "Hi".repeat(b), ["Hi", String(b), "Error"], "String multiplication repeats the string."];
}

function genJava(i) {
  const a = i + 2;
  const b = (i % 5) + 2;
  const m = i % 10;

  if (m === 0) return [`class Main {
  public static void main(String[] args) {
    int x = ${a};
    System.out.print(x++ + ++x);
  }
}`, String(a + a + 2), [String(a + a + 1), String(a + a + 3), "Compilation error"], "x++ uses current value, ++x increments before use."];

  if (m === 1) return [`class Main {
  public static void main(String[] args) {
    String s = "Java";
    System.out.print(s.length());
  }
}`, "4", ["3", "5", "Error"], "length() returns number of characters."];

  if (m === 2) return [`class Main {
  public static void main(String[] args) {
    int[] arr = {${i}, ${i + 1}, ${i + 2}};
    System.out.print(arr[0] + arr[2]);
  }
}`, String(i + i + 2), [String(i + 1), String(i + 2), "ArrayIndexOutOfBoundsException"], "Array index starts from 0."];

  if (m === 3) return [`class Main {
  public static void main(String[] args) {
    int x = ${a};
    System.out.print(x % ${b});
  }
}`, String(a % b), [String(Math.floor(a / b)), String(a + b), "0"], "% gives remainder."];

  if (m === 4) return [`class Main {
  public static void main(String[] args) {
    for(int k = 0; k < 3; k++) System.out.print(k);
  }
}`, "012", ["123", "0123", "Compilation error"], "The loop prints 0, 1, and 2."];

  if (m === 5) return [`class Main {
  public static void main(String[] args) {
    int x = ${a};
    x += ${b};
    System.out.print(x);
  }
}`, String(a + b), [String(a), String(b), String(a * b)], "x += y adds y to x."];

  if (m === 6) return [`class Main {
  public static void main(String[] args) {
    System.out.print(10 + "20");
  }
}`, "1020", ["30", "10 20", "Error"], "Number plus string performs concatenation."];

  if (m === 7) return [`class Main {
  public static void main(String[] args) {
    boolean flag = ${i % 2 === 0 ? "true" : "false"};
    System.out.print(flag);
  }
}`, i % 2 === 0 ? "true" : "false", [i % 2 === 0 ? "false" : "true", "1", "0"], "Boolean value prints as true or false."];

  if (m === 8) return [`class Main {
  public static void main(String[] args) {
    int x = ${a};
    System.out.print(--x);
  }
}`, String(a - 1), [String(a), String(a + 1), "Compilation error"], "--x decrements before printing."];

  return [`class Main {
  public static void main(String[] args) {
    String s = "Code";
    System.out.print(s.charAt(1));
  }
}`, "o", ["C", "d", "Error"], "charAt(1) returns the second character."];
}

function genCpp(i) {
  const a = i + 3;
  const b = (i % 4) + 2;
  const m = i % 10;

  if (m === 0) return [`#include <iostream>
using namespace std;
int main() {
  int x = ${a};
  cout << x++ + ++x;
  return 0;
}`, String(a + a + 2), [String(a + a + 1), String(a + a + 3), "Compilation error"], "Post-increment uses old value and pre-increment uses incremented value."];

  if (m === 1) return [`#include <iostream>
using namespace std;
int main() {
  string s = "Code";
  cout << s.size();
  return 0;
}`, "4", ["3", "5", "Error"], "size() returns number of characters."];

  if (m === 2) return [`#include <iostream>
using namespace std;
int main() {
  int arr[] = {${i}, ${i + 2}, ${i + 4}};
  cout << arr[1];
  return 0;
}`, String(i + 2), [String(i), String(i + 4), "Garbage value"], "arr[1] is the second element."];

  if (m === 3) return [`#include <iostream>
using namespace std;
int main() {
  int x = ${a};
  cout << (x % ${b});
  return 0;
}`, String(a % b), [String(Math.floor(a / b)), String(a + b), "0"], "% returns remainder."];

  if (m === 4) return [`#include <iostream>
using namespace std;
int main() {
  for(int k = 1; k <= 3; k++) cout << k;
  return 0;
}`, "123", ["012", "1234", "Compilation error"], "The loop prints 1, 2, 3."];

  if (m === 5) return [`#include <iostream>
using namespace std;
int main() {
  int x = ${a};
  x += ${b};
  cout << x;
  return 0;
}`, String(a + b), [String(a), String(b), String(a * b)], "x += y adds y to x."];

  if (m === 6) return [`#include <iostream>
using namespace std;
int main() {
  cout << (5 > 3);
  return 0;
}`, "1", ["true", "0", "false"], "C++ prints true as 1 when using cout by default."];

  if (m === 7) return [`#include <iostream>
using namespace std;
int main() {
  int x = ${a};
  cout << --x;
  return 0;
}`, String(a - 1), [String(a), String(a + 1), "Error"], "--x decrements before printing."];

  if (m === 8) return [`#include <iostream>
using namespace std;
int main() {
  string s = "Hello";
  cout << s[1];
  return 0;
}`, "e", ["H", "l", "Error"], "String index 1 gives the second character."];

  return [`#include <iostream>
using namespace std;
int main() {
  int x = ${a};
  if(x % 2 == 0) cout << "Even";
  else cout << "Odd";
  return 0;
}`, a % 2 === 0 ? "Even" : "Odd", [a % 2 === 0 ? "Odd" : "Even", "1", "0"], "The condition checks divisibility by 2."];
}

function genReact(i) {
  const a = i + 1;
  const m = i % 10;

  if (m === 0) return [`function App() {
  const name = "SkillYatra";
  return <h1>{name}</h1>;
}`, "SkillYatra", ["name", "{name}", "Error"], "JSX evaluates expressions inside curly braces."];

  if (m === 1) return [`function App() {
  const items = ["A", "B", "C"];
  return <p>{items.length}</p>;
}`, "3", ["2", "ABC", "Error"], "items.length is 3."];

  if (m === 2) return [`function App() {
  const isReady = ${a % 2 === 0 ? "true" : "false"};
  return <p>{isReady ? "Ready" : "Wait"}</p>;
}`, a % 2 === 0 ? "Ready" : "Wait", [a % 2 === 0 ? "Wait" : "Ready", "true", "false"], "The ternary expression renders text based on condition."];

  if (m === 3) return [`function App() {
  const count = ${a};
  return <button>{count + 1}</button>;
}`, String(a + 1), [String(a), "count + 1", "Error"], "JSX braces evaluate count + 1."];

  if (m === 4) return [`function App() {
  const user = { name: "Dev" };
  return <p>{user.name}</p>;
}`, "Dev", ["user.name", "name", "Error"], "user.name accesses the object property."];

  if (m === 5) return [`function App() {
  const visible = false;
  return <p>{visible && "Shown"}</p>;
}`, "Nothing is rendered", ["Shown", "false", "Error"], "false && expression does not render the string."];

  if (m === 6) return [`function App() {
  const marks = ${a};
  return <p>{marks >= 10 ? "Pass" : "Try Again"}</p>;
}`, a >= 10 ? "Pass" : "Try Again", [a >= 10 ? "Try Again" : "Pass", "true", "false"], "The ternary depends on whether marks is at least 10."];

  if (m === 7) return [`function App() {
  const arr = [1, 2, 3];
  return <p>{arr.map(x => x * 2).join("-")}</p>;
}`, "2-4-6", ["1-2-3", "246", "Error"], "map doubles values and join adds hyphens."];

  if (m === 8) return [`function App() {
  const title = "React";
  return <h2>{title.toUpperCase()}</h2>;
}`, "REACT", ["React", "react", "Error"], "toUpperCase converts string to uppercase."];

  return [`function App() {
  const a = ${a};
  return <p>{a % 2 === 0 ? "Even" : "Odd"}</p>;
}`, a % 2 === 0 ? "Even" : "Odd", [a % 2 === 0 ? "Odd" : "Even", "true", "false"], "The expression checks whether number is even."];
}

function genWebDev(i) {
  const a = i + 2;
  const m = i % 10;

  if (m === 0) return [`console.log(typeof "SkillYatra");`, "string", ["String", "text", "object"], "typeof string literal returns string."];

  if (m === 1) return [`console.log(2 + "3");`, "23", ["5", "Error", "undefined"], "Number plus string performs concatenation."];

  if (m === 2) return [`console.log(Boolean(0));`, "false", ["true", "0", "undefined"], "0 is falsy in JavaScript."];

  if (m === 3) return [`let x = ${a};
x += 3;
console.log(x);`, String(a + 3), [String(a), "3", "undefined"], "x += 3 adds 3 to x."];

  if (m === 4) return [`const arr = [10, 20, 30];
console.log(arr[1]);`, "20", ["10", "30", "undefined"], "arr[1] is the second element."];

  if (m === 5) return [`console.log("5" == 5);`, "true", ["false", "Error", "undefined"], "== allows type conversion in JavaScript."];

  if (m === 6) return [`console.log("5" === 5);`, "false", ["true", "Error", "undefined"], "=== checks value and type both."];

  if (m === 7) return [`let a = [1, 2, 3];
console.log(a.length);`, "3", ["2", "4", "undefined"], "length returns number of array elements."];

  if (m === 8) return [`console.log([1, 2, 3].includes(2));`, "true", ["false", "2", "undefined"], "includes checks whether the value exists in array."];

  return [`console.log("web".toUpperCase());`, "WEB", ["web", "Web", "Error"], "toUpperCase converts string to uppercase."];
}

function genGo(i) {
  const a = i + 2;
  const b = (i % 5) + 2;
  const m = i % 10;

  if (m === 0) return [`package main
import "fmt"
func main() {
  x := ${a}
  fmt.Print(x + ${b})
}`, String(a + b), [String(a), String(b), "Compilation error"], "x is added with the constant."];

  if (m === 1) return [`package main
import "fmt"
func main() {
  s := "GoLang"
  fmt.Print(len(s))
}`, "6", ["5", "7", "Error"], "len gives byte length; GoLang has 6 ASCII characters."];

  if (m === 2) return [`package main
import "fmt"
func main() {
  nums := []int{${i}, ${i + 1}, ${i + 2}}
  fmt.Print(nums[1])
}`, String(i + 1), [String(i), String(i + 2), "panic"], "Slice index starts at 0."];

  if (m === 3) return [`package main
import "fmt"
func main() {
  x := ${a}
  fmt.Print(x % ${b})
}`, String(a % b), [String(Math.floor(a / b)), String(a + b), "0"], "% gives remainder."];

  if (m === 4) return [`package main
import "fmt"
func main() {
  for i := 0; i < 3; i++ {
    fmt.Print(i)
  }
}`, "012", ["123", "0123", "Compilation error"], "Loop prints 0, 1, 2."];

  if (m === 5) return [`package main
import "fmt"
func main() {
  x := ${a}
  x += ${b}
  fmt.Print(x)
}`, String(a + b), [String(a), String(b), String(a * b)], "x += y adds y to x."];

  if (m === 6) return [`package main
import "fmt"
func main() {
  fmt.Print(true && false)
}`, "false", ["true", "1", "0"], "true && false evaluates to false."];

  if (m === 7) return [`package main
import "fmt"
func main() {
  m := map[string]int{"a": ${a}, "b": ${b}}
  fmt.Print(m["a"])
}`, String(a), [String(b), String(a + b), "0"], "Map value is accessed using key a."];

  if (m === 8) return [`package main
import "fmt"
func main() {
  s := []int{1, 2, 3, 4}
  fmt.Print(len(s))
}`, "4", ["3", "5", "Error"], "len returns slice length."];

  return [`package main
import "fmt"
func main() {
  x := ${a}
  if x%2 == 0 {
    fmt.Print("Even")
  } else {
    fmt.Print("Odd")
  }
}`, a % 2 === 0 ? "Even" : "Odd", [a % 2 === 0 ? "Odd" : "Even", "true", "false"], "Condition checks divisibility by 2."];
}

function genGeneralCoding(i) {
  const a = i + 1;
  const m = i % 10;

  if (m === 0) return [`Pseudo-code:
x = ${a}
y = x * 2
print(y + 1)`, String(a * 2 + 1), [String(a * 2), String(a + 1), "Error"], "First x is doubled, then 1 is added."];

  if (m === 1) return [`Pseudo-code:
arr = [2, 4, 6, 8]
print(arr[2])`, "6", ["4", "8", "2"], "Index 2 means third element."];

  if (m === 2) return [`Pseudo-code:
sum = 0
for i from 1 to 4:
  sum = sum + i
print(sum)`, "10", ["4", "6", "15"], "Sum is 1 + 2 + 3 + 4."];

  if (m === 3) return [`Pseudo-code:
if ${a} > ${a - 1}:
  print("Yes")
else:
  print("No")`, "Yes", ["No", "True", "False"], "The condition is true."];

  if (m === 4) return [`Pseudo-code:
x = ${a}
while x < ${a + 3}:
  x = x + 1
print(x)`, String(a + 3), [String(a), String(a + 2), "Infinite loop"], "The loop increments until x reaches the limit."];

  if (m === 5) return [`Pseudo-code:
a = ${a}
b = ${a + 2}
swap(a, b)
print(a)`, String(a + 2), [String(a), String(a + a + 2), "Error"], "After swap, a gets old value of b."];

  if (m === 6) return [`Pseudo-code:
x = 1
repeat 3 times:
  x = x * 2
print(x)`, "8", ["6", "4", "16"], "1 doubled three times becomes 8."];

  if (m === 7) return [`Pseudo-code:
count = 0
for each item in [1, 3, 5]:
  count = count + 1
print(count)`, "3", ["2", "5", "9"], "There are 3 items."];

  if (m === 8) return [`Pseudo-code:
x = ${a}
print(x is even)`, a % 2 === 0 ? "true" : "false", [a % 2 === 0 ? "false" : "true", "Even", "Odd"], "The expression checks whether x is divisible by 2."];

  return [`Pseudo-code:
s = "code"
print(length(s))`, "4", ["3", "5", "Error"], "The word code has 4 characters."];
}

function genMySQL(i) {
  const m = i % 10;
  const limit = (i % 5) + 1;
  const salary = 30000 + i * 1000;

  if (m === 0) return [`SELECT 10 + ${i} AS result;`, String(10 + i), [String(i), "10", "NULL"], "The SELECT expression adds the two numbers and returns the result column."];

  if (m === 1) return [`SELECT CONCAT('Skill', 'Yatra') AS name;`, "SkillYatra", ["Skill Yatra", "CONCAT", "NULL"], "CONCAT joins the strings without adding spaces."];

  if (m === 2) return [`SELECT LENGTH('MySQL') AS len;`, "5", ["4", "6", "NULL"], "LENGTH returns the number of bytes/characters for this ASCII string."];

  if (m === 3) return [`SELECT UPPER('query') AS word;`, "QUERY", ["query", "Query", "NULL"], "UPPER converts the string to uppercase."];

  if (m === 4) return [`SELECT ROUND(12.678, 1) AS value;`, "12.7", ["12.6", "13", "12.68"], "ROUND with 1 decimal rounds the value to one digit after decimal."];

  if (m === 5) return [`SELECT MOD(${i + 10}, 3) AS rem;`, String((i + 10) % 3), [String(Math.floor((i + 10) / 3)), "3", "0"], "MOD returns the remainder after division."];

  if (m === 6) return [`SELECT IF(${i} > 25, 'High', 'Low') AS status;`, i > 25 ? "High" : "Low", [i > 25 ? "Low" : "High", "true", "false"], "IF returns the second value when condition is true, otherwise third value."];

  if (m === 7) return [`SELECT COALESCE(NULL, 'Active', 'Inactive') AS status;`, "Active", ["NULL", "Inactive", "Error"], "COALESCE returns the first non-NULL value."];

  if (m === 8) return [`SELECT SUBSTRING('Database', 1, 4) AS part;`, "Data", ["Base", "Datab", "DataBase"], "SUBSTRING starts from position 1 and takes 4 characters."];

  return [`SELECT ${salary} > 50000 AS is_high_salary;`, salary > 50000 ? "1" : "0", [salary > 50000 ? "0" : "1", "true", "false"], "MySQL returns 1 for true comparison and 0 for false comparison."];
}

const generators = {
  C: genC,
  Python: genPython,
  Java: genJava,
  "C++": genCpp,
  React: genReact,
  WebDev: genWebDev,
  Go: genGo,
  "General Coding": genGeneralCoding,
  "MySQL Query": genMySQL
};

// Remove previous manual programming curated questions only.
// Existing dataset questions stay safe.
questions = questions.map((q) => {
  if (
    q.sourceDataset === "Manual Curated Coding Output MCQs" ||
    q.sourceDataset === "Strict 50 Each Programming Output MCQs"
  ) {
    return null;
  }

  // Move old non-curated Programming out, so Programming count is strict curated only.
  if (q.subject === "Programming" && !generators[q.topic]) {
    return { ...q, subject: "Placement / NQT" };
  }

  return q;
}).filter(Boolean);

const added = [];
const seen = new Set(questions.map((q) => String(q.question || "").trim().toLowerCase()));

for (const topic of Object.keys(generators)) {
  let count = 0;
  let i = 1;

  while (count < 50 && i < 500) {
    const [code, correct, wrongs, explanation] = generators[topic](i);
    const q = makeQ(topic, count + 1, code, correct, wrongs, explanation);
    const key = q.question.trim().toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      added.push(q);
      count++;
    }

    i++;
  }

  if (count !== 50) {
    console.error(`Failed to create 50 unique questions for ${topic}. Created ${count}`);
    process.exit(1);
  }
}

const merged = [...questions, ...added];

const counts = {};
for (const group of GROUPS) {
  counts[group] =
    group === "All"
      ? merged.length
      : merged.filter((q) => q.subject === group).length;
}

const topicCounts = {};
for (const topic of Object.keys(generators)) {
  topicCounts[topic] = merged.filter((q) => q.subject === "Programming" && q.topic === topic).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Strict programming questions added.");
console.log("✅ Added:", added.length);
console.log("✅ Programming topic counts:", topicCounts);
console.log("✅ Group counts:", counts);
