const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get feed (posts from following + self)
router.get('/feed', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const followingIds = user.following;
        followingIds.push(user._id);

        const posts = await Post.find({ userId: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .populate('userId', 'username avatarUrl')
            .populate({
                path: 'comments',
                populate: { path: 'userId', select: 'username avatarUrl' }
            });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user posts
router.get('/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const posts = await Post.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .populate('userId', 'username avatarUrl');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create post
router.post('/', auth, async (req, res) => {
    try {
        const newPost = new Post({
            userId: req.user._id,
            imageUrl: req.body.imageUrl,
            caption: req.body.caption
        });
        const post = await newPost.save();
        await post.populate('userId', 'username avatarUrl');
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(req.user._id)) {
            post.likes.pull(req.user._id);
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = new Comment({
            postId: post._id,
            userId: req.user._id,
            text: req.body.text
        });

        await newComment.save();
        post.comments.push(newComment._id);
        await post.save();

        await newComment.populate('userId', 'username avatarUrl');
        res.json(newComment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete own post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await post.deleteOne();
        await Comment.deleteMany({ postId: req.params.id });
        res.json({ message: 'Post removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete own comment
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const post = await Post.findById(req.params.postId);
        post.comments.pull(comment._id);
        await post.save();
        await comment.deleteOne();

        res.json({ message: 'Comment removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
