require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (mongoUri) mongoUri = mongoUri.replace(/^"|"$|^'|'$/g, '').trim();
        if (!mongoUri) {
            console.error("FATAL ERROR: No MONGO_URI or MONGODB_URI provided!");
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
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

app.get('/api/debug', async (req, res) => {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    let connectError = null;
    
    if (mongoose.connection.readyState !== 1) {
        try {
            // Trim any accidental quotes or spaces the user might have pasted into Vercel
            if (mongoUri) {
                mongoUri = mongoUri.replace(/^"|"$|^'|'$/g, '').trim();
            }
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            isConnected = true;
        } catch (err) {
            connectError = err.message || err.toString();
        }
    }

    res.json({
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongoDbUri: !!process.env.MONGODB_URI,
        mongooseState: mongoose.connection.readyState,
        rawUriStart: mongoUri ? mongoUri.substring(0, 15) : null,
        uriHasQuotes: process.env.MONGO_URI ? process.env.MONGO_URI.includes('"') : false,
        error: connectError
    });
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
