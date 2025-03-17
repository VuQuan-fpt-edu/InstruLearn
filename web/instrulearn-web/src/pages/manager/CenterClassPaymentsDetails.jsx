import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Descriptions,
  Timeline,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const CenterClassPaymentDetails = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - thay thế bằng API call thực tế
  const mockPaymentDetail = {
    studentInfo: {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0123456789",
      email: "nguyenvana@gmail.com",
    },
    classInfo: {
      name: "Lớp Piano nâng cao A1",
      instrument: "Piano",
      schedule: "Thứ 2, 4, 6 - 18:00-19:30",
      startDate: "2024-03-01",
      endDate: "2024-05-30",
      teacher: "Trần Văn B",
    },
    paymentInfo: {
      totalAmount: 5000000,
      paidAmount: 500000, // Mặc định là 10% học phí
      remainingAmount: 4500000,
      status: "deposit", // Mặc định là đã đóng 10%
      dueDate: "2024-03-20",
    },
    paymentHistory: [
      {
        id: 1,
        amount: 500000,
        paymentDate: "2024-03-01",
        paymentMethod: "wallet",
        type: "deposit",
        note: "Thanh toán phí giữ chỗ (10%)",
        staff: "Lê Thị C",
      },
      {
        id: 2,
        amount: 2500000,
        paymentDate: "2024-03-10",
        paymentMethod: "cash",
        type: "tuition",
        note: "Thanh toán học phí đợt 1",
        staff: "Lê Thị C",
      },
    ],
  };

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const fetchPaymentDetail = async () => {
    setLoading(true);
    try {
      // API call thực tế sẽ được thay thế ở đây
      setTimeout(() => {
        setPaymentData(mockPaymentDetail);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error("Không thể tải thông tin chi tiết");
      setLoading(false);
    }
  };

  const handleAddPayment = (values) => {
    console.log("New payment:", values);
    message.success("Đã thêm thanh toán mới");
    setIsModalVisible(false);
    form.resetFields();
    fetchPaymentDetail();
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
        return "Đã đóng 10% học phí";
    }
  };

  const handleUpdatePayment = (record) => {
    setSelectedPayment(record);
    updateForm.setFieldsValue({
      amount: record.amount,
      paymentMethod: record.paymentMethod,
      staff: record.staff,
      paymentDate: moment(record.paymentDate),
      note: record.note,
    });
    setIsUpdateModalVisible(true);
  };

  const handleUpdateSubmit = (values) => {
    console.log("Update payment:", values);
    message.success("Đã cập nhật thanh toán thành công!");
    setIsUpdateModalVisible(false);
    updateForm.resetFields();
    fetchPaymentDetail();
  };

  const paymentHistoryColumns = [
    {
      title: "Ngày thanh toán",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Loại thanh toán",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "deposit" ? "purple" : "blue"}>
          {type === "deposit" ? "Phí giữ chỗ (10%)" : "Học phí"}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method, record) => {
        if (record.type === "deposit") {
          return "Thanh toán bằng ví";
        }
        return method === "cash" ? "Tiền mặt" : "Chuyển khoản";
      },
    },
    {
      title: "Nhân viên",
      dataIndex: "staff",
      key: "staff",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleUpdatePayment(record)}>
          Cập nhật
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="centerClassPayments"
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
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="mb-6 flex justify-between items-center">
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() =>
                  navigate("/manager/revenue/center-class-payments")
                }
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Chi tiết thanh toán
              </Title>
            </Space>
            {paymentData?.paymentInfo.remainingAmount > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Thêm thanh toán
              </Button>
            )}
          </div>

          {paymentData && (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Thông tin học viên" className="mb-4">
                    <Descriptions column={1}>
                      <Descriptions.Item label="Họ tên">
                        {paymentData.studentInfo.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {paymentData.studentInfo.phone}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {paymentData.studentInfo.email}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Thông tin lớp học" className="mb-4">
                    <Descriptions column={1}>
                      <Descriptions.Item label="Tên lớp">
                        {paymentData.classInfo.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nhạc cụ">
                        {paymentData.classInfo.instrument}
                      </Descriptions.Item>
                      <Descriptions.Item label="Lịch học">
                        {paymentData.classInfo.schedule}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giáo viên">
                        {paymentData.classInfo.teacher}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian">
                        {moment(paymentData.classInfo.startDate).format(
                          "DD/MM/YYYY"
                        )}{" "}
                        -{" "}
                        {moment(paymentData.classInfo.endDate).format(
                          "DD/MM/YYYY"
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Card title="Thông tin thanh toán" className="mb-4">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Tổng học phí"
                      value={paymentData.paymentInfo.totalAmount}
                      suffix="VND"
                      formatter={(value) => `${value.toLocaleString()}`}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Đã thanh toán"
                      value={paymentData.paymentInfo.paidAmount}
                      suffix="VND"
                      formatter={(value) => `${value.toLocaleString()}`}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Còn lại"
                      value={paymentData.paymentInfo.remainingAmount}
                      suffix="VND"
                      formatter={(value) => `${value.toLocaleString()}`}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>
                <div className="mt-4">
                  <Space>
                    <Text strong>Trạng thái: </Text>
                    <Tag color={getStatusColor(paymentData.paymentInfo.status)}>
                      {getStatusText(paymentData.paymentInfo.status)}
                    </Tag>
                  </Space>
                  <div className="mt-2">
                    <Text strong>Hạn thanh toán: </Text>
                    <Text
                      type={
                        moment().isAfter(paymentData.paymentInfo.dueDate)
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {moment(paymentData.paymentInfo.dueDate).format(
                        "DD/MM/YYYY"
                      )}
                    </Text>
                  </div>
                </div>
              </Card>

              <Card title="Lịch sử thanh toán">
                <Table
                  columns={paymentHistoryColumns}
                  dataSource={paymentData.paymentHistory}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </>
          )}

          <Modal
            title="Thêm thanh toán mới"
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddPayment}
              initialValues={{
                paymentDate: moment(),
                paymentMethod: "cash", // Mặc định là tiền mặt
              }}
            >
              <Form.Item
                name="amount"
                label="Số tiền"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền" },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === "") {
                        return Promise.reject("Vui lòng nhập số tiền");
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || numValue < 0) {
                        return Promise.reject("Số tiền không hợp lệ");
                      }
                      if (numValue > paymentData?.paymentInfo.remainingAmount) {
                        return Promise.reject(
                          "Số tiền không được vượt quá số tiền còn lại"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input type="number" placeholder="Nhập số tiền" suffix="VND" />
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label="Phương thức thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán",
                  },
                ]}
              >
                <Select placeholder="Chọn phương thức thanh toán">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="transfer">Chuyển khoản</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="staff"
                label="Nhân viên nhận thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên nhân viên nhận thanh toán",
                  },
                ]}
              >
                <Input placeholder="Nhập tên nhân viên" />
              </Form.Item>

              <Form.Item
                name="paymentDate"
                label="Ngày thanh toán"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày thanh toán" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button
                    onClick={() => {
                      setIsModalVisible(false);
                      form.resetFields();
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
                name="amount"
                label="Số tiền"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền" },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === "") {
                        return Promise.reject("Vui lòng nhập số tiền");
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || numValue < 0) {
                        return Promise.reject("Số tiền không hợp lệ");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input type="number" placeholder="Nhập số tiền" suffix="VND" />
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label="Phương thức thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán",
                  },
                ]}
              >
                <Select placeholder="Chọn phương thức thanh toán">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="transfer">Chuyển khoản</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="staff"
                label="Nhân viên nhận thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên nhân viên nhận thanh toán",
                  },
                ]}
              >
                <Input placeholder="Nhập tên nhân viên" />
              </Form.Item>

              <Form.Item
                name="paymentDate"
                label="Ngày thanh toán"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày thanh toán" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default CenterClassPaymentDetails;
