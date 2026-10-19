
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// GET: Get all users (without passwords)
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
});

// GET: Get one user profile by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }
});

// PUT: Update a user profile
router.put("/:id", async (req, res) => {
  try {
    const { name, username, bio, profileImage, password } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (username !== undefined) {
      updates.username = username.trim().toLowerCase();
    }
    if (bio !== undefined) updates.bio = bio.trim();
    if (profileImage !== undefined) updates.profileImage = profileImage;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    const duplicate = error.code === 11000;

    res.status(duplicate ? 409 : 400).json({
      success: false,
      message: duplicate
        ? "Username is already taken."
        : "Failed to update profile.",
    });
  }
});

module.exports = router;
