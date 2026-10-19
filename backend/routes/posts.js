
const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");

const router = express.Router();

// GET: Fetch all posts for the feed
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name username profileImage")
      .populate("likes", "name username")
      .populate("comments.user", "name username profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts.",
    });
  }
});

// GET: Fetch posts by a particular user
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.userId,
    })
      .populate("user", "name username profileImage")
      .populate("likes", "name username")
      .populate("comments.user", "name username profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID or failed to fetch posts.",
    });
  }
});

// POST: Create a new post
router.post("/", async (req, res) => {
  try {
    const { userId, content, image } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "A valid user ID is required.",
      });
    }

    const userExists = await mongoose.model("User").exists({
      _id: userId,
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      (!content || !content.trim()) &&
      (!image || !image.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Write something or provide an image.",
      });
    }

    const post = await Post.create({
      user: userId,
      content: content || "",
      image: image || "",
    });

    await post.populate("user", "name username profileImage");

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create post.",
    });
  }
});

// PUT: Like or unlike a post
router.put("/:postId/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId } = req.params;

    if (
      !mongoose.isValidObjectId(postId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid post and user IDs are required.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? "Post unliked." : "Post liked.",
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update like.",
    });
  }
});

// POST: Add a comment to a post
router.post("/:postId/comments", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const { postId } = req.params;

    if (
      !mongoose.isValidObjectId(postId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid post and user IDs are required.",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    const userExists = await mongoose.model("User").exists({
      _id: userId,
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    post.comments.push({
      user: userId,
      text: text.trim(),
    });

    await post.save();

    await post.populate(
      "comments.user",
      "name username profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add comment.",
    });
  }
});

module.exports = router;
