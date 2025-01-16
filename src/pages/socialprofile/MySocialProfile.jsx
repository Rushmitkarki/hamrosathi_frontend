import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Input,
  Card,
  Avatar,
  Dropdown,
  Modal,
  Space,
  Typography,
  message,
  Upload,
  Popconfirm,
  List,
  Divider,
  Spin,
} from "antd";
import {
  CameraOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  MoreOutlined,
  DeleteOutlined,
  CloseOutlined,
  EditOutlined,
  UploadOutlined,
  LikeFilled,
  CloseCircleOutlined,
  SendOutlined,
  GlobalOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  updateCoverPhotoApi,
  uploadCoverPhotoApi,
  deleteCoverPhotoApi,
  fetchCoverPhotoApi,
  getSingleUser,
  createPost,
  fetchPosts,
  likePost,
  commentPost,
  fetchUserPosts,
  updatePost,
  deletePost,
  getComments,
  createStories,
} from "../../apis/api";
import { Navigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";

const { Text, Title } = Typography;

const MySocialProfile = ({ currentUser, refreshUserData }) => {
  const [postContent, setPostContent] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCoverPhotoMenu, setShowCoverPhotoMenu] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isChanged, setIsChanged] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [commentText, setCommentText] = useState({});
  const [userId, setUserId] = useState(currentUser?._id);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [showCommentBox, setShowCommentBox] = useState({});

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const StoryModal = ({ isVisible, onClose, user }) => {
    const [storyContent, setStoryContent] = useState("");
    const [storyTitle, setStoryTitle] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const beforeUpload = (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      return false;
    };

    const handleImageChange = (info) => {
      if (info.file) {
        setImageFile(info.file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(info.file);
      }
    };

    const handleCreateStory = async () => {
      if (!storyTitle.trim() && !imageFile) {
        message.warning("Please add a title or image for your story");
        return;
      }

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("title", storyTitle);
        formData.append("content", storyContent);
        if (imageFile) {
          formData.append("storyImage", imageFile);
        }

        await createStories(formData);
        message.success("Story created successfully");
        handleClose();
      } catch (error) {
        message.error("Failed to create story");
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      setStoryContent("");
      setStoryTitle("");
      setImageFile(null);
      setImagePreview(null);
      onClose();
    };

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <Modal
        title="Create Story"
        open={isVisible}
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleCreateStory}
          >
            Create Story
          </Button>,
        ]}
        width={600}
      >
        <Spin spinning={loading}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Input
              placeholder="Add a title to your story"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              prefix={<Text type="secondary">Title:</Text>}
            />

            <TextArea
              placeholder="Write something about your story..."
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 6 }}
            />

            <div style={{ marginTop: 16 }}>
              <Upload
                name="storyImage"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleImageChange}
              >
                {imagePreview ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={imagePreview}
                      alt="story"
                      style={{ width: "100%" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.5)",
                        padding: 4,
                        borderRadius: "0 0 0 4px",
                      }}
                    >
                      <DeleteOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        style={{ color: "white" }}
                      />
                    </div>
                  </div>
                ) : (
                  uploadButton
                )}
              </Upload>
            </div>

            {(storyTitle || storyContent || imagePreview) && (
              <Card title="Preview" style={{ marginTop: 16 }}>
                {storyTitle && <Title level={4}>{storyTitle}</Title>}
                {storyContent && <Text>{storyContent}</Text>}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      marginTop: 16,
                      borderRadius: 8,
                    }}
                  />
                )}
              </Card>
            )}
          </Space>
        </Spin>
      </Modal>
    );
  };

  const getActionMenu = (post) => ({
    items: [
      {
        key: "1",
        label: "Edit Post",
        icon: <EditOutlined />,
        onClick: () => {
          setEditingPostId(post._id);
          setEditedContent(post.content);
          setIsEditModalVisible(true);
        },
      },
      {
        key: "2",
        label: "Delete Post",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: "Delete Post",
            content: "Are you sure you want to delete this post?",
            okText: "Delete",
            okType: "danger",
            onOk: () => {
              handleDeletePost(post._id);
              setIsChanged(!isChanged);
            },
          });
        },
      },
    ],
  });
  // render comment
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
  const formatTimeAgo = (createdAt) => {
    return moment(createdAt).fromNow();
  };

  const fetchPosts = async () => {
    try {
      const response = await fetchUserPosts();
      setPosts(response?.data?.posts || []);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to fetch posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [isChanged]);
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }
    return true;
  };
  const getPosts = async () => {
    try {
      // setLoading(true);
      const response = await fetchPosts();
      setPosts(response.data.posts);
    } catch (error) {
      // message.error(error.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getPosts();
  }, [isChanged]);

  // getcomments
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

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedFile) {
      message.warning("Please add content or an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      if (selectedFile) formData.append("media", selectedFile);

      await createPost(formData);
      message.success("Post created successfully");
      setPostContent("");
      setSelectedFile(null);
      setImagePreview(null);
      setIsChanged(!isChanged);
    } catch (error) {
      message.error("Failed to create post");
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setIsChanged(!isChanged);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to like post");
    }
  };
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

  // fetch coverphoto
  const fetchCoverPhoto = async () => {
    try {
      setLoading(true);
      const response = await getSingleUser();
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        message.error("Failed to load cover photo");
      }
    } catch (error) {
      message.error("An error occurred while fetching the cover photo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverPhoto();
  }, []);

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("coverPhoto", file);

      const response = await uploadCoverPhotoApi(formData);
      if (response.data.success) {
        message.success("Cover photo uploaded successfully!");
        setCoverPhotoUrl(response.data.coverphoto);
        fetchCoverPhoto();
      }
    } catch (error) {
      // message.error("Failed to upload cover photo");
      console.error(error);
    } finally {
      setLoading(false);
      setShowCoverPhotoMenu(false);
    }
  };
  const handleUpdatePost = async () => {
    if (!editedContent.trim()) {
      message.warning("Post content cannot be empty");
      return;
    }

    try {
      await updatePost(editingPostId, { content: editedContent });
      setEditingPostId();
      setEditedContent("");
      setIsChanged(!isChanged);
      message.success("Post updated successfully");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update post");
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setIsChanged(!isChanged);
      message.success("Post deleted successfully");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete post");
    }
  };
  const handleEdit = (postId, content) => {
    setEditingPostId(postId);
    setEditedContent(content);
  };

  const handleUpdate = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("coverPhoto", file);

      const response = await updateCoverPhotoApi(formData);
      if (response.data.success) {
        message.success("Cover photo updated successfully!");
        setCoverPhotoUrl(response.data.photoUrl);
        refreshUserData();
      }
    } catch (error) {
      message.error("Failed to update cover photo");
      console.error(error);
    } finally {
      setLoading(false);
      setShowCoverPhotoMenu(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteCoverPhotoApi();
      if (response.data.success) {
        message.success("Cover photo deleted successfully!");
        setCoverPhotoUrl("/assets/images/default-cover.png");
        refreshUserData();
      }
    } catch (error) {
      message.error("Failed to delete cover photo");
      console.error(error);
    } finally {
      setLoading(false);
      setShowCoverPhotoMenu(false);
    }
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const coverPhotoMenuItems = [
    {
      key: "upload",
      label: (
        <Upload
          beforeUpload={beforeUpload}
          customRequest={({ file }) => handleUpload(file)}
          showUploadList={false}
        >
          <Space>
            <UploadOutlined />
            <span>Upload Photo</span>
          </Space>
        </Upload>
      ),
    },
    {
      key: "update",
      label: (
        <Upload
          beforeUpload={beforeUpload}
          customRequest={({ file }) => handleUpdate(file)}
          showUploadList={false}
        >
          <Space>
            <EditOutlined />
            <span>Update Photo</span>
          </Space>
        </Upload>
      ),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete cover photo?"
          description="Are you sure you want to delete your cover photo?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
        >
          <Space>
            <DeleteOutlined style={{ color: "#ff4d4f" }} />
            <Text type="danger">Delete Photo</Text>
          </Space>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="cover-photo-section" style={{ position: "relative" }}>
      {/* Cover Image with Edit Overlay */}
      <div
        style={{
          height: "480px",
          width: "100%",
          backgroundColor: "#f0f2f5",
          overflow: "hidden",
          position: "relative",
        }}
        onMouseEnter={() => setShowCoverPhotoMenu(true)}
        onMouseLeave={() => setShowCoverPhotoMenu(false)}
      >
        <img
          src={`http://localhost:5000/coverphoto/${user?.coverphoto}`}
          alt="Cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() =>
            handleImageClick(
              imagePreview ||
                `http://localhost:5000/coverphoto/${user?.coverphoto}`
            )
          }
        />

        {/* Cover Photo Edit Overlay */}
        {showCoverPhotoMenu && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              background: "rgba(255, 255, 255, 0.9)",
              padding: "4px",
              borderRadius: 8,
              display: "flex",
              gap: 16,
              backdropFilter: "blur(4px)",
            }}
          >
            <Dropdown
              menu={{ items: coverPhotoMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                icon={<CameraOutlined />}
                type="text"
                style={{ color: "white" }}
              >
                Edit Cover Photo
              </Button>
            </Dropdown>
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: "-90px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Profile Section */}
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Space size={24} align="end">
              <Avatar
                size={100}
                src={
                  imagePreview
                    ? imagePreview
                    : user?.profilePicture
                    ? `http://localhost:5000/profile_pictures/${user.profilePicture}`
                    : "/assets/images/default-avatar.png"
                }
                onClick={() =>
                  handleImageClick(
                    imagePreview ||
                      `http://localhost:5000/profile_pictures/${user?.profilePicture}`
                  )
                }
              />
              <Title level={2}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : "User Name"}
              </Title>
            </Space>

            <Space>
              <Button
                onClick={() => setIsStoryModalVisible(true)}
                type="primary"
              >
                Add to Story{" "}
              </Button>
              <Button onClick={() => navigate("/myprofile")}>
                Edit Profile
              </Button>
            </Space>
          </div>
        </Card>
        <StoryModal
          isVisible={isStoryModalVisible}
          onClose={() => setIsStoryModalVisible(false)}
          user={user}
        />

        {/* Create Post Section */}
        <Card
          bordered={false}
          style={{
            marginBottom: 24,
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space style={{ width: "100%" }}>
              <Avatar
                size={48}
                src={`http://localhost:5000/profile_pictures/${user?.profilePicture}`}
              />
              <Input.TextArea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
                style={{
                  borderRadius: 12,
                  backgroundColor: "#f0f2f5",
                  border: "none",
                  padding: "12px",
                }}
              />
            </Space>

            <Divider style={{ margin: "12px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Upload
                beforeUpload={beforeUpload}
                onChange={({ file }) => setSelectedFile(file)}
                showUploadList={false}
              >
                <Button icon={<CameraOutlined />}>Photo/Video</Button>
              </Upload>

              <Space>
                <Button
                  icon={<GlobalOutlined />}
                  onClick={() =>
                    setPrivacy(privacy === "public" ? "private" : "public")
                  }
                >
                  {privacy === "public" ? "Public" : "Private"}
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

        {/* Image Modal */}
        <Modal
          open={showImageModal}
          footer={null}
          onCancel={() => setShowImageModal(false)}
          width="max-content"
          closeIcon={<CloseOutlined style={{ color: "white" }} />}
          style={{ top: 20 }}
          modalRender={(modal) => (
            <div style={{ background: "transparent" }}>{modal}</div>
          )}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          />
        </Modal>
        {/* Post Feed */}
        <div className="post-feed">
          {posts.map((post) => (
            <Card
              key={post?._id}
              style={{
                marginBottom: 10,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              actions={[
                <Button
                  type="text"
                  onClick={() => handleLike(post?._id)}
                  icon={
                    post?.likes?.includes(user?._id) ? (
                      <LikeFilled style={{ color: "#1890ff" }} />
                    ) : (
                      <LikeOutlined style={{ color: "#000000" }} />
                    )
                  }
                  style={{
                    color: post?.likes?.includes(user?._id)
                      ? "#1890ff"
                      : "#000000",
                  }}
                >
                  {post?.likes?.length}
                </Button>,
                <Button
                  type="text"
                  onClick={() =>
                    setShowCommentBox({
                      ...showCommentBox,
                      [post._id]: !showCommentBox[post._id],
                    })
                  }
                  icon={<CommentOutlined style={{ color: "#000000" }} />}
                >
                  {post?.comments?.length}
                </Button>,
                <Button
                  type="text"
                  icon={<ShareAltOutlined style={{ color: "#000000" }} />}
                >
                  Share
                </Button>,
              ]}
              extra={
                <Dropdown menu={getActionMenu(post)} placement="bottomRight">
                  <Button
                    type="text"
                    icon={<MoreOutlined style={{ color: "#000000" }} />}
                  />
                </Dropdown>
              }
            >
              <Card.Meta
                avatar={
                  <Avatar
                    size={48}
                    src={`http://localhost:5000/profile_pictures/${user?.profilePicture}`}
                  />
                }
                title={
                  <Space>
                    <Text strong>{`${user?.firstName} ${user?.lastName}`}</Text>
                    <Text type="secondary" style={{ fontSize: "0.9em" }}>
                      • {formatTimeAgo(post.createdAt)}
                    </Text>
                  </Space>
                }
                description={
                  <div style={{ color: "#000000" }}>{post.content}</div>
                }
              />

              {post.media && (
                <div style={{ marginTop: 16 }}>
                  <img
                    src={`http://localhost:5000/posts/${post.media}`}
                    alt="Post Media"
                    style={{
                      width: "100%",
                      height: 1000,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

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

                  {post?.comments?.map((comment) => (
                    <div
                      key={comment._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 16,
                      }}
                    >
                      <Avatar
                        size={32}
                        src={`http://localhost:5000/profile_pictures/${user?.profilePicture}`}
                      />
                      <div style={{ marginLeft: 8 }}>
                        <Text
                          strong
                        >{`${user?.firstName} ${user?.lastName}: ${comment.comment}`}</Text>
                        <Text type="secondary" style={{ marginLeft: 610 }}>
                          {formatTimeAgo(comment.createdAt)}
                        </Text>
                        <Text style={{ marginTop: 8 }}>{comment.content}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          <Modal
            title="Edit Post"
            open={isEditModalVisible}
            onCancel={() => {
              setIsEditModalVisible(false);
              setEditingPostId(null);
              setEditedContent("");
            }}
            onOk={() => {
              handleUpdatePost(editingPostId, editedContent);
              setIsEditModalVisible(false);
              setEditingPostId(null);
            }}
          >
            <TextArea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              style={{ marginTop: 16 }}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default MySocialProfile;
