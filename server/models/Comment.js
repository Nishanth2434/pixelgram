const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add comment text'],
    maxlength: [200, 'Comment cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
