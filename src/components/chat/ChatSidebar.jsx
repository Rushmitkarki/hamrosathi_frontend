import React, { useState } from "react";
import { Search, Plus, User, Settings, LogOut } from "lucide-react";

const ChatSidebar = ({
  isMobile = false,
  siderCollapsed = false,
  chats = [],
  selectedChat = null,
  onChatSelect,
  onNewChat,
  onProfileClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Helper function to check if user is the message sender
  const isMe = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id === id;
  };

  const UserMenu = () => (
    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
        onClick={onProfileClick}
      >
        <User size={16} />
        <span>Profile Settings</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer">
        <Settings size={16} />
        <span>Preferences</span>
      </div>
      <div className="border-t border-gray-200" />
      <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-red-600">
        <LogOut size={16} />
        <span>Sign Out</span>
      </div>
    </div>
  );

  return (
    <div
      className={`h-screen fixed left-0 bg-white border-r border-gray-200 ${
        siderCollapsed ? (isMobile ? "w-0" : "w-20") : "w-80"
      } transition-all duration-200`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-semibold m-0">Messages</h4>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={onNewChat}
            >
              <Plus size={20} />
            </button>
            <div className="relative">
              <div
                className="relative cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src="/api/placeholder/40/40"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
              </div>
              {showUserMenu && <UserMenu />}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className={`p-3 rounded-lg cursor-pointer border ${
                selectedChat?._id === chat._id
                  ? "bg-blue-50 border-blue-200"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      chat.isGroupChat
                        ? `/api/placeholder/48/48`
                        : isMe(chat.users[0]._id)
                        ? `/api/placeholder/48/48`
                        : `/api/placeholder/48/48`
                    }
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {chat.isGroupChat
                        ? chat.chatName
                        : isMe(chat.users[0]._id)
                        ? `${chat.users[1].firstName} ${chat.users[1].lastName}`
                        : `${chat.users[0].firstName} ${chat.users[0].lastName}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 truncate">
                      {chat.messages.length > 0
                        ? chat.messages[chat.messages.length - 1].text
                        : "No messages yet"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
