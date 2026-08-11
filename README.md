# PixelGram

A full-stack mini social media platform (Instagram-style) built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS.

## Features
- JWT Authentication (httpOnly cookies)
- User Profiles, Follow/Unfollow system
- Posts (Image uploads via Multer), Home Feed, Explore page
- Likes and Comments
- Responsive Instagram-inspired UI

## Setup Instructions

1. **Install Dependencies**
   Run the following from the root directory:
   ```bash
   npm install
   cd server
   npm install
   cd ../client
   npm install
   ```
   *(Note: The `concurrently` package in the root will start both server and client)*

2. **Environment Variables**
   In the `server/` directory, create a `.env` file (or rename `.env.example` to `.env`) with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pixelgram
   JWT_SECRET=supersecretjwtkey
   ```
   *Make sure you have MongoDB running locally or provide a remote MongoDB URI.*

3. **Seed Database (Optional)**
   From the root folder:
   ```bash
   npm run seed
   ```
   This will create a few demo users (`john_doe`, `jane_smith`, `pixel_master` all with password: `password123`) and some initial posts.

4. **Run the Application**
   From the root folder:
   ```bash
   npm run dev
   ```
   This will start the backend server on port 5000 and serve the frontend on port 3000. Open `http://localhost:3000` in your browser.

## Project Structure
- `/server`: Node.js/Express backend (models, controllers, routes, config)
- `/client`: Vanilla HTML/CSS/JS frontend (no build step needed, served by `npx serve`)

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users
- `GET /api/users/:username`
- `PUT /api/users/me`
- `POST /api/users/:id/follow`
- `POST /api/users/:id/unfollow`
- `GET /api/users/:id/followers`
- `GET /api/users/:id/following`
- `GET /api/users/suggested`

### Posts
- `POST /api/posts`
- `GET /api/posts/feed`
- `GET /api/posts/explore`
- `GET /api/posts/user/:username`
- `GET /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/unlike`

### Comments
- `POST /api/posts/:id/comments`
- `GET /api/posts/:id/comments`
- `DELETE /api/comments/:id`
