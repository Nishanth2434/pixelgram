const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image' });
    }

    const newPost = await Post.create({
      user: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      caption: req.body.caption || ''
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get feed (posts from followed users + self)
// @route   GET /api/posts/feed
// @access  Private
exports.getFeed = async (req, res, next) => {
  try {
    const followingIds = req.user.following;
    followingIds.push(req.user.id);

    const posts = await Post.find({ user: { $in: followingIds } })
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get explore posts (all posts)
// @route   GET /api/posts/explore
// @access  Public
exports.getExplore = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get posts by a user
// @route   GET /api/posts/user/:username
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username avatarUrl');
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Make sure user owns post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authorized to delete this post' });
    }

    await post.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Post already liked' });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Post has not been liked' });
    }

    post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
