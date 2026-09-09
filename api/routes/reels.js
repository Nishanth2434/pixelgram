const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const reels = await Reel.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username avatarUrl')
            .populate({
                path: 'comments',
                populate: { path: 'userId', select: 'username avatarUrl' }
            });
        res.json(reels);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/like', auth, async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        if (reel.likes.includes(req.user._id)) {
            reel.likes.pull(req.user._id);
        } else {
            reel.likes.push(req.user._id);
        }
        await reel.save();
        res.json({ likes: reel.likes });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/comment', auth, async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        const newComment = new Comment({
            reelId: reel._id,
            userId: req.user._id,
            text: req.body.text
        });

        await newComment.save();
        reel.comments.push(newComment._id);
        await reel.save();

        await newComment.populate('userId', 'username avatarUrl');
        res.json(newComment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
