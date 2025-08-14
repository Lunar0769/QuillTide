import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { getUserProfile, toggleFollowUser } from '../../store/slices/userSlice';
import { getUserBlogs } from '../../store/slices/blogSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BlogCard from '../../components/blog/BlogCard';
import toast from 'react-hot-toast';
import { 
  FiCalendar, 
  FiUsers, 
  FiUserPlus, 
  FiUserMinus,
  FiEdit,
  FiExternalLink,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiGlobe
} from 'react-icons/fi';

const Profile = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('blogs');
  const dispatch = useDispatch();
  
  const { user: currentUser } = useSelector((state) => state.auth);
  const { currentProfile, isLoading } = useSelector((state) => state.user);
  const { userBlogs, isLoading: blogsLoading } = useSelector((state) => state.blog);

  const isOwnProfile = currentUser && currentProfile && currentUser.username === currentProfile.username;

  useEffect(() => {
    if (username) {
      dispatch(getUserProfile(username));
    }
  }, [dispatch, username]);

  useEffect(() => {
    if (currentProfile?.id) {
      dispatch(getUserBlogs({ userId: currentProfile.id }));
    }
  }, [dispatch, currentProfile]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      await dispatch(toggleFollowUser(currentProfile.id)).unwrap();
      // Refresh profile to get updated follower count
      dispatch(getUserProfile(username));
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const publishedBlogs = userBlogs?.filter(blog => blog.status === 'published') || [];

  return (
    <>
      <Helmet>
        <title>{currentProfile.fullName || currentProfile.username} - QuillTide</title>
        <meta name="description" content={currentProfile.bio || `${currentProfile.fullName}'s profile on QuillTide`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Cover/Header Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-48"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Info */}
          <div className="relative -mt-24 mb-8">
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  {currentProfile.avatar ? (
                    <img
                      src={currentProfile.avatar}
                      alt={currentProfile.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                      <span className="text-white text-2xl font-bold">
                        {currentProfile.firstName?.[0]?.toUpperCase() || currentProfile.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {currentProfile.fullName || currentProfile.username}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        @{currentProfile.username}
                      </p>
                      {currentProfile.bio && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-2xl">
                          {currentProfile.bio}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                      {isOwnProfile ? (
                        <Link to="/edit-profile" className="btn-outline">
                          <FiEdit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Link>
                      ) : currentUser ? (
                        <button
                          onClick={handleFollowToggle}
                          className={`btn ${currentProfile.isFollowing ? 'btn-outline' : 'btn-primary'}`}
                        >
                          {currentProfile.isFollowing ? (
                            <>
                              <FiUserMinus className="w-4 h-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <FiUserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Stats and Info */}
                  <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <FiUsers className="w-4 h-4 mr-1" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentProfile.followerCount || 0}
                      </span>
                      <span className="ml-1">followers</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentProfile.followingCount || 0}
                      </span>
                      <span className="ml-1">following</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentProfile.blogCount || 0}
                      </span>
                      <span className="ml-1">posts</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      <span>Joined {new Date(currentProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  {currentProfile.socialLinks && (
                    <div className="mt-4 flex space-x-4">
                      {currentProfile.socialLinks.website && (
                        <a
                          href={currentProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <FiGlobe className="w-5 h-5" />
                        </a>
                      )}
                      {currentProfile.socialLinks.twitter && (
                        <a
                          href={currentProfile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <FiTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {currentProfile.socialLinks.linkedin && (
                        <a
                          href={currentProfile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <FiLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {currentProfile.socialLinks.github && (
                        <a
                          href={currentProfile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <FiGithub className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'blogs', label: 'Blog Posts', count: publishedBlogs.length },
                  { key: 'about', label: 'About' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-12">
            {activeTab === 'blogs' && (
              <div>
                {blogsLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : publishedBlogs.length > 0 ? (
                  <div className="space-y-6">
                    {publishedBlogs.map((blog) => (
                      <BlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No blog posts yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isOwnProfile 
                        ? "You haven't published any blog posts yet. Start writing to share your thoughts!"
                        : `${currentProfile.firstName || currentProfile.username} hasn't published any blog posts yet.`
                      }
                    </p>
                    {isOwnProfile && (
                      <Link to="/create-blog" className="btn-primary mt-4">
                        Write Your First Post
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  About {currentProfile.firstName || currentProfile.username}
                </h3>
                <div className="space-y-4">
                  {currentProfile.bio ? (
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentProfile.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      {isOwnProfile 
                        ? "Add a bio to tell people more about yourself."
                        : "This user hasn't added a bio yet."
                      }
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Stats</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Blog posts: {currentProfile.blogCount || 0}</li>
                        <li>Comments: {currentProfile.commentCount || 0}</li>
                        <li>Member since: {new Date(currentProfile.createdAt).toLocaleDateString()}</li>
                      </ul>
                    </div>
                    
                    {currentProfile.socialLinks && Object.values(currentProfile.socialLinks).some(link => link) && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Links</h4>
                        <div className="space-y-1">
                          {currentProfile.socialLinks.website && (
                            <a
                              href={currentProfile.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <FiExternalLink className="w-3 h-3 mr-1" />
                              Website
                            </a>
                          )}
                          {currentProfile.socialLinks.twitter && (
                            <a
                              href={currentProfile.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <FiTwitter className="w-3 h-3 mr-1" />
                              Twitter
                            </a>
                          )}
                          {currentProfile.socialLinks.linkedin && (
                            <a
                              href={currentProfile.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <FiLinkedin className="w-3 h-3 mr-1" />
                              LinkedIn
                            </a>
                          )}
                          {currentProfile.socialLinks.github && (
                            <a
                              href={currentProfile.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <FiGithub className="w-3 h-3 mr-1" />
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;