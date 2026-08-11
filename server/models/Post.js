const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image']
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot be more than 500 characters'],
    default: ''
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);
