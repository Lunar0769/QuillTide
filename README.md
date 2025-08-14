# QuillTide - MERN Stack Blog Website

A complete blog website built with MongoDB, Express.js, React.js, and Node.js.

## Features

### 🔐 Authentication & Security
- Simple email/password registration and login
- JWT-based secure authentication
- Password hashing with bcrypt
- Protected routes and API endpoints

### 📝 Blog Management
- Create, edit, and delete blog posts
- Rich text content support (React Quill ready)
- Cover image uploads with Cloudinary
- Tags and categories system
- Draft and published status
- Reading time estimation
- SEO-friendly URLs and meta tags

### 🤝 Social Features
- Like and unlike blog posts
- Comment system with nested replies
- User profiles with bio and social links
- Follow/unfollow other users
- User avatars and profile customization

### 🔍 Discovery & Search
- Search blogs by title, content, tags, and author
- Trending blogs algorithm (likes + views + recency)
- Filter by category, popularity, and date
- Pagination for better performance

### 🎨 User Experience
- Responsive design for all devices
- Dark/light mode toggle
- Modern, clean interface with Tailwind CSS
- Loading states and error handling
- Toast notifications for user feedback

## Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd QuillTide
   npm run install-all
   ```

2. **Setup environment:**
   ```bash
   # Copy environment files
   cd server && cp .env.example .env
   cd ../client && cp .env.example .env
   ```

3. **Start MongoDB and run the app:**
   ```bash
   # Windows: net start MongoDB
   # macOS: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
quilltide/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json
└── README.md        # This file
```

## Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/QuillTide
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=QuillTide
```

## Tech Stack

### Frontend
- **React.js** - UI library with hooks and functional components
- **Redux Toolkit** - State management with modern Redux patterns
- **React Router** - Client-side routing with protected routes
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Backend
- **Node.js & Express.js** - Server runtime and web framework
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security
- **Cloudinary** - Image upload and management
- **Multer** - File upload middleware

## Deployment

Detailed deployment instructions are provided in the `/docs` folder.