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
  Tag,
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
  TransactionOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import dayjs from "dayjs";

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

  useEffect(() => {
    fetchRevenueData();
  }, [selectedInstrument, dateRange]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Revenue/total"
      );

      if (response.data.isSucceed) {
        setReportData(response.data.data);
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

  // Cột cho bảng doanh thu theo tháng
  const getMonthlyRevenueColumns = () => [
    {
      title: "Tháng",
      dataIndex: "monthName",
      key: "month",
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

  // Cột cho bảng doanh thu theo tuần
  const getWeeklyRevenueColumns = () => [
    {
      title: "Tuần",
      dataIndex: "weekNumber",
      key: "week",
      render: (value, record) =>
        `Tuần ${value} (${record.weekStart} - ${record.weekEnd})`,
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

  // Cột cho bảng doanh thu theo ngày
  const getDailyRevenueColumns = () => [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (text, record) => `${text} (${record.dayOfWeek})`,
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

  // Cột cho thanh toán học 1-1 giai đoạn 40%
  const getPhase40PaymentsColumns = () => [
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (value) => `${value.toLocaleString()} VND`,
    },
  ];

  // Cột cho thanh toán học 1-1 giai đoạn 60%
  const getPhase60PaymentsColumns = () => [
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (value) => `${value.toLocaleString()} VND`,
    },
  ];

  // Cột cho thanh toán lớp học tại trung tâm
  const getCenterClassPaymentsColumns = () => [
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền thanh toán",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
  ];

  // Hiển thị biểu đồ dạng phần trăm cho danh mục khóa học
  const renderCategoryChart = () => {
    if (!reportData) return <div>Không có dữ liệu</div>;

    const totalRevenue = reportData.overview.totalRevenue;

    const oneOnOnePercentage =
      Math.round(
        (reportData.detailedRevenue.oneOnOneRegistrationRevenue /
          totalRevenue) *
          100 *
          100
      ) / 100;

    const centerClassPercentage =
      Math.round(
        (reportData.detailedRevenue.centerClassRevenue / totalRevenue) *
          100 *
          100
      ) / 100;

    const coursePercentage =
      Math.round(
        (reportData.detailedRevenue.courseRevenue / totalRevenue) * 100 * 100
      ) / 100;

    const reservationPercentage =
      Math.round(
        (reportData.reservationFees.totalAmount / totalRevenue) * 100 * 100
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
            {reportData && (
              <>
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Tổng doanh thu"
                        value={reportData.overview.totalRevenue}
                        prefix={<DollarCircleOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#3f8600" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          <ClockCircleOutlined /> Cập nhật:{" "}
                          {dayjs(reportData.overview.lastUpdated).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Tổng số giao dịch"
                        value={reportData.overview.transactionCount}
                        prefix={<TransactionOutlined />}
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#0070f3" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu học 1-1"
                        value={
                          reportData.detailedRevenue.oneOnOneRegistrationRevenue
                        }
                        prefix={<HomeOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#722ed1" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.detailedRevenue
                              .oneOnOneRegistrationRevenue /
                              reportData.overview.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu |{" "}
                          {reportData.detailedRevenue.oneOnOneRegistrationCount}{" "}
                          đăng ký
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu lớp học tại trung tâm"
                        value={reportData.detailedRevenue.centerClassRevenue}
                        prefix={<TeamOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.detailedRevenue.centerClassRevenue /
                              reportData.overview.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu |{" "}
                          {reportData.detailedRevenue.centerClassCount} lớp
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Doanh thu khóa học tự học"
                        value={reportData.detailedRevenue.courseRevenue}
                        prefix={<VideoCameraOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#0070f3" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.detailedRevenue.courseRevenue /
                              reportData.overview.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu |{" "}
                          {reportData.detailedRevenue.courseCount} khóa học
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Phí xử lý đơn"
                        value={reportData.reservationFees.totalAmount}
                        prefix={<ShoppingCartOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#faad14" }}
                      />
                      <div className="mt-2 text-xs">
                        <span>
                          {(
                            (reportData.reservationFees.totalAmount /
                              reportData.overview.totalRevenue) *
                            100
                          ).toFixed(2)}
                          % tổng doanh thu | {reportData.reservationFees.count}{" "}
                          giao dịch
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
                    dataSource={reportData.timePeriods.monthly.filter(
                      (m) => m.transactionCount > 0
                    )}
                    columns={getMonthlyRevenueColumns()}
                    pagination={false}
                    rowKey="month"
                    size="middle"
                  />
                </Card>

                {/* Bảng doanh thu theo tuần */}
                <Card className="mb-6">
                  <Title level={4}>Doanh thu theo tuần</Title>
                  <Table
                    dataSource={reportData.timePeriods.weekly}
                    columns={getWeeklyRevenueColumns()}
                    pagination={false}
                    rowKey="weekNumber"
                    size="middle"
                  />
                </Card>

                {/* Bảng doanh thu theo ngày */}
                <Card className="mb-6">
                  <Title level={4}>Doanh thu theo ngày</Title>
                  <Table
                    dataSource={reportData.timePeriods.daily}
                    columns={getDailyRevenueColumns()}
                    pagination={false}
                    rowKey="date"
                    size="middle"
                  />
                </Card>

                {/* Thanh toán học 1-1 */}
                <Card className="mb-6">
                  <Title level={4}>Chi tiết thanh toán học 1-1</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card title="Thanh toán giai đoạn 40%" type="inner">
                        <Statistic
                          title="Tổng thanh toán"
                          value={
                            reportData.oneOnOnePaymentPhases.phase40Payments
                              .totalAmount
                          }
                          prefix={<DollarCircleOutlined />}
                          suffix="VND"
                          formatter={(value) => `${value.toLocaleString()}`}
                        />
                        <p>
                          Số giao dịch:{" "}
                          {
                            reportData.oneOnOnePaymentPhases.phase40Payments
                              .count
                          }
                        </p>
                        <Table
                          dataSource={
                            reportData.oneOnOnePaymentPhases.phase40Payments
                              .payments
                          }
                          columns={getPhase40PaymentsColumns()}
                          pagination={{ pageSize: 5 }}
                          size="small"
                          rowKey={(record) => record.transactionDate}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title="Thanh toán giai đoạn 60%" type="inner">
                        <Statistic
                          title="Tổng thanh toán"
                          value={
                            reportData.oneOnOnePaymentPhases.phase60Payments
                              .totalAmount
                          }
                          prefix={<DollarCircleOutlined />}
                          suffix="VND"
                          formatter={(value) => `${value.toLocaleString()}`}
                        />
                        <p>
                          Số giao dịch:{" "}
                          {
                            reportData.oneOnOnePaymentPhases.phase60Payments
                              .count
                          }
                        </p>
                        <Table
                          dataSource={
                            reportData.oneOnOnePaymentPhases.phase60Payments
                              .payments
                          }
                          columns={getPhase60PaymentsColumns()}
                          pagination={{ pageSize: 5 }}
                          size="small"
                          rowKey={(record) => record.transactionDate}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Card>

                {/* Thanh toán lớp học tại trung tâm */}
                <Card className="mb-6">
                  <Title level={4}>
                    Chi tiết thanh toán lớp học tại trung tâm
                  </Title>
                  <Statistic
                    title="Tổng thanh toán"
                    value={reportData.centerClassPayments.totalAmount}
                    prefix={<DollarCircleOutlined />}
                    suffix="VND"
                    formatter={(value) => `${value.toLocaleString()}`}
                  />
                  <p>
                    Số giao dịch:{" "}
                    {reportData.centerClassPayments.initialPayments.count}
                  </p>
                  <Table
                    dataSource={
                      reportData.centerClassPayments.initialPayments.payments
                    }
                    columns={getCenterClassPaymentsColumns()}
                    pagination={{ pageSize: 10 }}
                    size="small"
                    rowKey={(record) => record.transactionDate}
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
