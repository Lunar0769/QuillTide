import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { createBlog, reset } from '../../store/slices/blogSlice';
import uploadService from '../../services/uploadService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiImage, FiX, FiSave, FiEye } from 'react-icons/fi';

const CreateBlog = () => {
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

  const { title, content, excerpt, category, tags } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.blog);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success('Blog created successfully!');
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

  const onSubmit = async (e, blogStatus = 'draft') => {
    e.preventDefault();

    if (!title || !content || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    let coverImageUrl = '';

    // Upload cover image if selected
    if (coverImage) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadImage(coverImage);
        coverImageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error(error.response?.data?.message || 'Failed to upload image');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const blogData = {
      title,
      content,
      excerpt,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      coverImage: coverImageUrl,
      status: blogStatus
    };

    try {
      await dispatch(createBlog(blogData)).unwrap();
    } catch (error) {
      console.error('Blog creation error:', error);
    }
  };

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business',
    'Education', 'Entertainment', 'Sports', 'Science', 'Art', 'Other'
  ];

  return (
    <>
      <Helmet>
        <title>Create New Blog - QuillTide</title>
        <meta name="description" content="Create a new blog post on QuillTide" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create New Blog Post
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Share your thoughts and ideas with the world
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
                  value={title}
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
                  value={content}
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
                  value={excerpt}
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
                    value={category}
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
                    value={tags}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={(e) => onSubmit(e, 'draft')}
                  disabled={isLoading || isUploading}
                  className="btn-secondary flex items-center justify-center"
                >
                  {isLoading || isUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <FiSave className="w-4 h-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => onSubmit(e, 'published')}
                  disabled={isLoading || isUploading}
                  className="btn-primary flex items-center justify-center"
                >
                  {isLoading || isUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <FiEye className="w-4 h-4 mr-2" />
                      Publish Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateBlog;