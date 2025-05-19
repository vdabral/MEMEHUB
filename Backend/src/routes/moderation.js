const express = require("express");
const router = express.Router();
const moderationController = require("../controllers/moderationController");
const authMiddleware = require("../middleware/auth");

// Route to report a meme
router.post("/report", authMiddleware, moderationController.reportMeme);

// Route to get reported memes for moderation review
router.get("/reports", authMiddleware, moderationController.getReports);

// Route to resolve a report (approve or reject)
router.post(
  "/resolve/:reportId",
  authMiddleware,
  moderationController.resolveReport
);

module.exports = router;
