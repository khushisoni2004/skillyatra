const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "Other",
      trim: true
    },
    type: {
      type: String,
      default: "Link",
      trim: true
    },
    url: {
      type: String,
      default: "",
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    fileName: {
      type: String,
      default: ""
    },
    fileUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
