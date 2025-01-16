import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Avatar,
  Typography,
  Button,
  Row,
  Col,
  message,
} from "antd";
import {
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  acceptFriendRequestApi,
  getAllFriendRequestsApi,
} from "../../apis/api";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const FriendRequest = () => {
  const navigate = useNavigate();

  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    getAllFriendRequestsApi()
      .then((response) => {
        console.log("Friend Requests:", response.data);
        setFriendRequests(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching friend requests:", error);
      });
  };

  const handleAcceptRequest = (requestId) => {
    console.log("Accepting friend request:", requestId);
    acceptFriendRequestApi(requestId)
      .then((response) => {
        console.log("Accept Request Response:", response.data);
        if (response.status === 200) {
          message.success("Friend request accepted successfully!");
          fetchFriendRequests();
        }
      })
      .catch((error) => {
        console.error("Error accepting friend request:", error);
      });
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
      icon: <UserAddOutlined />,
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
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ padding: "24px 16px" }}>
          <Title level={3}>Friends</Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["2"]}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ padding: "24px" }}>
        <Content>
          <Title level={2}>Friend Requests</Title>
          <Row gutter={[24, 24]}>
            {friendRequests.map((request) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={request.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, overflow: "hidden" }}>
                      <img
                        alt={
                          request.requester.firstName +
                          request.requester.lastName
                        }
                        src={
                          request.requester.profilePicture
                            ? `http://localhost:5000/profile_pictures/${request.requester.profilePicture}`
                            : "/assets/images/default_profile.png"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      key="accept"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      Accept
                    </Button>,
                    <Button key="decline">Decline</Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      request.requester.firstName + request.requester.lastName
                    }
                    description={<Text type="secondary">{request.team}</Text>}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FriendRequest;
