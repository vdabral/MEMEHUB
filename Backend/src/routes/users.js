const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const { limiter } = require("../middleware/rateLimiter");

// Get logged-in user's memes
router.get("/me/memes", authMiddleware, userController.getUserMemes);
// Get logged-in user's stats
router.get("/me/stats", authMiddleware, userController.getUserStats);

// Get user profile
router.get("/profile", authMiddleware, userController.getUserProfile);

// Update user profile (rate limited)
router.put(
  "/profile",
  authMiddleware,
  limiter,
  userController.updateUserProfile
);

// Save a meme
router.post("/me/saved/:id", authMiddleware, userController.saveMeme);
// Unsave a meme
router.delete("/me/saved/:id", authMiddleware, userController.unsaveMeme);
// Get saved memes
router.get("/me/saved", authMiddleware, userController.getSavedMemes);

// Get user's memes
router.get("/:userId/memes", authMiddleware, userController.getUserMemes);

// Public profile
router.get("/:userId", userController.getPublicProfile);

// Follow/unfollow (rate limited)
router.post(
  "/:userId/follow",
  authMiddleware,
  limiter,
  userController.followUser
);
router.post(
  "/:userId/unfollow",
  authMiddleware,
  limiter,
  userController.unfollowUser
);

// Public user's memes
router.get("/:userId/memes/public", userController.getUserMemesPublic);

// Popular creators
router.get("/popular/creators", userController.getPopularCreators);

// (Optional) Remove or implement getUserStats if needed
// router.get('/:userId/stats', userController.getUserStats);

module.exports = router;
