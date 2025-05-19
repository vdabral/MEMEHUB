const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");

// GET /api/memes/tags/popular
router.get("/popular", tagController.getPopularTags);

module.exports = router;
