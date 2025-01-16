import React, { useEffect, useState } from "react";
import { Layout, Menu, Card, Button, Typography, Row, Col } from "antd";
import {
  UserAddOutlined,
  CloseOutlined,
  UserOutlined,
  TeamOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  getSingleUser,
  getUnrequestedUsers,
  sendFriendRequestApi,
} from "../../apis/api";
import { toast } from "react-toastify";

const { Sider, Content } = Layout;
const { Title } = Typography;

const FriendSuggestion = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestInProgress, setRequestInProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([getMe(), fetchUsers()]);
      } catch (error) {
        console.error("Error initializing data:", error);
        toast.error("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUnrequestedUsers();
      const users = response.data.users || [];

      // Filter out the friends from the list
      const filteredUsers = await users.filter((user) => !isFriend(user._id));

      setPeopleData(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch user suggestions.");
      return [];
    }
  };

  const getMe = async () => {
    try {
      const response = await getSingleUser();
      setMe(response.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch your profile.");
      navigate("/login");
    }
  };

  const isFriend = (id) => {
    if (!me?.friends) return false;

    return me.friends.some(
      (friend) =>
        (friend.requester === id || friend.recipient === id) &&
        friend.status === "accepted"
    );
  };

  const requestedByMe = (id) => {
    if (!me?.friends) return false;

    return me.friends.some(
      (friend) => friend.recipient === id && friend.status === "requested"
    );
  };

  const requestedToMe = (id) => {
    if (!me?.friends) return false;

    return me.friends.some(
      (friend) => friend.requester === id && friend.status === "requested"
    );
  };

  const sendFriendRequest = async (recipientId) => {
    if (requestInProgress[recipientId]) return;

    try {
      setRequestInProgress((prev) => ({ ...prev, [recipientId]: true }));

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        toast.error("Please log in to send friend requests");
        navigate("/login");
        return;
      }

      const response = await sendFriendRequestApi({
        requesterId: user.id,
        recipientId,
      });

      if (response.data.success) {
        toast.success("Friend request sent!");
        await Promise.all([getMe(), fetchUsers()]);
      } else {
        toast.error(response.data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request. Please try again.");
    } finally {
      setRequestInProgress((prev) => ({ ...prev, [recipientId]: false }));
    }
  };

  const menuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
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
      <Sider theme="light" style={{ padding: "24px 0" }}>
        <Title level={4} style={{ padding: "0 24px", marginBottom: "24px" }}>
          Friends
        </Title>
        <Menu mode="inline" defaultSelectedKeys={["1"]} items={menuItems} />
      </Sider>
      <Layout>
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          <Title level={2} style={{ marginBottom: "24px" }}>
            People you may know
          </Title>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading suggestions...
            </div>
          ) : peopleData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              No new suggestions available at the moment.
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {peopleData.map((user) => (
                <Col xs={24} sm={12} md={8} lg={6} key={user._id}>
                  <Card
                    cover={
                      <div style={{ height: 200, overflow: "hidden" }}>
                        <img
                          alt={`${user.firstName} ${user.lastName}`}
                          src={
                            user.profilePicture
                              ? `http://localhost:5000/profile_pictures/${user.profilePicture}`
                              : "/assets/images/default_profile.png"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = "/assets/images/default_profile.png";
                          }}
                        />
                      </div>
                    }
                    hoverable
                  >
                    <Card.Meta
                      title={`${user.firstName || "Unknown"} ${
                        user.lastName || ""
                      }`}
                      style={{ marginBottom: "16px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        style={{ flex: 1 }}
                        onClick={() => sendFriendRequest(user._id)}
                        loading={requestInProgress[user._id]}
                        disabled={isFriend(user._id) || requestedByMe(user._id)}
                      >
                        {isFriend(user._id)
                          ? "Friends"
                          : requestedByMe(user._id)
                          ? "Requested"
                          : requestedToMe(user._id)
                          ? "Accept Request"
                          : "Add Friend"}
                      </Button>
                      <Button icon={<CloseOutlined />} />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default FriendSuggestion;
