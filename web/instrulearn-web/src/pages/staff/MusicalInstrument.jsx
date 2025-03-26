import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Popconfirm,
  Tooltip,
  Card,
  Typography,
  Divider,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  BookOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;

const MusicalInstrument = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("instrument-management");

  // Fetch danh sách nhạc cụ
  const fetchInstruments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/get-all"
      );
      if (response.data?.isSucceed) {
        setInstruments(response.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách nhạc cụ");
      console.error("Error fetching instruments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  // Xử lý thêm mới nhạc cụ
  const handleAdd = () => {
    setEditingInstrument(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Xử lý chỉnh sửa nhạc cụ
  const handleEdit = (record) => {
    setEditingInstrument(record);
    form.setFieldsValue({
      majorName: record.majorName,
    });
    setModalVisible(true);
  };

  // Xử lý xóa nhạc cụ
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/delete/${id}`
      );
      if (response.data?.isSucceed) {
        message.success("Xóa nhạc cụ thành công");
        fetchInstruments();
      }
    } catch (error) {
      message.error("Không thể xóa nhạc cụ");
      console.error("Error deleting instrument:", error);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      if (editingInstrument) {
        // Update
        const response = await axios.put(
          `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/update/${editingInstrument.majorId}`,
          values
        );
        if (response.data?.isSucceed) {
          message.success("Cập nhật nhạc cụ thành công");
          setModalVisible(false);
          fetchInstruments();
        }
      } else {
        // Create
        const response = await axios.post(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/create",
          values
        );
        if (response.data?.isSucceed) {
          message.success("Thêm nhạc cụ thành công");
          setModalVisible(false);
          fetchInstruments();
        }
      }
    } catch (error) {
      message.error(
        editingInstrument
          ? "Không thể cập nhật nhạc cụ"
          : "Không thể thêm nhạc cụ"
      );
      console.error("Error submitting form:", error);
    }
  };

  // Thêm hàm xử lý cập nhật trạng thái
  const handleStatusChange = async (id, checked) => {
    try {
      const endpoint = checked
        ? `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/update-status-available/${id}`
        : `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/update-status-unavailable/${id}`;

      const response = await axios.put(endpoint);

      if (response.data?.isSucceed) {
        message.success(
          `Cập nhật trạng thái ${checked ? "hoạt động" : "khóa"} thành công`
        );
        fetchInstruments();
      } else {
        throw new Error("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      message.error("Không thể cập nhật trạng thái nhạc cụ");
      console.error("Error updating status:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "majorId",
      key: "majorId",
      width: 80,
    },
    {
      title: "Tên nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Space>
          <Switch
            checked={status === 1}
            onChange={(checked) => handleStatusChange(record.majorId, checked)}
            checkedChildren="Hoạt động"
            unCheckedChildren="Khóa"
          />
          <Tag color={status === 1 ? "green" : "red"}>
            {status === 1 ? "Đang hoạt động" : "Đã khóa"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhạc cụ này?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.majorId)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
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
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý nhạc cụ</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm nhạc cụ
              </Button>
            </div>
            <Divider />

            <Table
              columns={columns}
              dataSource={instruments}
              rowKey="majorId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} nhạc cụ`,
              }}
            />
          </Card>

          <Modal
            title={editingInstrument ? "Chỉnh sửa nhạc cụ" : "Thêm nhạc cụ mới"}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={500}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="majorName"
                label="Tên nhạc cụ"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhạc cụ" },
                ]}
              >
                <Input placeholder="Nhập tên nhạc cụ" />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    {editingInstrument ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MusicalInstrument;
