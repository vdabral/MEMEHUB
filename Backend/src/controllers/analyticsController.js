const Meme = require("../models/Meme");
const User = require("../models/User");

// Get analytics for a specific meme
const getMemeAnalytics = async (req, res) => {
  try {
    const memeId = req.params.id;
    const meme = await Meme.findById(memeId);

    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }

    const analytics = {
      views: meme.views,
      upvotes: meme.upvotes,
      downvotes: meme.downvotes,
      createdAt: meme.createdAt,
      engagementTrend: meme.engagementTrend || [], // Default to empty array if not present
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all meme analytics (optional, not used in routes)
const getAllMemeAnalytics = async (req, res) => {
  try {
    const memes = await Meme.find({});
    const analytics = memes.map((meme) => ({
      id: meme._id,
      title: meme.title,
      views: meme.views,
      upvotes: meme.upvotes,
      downvotes: meme.downvotes,
      createdAt: meme.createdAt,
    }));

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get overall performance metrics for a user
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const memes = await Meme.find({ creator: userId });

    let totalViews = 0,
      totalUpvotes = 0,
      totalDownvotes = 0;
    memes.forEach((meme) => {
      totalViews += meme.views || 0;
      totalUpvotes += meme.upvotes || 0;
      totalDownvotes += meme.downvotes || 0;
    });

    res.status(200).json({
      memeCount: memes.length,
      totalViews,
      totalUpvotes,
      totalDownvotes,
      memes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get trending memes (e.g., most upvoted in last 24h)
const getTrendingMemes = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
    const trending = await Meme.find({ createdAt: { $gte: since } })
      .sort({ upvotes: -1 })
      .limit(20);

    res.status(200).json(trending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMemeAnalytics,
  getAllMemeAnalytics,
  getUserAnalytics,
  getTrendingMemes,
};
