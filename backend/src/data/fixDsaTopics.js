require("dotenv").config();

const connectDB = require("../utils/db");
const Question = require("../models/Question");

const TOPICS = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Recursion",
  "Searching",
  "Sorting",
  "Hashing",
  "Trees",
  "Binary Search Tree",
  "Heap / Priority Queue",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Sliding Window",
  "Two Pointers",
  "Bit Manipulation",
  "Math / Number Theory"
];

const rules = [
  ["Dynamic Programming", ["dynamic programming", "dp", "memoization", "tabulation", "knapsack", "coin change", "subset sum", "lcs", "lis", "matrix chain", "climbing stairs", "minimum path", "maximum path"]],
  ["Graphs", ["graph", "dfs", "bfs", "dijkstra", "bellman", "floyd", "topological", "mst", "kruskal", "prim", "union find", "disjoint set", "connected components", "island", "course schedule"]],
  ["Trees", ["tree", "binary tree", "inorder", "preorder", "postorder", "level order", "diameter", "ancestor", "lca", "root", "leaf"]],
  ["Binary Search Tree", ["bst", "binary search tree", "validate bst", "recover binary search tree", "kth smallest in bst"]],
  ["Heap / Priority Queue", ["heap", "priority queue", "kth largest", "kth smallest", "top k", "merge k", "median finder"]],
  ["Linked List", ["linked list", "linkedlist", "listnode", "list node", "reverse list", "merge two sorted lists", "cycle in linked list", "remove nth node"]],
  ["Stack", ["stack", "valid parentheses", "parentheses", "bracket", "next greater", "largest rectangle", "min stack", "monotonic stack"]],
  ["Queue", ["queue", "deque", "circular queue", "rotten oranges", "first negative", "sliding window maximum"]],
  ["Backtracking", ["backtracking", "backtrack", "permutation", "combination", "subsets", "n queens", "sudoku", "word search", "rat in maze"]],
  ["Sliding Window", ["sliding window", "minimum window", "longest substring", "subarray with", "at most k", "window"]],
  ["Two Pointers", ["two pointer", "two pointers", "two sum", "3sum", "three sum", "4sum", "container with most water", "remove duplicates"]],
  ["Bit Manipulation", ["bit manipulation", "bitwise", "xor", "single number", "power of two", "set bit", "hamming"]],
  ["Greedy", ["greedy", "activity selection", "job sequencing", "minimum platforms", "fractional knapsack", "jump game", "gas station", "candy"]],
  ["Sorting", ["sorting", "sort", "merge sort", "quick sort", "insertion sort", "selection sort", "bubble sort", "counting sort"]],
  ["Searching", ["searching", "search", "binary search", "lower bound", "upper bound", "rotated sorted", "peak element"]],
  ["Hashing", ["hashing", "hash", "hashmap", "hash map", "frequency", "anagram", "duplicate", "subarray sum"]],
  ["Strings", ["string", "substring", "subsequence", "palindrome", "anagram", "roman", "word", "character", "prefix", "suffix"]],
  ["Math / Number Theory", ["math", "number theory", "prime", "gcd", "lcm", "factorial", "fibonacci", "sieve", "modulo", "power", "sqrt"]],
  ["Recursion", ["recursion", "recursive", "tower of hanoi", "generate parentheses"]],
  ["Arrays", ["array", "matrix", "subarray", "maximum subarray", "minimum", "rotate array", "interval", "merge intervals"]]
];

function clean(v = "") {
  return String(v || "")
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

function inferTopic(q) {
  const text = clean([
    q.title,
    q.topic,
    q.subTopic,
    q.pattern,
    q.platform,
    q.sourcePlatform,
    q.originalUrl,
    q.sourceDataset,
    ...(q.tags || []),
    ...(q.companies || [])
  ].join(" "));

  for (const [topic, keys] of rules) {
    if (keys.some(k => text.includes(k))) return topic;
  }

  return null;
}

async function main() {
  await connectDB();

  const questions = await Question.find({ subject: "DSA" });
  const counts = {};
  TOPICS.forEach(t => counts[t] = 0);

  let updated = 0;
  let unknown = 0;

  for (const q of questions) {
    const topic = inferTopic(q);

    if (!topic) {
      q.topic = "Uncategorized";
      q.subTopic = "Uncategorized";
      unknown++;
    } else {
      q.topic = topic;
      q.subTopic = topic;
      if (!q.pattern || q.pattern === "Problem Solving" || q.pattern === "Array") {
        q.pattern = topic;
      }
      counts[topic]++;
      updated++;
    }

    await q.save();
  }

  console.log("Dataset-only DSA topic fix completed.");
  console.log("Updated from dataset metadata/title/tags/url:", updated);
  console.log("Uncategorized because dataset had no useful topic/title keywords:", unknown);
  console.table(counts);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
