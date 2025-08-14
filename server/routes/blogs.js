const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs with filters and search
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'trending']).withMessage('Invalid sort option'),
  query('category').optional().isString(),
  query('tags').optional().isString(),
  query('search').optional().isString(),
  query('author').optional().isMongoId().withMessage('Invalid author ID')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      category,
      tags,
      search,
      author
    } = req.query;

    // Build query
    const query = { status: 'published' };

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { views: -1, likeCount: -1 };
        break;
      case 'trending':
        // For trending, we'll use a more complex aggregation
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    let blogs;
    const skip = (page - 1) * limit;

    if (sort === 'trending') {
      // Use aggregation for trending blogs
      blogs = await Blog.aggregate([
        { $match: query },
        {
          $addFields: {
            likeCount: { $size: '$likes' },
            daysSinceCreated: {
              $divide: [
                { $subtract: [new Date(), '$createdAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $addFields: {
            trendingScore: {
              $divide: [
                { $add: [{ $multiply: ['$likeCount', 2] }, { $divide: ['$views', 10] }] },
                { $add: ['$daysSinceCreated', 1] }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $project: { password: 0 } }
            ]
          }
        },
        { $unwind: '$author' },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'blog',
            as: 'comments'
          }
        },
        {
          $addFields: {
            commentCount: { $size: '$comments' }
          }
        },
        { $project: { comments: 0 } }
      ]);
    } else {
      blogs = await Blog.find(query)
        .populate('author', '-password')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Add like count and comment count
      for (let blog of blogs) {
        blog.likeCount = blog.likes.length;
        blog.commentCount = await Comment.countDocuments({ blog: blog._id });
        
        // Check if current user liked the blog
        if (req.user) {
          blog.isLiked = blog.likes.some(like => like.user.toString() === req.user._id.toString());
        }
      }
    }

    // Get total count for pagination
    const total = await Blog.countDocuments(query);
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
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// @route   GET /api/blogs/trending
// @desc    Get trending blogs
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    
    const trendingBlogs = await Blog.getTrending(parseInt(days));
    
    // Add comment count for each blog
    for (let blog of trendingBlogs) {
      blog.commentCount = await Comment.countDocuments({ blog: blog._id });
    }
    
    res.json({
      blogs: trendingBlogs.slice(0, parseInt(limit)),
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get trending blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch trending blogs' });
  }
});

// @route   GET /api/blogs/:identifier
// @desc    Get single blog by slug or ID
// @access  Public
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let blog;
    
    // Try to find by ID first (for editing), then by slug (for public viewing)
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId - find by ID (for editing, don't require published status)
      blog = await Blog.findById(identifier)
        .populate('author', '-password')
        .lean();
    } else {
      // It's a slug - find by slug (for public viewing, require published status)
      blog = await Blog.findOne({ 
        slug: identifier,
        status: 'published'
      })
      .populate('author', '-password')
      .lean();
    }

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    blog.views += 1;

    // Add like count and check if user liked
    blog.likeCount = blog.likes.length;
    if (req.user) {
      blog.isLiked = blog.likes.some(like => like.user.toString() === req.user._id.toString());
    }

    // Get comment count
    blog.commentCount = await Comment.countDocuments({ blog: blog._id });

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags = [],
      status = 'draft',
      seo = {}
    } = req.body;

    const blog = new Blog({
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      status,
      author: req.user._id,
      seo
    });

    await blog.save();
    await blog.populate('author', '-password');

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Failed to create blog' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user owns the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const {
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      status,
      seo
    } = req.body;

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (category) blog.category = category;
    if (tags) blog.tags = tags.map(tag => tag.toLowerCase().trim());
    if (status) blog.status = status;
    if (seo) blog.seo = { ...blog.seo, ...seo };

    await blog.save();
    await blog.populate('author', '-password');

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Failed to update blog' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user owns the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    // Delete associated comments
    await Comment.deleteMany({ blog: blog._id });

    // Delete the blog
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Failed to delete blog' });
  }
});

// @route   POST /api/blogs/:id/like
// @desc    Like/Unlike a blog
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const existingLike = blog.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      blog.likes.push({ user: req.user._id });
    }

    await blog.save();

    res.json({
      message: existingLike ? 'Blog unliked' : 'Blog liked',
      isLiked: !existingLike,
      likeCount: blog.likes.length
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Failed to like/unlike blog' });
  }
});

// @route   GET /api/blogs/user/:userId
// @desc    Get blogs by user
// @access  Public
router.get('/user/:userId', [
  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { author: userId };

    // If requesting user is not the author, only show published blogs
    if (!req.user || req.user._id.toString() !== userId) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add like count and comment count
    for (let blog of blogs) {
      blog.likeCount = blog.likes.length;
      blog.commentCount = await Comment.countDocuments({ blog: blog._id });
      
      if (req.user) {
        blog.isLiked = blog.likes.some(like => like.user.toString() === req.user._id.toString());
      }
    }

    const total = await Blog.countDocuments(query);
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
    console.error('Get user blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch user blogs' });
  }
});

module.exports = router;