
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Socially Backend API is running!",
  });
});

// Test database connection
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected",
  });
});

// Register API routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// Start server after MongoDB connects
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
