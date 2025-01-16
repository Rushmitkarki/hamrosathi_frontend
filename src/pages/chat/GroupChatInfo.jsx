import React, { useState } from "react";
import {
  Drawer,
  Avatar,
  Typography,
  Divider,
  List,
  Button,
  Input,
  Space,
  Modal,
  message,
  Badge,
  Checkbox,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  EditOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Camera } from "lucide-react";

const { Title, Text } = Typography;

const GroupChatInfo = ({
  isOpen,
  onClose,
  selectedChat,
  onUpdateGroupImage,
  onUpdateGroupName,
  onAddUser,
  onRemoveUser,
  onLeaveGroup,
  currentUserId,
  allUsers = [],
}) => {
  const [editMode, setEditMode] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out users who are already in the group
  const availableUsers = allUsers.filter(
    (user) =>
      !selectedChat?.users?.some(
        (groupUser) => groupUser._id === user.friend._id
      )
  );

  // Filter users based on search query
  const filteredUsers = availableUsers.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("groupImage", file);
      try {
        const response = await window.fs.readFile(file);
        if (response) {
          message.success("Group image updated successfully");
          onUpdateGroupImage(currentUserId, selectedChat._id, response);
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to update group image");
      }
    }
  };

  const handleNameUpdate = () => {
    if (newGroupName.trim()) {
      onUpdateGroupName(currentUserId, selectedChat._id, newGroupName);
      setEditMode(false);
      setNewGroupName("");
    }
  };

  const handleAddMembers = () => {
    if (selectedUsers.length > 0) {
      for (let i = 0; i < selectedUsers.length; i++) {
        onAddUser(selectedUsers[i]);
      }
      setSelectedUsers([]);
      setShowAddUserModal(false);
      message.success("Members added successfully");
    } else {
      message.warning("Please select at least one member to add");
    }
  };

  const renderGroupHeader = () => (
    <div className="text-center mb-6">
      <div className="relative inline-block">
        <input
          type="file"
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          id="group-image-upload"
        />
        <label htmlFor="group-image-upload" className="cursor-pointer block">
          <div className="w-24 h-24 mx-auto mb-4">
            <Avatar
              size={96}
              src={
                imagePreview ||
                `http://localhost:5000/groups/${selectedChat?.groupImage}` ||
                "/api/placeholder/96/96"
              }
              icon={!imagePreview && !selectedChat?.groupImage && <Camera />}
            />
            <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full">
              <Camera size={16} className="text-white" />
            </div>
          </div>
        </label>
      </div>

      {editMode ? (
        <Space.Compact className="w-full max-w-xs">
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter new group name"
          />
          <Button type="primary" onClick={handleNameUpdate}>
            Save
          </Button>
        </Space.Compact>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Title level={4} className="m-0">
            {selectedChat?.chatName}
          </Title>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setNewGroupName(selectedChat?.chatName);
              setEditMode(true);
            }}
          />
        </div>
      )}
      <Text type="secondary">{selectedChat?.users?.length || 0} members</Text>
    </div>
  );

  const renderMembersList = () => (
    <List
      header={<Text strong>Members</Text>}
      dataSource={selectedChat?.users || []}
      renderItem={(user) => (
        <List.Item
          actions={[
            currentUserId !== user._id && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemoveUser(user._id)}
              >
                Remove
              </Button>
            ),
          ]}
        >
          <List.Item.Meta
            avatar={
              <Badge dot status={user.online ? "success" : "default"}>
                <Avatar
                  src={
                    `http://localhost:5000/profile_pictures/${user.profilePicture}` ||
                    "/api/placeholder/32/32"
                  }
                />
              </Badge>
            }
            title={`${user.firstName} ${user.lastName}`}
            description={user._id === currentUserId ? "You" : user.email}
          />
        </List.Item>
      )}
    />
  );

  const renderAddMembersModal = () => (
    <Modal
      title="Add Members"
      open={showAddUserModal}
      onCancel={() => {
        setShowAddUserModal(false);
        setSelectedUsers([]);
        setSearchQuery("");
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setShowAddUserModal(false);
            setSelectedUsers([]);
            setSearchQuery("");
          }}
        >
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          onClick={handleAddMembers}
          disabled={selectedUsers.length === 0}
        >
          Add Selected ({selectedUsers.length})
        </Button>,
      ]}
    >
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <List
        dataSource={filteredUsers}
        renderItem={(user) => (
          <List.Item
            actions={[
              <Checkbox
                checked={selectedUsers.includes(user.friend._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers([...selectedUsers, user.friend._id]);
                  } else {
                    setSelectedUsers(
                      selectedUsers.filter((id) => id !== user.friend._id)
                    );
                  }
                }}
              />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  src={
                    `http://localhost:5000/profile_pictures/${user.friend.profilePicture}` ||
                    "/api/placeholder/32/32"
                  }
                />
              }
              title={`${user.friend.firstName} ${user.friend.lastName}`}
              description={user.friend.email}
            />
          </List.Item>
        )}
      />
    </Modal>
  );

  const renderActionButtons = () => (
    <Space direction="vertical" className="w-full">
      <Button
        icon={<UsergroupAddOutlined />}
        block
        onClick={() => setShowAddUserModal(true)}
      >
        Add Members
      </Button>
      <Button
        icon={<LogoutOutlined />}
        danger
        block
        onClick={() => setShowLeaveGroupModal(true)}
      >
        Leave Group
      </Button>
    </Space>
  );

  return (
    <>
      <Drawer
        title="Group Info"
        placement="right"
        onClose={onClose}
        open={isOpen}
        width={320}
      >
        {renderGroupHeader()}
        <Divider />
        {renderMembersList()}
        <Divider />
        {renderActionButtons()}
      </Drawer>

      {renderAddMembersModal()}

      <Modal
        title="Leave Group"
        open={showLeaveGroupModal}
        onOk={() => {
          onLeaveGroup();
          setShowLeaveGroupModal(false);
        }}
        onCancel={() => setShowLeaveGroupModal(false)}
      >
        <p>Are you sure you want to leave this group?</p>
      </Modal>
    </>
  );
};

export default GroupChatInfo;
