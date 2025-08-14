import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikeBlog } from '../../store/slices/blogSlice';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageCircle, FiEye, FiClock } from 'react-icons/fi';
import DOMPurify from 'dompurify';

const BlogCard = ({ blog, showAuthor = true }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLike = (e) => {
    e.preventDefault();
    if (user) {
      dispatch(toggleLikeBlog(blog._id));
    }
  };

  const getExcerpt = (content, maxLength = 150) => {
    const plainText = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  const formatReadingTime = (readingTime) => {
    if (readingTime?.minutes) {
      return `${Math.ceil(readingTime.minutes)} min read`;
    }
    return '1 min read';
  };

  return (
    <article className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Author Avatar */}
        {showAuthor && (
          <Link 
            to={`/user/${blog.author.username}`}
            className="flex-shrink-0"
          >
            {blog.author.avatar ? (
              <img
                src={blog.author.avatar}
                alt={blog.author.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {blog.author.firstName?.[0]?.toUpperCase() || blog.author.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </Link>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          {showAuthor && (
            <div className="flex items-center space-x-2 mb-2">
              <Link
                to={`/user/${blog.author.username}`}
                className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {blog.author.firstName && blog.author.lastName 
                  ? `${blog.author.firstName} ${blog.author.lastName}`
                  : blog.author.username
                }
              </Link>
              <span className="text-gray-400">•</span>
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </time>
            </div>
          )}

          {/* Title */}
          <Link to={`/blog/${blog.slug}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2 line-clamp-2">
              {blog.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {blog.excerpt || getExcerpt(blog.content)}
          </p>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={`/search?tags=${encodeURIComponent(tag)}`}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
              {blog.tags.length > 3 && (
                <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FiClock className="w-4 h-4" />
                <span>{formatReadingTime(blog.readingTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiEye className="w-4 h-4" />
                <span>{blog.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiMessageCircle className="w-4 h-4" />
                <span>{blog.commentCount || 0}</span>
              </div>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                blog.isLiked
                  ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <FiHeart className={`w-4 h-4 ${blog.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{blog.likeCount || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <Link to={`/blog/${blog.slug}`} className="block mt-4">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-48 object-cover rounded-lg hover:opacity-95 transition-opacity"
          />
        </Link>
      )}
    </article>
  );
};

export default BlogCard;