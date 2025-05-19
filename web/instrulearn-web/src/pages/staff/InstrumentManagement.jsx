import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Form, Input, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
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
        "https://instrulearnapplication.azurewebsites.net/api/CourseType/get-all"
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

  const checkNameExists = async (name) => {
    try {
      const existingInstruments = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/CourseType/get-all"
      );

      return existingInstruments.data.data.some(
        (instrument) =>
          instrument.courseTypeName.toLowerCase() === name.toLowerCase() &&
          (!editingInstrument ||
            instrument.courseTypeId !== editingInstrument.courseTypeId)
      );
    } catch (error) {
      console.error("Lỗi khi kiểm tra tên nhạc cụ:", error);
      return false;
    }
  };

  const handleAddOrUpdate = async (values) => {
    try {
      const isNameExists = await checkNameExists(values.courseTypeName);

      if (isNameExists) {
        form.setFields([
          {
            name: "courseTypeName",
            errors: ["Tên nhạc cụ này đã tồn tại!"],
          },
        ]);
        return;
      }

      if (editingInstrument) {
        await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/CourseType/update/${editingInstrument.courseTypeId}`,
          {
            courseTypeName: values.courseTypeName,
          }
        );
        message.success("Cập nhật nhạc cụ thành công!");
      } else {
        await axios.post(
          "https://instrulearnapplication.azurewebsites.net/api/CourseType/create",
          {
            courseTypeName: values.courseTypeName,
          }
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

  const columns = [
    { title: "ID", dataIndex: "courseTypeId", key: "courseTypeId" },
    {
      title: "Tên nhạc cụ",
      dataIndex: "courseTypeName",
      key: "courseTypeName",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingInstrument(record);
              form.setFieldsValue({
                courseTypeName: record.courseTypeName,
              });
              setIsModalOpen(true);
            }}
            style={{ marginRight: 8 }}
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
            rowKey="courseTypeId"
            className="mt-4"
          />
        </Content>
      </Layout>

      <Modal
        title={editingInstrument ? "Chỉnh sửa Nhạc Cụ" : "Thêm Nhạc Cụ"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="courseTypeName"
            label="Tên nhạc cụ"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhạc cụ" },
              { max: 50, message: "Tên nhạc cụ không được vượt quá 50 ký tự" },
              {
                validator: async (_, value) => {
                  if (value) {
                    const exists = await checkNameExists(value);
                    if (exists) {
                      throw new Error("Tên nhạc cụ này đã tồn tại!");
                    }
                  }
                },
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default InstrumentManagement;
