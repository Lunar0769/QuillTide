import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { getBlog, updateBlog, reset } from '../../store/slices/blogSlice';
import uploadService from '../../services/uploadService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiImage, FiX, FiSave, FiEye } from 'react-icons/fi';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBlog, isLoading, isError, isSuccess, message } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft'
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getBlog(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBlog) {
      // Check if user owns this blog
      if (currentBlog.author._id !== user?.id) {
        toast.error('You can only edit your own blog posts');
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: currentBlog.title || '',
        content: currentBlog.content || '',
        excerpt: currentBlog.excerpt || '',
        category: currentBlog.category || '',
        tags: currentBlog.tags ? currentBlog.tags.join(', ') : '',
        status: currentBlog.status || 'draft'
      });
      setCoverImagePreview(currentBlog.coverImage || '');
    }
  }, [currentBlog, user, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && message.includes('updated')) {
      toast.success('Blog updated successfully!');
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    let coverImageUrl = coverImagePreview;

    // Upload new cover image if selected
    if (coverImage) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadImage(coverImage);
        coverImageUrl = uploadResult.url;
      } catch (error) {
        toast.error('Failed to upload image');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const blogData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      coverImage: coverImageUrl,
      status: formData.status
    };

    dispatch(updateBlog({ id: currentBlog._id, blogData }));
  };

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business',
    'Education', 'Entertainment', 'Sports', 'Science', 'Art', 'Other'
  ];

  if (isLoading && !currentBlog) {
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
            The blog post you're trying to edit doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit: {currentBlog.title} - QuillTide</title>
        <meta name="description" content={`Edit blog post: ${currentBlog.title}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Edit Blog Post
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Update your blog post content and settings
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="card p-6">
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input text-lg"
                  placeholder="Enter your blog title..."
                  value={formData.title}
                  onChange={onChange}
                />
              </div>

              {/* Cover Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image
                </label>
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="coverImage" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                          Upload cover image
                        </span>
                        <input
                          id="coverImage"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={12}
                  className="textarea"
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={onChange}
                />
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  className="textarea"
                  placeholder="Brief description of your blog post (optional)"
                  value={formData.excerpt}
                  onChange={onChange}
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="input"
                    value={formData.category}
                    onChange={onChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="input"
                    placeholder="Enter tags separated by commas"
                    value={formData.tags}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={onChange}
                      className="mr-2"
                    />
                    Draft
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={onChange}
                      className="mr-2"
                    />
                    Published
                  </label>
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
                      Update Blog
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-outline"
                >
                  Cancel
                </button>

                {currentBlog.status === 'published' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/blog/${currentBlog.slug}`)}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <FiEye className="w-4 h-4 mr-2" />
                    View Post
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditBlog;