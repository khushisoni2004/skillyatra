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
    .toLowerCase();
}

function isLinkedListQuestion(text) {
  const keys = [
    "linked list",
    "linked-list",
    "listnode",
    "list node",
    "singly linked",
    "doubly linked",
    "reverse linked",
    "merge two sorted lists",
    "middle of the linked list",
    "remove nth node",
    "reorder list",
    "palindrome linked list",
    "intersection of two linked lists",
    "copy list with random pointer",
    "flatten a multilevel doubly linked list",
    "cycle in linked list",
    "detect loop",
    "delete node in a linked list"
  ];

  return keys.some((k) => text.includes(k));
}

async function main() {
  await connectDB();

  const questions = await Question.find({ subject: "DSA" });

  let updated = 0;

  for (const q of questions) {
    const text = textOf(q);

    if (isLinkedListQuestion(text)) {
      q.topic = "Linked List";
      q.subTopic = "Linked List";
      if (!q.pattern || q.pattern === "Problem Solving" || q.pattern === "Array") {
        q.pattern = "Linked List";
      }
      await q.save();
      updated++;
    }
  }

  const count = await Question.countDocuments({
    subject: "DSA",
    topic: "Linked List"
  });

  console.log("Linked List questions updated:", updated);
  console.log("Total Linked List questions now:", count);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
