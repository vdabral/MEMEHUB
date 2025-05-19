const Tag = require("../models/Tag");
const Meme = require("../models/Meme");

// Get popular tags (by meme count)
const getPopularTags = async (req, res) => {
  try {
    // Aggregate tags by number of memes, descending
    const tags = await Tag.aggregate([
      { $project: { name: 1, memeCount: { $size: "$memes" } } },
      { $sort: { memeCount: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json(tags.map((t) => t.name));
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular tags", error });
  }
};

module.exports = { getPopularTags };
