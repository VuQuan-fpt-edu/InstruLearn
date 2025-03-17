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
  Statistic,
  Row,
  Col,
  Tooltip,
  message,
  Progress,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  DollarCircleOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueReport = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("revenue");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedInstrument, setSelectedInstrument] = useState("all");
  const navigate = useNavigate();

  // Dữ liệu mẫu - thay thế bằng API call thực tế
  const mockData = {
    totalRevenue: 25000000,
    categories: {
      onlineCourses: 8000000, // Doanh thu từ gói khóa học tự học online
      centerClasses: 10000000, // Doanh thu từ lớp học tại trung tâm
      privateLessons: 7000000, // Doanh thu từ học 1-1 tại nhà
      registrationFees: 500000, // Doanh thu từ phí đăng ký học 1-1 (50k/đơn)
      depositFees: 1000000, // Doanh thu từ phí giữ chỗ lớp học tại trung tâm (10% học phí)
    },
    monthlyData: [
      {
        month: "Tháng 1",
        onlineCourses: 600000,
        centerClasses: 800000,
        privateLessons: 500000,
        registrationFees: 50000,
        depositFees: 80000,
      },
      {
        month: "Tháng 2",
        onlineCourses: 650000,
        centerClasses: 850000,
        privateLessons: 550000,
        registrationFees: 45000,
        depositFees: 85000,
      },
      // ... thêm dữ liệu cho các tháng khác
    ],
    instrumentTypes: [
      {
        name: "Đàn Guitar",
        onlineRevenue: 3000000,
        centerRevenue: 4000000,
        privateRevenue: 2500000,
        registrationFees: 200000,
        depositFees: 400000,
      },
      {
        name: "Đàn Piano",
        onlineRevenue: 2500000,
        centerRevenue: 3500000,
        privateRevenue: 2000000,
        registrationFees: 150000,
        depositFees: 350000,
      },
      {
        name: "Violin",
        onlineRevenue: 2500000,
        centerRevenue: 2500000,
        privateRevenue: 2500000,
        registrationFees: 150000,
        depositFees: 250000,
      },
    ],
    topRevenueSources: [
      {
        id: 1,
        name: "Lớp Piano nâng cao",
        type: "Lớp học tại trung tâm",
        revenue: 2500000,
        students: 15,
      },
      {
        id: 2,
        name: "Guitar cơ bản online",
        type: "Khóa học tự học",
        revenue: 1800000,
        students: 45,
      },
      {
        id: 3,
        name: "Violin 1-1",
        type: "Học tại nhà",
        revenue: 1500000,
        students: 8,
      },
      {
        id: 4,
        name: "Phí đăng ký học 1-1",
        type: "Phí đăng ký",
        revenue: 500000,
        students: 100,
      },
      {
        id: 5,
        name: "Phí giữ chỗ lớp học",
        type: "Phí giữ chỗ",
        revenue: 1000000,
        students: 200,
      },
    ],
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedInstrument, dateRange]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Trong thực tế, bạn sẽ gọi API thực tế ở đây
      setTimeout(() => {
        setReportData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải dữ liệu báo cáo doanh thu");
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    message.success("Đã xuất báo cáo thành công!");
  };

  // Cột cho bảng doanh thu theo tháng
  const getMonthlyRevenueColumns = () => [
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Khóa học tự học",
      dataIndex: "onlineCourses",
      key: "onlineCourses",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Lớp học tại trung tâm",
      dataIndex: "centerClasses",
      key: "centerClasses",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Học 1-1 tại nhà",
      dataIndex: "privateLessons",
      key: "privateLessons",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Phí đăng ký học 1-1",
      dataIndex: "registrationFees",
      key: "registrationFees",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Phí giữ chỗ lớp học",
      dataIndex: "depositFees",
      key: "depositFees",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      key: "total",
      render: (_, record) =>
        `${(
          record.onlineCourses +
          record.centerClasses +
          record.privateLessons +
          record.registrationFees +
          record.depositFees
        ).toLocaleString()} VND`,
    },
  ];

  // Cột cho bảng doanh thu theo nhạc cụ
  const getInstrumentRevenueColumns = () => [
    {
      title: "Loại nhạc cụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Doanh thu khóa học tự học",
      dataIndex: "onlineRevenue",
      key: "onlineRevenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Doanh thu lớp học tại trung tâm",
      dataIndex: "centerRevenue",
      key: "centerRevenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Doanh thu học 1-1",
      dataIndex: "privateRevenue",
      key: "privateRevenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Phí đăng ký học 1-1",
      dataIndex: "registrationFees",
      key: "registrationFees",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Phí giữ chỗ lớp học",
      dataIndex: "depositFees",
      key: "depositFees",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      key: "total",
      render: (_, record) =>
        `${(
          record.onlineRevenue +
          record.centerRevenue +
          record.privateRevenue +
          record.registrationFees +
          record.depositFees
        ).toLocaleString()} VND`,
    },
  ];

  // Cột cho bảng top nguồn doanh thu
  const topRevenueColumns = [
    {
      title: "Tên khóa học",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại hình",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span>
          {text === "Khóa học tự học" ? (
            <VideoCameraOutlined style={{ marginRight: 5 }} />
          ) : text === "Lớp học tại trung tâm" ? (
            <TeamOutlined style={{ marginRight: 5 }} />
          ) : (
            <HomeOutlined style={{ marginRight: 5 }} />
          )}
          {text}
        </span>
      ),
    },
    {
      title: "Số học viên",
      dataIndex: "students",
      key: "students",
      sorter: (a, b) => a.students - b.students,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
  ];

  // Hiển thị biểu đồ dạng phần trăm cho danh mục khóa học
  const renderCategoryChart = () => {
    if (!reportData) return <div>Không có dữ liệu</div>;

    const onlinePercentage =
      Math.round(
        (reportData.categories.onlineCourses / reportData.totalRevenue) *
          100 *
          100
      ) / 100;
    const centerPercentage =
      Math.round(
        (reportData.categories.centerClasses / reportData.totalRevenue) *
          100 *
          100
      ) / 100;
    const privatePercentage =
      Math.round(
        (reportData.categories.privateLessons / reportData.totalRevenue) *
          100 *
          100
      ) / 100;
    const registrationPercentage =
      Math.round(
        (reportData.categories.registrationFees / reportData.totalRevenue) *
          100 *
          100
      ) / 100;
    const depositPercentage =
      Math.round(
        (reportData.categories.depositFees / reportData.totalRevenue) *
          100 *
          100
      ) / 100;

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
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Khóa học tự học</span>
                {/* <span style={{ marginLeft: "auto" }}>{onlinePercentage}%</span> */}
              </div>
              <Progress
                percent={onlinePercentage}
                strokeColor="rgba(54, 162, 235, 0.6)"
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
                {/* <span style={{ marginLeft: "auto" }}>{centerPercentage}%</span> */}
              </div>
              <Progress
                percent={centerPercentage}
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
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Học 1-1 tại nhà</span>
                {/* <span style={{ marginLeft: "auto" }}>{privatePercentage}%</span> */}
              </div>
              <Progress
                percent={privatePercentage}
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
                    backgroundColor: "rgba(255, 206, 86, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Phí đăng ký học 1-1</span>
                {/* <span style={{ marginLeft: "auto" }}>
                  {registrationPercentage}%
                </span> */}
              </div>
              <Progress
                percent={registrationPercentage}
                strokeColor="rgba(255, 206, 86, 0.6)"
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
                    backgroundColor: "rgba(153, 102, 255, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Phí giữ chỗ lớp học</span>
                {/* <span style={{ marginLeft: "auto" }}>{depositPercentage}%</span> */}
              </div>
              <Progress
                percent={depositPercentage}
                strokeColor="rgba(153, 102, 255, 0.6)"
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
            <Title level={3}>Báo cáo doanh thu</Title>
            <Text type="secondary">
              Thống kê doanh thu theo các nguồn thu nhập
            </Text>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={8} lg={6}>
                <div className="flex items-center">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>Thời gian:</span>
                  <RangePicker
                    onChange={(dates) => setDateRange(dates)}
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={5} lg={5}>
                <div className="flex items-center">
                  <FilterOutlined style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>Nhạc cụ:</span>
                  <Select
                    value={selectedInstrument}
                    onChange={setSelectedInstrument}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="guitar">Đàn Guitar</Option>
                    <Option value="piano">Đàn Piano</Option>
                    <Option value="violin">Violin</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={24} md={11} lg={13}>
                <div className="flex justify-end">
                  <Space>
                    <Tooltip title="Làm mới">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchRevenueData}
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

          <Spin spinning={loading}>
            {reportData && (
              <>
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Tổng doanh thu"
                        value={reportData.totalRevenue}
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
                        title="Doanh thu khóa học tự học"
                        value={reportData.categories.onlineCourses}
                        prefix={<VideoCameraOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#0070f3" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.onlineCourses /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu lớp học tại trung tâm"
                        value={reportData.categories.centerClasses}
                        prefix={<TeamOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.centerClasses /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu học 1-1 tại nhà"
                        value={reportData.categories.privateLessons}
                        prefix={<HomeOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#722ed1" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.privateLessons /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Phí đăng ký học 1-1"
                        value={reportData.categories.registrationFees}
                        prefix={<ShoppingCartOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#faad14" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.registrationFees /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Phí giữ chỗ lớp học"
                        value={reportData.categories.depositFees}
                        prefix={<ShoppingCartOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#1890ff" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.depositFees /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Biểu đồ phân bố doanh thu */}
                <Card className="mb-6">
                  <Title level={4}>Phân bố doanh thu theo nguồn</Title>
                  {renderCategoryChart()}
                </Card>

                {/* Bảng doanh thu theo tháng */}
                <Card className="mb-6">
                  <Title level={4}>Doanh thu theo tháng</Title>
                  <Table
                    dataSource={reportData.monthlyData}
                    columns={getMonthlyRevenueColumns()}
                    pagination={false}
                    rowKey="month"
                    size="middle"
                  />
                </Card>

                {/* Bảng doanh thu theo nhạc cụ */}
                <Card className="mb-6">
                  <Title level={4}>Doanh thu theo loại nhạc cụ</Title>
                  <Table
                    dataSource={reportData.instrumentTypes}
                    columns={getInstrumentRevenueColumns()}
                    pagination={false}
                    rowKey="name"
                    size="middle"
                  />
                </Card>

                {/* Bảng top nguồn doanh thu */}
                <Card title="Top nguồn doanh thu" className="mb-6">
                  <Table
                    columns={topRevenueColumns}
                    dataSource={reportData.topRevenueSources}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </>
            )}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RevenueReport;
