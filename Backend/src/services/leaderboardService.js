const Meme = require('../models/Meme');
const User = require('../models/User');

const getLeaderboard = async (timeFrame) => {
    let startDate;
    const currentDate = new Date();

    switch (timeFrame) {
        case 'daily':
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
            break;
        case 'weekly':
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
            break;
        case 'allTime':
            startDate = new Date(0); // Beginning of time
            break;
        default:
            throw new Error('Invalid time frame');
    }

    const memes = await Meme.find({ createdAt: { $gte: startDate } })
        .sort({ netVotes: -1 })
        .limit(10)
        .populate('creator', 'username');

    return memes;
};

const getUserLeaderboard = async () => {
    const users = await User.find()
        .sort({ totalVotes: -1 })
        .limit(10);

    return users;
};

module.exports = {
    getLeaderboard,
    getUserLeaderboard,
};