// src/app.js

require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const memeRoutes = require("./routes/memes");
const userRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analytics");
const moderationRoutes = require("./routes/moderation");
const tagRoutes = require("./routes/tags");
const aiRoutes = require("./routes/ai");

// Load environment variables
dotenv.config();

const app = express();

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Add body parsers BEFORE routes that expect JSON bodies
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/memes", memeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/memes/tags", tagRoutes);
app.use("/api/ai", aiRoutes);

// Only use body parsers for non-file routes
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
});

// Global Error Handler
app.use(errorHandler);

// Export the Express app
module.exports = app;
