import React, { useMemo } from "react";
import { Avatar, Badge, Tooltip } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";

export const ChatAvatar = ({
  chat,
  isMe,
  size = "default",
  showStatus = true,
  showTooltip = false,
  className = "",
  style = {},
  onClick,
}) => {
  // Size mapping for different preset sizes
  const sizeMap = {
    small: 32,
    default: 40,
    large: 48,
    xlarge: 64,
  };

  const avatarSize = typeof size === "string" ? sizeMap[size] : size;

  // Get the appropriate image source and name
  const { imageSrc, displayName } = useMemo(() => {
    if (!chat) {
      return {
        imageSrc: null,
        displayName: "Unknown",
      };
    }

    if (chat.isGroupChat) {
      return {
        imageSrc: chat.groupImage
          ? `http://localhost:5000/groups/${chat.groupImage}`
          : null,
        displayName: chat.chatName || "Group Chat",
      };
    }

    const user = isMe(chat.users[0]._id) ? chat.users[1] : chat.users[0];
    return {
      imageSrc: user.profilePicture
        ? `http://localhost:5000/profile_pictures/${user.profilePicture}`
        : null,
      displayName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : "User",
    };
  }, [chat, isMe]);

  // Determine online status
  const onlineStatus = useMemo(() => {
    if (!chat) return "default";

    if (chat.isGroupChat) {
      return chat.users.some((user) => user.online) ? "success" : "default";
    }

    const user = isMe(chat.users[0]._id) ? chat.users[1] : chat.users[0];
    return user.online ? "success" : "default";
  }, [chat, isMe]);

  // Basic avatar with fallback
  const avatarElement = (
    <Avatar
      size={avatarSize}
      src={imageSrc}
      icon={chat?.isGroupChat ? <TeamOutlined /> : <UserOutlined />}
      style={{
        backgroundColor: !imageSrc
          ? chat?.isGroupChat
            ? "#87d068"
            : "#1890ff"
          : undefined,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      className={className}
      onClick={onClick}
    />
  );

  // Add badge if status should be shown
  const badgedAvatar = showStatus ? (
    <Badge dot status={onlineStatus} offset={[-4, 4]}>
      {avatarElement}
    </Badge>
  ) : (
    avatarElement
  );

  // Add tooltip if requested
  return showTooltip ? (
    <Tooltip title={displayName}>{badgedAvatar}</Tooltip>
  ) : (
    badgedAvatar
  );
};

export default ChatAvatar;
