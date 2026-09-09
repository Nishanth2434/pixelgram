# PixelGram

A complete, production-quality mini social media web app styled and functioning like Instagram.

## Features Included
- **User Profiles**: Signup, Login, Logout, Profile View, Edit Bio, Grid of Posts.
- **Posts & Comments**: Create Post (image + caption), Home Feed, Like/Unlike Posts, Add/Delete Comments, Delete Own Posts.
- **Like/Follow System**: Follow/Unfollow Users, Like Posts and Reels.
- **Stories**: Horizontal Stories bar, full-screen tap to view, auto-advance, expires after 24 hours.
- **Reels**: Vertical scrolling short-video feed with likes and comments.
- **Demo Data**: The app includes a built-in seed script that automatically populates 10 demo accounts, posts, stories, reels, likes, follows, and comments upon startup if the database is empty.

## Tech Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript (No frameworks)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via `mongodb-memory-server` for a zero-setup experience)
- **Auth**: JWT & bcryptjs

## How to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Seed & Start the Server**
   ```bash
   npm start
   ```
   *(Note: The server will automatically seed the in-memory database with demo data on startup if it detects an empty database. You can also run `npm run seed` if you provide a `MONGO_URI` in your `.env` file.)*

3. **Open the App**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. **Demo Login**
   - **Email:** `demo@pixelgram.com`
   - **Password:** `demo1234`
   *(Alternatively, you can sign up for a new account).*

## Design Notes
- Uses `mongodb-memory-server` to completely eliminate the need for manual MongoDB setup. Data will reset when the server restarts.
- Replaced missing APIs with completely free, keyless CDN sources (`picsum.photos`, `dicebear.com/avataaars`, and public Google Sample videos).
