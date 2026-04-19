import React, { useContext } from "react";
import { Button, Layout } from "antd";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const TopNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If no user is logged in, don't show the navbar
  if (!user) return null;

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "0 24px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <h2 style={{ margin: 0 }}>Project Portal</h2>

      <div>
        <span
          style={{ marginRight: "16px", fontWeight: "bold", color: "#1890ff" }}
        >
          Role: {user.role}
        </span>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </Header>
  );
};

export default TopNavbar;
