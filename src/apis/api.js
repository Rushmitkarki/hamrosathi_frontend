import axios from "axios";

const Api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const formConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

// register api
export const registerUserApi = (data) => Api.post("/api/user/create", data);

// login
export const loginUserApi = (data) => Api.post("/api/user/login", data);

// forgot_password
export const forgotPasswordApi = (data) =>
  Api.post("/api/user/forgot_password", data);

// reset_password
export const resetPasswordApi = (data) =>
  Api.post("/api/user/reset_password", data);

// verify_otp
export const verifyOtpApi = (data) => Api.post("/api/user/verify_otp", data);

// get single user
export const getSingleUser = () => Api.get("/api/user/get_single_user", config);

// get allusers
export const getAllUsers = () => Api.get("/api/user/get_all_users", config);
// search user
export const searchUsers = (query) =>
  Api.get(`/api/user/search_users?query=${query}`);

// get_unrequested_users
export const getUnrequestedUsers = () =>
  Api.get("/api/user/get_unrequested_users", config);

// update user
export const editUserProfileApi = (data) => Api.put("/api/user/update", data);

// upload  profile picture
export const uploadProfilePictureApi = (data) =>
  Api.post("/api/user/profile_picture", data, formConfig);

// update profilepicture
// export const updateProfilePictureApi = (data)=> Api.put("/api/user/profile_picture", data, formConfig);

//  send friend request
export const sendFriendRequestApi = (data) =>
  Api.post("/api/friend/friend_send", data);

export const acceptFriendRequestApi = (id) =>
  Api.put(`/api/friend/accept_friend/${id}`, config);

// get all friends
export const getAllFriendsApi = () =>
  Api.get("/api/friend/friend_list", config);

// get all friend requests
export const getAllFriendRequestsApi = () =>
  Api.get("/api/friend/fetch_friend_requests");
// remove from friend
export const removeFromFriendApi = (friendId) => {
  Api.delete(`/api/friend/remove_friend/${friendId}`);
};

// post

export const createPost = (data) =>
  Api.post("/api/post/create_post", data, formConfig);
export const fetchPosts = () => Api.get("/api/post/get_all_posts");
export const likePost = (postId) => Api.put(`/api/post/like_post/${postId}`);
export const commentPost = (postId, data) =>
  Api.put(`/api/post/comment_post/${postId}`, data);
export const sharePost = (postId) => Api.put(`/api/post/share_Post/${postId}`);
export const deletePost = (postId) =>
  Api.delete(`/api/post/delete_post/${postId}`);
// update post
export const updatePost = (postId, data) =>
  Api.put(`/api/post/update_post/${postId}`, data);

// fetch the post according to the user id
export const fetchUserPosts = () => Api.get("/api/post/user_posts", config);
// Api.get(`/api/post/user_posts/${userid}`);

// chat
export const createChat = (data) => Api.post("/api/chat/create", data);
export const getChat = () => Api.get("/api/chat/fetch");
export const createGroupChat = (data) => Api.post("/api/chat/group", data);
export const renameGroup = (data) => Api.put("/api/chat/rename", data);
export const addUserToGroup = (data) => Api.put("/api/chat/groupadd", data);
export const removeUserFromGroup = (data) =>
  Api.put("/api/chat/groupremove", data);
export const leaveGroup = (data) =>
  Api.put("/api/chat/groupleave", data, config);
export const sendMessage = (data) => Api.post("/api/message/send", data);
export const allMessages = (id) => Api.get(`/api/message/${id}`);
// update group
export const updateGroupChat = (data) => Api.put(`/api/chat/updategroup`, data);

// uploadgroupimage
export const uploadGroupImage = (data) =>
  Api.post("/api/chat/uploadgroupimage", data, formConfig);

// update group image
export const updateGroupImage = (data) =>
  Api.put("/api/chat/updategroupimage", data, formConfig);
// get comments
export const getComments = () => Api.get(`/api/post/get_comments`, config);

export const sendFileApi = (data, config) =>
  Api.post(`/api/message/send/file`, data, formConfig);

// create game
export const createGame = (data) =>
  Api.post("/api/game/create", data, formConfig);
export const getAllGames = () => Api.get("/api/game/get_all_game");
// update game
export const updateGame = (gameId) =>
  Api.put(`/api/game/update_game/${gameId}`, formConfig);
// delete game
export const deleteGame = (gameId) =>
  Api.delete(`/api/game/delete_game/${gameId}`, formConfig);

// khalti payment
export const initializeKhaltiPayment = (data) =>
  Api.post("/api/payment/initialize_khalti", data);

// Upload cover photo
export const uploadCoverPhotoApi = (data) =>
  Api.post("/api/user/upload_cover", data, formConfig);

// fetch cover photo
export const fetchCoverPhotoApi = () => Api.get("/api/user/fetch", config);

// Update cover photo
export const updateCoverPhotoApi = (data) =>
  Api.put("/api/user/edit_cover", data, formConfig);

// Delete cover photo
export const deleteCoverPhotoApi = () =>
  Api.delete("/api/user/delete_cover", config);

// get all notifications

export const fetchNotifications = () =>
  Api.get(`/api/notification/get_notifications`, config);

export const markNotificationAsRead = (notificationId) =>
  Api.put(`/api/notification/${notificationId}`);

// create notification
export const createNotification = (data) =>
  Api.post(`/api/notification/create_notification`, data);

// create stories
export const createStories = (data) =>
  Api.post("/api/story/create", data, formConfig);

// get all stories
export const getAllStories = () => Api.get("/api/story/get_all_stories");

// edit stories
export const editStories = (data) =>
  Api.put("/api/story/edit_story", data, config);

// delete stories
export const deleteStories = () =>
  Api.delete(`/api/story/delete_story`, config);

// login with google
export const googleLoginApi = (data) => Api.post("/api/user/google", data);

// eget by email
export const getUserByGoogleEmail = (data) =>
  Api.post("/api/user/getGoogleUser", data);

// fetch remove friend
export const fetchRemoveFriend = (id) =>
  Api.get(`/api/friend/fetch_remove_friend/${id}`, config);

// block friend
export const blockFriend = (friendId) =>
  Api.put(`/api/friend/block/${friendId}`);

// unblock friend
export const unblockFriend = (friendId) =>
  Api.put(`/api/friend/unblock_friend/${friendId}`);

// fetch blocked users
export const fetchBlockedUsers = () =>
  Api.get("/api/friend/fetch_block_users", config);
