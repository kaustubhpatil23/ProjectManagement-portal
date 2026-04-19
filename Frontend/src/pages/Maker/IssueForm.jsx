import React from "react";
import { Form, Input, Select, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const IssueForm = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("description", values.description);
    formData.append("project_id", values.project_id);
    formData.append("checker_id", values.checker_id);
    formData.append("criticality", values.criticality);

    if (values.attachments) {
      values.attachments.forEach((file) => {
        formData.append("files", file.originFileObj);
      });
    }

    try {
      await axios.post(`https://projectmanagement-portal-production.up.railway.app/api/issues`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Issue raised successfully!");
      form.resetFields();
    } catch (err) {
      message.error("Failed to raise issue.");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="project_id"
        label="Select Project"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a mapped project">
          {/* Map through user's projects here */}
          <Option value="1">Project Alpha</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="checker_id"
        label="Responsible Team (Checker)"
        rules={[{ required: true }]}
      >
        <Select placeholder="Assign a Checker">
          <Option value="2">John Doe (Checker)</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="criticality"
        label="Criticality"
        rules={[{ required: true }]}
      >
        <Select>
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
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="attachments"
        label="Upload Attachments"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload name="files" beforeUpload={() => false} multiple>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Submit Issue
      </Button>
    </Form>
  );
};

export default IssueForm;
