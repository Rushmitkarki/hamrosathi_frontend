import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Layout,
  Input,
  Button,
  Avatar,
  List,
  Modal,
  Upload,
  Drawer,
  Badge,
  Divider,
  Menu,
  Dropdown,
  message,
  Radio,
  Typography,
  Space,
  Card,
  Tooltip,
  Spin,
} from "antd";
import {
  SearchOutlined,
  SendOutlined,
  PlusOutlined,
  UserOutlined,
  PictureOutlined,
  FileOutlined,
  EllipsisOutlined,
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  CheckOutlined,
  SmileOutlined,
  PaperClipOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  allMessages,
  createChat,
  getAllFriendsApi,
  getChat,
  sendFileApi,
  sendMessage,
  createGroupChat,
  uploadGroupImage,
  updateGroupImage,
  updateGroupChat,
  removeUserFromGroup,
  addUserToGroup,
  leaveGroup,
  createNotification,
} from "../../apis/api";
import { Camera } from "lucide-react";
import ChatSidebar from "../../components/chat/ChatSidebar";
import GroupChatInfo from "./GroupChatInfo";

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Title, Text } = Typography;

const Chat = () => {
  const [messaging, setMessaging] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [chatType, setChatType] = useState("dm");
  const [searchPeople, setSearchPeople] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contentType, setContentType] = useState("text");
  const [imagePreview, setImagePreview] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupImageName, setGroupImageName] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [typingStates, setTypingStates] = useState({});
  const typingTimeouts = useRef({});

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Here you can handle the actual upload
      const formData = new FormData();
      formData.append("groupImage", file);
      // Uncomment and modify this based on your upload function
      uploadGroupImage(formData)
        .then((response) => {
          console.log("Group image uploaded:", response.data);
          setGroupImageName(response.data.imageName);
        })
        .catch((error) => {
          console.error("Error uploading group image:", error);
        });
    }
  };

  const handleGroupNameChange = (userId, chatId, newName) => {
    const data = {
      userId,
      chatId: chatId,
      newName: newName,
    };
    console.log("Group name data:", data);
    updateGroupChat(data)
      .then((response) => {
        console.log("Group name updated:", response.data);
        getChat()
          .then((response) => {
            setChats(response.data.chats || []);
          })

          .catch((error) => {
            console.error("Error fetching chats:", error);
          });
      })
      .catch((error) => {
        console.error("Error updating group name:", error);
      });
  };

  const handleGroupImageChange = (userId, chatId, imageName) => {
    const data = {
      userId,
      chatId: chatId,
      imageName: imageName,
    };
    console.log("Group image data:", data);
    updateGroupImage(data)
      .then((response) => {
        console.log("Group image updated:", response.data);
        getChat()
          .then((response) => {
            setChats(response.data.chats || []);
          })
          .catch((error) => {
            console.error("Error fetching chats:", error);
          });
      })
      .catch((error) => {
        console.error("Error updating group image:", error);
      });
  };

  const messagesEndRef = useRef(null);
  // Initialize Socket.IO connection

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      query: {
        id: JSON.parse(localStorage.getItem("user")).id, // Pass user ID to socket
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    newSocket.on("typingNow", (data) => {
      const { chatId, sender } = data;

      // Clear existing timeout for this chat/user if it exists
      if (typingTimeouts.current[`${chatId}-${sender}`]) {
        clearTimeout(typingTimeouts.current[`${chatId}-${sender}`]);
      }

      // Update typing state
      setTypingStates((prev) => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          [sender]: true,
        },
      }));

      // Set new timeout
      typingTimeouts.current[`${chatId}-${sender}`] = setTimeout(() => {
        setTypingStates((prev) => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            [sender]: false,
          },
        }));
      }, 3000);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    fetchMessages();
  }, [selectedChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      if (message.chatId === selectedChat?._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    getAllFriendsApi()
      .then((response) => {
        setFriends(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching friends:", error);
      });
  }, []);

  useEffect(() => {
    getChat()
      .then((response) => {
        setChats(response.data.chats || []);
      })
      .catch((error) => {
        console.error("Error fetching chats:", error);
      });
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSiderCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMessages = () => {
    allMessages(selectedChat._id)
      .then((response) => {
        setMessages(response.data.messages || []);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (file) => {
    const form = new FormData();
    form.append("file", file);
    console.log(file);
    // console.log("File uploaded:", form);
    sendFileApi(form)
      .then((response) => {
        console.log("File uploaded:", response.data);
        setMessaging(response.data.file);
        setContentType(response.data.type);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (messaging.trim()) {
      const data = {
        chatId: selectedChat._id,
        content: messaging,
        contentType: contentType,
      };

      // Emit the message to the server
      socket.emit("sendMessage", {
        ...data,
        sender: JSON.parse(localStorage.getItem("user")),
      });
      const notificationData = {
        sender: JSON.parse(localStorage.getItem("user")).id,
        receiver: selectedChat.isGroupChat
          ? selectedChat.users
              .filter(
                (user) =>
                  user._id !== JSON.parse(localStorage.getItem("user")).id
              )
              .map((user) => user._id)
          : isMe(selectedChat.users[0]._id)
          ? selectedChat.users[1]._id
          : selectedChat.users[0]._id,
        message: `${
          JSON.parse(localStorage.getItem("user")).firstName
        } sent you a message: ${messaging.substring(0, 30)}${
          messaging.length > 30 ? "..." : ""
        }`,
        type: "message",
        chatId: selectedChat._id,
      };

      // Update local state
      sendMessage(data).then((response) => {
        console.log("Message sent:", response.data);
        setMessaging("");
        fetchMessages();
      });
      createNotification(notificationData)
        .then((notifResponse) => {
          console.log("Notification created:", notifResponse.data);

          // Emit notification event through socket
          socket.emit("newNotification", {
            notification: notifResponse.data.notification,
            receivers: notificationData.receiver,
          });
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    }
  };

  // Handle typing events
  const handleTyping = () => {
    if (!selectedChat || !socket) return;

    socket.emit("typing", {
      chatId: selectedChat._id,
      sender: JSON.parse(localStorage.getItem("user")).firstName,
    });
  };

  // Function to get typing users for current chat
  const getTypingUsers = () => {
    if (!selectedChat || !typingStates[selectedChat._id]) return [];

    return Object.entries(typingStates[selectedChat._id])
      .filter(([userId, isTyping]) => isTyping)
      .map(([userId]) => userId);
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    const typingUsers = getTypingUsers();
    if (typingUsers.length === 0) return null;

    return (
      <div
        style={{
          padding: "8px 16px",
          background: "#f0f0f0",
          borderRadius: "16px",
          margin: "8px 0",
          maxWidth: "200px",
        }}
      >
        <Space>
          <Spin size="small" />
          <Text type="secondary" style={{ fontSize: "14px" }}>
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing...
          </Text>
        </Space>
      </div>
    );
  };

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;

    socket.on("typingNow", (data) => {
      if (data.receiver === JSON.parse(localStorage.getItem("user")).id) {
        console.log(`${data.sender} is typing...`);
        setIsTyping(true);
        setTypingUser(data.sender);
      }
    });

    return () => {
      socket.off("typingNow");
    };
  }, [socket]);

  // Fetch messages when a chat is selected
  // useEffect(() => {
  //   if (!selectedChat) return;

  //   fetchMessages();
  // }, [selectedChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateChat = () => {
    if (chatType === "group" && !groupName.trim()) {
      message.error("Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      message.error("Please select at least one user");
      return;
    }

    if (chatType === "dm" && selectedUsers.length > 1) {
      message.error("Please select only one user for direct message");
      return;
    }

    const newChat = {
      type: chatType,
      name: chatType === "group" ? groupName : selectedUsers[0].name,
      participants: selectedUsers,
      createdAt: new Date(),
    };

    if (chatType === "dm") {
      createChat({
        userId: selectedUsers[0]._id,
      })
        .then((response) => {
          console.log("Chat created:", response.data);
          message.success("Chat created successfully");
        })
        .catch((error) => {
          console.error("Error creating chat:", error);
          message.error("Failed to create chat");
        });
    }

    if (chatType === "group") {
      console.log("Group chat name:", groupImageName);
      createGroupChat({
        name: groupName,
        users: selectedUsers,
        groupImageName: groupImageName,
      })
        .then((response) => {
          console.log("Group chat created:", response.data);
          message.success("Group chat created successfully");
        })
        .catch((error) => {
          console.error("Error creating group chat:", error);
          message.error("Failed to create group chat");
        });
    }

    setShowNewChatModal(false);
    resetChatForm();
  };
  // group chat
  const handleCreateGroupChat = () => {
    if (!groupName.trim()) {
      message.error("Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      message.error("Please select at least one user");
      return;
    }

    const newChat = {
      type: "group",
      name: groupName,
      participants: selectedUsers,
      createdAt: new Date(),
    };

    createGroupChat({
      name: groupName,
      participants: selectedUsers,
    })
      .then((response) => {
        console.log("Group chat created:", response.data);
        message.success("Group chat created successfully");
      })
      .catch((error) => {
        console.error("Error creating group chat:", error);
        message.error("Failed to create group chat");
      });

    setShowNewChatModal(false);
    resetChatForm();
  };

  const resetChatForm = () => {
    setGroupName("");
    setSearchPeople("");
    setSelectedUsers([]);
    setChatType("dm");
  };

  const handleUserSelection = (user) => {
    if (chatType === "dm" && selectedUsers.length >= 1) {
      setSelectedUsers([user]);
    } else {
      const isSelected = selectedUsers.find((u) => u._id === user._id);
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleRemoveUser = (userId) => {
    removeUserFromGroup({
      chatId: selectedChat._id,
      userId,
    })
      .then((res) => {
        console.log("User removed from group:", res.data);
        message.success("User removed from group successfully");
        getChat()
          .then((response) => {
            setChats(response.data.chats || []);
            setSelectedChat(
              response.data.chats.find((chat) => chat._id === selectedChat._id)
            );
          })
          .catch((error) => {
            console.error("Error fetching chats:", error);
          });
      })
      .catch((error) => {
        console.error("Error removing user from group:", error);
      });
  };

  const handleAddUser = (userId) => {
    addUserToGroup({
      chatId: selectedChat._id,
      userId,
    })
      .then((res) => {
        console.log("User added to group:", res.data);
        message.success("User added to group successfully");
        getChat()
          .then((response) => {
            setChats(response.data.chats || []);
            setSelectedChat(
              response.data.chats.find((chat) => chat._id === selectedChat._id)
            );
          })
          .catch((error) => {
            console.error("Error fetching chats:", error);
          });
      })
      .catch((error) => {
        console.error("Error adding user to group:", error);
      });
  };

  const isMe = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id === id;
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => setShowProfileDrawer(true)}
      >
        Profile Settings
      </Menu.Item>
      <Menu.Item
        key="settings"
        icon={<EditOutlined />}
        onClick={() => setShowSettingsDrawer(true)}
      >
        Preferences
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  const chatMenu = (
    <Menu>
      <Menu.Item key="info" icon={<InfoCircleOutlined />}>
        Chat Info
      </Menu.Item>
      <Menu.Item key="mute" icon={<EditOutlined />}>
        Mute Notifications
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="block" icon={<UserAddOutlined />} danger>
        Block User
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        Delete Chat
      </Menu.Item>
    </Menu>
  );

  const renderSidebar = () => (
    <Sider
      width={320}
      theme="light"
      collapsed={siderCollapsed}
      collapsedWidth={isMobile ? 0 : 80}
      className="chat-sider"
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        overflow: "auto",
        borderRight: "1px solid #f0f0f0",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ padding: "20px" }}>
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Messages
          </Title>
          <Space>
            <Tooltip title="New Chat">
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => setShowNewChatModal(true)}
              />
            </Tooltip>
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Badge dot status="success">
                <Avatar
                  size={40}
                  src={`http://localhost:5000/profile_pictures/${
                    JSON.parse(localStorage.getItem("user")).profilePicture
                  }`}
                  style={{ cursor: "pointer" }}
                />
              </Badge>
            </Dropdown>
          </Space>
        </div>

        <Search
          placeholder="Search conversations..."
          allowClear
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        />

        <List
          className="chat-list"
          itemLayout="horizontal"
          dataSource={chats}
          renderItem={(item) => (
            <Card
              className="chat-card"
              bodyStyle={{ padding: "12px" }}
              style={{
                marginBottom: "8px",
                cursor: "pointer",
                borderRadius: "8px",
                backgroundColor:
                  selectedChat?._id === item._id ? "#e6f7ff" : "#fff",
                border:
                  selectedChat?._id === item._id
                    ? "1px solid #91d5ff"
                    : "1px solid #f0f0f0",
              }}
              onClick={() => setSelectedChat(item)}
            >
              <List.Item style={{ padding: 0 }}>
                <List.Item.Meta
                  avatar={
                    <Badge dot status={item.online ? "success" : "default"}>
                      <Avatar
                        size={48}
                        src={
                          item.isGroupChat
                            ? "http://localhost:5000/groups/" + item.groupImage
                            : isMe(item.users[0]._id)
                            ? item.users[1].profilePicture
                              ? `http://localhost:5000/profile_pictures/${item.users[1].profilePicture}`
                              : "/assets/images/default_profile.png"
                            : item.users[0].profilePicture
                            ? `http://localhost:5000/profile_pictures/${item.users[0].profilePicture}`
                            : "/assets/images/default_profile.png"
                        }
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>
                        {item.isGroupChat
                          ? item.chatName
                          : isMe(item.users[0]._id)
                          ? item.users[1].firstName +
                            " " +
                            item.users[1].lastName
                          : item.users[0].firstName +
                            " " +
                            item.users[0].lastName}
                      </Text>
                      {item.unreadCount > 0 && (
                        <Badge
                          count={item.unreadCount}
                          style={{ backgroundColor: "#52c41a" }}
                        />
                      )}
                    </Space>
                  }
                  description={
                    <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
                      {item.messages.length > 0
                        ? item.messages[item.messages.length - 1].text
                        : "No messages yet"}
                    </Text>
                  }
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {item.lastMessageTime}
                </Text>
              </List.Item>
            </Card>
          )}
        />
      </div>
    </Sider>
  );

  const renderChatArea = () => (
    <Layout
      style={{
        marginLeft: siderCollapsed ? (isMobile ? 0 : 80) : isMobile ? 0 : 320,
        transition: "margin-left 0.2s",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Header
        style={{
          padding: isMobile ? "0 16px" : "0 24px",
          background: "#fff",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          height: "auto",
          minHeight: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
        }}
      >
        <Space align="center" size={isMobile ? 8 : 16}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
              style={{ padding: 4 }}
            />
          )}
          <Space
            size={isMobile ? 8 : 16}
            style={{ maxWidth: isMobile ? "calc(100vw - 120px)" : "auto" }}
          >
            <Badge dot status={selectedChat?.online ? "success" : "default"}>
              <Avatar
                size={isMobile ? 40 : 46}
                src={
                  selectedChat && !selectedChat?.isGroupChat
                    ? isMe(selectedChat.users[0]._id)
                      ? selectedChat.users[1].profilePicture
                        ? `http://localhost:5000/profile_pictures/${selectedChat.users[1].profilePicture}`
                        : "/assets/images/default_profile.png"
                      : selectedChat.users[0].profilePicture
                      ? `http://localhost:5000/profile_pictures/${selectedChat.users[0].profilePicture}`
                      : "/assets/images/default_profile.png"
                    : `http://localhost:5000/groups/${selectedChat?.groupImage}` ||
                      ""
                }
                style={{ flexShrink: 0 }}
              />
            </Badge>
            <div
              style={{
                minWidth: 0,
                maxWidth: isMobile ? "calc(100vw - 180px)" : "400px",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedChat
                  ? selectedChat.isGroupChat
                    ? selectedChat.chatName
                    : isMe(selectedChat.users[0]._id)
                    ? selectedChat.users[1].firstName +
                      " " +
                      selectedChat.users[1].lastName
                    : selectedChat.users[0].firstName +
                      " " +
                      selectedChat.users[0].lastName
                  : "Select a chat"}
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  display: "block",
                }}
              >
                {selectedChat?.online ? "Active now" : "Last seen recently"}
              </Text>
            </div>
          </Space>
        </Space>

        {selectedChat && (
          <Space size={isMobile ? 4 : 8}>
            <Tooltip title="Chat Info">
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => setShowProfileDrawer(true)}
                style={{ padding: isMobile ? 8 : 12 }}
              />
            </Tooltip>
            <Dropdown overlay={chatMenu} trigger={["click"]}>
              <Button
                type="text"
                icon={<EllipsisOutlined />}
                style={{ padding: isMobile ? 8 : 12 }}
              />
            </Dropdown>
          </Space>
        )}
      </Header>

      <Content
        style={{
          padding: isMobile ? "16px" : "24px",
          overflow: "auto",
          background: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "12px" : "16px",
          height: "calc(100vh - 144px)",
          maxHeight: "calc(100vh - 140px)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "8px" : "12px",
            paddingBottom: "16px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent: isMe(msg.sender._id)
                  ? "flex-end"
                  : "flex-start",
                alignItems: "flex-end",
                gap: "8px",
                paddingLeft: isMe(msg.sender._id) ? "10%" : 0,
                paddingRight: isMe(msg.sender._id) ? 0 : "10%",
              }}
            >
              {!isMe(msg.sender._id) && (
                <Avatar
                  src={
                    msg.sender.profilePicture
                      ? `http://localhost:5000/profile_pictures/${msg.sender.profilePicture}`
                      : "/assets/images/default_profile.png"
                  }
                  size={isMobile ? 28 : 32}
                  style={{ flexShrink: 0 }}
                />
              )}
              <div
                style={{
                  maxWidth: "85%",
                  padding: isMobile ? "10px 12px" : "12px 16px",
                  borderRadius: isMe(msg.sender._id)
                    ? "16px 16px 0 16px"
                    : "16px 16px 16px 0",
                  background:
                    msg.contentType === "image"
                      ? ""
                      : isMe(msg.sender._id)
                      ? "#1890ff"
                      : "#fff",
                  color: msg.isUser ? "#fff" : "#000",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  wordBreak: "break-word",
                }}
              >
                {msg.contentType === "image" ? (
                  <img
                    src={
                      `http://localhost:5000/message_images/${msg.content}` ||
                      ""
                    }
                    alt="message"
                    style={{ maxWidth: "100%", borderRadius: "8px" }}
                  />
                ) : msg.contentType === "file" ? (
                  <a
                    href={`http://localhost:5000/messages_files/${msg.content}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileOutlined /> {msg.content}
                  </a>
                ) : (
                  msg.content
                )}
                <div
                  style={{
                    marginTop: "4px",
                    opacity: 0.7,
                    fontSize: isMobile ? "10px" : "12px",
                    textAlign: "right",
                  }}
                >
                  {msg.updatedAt}
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    opacity: 0.7,
                    fontSize: isMobile ? "10px" : "12px",
                    textAlign: "right",
                  }}
                >
                  {isMe(msg.sender._id) ? "You" : msg.sender.firstName}
                </div>
              </div>
            </div>
          ))}
          {renderTypingIndicator()}
          <div ref={messagesEndRef} />
        </div>
      </Content>

      <div
        style={{
          padding: isMobile ? "12px 16px" : "16px 24px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          width: "100%",
        }}
      >
        <Input.Group compact style={{ display: "flex" }}>
          <Space.Compact style={{ width: "100%" }}>
            <Upload
              showUploadList={false}
              customRequest={() => {
                handleFileUpload();
              }}
            >
              <Button
                icon={<PaperClipOutlined />}
                style={{ padding: isMobile ? "0 8px" : "0 12px" }}
              />
            </Upload>
            <Input
              style={{
                width: "calc(100% - 90px)",
                fontSize: isMobile ? "14px" : "15px",
              }}
              value={messaging}
              onChange={(e) => setMessaging(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Type your message..."
              suffix={
                <Space size={isMobile ? 8 : 12}>
                  <Tooltip title="Add emoji">
                    <SmileOutlined
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    />
                  </Tooltip>
                  <Tooltip title="Send files">
                    <Upload
                      beforeUpload={(file) => {
                        handleFileUpload(file);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button icon={<PaperClipOutlined />} className="mr-2" />
                    </Upload>
                  </Tooltip>
                </Space>
              }
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!messaging.trim()}
              style={{}}
            />
          </Space.Compact>
        </Input.Group>
      </div>
    </Layout>
  );
  return (
    <Layout
      style={{ minHeight: "100vh", overflow: "hidden" }}
      className="mt-20  flex flex-row"
      // Scrolling fixed
    >
      {renderSidebar()}
      {renderChatArea()}

      <Modal
        title={chatType === "group" ? "Create New Group" : "New Message"}
        open={showNewChatModal}
        onCancel={() => {
          setShowNewChatModal(false);
          resetChatForm();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowNewChatModal(false);
              resetChatForm();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="create"
            type="primary"
            onClick={handleCreateChat}
            disabled={
              (chatType === "group" && !groupName.trim()) ||
              selectedUsers.length === 0
            }
          >
            {chatType === "group" ? "Create Group" : "Start Chat"}
          </Button>,
        ]}
      >
        <div style={{ marginBottom: "16px" }}>
          <Radio.Group
            value={chatType}
            onChange={(e) => {
              setChatType(e.target.value);
              setSelectedUsers([]);
            }}
            style={{ marginBottom: "16px" }}
            buttonStyle="solid"
          >
            <Radio.Button value="dm">Direct Message</Radio.Button>
            <Radio.Button value="group">Group Chat</Radio.Button>
          </Radio.Group>
        </div>

        {chatType === "group" && (
          <>
            <div className="w-full max-w-md mx-auto">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="w-32 h-32 rounded-full mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-400">
                            Upload
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        <Search
          placeholder={`Search ${
            chatType === "group" ? "people to add" : "people"
          }...`}
          value={searchPeople}
          onChange={(e) => setSearchPeople(e.target.value)}
          style={{ marginBottom: "16px" }}
          prefix={<SearchOutlined />}
        />

        <List
          dataSource={friends}
          renderItem={(person) => (
            <List.Item
              onClick={() => handleUserSelection(person.friend)}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: selectedUsers.find(
                  (u) => u._id === person.friend._id
                )
                  ? "#e6f7ff"
                  : "transparent",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    dot
                    status={person.friend.online ? "success" : "default"}
                  >
                    <Avatar
                      src={
                        person.friend.profilePicture || "/api/placeholder/32/32"
                      }
                    />
                  </Badge>
                }
                title={
                  <Text strong>
                    {person.friend.firstName + " " + person.friend.lastName}
                  </Text>
                }
                description={
                  <Text type="secondary">
                    {person.friend.online ? "Online" : "Offline"}
                  </Text>
                }
              />
              {selectedUsers.find((u) => u._id === person.friend._id) && (
                <CheckOutlined style={{ color: "#1890ff" }} />
              )}
            </List.Item>
          )}
        />
      </Modal>
      {selectedChat && selectedChat.isGroupChat ? (
        <GroupChatInfo
          isOpen={showProfileDrawer}
          onClose={() => setShowProfileDrawer(false)}
          selectedChat={selectedChat}
          currentUserId={JSON.parse(localStorage.getItem("user")).id}
          onUpdateGroupImage={handleGroupImageChange}
          onUpdateGroupName={handleGroupNameChange}
          allUsers={friends}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
          onLeaveGroup={() => {
            leaveGroup({ chatId: selectedChat._id })
              .then((res) => {
                message.success(res.data.message);
                setSelectedChat(null);
                getChat()
                  .then((res) => setChats(res.data.chats))
                  .catch((err) => console.log(err));
                setShowProfileDrawer(false);
              })
              .catch((error) => {
                console.error("Error leaving group:", error);
              });
          }}
        />
      ) : (
        <Drawer
          title="Profile"
          placement="right"
          onClose={() => setShowProfileDrawer(false)}
          open={showProfileDrawer}
          width={320}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Badge
              dot
              status={selectedChat?.online ? "success" : "default"}
              offset={[-8, 8]}
            >
              <Avatar size={100} src="/api/placeholder/100/100" />
            </Badge>
            <Title level={4} style={{ marginTop: "16px", marginBottom: "4px" }}>
              {selectedChat
                ? selectedChat.isGroupChat
                  ? selectedChat.name
                  : isMe(selectedChat.users[0]._id)
                  ? selectedChat.users[1].firstName +
                    " " +
                    selectedChat.users[1].lastName
                  : selectedChat.users[0].firstName +
                    " " +
                    selectedChat.users[0].lastName
                : "Select a chat"}
            </Title>
            <Text type="secondary">
              {selectedChat?.online ? "Active now" : "Last seen recently"}
            </Text>
          </div>
          <Divider />
          <List>
            <List.Item>
              <List.Item.Meta
                title="Email"
                description={
                  selectedChat &&
                  (selectedChat.isGroupChat
                    ? "No email provided"
                    : isMe(selectedChat.users[0]._id)
                    ? selectedChat.users[1].email || "No email provided"
                    : selectedChat.users[0].email || "No email provided")
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="Phone"
                description={
                  selectedChat &&
                  (selectedChat.isGroupChat
                    ? "No phone number"
                    : isMe(selectedChat.users[0]._id)
                    ? selectedChat.users[1].phone || "No phone number"
                    : selectedChat.users[0].phone || "No phone number")
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="About"
                description={
                  selectedChat &&
                  (selectedChat.isGroupChat
                    ? "No description"
                    : isMe(selectedChat.users[0]._id)
                    ? selectedChat.users[1].about || "No description"
                    : selectedChat.users[0].about || "No description")
                }
              />
            </List.Item>
          </List>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button icon={<UserAddOutlined />} block>
              Add to Contacts
            </Button>
            <Button icon={<DeleteOutlined />} danger block>
              Block User
            </Button>
          </Space>
        </Drawer>
      )}
      <Drawer
        title="Settings"
        placement="right"
        onClose={() => setShowSettingsDrawer(false)}
        open={showSettingsDrawer}
        width={320}
      >
        <List>
          <List.Item>
            <List.Item.Meta
              title="Notifications"
              description="Manage notification preferences"
            />
            <Button type="link">Edit</Button>
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="Privacy"
              description="Control your privacy settings"
            />
            <Button type="link">Edit</Button>
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="Chat Theme"
              description="Customize chat appearance"
            />
            <Button type="link">Change</Button>
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="Media"
              description="Shared photos and files"
            />
            <Button type="link">View</Button>
          </List.Item>
          <Divider />
          <List.Item>
            <List.Item.Meta
              title="Clear Chat"
              description="Delete all messages"
            />
            <Button type="link" danger>
              Clear
            </Button>
          </List.Item>
        </List>
      </Drawer>
    </Layout>
  );
};

export default Chat;
