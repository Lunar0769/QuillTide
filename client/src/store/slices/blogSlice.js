import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from '../../services/blogService';

const initialState = {
  blogs: [],
  currentBlog: null,
  trendingBlogs: [],
  userBlogs: [],
  likedBlogs: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all blogs
export const getBlogs = createAsyncThunk(
  'blog/getBlogs',
  async (params, thunkAPI) => {
    try {
      return await blogService.getBlogs(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch blogs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get trending blogs
export const getTrendingBlogs = createAsyncThunk(
  'blog/getTrendingBlogs',
  async (params, thunkAPI) => {
    try {
      return await blogService.getTrendingBlogs(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch trending blogs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single blog
export const getBlog = createAsyncThunk(
  'blog/getBlog',
  async (slug, thunkAPI) => {
    try {
      return await blogService.getBlog(slug);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch blog';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create blog
export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData, thunkAPI) => {
    try {
      return await blogService.createBlog(blogData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create blog';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update blog
export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, blogData }, thunkAPI) => {
    try {
      return await blogService.updateBlog(id, blogData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update blog';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id, thunkAPI) => {
    try {
      await blogService.deleteBlog(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete blog';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Like/Unlike blog
export const toggleLikeBlog = createAsyncThunk(
  'blog/toggleLikeBlog',
  async (id, thunkAPI) => {
    try {
      return await blogService.toggleLikeBlog(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to like/unlike blog';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user blogs
export const getUserBlogs = createAsyncThunk(
  'blog/getUserBlogs',
  async ({ userId, params }, thunkAPI) => {
    try {
      return await blogService.getUserBlogs(userId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user blogs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get liked blogs
export const getLikedBlogs = createAsyncThunk(
  'blog/getLikedBlogs',
  async (params, thunkAPI) => {
    try {
      return await blogService.getLikedBlogs(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch liked blogs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearBlogs: (state) => {
      state.blogs = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNext: false,
        hasPrev: false,
      };
    },
    updateBlogInList: (state, action) => {
      const { id, updates } = action.payload;
      const blogIndex = state.blogs.findIndex(blog => blog._id === id);
      if (blogIndex !== -1) {
        state.blogs[blogIndex] = { ...state.blogs[blogIndex], ...updates };
      }
      if (state.currentBlog && state.currentBlog._id === id) {
        state.currentBlog = { ...state.currentBlog, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get blogs
      .addCase(getBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(getBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get trending blogs
      .addCase(getTrendingBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrendingBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trendingBlogs = action.payload.blogs;
      })
      .addCase(getTrendingBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get single blog
      .addCase(getBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentBlog = action.payload.blog;
      })
      .addCase(getBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentBlog = null;
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.blogs.unshift(action.payload.blog);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.currentBlog = action.payload.blog;
        
        // Update in blogs array
        const blogIndex = state.blogs.findIndex(blog => blog._id === action.payload.blog._id);
        if (blogIndex !== -1) {
          state.blogs[blogIndex] = action.payload.blog;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Blog deleted successfully';
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
        if (state.currentBlog && state.currentBlog._id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle like blog
      .addCase(toggleLikeBlog.fulfilled, (state, action) => {
        const { isLiked, likeCount } = action.payload;
        
        // Update current blog
        if (state.currentBlog) {
          state.currentBlog.isLiked = isLiked;
          state.currentBlog.likeCount = likeCount;
        }
        
        // Update in blogs array
        const blogIndex = state.blogs.findIndex(blog => blog._id === action.meta.arg);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].isLiked = isLiked;
          state.blogs[blogIndex].likeCount = likeCount;
        }
      })
      // Get user blogs
      .addCase(getUserBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userBlogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get liked blogs
      .addCase(getLikedBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLikedBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.likedBlogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(getLikedBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentBlog, clearBlogs, updateBlogInList } = blogSlice.actions;
export default blogSlice.reducer;