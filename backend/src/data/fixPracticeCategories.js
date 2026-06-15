require("dotenv").config();

const connectDB = require("../utils/db");
const PracticeQuestion = require("../models/PracticeQuestion");

function textOf(q) {
  return [
    q.question || "",
    q.category || "",
    q.subject || "",
    q.topic || "",
    q.subTopic || "",
    q.sourceDataset || "",
    ...(q.tags || []),
    ...(q.examRelevance || [])
  ].join(" ").toLowerCase();
}

function classify(q) {
  const t = textOf(q);

  if (
    /aptitude|quant|numerical|number|percentage|profit|loss|ratio|average|interest|time|work|speed|distance|train|boat|mixture|probability|permutation|combination|mensuration|reasoning|series|blood relation|direction|seating|syllogism|verbal|grammar|comprehension/.test(t)
  ) {
    return {
      category: "Aptitude",
      subject: /verbal|grammar|comprehension/.test(t)
        ? "Verbal Ability"
        : /reasoning|series|blood relation|direction|seating|syllogism/.test(t)
        ? "Logical Reasoning"
        : "Quantitative Aptitude"
    };
  }

  if (
    /dbms|database|sql|mysql|mongodb|normalization|transaction|index|os|operating system|process|thread|deadlock|memory|cn|computer network|tcp|udp|http|dns|coa|computer organization|cache|cpu|register/.test(t)
  ) {
    return {
      category: "Core CS",
      subject: /dbms|database|sql|mysql|mongodb|normalization|transaction|index/.test(t)
        ? "DBMS"
        : /os|operating system|process|thread|deadlock|memory/.test(t)
        ? "OS"
        : /cn|computer network|tcp|udp|http|dns/.test(t)
        ? "CN"
        : "COA"
    };
  }

  if (
    /javascript|react|node|express|python|java|c\+\+|programming|function|variable|array method|html|css|backend|frontend|api/.test(t)
  ) {
    return {
      category: "Programming Languages",
      subject: /react/.test(t)
        ? "React"
        : /node|express|api|backend/.test(t)
        ? "Backend"
        : /python/.test(t)
        ? "Python"
        : /java/.test(t)
        ? "Java"
        : "JavaScript"
    };
  }

  if (
    /array|string|stack|queue|tree|graph|linked list|dp|dynamic programming|greedy|search|sort|hash|recursion|backtracking|sliding window|two pointer|bit/.test(t)
  ) {
    return {
      category: "DSA Concepts",
      subject: /graph/.test(t)
        ? "Graphs"
        : /tree/.test(t)
        ? "Trees"
        : /stack/.test(t)
        ? "Stack"
        : /queue/.test(t)
        ? "Queue"
        : /string/.test(t)
        ? "Strings"
        : /dp|dynamic/.test(t)
        ? "Dynamic Programming"
        : "DSA Concepts"
    };
  }

  if (/nqt|placement|campus|company|tcs|infosys|wipro|accenture|capgemini|cognizant/.test(t)) {
    return {
      category: "Placement / NQT",
      subject: "Placement / NQT"
    };
  }

  if (/hr|interview|technical interview|tell me about yourself|strength|weakness/.test(t)) {
    return {
      category: "HR / Technical Interview",
      subject: "Interview"
    };
  }

  return null;
}

async function main() {
  await connectDB();

  const questions = await PracticeQuestion.find({});
  let updated = 0;
  let unchanged = 0;

  for (const q of questions) {
    const cls = classify(q);

    if (!cls) {
      unchanged++;
      continue;
    }

    q.category = cls.category;
    q.subject = cls.subject;
    q.topic = q.topic || cls.subject;
    q.subTopic = q.subTopic || cls.subject;
    q.examRelevance = Array.from(new Set([...(q.examRelevance || []), "Placement"]));

    await q.save();
    updated++;
  }

  const counts = await PracticeQuestion.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  console.log("Practice categories fixed from existing dataset questions only.");
  console.log("Updated:", updated);
  console.log("Unchanged:", unchanged);
  console.table(counts);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
