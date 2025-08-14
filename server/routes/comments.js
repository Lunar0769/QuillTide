const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/comments/blog/:blogId
// @desc    Get comments for a blog
// @access  Public
router.get('/blog/:blogId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { blogId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Build sort option
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { 'likes.length': -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Get top-level comments (not replies)
    const comments = await Comment.find({ 
      blog: blogId, 
      parentComment: null 
    })
    .populate('author', 'username firstName lastName avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    // Get replies for each comment
    for (let comment of comments) {
      comment.likeCount = comment.likes.length;
      
      // Get replies
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('author', 'username firstName lastName avatar')
        .sort({ createdAt: 1 })
        .lean();
      
      // Add like count to replies
      comment.replies = replies.map(reply => ({
        ...reply,
        likeCount: reply.likes.length
      }));
    }

    const total = await Comment.countDocuments({ 
      blog: blogId, 
      parentComment: null 
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', [
  auth,
  body('content').notEmpty().withMessage('Comment content is required'),
  body('blog').isMongoId().withMessage('Valid blog ID is required'),
  body('parentComment').optional().isMongoId().withMessage('Valid parent comment ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, blog, parentComment } = req.body;

    // Check if blog exists
    const blogExists = await Blog.findById(blog);
    if (!blogExists) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // If it's a reply, check if parent comment exists
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      content,
      blog,
      author: req.user._id,
      parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: {
        ...comment.toJSON(),
        likeCount: 0,
        replies: []
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', [
  auth,
  body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Comment updated successfully',
      comment: {
        ...comment.toJSON(),
        likeCount: comment.likes.length
      }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      comment.likes.push({ user: req.user._id });
    }

    await comment.save();

    res.json({
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      isLiked: !existingLike,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Failed to like/unlike comment' });
  }
});

// @route   GET /api/comments/user/:userId
// @desc    Get comments by user
// @access  Public
router.get('/user/:userId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ author: userId })
      .populate('author', 'username firstName lastName avatar')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add like count
    const commentsWithLikes = comments.map(comment => ({
      ...comment,
      likeCount: comment.likes.length
    }));

    const total = await Comment.countDocuments({ author: userId });
    const totalPages = Math.ceil(total / limit);

    res.json({
      comments: commentsWithLikes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ message: 'Failed to fetch user comments' });
  }
});

module.exports = router;