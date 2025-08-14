import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getBlogs, getTrendingBlogs } from '../store/slices/blogSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BlogCard from '../components/blog/BlogCard';
import { FiTrendingUp, FiClock, FiUsers } from 'react-icons/fi';

const Home = () => {
  const dispatch = useDispatch();
  const { blogs, trendingBlogs, isLoading } = useSelector((state) => state.blog);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    // Fetch recent blogs
    dispatch(getBlogs({ page: 1, limit: 10, sort: 'newest' }));
    
    // Fetch trending blogs
    dispatch(getTrendingBlogs({ limit: 5 }));
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    const sortMap = {
      recent: 'newest',
      popular: 'popular',
      trending: 'trending'
    };
    
    dispatch(getBlogs({ page: 1, limit: 10, sort: sortMap[tab] }));
  };

  return (
    <>
      <Helmet>
        <title>QuillTide - Your Ultimate Blogging Platform</title>
        <meta 
          name="description" 
          content="Discover amazing stories, share your thoughts, and connect with writers from around the world on QuillTide." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">


        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to <span className="text-primary-200">QuillTide</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Your ultimate blogging platform. Share your thoughts, discover amazing stories, 
                and connect with writers from around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Writing
                </Link>
                <Link
                  to="/trending"
                  className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Explore Stories
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                  <FiUsers className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">10K+</h3>
                <p className="text-gray-600 dark:text-gray-400">Active Writers</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                  <FiClock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">50K+</h3>
                <p className="text-gray-600 dark:text-gray-400">Stories Published</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                  <FiTrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">1M+</h3>
                <p className="text-gray-600 dark:text-gray-400">Monthly Readers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Blog Feed */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Latest Stories
                  </h2>
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
                    {[
                      { key: 'recent', label: 'Recent' },
                      { key: 'popular', label: 'Popular' },
                      { key: 'trending', label: 'Trending' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.key
                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blog List */}
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : blogs.length > 0 ? (
                  <div className="space-y-6">
                    {blogs.map((blog) => (
                      <BlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No blogs found.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Trending Blogs */}
                <div className="card p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FiTrendingUp className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                    Trending This Week
                  </h3>
                  {trendingBlogs.length > 0 ? (
                    <div className="space-y-4">
                      {trendingBlogs.map((blog, index) => (
                        <div key={blog._id} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/blog/${blog.slug}`}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2"
                            >
                              {blog.title}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {blog.likeCount} likes • {blog.views} views
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No trending blogs yet.</p>
                  )}
                </div>

                {/* Call to Action */}
                <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Ready to Share Your Story?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Join thousands of writers and start sharing your thoughts with the world.
                  </p>
                  <Link
                    to="/register"
                    className="btn-primary w-full text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;