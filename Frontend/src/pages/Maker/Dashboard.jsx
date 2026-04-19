import React, { useState, useEffect } from "react";
import {
  Tabs,
  Select,
  Table,
  Tag,
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  Modal,
  Dropdown,
} from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import api from "../../services/api";

// New Imports for Export functionality
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Option } = Select;
const { TextArea } = Input;

const MakerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [checkers, setCheckers] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [form] = Form.useForm();

  const [attachments, setAttachments] = useState([]);
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const projRes = await api.get("/issues/maker/projects");
      setProjects(projRes.data);

      const checkerRes = await api.get("/issues/checkers");
      setCheckers(checkerRes.data);

      if (projRes.data.length > 0) {
        const firstProjectId = projRes.data[0].id;
        setSelectedProject(firstProjectId);
        fetchIssues(firstProjectId);
      }
    } catch (err) {
      message.error("Failed to load initial data");
    }
  };

  const fetchIssues = async (projectId) => {
    try {
      const res = await api.get(`/issues/maker/issues/${projectId}`);
      setIssues(res.data);
    } catch (err) {
      message.error("Failed to load issues for this project");
    }
  };

  const handleOpenModal = async (issue) => {
    // If you are in Maker/Dashboard, use setModalData(issue)
    // If you are in Checker/Dashboard, use setSelectedIssue(issue)
    setModalData(issue);
    setIsModalVisible(true);

    try {
      const res = await api.get(`/issues/${issue.id}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.error("Failed to load attachments");
    }
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
    fetchIssues(value);
  };

  // --- EXPORT FUNCTIONS ---

  // 1. Export to Excel (XLSX)
  const exportToExcel = () => {
    if (issues.length === 0) return message.warning("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(issues);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");
    XLSX.writeFile(workbook, "Issues_Report.xlsx");
  };

  // 2. Export to CSV
  const exportToCSV = () => {
    if (issues.length === 0) return message.warning("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(issues);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");
    XLSX.writeFile(workbook, "Issues_Report.csv", { bookType: "csv" });
  };

  // 3. Export to PDF
  const exportToPDF = () => {
    if (issues.length === 0) return message.warning("No data to export");
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.text("Project Issues Report", 14, 15);

    // Define the table columns and map the data
    const tableColumn = [
      "Ticket No",
      "Description",
      "Criticality",
      "Status",
      "Created At",
    ];
    const tableRows = [];

    issues.forEach((issue) => {
      const issueData = [
        issue.ticket_number,
        issue.description,
        issue.criticality,
        issue.status,
        new Date(issue.created_at).toLocaleDateString(), // Format the date nicely
      ];
      tableRows.push(issueData);
    });

    // Generate the table
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("Issues_Report.pdf");
  };

  // Dropdown menu items for the Export button
  const exportMenuItems = [
    { key: "1", label: "Export as Excel (.xlsx)", onClick: exportToExcel },
    { key: "2", label: "Export as CSV (.csv)", onClick: exportToCSV },
    { key: "3", label: "Export as PDF (.pdf)", onClick: exportToPDF },
  ];

  // --- END EXPORT FUNCTIONS ---

  const onFinish = async (values) => {
    if (!selectedProject)
      return message.warning("Please select a project first!");

    const formData = new FormData();
    formData.append("project_id", selectedProject);
    formData.append("checker_id", values.checker_id);
    formData.append("criticality", values.criticality);
    formData.append("description", values.description);

    if (values.attachments) {
      values.attachments.forEach((file) => {
        formData.append("files", file.originFileObj);
      });
    }

    try {
      await api.post("/issues", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Issue raised successfully!");
      form.resetFields();
      fetchIssues(selectedProject);
    } catch (err) {
      message.error("Failed to raise issue.");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const columns = [
    // {
    //   title: "Ticket No",
    //   dataIndex: "ticket_number",
    //   key: "ticket_number",
    //   render: (text, record) => (
    //     <a
    //       onClick={() => {
    //         setModalData(record);
    //         setIsModalVisible(true);
    //       }}
    //     >
    //       {text}
    //     </a>
    //   ),
    // },
    // Find your columns array and update the ticket_number render:
    {
      title: "Ticket No",
      dataIndex: "ticket_number",
      key: "ticket_number",
      render: (text, record) => (
        <a onClick={() => handleOpenModal(record)}>{text}</a>
      ),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Criticality",
      dataIndex: "criticality",
      key: "criticality",
      render: (val) => (
        <Tag color={val === "High" ? "red" : "orange"}>{val}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Open" ? "green" : status === "Resolved" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const projectSelector = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <strong style={{ color: "#888" }}>Active Project:</strong>
      <Select
        style={{ width: 200 }}
        placeholder="Select a mapped project"
        value={selectedProject}
        onChange={handleProjectChange}
      >
        {projects.map((p) => (
          <Option key={p.id} value={p.id}>
            {p.name}
          </Option>
        ))}
      </Select>
    </div>
  );

  const tabItems = [
    {
      key: "1",
      label: "Dashboard",
      children: (
        <>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* New Export Dropdown Button */}
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button type="primary" icon={<DownloadOutlined />}>
                Export Report
              </Button>
            </Dropdown>
          </div>
          <Table columns={columns} dataSource={issues} rowKey="id" />
        </>
      ),
    },
    {
      key: "2",
      label: "Add / Edit Issue",
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="checker_id"
            label="Responsible Team (Checker)"
            rules={[{ required: true }]}
          >
            <Select placeholder="Assign a Checker">
              {checkers.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="criticality"
            label="Criticality"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Criticality">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} placeholder="Describe the issue in detail..." />
          </Form.Item>
          <Form.Item
            name="attachments"
            label="Upload Attachments"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload name="files" beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Click to Upload Files</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" disabled={!selectedProject}>
            Submit Issue
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          tabBarExtraContent={projectSelector}
        />
      </Card>

      <Modal
        title={`Ticket Details: ${modalData?.ticket_number}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>
          <b>Description:</b> {modalData?.description}
        </p>
        <p>
          <b>Checker Comment:</b>{" "}
          {modalData?.checker_comment || <i>No comments yet</i>}
        </p>

        <Form
          layout="vertical"
          initialValues={{ status: modalData?.status }}
          onFinish={async (values) => {
            try {
              await api.put(`/issues/${modalData.id}/status`, {
                status: values.status,
              });
              message.success("Status updated!");
              setIsModalVisible(false);
              fetchIssues(selectedProject);
            } catch (err) {
              message.error("Failed to update status");
            }
          }}
        >
          <Form.Item name="status" label="Update Status">
            <Select>
              <Option value="Open">Open</Option>
              <Option value="Closed by Testing">Closed by Testing</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
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
                const fileUrl = `http://localhost:5001/${cleanPath}`;

                return (
                  <li key={file.id}>
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      {file.file_name}
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

export default MakerDashboard;
