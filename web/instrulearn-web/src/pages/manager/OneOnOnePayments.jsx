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
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Statistic,
  Progress,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const OneOnOnePayments = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const navigate = useNavigate();

  // Mock data - thay thế bằng API call thực tế
  const mockPayments = [
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      teacherName: "Trần Thị B",
      instrument: "Piano",
      totalLessons: 20,
      completedLessons: 12,
      totalAmount: 10000000,
      paidAmount: 6000000,
      remainingAmount: 4000000,
      status: "partial", // partial: đã đóng 60%, completed: đã đóng đủ, overdue: quá hạn
      dueDate: "2024-04-20",
      paymentHistory: [
        {
          id: 1,
          amount: 6000000,
          paymentDate: "2024-03-01",
          paymentMethod: "cash",
          type: "initial", // initial: đóng 60%, final: đóng 40%
          note: "Thanh toán 60% học phí",
          staff: "Lê Thị C",
        },
      ],
    },
    {
      id: 2,
      studentName: "Lê Văn B",
      teacherName: "Phạm Thị C",
      instrument: "Guitar",
      totalLessons: 15,
      completedLessons: 8,
      totalAmount: 8000000,
      paidAmount: 8000000,
      remainingAmount: 0,
      status: "completed",
      dueDate: "2024-04-15",
      paymentHistory: [
        {
          id: 1,
          amount: 4800000,
          paymentDate: "2024-03-01",
          paymentMethod: "transfer",
          type: "initial",
          note: "Thanh toán 60% học phí",
          staff: "Lê Thị C",
        },
        {
          id: 2,
          amount: 3200000,
          paymentDate: "2024-03-15",
          paymentMethod: "cash",
          type: "final",
          note: "Thanh toán 40% học phí còn lại",
          staff: "Lê Thị C",
        },
      ],
    },
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // API call thực tế sẽ được thay thế ở đây
      setTimeout(() => {
        setPayments(mockPayments);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error("Không thể tải danh sách thanh toán");
      setLoading(false);
    }
  };

  const handleAddPayment = (values) => {
    const newPayment = {
      id: payments.length + 1,
      studentName: "Nguyễn Văn A", // Thay thế bằng dữ liệu thực tế
      teacherName: "Trần Thị B", // Thay thế bằng dữ liệu thực tế
      instrument: "Piano", // Thay thế bằng dữ liệu thực tế
      totalLessons: 20,
      completedLessons: 12,
      totalAmount: 10000000,
      paidAmount: Number(values.amount),
      remainingAmount: 10000000 - Number(values.amount),
      status: Number(values.amount) >= 10000000 ? "completed" : "partial",
      dueDate: "2024-04-20",
      paymentHistory: [
        {
          id: 1,
          amount: Number(values.amount),
          paymentDate: values.paymentDate.format("YYYY-MM-DD"),
          paymentMethod: values.paymentMethod,
          type: "initial",
          note: values.note,
          staff: values.staff,
        },
      ],
    };

    setPayments([...payments, newPayment]);
    message.success("Đã thêm thanh toán mới");
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleUpdatePayment = (record) => {
    setSelectedPayment(record);
    updateForm.setFieldsValue({
      amount: record.paidAmount,
      status: record.status,
    });
    setIsUpdateModalVisible(true);
  };

  const handleUpdateSubmit = (values) => {
    const updatedPayment = {
      ...selectedPayment,
      paidAmount: Number(values.amount),
      remainingAmount: selectedPayment.totalAmount - Number(values.amount),
      status: values.status,
    };

    setPayments(
      payments.map((payment) =>
        payment.id === selectedPayment.id ? updatedPayment : payment
      )
    );

    message.success("Đã cập nhật thanh toán thành công!");
    setIsUpdateModalVisible(false);
    updateForm.resetFields();
  };

  const handleDeletePayment = (record) => {
    setPayments(payments.filter((payment) => payment.id !== record.id));
    message.success("Đã xóa thanh toán thành công!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "partial":
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
      case "partial":
        return "Đã đóng 60% học phí";
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
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Nhạc cụ",
      dataIndex: "instrument",
      key: "instrument",
    },
    {
      title: "Tiến độ học",
      key: "progress",
      render: (_, record) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Progress
            percent={Math.round(
              (record.completedLessons / record.totalLessons) * 100
            )}
            size="small"
            status={
              record.completedLessons >= record.totalLessons / 2
                ? "success"
                : "normal"
            }
          />
          <Text type="secondary">
            {record.completedLessons}/{record.totalLessons} buổi
          </Text>
        </Space>
      ),
    },
    {
      title: "Tổng học phí",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: (amount) => `${amount.toLocaleString()} VND`,
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
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate(`/manager/revenue/one-on-one-payments/${record.id}`)
            }
          >
            Chi tiết
          </Button>
          <Tooltip title="Cập nhật">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdatePayment(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thanh toán này?"
            onConfirm={() => handleDeletePayment(record)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="OneOnOnePayments"
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
            <Title level={3} style={{ margin: 0 }}>
              Quản lý thanh toán học 1-1
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Thêm thanh toán mới
            </Button>
          </div>

          <Card>
            <Table
              columns={columns}
              dataSource={payments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} thanh toán`,
              }}
            />
          </Card>
        </Content>
      </Layout>

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
            paymentMethod: "cash",
          }}
        >
          <Form.Item
            name="studentName"
            label="Học viên"
            rules={[{ required: true, message: "Vui lòng chọn học viên" }]}
          >
            <Select placeholder="Chọn học viên">
              <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
              <Option value="Lê Văn B">Lê Văn B</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherName"
            label="Giáo viên"
            rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
          >
            <Select placeholder="Chọn giáo viên">
              <Option value="Trần Thị B">Trần Thị B</Option>
              <Option value="Phạm Thị C">Phạm Thị C</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="instrument"
            label="Nhạc cụ"
            rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
          >
            <Select placeholder="Chọn nhạc cụ">
              <Option value="Piano">Piano</Option>
              <Option value="Guitar">Guitar</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="totalLessons"
            label="Tổng số buổi học"
            rules={[
              { required: true, message: "Vui lòng nhập tổng số buổi học" },
            ]}
          >
            <Input type="number" min={1} placeholder="Nhập tổng số buổi học" />
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label="Tổng học phí"
            rules={[{ required: true, message: "Vui lòng nhập tổng học phí" }]}
          >
            <Input
              type="number"
              min={0}
              placeholder="Nhập tổng học phí"
              suffix="VND"
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền thanh toán"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền thanh toán" },
              {
                validator: (_, value) => {
                  if (value === undefined || value === "") {
                    return Promise.reject("Vui lòng nhập số tiền thanh toán");
                  }
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue < 0) {
                    return Promise.reject("Số tiền không hợp lệ");
                  }
                  const totalAmount = form.getFieldValue("totalAmount");
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
              min={0}
              placeholder="Nhập số tiền thanh toán"
              suffix="VND"
            />
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
        <Form form={updateForm} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item
            name="amount"
            label="Số tiền đã thanh toán"
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
                  if (numValue > selectedPayment?.totalAmount) {
                    return Promise.reject(
                      "Số tiền không được vượt quá tổng học phí"
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
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="partial">Đã đóng 60% học phí</Option>
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
    </Layout>
  );
};

export default OneOnOnePayments;
