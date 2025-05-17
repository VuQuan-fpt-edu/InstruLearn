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
  Select,
  Statistic,
  Progress,
  Spin,
  Tabs,
} from "antd";
import {
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DollarCircleOutlined,
  TransactionOutlined,
  HomeOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import axios from "axios";
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
const { Option } = Select;
const { TabPane } = Tabs;

const YearRevenue = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("yearRevenue");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const years = [2021, 2022, 2023, 2024, 2025]; // Danh sách các năm có thể chọn

  useEffect(() => {
    fetchRevenueData();
  }, [selectedYear]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Revenue/yearly?year=${selectedYear}`
      );

      if (response.data.isSucceed) {
        setRevenueData(response.data.data);
      } else {
        message.error("Không thể tải dữ liệu: " + response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải dữ liệu báo cáo doanh thu");
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    message.success("Đã xuất báo cáo thành công!");
  };

  // Cột cho bảng doanh thu hàng tháng
  const getMonthlyRevenueColumns = () => [
    {
      title: "Tháng",
      dataIndex: "monthName",
      key: "month",
      render: (text, record) => `Tháng ${record.month} (${text})`,
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
  ];

  // Cột cho bảng học 1-1 theo tháng
  const getOneOnOneMonthlyColumns = () => [
    {
      title: "Tháng",
      dataIndex: "monthName",
      key: "month",
      render: (text, record) => `Tháng ${record.month} (${text})`,
    },
    {
      title: "Số đăng ký",
      dataIndex: "registrationCount",
      key: "registrationCount",
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
    },
    {
      title: "Thanh toán 40%",
      dataIndex: "phase40Amount",
      key: "phase40Amount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Thanh toán 60%",
      dataIndex: "phase60Amount",
      key: "phase60Amount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
  ];

  // Cột cho bảng lớp học tại trung tâm theo tháng
  const getCenterClassMonthlyColumns = () => [
    {
      title: "Tháng",
      dataIndex: "monthName",
      key: "month",
      render: (text, record) => `Tháng ${record.month} (${text})`,
    },
    {
      title: "Số đăng ký",
      dataIndex: "registrationCount",
      key: "registrationCount",
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
    },
    {
      title: "Đặt cọc 10%",
      dataIndex: "initial10PercentAmount",
      key: "initial10PercentAmount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
  ];

  // Cột cho bảng khóa học trực tuyến theo tháng
  const getCourseMonthlyColumns = () => [
    {
      title: "Tháng",
      dataIndex: "monthName",
      key: "month",
      render: (text, record) => `Tháng ${record.month} (${text})`,
    },
    {
      title: "Số khóa học đã bán",
      dataIndex: "purchaseCount",
      key: "purchaseCount",
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
  ];

  // Cột cho bảng loại doanh thu
  const getRevenueTypeColumns = () => [
    {
      title: "Loại doanh thu",
      dataIndex: "paymentTypeName",
      key: "paymentTypeName",
      render: (text, record) => {
        let icon;
        let color;
        if (record.paymentType === "LearningRegistration") {
          icon = <HomeOutlined style={{ marginRight: 8 }} />;
          color = "purple";
        } else if (record.paymentType === "Online_Course") {
          icon = <VideoCameraOutlined style={{ marginRight: 8 }} />;
          color = "blue";
        } else {
          icon = <TeamOutlined style={{ marginRight: 8 }} />;
          color = "red";
        }
        return (
          <Tag color={color}>
            {icon}
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
  ];

  // Hiển thị biểu đồ tỷ lệ doanh thu theo loại
  const renderRevenueTypeChart = () => {
    if (!revenueData) return <div>Không có dữ liệu</div>;

    const revenueTypes = revenueData.byRevenueType.fullYear;
    const totalRevenue = revenueData.totalRevenue;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {revenueTypes.map((type, index) => {
              const percentage =
                Math.round((type.revenue / totalRevenue) * 100 * 100) / 100;
              let color, icon;

              if (type.paymentType === "LearningRegistration") {
                color = "rgba(128, 0, 128, 0.6)"; // purple
                icon = <HomeOutlined />;
              } else if (type.paymentType === "Online_Course") {
                color = "rgba(54, 162, 235, 0.6)"; // blue
                icon = <VideoCameraOutlined />;
              } else {
                color = "rgba(255, 99, 132, 0.6)"; // red
                icon = <TeamOutlined />;
              }

              return (
                <div key={index} style={{ marginBottom: 16 }}>
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
                        backgroundColor: color,
                        marginRight: 8,
                      }}
                    ></div>
                    <span>
                      {icon} {type.paymentTypeName}
                    </span>
                  </div>
                  <Progress percent={percentage} strokeColor={color} />
                </div>
              );
            })}
          </Col>
        </Row>
      </div>
    );
  };

  // Hiển thị biểu đồ doanh thu theo tháng
  const renderMonthlyRevenueChart = () => {
    if (!revenueData) return <div>Không có dữ liệu</div>;

    const monthlyData = revenueData.byTimeUnit.monthly;

    const chartData = {
      labels: monthlyData.map((item) => `Tháng ${item.month}`),
      datasets: [
        {
          label: "Doanh thu (VND)",
          data: monthlyData.map((item) => item.revenue),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Doanh thu theo tháng năm ${selectedYear}`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString() + " VND";
            },
          },
        },
      },
    };

    return <Bar data={chartData} options={options} />;
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
            <Title level={3}>Doanh thu theo năm</Title>
            <Text type="secondary">Tổng quan doanh thu của các năm</Text>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6} lg={6}>
                <div className="flex items-center">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>Năm:</span>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: "100%" }}
                  >
                    {years.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={24} md={18} lg={18}>
                <div className="flex justify-end">
                  <Space>
                    <Tooltip title="Làm mới">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchRevenueData}
                      />
                    </Tooltip>
                    {/* <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportReport}
                    >
                      Xuất báo cáo
                    </Button> */}
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
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title={`Tổng doanh thu năm ${revenueData.year}`}
                        value={revenueData.totalRevenue}
                        prefix={<DollarCircleOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Tổng số giao dịch"
                        value={revenueData.totalTransactions}
                        prefix={<TransactionOutlined />}
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#0070f3" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu trung bình/tháng"
                        value={revenueData.totalRevenue / 12}
                        prefix={<BarChartOutlined />}
                        suffix="VND"
                        formatter={(value) =>
                          `${Math.round(value).toLocaleString()}`
                        }
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Biểu đồ doanh thu theo tháng */}
                <Card className="mb-6">
                  <Title level={4}>Biểu đồ doanh thu theo tháng</Title>
                  <div style={{ height: "400px" }}>
                    {renderMonthlyRevenueChart()}
                  </div>
                </Card>

                {/* Bảng doanh thu hàng tháng */}
                <Card className="mb-6">
                  <Title level={4}>Doanh thu hàng tháng</Title>
                  <Table
                    dataSource={revenueData.byTimeUnit.monthly.filter(
                      (m) => m.transactionCount > 0
                    )}
                    columns={getMonthlyRevenueColumns()}
                    pagination={false}
                    rowKey="month"
                    size="middle"
                  />
                </Card>

                {/* Phân bố doanh thu theo loại */}
                <Card className="mb-6">
                  <Title level={4}>Phân bố doanh thu theo loại</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      {renderRevenueTypeChart()}
                    </Col>
                    <Col xs={24} md={12}>
                      <Table
                        dataSource={revenueData.byRevenueType.fullYear}
                        columns={getRevenueTypeColumns()}
                        pagination={false}
                        rowKey="paymentType"
                        size="middle"
                      />
                    </Col>
                  </Row>
                </Card>

                {/* Chi tiết theo loại doanh thu */}
                <Card className="mb-6">
                  <Title level={4}>Chi tiết theo loại doanh thu</Title>
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="Học 1-1" key="1">
                      <Table
                        dataSource={revenueData.byRevenueType.monthlyBreakdown.oneOnOneRegistrations.filter(
                          (m) => m.transactionCount > 0
                        )}
                        columns={getOneOnOneMonthlyColumns()}
                        pagination={false}
                        rowKey="month"
                        size="middle"
                      />
                    </TabPane>
                    <TabPane tab="Lớp học tại trung tâm" key="2">
                      <Table
                        dataSource={revenueData.byRevenueType.monthlyBreakdown.centerClassRegistrations.filter(
                          (m) => m.transactionCount > 0
                        )}
                        columns={getCenterClassMonthlyColumns()}
                        pagination={false}
                        rowKey="month"
                        size="middle"
                      />
                    </TabPane>
                    <TabPane tab="Khóa học trực tuyến" key="3">
                      <Table
                        dataSource={revenueData.byRevenueType.monthlyBreakdown.coursePurchases.filter(
                          (m) => m.transactionCount > 0
                        )}
                        columns={getCourseMonthlyColumns()}
                        pagination={false}
                        rowKey="month"
                        size="middle"
                      />
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

export default YearRevenue;
