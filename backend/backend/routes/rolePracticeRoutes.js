const express = require("express");
const router = express.Router();

let PracticeQuestion;

try {
  PracticeQuestion = require("../models/PracticeQuestion");
} catch (error) {
  try {
    PracticeQuestion = require("../models/practiceQuestion");
  } catch (innerError) {
    PracticeQuestion = require("../models/PracticeQuestions");
  }
}

const roleMap = {
  "Software Developer": [
    "Software Developer",
    "Software",
    "SDE",
    "DSA",
    "Programming",
    "OOP"
  ],
  "Frontend Developer": [
    "Frontend Developer",
    "Frontend",
    "React",
    "JavaScript",
    "HTML",
    "CSS"
  ],
  "Backend Developer": [
    "Backend Developer",
    "Backend",
    "Node.js",
    "Express",
    "MongoDB",
    "API"
  ],
  "MERN Stack Developer": [
    "MERN Stack Developer",
    "MERN",
    "React",
    "Node.js",
    "Express",
    "MongoDB"
  ],
  "Data Science Engineer": [
    "Data Science Engineer",
    "Data Science",
    "Python",
    "Pandas",
    "Machine Learning",
    "Statistics"
  ],
  "AI/ML Developer": [
    "AI/ML Developer",
    "AI ML",
    "AI",
    "ML",
    "Machine Learning",
    "Deep Learning",
    "Python"
  ],
  "Python Developer": [
    "Python Developer",
    "Python",
    "Django",
    "Flask",
    "FastAPI"
  ]
};

router.get("/role-practice/:role", async (req, res) => {
  try {
    const role = decodeURIComponent(req.params.role || "Software Developer");
    const searchValues = roleMap[role] || [role];

    const query = {
      $or: [
        { role: { $in: searchValues } },
        { category: { $in: searchValues } },
        { topic: { $in: searchValues } },
        { tags: { $in: searchValues } }
      ]
    };

    let questions = await PracticeQuestion.find(query)
      .select("role category topic difficulty question title options answer explanation type tags")
      .limit(120)
      .lean();

    if (!questions.length) {
      questions = await PracticeQuestion.find({
        $or: [
          { question: { $regex: searchValues.join("|"), $options: "i" } },
          { title: { $regex: searchValues.join("|"), $options: "i" } },
          { topic: { $regex: searchValues.join("|"), $options: "i" } },
          { category: { $regex: searchValues.join("|"), $options: "i" } }
        ]
      })
        .select("role category topic difficulty question title options answer explanation type tags")
        .limit(120)
        .lean();
    }

    return res.status(200).json({
      success: true,
      role,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error("Role practice questions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load role practice questions"
    });
  }
});

module.exports = router;
