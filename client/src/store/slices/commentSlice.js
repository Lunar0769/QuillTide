import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from '../../services/commentService';

const initialState = {
  comments: [],
  userComments: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get comments for a blog
export const getComments = createAsyncThunk(
  'comment/getComments',
  async ({ blogId, params }, thunkAPI) => {
    try {
      return await commentService.getComments(blogId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch comments';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create comment
export const createComment = createAsyncThunk(
  'comment/createComment',
  async (commentData, thunkAPI) => {
    try {
      return await commentService.createComment(commentData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create comment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update comment
export const updateComment = createAsyncThunk(
  'comment/updateComment',
  async ({ id, content }, thunkAPI) => {
    try {
      return await commentService.updateComment(id, content);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update comment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'comment/deleteComment',
  async (id, thunkAPI) => {
    try {
      await commentService.deleteComment(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete comment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Like/Unlike comment
export const toggleLikeComment = createAsyncThunk(
  'comment/toggleLikeComment',
  async (id, thunkAPI) => {
    try {
      return await commentService.toggleLikeComment(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to like/unlike comment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user comments
export const getUserComments = createAsyncThunk(
  'comment/getUserComments',
  async ({ userId, params }, thunkAPI) => {
    try {
      return await commentService.getUserComments(userId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user comments';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearComments: (state) => {
      state.comments = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
        hasNext: false,
        hasPrev: false,
      };
    },
    addReply: (state, action) => {
      const { parentId, reply } = action.payload;
      const parentComment = state.comments.find(comment => comment._id === parentId);
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(reply);
      }
    },
    updateCommentInList: (state, action) => {
      const { id, updates } = action.payload;
      
      // Update in main comments
      const commentIndex = state.comments.findIndex(comment => comment._id === id);
      if (commentIndex !== -1) {
        state.comments[commentIndex] = { ...state.comments[commentIndex], ...updates };
        return;
      }
      
      // Update in replies
      for (let comment of state.comments) {
        if (comment.replies) {
          const replyIndex = comment.replies.findIndex(reply => reply._id === id);
          if (replyIndex !== -1) {
            comment.replies[replyIndex] = { ...comment.replies[replyIndex], ...updates };
            break;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get comments
      .addCase(getComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        
        const newComment = action.payload.comment;
        
        if (newComment.parentComment) {
          // It's a reply
          const parentComment = state.comments.find(comment => comment._id === newComment.parentComment);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(newComment);
          }
        } else {
          // It's a top-level comment
          state.comments.unshift(newComment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        
        const updatedComment = action.payload.comment;
        const commentIndex = state.comments.findIndex(comment => comment._id === updatedComment._id);
        
        if (commentIndex !== -1) {
          state.comments[commentIndex] = updatedComment;
        } else {
          // Check in replies
          for (let comment of state.comments) {
            if (comment.replies) {
              const replyIndex = comment.replies.findIndex(reply => reply._id === updatedComment._id);
              if (replyIndex !== -1) {
                comment.replies[replyIndex] = updatedComment;
                break;
              }
            }
          }
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Comment deleted successfully';
        
        const commentId = action.payload;
        
        // Remove from main comments
        state.comments = state.comments.filter(comment => comment._id !== commentId);
        
        // Remove from replies
        for (let comment of state.comments) {
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply._id !== commentId);
          }
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle like comment
      .addCase(toggleLikeComment.fulfilled, (state, action) => {
        const { isLiked, likeCount } = action.payload;
        const commentId = action.meta.arg;
        
        // Update in main comments
        const commentIndex = state.comments.findIndex(comment => comment._id === commentId);
        if (commentIndex !== -1) {
          state.comments[commentIndex].isLiked = isLiked;
          state.comments[commentIndex].likeCount = likeCount;
          return;
        }
        
        // Update in replies
        for (let comment of state.comments) {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(reply => reply._id === commentId);
            if (replyIndex !== -1) {
              comment.replies[replyIndex].isLiked = isLiked;
              comment.replies[replyIndex].likeCount = likeCount;
              break;
            }
          }
        }
      })
      // Get user comments
      .addCase(getUserComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userComments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearComments, addReply, updateCommentInList } = commentSlice.actions;
export default commentSlice.reducer;