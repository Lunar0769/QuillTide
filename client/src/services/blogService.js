import api from './api';

const blogService = {
  // Get all blogs
  getBlogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/blogs?${queryString}`);
    return response.data;
  },

  // Get trending blogs
  getTrendingBlogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/blogs/trending?${queryString}`);
    return response.data;
  },

  // Get single blog
  getBlog: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  // Create blog
  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  // Like/Unlike blog
  toggleLikeBlog: async (id) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  // Get user blogs
  getUserBlogs: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/blogs/user/${userId}?${queryString}`);
    return response.data;
  },

  // Get liked blogs
  getLikedBlogs: async (params = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users/${user.id}/liked-blogs?${queryString}`);
    return response.data;
  },
};

export default blogService;