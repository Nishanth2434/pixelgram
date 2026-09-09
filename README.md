<div align="center">
  <img src="./public/assets/logo.png" alt="Logo" width="100"/>
</div>

# PixelGram 📸

![PixelGram UI](https://img.shields.io/badge/UI-Instagram_Clone-e1306c?style=for-the-badge&logo=instagram)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

## 📸 App Preview
![PixelGram Feed Screenshot](./public/assets/feed-screenshot.png)

A complete, production-quality mini social media web app styled and functioning like Instagram. Built for **TASK 2: Social Media Platform**.

## 🎯 Assignment Criteria Met

This project successfully fulfills all the requirements for the social media assignment:
- ✅ **User Profiles:** Full signup/login/logout flow, user profile view, bio editing, and post grids.
- ✅ **Posts & Comments:** Create posts (with image URLs and captions), comment on posts, and delete comments.
- ✅ **Like/Follow System:** Follow/unfollow other users, and like/unlike posts with live updates.
- ✅ **Frontend:** Built completely using vanilla **HTML, CSS, and JavaScript** without any heavy frameworks.
- ✅ **Backend:** Built using **Node.js and Express.js** to provide a robust REST API.
- ✅ **Database:** Utilized **MongoDB** (with Mongoose schemas) to reliably store users, posts, comments, and follower data.

---

## ✨ Extra Features Included
- **Stories**: Horizontal Stories bar, full-screen tap to view, auto-advance, expires after 24 hours.
- **Reels**: Vertical scrolling short-video feed with likes and comments.
- **Demo Data Seed**: The app includes a built-in seed script that automatically populates 10 demo accounts, posts, stories, reels, likes, follows, and comments upon startup so the app is instantly testable.
- **Zero-Setup Database**: Integrated `mongodb-memory-server` so evaluators do not need to install MongoDB or configure Atlas. The database runs completely in-memory!

## 📂 Project Structure

```text
├── backend/
│   ├── middleware/   # JWT Authentication middleware
│   ├── models/       # Mongoose schemas (User, Post, Comment, Story, Reel)
│   ├── routes/       # Express REST API routes
│   └── server.js     # Express app setup and DB connection
├── public/
│   ├── css/          # Vanilla CSS styling (Instagram dark/light UI)
│   ├── js/           # Vanilla JS for API fetching and DOM manipulation
│   └── index.html    # Main SPA layout
├── seed.js           # Automated script to generate demo data
└── package.json      # Dependencies and scripts
```

## 🚀 How to Run Locally

You do **not** need to set up a database to run this project!

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   *(Note: The server will automatically spin up an in-memory database and seed it with demo data upon startup.)*

3. **Open the App**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. **Demo Login**
   You can jump right in without signing up by using the pre-seeded demo account:
   - **Email:** `demo@pixelgram.com`
   - **Password:** `demo1234`

## 🎨 Design & Data Notes
- **Images & Avatars:** The app dynamically fetches high-quality real photos from **Unsplash** for user avatars, and random lifestyle images from **Picsum** for posts.
- **Videos:** Reels are populated using public MP4 video samples from Google.
- **Persistence:** Because the app uses `mongodb-memory-server` for a zero-friction evaluation experience, data will reset when the Node server stops. (You can optionally connect a persistent MongoDB instance by adding a `MONGO_URI` to a `.env` file).
