import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { updateProfile } from '../../store/slices/userSlice';
import { updateUser } from '../../store/slices/authSlice';
import uploadService from '../../services/uploadService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiCamera, FiX, FiSave } from 'react-icons/fi';

const EditProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      github: ''
    }
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        socialLinks: {
          website: user.socialLinks?.website || '',
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || ''
        }
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let avatarUrl = avatarPreview;

    // Upload avatar if changed
    if (avatar) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadAvatar(avatar);
        avatarUrl = uploadResult.url;
      } catch (error) {
        toast.error('Failed to upload avatar');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const profileData = {
      ...formData,
      avatar: avatarUrl
    };

    try {
      const result = await dispatch(updateProfile(profileData)).unwrap();
      dispatch(updateUser(result.user));
      toast.success('Profile updated successfully!');
      navigate(`/user/${user.username}`);
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Profile - QuillTide</title>
        <meta name="description" content="Edit your QuillTide profile" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Edit Profile
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Update your profile information and settings
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="card p-6">
              {/* Avatar Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {formData.firstName?.[0]?.toUpperCase() || formData.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label htmlFor="avatar" className="btn-outline cursor-pointer">
                      <FiCamera className="w-4 h-4 mr-2" />
                      Change Avatar
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="input"
                    value={formData.firstName}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="input"
                    value={formData.lastName}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="input"
                  value={formData.username}
                  onChange={onChange}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="textarea"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={onChange}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Social Links */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Social Links
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="socialLinks.website"
                      className="input"
                      placeholder="https://yourwebsite.com"
                      value={formData.socialLinks.website}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      name="socialLinks.twitter"
                      className="input"
                      placeholder="https://twitter.com/yourusername"
                      value={formData.socialLinks.twitter}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      name="socialLinks.linkedin"
                      className="input"
                      placeholder="https://linkedin.com/in/yourusername"
                      value={formData.socialLinks.linkedin}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="github"
                      name="socialLinks.github"
                      className="input"
                      placeholder="https://github.com/yourusername"
                      value={formData.socialLinks.github}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="btn-primary flex items-center justify-center"
                >
                  {isLoading || isUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <FiSave className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/user/${user.username}`)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;