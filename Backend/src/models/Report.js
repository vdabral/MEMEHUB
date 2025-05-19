const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportedContentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Meme' // or 'Comment' based on what is being reported
    },
    reason: {
        type: String,
        required: true,
        enum: ['Inappropriate', 'Spam', 'Harassment', 'Other']
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);