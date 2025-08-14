import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getUserBlogs, deleteBlog, reset } from '../store/slices/blogSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BlogCard from '../components/blog/BlogCard';
import toast from 'react-hot-toast';
import { 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiHeart, 
  FiMessageCircle, 
  FiUsers, 
  FiFileText,
  FiTrendingUp,
  FiPlus
} from 'react-icons/fi';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { userBlogs, isLoading, isError, message } = useSelector((state) => state.blog);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserBlogs({ userId: user.id }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(reset());
  }, [isError, message, dispatch]);

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await dispatch(deleteBlog(blogId)).unwrap();
        toast.success('Blog deleted successfully');
        dispatch(getUserBlogs({ userId: user.id }));
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  const publishedBlogs = userBlogs?.filter(blog => blog.status === 'published') || [];
  const draftBlogs = userBlogs?.filter(blog => blog.status === 'draft') || [];
  
  const totalViews = publishedBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalLikes = publishedBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - QuillTide</title>
        <meta name="description" content="Manage your blog posts and view analytics" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.firstName}! Manage your content and track your progress.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  to="/create-blog"
                  className="btn-primary inline-flex items-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  New Blog Post
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiFileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Published Posts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {publishedBlogs.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiEye className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiHeart className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Likes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalLikes}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Followers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {user?.followerCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview', icon: FiTrendingUp },
                  { key: 'published', label: 'Published', icon: FiEye },
                  { key: 'drafts', label: 'Drafts', icon: FiEdit },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.key === 'published' && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                        {publishedBlogs.length}
                      </span>
                    )}
                    {tab.key === 'drafts' && draftBlogs.length > 0 && (
                      <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-0.5 px-2 rounded-full text-xs">
                        {draftBlogs.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Recent Activity
                  </h3>
                  {publishedBlogs.length > 0 ? (
                    <div className="space-y-4">
                      {publishedBlogs.slice(0, 3).map((blog) => (
                        <div key={blog._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <Link
                              to={`/blog/${blog.slug}`}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {blog.title}
                            </Link>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-4">
                              <span className="flex items-center">
                                <FiEye className="w-3 h-3 mr-1" />
                                {blog.views || 0} views
                              </span>
                              <span className="flex items-center">
                                <FiHeart className="w-3 h-3 mr-1" />
                                {blog.likeCount || 0} likes
                              </span>
                              <span className="flex items-center">
                                <FiMessageCircle className="w-3 h-3 mr-1" />
                                {blog.commentCount || 0} comments
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        No blog posts yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Get started by creating your first blog post.
                      </p>
                      <div className="mt-6">
                        <Link to="/create-blog" className="btn-primary">
                          <FiPlus className="w-4 h-4 mr-2" />
                          Create Blog Post
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'published' && (
              <div>
                {publishedBlogs.length > 0 ? (
                  <div className="space-y-6">
                    {publishedBlogs.map((blog) => (
                      <div key={blog._id} className="card p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <BlogCard blog={blog} showAuthor={false} />
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <Link
                              to={`/edit-blog/${blog._id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiEye className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No published posts
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Publish your first blog post to see it here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'drafts' && (
              <div>
                {draftBlogs.length > 0 ? (
                  <div className="space-y-6">
                    {draftBlogs.map((blog) => (
                      <div key={blog._id} className="card p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                              {blog.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {blog.excerpt || 'No excerpt available'}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs mr-4">
                                Draft
                              </span>
                              <span>
                                Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <Link
                              to={`/edit-blog/${blog._id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiEdit className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No drafts
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your draft blog posts will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;