require("dotenv").config();

const connectDB = require("../utils/db");
const Question = require("../models/Question");

function textOf(q) {
  return [
    q.title || "",
    q.topic || "",
    q.subTopic || "",
    q.pattern || "",
    q.platform || "",
    q.sourcePlatform || "",
    q.originalUrl || "",
    q.sourceDataset || "",
    ...(q.tags || []),
    ...(q.companies || [])
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[-_/]+/g, " ");
}

const rules = [
  {
    topic: "Linked List",
    keys: [
      "linked list",
      "linkedlist",
      "list node",
      "listnode",
      "singly linked",
      "doubly linked",
      "reverse linked",
      "reverse a linked",
      "merge two sorted lists",
      "merge k sorted lists",
      "middle of the linked list",
      "remove nth node",
      "delete node in a linked list",
      "reorder list",
      "palindrome linked list",
      "intersection of two linked lists",
      "copy list with random pointer",
      "flatten a multilevel doubly linked list",
      "cycle in linked list",
      "linked list cycle",
      "detect loop",
      "add two numbers",
      "swap nodes in pairs",
      "rotate list",
      "partition list",
      "sort list"
    ]
  },
  {
    topic: "Binary Search Tree",
    keys: [
      "binary search tree",
      "bst",
      "validate bst",
      "validate binary search tree",
      "recover binary search tree",
      "kth smallest element in a bst",
      "kth smallest in bst",
      "insert into a binary search tree",
      "delete node in a bst",
      "search in a binary search tree",
      "convert sorted array to binary search tree",
      "convert sorted list to binary search tree",
      "lowest common ancestor of a binary search tree",
      "minimum absolute difference in bst",
      "range sum of bst",
      "trim a binary search tree",
      "binary search tree iterator",
      "two sum iv input is a bst",
      "balance a binary search tree"
    ]
  },
  {
    topic: "Recursion",
    keys: [
      "recursion",
      "recursive",
      "tower of hanoi",
      "hanoi",
      "josephus",
      "factorial",
      "fibonacci",
      "print numbers recursively",
      "recursive sequence",
      "sum of digits",
      "power of numbers",
      "pow x n",
      "permutation sequence",
      "generate parentheses",
      "letter combinations of a phone number",
      "combination sum",
      "subsets",
      "permutations",
      "kth symbol in grammar",
      "decode string",
      "different ways to add parentheses",
      "beautiful arrangement",
      "recursive digit sum"
    ]
  },
  {
    topic: "Greedy",
    keys: [
      "greedy",
      "activity selection",
      "job sequencing",
      "minimum platforms",
      "fractional knapsack",
      "jump game",
      "jump game ii",
      "gas station",
      "candy",
      "assign cookies",
      "lemonade change",
      "non overlapping intervals",
      "erase overlap intervals",
      "merge intervals",
      "insert interval",
      "minimum number of arrows",
      "queue reconstruction",
      "partition labels",
      "monotone increasing digits",
      "maximum units on a truck",
      "boats to save people",
      "two city scheduling",
      "minimum cost to move chips",
      "minimum deletion cost",
      "remove k digits",
      "largest number",
      "best time to buy and sell stock ii",
      "can place flowers",
      "wiggle subsequence",
      "advantage shuffle",
      "minimum swaps",
      "maximum subarray",
      "kadane",
      "huffman",
      "n meetings in one room",
      "shop in candy store",
      "minimum coins",
      "minimize the heights",
      "water connection problem"
    ]
  }
];

async function main() {
  await connectDB();

  const questions = await Question.find({ subject: "DSA" });

  const updatedCounts = {
    "Linked List": 0,
    "Binary Search Tree": 0,
    Recursion: 0,
    Greedy: 0
  };

  for (const q of questions) {
    const text = textOf(q);

    for (const rule of rules) {
      if (rule.keys.some((key) => text.includes(key))) {
        q.topic = rule.topic;
        q.subTopic = rule.topic;
        q.pattern = rule.topic;
        await q.save();
        updatedCounts[rule.topic]++;
        break;
      }
    }
  }

  const finalCounts = {};
  for (const rule of rules) {
    finalCounts[rule.topic] = await Question.countDocuments({
      subject: "DSA",
      topic: rule.topic
    });
  }

  console.log("Dataset-only important topic remap completed.");
  console.log("Updated counts in this run:");
  console.table(updatedCounts);
  console.log("Final topic counts:");
  console.table(finalCounts);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
