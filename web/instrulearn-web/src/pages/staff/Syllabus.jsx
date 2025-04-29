import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Input,
  Space,
  Typography,
  Card,
  Modal,
  Form,
  Popconfirm,
  Tooltip,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const SyllabusManagement = () => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("syllabus-management");
  const [syllabuses, setSyllabuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState(null);

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const fetchSyllabuses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Syllabus/get-all"
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        const syllabusData = response.data.map((item) => item.data);
        setSyllabuses(syllabusData);
      } else {
        throw new Error("Không thể tải danh sách giáo trình");
      }
    } catch (error) {
      console.error("Error fetching syllabuses:", error);
      message.error("Không thể tải danh sách giáo trình");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Syllabus/create",
        values
      );
      if (response.data?.isSucceed) {
        message.success("Tạo giáo trình thành công");
        setModalVisible(false);
        form.resetFields();
        fetchSyllabuses();
      } else {
        throw new Error(response.data?.message || "Tạo giáo trình thất bại");
      }
    } catch (error) {
      console.error("Error creating syllabus:", error);
      message.error("Tạo giáo trình thất bại");
    }
  };

  const handleUpdate = async (values) => {
    try {
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Syllabus/${editingSyllabus.syllabusId}/`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (response.data?.isSucceed) {
        message.success("Cập nhật giáo trình thành công");
        setModalVisible(false);
        form.resetFields();
        setEditingSyllabus(null);
        fetchSyllabuses();
      } else {
        throw new Error(
          response.data?.message || "Cập nhật giáo trình thất bại"
        );
      }
    } catch (error) {
      console.error("Error updating syllabus:", error);
      message.error(
        "Cập nhật giáo trình thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDelete = async (syllabusId) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication.azurewebsites.net/api/Syllabus/${syllabusId}`
      );
      if (response.data?.isSucceed) {
        message.success("Xóa giáo trình thành công");
        fetchSyllabuses();
      } else {
        throw new Error(response.data?.message || "Xóa giáo trình thất bại");
      }
    } catch (error) {
      console.error("Error deleting syllabus:", error);
      message.error("Xóa giáo trình thất bại");
    }
  };

  const showModal = (syllabus = null) => {
    setEditingSyllabus(syllabus);
    if (syllabus) {
      form.setFieldsValue({
        syllabusName: syllabus.syllabusName,
        syllabusDescription: syllabus.syllabusDescription,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSyllabus) {
        await handleUpdate(values);
      } else {
        await handleCreate(values);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const columns = [
    {
      title: "Tên giáo trình",
      dataIndex: "syllabusName",
      key: "syllabusName",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "syllabusDescription",
      key: "syllabusDescription",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              className="bg-blue-500 hover:bg-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa giáo trình này?"
            onConfirm={() => handleDelete(record.syllabusId)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                className="bg-red-500 hover:bg-red-600"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredSyllabuses = syllabuses.filter((syllabus) =>
    syllabus.syllabusName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
          className="p-6 min-h-screen bg-gray-50"
          style={{ marginTop: "64px" }}
        >
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="flex items-center">
                <BookOutlined className="mr-2" />
                Quản lý giáo trình
              </Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm theo tên giáo trình..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchSyllabuses} />
                </Tooltip>
                <Tooltip title="Thêm giáo trình mới">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                    className="bg-green-500 hover:bg-green-600"
                  />
                </Tooltip>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredSyllabuses}
                rowKey="syllabusId"
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} giáo trình`,
                  defaultPageSize: 20,
                }}
                size="middle"
              />
            </Spin>
          </Card>
        </Content>
      </Layout>

      <Modal
        title={editingSyllabus ? "Chỉnh sửa giáo trình" : "Thêm giáo trình mới"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSyllabus(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="syllabusName"
            label="Tên giáo trình"
            rules={[
              { required: true, message: "Vui lòng nhập tên giáo trình" },
            ]}
          >
            <Input placeholder="Nhập tên giáo trình" />
          </Form.Item>
          <Form.Item
            name="syllabusDescription"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả giáo trình" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SyllabusManagement;
