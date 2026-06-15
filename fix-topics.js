const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "backend/src/utils/normalize.js");
let text = fs.readFileSync(file, "utf8");

const start = text.indexOf("function inferTopic(row = {})");
const end = text.indexOf("function cleanTitle(row = {})");

if (start === -1 || end === -1) {
  console.error("Could not find inferTopic block");
  process.exit(1);
}

const newInferTopic = `
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

  const padded = " " + raw.replace(/[-_\\/]+/g, " ") + " ";

  for (const [topic, keys] of checks) {
    if (keys.some((k) => padded.includes(k))) return topic;
  }

  return "Arrays";
}

`;

text = text.slice(0, start) + newInferTopic + text.slice(end);
fs.writeFileSync(file, text);
console.log("Topic mapper updated successfully.");
