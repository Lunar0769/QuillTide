import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    
    // Update user in localStorage
    if (response.data.user) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  // Follow/Unfollow user
  toggleFollowUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Get user followers
  getUserFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Get user following
  getUserFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  // Search users
  searchUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users/search?${queryString}`);
    return response.data;
  },
};

export default userService;