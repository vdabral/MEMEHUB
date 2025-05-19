const Report = require("../models/Report");
const Meme = require("../models/Meme");

// Report a meme for moderation
const reportMeme = async (req, res) => {
  const { memeId, reason } = req.body;

  if (!memeId || !reason) {
    return res
      .status(400)
      .json({ message: "Meme ID and reason are required." });
  }

  try {
    const report = new Report({
      meme: memeId,
      user: req.user.id,
      reason,
    });

    await report.save();
    res.status(201).json({ message: "Meme reported successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error reporting meme.", error });
  }
};

// Get all reports for moderation review
const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("meme user");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports.", error });
  }
};

// Flag a meme as inappropriate
const flagMeme = async (req, res) => {
  const { memeId } = req.body;

  if (!memeId) {
    return res.status(400).json({ message: "Meme ID is required." });
  }

  try {
    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ message: "Meme not found." });
    }

    meme.isFlagged = true;
    await meme.save();
    res.status(200).json({ message: "Meme flagged successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error flagging meme.", error });
  }
};

// Resolve a report
const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Logic to resolve the report (e.g., delete the reported content)
    await report.remove();
    res.status(200).json({ message: "Report resolved successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resolving report.", error });
  }
};

module.exports = { flagMeme, reportMeme, getReports, resolveReport };
