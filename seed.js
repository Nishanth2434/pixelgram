const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./api/models/User');
const Post = require('./api/models/Post');
const Story = require('./api/models/Story');
const Reel = require('./api/models/Reel');
const Comment = require('./api/models/Comment');

const usernames = ['alex', 'jordan', 'taylor', 'casey', 'riley', 'morgan', 'jamie', 'quinn', 'avery', 'skyler'];
const videos = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
];

const seedDB = async () => {
    try {
        const count = await User.countDocuments();
        if (count > 0) {
            console.log('Database already seeded.');
            return;
        }

        console.log('Seeding Database...');
        await User.deleteMany({});
        await Post.deleteMany({});
        await Story.deleteMany({});
        await Reel.deleteMany({});
        await Comment.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const demoPasswordHash = await bcrypt.hash('demo1234', salt);
        const defaultPasswordHash = await bcrypt.hash('password', salt);

        const users = [];

        const unsplashIds = [
            '1534528741775-53994a69daeb', '1506794778202-cad84cf45f1d',
            '1531427186611-ecfd6d936c79', '1494790108377-be9c29b29330',
            '1527980965255-d3b416303d12', '1438761681033-6461ffad8d80',
            '1544005313-94ddf0286df2', '1507003211169-0a1dd7228f2d',
            '1517841905240-472988babdf9', '1506277886164-e25aa3f4ef7f'
        ];

        // Create demo user
        const demoUser = new User({
            username: 'demo',
            email: 'demo@pixelgram.com',
            passwordHash: demoPasswordHash,
            bio: 'Just a demo user!',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
        });
        await demoUser.save();
        users.push(demoUser);

        // Create 10 demo accounts
        for (let i = 0; i < usernames.length; i++) {
            const name = usernames[i];
            const u = new User({
                username: name,
                email: `${name}@pixelgram.com`,
                passwordHash: defaultPasswordHash,
                bio: `Hi, I am ${name}! ✨`,
                avatarUrl: `https://images.unsplash.com/photo-${unsplashIds[i]}?w=150&h=150&fit=crop`
            });
            await u.save();
            users.push(u);
        }

        // Random follows
        for (let u of users) {
            const numFollows = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < numFollows; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                if (randomUser._id.toString() !== u._id.toString() && !u.following.includes(randomUser._id)) {
                    u.following.push(randomUser._id);
                    randomUser.followers.push(u._id);
                    await randomUser.save();
                }
            }
            await u.save();
        }

        // Posts & Stories
        for (let u of users) {
            const numPosts = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < numPosts; i++) {
                const p = new Post({
                    userId: u._id,
                    imageUrl: `https://picsum.photos/seed/${u.username}_${i}/600/600`,
                    caption: `Having a great time! #post${i}`
                });
                await p.save();
            }

            const numStories = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numStories; i++) {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                const s = new Story({
                    userId: u._id,
                    mediaUrl: `https://picsum.photos/seed/${u.username}_story_${i}/600/1000`,
                    expiresAt
                });
                await s.save();
            }
        }

        // Reels
        for (let i = 0; i < 8; i++) {
            const u = users[Math.floor(Math.random() * users.length)];
            const r = new Reel({
                userId: u._id,
                videoUrl: videos[i % videos.length],
                caption: `Check out this reel! #reel${i}`
            });
            await r.save();
        }

        // Random Likes & Comments on Posts
        const allPosts = await Post.find();
        for (let p of allPosts) {
            const numLikes = Math.floor(Math.random() * 5);
            for (let i = 0; i < numLikes; i++) {
                const u = users[Math.floor(Math.random() * users.length)];
                if (!p.likes.includes(u._id)) p.likes.push(u._id);
            }
            const numComments = Math.floor(Math.random() * 3);
            for (let i = 0; i < numComments; i++) {
                const u = users[Math.floor(Math.random() * users.length)];
                const c = new Comment({
                    postId: p._id,
                    userId: u._id,
                    text: ['Nice!', 'Love this', 'Awesome 🔥'][Math.floor(Math.random() * 3)]
                });
                await c.save();
                p.comments.push(c._id);
            }
            await p.save();
        }

        console.log('Seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

module.exports = seedDB;

// If run directly
if (require.main === module) {
    // This will only work if MONGO_URI is set, since we aren't spinning up memory server here
    require('dotenv').config();
    if(process.env.MONGO_URI) {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => seedDB())
            .then(() => process.exit(0));
    } else {
        console.error("Please provide a MONGO_URI to run seed.js directly, or let the server auto-seed on startup.");
        process.exit(1);
    }
}
