import React from "react";
import { Card, Button, List, Avatar, Typography } from "antd";

const { Title } = Typography;

const Blocking = () => {
  // Dummy data for blocked users
  const blockedUsers = [
    {
      id: 1,
      name: "John Smith",
      avatar: "/api/placeholder/64/64",
      blockDate: "2024-01-10",
    },
    {
      id: 2,
      name: "Emma Wilson",
      avatar: "/api/placeholder/64/64",
      blockDate: "2024-01-09",
    },
    {
      id: 3,
      name: "Michael Brown",
      avatar: "/api/placeholder/64/64",
      blockDate: "2024-01-08",
    },
    {
      id: 4,
      name: "Sarah Davis",
      avatar: "/api/placeholder/64/64",
      blockDate: "2024-01-07",
    },
  ];

  const handleUnblock = (userId) => {
    console.log(`Unblocked user with ID: ${userId}`);
    // Add your unblock logic here
  };

  return (
    <div className="p-4">
      <Card>
        <Title level={4}>Blocked Users</Title>
        <List
          itemLayout="horizontal"
          dataSource={blockedUsers}
          renderItem={(user) => (
            <List.Item
              actions={[
                <Button
                  key="unblock"
                  type="primary"
                  onClick={() => handleUnblock(user.id)}
                >
                  Unblock
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={user.avatar} />}
                title={user.name}
                description={`Blocked since ${user.blockDate}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Blocking;
