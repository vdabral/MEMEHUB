const Meme = require("../models/Meme");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");

// Create a new meme
const createMeme = async (memeData) => {
  const meme = new Meme(memeData);
  return await meme.save();
};

// Get all memes with pagination
const getAllMemes = async (page = 1, limit = 10) => {
  return await Meme.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Get a meme by ID
const getMemeById = async (memeId) => {
  return await Meme.findById(memeId);
};

// Update a meme
const updateMeme = async (memeId, updateData) => {
  return await Meme.findByIdAndUpdate(memeId, updateData, { new: true });
};

// Delete a meme
const deleteMeme = async (memeId) => {
  return await Meme.findByIdAndDelete(memeId);
};

// Upvote a meme
const upvoteMeme = async (memeId) => {
  return await Meme.findByIdAndUpdate(
    memeId,
    { $inc: { upvotes: 1 } },
    { new: true }
  );
};

// Downvote a meme
const downvoteMeme = async (memeId) => {
  return await Meme.findByIdAndUpdate(
    memeId,
    { $inc: { downvotes: 1 } },
    { new: true }
  );
};

// Add a comment to a meme
const addCommentToMeme = async (memeId, commentData) => {
  const comment = new Comment(commentData);
  await comment.save();
  return await Meme.findByIdAndUpdate(
    memeId,
    { $push: { comments: comment._id } },
    { new: true }
  );
};

// Get meme performance analytics
const getMemeAnalytics = async (memeId) => {
  const meme = await Meme.findById(memeId);
  return {
    views: meme.views,
    upvotes: meme.upvotes,
    downvotes: meme.downvotes,
    createdAt: meme.createdAt,
  };
};
const searchMemes = async (req, res) => {
  try {
    const { q } = req.query;
    const memes = await Meme.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    });
    res.json({ memes });
  } catch (error) {
    console.error("Error searching memes:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createMeme,
  getAllMemes,
  getMemeById,
  updateMeme,
  deleteMeme,
  upvoteMeme,
  downvoteMeme,
  addCommentToMeme,
  getMemeAnalytics,
  searchMemes,
};
