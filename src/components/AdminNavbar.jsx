import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { FaGamepad } from "react-icons/fa";

const { Sider } = Layout;

const AdminNavbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  const menuItems = [
    {
      key: "user",
      icon: <UserOutlined />,
      label: "User Details",
      onClick: () => navigate("/admin/user"),
    },
    {
      key: "games",
      icon: <FaGamepad style={{ fontSize: "16px" }} />,
      label: "Games",
      onClick: () => navigate("/creategame"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
      style: { marginTop: "auto" },
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/admin/user")) return "user";
    if (path.includes("/creategame")) return "games";
    return "user";
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      <div
        style={{
          height: "64px",
          margin: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            color: "#1890ff",
            fontSize: collapsed ? "20px" : "24px",
            margin: 0,
          }}
        >
          {collapsed ? "A" : "Admin"}
        </h1>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{
          height: "calc(100% - 96px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    </Sider>
  );
};

export default AdminNavbar;
