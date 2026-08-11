const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Load env vars
dotenv.config({ path: require('path').resolve(__dirname, '.env') });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const FALLBACK_VIDEOS = [
  'https://cdn.pixabay.com/video/2023/09/05/179935-860459026_small.mp4',
  'https://cdn.pixabay.com/video/2022/08/12/127416-739538448_small.mp4',
  'https://cdn.pixabay.com/video/2021/05/28/76957-556558236_small.mp4',
  'https://cdn.pixabay.com/video/2020/05/11/38883-421711206_small.mp4'
];

const CAPTIONS = ["Golden hour 🌅", "Weekend vibes", "New beginnings", "Living my best life ✨", "Nature's beauty 🌿", "Chasing sunsets", "Coffee time ☕", "Just me doing me."];
const COMMENTS_TEXT = ["Love this! 😍", "Amazing shot", "Where is this?", "So cool!", "Beautiful!", "Absolutely stunning.", "Great vibes 🔥"];

const importData = async () => {
  try {
    const isReset = process.argv.includes('--reset');
    
    if (isReset) {
      await User.deleteMany();
      await Post.deleteMany();
      await Comment.deleteMany();
      console.log('Database cleared.');
    } else {
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        console.log('Database already has users. Run with --reset to clear and re-seed.');
        process.exit();
      }
    }

    // 1. Fetch Users
    console.log('Fetching users from RandomUser API...');
    const userRes = await fetch('https://randomuser.me/api/?results=6');
    const userData = await userRes.json();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const userDocs = userData.results.map(u => ({
      username: u.login.username,
      email: u.email,
      password: hashedPassword,
      fullName: `${u.name.first} ${u.name.last}`,
      bio: "Living my best life ✨",
      // We can use their large photo, or dicebear. Let's use dicebear for fun illustrated avatars
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.login.username}`
    }));

    const createdUsers = await User.insertMany(userDocs);
    console.log(`Created ${createdUsers.length} users.`);

    // 2. Fetch Videos
    let videoUrls = [...FALLBACK_VIDEOS];
    if (process.env.PIXABAY_API_KEY) {
      console.log('Fetching videos from Pixabay API...');
      try {
        const pixRes = await fetch(`https://pixabay.com/api/videos/?key=${process.env.PIXABAY_API_KEY}&q=nature&per_page=5`);
        const pixData = await pixRes.json();
        if (pixData.hits && pixData.hits.length > 0) {
          videoUrls = pixData.hits.map(hit => hit.videos.small.url || hit.videos.medium.url);
        }
      } catch (err) {
        console.log('Failed to fetch from Pixabay, using fallback videos.');
      }
    }

    // 3. Create Posts
    const postsToInsert = [];
    let videoIndex = 0;

    for (const user of createdUsers) {
      // 3-4 image posts
      const numImagePosts = Math.floor(Math.random() * 2) + 3; // 3 or 4
      for (let i = 0; i < numImagePosts; i++) {
        postsToInsert.push({
          user: user._id,
          mediaUrl: `https://picsum.photos/seed/${user.username}${i}/600/600`,
          mediaType: 'image',
          caption: CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)]
        });
      }

      // 1 video post per user (if we have enough videos, just cycle through them)
      postsToInsert.push({
        user: user._id,
        mediaUrl: videoUrls[videoIndex % videoUrls.length],
        mediaType: 'video',
        caption: CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)] + " 🎥"
      });
      videoIndex++;
    }

    const createdPosts = await Post.insertMany(postsToInsert);
    console.log(`Created ${createdPosts.length} posts.`);

    // 4. Social Graph (Likes, Comments, Follows)
    let commentsCount = 0;

    for (const post of createdPosts) {
      // Add random likes
      const numLikes = Math.floor(Math.random() * 4); // 0 to 3 likes
      const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
      post.likes = shuffledUsers.slice(0, numLikes).map(u => u._id);
      
      // Add random comments
      const numComments = Math.floor(Math.random() * 3); // 0 to 2 comments
      post.commentsCount = numComments;
      
      for (let i = 0; i < numComments; i++) {
        await Comment.create({
          post: post._id,
          user: shuffledUsers[i]._id,
          text: COMMENTS_TEXT[Math.floor(Math.random() * COMMENTS_TEXT.length)]
        });
        commentsCount++;
      }
      
      await post.save();
    }

    // Add follows
    for (const user of createdUsers) {
      const numFollows = Math.floor(Math.random() * 3) + 2; // 2 to 4 follows
      const followingUsers = [...createdUsers]
        .filter(u => u._id.toString() !== user._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, numFollows);
      
      user.following = followingUsers.map(u => u._id);
      
      // Add user to followers of those they followed
      for (const followedUser of followingUsers) {
        await User.findByIdAndUpdate(followedUser._id, {
          $push: { followers: user._id }
        });
      }
      await user.save();
    }

    console.log(`Created ${commentsCount} comments.`);
    console.log('Social graph generated.');
    
    console.log('\n--- Seed Summary ---');
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Posts: ${createdPosts.length}`);
    console.log(`Comments: ${commentsCount}`);
    console.log('--------------------');
    
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
