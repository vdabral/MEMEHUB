const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");

// POST /api/ai/test
// TEST endpoint for debugging route visibility
router.post("/test", (req, res) => {
  console.log("[AI ROUTE TEST] /api/ai/test hit! Body:", req.body);
  res.json({ message: "AI route test successful!", body: req.body });
});

// POST /api/ai/caption
router.post("/caption", async (req, res) => {
  console.log("[AI ROUTE LOG] /api/ai/caption hit! Body:", req.body);
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }
  try {
    const caption = await aiService.generateCaption(imageUrl);
    res.json({ caption });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to generate caption" });
  }
});

// POST /api/ai/tags
router.post("/tags", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }
  try {
    const tags = await aiService.generateTags(text);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate tags" });
  }
});

module.exports = router;
