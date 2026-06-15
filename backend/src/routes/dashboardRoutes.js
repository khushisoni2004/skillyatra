const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

async function safeCount(name) {
  try {
    return await mongoose.connection.db.collection(name).countDocuments();
  } catch {
    return 0;
  }
}

router.get("/stats", async (req, res) => {
  try {
    const users = await safeCount("users");
    const practiceQuestions = await safeCount("practicequestions");
    const dsaQuestions = await safeCount("questions");
    const interviewQuestions = await safeCount("interviewquestions");
    const resources = await safeCount("resources");
    const companies = await safeCount("companyplans");
    const attempts = await safeCount("practiceattempts");
    const progress = await safeCount("progresses");

    const hrInterview = await mongoose.connection.db
      .collection("interviewquestions")
      .countDocuments({ type: "HR" });

    const technicalInterview = await mongoose.connection.db
      .collection("interviewquestions")
      .countDocuments({ type: "Technical" });

    res.json({
      users,
      practiceQuestions,
      dsaQuestions,
      interviewQuestions,
      hrInterview,
      technicalInterview,
      resources,
      companies,
      attempts,
      progress,
      totalLearningItems:
        practiceQuestions + dsaQuestions + interviewQuestions + resources + companies
    });
  } catch (err) {
    res.status(500).json({
      message: "Dashboard stats failed",
      error: err.message
    });
  }
});

module.exports = router;
