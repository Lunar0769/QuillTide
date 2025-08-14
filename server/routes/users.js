const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:identifier
// @desc    Get user profile by ID or username
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by username
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId
      user = await User.findById(identifier)
        .select('-password')
        .populate('followers', 'username firstName lastName avatar')
        .populate('following', 'username firstName lastName avatar');
    } else {
      // It's a username
      user = await User.findOne({ username: identifier })
        .select('-password')
        .populate('followers', 'username firstName lastName avatar')
        .populate('following', 'username firstName lastName avatar');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's blog count
    const blogCount = await Blog.countDocuments({ 
      author: user._id, 
      status: 'published' 
    });

    // Get user's comment count
    const commentCount = await Comment.countDocuments({ author: user._id });

    // Check if current user is following this user (if authenticated)
    let isFollowing = false;
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.userId);
        if (currentUser) {
          isFollowing = currentUser.following.includes(user._id);
        }
      } catch (error) {
        // Ignore auth errors for public route
      }
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        socialLinks: user.socialLinks,
        followers: user.followers,
        following: user.following,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        blogCount,
        commentCount,
        isFollowing,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('socialLinks.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('socialLinks.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('socialLinks.github').optional().isURL().withMessage('Invalid GitHub URL'),
  body('socialLinks.website').optional().isURL().withMessage('Invalid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      username,
      bio,
      avatar,
      socialLinks,
      preferences
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken (if changing)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow/Unfollow a user
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUserId.toString()
      );
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Failed to follow/unfollow user' });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username firstName lastName avatar bio')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Failed to fetch followers' });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that this user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username firstName lastName avatar bio')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Failed to fetch following' });
  }
});

// @route   GET /api/users/:id/liked-blogs
// @desc    Get blogs liked by user
// @access  Private (only own liked blogs)
router.get('/:id/liked-blogs', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only see their own liked blogs
    if (id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find blogs that the user has liked
    const blogs = await Blog.find({
      'likes.user': req.user._id,
      status: 'published'
    })
    .populate('author', 'username firstName lastName avatar')
    .sort({ 'likes.createdAt': -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    // Add like count and comment count
    for (let blog of blogs) {
      blog.likeCount = blog.likes.length;
      blog.commentCount = await Comment.countDocuments({ blog: blog._id });
      blog.isLiked = true; // User has liked all these blogs
    }

    const total = await Blog.countDocuments({
      'likes.user': req.user._id,
      status: 'published'
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBlogs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get liked blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch liked blogs' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username firstName lastName avatar bio followerCount')
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

module.exports = router;