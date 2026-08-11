const API_URL = '/api';

const fetchAPI = async (endpoint, options = {}) => {
  options.credentials = 'include';
  
  // If not FormData, set Content-Type
  if (!(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (options.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// Auth
const login = (email, password) => fetchAPI('/auth/login', { method: 'POST', body: { email, password } });
const signup = (username, email, password, fullName) => fetchAPI('/auth/signup', { method: 'POST', body: { username, email, password, fullName } });
const logout = () => fetchAPI('/auth/logout', { method: 'POST' });
const getMe = () => fetchAPI('/auth/me');

// Posts
const getFeed = () => fetchAPI('/posts/feed');
const getExplore = () => fetchAPI('/posts/explore');
const getUserPosts = (username) => fetchAPI(`/posts/user/${username}`);
const getPost = (id) => fetchAPI(`/posts/${id}`);
const createPost = (formData) => fetchAPI('/posts', { method: 'POST', body: formData });
const deletePost = (id) => fetchAPI(`/posts/${id}`, { method: 'DELETE' });
const likePost = (id) => fetchAPI(`/posts/${id}/like`, { method: 'POST' });
const unlikePost = (id) => fetchAPI(`/posts/${id}/unlike`, { method: 'POST' });

// Users
const getUserProfile = (username) => fetchAPI(`/users/${username}`);
const updateProfile = (formData) => fetchAPI('/users/me', { method: 'PUT', body: formData });
const followUser = (id) => fetchAPI(`/users/${id}/follow`, { method: 'POST' });
const unfollowUser = (id) => fetchAPI(`/users/${id}/unfollow`, { method: 'POST' });
const getSuggestedUsers = () => fetchAPI('/users/suggested');
const getFollowers = (id) => fetchAPI(`/users/${id}/followers`);
const getFollowing = (id) => fetchAPI(`/users/${id}/following`);

// Comments
const addComment = (postId, text) => fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body: { text } });
const getComments = (postId) => fetchAPI(`/posts/${postId}/comments`);
const deleteComment = (commentId) => fetchAPI(`/comments/${commentId}`, { method: 'DELETE' });

window.api = {
  login, signup, logout, getMe,
  getFeed, getExplore, getUserPosts, getPost, createPost, deletePost, likePost, unlikePost,
  getUserProfile, updateProfile, followUser, unfollowUser, getSuggestedUsers, getFollowers, getFollowing,
  addComment, getComments, deleteComment
};
