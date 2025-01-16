import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Upload,
  message,
  Card,
  Avatar,
  Space,
  Typography,
  Spin,
} from "antd";
import {
  PlusOutlined,
  CameraOutlined,
  FileImageOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { createStories, getAllStories } from "../apis/api";

const { TextArea } = Input;
const { Text, Title } = Typography;

const CreateStory = ({ user }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storyContent, setStoryContent] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await getAllStories();
      setStories(response.data.stories);
    } catch (error) {
      message.error("Failed to fetch stories");
    }
  };

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setStoryContent("");
    setStoryTitle("");
    setImageFile(null);
    setImagePreview(null);
  };

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
    return false; // Return false to prevent auto-upload
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
      handleModalClose();
      fetchStories();
    } catch (error) {
      message.error("Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      {/* Create Story Card */}
      <Card
        hoverable
        style={{ width: 150, height: 250, marginRight: 16 }}
        onClick={handleModalOpen}
        cover={
          <div
            style={{
              height: 150,
              background: "#f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusOutlined style={{ fontSize: 24 }} />
          </div>
        }
      >
        <Card.Meta
          avatar={
            <Avatar
              src={`http://localhost:5000/profile_pictures/${user?.profilePicture}`}
            />
          }
          title="Create Story"
          description="Share a photo or write something"
        />
      </Card>

      {/* Create Story Modal */}
      <Modal
        title="Create Story"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
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
            {/* Story Title */}
            <Input
              placeholder="Add a title to your story"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              prefix={<Text type="secondary">Title:</Text>}
            />

            {/* Story Content */}
            <TextArea
              placeholder="Write something about your story..."
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 6 }}
            />

            {/* Image Upload */}
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

            {/* Preview Section */}
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
    </>
  );
};

export default CreateStory;
