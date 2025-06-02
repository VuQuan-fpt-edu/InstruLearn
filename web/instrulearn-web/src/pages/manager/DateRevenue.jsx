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
  DatePicker,
  Empty,
  Spin,
  Descriptions,
  Collapse,
  Progress,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TransactionOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const DateRevenue = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [date, setDate] = useState(() => moment());
  const [showCalendar, setShowCalendar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("date value: ", date, "isMoment:", moment.isMoment(date));
    fetchRevenueData();
  }, [date]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Revenue/daily?date=${formattedDate}`
      );

      if (response.data.isSucceed) {
        setRevenueData(response.data.data);
        message.success(response.data.message);
      } else {
        message.error("Không thể tải dữ liệu doanh thu");
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    setDate(date.clone().subtract(1, "day"));
  };

  const handleNextDay = () => {
    setDate(date.clone().add(1, "day"));
  };

  const handleDateChange = (newDate) => {
    if (newDate && moment.isMoment(newDate) && newDate.isValid()) {
      setDate(newDate);
    }
  };

  const formatMoney = (amount) => {
    return `${amount?.toLocaleString()} VND`;
  };

  const getDayOfWeekInVietnamese = (dayOfWeek) => {
    const dayMap = {
      Monday: "Thứ Hai",
      Tuesday: "Thứ Ba",
      Wednesday: "Thứ Tư",
      Thursday: "Thứ Năm",
      Friday: "Thứ Sáu",
      Saturday: "Thứ Bảy",
      Sunday: "Chủ Nhật",
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const getHourlyRevenueColumns = () => [
    {
      title: "Thời gian",
      dataIndex: "timeDisplay",
      key: "timeDisplay",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue) => formatMoney(revenue),
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
    },
    {
      title: "Phần trăm doanh thu",
      key: "revenuePercentage",
      render: (_, record) => {
        const totalRevenue = revenueData?.summary?.totalRevenue || 1;
        const percentage =
          totalRevenue > 0 ? (record.revenue / totalRevenue) * 100 : 0;

        return (
          <Tooltip title={`${percentage.toFixed(2)}%`}>
            <Progress
              percent={percentage}
              size="small"
              showInfo={false}
              strokeColor={percentage > 30 ? "#52c41a" : "#1890ff"}
            />
            <span>{percentage.toFixed(2)}%</span>
          </Tooltip>
        );
      },
    },
  ];

  const handleExportReport = () => {
    message.success(
      "Đã xuất báo cáo doanh thu ngày " + date.format("DD/MM/YYYY")
    );
  };

  const renderHourlyData = () => {
    if (
      !revenueData ||
      !revenueData.hourlyBreakdown ||
      revenueData.hourlyBreakdown.length === 0
    ) {
      return <Empty description="Không có dữ liệu doanh thu theo giờ" />;
    }

    // Lọc chỉ hiển thị những giờ có doanh thu
    const filteredData = revenueData.hourlyBreakdown.filter(
      (item) => item.transactionCount > 0
    );

    if (filteredData.length === 0) {
      return <Empty description="Không có doanh thu trong ngày này" />;
    }

    return (
      <Table
        dataSource={filteredData}
        columns={getHourlyRevenueColumns()}
        rowKey="hour"
        pagination={false}
      />
    );
  };

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="DateRevenue"
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
            <Row gutter={16} align="middle">
              <Col>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePreviousDay}
                />
              </Col>
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Doanh thu ngày {date.format("DD/MM/YYYY")}
                </Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNextDay}
                />
              </Col>
              <Col
                flex="auto"
                style={{ textAlign: "right", position: "relative" }}
              >
                <Space>
                  <button
                    className="border px-4 py-2 rounded bg-white shadow mr-2"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    {date.format("DD/MM/YYYY")}
                  </button>
                  {showCalendar && (
                    <div className="absolute right-0 z-50 mt-2">
                      <Calendar
                        value={date.toDate()}
                        onChange={(d) => {
                          setDate(moment(d));
                          setShowCalendar(false);
                        }}
                        locale="vi-VN"
                        tileClassName={({ date: d }) =>
                          d.getDate() === date.date() &&
                          d.getMonth() === date.month() &&
                          d.getFullYear() === date.year()
                            ? "bg-blue-500 text-white rounded-full"
                            : ""
                        }
                        className="border-0 w-full [&_.react-calendar__tile]:h-10 [&_.react-calendar__tile]:w-10 [&_.react-calendar__tile]:text-base"
                      />
                    </div>
                  )}
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchRevenueData}
                    tooltip="Làm mới dữ liệu"
                  />
                  {/* <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportReport}
                  >
                    Xuất báo cáo
                  </Button> */}
                </Space>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : revenueData ? (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Tổng doanh thu"
                      value={revenueData.summary.totalRevenue}
                      prefix={<DollarOutlined />}
                      suffix="VND"
                      precision={0}
                      formatter={(value) => `${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Tổng số giao dịch"
                      value={revenueData.summary.transactionCount}
                      prefix={<TransactionOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Giờ cao điểm"
                      value={revenueData.summary.peakHour || "Không có"}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Card
                title={`Thông tin ngày ${revenueData.date}`}
                className="mt-4"
              >
                <Descriptions
                  bordered
                  size="small"
                  column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Ngày">
                    {revenueData.date}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thứ">
                    {getDayOfWeekInVietnamese(revenueData.dayOfWeek)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng doanh thu">
                    {formatMoney(revenueData.summary.totalRevenue)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Doanh thu theo giờ" className="mt-4">
                {renderHourlyData()}
              </Card>

              <Card title="Chi tiết doanh thu theo loại" className="mt-4">
                <Collapse defaultActiveKey={["1"]}>
                  <Panel header="Chi tiết doanh thu theo loại" key="1">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Card title="Học theo yêu cầu" size="small">
                          <Statistic
                            title="Số đăng ký"
                            value={
                              revenueData.detailedRevenue.oneOnOneRegistrations
                                .count
                            }
                            suffix="đăng ký"
                          />
                          <Statistic
                            title="Doanh thu"
                            value={
                              revenueData.detailedRevenue.oneOnOneRegistrations
                                .totalRevenue
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                          <Divider />
                          <Statistic
                            title="Thanh toán 60%"
                            value={
                              revenueData.detailedRevenue.oneOnOnePaymentPhases
                                .phase60Payments.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng tiền 60%"
                            value={
                              revenueData.detailedRevenue.oneOnOnePaymentPhases
                                .phase60Payments.totalAmount
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                          <Divider />
                          <Statistic
                            title="Thanh toán 40%"
                            value={
                              revenueData.detailedRevenue.oneOnOnePaymentPhases
                                .phase40Payments.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng tiền 40%"
                            value={
                              revenueData.detailedRevenue.oneOnOnePaymentPhases
                                .phase40Payments.totalAmount
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                        </Card>
                      </Col>

                      <Col xs={24} sm={12} md={8}>
                        <Card title="Lớp học tại trung tâm" size="small">
                          <Statistic
                            title="Số đăng ký"
                            value={
                              revenueData.detailedRevenue
                                .centerClassRegistrations.count
                            }
                            suffix="đăng ký"
                          />
                          <Statistic
                            title="Doanh thu"
                            value={
                              revenueData.detailedRevenue
                                .centerClassRegistrations.totalRevenue
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                          <Divider />
                          <Statistic
                            title="Số lần thanh toán"
                            value={
                              revenueData.detailedRevenue.centerClassPayments
                                .initialPayments.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng tiền thanh toán"
                            value={
                              revenueData.detailedRevenue.centerClassPayments
                                .initialPayments.totalAmount
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                        </Card>
                      </Col>

                      <Col xs={24} sm={12} md={8}>
                        <Card
                          title="Khóa học online và Phí đặt chỗ"
                          size="small"
                        >
                          <Statistic
                            title="Số khóa học mua"
                            value={
                              revenueData.detailedRevenue.coursePurchases.count
                            }
                            suffix="khóa"
                          />
                          <Statistic
                            title="Doanh thu khóa học"
                            value={
                              revenueData.detailedRevenue.coursePurchases
                                .totalRevenue
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                          <Divider />
                          <Statistic
                            title="Số phí đặt chỗ"
                            value={
                              revenueData.detailedRevenue.reservationFees.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng phí đặt chỗ"
                            value={
                              revenueData.detailedRevenue.reservationFees
                                .totalAmount
                            }
                            suffix="VND"
                            precision={0}
                            formatter={(value) => `${value.toLocaleString()}`}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>
              </Card>
            </>
          ) : (
            <Empty description="Không có dữ liệu doanh thu" />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

// Thêm Divider component bị thiếu
const Divider = ({ style }) => (
  <div
    style={{
      height: "1px",
      background: "#f0f0f0",
      margin: "12px 0",
      ...style,
    }}
  />
);

export default DateRevenue;
