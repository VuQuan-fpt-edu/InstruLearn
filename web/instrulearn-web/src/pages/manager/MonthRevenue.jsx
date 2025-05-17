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
  Empty,
  Spin,
  Tabs,
  Collapse,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TransactionOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const MonthRevenue = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month() + 1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [year, month]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Revenue/monthly/${year}/${month}`
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

  const handlePreviousMonth = () => {
    let newYear = year;
    let newMonth = month - 1;

    if (newMonth === 0) {
      newMonth = 12;
      newYear = year - 1;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;

    if (newMonth === 13) {
      newMonth = 1;
      newYear = year + 1;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const formatMoney = (amount) => {
    return `${amount?.toLocaleString()} VND`;
  };

  const monthName = moment(`${year}-${month}-01`).locale("vi").format("MMMM");

  const renderWeeklyRevenueTabs = () => {
    if (
      !revenueData ||
      !revenueData.weeklyBreakdown ||
      revenueData.weeklyBreakdown.length === 0
    ) {
      return <Empty description="Không có dữ liệu doanh thu theo tuần" />;
    }

    return (
      <Tabs defaultActiveKey="0" type="card">
        {revenueData.weeklyBreakdown.map((week, index) => (
          <TabPane
            tab={`Tuần ${week.weekInMonth} (${moment(week.startDate).format(
              "DD/MM"
            )} - ${moment(week.endDate).format("DD/MM")})`}
            key={index}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card>
                  <Descriptions
                    title="Thông tin tổng quát"
                    bordered
                    size="small"
                    column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 2, xs: 1 }}
                  >
                    <Descriptions.Item label="Tổng doanh thu">
                      {formatMoney(week.totalRevenue)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số giao dịch">
                      {week.transactionCount}
                    </Descriptions.Item>
                    <Descriptions.Item label="Từ ngày">
                      {moment(week.startDate).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đến ngày">
                      {moment(week.endDate).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Collapse defaultActiveKey={["1"]}>
                  <Panel header="Chi tiết doanh thu theo loại" key="1">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Card title="Học 1-1" size="small">
                          <Statistic
                            title="Số đăng ký"
                            value={
                              week.detailedRevenue.oneOnOneRegistrations.count
                            }
                            suffix="đăng ký"
                          />
                          <Statistic
                            title="Doanh thu"
                            value={
                              week.detailedRevenue.oneOnOneRegistrations
                                .totalRevenue
                            }
                            suffix="VND"
                            precision={0}
                          />
                          <Divider />
                          <Statistic
                            title="Thanh toán 60%"
                            value={
                              week.detailedRevenue.oneOnOnePaymentPhases
                                .phase60Payments.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng tiền 60%"
                            value={
                              week.detailedRevenue.oneOnOnePaymentPhases
                                .phase60Payments.totalAmount
                            }
                            suffix="VND"
                            precision={0}
                          />
                          <Divider />
                          <Statistic
                            title="Thanh toán 40%"
                            value={
                              week.detailedRevenue.oneOnOnePaymentPhases
                                .phase40Payments.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng tiền 40%"
                            value={
                              week.detailedRevenue.oneOnOnePaymentPhases
                                .phase40Payments.totalAmount
                            }
                            suffix="VND"
                            precision={0}
                          />
                        </Card>
                      </Col>

                      <Col xs={24} sm={12} md={8}>
                        <Card title="Lớp học tại trung tâm" size="small">
                          <Statistic
                            title="Số đăng ký"
                            value={
                              week.detailedRevenue.centerClassRegistrations
                                .count
                            }
                            suffix="đăng ký"
                          />
                          <Statistic
                            title="Doanh thu"
                            value={
                              week.detailedRevenue.centerClassRegistrations
                                .totalRevenue
                            }
                            suffix="VND"
                            precision={0}
                          />
                          <Divider />
                          <Statistic
                            title="Số lần thanh toán"
                            value={
                              week.detailedRevenue.centerClassPayments
                                .initialPayments.count
                            }
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng tiền thanh toán"
                            value={
                              week.detailedRevenue.centerClassPayments
                                .initialPayments.totalAmount
                            }
                            suffix="VND"
                            precision={0}
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
                            value={week.detailedRevenue.coursePurchases.count}
                            suffix="khóa"
                          />
                          <Statistic
                            title="Doanh thu khóa học"
                            value={
                              week.detailedRevenue.coursePurchases.totalRevenue
                            }
                            suffix="VND"
                            precision={0}
                          />
                          <Divider />
                          <Statistic
                            title="Số phí đặt chỗ"
                            value={week.detailedRevenue.reservationFees.count}
                            suffix="lần"
                          />
                          <Statistic
                            title="Tổng phí đặt chỗ"
                            value={
                              week.detailedRevenue.reservationFees.totalAmount
                            }
                            suffix="VND"
                            precision={0}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>
              </Col>

              {week.dailyBreakdown && week.dailyBreakdown.length > 0 && (
                <Col span={24}>
                  <Card title="Doanh thu theo ngày">
                    <Table
                      dataSource={week.dailyBreakdown}
                      rowKey="date"
                      pagination={false}
                      columns={[
                        {
                          title: "Ngày",
                          dataIndex: "date",
                          key: "date",
                          render: (date) => moment(date).format("DD/MM/YYYY"),
                        },
                        {
                          title: "Thứ",
                          dataIndex: "dayOfWeek",
                          key: "dayOfWeek",
                          render: (day) => {
                            const dayMap = {
                              Monday: "Thứ Hai",
                              Tuesday: "Thứ Ba",
                              Wednesday: "Thứ Tư",
                              Thursday: "Thứ Năm",
                              Friday: "Thứ Sáu",
                              Saturday: "Thứ Bảy",
                              Sunday: "Chủ Nhật",
                            };
                            return dayMap[day] || day;
                          },
                        },
                        {
                          title: "Doanh thu",
                          dataIndex: "revenue",
                          key: "revenue",
                          render: (amount) => formatMoney(amount),
                        },
                        {
                          title: "Số giao dịch",
                          dataIndex: "transactionCount",
                          key: "transactionCount",
                        },
                      ]}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>
        ))}
      </Tabs>
    );
  };

  const renderRevenueByType = () => {
    if (
      !revenueData ||
      !revenueData.revenueByType ||
      revenueData.revenueByType.length === 0
    ) {
      return <Empty description="Không có dữ liệu doanh thu theo loại" />;
    }

    // Tính tổng doanh thu để tính phần trăm
    const totalRevenue =
      revenueData.summary.totalRevenue ||
      revenueData.revenueByType.reduce((acc, item) => acc + item.revenue, 0);

    return (
      <List
        itemLayout="horizontal"
        dataSource={revenueData.revenueByType}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={`${
                item.paymentTypeName || item.revenueType
              } - ${formatMoney(item.revenue)}`}
              description={`${item.transactionCount} giao dịch`}
            />
            <div>
              <Tag color="blue">
                {((item.revenue / totalRevenue) * 100).toFixed(2)}%
              </Tag>
            </div>
          </List.Item>
        )}
      />
    );
  };

  const handleDatePickerChange = (date) => {
    if (date) {
      setYear(date.year());
      setMonth(date.month() + 1);
    }
  };

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="MonthRevenue"
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
                  onClick={handlePreviousMonth}
                />
              </Col>
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Doanh thu tháng {month}/{year}
                </Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNextMonth}
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
                    {month.toString().padStart(2, "0") + "/" + year}
                  </button>
                  {showCalendar && (
                    <div className="absolute right-0 z-50 mt-2">
                      <Calendar
                        value={new Date(year, month - 1, 1)}
                        onChange={(d) => {
                          setYear(d.getFullYear());
                          setMonth(d.getMonth() + 1);
                          setShowCalendar(false);
                        }}
                        locale="vi-VN"
                        view="year"
                        onClickMonth={(d) => {
                          setYear(d.getFullYear());
                          setMonth(d.getMonth() + 1);
                          setShowCalendar(false);
                        }}
                        tileClassName={({ date: d, view }) =>
                          view === "year" &&
                          d.getMonth() + 1 === month &&
                          d.getFullYear() === year
                            ? "bg-blue-500 text-white rounded-full"
                            : ""
                        }
                        className="border-0 w-full [&_.react-calendar__tile]:h-10 [&_.react-calendar__tile]:w-10 [&_.react-calendar__tile]:text-base"
                      />
                    </div>
                  )}
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
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Tổng doanh thu"
                      value={revenueData.summary.totalRevenue}
                      prefix={<DollarOutlined />}
                      suffix="VND"
                      precision={0}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Tổng số giao dịch"
                      value={revenueData.summary.transactionCount}
                      prefix={<TransactionOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Trung bình/ngày"
                      value={revenueData.summary.dailyAverage}
                      prefix={<BarChartOutlined />}
                      suffix="VND"
                      precision={0}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Số tuần"
                      value={revenueData.summary.weekCount}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Thông tin tháng" className="mt-4">
                <Descriptions
                  bordered
                  size="small"
                  column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 2, xs: 1 }}
                >
                  <Descriptions.Item label="Năm">
                    {revenueData.monthInfo.year}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tháng">
                    {revenueData.monthInfo.month}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên tháng">
                    {revenueData.monthInfo.monthName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu">
                    {moment(revenueData.monthInfo.startDate).format(
                      "DD/MM/YYYY"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày kết thúc">
                    {moment(revenueData.monthInfo.endDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Doanh thu theo tuần" className="mt-4">
                {renderWeeklyRevenueTabs()}
              </Card>

              <Card title="Doanh thu theo loại" className="mt-4">
                {renderRevenueByType()}
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

export default MonthRevenue;
