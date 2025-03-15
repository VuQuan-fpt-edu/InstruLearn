import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Table,
  Calendar,
  Badge,
  Avatar,
  List,
  Progress,
  Tag,
  Button,
  Tooltip,
  Divider,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  StarOutlined,
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  BellOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

// Dữ liệu mẫu cho dashboard
const dashboardData = {
  statistics: {
    totalStudents: 45,
    totalClasses: 5,
    activeClasses: 3,
    completedClasses: 2,
    averageRating: 4.8,
    teachingHours: 24,
    upcomingClasses: 3,
    completionRate: 92,
  },
  todayClasses: [
    {
      id: 1,
      className: "Guitar cơ bản A1",
      time: "08:00 - 09:30",
      room: "Phòng 101",
      students: 15,
      type: "Tại trung tâm",
      status: "Sắp diễn ra",
    },
    {
      id: 2,
      studentName: "Nguyễn Văn A",
      time: "14:00 ",
      address: "123 Nguyễn Văn Cừ, Q5",
      type: "Dạy 1-1",
      status: "Đã xác nhận",
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: "evaluation",
      content: "Đã đánh giá lớp Guitar cơ bản A1",
      time: "10 phút trước",
    },
    {
      id: 2,
      type: "class",
      content: "Hoàn thành buổi học Piano 1-1",
      time: "2 giờ trước",
    },
    {
      id: 3,
      type: "attendance",
      content: "Đã điểm danh lớp Guitar nâng cao B2",
      time: "3 giờ trước",
    },
  ],
  topStudents: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      course: "Guitar cơ bản",
      progress: 95,
      performance: 9.2,
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      course: "Piano cơ bản",
      progress: 90,
      performance: 8.8,
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      course: "Guitar đệm hát",
      progress: 88,
      performance: 8.5,
    },
  ],
  upcomingSchedule: [
    {
      date: "2025-03-15",
      classes: [
        {
          time: "08:00",
          title: "Guitar cơ bản A1",
          type: "class",
        },
      ],
    },
    {
      date: "2025-03-16",
      classes: [
        {
          time: "14:00",
          title: "Dạy 1-1 Piano",
          type: "private",
        },
      ],
    },
  ],
};

const TeacherDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setData(dashboardData);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Sắp diễn ra":
        return "processing";
      case "Đã xác nhận":
        return "success";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "evaluation":
        return <StarOutlined style={{ color: "#1890ff" }} />;
      case "class":
        return <BookOutlined style={{ color: "#52c41a" }} />;
      case "attendance":
        return <CheckCircleOutlined style={{ color: "#722ed1" }} />;
      default:
        return <BellOutlined />;
    }
  };

  return (
    <Layout className="min-h-screen">
      <TeacherSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <TeacherHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          {data && (
            <>
              <Card className="mb-4">
                <Title level={4}>Tổng quan</Title>
                <Text type="secondary">
                  Thống kê và theo dõi hoạt động giảng dạy
                </Text>
              </Card>

              <Row gutter={16} className="mb-4">
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={data.statistics.totalStudents}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Số giờ dạy tháng này"
                      value={data.statistics.teachingHours}
                      prefix={<ClockCircleOutlined />}
                      suffix="giờ"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Đánh giá trung bình"
                      value={data.statistics.averageRating}
                      prefix={<StarOutlined />}
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tỷ lệ hoàn thành"
                      value={data.statistics.completionRate}
                      prefix={<CheckCircleOutlined />}
                      suffix="%"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={16}>
                  <Card title="Lịch dạy hôm nay" className="mb-4">
                    <Table
                      dataSource={data.todayClasses}
                      pagination={false}
                      columns={[
                        {
                          title: "Thời gian",
                          dataIndex: "time",
                          key: "time",
                          render: (text) => (
                            <Space>
                              <ClockCircleOutlined />
                              {text}
                            </Space>
                          ),
                        },
                        {
                          title: "Thông tin",
                          key: "info",
                          render: (_, record) => (
                            <Space direction="vertical" size={0}>
                              <Text strong>
                                {record.className || record.studentName}
                              </Text>
                              <Text type="secondary">
                                {record.room || record.address}
                              </Text>
                            </Space>
                          ),
                        },
                        {
                          title: "Loại",
                          dataIndex: "type",
                          key: "type",
                          render: (text) => (
                            <Tag color={text === "Dạy 1-1" ? "purple" : "blue"}>
                              {text}
                            </Tag>
                          ),
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          key: "status",
                          render: (text) => (
                            <Tag color={getStatusColor(text)}>{text}</Tag>
                          ),
                        },
                        {
                          title: "",
                          key: "action",
                          render: (_, record) => (
                            <Button
                              type="primary"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() =>
                                navigate(
                                  record.type === "Dạy 1-1"
                                    ? "/teacher/private-schedule"
                                    : "/teacher/center-schedule"
                                )
                              }
                            >
                              Chi tiết
                            </Button>
                          ),
                        },
                      ]}
                    />
                  </Card>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="Học viên xuất sắc" className="mb-4">
                        <List
                          itemLayout="horizontal"
                          dataSource={data.topStudents}
                          renderItem={(student) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar src={student.avatar} />}
                                title={student.name}
                                description={
                                  <Space direction="vertical" size={0}>
                                    <Text type="secondary">
                                      {student.course}
                                    </Text>
                                    <Space>
                                      <Text type="secondary">Tiến độ:</Text>
                                      <Progress
                                        percent={student.progress}
                                        size="small"
                                        style={{ width: 80 }}
                                      />
                                    </Space>
                                  </Space>
                                }
                              />
                              <Tag color="gold">
                                {student.performance.toFixed(1)}
                              </Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="Hoạt động gần đây">
                        <List
                          itemLayout="horizontal"
                          dataSource={data.recentActivities}
                          renderItem={(activity) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={getActivityIcon(activity.type)}
                                title={activity.content}
                                description={activity.time}
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Col>

                <Col span={8}>
                  <Card title="Thống kê lớp học" className="mb-4">
                    <Space direction="vertical" className="w-full">
                      <Statistic
                        title="Tổng số lớp"
                        value={data.statistics.totalClasses}
                        prefix={<BookOutlined />}
                      />
                      <Divider />
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Đang hoạt động"
                            value={data.statistics.activeClasses}
                            valueStyle={{ color: "#52c41a" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Đã hoàn thành"
                            value={data.statistics.completedClasses}
                            valueStyle={{ color: "#1890ff" }}
                          />
                        </Col>
                      </Row>
                      <Divider />
                      <Statistic
                        title="Lớp sắp khai giảng"
                        value={data.statistics.upcomingClasses}
                        prefix={<RiseOutlined />}
                      />
                    </Space>
                  </Card>

                  <Card title="Lịch dạy sắp tới">
                    <Calendar
                      fullscreen={false}
                      dateCellRender={(date) => {
                        const dateStr = date.format("YYYY-MM-DD");
                        const scheduleData = data.upcomingSchedule.find(
                          (s) => s.date === dateStr
                        );
                        if (!scheduleData) return null;
                        return (
                          <ul className="events">
                            {scheduleData.classes.map((item, index) => (
                              <li key={index}>
                                <Badge
                                  status={
                                    item.type === "private"
                                      ? "processing"
                                      : "success"
                                  }
                                  text={
                                    <Tooltip
                                      title={`${item.time} - ${item.title}`}
                                    >
                                      <span className="truncate block">
                                        {item.title}
                                      </span>
                                    </Tooltip>
                                  }
                                />
                              </li>
                            ))}
                          </ul>
                        );
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherDashboard;
