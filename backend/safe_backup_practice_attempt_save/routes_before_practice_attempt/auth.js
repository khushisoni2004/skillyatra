const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "skillyatra_dev_secret_change_later";

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required."
      });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (existing) {
      return res.status(409).json({
        ok: false,
        message: "User already exists. Please login."
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: name || "",
      email: String(email).toLowerCase().trim(),
      passwordHash
    });

    const token = createToken(user);

    return res.status(201).json({
      ok: true,
      message: "Signup successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      ok: false,
      message: "Signup failed."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password."
      });
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password."
      });
    }

    const token = createToken(user);

    return res.json({
      ok: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      ok: false,
      message: "Login failed."
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Token missing."
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found."
      });
    }

    return res.json({
      ok: true,
      user
    });
  } catch {
    return res.status(401).json({
      ok: false,
      message: "Invalid token."
    });
  }
});

module.exports = router;
