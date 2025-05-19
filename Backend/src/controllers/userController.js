const User = require("../models/User");
const Meme = require("../models/Meme"); // Add this import for getUserMemes

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get memes created by the user
const getUserMemes = async (req, res) => {
  try {
    const userId = req.user.id;
    // Populate creator info for each meme
    const memes = await Meme.find({ creator: userId }).populate(
      "creator",
      "username avatar"
    );
    res.status(200).json(memes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get stats for the logged-in user
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const memes = await Meme.find({ creator: userId });
    const totalMemes = memes.length;
    const totalViews = memes.reduce((sum, m) => sum + (m.views || 0), 0);
    const totalVotes = memes.reduce((sum, m) => sum + (m.votes || 0), 0);
    const averageVotes = totalMemes > 0 ? totalVotes / totalMemes : 0;
    // Simulate badges and recentActivity for now
    const badges = [
      {
        id: "1",
        name: "Starter",
        description: "First meme posted!",
        icon: "🌟",
        earnedAt: "2024-01-01",
      },
      {
        id: "2",
        name: "Popular",
        description: "100+ upvotes!",
        icon: "🔥",
        earnedAt: "2024-02-01",
      },
    ];
    const recentActivity = {
      dates: memes.map((m) => m.createdAt),
      views: memes.map((m) => m.views || 0),
      votes: memes.map((m) => m.votes || 0),
    };
    res.status(200).json({
      totalMemes,
      totalViews,
      totalVotes,
      averageVotes,
      badges,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get public user profile
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.userId;
    if (userId === targetId)
      return res.status(400).json({ message: "Cannot follow yourself" });
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target)
      return res.status(404).json({ message: "User not found" });
    if (user.following.includes(targetId))
      return res.status(400).json({ message: "Already following" });
    user.following.push(targetId);
    target.followers.push(userId);
    await user.save();
    await target.save();
    res.status(200).json({ message: "Followed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.userId;
    if (userId === targetId)
      return res.status(400).json({ message: "Cannot unfollow yourself" });
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target)
      return res.status(404).json({ message: "User not found" });
    user.following = user.following.filter((id) => id.toString() !== targetId);
    target.followers = target.followers.filter(
      (id) => id.toString() !== userId
    );
    await user.save();
    await target.save();
    res.status(200).json({ message: "Unfollowed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's memes (public)
const getUserMemesPublic = async (req, res) => {
  try {
    // Populate creator info for each meme
    const memes = await Meme.find({ creator: req.params.userId }).populate(
      "creator",
      "username avatar"
    );
    res.status(200).json(memes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get popular creators (by followers count)
const getPopularCreators = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ followers: -1 })
      .limit(10)
      .select("username avatar followers");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save a meme
const saveMeme = async (req, res) => {
  try {
    const userId = req.user.id;
    const memeId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.savedMemes.includes(memeId)) {
      user.savedMemes.push(memeId);
      await user.save();
    }
    res.status(200).json({ message: "Meme saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Unsave a meme
const unsaveMeme = async (req, res) => {
  try {
    const userId = req.user.id;
    const memeId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.savedMemes = user.savedMemes.filter((id) => id.toString() !== memeId);
    await user.save();
    res.status(200).json({ message: "Meme unsaved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get saved memes for the logged-in user
const getSavedMemes = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "savedMemes",
      populate: { path: "creator", select: "username avatar" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.savedMemes || []);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserMemes,
  getUserStats,
  getPublicProfile,
  followUser,
  unfollowUser,
  getUserMemesPublic,
  getPopularCreators,
  saveMeme,
  unsaveMeme,
  getSavedMemes,
};
