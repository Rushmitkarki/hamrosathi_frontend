import React, { useEffect, useState } from "react";
import { Layout, Menu, Input, List, Avatar, Button, Card, message } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllFriendsApi, removeFromFriendApi } from "../../apis/api";
const { Sider, Content } = Layout;

const MyFriend = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedKey, setSelectedKey] = useState("3");
  const navigate = useNavigate();

  const [friendsData, setFriendsData] = useState([]);

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
  const handleRemoveFriend = async () => {
    console.log("Removing friend with ID:");
    try {
      await removeFromFriendApi();
      message.success("Friend removed successfully.");
      fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      message.error("Failed to remove friend.");
    }
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
                key={friend.id}
                actions={[
                  <Button type="primary">Profile</Button>,
                  <Button
                    danger
                    icon={<UserDeleteOutlined />}
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Remove
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
    </Layout>
  );
};

export default MyFriend;
