const User = require('../models/User');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers following', 'username avatarUrl fullName');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio } = req.body;
    let avatarUrl = req.user.avatarUrl;

    // Check if an image was uploaded
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, bio, avatarUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if already following
    if (req.user.following.includes(userToFollow.id)) {
      return res.status(400).json({ success: false, error: 'You are already following this user' });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: userToFollow.id }
    });

    // Add to followers list of the target user
    await User.findByIdAndUpdate(userToFollow.id, {
      $push: { followers: req.user.id }
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Unfollow user
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);

    if (!userToUnfollow) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove from following list
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: userToUnfollow.id }
    });

    // Remove from followers list of the target user
    await User.findByIdAndUpdate(userToUnfollow.id, {
      $pull: { followers: req.user.id }
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username fullName avatarUrl');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.followers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username fullName avatarUrl');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.following });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggested
// @access  Private
exports.getSuggestedUsers = async (req, res, next) => {
  try {
    // Basic recommendation: Users not currently followed by req.user, limited to 5
    const followingIds = req.user.following;
    followingIds.push(req.user.id); // Also exclude self

    const users = await User.aggregate([
      { $match: { _id: { $nin: followingIds } } },
      { $sample: { size: 5 } },
      { $project: { username: 1, fullName: 1, avatarUrl: 1 } }
    ]);

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
