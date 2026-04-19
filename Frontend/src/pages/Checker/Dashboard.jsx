import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Modal,
  Select,
  Input,
  Form,
  List,
} from "antd";
import api from "../../services/api";

const { Option } = Select;
const { TextArea } = Input;

const CheckerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues/checker");
      setIssues(res.data);
    } catch (err) {
      message.error("Failed to load issues");
    }
  };

  const openModal = async (issue) => {
    setSelectedIssue(issue);
    setIsModalVisible(true);
    form.setFieldsValue({
      status: issue.status,
      checker_comment: issue.checker_comment || "",
    });

    // Fetch attachments
    try {
      const res = await api.get(`/issues/${issue.id}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.error("Failed to load attachments");
    }
  };

  const handleOpenModal = async (issue) => {
    // If you are in Maker/Dashboard, use setModalData(issue)
    // If you are in Checker/Dashboard, use setSelectedIssue(issue)
    setSelectedIssue(issue);
    setIsModalVisible(true);

    try {
      const res = await api.get(`/issues/${issue.id}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.error("Failed to load attachments");
    }
  };

  const handleUpdate = async (values) => {
    if (values.status === "Resolved" && !values.checker_comment) {
      return message.error("You must add a comment to resolve this issue!");
    }

    try {
      await api.put(`/issues/${selectedIssue.id}/status`, values);
      message.success("Ticket updated successfully!");
      setIsModalVisible(false);
      fetchIssues();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to update ticket");
    }
  };

const columns = [
        { 
          title: 'Ticket No', 
          dataIndex: 'ticket_number', 
          key: 'ticket_number',
          render: (text, record) => (
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault(); // <-- This stops the browser from changing the URL!
                openModal(record);
              }}
            >
              {text}
            </a>
          )
        },
        { title: 'Criticality', dataIndex: 'criticality', key: 'criticality',
          render: val => <Tag color={val === 'High' ? 'red' : 'orange'}>{val}</Tag>
        },
        { title: 'Status', dataIndex: 'status', key: 'status',
          render: val => <Tag color={val === 'Resolved' ? 'blue' : val === 'In Progress' ? 'purple' : 'green'}>{val}</Tag>
        }
    ];

  return (
    <div style={{ padding: "24px" }}>
      <h2>Checker Dashboard</h2>
      <Table columns={columns} dataSource={issues} rowKey="id" />

      <Modal
        title={`Process Ticket: ${selectedIssue?.ticket_number}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <div
          style={{
            marginBottom: 20,
            padding: 15,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <h4>Description from Maker:</h4>
          <p>{selectedIssue?.description}</p>
          {attachments.length > 0 && (
            <div>
              <h4>Attachments:</h4>
              <ul>
                {attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`https://projectmanagement-portal-production.up.railway.app/${a.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="checker_comment"
            label="Checker Comments (Required for Resolution)"
          >
            <TextArea
              rows={4}
              placeholder="Type your needful comments here..."
            />
          </Form.Item>
          <Form.Item name="status" label="Update Status">
            <Select>
              <Option value="In Progress">In Progress</Option>
              <Option value="Resolved">Resolved</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Update Ticket
          </Button>
        </Form>

        {/* *************** */}

        {/* Paste this inside your <Modal> above the Form */}
        {attachments.length > 0 && (
          <div
            style={{
              marginTop: "15px",
              marginBottom: "15px",
              padding: "10px",
              background: "#f9f9f9",
              borderRadius: "5px",
            }}
          >
            <b>Attached Files:</b>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {attachments.map((file) => {
                // Fix Windows path formatting
                const cleanPath = file.file_path.replace(/\\/g, "/");
                // Ensure this port matches your backend port (5000 or 5001)
                const fileUrl = `https://projectmanagement-portal-production.up.railway.app/${cleanPath}`;

                return (
<li key={a.id}>
  <a 
    href={`https://projectmanagement-portal-production.up.railway.app/${a.file_path.replace(/\\/g, '/').replace(/^\/+/, '')}`} 
    target="_blank" 
    rel="noreferrer"
  >
    {a.file_name}
  </a>
</li>
                );
              })}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CheckerDashboard;
