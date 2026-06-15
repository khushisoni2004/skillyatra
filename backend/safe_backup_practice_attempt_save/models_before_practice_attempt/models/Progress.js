const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "guest" },
    section: { type: String, default: "General" },
    itemType: { type: String, default: "Activity" },
    topic: { type: String, default: "General Activity" },
    status: { type: String, default: "saved" },
    score: { type: Number, default: 0 },
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    difficulty: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Progress || mongoose.model("Progress", progressSchema);
