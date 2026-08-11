const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5000', // Update this based on client port or origin
    credentials: true,
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static client files if we want to host on the same port
app.use(express.static(path.join(__dirname, '../client')));

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
// For nested POST /api/posts/:id/comments
app.use('/api/posts/:id/comments', commentRoutes);
// For DELETE /api/comments/:id
app.use('/api/comments', commentRoutes);

// Error handler middleware (basic)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
