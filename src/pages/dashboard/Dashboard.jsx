import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  Input,
  Spin,
  Space,
  Typography,
  message,
  Progress,
  Modal,
  Row,
  Col,
  Tooltip,
  List,
  Dropdown,
  Menu,
} from "antd";
import {
  MessageOutlined,
  ShareAltOutlined,
  LikeOutlined,
  CameraOutlined,
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  CloseOutlined,
  PictureOutlined,
  SendOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CommentOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  createPost,
  fetchPosts,
  likePost,
  commentPost,
  sharePost,
  deletePost,
  updatePost,
  createStories,
  getAllStories,
  getComments,
} from "../../apis/api";
import moment from "moment";

const { TextArea } = Input;
const { Text } = Typography;

const Dashboard = () => {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [isDragging, setIsDragging] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [createStoryModal, setCreateStoryModal] = useState(false);
  const [storyContent, setStoryContent] = useState("");
  const [storyImage, setStoryImage] = useState(null);
  const [currentTime] = useState(new Date());
  const [comments, setComments] = useState([]);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch stories
  const fetchStories = async () => {
    try {
      const response = await getAllStories();
      const filteredStories = response.data.stories.filter((story) => {
        const storyTime = new Date(story.createdAt);
        const timeDiff = currentTime - storyTime;
        return timeDiff < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      });
      setStories(filteredStories);
    } catch (error) {
      message.error("Failed to fetch stories");
    }
  };

  // Fetch posts
  const getPosts = async () => {
    try {
      const response = await fetchPosts();
      setPosts(response.data.posts);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
    fetchStories();
  }, []);

  // Handle story creation
  const handleCreateStory = async () => {
    if (!storyContent && !storyImage) {
      message.warning("Please add content or image to your story");
      return;
    }

    const formData = new FormData();
    formData.append("content", storyContent);
    if (storyImage) {
      formData.append("storyImage", storyImage);
    }

    try {
      await createStories(formData);
      message.success("Story created successfully");
      setCreateStoryModal(false);
      setStoryContent("");
      setStoryImage(null);
      fetchStories();
    } catch (error) {
      message.error("Failed to create story");
    }
  };

  // Story viewing modal
  const StoryModal = ({ visible, story, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (visible) {
        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(timer);
              onClose();
              return 0;
            }
            return prev + 1;
          });
        }, 50);
        return () => clearInterval(timer);
      }
    }, [visible, onClose]);

    return (
      <Modal
        visible={visible}
        footer={null}
        onCancel={onClose}
        centered
        width={400}
        bodyStyle={{ padding: 0 }}
      >
        <Progress
          percent={progress}
          showInfo={false}
          strokeColor="#1890ff"
          style={{ position: "absolute", top: 0, width: "100%" }}
        />
        <div className="p-4">
          <Space className="mb-4">
            <Avatar
              src={`http://localhost:5000/profile_pictures/${story?.user?.profilePicture}`}
            />
            <Text
              strong
            >{`${story?.user?.firstName} ${story?.user?.lastName}`}</Text>
          </Space>
          {story?.image && (
            <img
              src={`http://localhost:5000/story_images/${story.image}`}
              alt="Story"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            />
          )}
          <Text>{story?.content}</Text>
        </div>
      </Modal>
    );
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedFile) {
      message.warning("Please add some content or an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      formData.append("privacy", privacy);
      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      await createPost(formData);
      message.success("Post created successfully");
      setPostContent("");
      setSelectedFile(null);
      setImagePreview(null);
      getPosts();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create post");
    }
  };

  // Handle post like
  const handleLikePost = async (postId) => {
    try {
      await likePost(postId);
      getPosts(); // Refresh posts to get updated like status
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to like post");
    }
  };

  // Handle post comment
  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) {
      return;
    }

    try {
      await commentPost(postId, { comment: commentText[postId] });
      setCommentText({ ...commentText, [postId]: "" });
      setIsChanged(!isChanged);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const renderComments = (post) => (
    <List
      className="comment-list"
      itemLayout="horizontal"
      dataSource={post.comments}
      renderItem={(comment) => (
        <List.Item>
          <CommentOutlined
            author={
              <Text
                strong
              >{`${comment.user?.firstName} ${comment.user?.lastName}`}</Text>
            }
            avatar={
              <Avatar
                src={`http://localhost:5000/profile_pictures/${comment.user?.profilePicture}`}
              />
            }
            content={comment.text}
            datetime={moment(comment.createdAt).fromNow()}
          />
        </List.Item>
      )}
    />
  );

  const getallComments = async () => {
    try {
      const response = await getComments();
      setComments(response?.data?.comments);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  };

  // Handle post share
  const handleShare = async (postId) => {
    try {
      await sharePost(postId);
      message.success("Post shared successfully");
      getPosts();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to share post");
    }
  };

  // Handle post delete
  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      message.success("Post deleted successfully");
      getPosts();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  // Handle post edit
  const handleEdit = async (postId) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      await updatePost(postId, { content: editContent });
      message.success("Post updated successfully");
      setEditingPost(null);
      setEditContent("");
      getPosts();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update post");
    }
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        message.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const isLiked = (likes) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return likes.includes(user.id);
  };

  // Privacy button component
  const PrivacyButton = ({ icon: Icon, label, value }) => (
    <Button
      type={privacy === value ? "primary" : "text"}
      icon={<Icon />}
      onClick={() => setPrivacy(value)}
    >
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  // Post component
  const Post = ({ post }) => {
    const menu = (
      <Menu>
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingPost(post._id);
            setEditContent(post.content);
          }}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(post._id)}
        >
          Delete
        </Menu.Item>
      </Menu>
    );

    return (
      <Card className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <Space>
            <Avatar
              src={`http://localhost:5000/profile_pictures/${post.user.profilePicture}`}
              size={40}
            />
            <div>
              <Text strong>
                {post.user.firstName} {post.user.lastName}
              </Text>
              <br />
              <Text type="secondary" className="text-sm">
                {new Date(post.createdAt).toLocaleString()}
              </Text>
            </div>
          </Space>
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </div>

        {editingPost === post._id ? (
          <Space direction="vertical" className="w-full mb-4">
            <TextArea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
            />
            <Space>
              <Button type="primary" onClick={() => handleEdit(post._id)}>
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditingPost(null);
                  setEditContent("");
                }}
              >
                Cancel
              </Button>
            </Space>
          </Space>
        ) : (
          <Text className="mb-4">{post.content}</Text>
        )}

        {post.media && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={`http://localhost:5000/posts/${post.media}`}
              alt="Post content"
              className="w-full"
            />
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-t border-b">
          <Button
            type="text"
            className={`hover:bg-blue-50 ${
              isLiked(post.likes)
                ? "text-blue-500 hover:text-blue-600"
                : "text-black hover:text-black"
            }`}
            icon={
              <LikeOutlined
                style={{
                  color: isLiked(post.likes) ? "#1890ff" : "inherit",
                }}
              />
            }
            onClick={() => handleLikePost(post._id)}
          >
            <span className={isLiked(post.likes) ? "text-blue-500" : ""}>
              {post.likes.length} Likes
            </span>
          </Button>
          <Button
            type="text"
            icon={<CommentOutlined />}
            onClick={() =>
              setShowCommentBox({
                ...showCommentBox,
                [post._id]: !showCommentBox[post._id],
              })
            }
          >
            {post.comments.length} Comments
          </Button>
          <Button
            type="text"
            icon={<ShareAltOutlined />}
            onClick={() => handleShare(post._id)}
          >
            Share
          </Button>
        </div>
        {/* Comment Section */}
        {showCommentBox[post._id] && (
          <div style={{ marginTop: 16, position: "relative" }}>
            <Input.TextArea
              placeholder="Write a comment..."
              value={commentText[post._id] || ""}
              onChange={(e) =>
                setCommentText({
                  ...commentText,
                  [post._id]: e.target.value,
                })
              }
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ borderRadius: 8 }}
            />
            <Button
              type="text"
              icon={<CloseCircleOutlined />}
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "#000000",
              }}
              onClick={() => {
                setShowCommentBox({
                  ...showCommentBox,
                  [post._id]: false,
                });
                setCommentText({
                  ...commentText,
                  [post._id]: "",
                });
              }}
            />
            <Button
              type="primary"
              onClick={() => handleComment(post._id)}
              style={{ marginTop: 8, borderRadius: 6 }}
            >
              Post Comment
            </Button>

            {/* Display Comments */}
            {post?.comments?.map((comment) => (
              <div
                key={comment._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                <div style={{ marginLeft: 8 }}>
                  <Avatar
                    size={32}
                    src={`http://localhost:5000/profile_pictures/${comment.user?.profilePicture}`}
                  />
                  <Text
                    strong
                  >{`${comment.user?.firstName} ${comment.user?.lastName}: ${comment.comment}`}</Text>
                  <Text type="secondary" style={{ marginLeft: 610 }}>
                    {moment(comment.createdAt).fromNow()}
                  </Text>
                  {/* <Text style={{ marginTop: 8 }}>{comment.comment}</Text> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Stories Section */}
        <Card className="mb-6">
          <Row gutter={[16, 16]}>
            {stories.map((story) => (
              <Col key={story._id}>
                <Tooltip
                  title={`${story?.user?.firstName || "Unknown"} ${
                    story?.user?.lastName || "User"
                  }`}
                >
                  <Avatar
                    src={`http://localhost:5000/profile_pictures/${story?.user?.profilePicture}`}
                    size={64}
                    onClick={() => {
                      setSelectedStory(story);
                      setIsStoryModalVisible(true);
                    }}
                  />
                </Tooltip>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Create Post Section */}
        <Card className="mb-6">
          <Space className="w-full" direction="vertical" size="large">
            <Space align="start" className="w-full">
              <Avatar
                src={`http://localhost:5000/profile_pictures/${
                  JSON.parse(localStorage.getItem("user")).profilePicture
                }`}
                size={40}
              />
              <TextArea
                className="flex-1"
                rows={4}
                placeholder="What's on your mind?"
                style={{
                  width: "38rem",
                }}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
            </Space>

            {/* Image Upload Area */}
            {!imagePreview && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-500"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("image-upload").click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                <PictureOutlined className="text-4xl text-gray-400" />
                <Text type="secondary" className="mt-2 block">
                  Drag and drop an image, or click to select
                </Text>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
                <Button
                  type="default"
                  icon={<CloseOutlined />}
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Space>
                <PrivacyButton
                  icon={GlobalOutlined}
                  label="Public"
                  value="public"
                />
                <PrivacyButton
                  icon={TeamOutlined}
                  label="Friends"
                  value="friends"
                />
                <PrivacyButton
                  icon={LockOutlined}
                  label="Only Me"
                  value="private"
                />
              </Space>

              <Space>
                <Button icon={<CameraOutlined />}>
                  <span className="hidden sm:inline">Photo</span>
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleCreatePost}
                >
                  Post
                </Button>
              </Space>
            </div>
          </Space>
        </Card>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Story Modal */}
      <StoryModal
        visible={isStoryModalVisible}
        story={selectedStory}
        onClose={() => setIsStoryModalVisible(false)}
      />

      {/* Create Story Modal */}
      <Modal
        title="Create Story"
        visible={createStoryModal}
        onCancel={() => setCreateStoryModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateStoryModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCreateStory}>
            Create
          </Button>,
        ]}
      >
        <TextArea
          placeholder="What's on your mind?"
          value={storyContent}
          onChange={(e) => setStoryContent(e.target.value)}
          rows={4}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setStoryImage(e.target.files[0])}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
