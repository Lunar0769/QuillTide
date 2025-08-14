import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  currentProfile: null,
  searchResults: [],
  followers: [],
  following: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get user profile
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (userId, thunkAPI) => {
    try {
      return await userService.getUserProfile(userId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      return await userService.updateProfile(profileData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Follow/Unfollow user
export const toggleFollowUser = createAsyncThunk(
  'user/toggleFollowUser',
  async (userId, thunkAPI) => {
    try {
      return await userService.toggleFollowUser(userId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to follow/unfollow user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user followers
export const getUserFollowers = createAsyncThunk(
  'user/getUserFollowers',
  async (userId, thunkAPI) => {
    try {
      return await userService.getUserFollowers(userId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch followers';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user following
export const getUserFollowing = createAsyncThunk(
  'user/getUserFollowing',
  async (userId, thunkAPI) => {
    try {
      return await userService.getUserFollowing(userId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch following';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (params, thunkAPI) => {
    try {
      return await userService.searchUsers(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to search users';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearProfile: (state) => {
      state.currentProfile = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateProfileInState: (state, action) => {
      if (state.currentProfile) {
        state.currentProfile = { ...state.currentProfile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProfile = action.payload.user;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentProfile = null;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.currentProfile = { ...state.currentProfile, ...action.payload.user };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle follow user
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { isFollowing, followerCount } = action.payload;
        if (state.currentProfile) {
          state.currentProfile.isFollowing = isFollowing;
          state.currentProfile.followerCount = followerCount;
        }
      })
      // Get user followers
      .addCase(getUserFollowers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserFollowers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.followers = action.payload.followers;
      })
      .addCase(getUserFollowers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get user following
      .addCase(getUserFollowing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserFollowing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.following = action.payload.following;
      })
      .addCase(getUserFollowing.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.searchResults = action.payload.users;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearProfile, clearSearchResults, updateProfileInState } = userSlice.actions;
export default userSlice.reducer;