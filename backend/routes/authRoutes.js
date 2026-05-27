const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/User");

// POST: /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, assigned_room, assigned_ward } =
      req.body;

    // Check agar user pehle se hai
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Password Encrypt (Hash) karna
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      assigned_room,
      assigned_ward,
    });

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// POST: /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Password match karna
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // JWT Token Generate karna
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        room: user.assigned_room,
        ward: user.assigned_ward,
      },
      process.env.JWT_SECRET || "pulsegrid_secret_123",
      { expiresIn: "1d" }, // Token 1 din tak valid rahega
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
