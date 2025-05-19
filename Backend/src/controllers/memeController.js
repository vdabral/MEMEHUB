const Meme = require("../models/Meme");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "default_cloud_name",
  api_key: process.env.CLOUDINARY_API_KEY || "default_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "default_api_secret",
});

// Create a new meme
const createMeme = async (req, res) => {
  try {
    // Debug: log req.body and req.file
    console.log("[MEME CREATE] req.body:", req.body);
    console.log("[MEME CREATE] req.file:", req.file);
    if (req.headers) {
      console.log(
        "[MEME CREATE] req.headers content-type:",
        req.headers["content-type"]
      );
    }
    if (req.files) {
      console.log("[MEME CREATE] req.files:", req.files);
    }
    if (req.user) {
      console.log("[MEME CREATE] req.user:", req.user);
    }

    // Support both req.file and req.files (multer single/array)
    let file = req.file;
    if (
      !file &&
      req.files &&
      Array.isArray(req.files) &&
      req.files.length > 0
    ) {
      file = req.files[0];
    }

    // Access fields safely
    const title = req.body && req.body.title ? req.body.title : undefined;
    let tags = req.body && req.body.tags ? req.body.tags : undefined;
    let textOverlays =
      req.body && req.body.textOverlays ? req.body.textOverlays : undefined;

    // Parse tags/textOverlays if needed
    try {
      if (typeof tags === "string") tags = JSON.parse(tags);
    } catch (e) {
      console.error("[MEME CREATE] Failed to parse tags:", tags, e);
      tags = [];
    }
    if (!Array.isArray(tags)) tags = [];
    try {
      if (typeof textOverlays === "string")
        textOverlays = JSON.parse(textOverlays);
    } catch (e) {
      console.error(
        "[MEME CREATE] Failed to parse textOverlays:",
        textOverlays,
        e
      );
      textOverlays = [];
    }
    if (!Array.isArray(textOverlays)) textOverlays = [];

    // Validate required fields
    if (!file || !title) {
      console.error("[MEME CREATE] Missing required fields:", {
        hasFile: !!file,
        title,
      });
      return res.status(400).json({
        message: "Image and title are required.",
        code: "MEME_MISSING_REQUIRED_FIELDS",
        debug: {
          hasFile: !!file,
          title,
          reqBody: req.body,
          reqFile: file,
        },
      });
    }

    try {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "memes",
        resource_type: "auto",
        transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
      });

      // Clean up the temporary file after successful upload
      await fs.unlink(file.path);

      // Create the meme in database
      const meme = new Meme({
        image: result.secure_url,
        cloudinaryId: result.public_id,
        title: title.trim(),
        creator: req.user.id,
        tags,
        textOverlays,
      });

      // Save the meme
      await meme.save();

      // --- Tag upsert logic ---
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          if (typeof tagName !== "string" || !tagName.trim()) continue;
          await Tag.findOneAndUpdate(
            { name: tagName.trim() },
            { $addToSet: { memes: meme._id } },
            { upsert: true, new: true }
          );
        }
      }
      // --- End tag upsert logic ---

      // Update user's meme count
      await User.findByIdAndUpdate(req.user.id, { $inc: { memesCreated: 1 } });

      // Return created meme with id instead of _id
      const memeObj = meme.toObject();
      memeObj.id = memeObj._id;
      delete memeObj._id;
      // Defensive: also ensure comments is always an array
      if (!Array.isArray(memeObj.comments)) memeObj.comments = [];
      res.status(201).json(memeObj);
    } catch (uploadError) {
      // Clean up temp file if upload fails
      if (file && file.path) {
        await fs.unlink(file.path).catch(console.error);
      }
      console.error(
        "[MEME CREATE] Cloudinary upload or DB error:",
        uploadError
      );
      return res.status(500).json({
        message: "Error uploading image or saving meme.",
        code: "MEME_UPLOAD_OR_SAVE_ERROR",
        error: uploadError.message,
        stack: uploadError.stack,
        debug: {
          file,
          title,
          tags,
          textOverlays,
          reqBody: req.body,
        },
      });
    }
  } catch (error) {
    // Clean up temp file if possible
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        if (f && f.path) await fs.unlink(f.path).catch(() => {});
      }
    }
    console.error("[MEME CREATE] General error:", error);
    res.status(500).json({
      message: "Error creating meme",
      code: "MEME_CREATE_ERROR",
      error: error.message,
      stack: error.stack,
      debug: {
        reqBody: req.body,
        reqFile: req.file,
        reqFiles: req.files,
      },
    });
  }
};

// Get all memes with filtering and pagination
const getAllMemes = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "recent", filter, tag, q } = req.query;

    let query = {};

    // Tag filter (fixed logic)
    if (tag) {
      query.tags = { $in: [tag] };
    } else if (filter && filter !== "all") {
      query.tags = { $in: [filter] };
    }

    // Search by caption/title or tags
    if (q && q.trim() !== "") {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Build sort options
    const sortOptions = {
      recent: { createdAt: -1 },
      popular: { votes: -1 },
      trending: { views: -1 },
    };

    const memes = await Meme.find(query)
      .populate("creator", "username avatar")
      .sort(sortOptions[sort] || sortOptions.recent)
      .skip(skip)
      .limit(Number(limit));

    const total = await Meme.countDocuments(query);

    res.status(200).json({
      memes,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      hasMore: skip + memes.length < total,
    });
  } catch (error) {
    console.error("Error fetching memes:", error);
    res.status(500).json({
      message: "Error fetching memes",
      code: "MEME_FETCH_ERROR",
      error: error.message,
    });
  }
};

// Get a single meme by ID
const getMemeById = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id)
      .populate("creator", "username avatar")
      .populate({
        path: "comments",
        populate: { path: "creator", select: "username avatar" },
      });

    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
        code: "MEME_NOT_FOUND",
      });
    }

    // Increment view count
    meme.views = (meme.views || 0) + 1;
    await meme.save();

    res.status(200).json(meme);
  } catch (error) {
    console.error("Error fetching meme:", error);
    res.status(500).json({
      message: "Error fetching meme",
      code: "MEME_FETCH_ERROR",
      error: error.message,
    });
  }
};

// Update a meme by ID
const updateMeme = async (req, res) => {
  try {
    const { title, tags, textOverlays } = req.body;
    const memeId = req.params.id;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
        code: "MEME_NOT_FOUND",
      });
    }

    // Check ownership
    if (meme.creator.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this meme",
        code: "MEME_UPDATE_UNAUTHORIZED",
      });
    }

    // Update meme fields
    if (title) meme.title = title.trim();
    if (tags) meme.tags = tags;
    if (textOverlays) meme.textOverlays = textOverlays;

    await meme.save();
    res.status(200).json(meme);
  } catch (error) {
    console.error("Error updating meme:", error);
    res.status(500).json({
      message: "Error updating meme",
      code: "MEME_UPDATE_ERROR",
      error: error.message,
    });
  }
};

// Delete a meme
const deleteMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);

    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
        code: "MEME_NOT_FOUND",
      });
    }

    // Check ownership
    if (meme.creator.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this meme",
        code: "MEME_DELETE_UNAUTHORIZED",
      });
    }

    // Delete image from Cloudinary if exists
    if (meme.cloudinaryId) {
      await cloudinary.uploader.destroy(meme.cloudinaryId);
    }

    // Delete meme from database
    await meme.deleteOne();

    // Update user's meme count
    await User.findByIdAndUpdate(req.user.id, { $inc: { memesCreated: -1 } });

    res.status(200).json({
      message: "Meme deleted successfully",
      code: "MEME_DELETED",
    });
  } catch (error) {
    console.error("Error deleting meme:", error);
    res.status(500).json({
      message: "Error deleting meme",
      code: "MEME_DELETE_ERROR",
      error: error.message,
    });
  }
};

// Upvote a meme
const upvoteMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res
        .status(404)
        .json({ message: "Meme not found", code: "MEME_NOT_FOUND" });
    }
    const userId = req.user.id;

    // Remove from downvotedBy if present
    meme.downvotedBy = meme.downvotedBy.filter(
      (id) => id.toString() !== userId
    );

    // Add to upvotedBy if not present
    if (!meme.upvotedBy.map((id) => id.toString()).includes(userId)) {
      meme.upvotedBy.push(userId);
    }

    meme.upvotes = meme.upvotedBy.length;
    meme.downvotes = meme.downvotedBy.length;
    await meme.save();

    res.status(200).json({
      upvotes: meme.upvotes,
      downvotes: meme.downvotes,
      upvotedBy: meme.upvotedBy,
      downvotedBy: meme.downvotedBy,
    });
  } catch (error) {
    console.error("Error upvoting meme:", error);
    res.status(500).json({
      message: "Error upvoting meme",
      code: "MEME_UPVOTE_ERROR",
      error: error.message,
    });
  }
};

// Downvote a meme
const downvoteMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res
        .status(404)
        .json({ message: "Meme not found", code: "MEME_NOT_FOUND" });
    }
    const userId = req.user.id;

    // Remove from upvotedBy if present
    meme.upvotedBy = meme.upvotedBy.filter((id) => id.toString() !== userId);

    // Add to downvotedBy if not present
    if (!meme.downvotedBy.map((id) => id.toString()).includes(userId)) {
      meme.downvotedBy.push(userId);
    }

    meme.upvotes = meme.upvotedBy.length;
    meme.downvotes = meme.downvotedBy.length;
    await meme.save();

    res.status(200).json({
      upvotes: meme.upvotes,
      downvotes: meme.downvotes,
      upvotedBy: meme.upvotedBy,
      downvotedBy: meme.downvotedBy,
    });
  } catch (error) {
    console.error("Error downvoting meme:", error);
    res.status(500).json({
      message: "Error downvoting meme",
      code: "MEME_DOWNVOTE_ERROR",
      error: error.message,
    });
  }
};

// Comment on a meme
const commentOnMeme = async (req, res) => {
  try {
    const { content } = req.body;
    const memeId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
        code: "COMMENT_MISSING_CONTENT",
      });
    }

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
        code: "MEME_NOT_FOUND",
      });
    }

    const comment = new Comment({
      content: content.trim(),
      meme: memeId,
      creator: req.user.id,
    });

    await comment.save();

    // Add comment to meme's comments array
    meme.comments.push(comment._id);
    await meme.save();

    // Populate creator info before sending response
    await comment.populate("creator", "username avatar");

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Error creating comment",
      code: "COMMENT_CREATE_ERROR",
      error: error.message,
    });
  }
};

// Get comments for a meme
const getCommentsForMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id).populate({
      path: "comments",
      populate: {
        path: "creator",
        select: "username avatar",
      },
    });

    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
        code: "MEME_NOT_FOUND",
      });
    }

    res.status(200).json(meme.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      message: "Error fetching comments",
      code: "COMMENTS_FETCH_ERROR",
      error: error.message,
    });
  }
};

// Tag a meme
const tagMeme = async (req, res) => {
  try {
    const { tags } = req.body;
    const memeId = req.params.id;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        message: "Tags must be an array",
        code: "TAGS_INVALID_FORMAT",
      });
    }

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
        code: "MEME_NOT_FOUND",
      });
    }

    // Update meme tags
    meme.tags = [
      ...new Set([
        ...meme.tags,
        ...tags.map((tag) => tag.trim().toLowerCase()),
      ]),
    ];
    await meme.save();

    res.status(200).json(meme);
  } catch (error) {
    console.error("Error tagging meme:", error);
    res.status(500).json({
      message: "Error tagging meme",
      code: "MEME_TAG_ERROR",
      error: error.message,
    });
  }
};

// Test endpoint to echo back received form data for debugging
const testMemeUpload = async (req, res) => {
  try {
    console.log("[TEST UPLOAD] req.body:", req.body);
    console.log("[TEST UPLOAD] req.file:", req.file);
    console.log("[TEST UPLOAD] req.files:", req.files);
    res.status(200).json({
      message: "Received form data successfully.",
      body: req.body,
      file: req.file,
      files: req.files,
      headers: req.headers,
    });
  } catch (error) {
    console.error("[TEST UPLOAD] Error:", error);
    res.status(500).json({
      message: "Error in test upload endpoint.",
      error: error.message,
      stack: error.stack,
    });
  }
};

const searchMemes = async (req, res) => {
  try {
    const { q } = req.query;
    const memes = await Meme.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $elemMatch: { $regex: q, $options: "i" } } },
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
  commentOnMeme,
  getCommentsForMeme,
  tagMeme,
  testMemeUpload,
  searchMemes,
};
