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
  Tabs,
  Row,
  Col,
  Tooltip,
  Divider,
  message,
  Progress,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  DollarCircleOutlined,
  VideoCameraOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const RevenueReport = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("revenue");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedInstrument, setSelectedInstrument] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [timeFilter, setTimeFilter] = useState("month");
  const navigate = useNavigate();

  // Dữ liệu mẫu - thay thế bằng API call thực tế
  const mockData = {
    totalRevenue: 12500000,
    categories: {
      videoLessons: 7500000,
      liveLessons: 5000000,
    },
    monthlyData: [
      { month: "Tháng 1", videoLessons: 450000, liveLessons: 320000 },
      { month: "Tháng 2", videoLessons: 520000, liveLessons: 380000 },
      { month: "Tháng 3", videoLessons: 620000, liveLessons: 420000 },
      { month: "Tháng 4", videoLessons: 580000, liveLessons: 400000 },
      { month: "Tháng 5", videoLessons: 750000, liveLessons: 450000 },
      { month: "Tháng 6", videoLessons: 820000, liveLessons: 480000 },
      { month: "Tháng 7", videoLessons: 780000, liveLessons: 520000 },
      { month: "Tháng 8", videoLessons: 850000, liveLessons: 550000 },
      { month: "Tháng 9", videoLessons: 920000, liveLessons: 580000 },
      { month: "Tháng 10", videoLessons: 980000, liveLessons: 620000 },
      { month: "Tháng 11", videoLessons: 1050000, liveLessons: 650000 },
      { month: "Tháng 12", videoLessons: 1100000, liveLessons: 700000 },
    ],
    instrumentTypes: [
      { name: "Đàn Guitar", videoRevenue: 3200000, liveRevenue: 2100000 },
      { name: "Đàn Piano", videoRevenue: 2800000, liveRevenue: 1800000 },
      { name: "Violin", videoRevenue: 1500000, liveRevenue: 1100000 },
    ],
    topCourses: [
      {
        id: 1,
        name: "Guitar cơ bản cho người mới bắt đầu",
        type: "Đàn Guitar",
        category: "Video",
        revenue: 1200000,
        students: 45,
      },
      {
        id: 2,
        name: "Lớp Piano nâng cao",
        type: "Đàn Piano",
        category: "Live",
        revenue: 950000,
        students: 10,
      },
      {
        id: 3,
        name: "Violin cho trẻ em",
        type: "Violin",
        category: "Video",
        revenue: 820000,
        students: 30,
      },
      {
        id: 4,
        name: "Khóa Guitar Fingerstyle",
        type: "Đàn Guitar",
        category: "Video",
        revenue: 780000,
        students: 25,
      },
      {
        id: 5,
        name: "Piano cổ điển",
        type: "Đàn Piano",
        category: "Live",
        revenue: 720000,
        students: 8,
      },
    ],
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedCategory, selectedInstrument, dateRange]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Trong thực tế, bạn sẽ gọi API thực tế ở đây
      // const response = await axios.get(
      //   "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Report/revenue",
      //   {
      //     params: {
      //       category: selectedCategory,
      //       instrument: selectedInstrument,
      //       startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
      //       endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined
      //     }
      //   }
      // );

      // Thay thế bằng dữ liệu mẫu
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
      title: "Bài học video",
      dataIndex: "videoLessons",
      key: "videoLessons",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Bài học trực tiếp",
      dataIndex: "liveLessons",
      key: "liveLessons",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      key: "total",
      render: (_, record) =>
        `${(record.videoLessons + record.liveLessons).toLocaleString()} VND`,
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
      title: "Doanh thu từ bài học video",
      dataIndex: "videoRevenue",
      key: "videoRevenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Doanh thu từ bài học trực tiếp",
      dataIndex: "liveRevenue",
      key: "liveRevenue",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      key: "total",
      render: (_, record) =>
        `${(record.videoRevenue + record.liveRevenue).toLocaleString()} VND`,
    },
  ];

  // Cột cho bảng Top khóa học
  const topCoursesColumns = [
    {
      title: "Tên khóa học",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại nhạc cụ",
      dataIndex: "type",
      key: "type",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (text) => (
        <span>
          {text === "Video" ? (
            <VideoCameraOutlined style={{ marginRight: 5 }} />
          ) : (
            <TeamOutlined style={{ marginRight: 5 }} />
          )}
          {text === "Video" ? "Bài học video" : "Bài học trực tiếp"}
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

    const videoPercentage =
      (reportData.categories.videoLessons / reportData.totalRevenue) * 100;
    const livePercentage =
      (reportData.categories.liveLessons / reportData.totalRevenue) * 100;

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
                <span>Bài học video</span>
                <span style={{ marginLeft: "auto" }}>
                  {videoPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                percent={videoPercentage}
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
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                    marginRight: 8,
                  }}
                ></div>
                <span>Bài học trực tiếp</span>
                <span style={{ marginLeft: "auto" }}>
                  {livePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                percent={livePercentage}
                strokeColor="rgba(255, 99, 132, 0.6)"
              />
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  // Render biểu đồ theo loại đã chọn
  const renderChart = () => {
    if (!reportData) return <div>Không có dữ liệu</div>;

    switch (timeFilter) {
      case "month":
        return (
          <Table
            dataSource={reportData.monthlyData}
            columns={getMonthlyRevenueColumns()}
            pagination={false}
            rowKey="month"
            size="middle"
            style={{ marginTop: 16 }}
          />
        );
      case "category":
        return renderCategoryChart();
      case "instrument":
        return (
          <Table
            dataSource={reportData.instrumentTypes}
            columns={getInstrumentRevenueColumns()}
            pagination={false}
            rowKey="name"
            size="middle"
            style={{ marginTop: 16 }}
          />
        );
      default:
        return (
          <Table
            dataSource={reportData.monthlyData}
            columns={getMonthlyRevenueColumns()}
            pagination={false}
            rowKey="month"
            size="middle"
            style={{ marginTop: 16 }}
          />
        );
    }
  };

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <div className="mb-6">
            <Title level={3}>Báo cáo doanh thu</Title>
            <Text type="secondary">
              Thống kê doanh thu theo danh mục khóa học
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
              <Col xs={24} sm={12} md={5} lg={4}>
                <div className="flex items-center">
                  <FilterOutlined style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>Danh mục:</span>
                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="video">Bài học video</Option>
                    <Option value="live">Bài học trực tiếp</Option>
                  </Select>
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
              <Col xs={24} sm={24} md={6} lg={9}>
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
                        title="Doanh thu bài học video"
                        value={reportData.categories.videoLessons}
                        prefix={<VideoCameraOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#0070f3" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.videoLessons /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(1)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu bài học trực tiếp"
                        value={reportData.categories.liveLessons}
                        prefix={<TeamOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.categories.liveLessons /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(1)}
                          % tổng doanh thu
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Biểu đồ */}
                <Card className="mb-6">
                  <div className="flex justify-between mb-4">
                    <Space>
                      <Select
                        value={timeFilter}
                        onChange={setTimeFilter}
                        style={{ width: 150 }}
                      >
                        <Option value="month">Theo tháng</Option>
                        <Option value="category">Theo danh mục</Option>
                        <Option value="instrument">Theo nhạc cụ</Option>
                      </Select>
                    </Space>
                    <Space>
                      {timeFilter !== "category" && (
                        <>
                          <Tooltip title="Hiển thị dạng bảng">
                            <Button
                              type="primary"
                              icon={<BarChartOutlined />}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Space>
                  </div>
                  <div>{renderChart()}</div>
                </Card>

                {/* Bảng khóa học có doanh thu cao */}
                <Card
                  title="Top khóa học có doanh thu cao nhất"
                  className="mb-6"
                >
                  <Table
                    columns={topCoursesColumns}
                    dataSource={reportData.topCourses}
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
