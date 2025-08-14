import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment, 
  toggleLikeComment,
  reset 
} from '../../store/slices/commentSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  FiMessageCircle, 
  FiHeart, 
  FiCornerDownRight, 
  FiEdit, 
  FiTrash2, 
  FiSend 
} from 'react-icons/fi';

const CommentSection = ({ blogId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading, isError, message } = useSelector((state) => state.comment);
  
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (blogId) {
      dispatch(getComments({ blogId }));
    }
  }, [dispatch, blogId]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(reset());
  }, [isError, message, dispatch]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await dispatch(createComment({
        content: newComment,
        blog: blogId
      })).unwrap();
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await dispatch(createComment({
        content: replyContent,
        blog: blogId,
        parentComment: replyTo
      })).unwrap();
      
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleEditComment = async (e) => {
    e.preventDefault();
    
    if (!editContent.trim()) {
      toast.error('Please enter comment content');
      return;
    }

    try {
      await dispatch(updateComment({
        id: editingComment,
        content: editContent
      })).unwrap();
      
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
        toast.success('Comment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete comment');
      }
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      await dispatch(toggleLikeComment(commentId)).unwrap();
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isAuthor = user && comment.author._id === user.id;
    const isEditing = editingComment === comment._id;

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <Link to={`/user/${comment.author.username}`} className="flex-shrink-0">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {comment.author.firstName?.[0]?.toUpperCase() || comment.author.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </Link>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  to={`/user/${comment.author.username}`}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {comment.author.firstName && comment.author.lastName 
                    ? `${comment.author.firstName} ${comment.author.lastName}`
                    : comment.author.username
                  }
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400 italic">(edited)</span>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleEditComment} className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Comment Actions */}
            {!isEditing && (
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  disabled={!user}
                  className={`flex items-center space-x-1 hover:text-red-600 ${
                    comment.isLiked ? 'text-red-600' : ''
                  } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <FiHeart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likeCount || 0}</span>
                </button>

                {!isReply && user && (
                  <button
                    onClick={() => setReplyTo(comment._id)}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <FiCornerDownRight className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                )}

                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="flex items-center space-x-1 hover:text-blue-600"
                    >
                      <FiEdit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="flex items-center space-x-1 hover:text-red-600"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Reply Form */}
            {replyTo === comment._id && (
              <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Write a reply..."
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 flex items-center space-x-1"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <FiSend className="w-3 h-3" />}
                    <span>Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex items-center space-x-2 mb-6">
        <FiMessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Write a comment..."
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : <FiSend className="w-4 h-4" />}
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Please log in to leave a comment
          </p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      )}

      {/* Comments List */}
      {isLoading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No comments yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;