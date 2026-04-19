import React, { useState, useEffect } from "react";
// import { Tabs, Form, Input, Select, Button, message, Card } from "antd";
// import api from "../../services/api";

// Added Table, Popconfirm, Space, and Tag
import {
  Tabs,
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Table,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import api from "../../services/api";

const { Option } = Select;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [allIssues, setAllIssues] = useState([]);

  // Form hooks to allow us to clear the fields after submission
  const [userForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [mappingForm] = Form.useForm();

  // Fetch users and projects on load for the mapping dropdowns
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const userRes = await api.get("/admin/users");
      setUsers(userRes.data);

      const projectRes = await api.get("/admin/projects");
      setProjects(projectRes.data);

      const issueRes = await api.get("/admin/issues");
      setAllIssues(issueRes.data);
    } catch (error) {
      message.error("Failed to load users and projects.");
    }
  };

  // <-- NEW: Function to delete one ticket
  const handleDeleteSingle = async (id) => {
    try {
      await api.delete(`/admin/issues/${id}`);
      message.success("Ticket deleted");
      fetchDropdownData(); // Refresh the table
    } catch (err) {
      message.error("Failed to delete ticket");
    }
  };

  // <-- NEW: Function to delete ALL tickets
  const handleDeleteAll = async () => {
    try {
      await api.delete("/admin/issues");
      message.success("All tickets cleared!");
      fetchDropdownData(); // Refresh the table
    } catch (err) {
      message.error("Failed to clear tickets");
    }
  };

  // <-- NEW: Columns for the Admin Ticket Table
  const issueColumns = [
    { title: "Ticket No", dataIndex: "ticket_number", key: "ticket_number" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete this ticket?"
          description="Are you sure you want to delete this ticket? This cannot be undone."
          onConfirm={() => handleDeleteSingle(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleCreateUser = async (values) => {
    try {
      await api.post("/admin/users", values);
      message.success("User Created!");
      userForm.resetFields(); // Clear the form
      fetchDropdownData(); // Refresh the dropdown lists so the new user appears
    } catch (err) {
      message.error("Failed to create user");
    }
  };

  const handleCreateProject = async (values) => {
    try {
      await api.post("/admin/projects", values);
      message.success("Project Created!");
      projectForm.resetFields(); // Clear the form
      fetchDropdownData(); // Refresh the dropdown lists so the new project appears
    } catch (err) {
      message.error("Failed to create project");
    }
  };

  const handleMapping = async (values) => {
    try {
      await api.post("/admin/map", values);
      message.success("Mapped successfully!");
      mappingForm.resetFields(); // Clear the form after mapping
    } catch (err) {
      message.error("Mapping failed");
    }
  };

  const items = [
    {
      key: "1",
      label: "Create User",
      children: (
        <Form form={userForm} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select a role">
              <Option value="Maker">Maker</Option>
              <Option value="Checker">Checker</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Create User
          </Button>
        </Form>
      ),
    },
    {
      key: "2",
      label: "Create Project",
      children: (
        <Form
          form={projectForm}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Create Project
          </Button>
        </Form>
      ),
    },
    {
      key: "3",
      label: "Map User to Project",
      children: (
        <Form form={mappingForm} layout="vertical" onFinish={handleMapping}>
          <Form.Item
            name="user_id"
            label="Select User"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a user to map">
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="project_id"
            label="Select Project"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a project">
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Map User
          </Button>
        </Form>
      ),
    },
    // Add this inside the `items` array in AdminPanel.jsx
    {
      key: "4",
      label: "Manage Tickets",
      children: (
        <div>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Global Ticket Management</h3>

            <Popconfirm
              title="CLEAR ALL TICKETS?"
              description="WARNING: This will permanently delete EVERY ticket in the database. Are you absolutely sure?"
              onConfirm={handleDeleteAll}
              okText="Yes, Wipe Everything"
              cancelText="No, Cancel"
              okButtonProps={{ danger: true }} // Makes the confirmation button red
            >
              <Button type="primary" danger>
                Clear Entire Dashboard
              </Button>
            </Popconfirm>
          </div>

          <Table
            columns={issueColumns}
            dataSource={allIssues}
            rowKey="id"
            size="small"
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Admin Control Panel">
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default AdminPanel;
