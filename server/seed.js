const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      { username: 'john_doe', email: 'john@example.com', password: hashedPassword, fullName: 'John Doe', bio: 'Photographer and traveler.' },
      { username: 'jane_smith', email: 'jane@example.com', password: hashedPassword, fullName: 'Jane Smith', bio: 'Coffee lover.' },
      { username: 'pixel_master', email: 'pixel@example.com', password: hashedPassword, fullName: 'Pixel Master', bio: 'Digital artist.' }
    ]);

    // Create some posts
    const posts = await Post.create([
      { user: users[0]._id, imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=500', caption: 'Beautiful landscape!' },
      { user: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1682687221038-404670f09439?w=500', caption: 'Coffee time ☕' },
      { user: users[2]._id, imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', caption: 'My new setup.' }
    ]);

    // Add likes
    posts[0].likes.push(users[1]._id, users[2]._id);
    await posts[0].save();

    posts[1].likes.push(users[0]._id);
    await posts[1].save();

    // Add comments
    await Comment.create([
      { post: posts[0]._id, user: users[1]._id, text: 'Wow, stunning!' },
      { post: posts[1]._id, user: users[2]._id, text: 'Looks delicious.' }
    ]);
    posts[0].commentsCount = 1;
    await posts[0].save();
    posts[1].commentsCount = 1;
    await posts[1].save();

    // Add follows
    users[0].following.push(users[1]._id, users[2]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);
    await users[0].save();
    await users[1].save();
    await users[2].save();

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
