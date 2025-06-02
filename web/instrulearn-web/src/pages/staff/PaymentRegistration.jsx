import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Statistic,
  Row,
  Col,
  Button,
  Input,
  Modal,
  Form,
  InputNumber,
  Tooltip,
} from "antd";
import {
  DollarOutlined,
  SyncOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SettingOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;

const PaymentRegistration = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("payment-registration");
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/SystemConfiguration"
      );

      if (response.data.isSucceed) {
        setConfigurations(response.data.data);
      } else {
        message.error("Không thể tải dữ liệu phí");
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
      message.error("Không thể tải dữ liệu phí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleEdit = (record) => {
    form.setFieldsValue({
      key: record.key,
      value: record.value,
    });
    setEditingKey(record.key);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setEditingKey("");
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/SystemConfiguration/${values.key}`,
        {
          value: values.value.toString(),
        }
      );

      if (response.data.isSucceed) {
        setIsModalVisible(false);
        setEditingKey("");
        form.resetFields();
        fetchConfigurations();
        setSuccessModalVisible(true);
      } else {
        message.error(response.data.message || "Cập nhật phí thất bại");
      }
    } catch (error) {
      console.error("Error updating configuration:", error);
      message.error("Cập nhật phí thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên phí",
      dataIndex: "key",
      key: "key",
      width: 200,
      render: (text) => {
        const configNames = {
          RegistrationDepositAmount: "Phí đăng ký đơn",
        };
        return (
          <div className="flex items-center">
            <SettingOutlined className="mr-2 text-gray-500" />
            <span className="font-medium">{configNames[text] || text}</span>
          </div>
        );
      },
    },
    {
      title: "Giá phí",
      dataIndex: "value",
      key: "value",
      width: 150,
      render: (value) => (
        <div className="text-green-600 font-medium">
          {parseInt(value).toLocaleString("vi-VN")} VNĐ
        </div>
      ),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      width: 200,
      render: (date) => (
        <div className="flex items-center">
          <span>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <StaffSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="mb-6">
            <Title level={3}>
              <SettingOutlined className="mr-2" /> Quản lý phí đăng ký
            </Title>
          </div>

          {/* Thống kê tổng quan */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={12} md={8}>
              <Card
                className="h-full shadow-sm hover:shadow-md transition-all"
                bordered={false}
              >
                <Statistic
                  title={<Text strong>Phí đăng ký hiện tại</Text>}
                  value={
                    configurations.find(
                      (config) => config.key === "RegistrationDepositAmount"
                    )?.value || 0
                  }
                  precision={0}
                  valueStyle={{ color: "#1677ff" }}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                />
              </Card>
            </Col>
          </Row>

          {/* Danh sách phí */}
          <Card className="shadow-sm" bordered={false}>
            <div className="flex justify-between items-center mb-4">
              <Title level={5}>Danh sách phí đăng ký</Title>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={fetchConfigurations}
              >
                Làm mới dữ liệu
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={configurations}
              loading={loading}
              rowKey="key"
              pagination={false}
              size="middle"
            />
          </Card>

          {/* Modal chỉnh sửa */}
          <Modal
            title="Chỉnh sửa phí đăng ký"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} onFinish={handleSave} layout="vertical">
              <Form.Item
                name="key"
                label="Tên phí"
                rules={[{ required: true, message: "Vui lòng nhập tên phí" }]}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="value"
                label="Giá phí"
                rules={[
                  { required: true, message: "Vui lòng nhập giá phí" },
                  {
                    type: "number",
                    min: 10000,
                    max: 100000,
                    message: "Giá phí phải từ 10.000 đến 100.000",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={10000}
                  max={100000}
                />
              </Form.Item>
              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={handleCancel}>Hủy</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thay đổi
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal thành công */}
          <Modal
            open={successModalVisible}
            onCancel={() => setSuccessModalVisible(false)}
            footer={[
              <Button
                key="close"
                type="primary"
                onClick={() => setSuccessModalVisible(false)}
              >
                Đóng
              </Button>,
            ]}
            centered
          >
            <div style={{ textAlign: "center" }}>
              <CheckOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                Cập nhật phí thành công!
              </div>
              <div>Phí đăng ký đã được cập nhật.</div>
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PaymentRegistration;
