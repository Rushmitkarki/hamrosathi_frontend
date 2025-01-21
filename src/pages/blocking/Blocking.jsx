import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Button,
  List,
  Avatar,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  StopOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchBlockedUsers, unblockFriend } from "../../apis/api";

const { Sider, Content } = Layout;
const { Title } = Typography;

const Blocking = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch blocked users
  useEffect(() => {
    fetchBlockedUsers()
      .then((response) => {
        setBlockedUsers(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching blocked users:", error);
        message.error("Failed to fetch blocked users.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle unblock user
  const handleUnblock = async (friendId) => {
    try {
      await unblockFriend(friendId);
      message.success("User unblocked successfully!");

      // Update the blockedUsers state to remove the unblocked user
      setBlockedUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== friendId)
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
      message.error("Failed to unblock user.");
    }
  };

  // Sidebar menu items
  const menuItems = [
    {
      key: "1",
      icon: <UserAddOutlined />,
      label: "Suggestions",
      onClick: () => navigate("/friendsuggestion"),
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "Friend Requests",
      onClick: () => navigate("/friendrequest"),
    },
    {
      key: "3",
      icon: <TeamOutlined />,
      label: "All Friends",
      onClick: () => navigate("/myfriend"),
    },
    {
      key: "4",
      icon: <StopOutlined />,
      label: "Blocking",
      onClick: () => navigate("/blocking"),
    },
  ];

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
          defaultSelectedKeys={["4"]}
          onClick={({ key }) => {
            menuItems.find((item) => item.key === key)?.onClick();
          }}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Content style={{ padding: "24px", backgroundColor: "#f0f2f5" }}>
        <Card>
          <Title level={4}>Blocked Users</Title>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading blocked users...
            </div>
          ) : blockedUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              No blocked users found.
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={blockedUsers}
              renderItem={(user) => (
                <List.Item
                  key={user._id}
                  actions={[
                    <Button
                      key="unblock"
                      type="primary"
                      onClick={() => handleUnblock(user._id)}
                    >
                      Unblock
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={
                          user.recipient.profilePicture
                            ? `http://localhost:5000/profile_pictures/${user.recipient.profilePicture}`
                            : "/assets/images/default_profile.png"
                        }
                      />
                    }ss
                    title={`${user.recipient.firstName} ${user.recipient.lastName}`}
                    description={`Blocked since ${new Date(
                      user.updatedAt
                    ).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Blocking;
