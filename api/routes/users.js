const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-passwordHash')
            .populate('followers', 'username avatarUrl')
            .populate('following', 'username avatarUrl');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/follow', auth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (targetUser._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        if (targetUser.followers.includes(currentUser._id)) {
            // Unfollow
            targetUser.followers.pull(currentUser._id);
            currentUser.following.pull(targetUser._id);
        } else {
            // Follow
            targetUser.followers.push(currentUser._id);
            currentUser.following.push(targetUser._id);
        }

        await targetUser.save();
        await currentUser.save();
        res.json({ followersCount: targetUser.followers.length, followingCount: currentUser.following.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/profile/edit', auth, async (req, res) => {
    try {
        const { bio, avatarUrl } = req.body;
        req.user.bio = bio !== undefined ? bio : req.user.bio;
        req.user.avatarUrl = avatarUrl !== undefined ? avatarUrl : req.user.avatarUrl;
        await req.user.save();
        res.json(req.user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
