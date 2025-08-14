const mongoose = require('mongoose');
const slugify = require('slugify');
const readingTime = require('reading-time');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  readingTime: {
    text: String,
    minutes: Number,
    time: Number,
    words: Number
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  publishedAt: {
    type: Date
  },
  featuredUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Add timestamp to ensure uniqueness
    if (this.isNew) {
      this.slug += '-' + Date.now();
    }
  }
  
  // Calculate reading time
  if (this.isModified('content')) {
    const stats = readingTime(this.content);
    this.readingTime = stats;
    
    // Generate excerpt if not provided
    if (!this.excerpt) {
      const plainText = this.content.replace(/<[^>]*>/g, '');
      this.excerpt = plainText.substring(0, 297) + '...';
    }
  }
  
  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count (will be populated by aggregation)
blogSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Index for search functionality
blogSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  category: 'text'
});

// Index for trending blogs
blogSchema.index({ createdAt: -1, likes: -1, views: -1 });

// Static method to get trending blogs
blogSchema.statics.getTrending = function(days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: dateThreshold }
      }
    },
    {
      $addFields: {
        likeCount: { $size: '$likes' },
        trendingScore: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 2] },
            { $divide: ['$views', 10] }
          ]
        }
      }
    },
    {
      $sort: { trendingScore: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $unwind: '$author'
    }
  ]);
};

blogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);