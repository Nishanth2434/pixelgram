const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user.id,
      text: req.body.text
    });

    // Increment commentsCount in Post
    post.commentsCount += 1;
    await post.save();

    await comment.populate('user', 'username avatarUrl');

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Make sure user owns comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authorized to delete this comment' });
    }

    const postId = comment.post;
    await comment.deleteOne();

    // Decrement commentsCount in Post
    const post = await Post.findById(postId);
    if (post) {
      post.commentsCount -= 1;
      await post.save();
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
