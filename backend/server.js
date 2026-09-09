require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const seedDB = require('../seed');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.log('No MONGO_URI provided. Starting in-memory MongoDB...');
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
        }
        await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${mongoUri}`);
        
        // Auto-seed if empty
        await seedDB();

    } catch (error) {
        console.error('MongoDB connection error:', error);
        // On Vercel, if memory-server fails, we just log it. 
        // Vercel needs a real MONGO_URI to work properly.
    }
};

connectDB();

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
