import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Form, Input, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;

const SelfAssessmentManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("self-assessment");
  const [assessments, setAssessments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [form] = Form.useForm();

  const fetchAssessments = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/SelfAssessment/GetAll"
      );
      if (response.data.isSucceed) {
        setAssessments(response.data.data);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách tự đánh giá.");
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const checkDescriptionExists = async (description) => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/SelfAssessment/GetAll"
      );
      return response.data.data.some(
        (item) =>
          item.description.trim().toLowerCase() ===
            description.trim().toLowerCase() &&
          (!editingAssessment ||
            item.selfAssessmentId !== editingAssessment.selfAssessmentId)
      );
    } catch (error) {
      return false;
    }
  };

  const handleAddOrUpdate = async (values) => {
    try {
      const isExists = await checkDescriptionExists(values.description);
      if (isExists) {
        form.setFields([
          {
            name: "description",
            errors: ["Mô tả này đã tồn tại!"],
          },
        ]);
        return;
      }
      if (editingAssessment) {
        await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/SelfAssessment/Update/${editingAssessment.selfAssessmentId}`,
          {
            description: values.description,
          }
        );
        message.success("Cập nhật tự đánh giá thành công!");
      } else {
        await axios.post(
          "https://instrulearnapplication.azurewebsites.net/api/SelfAssessment/Create",
          {
            description: values.description,
          }
        );
        message.success("Thêm tự đánh giá mới thành công!");
      }
      fetchAssessments();
      setIsModalOpen(false);
      form.resetFields();
      setEditingAssessment(null);
    } catch (error) {
      message.error("Lỗi khi thêm/cập nhật tự đánh giá.");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "selfAssessmentId", key: "selfAssessmentId" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setEditingAssessment(record);
            form.setFieldsValue({
              description: record.description,
            });
            setIsModalOpen(true);
          }}
          style={{ marginRight: 8 }}
        />
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 bg-gray-50" style={{ marginTop: "64px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalOpen(true);
              setEditingAssessment(null);
              form.resetFields();
            }}
          >
            Thêm Tự Đánh Giá
          </Button>
          <Table
            columns={columns}
            dataSource={assessments}
            rowKey="selfAssessmentId"
            className="mt-4"
          />
        </Content>
      </Layout>
      <Modal
        title={editingAssessment ? "Chỉnh sửa Tự Đánh Giá" : "Thêm Tự Đánh Giá"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              { max: 50, message: "Mô tả không được vượt quá 50 ký tự" },
              {
                validator: async (_, value) => {
                  if (value) {
                    const exists = await checkDescriptionExists(value);
                    if (exists) {
                      throw new Error("Mô tả này đã tồn tại!");
                    }
                  }
                },
              },
            ]}
            validateTrigger="onChange,onBlur"
          >
            <Input maxLength={50} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SelfAssessmentManagement;
