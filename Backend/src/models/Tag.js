const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    memes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme'
    }]
}, { timestamps: true });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;