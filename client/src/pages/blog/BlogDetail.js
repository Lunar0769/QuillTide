import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { getBlog, toggleLikeBlog, clearCurrentBlog } from '../../store/slices/blogSlice';
import { getComments } from '../../store/slices/commentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CommentSection from '../../components/blog/CommentSection';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiEye, 
  FiClock, 
  FiCalendar,
  FiEdit,
  FiShare2
} from 'react-icons/fi';

const BlogDetail = () => {
  const { slug } = useParams();

  const dispatch = useDispatch();
  
  const { currentBlog, isLoading } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(getBlog(slug));
      // Clear any previous blog data
      return () => {
        dispatch(clearCurrentBlog());
      };
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentBlog) {
      dispatch(getComments({ blogId: currentBlog._id }));
    }
  }, [dispatch, currentBlog]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setIsLiking(true);
    try {
      await dispatch(toggleLikeBlog(currentBlog._id)).unwrap();
    } catch (error) {
      toast.error('Failed to like post');
    }
    setIsLiking(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentBlog.title,
          text: currentBlog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Blog Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && currentBlog.author._id === user.id;

  return (
    <>
      <Helmet>
        <title>{currentBlog.title} - QuillTide</title>
        <meta name="description" content={currentBlog.excerpt || currentBlog.title} />
        <meta property="og:title" content={currentBlog.title} />
        <meta property="og:description" content={currentBlog.excerpt || currentBlog.title} />
        {currentBlog.coverImage && (
          <meta property="og:image" content={currentBlog.coverImage} />
        )}
      </Helmet>

      <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Cover Image */}
        {currentBlog.coverImage && (
          <div className="w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800">
            <img
              src={currentBlog.coverImage}
              alt={currentBlog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            {/* Category */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium rounded-full">
                {currentBlog.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              {currentBlog.title}
            </h1>

            {/* Author and Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <Link to={`/user/${currentBlog.author.username}`} className="flex items-center space-x-3">
                  {currentBlog.author.avatar ? (
                    <img
                      src={currentBlog.author.avatar}
                      alt={currentBlog.author.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {currentBlog.author.firstName?.[0]?.toUpperCase() || currentBlog.author.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {currentBlog.author.firstName && currentBlog.author.lastName 
                        ? `${currentBlog.author.firstName} ${currentBlog.author.lastName}`
                        : currentBlog.author.username
                      }
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      <span className="flex items-center">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(currentBlog.createdAt), { addSuffix: true })}
                      </span>
                      {currentBlog.readingTime && (
                        <span className="flex items-center">
                          <FiClock className="w-3 h-3 mr-1" />
                          {Math.ceil(currentBlog.readingTime.minutes)} min read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isAuthor && (
                  <>
                    <Link
                      to={`/edit-blog/${currentBlog._id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </Link>
                  </>
                )}
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Share"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center">
                <FiEye className="w-4 h-4 mr-1" />
                {currentBlog.views || 0} views
              </span>
              <span className="flex items-center">
                <FiHeart className="w-4 h-4 mr-1" />
                {currentBlog.likeCount || 0} likes
              </span>
              <span className="flex items-center">
                <FiMessageCircle className="w-4 h-4 mr-1" />
                {currentBlog.commentCount || 0} comments
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg dark:prose-dark max-w-none mb-12">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(currentBlog.content) 
              }}
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
            />
          </div>

          {/* Tags */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {currentBlog.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tags=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Like Button */}
          <div className="flex items-center justify-center mb-12">
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-colors ${
                currentBlog.isLiked
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-2 border-red-200 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800'
              } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {isLiking ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FiHeart className={`w-5 h-5 ${currentBlog.isLiked ? 'fill-current' : ''}`} />
              )}
              <span className="font-medium">
                {currentBlog.isLiked ? 'Liked' : 'Like'} ({currentBlog.likeCount || 0})
              </span>
            </button>
          </div>

          {/* Comments Section */}
          <CommentSection blogId={currentBlog._id} />
        </div>
      </article>
    </>
  );
};

export default BlogDetail;