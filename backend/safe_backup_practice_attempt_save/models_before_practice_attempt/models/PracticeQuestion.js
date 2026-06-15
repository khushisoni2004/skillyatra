const mongoose = require("mongoose");

const practiceQuestionSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "practicequestions" }
);

module.exports =
  mongoose.models.PracticeQuestion ||
  mongoose.model("PracticeQuestion", practiceQuestionSchema);
