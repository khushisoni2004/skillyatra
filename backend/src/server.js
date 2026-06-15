const practiceDbRoutes = require("./routes/practiceDbRoutes");
require("dotenv").config();

const express = require("express");
const practiceDatasetRoutes = require("./routes/practiceDatasetRoutes");











const path = require("path");
const profileRoutes = require("./routes/profileRoutes");
const cors = require("cors");
const connectDB = require("./utils/db");

const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const companyRoutes = require("./routes/companyRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const readinessRoutes = require("./routes/readinessRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const practiceGroupRoutes = require("./routes/practiceGroupRoutes");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());


// Practice MCQs real dataset route - must be before old practice route
app.use("/api/practice", practiceDatasetRoutes);
app.use("/practice", practiceDatasetRoutes);

app.use("/api/practice", practiceRoutes);

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "SkillYatra API running" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "SkillYatra backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/student/profile", profileRoutes);
app.use("/api/users/profile", profileRoutes);
app.use("/api/user/profile", profileRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/readiness-score", readinessRoutes);
app.use("/api/practice-group", practiceGroupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dsa", require("./routes/dsaFixedRoutes"));
app.use("/api/dsa", dsaRoutes);


// Practice MCQs dataset routes

app.use((req, res) => {
  res.status(404).json({ message: "API route not found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("Backend error:", err);
  res.status(500).json({
    message: "Backend server error",
    error: err.message
  });
});

async function startServer() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`SkillYatra backend running on ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start backend:", err.message);
    process.exit(1);
  }
}

startServer();












app.use("/api/practice-db", practiceDbRoutes);
