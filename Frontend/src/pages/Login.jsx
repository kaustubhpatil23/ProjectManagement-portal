import React, { useContext } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext"; // <-- NEW IMPORT

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // <-- GET LOGIN FUNCTION FROM CONTEXT

  const onFinish = async (values) => {
    try {
      const response = await api.post("/auth/login", values);
      const { token, user } = response.data;

      // <-- FIX: Use the context function instead of manual localStorage
      // This updates BOTH localStorage and the React State simultaneously!
      login(user, token);

      message.success("Login successful");

      // Redirect based on role
      if (user.role === "Admin") {
        navigate("/admin/users");
      } else if (user.role === "Maker") {
        navigate("/maker/dashboard");
      } else if (user.role === "Checker") {
        navigate("/checker/dashboard");
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}
    >
      <Card title="Portal Login" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
