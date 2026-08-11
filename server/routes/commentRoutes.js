const express = require('express');
const {
  addComment,
  getComments,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Using mergeParams to access :id from postRoutes if we want to nest, 
// but since we are registering this on /api/posts/:id/comments, we can just use router({mergeParams: true})
const router = express.Router({ mergeParams: true });

router.post('/', protect, addComment);
router.get('/', getComments);
router.delete('/:id', protect, deleteComment);
// or we just define it here if we mount at /api/comments
// The prompt specifies: DELETE /api/comments/:id, but GET/POST /api/posts/:id/comments

module.exports = router;
