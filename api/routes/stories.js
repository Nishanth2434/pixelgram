const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get active stories from following
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const followingIds = user.following;
        followingIds.push(user._id);

        const activeStories = await Story.find({
            userId: { $in: followingIds },
            expiresAt: { $gt: new Date() }
        }).populate('userId', 'username avatarUrl').sort({ createdAt: -1 });

        // Group stories by user
        const grouped = activeStories.reduce((acc, story) => {
            const uid = story.userId._id.toString();
            if (!acc[uid]) {
                acc[uid] = {
                    user: story.userId,
                    stories: []
                };
            }
            acc[uid].stories.push(story);
            return acc;
        }, {});

        res.json(Object.values(grouped));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const newStory = new Story({
            userId: req.user._id,
            mediaUrl: req.body.mediaUrl,
            expiresAt
        });

        await newStory.save();
        res.json(newStory);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
