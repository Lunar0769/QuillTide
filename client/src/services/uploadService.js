import api from './api';

const uploadService = {
  // Upload image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Delete image
  deleteImage: async (publicId) => {
    const response = await api.delete(`/upload/${publicId}`);
    return response.data;
  },
};

export default uploadService;