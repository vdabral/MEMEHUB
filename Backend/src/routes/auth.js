const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// Registration route
router.post("/register", authController.register);

// Login route with rate limiter
router.post("/login", authLimiter, authController.login);

// Get user profile (protected route)
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
