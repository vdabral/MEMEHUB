const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const memeController = require("../controllers/memeController");
const authMiddleware = require("../middleware/auth");
const { limiter } = require("../middleware/rateLimiter");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

// Create a new meme with file upload (rate limited)
router.post(
  "/",
  authMiddleware,
  limiter,
  memeController.createMeme
);

// Test endpoint for debugging file upload and form data
router.post(
  "/test-upload",
  authMiddleware,
  upload.single("image"),
  memeController.testMemeUpload
);

// Get all memes
router.get("/", memeController.getAllMemes);

// Search memes (must be before :id route)
router.get("/search", memeController.searchMemes);

// Get a specific meme by ID
router.get("/:id", memeController.getMemeById);

// Update a meme by ID (rate limited)
router.put("/:id", authMiddleware, limiter, memeController.updateMeme);

// Delete a meme by ID (rate limited)
router.delete("/:id", authMiddleware, limiter, memeController.deleteMeme);

// Upvote a meme (rate limited)
router.post("/:id/upvote", authMiddleware, limiter, memeController.upvoteMeme);

// Downvote a meme (rate limited)
router.post(
  "/:id/downvote",
  authMiddleware,
  limiter,
  memeController.downvoteMeme
);

// Remove a user's vote (upvote or downvote) from a meme (rate limited)
router.post(
  "/:id/remove-vote",
  authMiddleware,
  limiter,
  memeController.removeVote
);

// Comment on a meme (rate limited)
router.post(
  "/:id/comments",
  authMiddleware,
  limiter,
  memeController.commentOnMeme
);

// Get comments for a meme
router.get("/:id/comments", memeController.getCommentsForMeme);

// Tag a meme (rate limited)
router.post("/:id/tags", authMiddleware, limiter, memeController.tagMeme);

module.exports = router;
