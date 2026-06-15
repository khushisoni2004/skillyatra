const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const router = express.Router();

function getUserId(req) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "").trim();

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "skillyatra_secret_key"
    );

    return decoded.id || decoded._id || decoded.userId;
  } catch {
    return null;
  }
}

async function getProfile(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Please login again" });
    }

    const profile = await mongoose.connection.db.collection("profiles").findOne({
      userId: String(userId)
    });

    return res.json({
      ok: true,
      profile: profile || null
    });
  } catch (err) {
    return res.status(500).json({
      message: "Profile fetch failed",
      error: err.message
    });
  }
}

async function saveProfile(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Please login again" });
    }

    const profileData = {
      userId: String(userId),
      college: req.body.college || "",
      branch: req.body.branch || "",
      year: req.body.year || "",
      skillLevel: req.body.skillLevel || "",
      targetGoal: req.body.targetGoal || "",
      targetCompanies: req.body.targetCompanies || "",
      dailyStudyTime: req.body.dailyStudyTime || "",
      preferredLanguage: req.body.preferredLanguage || "",
      weakAreas: req.body.weakAreas || "",
      strongAreas: req.body.strongAreas || "",
      isProfileComplete: true,
      updatedAt: new Date()
    };

    await mongoose.connection.db.collection("profiles").updateOne(
      { userId: String(userId) },
      {
        $set: profileData,
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    try {
      await mongoose.connection.db.collection("users").updateOne(
        { _id: new mongoose.Types.ObjectId(String(userId)) },
        {
          $set: {
            isProfileComplete: true,
            profile: profileData,
            updatedAt: new Date()
          }
        }
      );
    } catch {
      await mongoose.connection.db.collection("users").updateOne(
        { _id: String(userId) },
        {
          $set: {
            isProfileComplete: true,
            profile: profileData,
            updatedAt: new Date()
          }
        }
      );
    }

    return res.json({
      ok: true,
      message: "Profile saved successfully",
      profile: profileData
    });
  } catch (err) {
    return res.status(500).json({
      message: "Profile save failed",
      error: err.message
    });
  }
}

router.get("/", getProfile);
router.post("/", saveProfile);
router.put("/", saveProfile);
router.patch("/", saveProfile);

router.get("/me", getProfile);
router.post("/save", saveProfile);
router.put("/save", saveProfile);
router.post("/setup", saveProfile);
router.put("/setup", saveProfile);
router.post("/complete", saveProfile);
router.put("/complete", saveProfile);

module.exports = router;
