const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res
        .status(403)
        .json({ message: "Account deactivated. Contact admin." });

    res.json({
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/signup — surveyor self-registration only
router.post("/signup", async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName)
      return res
        .status(400)
        .json({ message: "Full name, username and password are required" });

    if (username.length < 3)
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters" });

    if (!/^[a-z0-9_]+$/.test(username.toLowerCase()))
      return res
        .status(400)
        .json({
          message: "Username can only contain letters, numbers and underscores",
        });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists)
      return res
        .status(409)
        .json({ message: "Username already taken, please choose another" });

    const user = await User.create({
      username: username.toLowerCase(),
      password,
      fullName,
      role: "surveyor",
      isActive: true,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({
    user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
  });
});

module.exports = router;
