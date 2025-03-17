import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Select,
  DatePicker,
  Spin,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  message,
  Input,
  Statistic,
  Modal,
  Form,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const CenterClassPayments = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("centerClassPayments");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchText, setSearchText] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const navigate = useNavigate();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updateForm] = Form.useForm();
  const [addForm] = Form.useForm();

  // Dữ liệu mẫu - thay thế bằng API call thực tế
  const mockData = {
    payments: [
      {
        id: 1,
        studentName: "Nguyễn Văn A",
        className: "Lớp Piano nâng cao A1",
        amount: 5000000,
        paidAmount: 5000000,
        remainingAmount: 0,
        status: "completed", // đã thanh toán đủ
        dueDate: "2024-03-20",
      },
      {
        id: 2,
        studentName: "Trần Thị B",
        className: "Lớp Guitar cơ bản B2",
        amount: 3000000,
        paidAmount: 300000, // đã đóng 10% học phí
        remainingAmount: 2700000,
        status: "deposit", // đã đóng 10% học phí
        dueDate: "2024-03-25",
      },
      {
        id: 3,
        studentName: "Lê Văn C",
        className: "Lớp Violin cơ bản C1",
        amount: 4500000,
        paidAmount: 450000, // đã đóng 10% học phí
        remainingAmount: 4050000,
        status: "overdue", // quá hạn thanh toán (đã đóng 10% nhưng chưa thanh toán số còn lại)
        dueDate: "2024-03-18",
      },
    ],
    summary: {
      totalAmount: 12500000,
      totalPaid: 5750000,
      totalRemaining: 6750000,
    },
  };

  useEffect(() => {
    fetchPaymentData();
  }, [dateRange, paymentStatus]);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Trong thực tế, bạn sẽ gọi API thực tế ở đây
      setTimeout(() => {
        setPaymentData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải dữ liệu thanh toán");
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    message.success("Đã xuất báo cáo thành công!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "deposit":
        return "processing";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Đã thanh toán đủ";
      case "deposit":
        return "Đã đóng 10% học phí";
      case "overdue":
        return "Quá hạn thanh toán";
      default:
        return "Chưa thanh toán";
    }
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Lớp học",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Tổng học phí",
      dataIndex: "amount",
      key: "amount",
      render: (value) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: (value) => (
        <Text type={value > 0 ? "danger" : "success"}>
          {value.toLocaleString()} VND
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => (
        <Text type={moment().isAfter(date) && date ? "danger" : "secondary"}>
          {moment(date).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() =>
              navigate(`/manager/revenue/center-class-payments/${record.id}`)
            }
          >
            Chi tiết
          </Button>
          {record.status !== "completed" && (
            <Button type="link" onClick={() => handleUpdatePayment(record)}>
              Cập nhật
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    // Xử lý xem chi tiết
    console.log("View details:", record);
  };

  const handleUpdatePayment = (record) => {
    setSelectedPayment(record);
    updateForm.setFieldsValue({
      paidAmount: record.paidAmount,
      status: record.status,
    });
    setIsUpdateModalVisible(true);
  };

  const handleUpdateSubmit = (values) => {
    // Trong thực tế, gọi API để cập nhật
    const updatedPayment = {
      ...selectedPayment,
      ...values,
      remainingAmount: selectedPayment.amount - values.paidAmount,
    };
    console.log("Update payment:", updatedPayment);
    message.success("Đã cập nhật thanh toán thành công!");
    setIsUpdateModalVisible(false);
    updateForm.resetFields();
    fetchPaymentData();
  };

  const handleAddPayment = (values) => {
    const newPayment = {
      id: paymentData.payments.length + 1,
      studentName: values.studentName,
      className: values.className,
      amount: Number(values.amount),
      paidAmount: Number(values.paidAmount),
      remainingAmount: Number(values.amount) - Number(values.paidAmount),
      status:
        Number(values.paidAmount) === Number(values.amount)
          ? "completed"
          : "deposit",
      dueDate: values.dueDate.format("YYYY-MM-DD"),
    };

    setPaymentData({
      ...paymentData,
      payments: [...paymentData.payments, newPayment],
      summary: {
        totalAmount: paymentData.summary.totalAmount + Number(values.amount),
        totalPaid: paymentData.summary.totalPaid + Number(values.paidAmount),
        totalRemaining:
          paymentData.summary.totalRemaining +
          (Number(values.amount) - Number(values.paidAmount)),
      },
    });

    message.success("Đã thêm thanh toán mới");
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
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
        <ManagerHeader
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
          <div className="mb-6 flex justify-between items-center">
            <Title level={3}>Quản lý thanh toán học phí</Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
              >
                Thêm thanh toán mới
              </Button>
            </Space>
          </div>

          {/* Thống kê tổng quan */}
          {paymentData && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng học phí"
                    value={paymentData.summary.totalAmount}
                    suffix="VND"
                    formatter={(value) => `${value.toLocaleString()}`}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Đã thanh toán"
                    value={paymentData.summary.totalPaid}
                    suffix="VND"
                    formatter={(value) => `${value.toLocaleString()}`}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Chưa thanh toán"
                    value={paymentData.summary.totalRemaining}
                    suffix="VND"
                    formatter={(value) => `${value.toLocaleString()}`}
                    valueStyle={{ color: "#cf1322" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={8} lg={8}>
                <div className="flex items-center">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>Thời gian:</span>
                  <RangePicker
                    onChange={(dates) => setDateRange(dates)}
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={8}>
                <Search
                  placeholder="Tìm kiếm theo tên học viên hoặc lớp học"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <div className="flex justify-end">
                  <Space>
                    <Tooltip title="Làm mới">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchPaymentData}
                      />
                    </Tooltip>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportReport}
                    >
                      Xuất báo cáo
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Bảng thanh toán */}
          <Card>
            <Table
              columns={columns}
              dataSource={paymentData?.payments}
              loading={loading}
              rowKey="id"
              scroll={{ x: true }}
            />
          </Card>

          {/* Modal cập nhật thanh toán */}
          <Modal
            title="Cập nhật thanh toán"
            open={isUpdateModalVisible}
            onCancel={() => {
              setIsUpdateModalVisible(false);
              updateForm.resetFields();
            }}
            footer={null}
          >
            <Form
              form={updateForm}
              layout="vertical"
              onFinish={handleUpdateSubmit}
            >
              <Form.Item
                name="paidAmount"
                label="Số tiền đã thanh toán"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === "") {
                        return Promise.reject("Vui lòng nhập số tiền");
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || numValue < 0) {
                        return Promise.reject("Số tiền không hợp lệ");
                      }
                      if (numValue > selectedPayment?.amount) {
                        return Promise.reject(
                          "Số tiền không được vượt quá tổng học phí"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số tiền đã thanh toán"
                  suffix="VND"
                  min={0}
                  max={selectedPayment?.amount}
                  step={1000}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái thanh toán"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="deposit">Đã đóng 10% học phí</Option>
                  <Option value="completed">Đã thanh toán đủ</Option>
                  <Option value="overdue">Quá hạn thanh toán</Option>
                </Select>
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button
                    onClick={() => {
                      setIsUpdateModalVisible(false);
                      updateForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal thêm thanh toán mới */}
          <Modal
            title="Thêm thanh toán mới"
            open={isAddModalVisible}
            onCancel={() => {
              setIsAddModalVisible(false);
              addForm.resetFields();
            }}
            footer={null}
          >
            <Form
              form={addForm}
              layout="vertical"
              onFinish={handleAddPayment}
              initialValues={{
                dueDate: moment().add(7, "days"),
              }}
            >
              <Form.Item
                name="studentName"
                label="Học viên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên học viên" },
                ]}
              >
                <Input placeholder="Nhập tên học viên" />
              </Form.Item>

              <Form.Item
                name="className"
                label="Lớp học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên lớp học" },
                ]}
              >
                <Input placeholder="Nhập tên lớp học" />
              </Form.Item>

              <Form.Item
                name="amount"
                label="Tổng học phí"
                rules={[
                  { required: true, message: "Vui lòng nhập tổng học phí" },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === "") {
                        return Promise.reject("Vui lòng nhập tổng học phí");
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject("Số tiền không hợp lệ");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập tổng học phí"
                  suffix="VND"
                />
              </Form.Item>

              <Form.Item
                name="paidAmount"
                label="Số tiền đã thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số tiền đã thanh toán",
                  },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === "") {
                        return Promise.reject(
                          "Vui lòng nhập số tiền đã thanh toán"
                        );
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || numValue < 0) {
                        return Promise.reject("Số tiền không hợp lệ");
                      }
                      const totalAmount = addForm.getFieldValue("amount");
                      if (numValue > totalAmount) {
                        return Promise.reject(
                          "Số tiền không được vượt quá tổng học phí"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số tiền đã thanh toán"
                  suffix="VND"
                />
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="Hạn thanh toán"
                rules={[
                  { required: true, message: "Vui lòng chọn hạn thanh toán" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button
                    onClick={() => {
                      setIsAddModalVisible(false);
                      addForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Thêm thanh toán
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

export default CenterClassPayments;
