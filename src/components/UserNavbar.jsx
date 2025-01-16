import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Menu,
  List,
  Typography,
  Space,
  Modal,
  Empty,
  Tabs,
  message,
} from "antd";
import {
  HomeFilled,
  BellFilled,
  SettingFilled,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MessageFilled,
  SearchOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { FaGamepad } from "react-icons/fa";
import {
  getSingleUser,
  fetchNotifications,
  markNotificationAsRead,
  searchUsers,
  sendFriendRequest,
  sendFriendRequestApi,
} from "../apis/api";
import io from "socket.io-client";

const { Header } = Layout;
const { Text } = Typography;

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await getSingleUser();
        setProfilePicture(res.data.user.profilePicture);
      } catch (err) {
        console.error("Failed to fetch profile picture:", err);
      }
    };
    fetchProfilePicture();
  }, []);

  // Fetch notifications and setup socket
  useEffect(() => {
    const fetchUserAllNotifications = async () => {
      try {
        const res = await fetchNotifications();
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchUserAllNotifications();
    const socket = io("http://localhost:5000");

    socket.on("receiveNotification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle search input and fetch users
  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchUsers(query);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error("Error searching users:", error);
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sending friend request
  const handleSendFriendRequest = async (recipientId) => {
    try {
      const requesterId = localStorage.getItem("user");
      await sendFriendRequestApi({ requesterId, recipientId });
      message.success("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      message.error("Failed to send friend request.");
    }
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
    window.dispatchEvent(new Event("storage"));
  };

  // Settings dropdown menu
  const settingsMenu = (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <div style={{ padding: "10px 16px" }}>
              <Space align="center">
                <EditOutlined style={{ fontSize: "16px" }} />
                <Text strong>Update Profile</Text>
              </Space>
            </div>
          ),
          onClick: () => (window.location.href = "/myprofile"),
        },
        {
          key: "2",
          label: (
            <div style={{ padding: "10px 16px" }}>
              <Space align="center">
                <QuestionCircleOutlined style={{ fontSize: "16px" }} />
                <Text strong>Help</Text>
              </Space>
            </div>
          ),
          onClick: () => (window.location.href = "/help"),
        },
        {
          type: "divider",
        },
        {
          key: "3",
          label: (
            <div style={{ padding: "10px 16px" }}>
              <Space align="center">
                <LogoutOutlined style={{ fontSize: "16px" }} />
                <Text type="danger" strong>
                  Logout
                </Text>
              </Space>
            </div>
          ),
          onClick: handleLogout,
        },
      ]}
    />
  );

  // Notification modal component
  const NotificationModal = () => {
    const [activeTab, setActiveTab] = useState("all");

    const filteredNotifications =
      activeTab === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications;

    const getTimeAgo = (timestamp) => {
      const now = new Date();
      const notifTime = new Date(timestamp);
      const diffInHours = Math.floor((now - notifTime) / (1000 * 60 * 60));

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return notifTime.toLocaleDateString();
    };

    return (
      <Modal
        title={null}
        open={notificationModalVisible}
        onCancel={() => setNotificationModalVisible(false)}
        footer={null}
        width={420}
        className="notification-modal"
        closable={false}
        bodyStyle={{
          padding: 0,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
          }}
        >
          <Text strong style={{ fontSize: "20px" }}>
            Notifications
          </Text>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { label: "All", key: "all" },
              {
                label: "Unread",
                key: "unread",
                children: null,
              },
            ]}
            size="small"
            style={{ marginBottom: -16 }}
          />
        </div>

        <div
          style={{
            overflow: "auto",
            flex: 1,
            padding: "8px 16px",
          }}
        >
          {filteredNotifications.length > 0 ? (
            <List
              dataSource={filteredNotifications}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleMarkAsRead(item._id)}
                  style={{
                    padding: "12px",
                    background: item.read ? "white" : "#f0f7ff",
                    borderRadius: "12px",
                    cursor: "pointer",
                    marginBottom: "8px",
                    transition: "all 0.2s ease",
                    border: "1px solid",
                    borderColor: item.read ? "#f0f0f0" : "#e6f4ff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? "#f5f5f5"
                      : "#e6f4ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? "white"
                      : "#f0f7ff";
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={40}
                        src={
                          item.sender.profilePicture
                            ? `http://localhost:5000/profile_pictures/${item.sender.profilePicture}`
                            : null
                        }
                        icon={!item.sender.profilePicture && <UserOutlined />}
                      />
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong style={{ fontSize: "14px" }}>
                          {item.sender.firstName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {getTimeAgo(item.createdAt)}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Text
                          style={{
                            color: item.read ? "#8c8c8c" : "#262626",
                            fontSize: "13px",
                          }}
                        >
                          {item.message}
                        </Text>
                        {!item.read && (
                          <CheckCircleFilled
                            style={{
                              color: "#1890ff",
                              fontSize: "14px",
                              marginLeft: "8px",
                            }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  {activeTab === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </Text>
              }
              style={{
                padding: "40px 0",
                color: "#8c8c8c",
              }}
            />
          )}
        </div>
      </Modal>
    );
  };

  return (
    <Header
      style={{
        background: scrolled ? "rgba(255, 255, 255, 0.98)" : "#ffffff",
        padding: "0 32px",
        position: "fixed",
        top: 0,
        zIndex: 1000,
        width: "100%",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: scrolled
          ? "0 4px 12px rgba(0,0,0,0.08)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <img
          src="/assets/images/logo2.png"
          alt="Logo"
          style={{
            height: "40px",
            cursor: "pointer",
            transition: "transform 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => (window.location.href = "/Dashboard")}
        />
        <div style={{ position: "relative" }}>
          <Input
            prefix={
              <SearchOutlined style={{ color: "#8c8c8c", fontSize: "16px" }} />
            }
            placeholder="Search hamro sathi..."
            allowClear
            size="large"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            style={{
              width: "360px",
              borderRadius: "24px",
              backgroundColor: "#f5f5f5",
              border: "none",
              padding: "8px 16px",
            }}
          />
          {searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "360px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                marginTop: "8px",
                zIndex: 1001,
              }}
            >
              <List
                dataSource={searchResults}
                loading={loading}
                renderItem={(user) => (
                  <List.Item
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        size={40}
                        src={
                          user.profilePicture
                            ? `http://localhost:5000/profile_pictures/${user.profilePicture}`
                            : null
                        }
                        icon={!user.profilePicture && <UserOutlined />}
                        style={{ marginRight: "12px" }}
                      />
                      <div>
                        <Text strong>
                          {user.firstName} {user.lastName}
                        </Text>
                        <br />
                        <Text type="secondary">{user.email}</Text>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      onClick={() => handleSendFriendRequest(user._id)}
                    >
                      Add Friend
                    </Button>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      </div>

      <Space size={16} style={{ display: "flex", alignItems: "center" }}>
        <Button
          type="text"
          icon={<HomeFilled style={{ fontSize: "22px" }} />}
          className="nav-icon-button"
          onClick={() => (window.location.href = "/Dashboard")}
        />
        <Badge count={unreadCount}>
          <Button
            type="text"
            icon={<BellFilled style={{ fontSize: "22px" }} />}
            className="nav-icon-button"
            onClick={() => setNotificationModalVisible(true)}
          />
        </Badge>
        <Button
          type="text"
          icon={<TeamOutlined style={{ fontSize: "22px" }} />}
          className="nav-icon-button"
          onClick={() => (window.location.href = "/FriendRequest")}
        />
        <Button
          type="text"
          icon={<MessageFilled style={{ fontSize: "22px" }} />}
          className="nav-icon-button"
          onClick={() => (window.location.href = "/messages")}
        />
        <Button
          type="text"
          icon={<FaGamepad style={{ fontSize: "22px" }} />}
          className="nav-icon-button"
          onClick={() => (window.location.href = "/games")}
        />

        <div
          style={{
            height: "28px",
            width: "1px",
            background: "#f0f0f0",
            margin: "0 8px",
          }}
        />

        <Avatar
          size={40}
          src={
            profilePicture
              ? `http://localhost:5000/profile_pictures/${profilePicture}`
              : null
          }
          icon={!profilePicture && <UserOutlined />}
          style={{
            backgroundColor: !profilePicture ? "#1890ff" : undefined,
            border: "2px solid #e6e6e6",
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/socialprofile")}
        />

        <Dropdown
          overlay={settingsMenu}
          placement="bottomRight"
          trigger={["click"]}
          overlayStyle={{
            width: "220px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Button
            type="text"
            icon={<SettingFilled style={{ fontSize: "22px" }} />}
            className="nav-icon-button"
          />
        </Dropdown>
      </Space>
      <NotificationModal />
    </Header>
  );
};

export default UserNavbar;
