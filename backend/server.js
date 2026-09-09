require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB (Serverless safe)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.log('No MONGO_URI provided. Starting in-memory MongoDB...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                mongoUri = mongoServer.getUri();
            } catch (err) {
                console.error("Failed to start memory server. Make sure MONGO_URI is set in Vercel!");
                throw err;
            }
        }
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`MongoDB Connected`);
        isConnected = true;
        
        // Auto-seed if empty
        const seedDB = require('../seed');
        await seedDB();
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

// Ensure DB is connected before handling any API requests
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        await connectDB();
    }
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/reels', require('./routes/reels'));

// Fallback for SPA routing if needed
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Only listen if not running on Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
