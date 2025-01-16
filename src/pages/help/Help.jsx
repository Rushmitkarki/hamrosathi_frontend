import React from "react";
import { Card, Typography, Row, Col, Space } from "antd";
import {
  UserOutlined,
  CameraOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { IoGameController } from "react-icons/io5";

const { Title, Text } = Typography;

const Help = () => {
  const steps = [
    {
      title: "Authentication",
      description: "Register and login to Hamro Sathi",
      icon: <UserOutlined className="text-blue-500 text-2xl" />,
    },
    {
      title: "Post Photo",
      description: "Post the photo or video you like",
      icon: <CameraOutlined className="text-red-500 text-2xl" />,
    },
    {
      title: "Connect with different Hamro Sathi users through chat features",
      description: "Chat with other users",
      icon: <MessageOutlined className="text-blue-500 text-2xl" />,
    },
    {
      title: "Game",
      description: "Booked a game and enjoy playing it",
      icon: <IoGameController className="text-green-500 text-2xl" />,
    },
  ];

  return (
    <div className="p-8 pt-24 bg-gray-100 min-h-screen">
      {" "}
      <Title level={2} className="text-center mb-16">
        How it works?
      </Title>
      <Row gutter={[24, 24]} justify="center">
        {steps.map((step, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              hoverable
              className="h-full"
              style={{
                background: "rgba(255, 242, 242, 0.8)",
                borderRadius: "12px",
              }}
            >
              <Space direction="vertical" align="center" className="w-full">
                <div className="bg-white p-4 rounded-full mb-4">
                  {step.icon}
                </div>
                <Title level={4} className="text-center mb-2">
                  {step.title}
                </Title>
                <Text className="text-center block">{step.description}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Row justify="center" className="mt-8">
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            className="text-center"
            style={{
              background: "rgba(255, 242, 242, 0.8)",
              borderRadius: "12px",
            }}
          >
            <Space direction="vertical" align="center" className="w-full">
              <img
                src="/assets/images/logo.png"
                alt="Enjoy app"
                className="mb-4"
              />
              <Title level={4}>Enjoy app</Title>
              <Text>Enjoy Hamro Sathi by exploring many others features.</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Help;
