const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    process.env.JWT_SECRET || "skillyatra_secret_key",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const users = mongoose.connection.db.collection("users");

    const existingUser = await users.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);

    const user = {
      _id: result.insertedId,
      name,
      email: email.toLowerCase()
    };

    const token = createToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user
    });
  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
});

router.post("/signup", async (req, res) => {
  req.url = "/register";
  router.handle(req, res);
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const users = mongoose.connection.db.collection("users");

    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    const token = createToken(safeUser);

    res.json({
      message: "Login successful",
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "skillyatra_secret_key");

    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
