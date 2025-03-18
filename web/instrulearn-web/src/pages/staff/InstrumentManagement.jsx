import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Form, Input, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;

const InstrumentManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("musical instrument-type");
  const [instruments, setInstruments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [form] = Form.useForm();

  const fetchInstruments = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/get-all"
      );
      if (response.data.isSucceed) {
        setInstruments(response.data.data);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhạc cụ.");
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  const handleAddOrUpdate = async (values) => {
    try {
      if (editingInstrument) {
        await axios.put(
          `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/update/${editingInstrument.typeId}`,
          values
        );
        message.success("Cập nhật nhạc cụ thành công!");
      } else {
        await axios.post(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/create",
          values
        );
        message.success("Thêm nhạc cụ mới thành công!");
      }
      fetchInstruments();
      setIsModalOpen(false);
      form.resetFields();
      setEditingInstrument(null);
    } catch (error) {
      message.error("Lỗi khi thêm/cập nhật nhạc cụ.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/delete/${id}`
      );
      message.success("Xóa nhạc cụ thành công!");
      fetchInstruments();
    } catch (error) {
      message.error("Lỗi khi xóa nhạc cụ.");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "typeId", key: "typeId" },
    { title: "Tên nhạc cụ", dataIndex: "typeName", key: "typeName" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingInstrument(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.typeId)}
          />
        </>
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
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalOpen(true);
              setEditingInstrument(null);
              form.resetFields();
            }}
          >
            Thêm Nhạc Cụ
          </Button>
          <Table
            columns={columns}
            dataSource={instruments}
            rowKey="typeId"
            className="mt-4"
          />
        </Content>
      </Layout>

      <Modal
        title={editingInstrument ? "Chỉnh sửa Nhạc Cụ" : "Thêm Nhạc Cụ"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="typeName"
            label="Tên nhạc cụ"
            rules={[{ required: true, message: "Vui lòng nhập tên nhạc cụ" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default InstrumentManagement;
