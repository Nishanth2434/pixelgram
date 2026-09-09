const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const randomFaces = [
            '1534528741775-53994a69daeb', '1506794778202-cad84cf45f1d',
            '1531427186611-ecfd6d936c79', '1494790108377-be9c29b29330',
            '1527980965255-d3b416303d12'
        ];
        const randomId = randomFaces[Math.floor(Math.random() * randomFaces.length)];

        user = new User({
            username,
            email,
            passwordHash,
            avatarUrl: `https://images.unsplash.com/photo-${randomId}?w=150&h=150&fit=crop`
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
        res.json({ token, user: { _id: user._id, username: user.username, avatarUrl: user.avatarUrl } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
        res.json({ token, user: { _id: user._id, username: user.username, avatarUrl: user.avatarUrl } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        res.json(req.user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
