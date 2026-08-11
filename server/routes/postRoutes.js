const express = require('express');
const {
  createPost,
  getFeed,
  getExplore,
  getUserPosts,
  getPost,
  deletePost,
  likePost,
  unlikePost
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), createPost);
router.get('/feed', protect, getFeed);
router.get('/explore', getExplore);
router.get('/user/:username', getUserPosts);
router.get('/:id', getPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);

module.exports = router;
