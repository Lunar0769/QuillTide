# QuillTide Setup Guide

This guide will help you set up and run the QuillTide MERN stack blog application.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

**Note:** You may see some deprecation warnings and vulnerability alerts during installation. These are common in modern JavaScript projects and don't affect functionality.

### 2. Environment Setup

1. **Create server/.env file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit server/.env with your configuration:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/QuillTide
   JWT_SECRET=quilltide_super_secret_jwt_key_2024_make_this_very_long_and_random_for_security_purposes_123456789
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   
   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=dhyvfzxpd
   CLOUDINARY_API_KEY=438779117276946
   CLOUDINARY_API_SECRET=uSvB59qtavwBexqcLEYrJ9BXuLU
   ```

3. **Create client/.env file:**
   ```bash
   cd ../client
   cp .env.example .env
   ```

4. **Start MongoDB** (if using local installation):
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

5. **Run the application:**
   ```bash
   cd ..
   npm run dev
   ```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### 3. Test the Application

1. **Visit:** http://localhost:3000
2. **Register:** Click "Sign Up" and create an account (no email verification needed)
3. **Login:** Use your credentials to log in
4. **Create Blog:** Click "Write" to create your first blog post
5. **Explore:** Test likes, comments, search, and trending features

## Features Implemented

### Core Features ✅
- **User Authentication:** Simple email/password registration and login
- **JWT Security:** Secure token-based authentication
- **Password Hashing:** bcrypt for secure password storage
- **Blog Management:** Create, edit, delete, and publish blog posts
- **Rich Text Editor:** Ready for React Quill integration
- **Image Uploads:** Cloudinary integration for cover images and avatars
- **Social Features:** Like/unlike posts, comment system with replies
- **Discovery:** Search functionality and trending algorithm
- **User Profiles:** Complete profile system with following/followers
- **Responsive Design:** Dark/light mode toggle, mobile-friendly
- **SEO Optimization:** Meta tags, reading time, friendly URLs

### Backend Features ✅
- **RESTful API:** Express.js with proper routing and middleware
- **Database:** MongoDB with Mongoose ODM and optimized schemas
- **File Handling:** Multer + Cloudinary for image uploads
- **Security:** Helmet, CORS, rate limiting, input validation
- **Performance:** Pagination, indexing, and efficient queries

### Frontend Features ✅
- **Modern React:** Hooks, Redux Toolkit for state management
- **Routing:** React Router with protected routes
- **Styling:** Tailwind CSS with custom design system
- **UX:** Loading states, error handling, toast notifications
- **Accessibility:** Semantic HTML, keyboard navigation, screen reader support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (email + password)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/trending` - Get trending blogs
- `GET /api/blogs/:slug` - Get single blog
- `POST /api/blogs` - Create blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/blogs/:id/like` - Like/Unlike blog
- `GET /api/blogs/user/:userId` - Get user blogs

### Comments
- `GET /api/comments/blog/:blogId` - Get blog comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/Unlike comment

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow/Unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following
- `GET /api/users/search` - Search users

### Upload
- `POST /api/upload/image` - Upload image
- `POST /api/upload/avatar` - Upload avatar
- `DELETE /api/upload/:publicId` - Delete image

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `net start MongoDB` (Windows)
   - Check connection string in `.env`
   - Verify database name is "QuillTide"

2. **Registration/Login Issues**
   - Check server console for errors
   - Verify JWT_SECRET is set in `.env`
   - Clear browser localStorage if needed

3. **Image Upload Issues**
   - Verify Cloudinary credentials in `.env`
   - Check file size limits (5MB max)
   - Ensure proper file types (images only)

4. **Port Already in Use**
   - Kill existing processes: `taskkill /F /IM node.exe` (Windows)
   - Change ports in `.env` files if needed

### Development Tips

1. **Database Reset**
   ```bash
   # Connect to MongoDB and drop database
   mongosh
   use QuillTide
   db.dropDatabase()
   ```

2. **Clear Browser Data**
   - Clear localStorage: `localStorage.clear()` in browser console
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

3. **Development Tools**
   - Check browser Network tab for API calls
   - Monitor server console for errors
   - Use React Developer Tools for debugging

## Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use production database URL
- Configure production email service
- Set secure JWT secret
- Configure CORS for production domain

### Security Considerations
- Use HTTPS in production
- Set secure cookie options
- Configure rate limiting
- Enable helmet security headers
- Validate all inputs
- Use environment variables for secrets

## Next Steps

### Immediate Enhancements
- **Rich Text Editor:** Integrate React Quill for better blog editing
- **Email System:** Add email notifications for comments and follows
- **Advanced Search:** Implement filters by category, date, author
- **Blog Analytics:** View counts, engagement metrics, popular posts

### Advanced Features
- **Real-time Features:** Socket.io for live comments and notifications
- **Social Integration:** Share buttons for social media platforms
- **Content Management:** Admin dashboard, content moderation
- **Mobile App:** React Native version for iOS/Android
- **Performance:** Caching, CDN integration, image optimization

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review server and client logs
3. Verify environment configuration
4. Test API endpoints individually

Happy blogging with QuillTide! 🚀