const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const moderationController = require("../controllers/moderationController");
const authMiddleware = require("../middleware/auth");

// Route to get performance analytics for a specific meme
router.get("/meme/:id", analyticsController.getMemeAnalytics);

// Route to get overall performance metrics for a user
router.get("/user/:userId", analyticsController.getUserAnalytics);

// Route to get trending memes based on performance
router.get("/trending", analyticsController.getTrendingMemes);

module.exports = router;
