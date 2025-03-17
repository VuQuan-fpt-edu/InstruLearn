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
  Tooltip,
  message,
  Input,
  Statistic,
  DatePicker,
} from "antd";
import {
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const OnlineCoursePayments = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchText, setSearchText] = useState("");

  // Mock data - thay thế bằng API call thực tế
  const mockData = {
    payments: [
      {
        id: 1,
        studentName: "Nguyễn Văn A",
        courseName: "Piano cơ bản cho người mới bắt đầu",
        courseType: "basic",
        amount: 2000000,
        paymentDate: "2024-03-15",
      },
      {
        id: 2,
        studentName: "Trần Thị B",
        courseName: "Guitar nâng cao",
        courseType: "advanced",
        amount: 3000000,
        paymentDate: "2024-03-18",
      },
      {
        id: 3,
        studentName: "Lê Văn C",
        courseName: "Violin cơ bản",
        courseType: "basic",
        amount: 2500000,
        paymentDate: "2024-03-20",
      },
    ],
    summary: {
      totalAmount: 7500000,
      totalStudents: 3,
    },
  };

  useEffect(() => {
    fetchPaymentData();
  }, [dateRange]);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // API call thực tế sẽ được thay thế ở đây
      setTimeout(() => {
        setPaymentData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error("Không thể tải dữ liệu thanh toán");
      setLoading(false);
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
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Loại khóa học",
      dataIndex: "courseType",
      key: "courseType",
      render: (type) => (
        <Tag color={type === "basic" ? "blue" : "purple"}>
          {type === "basic" ? "Cơ bản" : "Nâng cao"}
        </Tag>
      ),
    },
    {
      title: "Học phí",
      dataIndex: "amount",
      key: "amount",
      render: (value) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="OnlineCoursePayments"
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
          <div className="mb-6">
            <Title level={3}>Quản lý doanh thu khóa học online</Title>
          </div>

          {/* Thống kê tổng quan */}
          {paymentData && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng doanh thu"
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
                    title="Số học viên"
                    value={paymentData.summary.totalStudents}
                    suffix="học viên"
                    valueStyle={{ color: "#3f8600" }}
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
                  <DatePicker.RangePicker
                    onChange={(dates) => setDateRange(dates)}
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={8}>
                <Search
                  placeholder="Tìm kiếm theo tên học viên hoặc khóa học"
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
                      onClick={() =>
                        message.success("Đã xuất báo cáo thành công!")
                      }
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default OnlineCoursePayments;
