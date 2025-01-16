// src/components/Chat/UI/ChatTitle.jsx
import React, { useMemo } from "react";
import { Typography, Space, Badge, Tooltip } from "antd";
import { CheckCircleFilled, InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const ChatTitle = ({
  chat,
  isMe,
  showStatus = true,
  showLastMessage = false,
  showUnreadCount = true,
  size = "default",
  maxWidth,
  className = "",
  style = {},
}) => {
  // Size variants for the title
  const sizeStyles = {
    small: { fontSize: "14px" },
    default: { fontSize: "16px" },
    large: { fontSize: "18px" },
  };

  // Get display name and status
  const { displayName, status, lastMessage, unreadCount } = useMemo(() => {
    if (!chat) {
      return {
        displayName: "Unknown",
        status: "offline",
        lastMessage: null,
        unreadCount: 0,
      };
    }

    if (chat.isGroupChat) {
      return {
        displayName: chat.chatName,
        status: chat.users.some((u) => u.online) ? "active" : "offline",
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount || 0,
      };
    }

    const user = isMe(chat.users[0]._id) ? chat.users[1] : chat.users[0];
    return {
      displayName: `${user.firstName} ${user.lastName}`,
      status: user.online ? "active" : "offline",
      lastMessage: chat.lastMessage,
      unreadCount: chat.unreadCount || 0,
    };
  }, [chat, isMe]);

  // Format last message preview
  const lastMessagePreview = useMemo(() => {
    if (!lastMessage) return "No messages yet";

    if (lastMessage.contentType === "image") {
      return "🖼️ Image";
    }

    if (lastMessage.contentType === "file") {
      return "📎 File";
    }

    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  }, [lastMessage]);

  return (
    <Space
      direction="vertical"
      size={0}
      style={{ maxWidth, ...style }}
      className={className}
    >
      <Space align="center">
        <Text
          strong
          style={{
            ...sizeStyles[size],
            marginRight: showUnreadCount && unreadCount > 0 ? "8px" : 0,
          }}
        >
          <span
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {displayName}
          </span>
          {chat?.isGroupChat && (
            <Tooltip title="Group Chat">
              <TeamOutlined style={{ marginLeft: 4, opacity: 0.6 }} />
            </Tooltip>
          )}
        </Text>
        {showUnreadCount && unreadCount > 0 && (
          <Badge count={unreadCount} style={{ backgroundColor: "#52c41a" }} />
        )}
        {chat?.verified && (
          <Tooltip title="Verified">
            <CheckCircleFilled style={{ color: "#1890ff" }} />
          </Tooltip>
        )}
      </Space>

      {showStatus && (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {status === "active" ? "Active now" : "Last seen recently"}
        </Text>
      )}

      {showLastMessage && (
        <Text type="secondary" style={{ fontSize: "13px" }}>
          {lastMessagePreview}
        </Text>
      )}
    </Space>
  );
};
