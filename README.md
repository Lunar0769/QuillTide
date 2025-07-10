# BlogApp - Full-Stack MERN Blog Application

A comprehensive blog application built with Next.js, MongoDB, and modern web technologies.

## Features

### 🔐 Authentication
- User registration and login with JWT
- Secure password hashing with bcrypt
- Protected routes for authenticated users
- Persistent login sessions

### 📝 Blog Management (CRUD)
- Create, read, update, and delete blog posts
- Rich text content support
- Tag system for categorization
- Author attribution and timestamps
- View tracking for analytics

### 🔍 Search & Discovery
- Search blogs by title, content, and tags
- Real-time search functionality
- Pagination for better performance
- Filter blogs by author

### 📊 User Interactions
- Like/unlike blog posts
- Comment system with nested discussions
- Follow/unfollow other users
- View counts and engagement metrics

### 👤 User Profiles
- Public user profiles with bio and stats
- Profile pictures and customization
- Analytics dashboard showing:
  - Total blogs written
  - Total views received
  - Total likes and comments
  - Follower/following counts

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean, modern interface
- Mobile-first approach
- Dark mode support
- Smooth animations and transitions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: JWT with bcrypt
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd blog-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Update your \`.env.local\` file:
\`\`\`env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- \`POST /api/auth/signup\` - Register new user
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/me\` - Get current user

### Blogs
- \`GET /api/blogs\` - Get all blogs (with search/pagination)
- \`POST /api/blogs\` - Create new blog
- \`GET /api/blogs/[id]\` - Get specific blog
- \`PUT /api/blogs/[id]\` - Update blog
- \`DELETE /api/blogs/[id]\` - Delete blog
- \`POST /api/blogs/[id]/like\` - Like/unlike blog
- \`POST /api/blogs/[id]/comments\` - Add comment

### Users
- \`GET /api/users/[id]\` - Get user profile
- \`POST /api/users/[id]/follow\` - Follow/unfollow user

## Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  bio: String,
  profilePicture: String,
  followers: [ObjectId],
  following: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Blogs Collection
\`\`\`javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  tags: [String],
  author: ObjectId,
  views: Number,
  likes: [ObjectId],
  comments: [{
    _id: ObjectId,
    author: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Features in Detail

### Authentication System
- JWT-based authentication with 7-day expiration
- Secure password hashing using bcrypt
- Protected API routes with middleware
- Persistent login state management

### Blog System
- Full CRUD operations for blog posts
- Rich text content support
- Tag-based categorization
- View tracking and analytics
- Author attribution

### Social Features
- User following system
- Like/unlike functionality
- Comment system
- User profiles with statistics

### Search & Discovery
- Full-text search across titles, content, and tags
- Pagination for performance
- Filter by author
- Real-time search results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
