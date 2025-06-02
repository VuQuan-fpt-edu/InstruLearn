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
  message,
  Statistic,
  Progress,
  Spin,
  Tabs,
  DatePicker,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  TransactionOutlined,
  CalendarOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import dayjs from "dayjs";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend
);

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ManagerDashBoard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch tổng doanh thu
      const revenueResponse = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Revenue/total"
      );

      // Fetch giao dịch gần đây
      const transactionsResponse = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/WalletTransactions"
      );

      if (revenueResponse.data.isSucceed) {
        setRevenueData(revenueResponse.data.data);
      }

      // Lọc chỉ lấy các giao dịch nạp tiền (AddFuns)
      const addFunsTransactions = transactionsResponse.data.filter(
        (transaction) => transaction.transactionType === "AddFuns"
      );
      setTransactions(addFunsTransactions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Cột cho bảng giao dịch gần đây
  const getRecentTransactionsColumns = () => [
    {
      title: "Học viên",
      dataIndex: "learnerFullname",
      key: "learnerFullname",
      render: (text) => (
        <div className="flex items-center">
          <TeamOutlined className="mr-2" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "signedAmount",
      key: "signedAmount",
      render: (amount) => (
        <div
          className={`font-medium ${
            amount > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {amount > 0 ? "+" : ""}
          {amount.toLocaleString("vi-VN")} VNĐ
        </div>
      ),
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "Complete":
            color = "success";
            text = "Hoàn thành";
            break;
          case "Pending":
            color = "warning";
            text = "Đang chờ";
            break;
          case "Failed":
            color = "error";
            text = "Từ chối";
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Hiển thị biểu đồ doanh thu theo loại
  const renderRevenueTypeChart = () => {
    if (!revenueData) return <div>Không có dữ liệu</div>;

    const totalRevenue = revenueData.overview.totalRevenue;

    const oneOnOnePercentage = Math.round(
      (revenueData.detailedRevenue.oneOnOneRegistrationRevenue / totalRevenue) *
        100
    );

    const centerClassPercentage = Math.round(
      (revenueData.detailedRevenue.centerClassRevenue / totalRevenue) * 100
    );

    const coursePercentage = Math.round(
      (revenueData.detailedRevenue.courseRevenue / totalRevenue) * 100
    );

    const reservationPercentage = Math.round(
      (revenueData.reservationFees.totalAmount / totalRevenue) * 100
    );

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Học 1-1</span>
              </div>
              <Progress
                percent={oneOnOnePercentage}
                strokeColor="rgba(75, 192, 192, 0.6)"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Lớp học tại trung tâm</span>
              </div>
              <Progress
                percent={centerClassPercentage}
                strokeColor="rgba(255, 99, 132, 0.6)"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Khóa học tự học</span>
              </div>
              <Progress
                percent={coursePercentage}
                strokeColor="rgba(54, 162, 235, 0.6)"
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgba(255, 206, 86, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Phí xử lý đơn</span>
              </div>
              <Progress
                percent={reservationPercentage}
                strokeColor="rgba(255, 206, 86, 0.6)"
              />
            </div>
          </Col>
        </Row>
      </div>
    );
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
          <div className="mb-6">
            <Title level={3}>Dashboard</Title>
            <Text type="secondary">Tổng quan về hoạt động của trung tâm</Text>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={8} lg={6}>
                <div className="flex items-center">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>Thời gian:</span>
                  <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={24} md={16} lg={18}>
                <div className="flex justify-end">
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchDashboardData}
                    >
                      Làm mới
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>

          <Spin spinning={loading}>
            {revenueData && (
              <>
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng doanh thu"
                        value={revenueData.overview.totalRevenue}
                        prefix={<DollarOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng số giao dịch"
                        value={revenueData.overview.transactionCount}
                        prefix={<TransactionOutlined />}
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#0070f3" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Doanh thu học 1-1"
                        value={
                          revenueData.detailedRevenue
                            .oneOnOneRegistrationRevenue
                        }
                        prefix={<HomeOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Doanh thu lớp học tại trung tâm"
                        value={revenueData.detailedRevenue.centerClassRevenue}
                        prefix={<TeamOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Biểu đồ phân bố doanh thu */}
                <Card className="mb-6">
                  <Title level={4}>Phân bố doanh thu theo nguồn</Title>
                  {renderRevenueTypeChart()}
                </Card>

                {/* Giao dịch gần đây */}
                <Card className="mb-6">
                  <Title level={4}>Giao dịch gần đây</Title>
                  <Table
                    columns={getRecentTransactionsColumns()}
                    dataSource={transactions.slice(0, 5)}
                    rowKey="transactionId"
                    pagination={false}
                  />
                  <div className="mt-4 text-right">
                    <Button
                      type="link"
                      onClick={() => navigate("/manager/payment-management")}
                    >
                      Xem tất cả giao dịch
                    </Button>
                  </div>
                </Card>

                {/* Các tab thông tin khác */}
                <Card>
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="Doanh thu theo tháng" key="1">
                      <Button
                        type="link"
                        onClick={() =>
                          navigate("/manager/revenue/month-revenue")
                        }
                      >
                        Xem chi tiết doanh thu theo tháng
                      </Button>
                    </TabPane>
                    <TabPane tab="Doanh thu theo năm" key="2">
                      <Button
                        type="link"
                        onClick={() =>
                          navigate("/manager/revenue/year-revenue")
                        }
                      >
                        Xem chi tiết doanh thu theo năm
                      </Button>
                    </TabPane>
                    <TabPane tab="Quản lý cấp độ" key="3">
                      <Button
                        type="link"
                        onClick={() => navigate("/manager/level-management")}
                      >
                        Xem chi tiết quản lý cấp độ
                      </Button>
                    </TabPane>
                  </Tabs>
                </Card>
              </>
            )}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerDashBoard;
