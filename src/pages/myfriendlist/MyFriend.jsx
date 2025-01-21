import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Input,
  List,
  Avatar,
  Button,
  Card,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  LockOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllFriendsApi,
  removeFromFriendApi,
  blockFriend,
} from "../../apis/api";
import ProfileModal from "./ProfileModal";

const { Sider, Content } = Layout;

const MyFriend = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedKey, setSelectedKey] = useState("3");
  const navigate = useNavigate();
  const [friendsData, setFriendsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  // Fetch friends data
  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = () => {
    getAllFriendsApi()
      .then((response) => {
        setFriendsData(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching friends:", error);
      });
  };

  // Handle remove friend
  const handleRemoveFriend = async (id) => {
    console.log("Removing friend with ID:" + id);
    try {
      await removeFromFriendApi(id);
      message.success("Friend removed successfully.");

      // Update the friendsData state to remove the deleted friend
      setFriendsData((prevFriends) =>
        prevFriends.filter((friend) => friend._id !== id)
      );
    } catch (error) {
      console.error("Error removing friend:", error);
      message.error("Failed to remove friend.");
    }
  };

  // Handle profile button click
  const handleProfileClick = (friend) => {
    setSelectedUser(friend.friend);
    setIsModalVisible(true);
  };

  // Handle block button click
  const handleBlockClick = (friend) => {
    setUserToBlock(friend._id);
    setIsBlockModalVisible(true);
  };

  // Handle block confirmation
  const handleBlockConfirm = async () => {
    if (userToBlock) {
      try {
        await blockFriend(userToBlock);
        message.success("User blocked successfully!");

        // Update the friendsData state to remove the blocked friend
        setFriendsData((prevFriends) =>
          prevFriends.filter((friend) => friend.friend._id !== userToBlock)
        );
      } catch (error) {
        console.error("Error blocking user:", error);
        message.error("Failed to block user. Please try again.");
      } finally {
        setIsBlockModalVisible(false);
        setUserToBlock(null);
      }
    }
  };

  // Handle block modal cancel
  const handleBlockCancel = () => {
    setIsBlockModalVisible(false);
    setUserToBlock(null);
  };

  const menuItems = [
    {
      key: "1",
      icon: <UserAddOutlined />,
      label: "Suggestions",
      onClick: () => navigate("/friendsuggestion"),
    },
    {
      key: "2",
      icon: <UserOutlined />,
      label: "Friend Requests",
      onClick: () => navigate("/friendrequest"),
    },
    {
      key: "3",
      icon: <UserOutlined />,
      label: "All Friends",
      onClick: () => navigate("/myfriend"),
    },
    {
      key: "4",
      icon: <LockOutlined />,
      label: "Blocking",
      onClick: () => navigate("/blocking"),
    },
  ];

  const filteredFriends = friendsData.filter((friend) =>
    friend.friend.firstName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh" }} className="mt-16">
      <Sider
        width={250}
        theme="light"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1,
        }}
      >
        <div style={{ padding: "16px", fontWeight: "bold", fontSize: "20px" }}>
          Friends
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            setSelectedKey(key);
            menuItems.find((item) => item.key === key)?.onClick();
          }}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Content style={{ padding: "24px", backgroundColor: "#f0f2f5" }}>
        <Card
          title="My Friends"
          bordered={false}
          style={{
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <Input
            placeholder="Search friends"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              marginBottom: "24px",
              maxWidth: "400px",
              borderRadius: "6px",
            }}
          />

          <List
            itemLayout="horizontal"
            dataSource={filteredFriends}
            renderItem={(friend) => (
              <List.Item
                key={friend._id}
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleProfileClick(friend)}
                  >
                    Profile
                  </Button>,
                  <Button
                    danger
                    icon={<UserDeleteOutlined />}
                    onClick={() => handleRemoveFriend(friend._id)}
                  >
                    Remove
                  </Button>,
                  <Button
                    icon={<StopOutlined />}
                    onClick={() => handleBlockClick(friend)}
                  >
                    Block
                  </Button>,
                ]}
                style={{ padding: "12px" }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={
                        friend.friend.profilePicture
                          ? `http://localhost:5000/profile_pictures/${friend.friend.profilePicture}`
                          : "/assets/images/default_profile.png"
                      }
                      size={48}
                    />
                  }
                  title={friend.friend.firstName + " " + friend.friend.lastName}
                />
              </List.Item>
            )}
          />
        </Card>
      </Content>

      {/* Profile Modal */}
      <ProfileModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        user={selectedUser}
      />

      {/* Block Confirmation Modal */}
      <Modal
        title="Block User"
        visible={isBlockModalVisible}
        onOk={handleBlockConfirm}
        onCancel={handleBlockCancel}
        okText="Block"
        cancelText="Cancel"
      >
        <p>Are you sure you want to block this user?</p>
      </Modal>
    </Layout>
  );
};

export default MyFriend;
