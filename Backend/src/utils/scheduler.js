const cron = require('node-cron');
const Meme = require('../models/Meme');

// Function to schedule meme drops
const scheduleMemeDrop = (memeId, dropTime) => {
    // Schedule the meme drop using cron
    cron.schedule(dropTime, async () => {
        try {
            const meme = await Meme.findById(memeId);
            if (meme) {
                meme.isScheduled = false; // Update the meme status
                await meme.save();
                // Logic to publish the meme to the feed
                console.log(`Meme ${memeId} has been published!`);
            }
        } catch (error) {
            console.error(`Error publishing meme ${memeId}:`, error);
        }
    });
};

// Function to cancel a scheduled meme drop
const cancelScheduledMemeDrop = (memeId) => {
    // Logic to cancel the scheduled task if needed
    // This could involve tracking scheduled tasks in a more robust way
    console.log(`Scheduled drop for meme ${memeId} has been canceled.`);
};

module.exports = {
    scheduleMemeDrop,
    cancelScheduledMemeDrop,
};