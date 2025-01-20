import React from "react";
import { Modal, Avatar, Card, Typography, Row, Col, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProfileModal = ({ open, onCancel, user }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      className="profile-modal"
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <Avatar
          size={120}
          src={
            user?.profilePicture
              ? `http://localhost:5000/profile_pictures/${user.profilePicture}`
              : null
          }
          icon={<UserOutlined />}
          style={{
            border: "4px solid #f0f0f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />

        <Title level={4} style={{ marginTop: 16, marginBottom: 24 }}>
          {user?.firstName} {user?.lastName}
        </Title>

        <Card bordered={false} style={{ background: "#fafafa" }}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div>
                <Text type="secondary">First Name</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{user?.firstName || "-"}</Text>
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div>
                <Text type="secondary">Last Name</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{user?.lastName || "-"}</Text>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <Divider style={{ margin: "0 0 16px 0" }} />
            </Col>

            <Col span={24}>
              <div>
                <Text type="secondary">Email</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{user?.email || "-"}</Text>
                </div>
              </div>
            </Col>

            {/* <Col span={24}>
              <div>
                <Text type="secondary">Phone</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{user?.phone || "-"}</Text>
                </div>
              </div>
            </Col> */}
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default ProfileModal;
