# MERN Blog Application with Email OTP Authentication

A full-stack blog application built with React.js frontend and Express.js backend, featuring email-based OTP authentication using Nodemailer.

## Features

### 🔐 Enhanced Authentication
- Email-based registration with OTP verification
- Secure login with JWT tokens
- Password reset functionality with OTP
- Email verification required for account activation
- Welcome emails for new users

### 📧 Email Integration
- OTP verification emails with professional templates
- Welcome emails after successful verification
- Password reset emails
- Powered by Nodemailer with Gmail SMTP

### 📝 Blog Management
- Create, read, update, and delete blog posts
- Rich text content support
- Tag system for categorization
- Search functionality across titles, content, and tags
- View tracking and analytics

### 👥 Social Features
- User profiles with statistics
- Follow/unfollow system
- Like and comment on posts
- User engagement metrics

### 🎨 Modern UI/UX
- Responsive React.js frontend
- Clean, modern design with Tailwind CSS
- Mobile-first approach
- Smooth animations and transitions

## Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Vite** - Build tool

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB database
- Gmail account for email service

### Backend Setup

1. Navigate to backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update your `.env` file:
\`\`\`env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
CLIENT_URL=http://localhost:3000
\`\`\`

5. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### Frontend Setup

1. Navigate to frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update your `.env` file:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

5. Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

### Gmail Setup for Email Service

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in your `EMAIL_PASS` environment variable

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Blogs
- `GET /api/blogs` - Get all blogs (with search/pagination)
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/:id` - Get specific blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/blogs/:id/like` - Like/unlike blog
- `POST /api/blogs/:id/comments` - Add comment

### Users
- `GET /api/users/:id` - Get user profile with stats
- `PUT /api/users/:id/update` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

## Authentication Flow

1. **Registration**: User signs up with email, username, and password
2. **OTP Verification**: System sends 6-digit OTP to user's email
3. **Email Verification**: User enters OTP to verify email address
4. **Welcome Email**: System sends welcome email after successful verification
5. **Login**: User can now log in with verified email and password

## Email Templates

The application includes professional email templates for:
- **OTP Verification**: Clean, branded emails with verification codes
- **Welcome Messages**: Welcoming new users to the platform
- **Password Reset**: Secure password reset instructions

## Database Schema

### Users Collection
\`\`\`javascript
{
  username: String,
  email: String,
  password: String (hashed),
  bio: String,
  profilePicture: String,
  followers: [ObjectId],
  following: [ObjectId],
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date,
  timestamps: true
}
\`\`\`

### Blogs Collection
\`\`\`javascript
{
  title: String,
  content: String,
  tags: [String],
  author: ObjectId,
  views: Number,
  likes: [ObjectId],
  comments: [{
    author: ObjectId,
    content: String,
    timestamps: true
  }],
  timestamps: true
}
\`\`\`

## Deployment

### Backend (Railway/Heroku)
1. Set up environment variables in your hosting platform
2. Deploy the backend directory
3. Ensure MongoDB connection string is properly configured

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` directory
3. Update API URL environment variable

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Email verification requirement
- OTP expiration (10 minutes)
- Input validation and sanitization
- CORS protection
- Rate limiting ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
