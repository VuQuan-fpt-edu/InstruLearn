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

const HistoryTransaction = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchText, setSearchText] = useState("");

  // Mock data - thay thế bằng API call thực tế
  const mockData = {
    transactions: [
      {
        id: 1,
        studentName: "Nguyễn Văn A",
        transactionType: "center_class_deposit",
        amount: 500000, // 10% học phí lớp 5 triệu
        description: "Đặt cọc 10% học phí lớp Piano cơ bản",
        transactionDate: "2024-03-15",
      },
      {
        id: 2,
        studentName: "Trần Thị B",
        transactionType: "one_on_one_registration",
        amount: 50000,
        description: "Phí đăng ký học 1-1",
        transactionDate: "2024-03-18",
      },
      {
        id: 3,
        studentName: "Lê Văn C",
        transactionType: "one_on_one_tuition",
        amount: 3000000, // 60% học phí 5 triệu
        description: "Thanh toán 60% học phí học 1-1 Guitar",
        transactionDate: "2024-03-20",
      },
      {
        id: 4,
        studentName: "Phạm Thị D",
        transactionType: "online_course",
        amount: 2000000,
        description: "Mua khóa học Piano tự học",
        transactionDate: "2024-03-22",
      },
    ],
    summary: {
      totalTransactions: 4,
      totalAmount: 5550000,
    },
  };

  useEffect(() => {
    fetchTransactionData();
  }, [dateRange]);

  const fetchTransactionData = async () => {
    setLoading(true);
    try {
      // API call thực tế sẽ được thay thế ở đây
      setTimeout(() => {
        setTransactionData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error("Không thể tải dữ liệu giao dịch");
      setLoading(false);
    }
  };

  const getTransactionTypeTag = (type) => {
    const types = {
      center_class_deposit: {
        color: "blue",
        text: "Đặt cọc lớp tại trung tâm",
      },
      one_on_one_registration: { color: "green", text: "Phí đăng ký học 1-1" },
      one_on_one_tuition: { color: "purple", text: "Thanh toán học 1-1" },
      online_course: { color: "orange", text: "Mua khóa học tự học" },
    };
    const typeInfo = types[type];
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => getTransactionTypeTag(type),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (value) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="HistoryTransaction"
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
            <Title level={3}>Quản lý lịch sử giao dịch ví</Title>
          </div>

          {/* Thống kê tổng quan */}
          {transactionData && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng số giao dịch"
                    value={transactionData.summary.totalTransactions}
                    suffix="giao dịch"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng số tiền"
                    value={transactionData.summary.totalAmount}
                    suffix="VND"
                    formatter={(value) => `${value.toLocaleString()}`}
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
                  placeholder="Tìm kiếm theo tên học viên"
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
                        onClick={fetchTransactionData}
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

          {/* Bảng giao dịch */}
          <Card>
            <Table
              columns={columns}
              dataSource={transactionData?.transactions}
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

export default HistoryTransaction;
