const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Resource = require("../models/Resource");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "resources");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, TXT, DOC, DOCX files are allowed"));
  }
});

router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, resources });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to load resources" });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "Other").trim();
    const type = String(req.body.type || "Link").trim();
    const url = String(req.body.url || "").trim();
    const description = String(req.body.description || "").trim();

    if (!title) {
      return res.status(400).json({ ok: false, message: "Title is required" });
    }

    if (!url && !req.file) {
      return res.status(400).json({ ok: false, message: "Add link or upload PDF/TXT file" });
    }

    const item = await Resource.create({
      title,
      category,
      type,
      url,
      description,
      fileName: req.file ? req.file.originalname : "",
      fileUrl: req.file ? `/uploads/resources/${req.file.filename}` : ""
    });

    res.json({ ok: true, resource: item });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || "Failed to save resource" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Resource.findByIdAndDelete(req.params.id);

    if (item && item.fileUrl) {
      const localPath = path.join(__dirname, "..", "..", item.fileUrl);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch {}
      }
    }

    res.json({ ok: true, deleted: req.params.id });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to delete resource" });
  }
});

module.exports = router;
