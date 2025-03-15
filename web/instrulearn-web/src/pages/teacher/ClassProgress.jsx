import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Progress,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Divider,
  Button,
  Tooltip,
  Steps,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import { useParams } from "react-router-dom";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Dữ liệu mẫu cho tiến độ lớp học
const classProgressData = {
  classInfo: {
    className: "Guitar cơ bản A1",
    totalLessons: 24,
    completedLessons: 10,
    totalStudents: 15,
    averageAttendance: 90,
    averageScore: 85,
    startDate: "2025-01-15",
    endDate: "2025-04-15",
    nextLesson: "2025-03-20",
  },
  syllabus: [
    {
      week: 1,
      title: "Giới thiệu và Cơ bản",
      lessons: [
        {
          id: 1,
          name: "Giới thiệu về đàn Guitar",
          status: "completed",
          completion: 100,
          date: "2025-01-15",
        },
        {
          id: 2,
          name: "Các thế bấm cơ bản",
          status: "completed",
          completion: 100,
          date: "2025-01-17",
        },
      ],
    },
    {
      week: 2,
      title: "Hợp âm cơ bản",
      lessons: [
        {
          id: 3,
          name: "Hợp âm trưởng",
          status: "completed",
          completion: 100,
          date: "2025-01-22",
        },
        {
          id: 4,
          name: "Hợp âm thứ",
          status: "completed",
          completion: 100,
          date: "2025-01-24",
        },
      ],
    },
    {
      week: 3,
      title: "Kỹ thuật đánh gẩy",
      lessons: [
        {
          id: 5,
          name: "Pattern đánh gẩy cơ bản",
          status: "in_progress",
          completion: 60,
          date: "2025-01-29",
        },
        {
          id: 6,
          name: "Các kỹ thuật đánh gẩy nâng cao",
          status: "not_started",
          completion: 0,
          date: "2025-01-31",
        },
      ],
    },
  ],
  studentProgress: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      attendance: 95,
      completion: 88,
      exercises: 90,
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      attendance: 85,
      completion: 92,
      exercises: 95,
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      attendance: 75,
      completion: 70,
      exercises: 65,
    },
  ],
};

const ClassProgress = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const { classId } = useParams();

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setProgressData(classProgressData);
      setLoading(false);
    }, 1000);
  }, [classId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "processing";
      case "not_started":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Đã hoàn thành";
      case "in_progress":
        return "Đang học";
      case "not_started":
        return "Chưa bắt đầu";
      default:
        return "Không xác định";
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
          {progressData && (
            <>
              <Card className="mb-4">
                <Title level={4}>
                  <BookOutlined className="mr-2" />
                  {progressData.classInfo.className} - Theo dõi tiến độ
                </Title>
                <Text type="secondary">
                  Theo dõi và quản lý tiến độ học tập của lớp
                </Text>
              </Card>

              <Row gutter={16} className="mb-4">
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tiến độ khóa học"
                      value={Math.round(
                        (progressData.classInfo.completedLessons /
                          progressData.classInfo.totalLessons) *
                          100
                      )}
                      suffix="%"
                      prefix={<BarChartOutlined />}
                    />
                    <Progress
                      percent={Math.round(
                        (progressData.classInfo.completedLessons /
                          progressData.classInfo.totalLessons) *
                          100
                      )}
                      size="small"
                      status="active"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={progressData.classInfo.totalStudents}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Chuyên cần trung bình"
                      value={progressData.classInfo.averageAttendance}
                      suffix="%"
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Điểm trung bình"
                      value={progressData.classInfo.averageScore}
                      suffix="/100"
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={16}>
                  <Card title="Nội dung khóa học" className="mb-4">
                    {progressData.syllabus.map((week) => (
                      <div key={week.week} className="mb-4">
                        <Title level={5}>
                          Tuần {week.week}: {week.title}
                        </Title>
                        <Steps
                          progressDot
                          current={
                            week.lessons.filter(
                              (lesson) => lesson.status === "completed"
                            ).length
                          }
                          items={week.lessons.map((lesson) => ({
                            title: lesson.name,
                            description: (
                              <Space direction="vertical" size={0}>
                                <Text>{getStatusText(lesson.status)}</Text>
                                <Text type="secondary">
                                  {new Date(lesson.date).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </Text>
                              </Space>
                            ),
                            status: getStatusColor(lesson.status),
                          }))}
                        />
                        <Divider />
                      </div>
                    ))}
                  </Card>
                </Col>

                <Col span={8}>
                  <Card title="Tiến độ học viên" className="mb-4">
                    <List
                      itemLayout="horizontal"
                      dataSource={progressData.studentProgress}
                      renderItem={(student) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={student.avatar} />}
                            title={student.name}
                            description={
                              <Space direction="vertical" size={0}>
                                <Space>
                                  <Text type="secondary">Chuyên cần:</Text>
                                  <Progress
                                    percent={student.attendance}
                                    size="small"
                                    style={{ width: 100 }}
                                  />
                                </Space>
                                <Space>
                                  <Text type="secondary">Hoàn thành:</Text>
                                  <Progress
                                    percent={student.completion}
                                    size="small"
                                    style={{ width: 100 }}
                                  />
                                </Space>
                                <Space>
                                  <Text type="secondary">Bài tập:</Text>
                                  <Progress
                                    percent={student.exercises}
                                    size="small"
                                    style={{ width: 100 }}
                                  />
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>

                  <Card>
                    <Space direction="vertical" className="w-full">
                      <Statistic
                        title="Buổi học tiếp theo"
                        value={new Date(
                          progressData.classInfo.nextLesson
                        ).toLocaleDateString("vi-VN")}
                        prefix={<CalendarOutlined />}
                      />
                      <Divider />
                      <Space direction="vertical" className="w-full">
                        <Text strong>
                          <FileTextOutlined className="mr-2" />
                          Thông tin khóa học
                        </Text>
                        <Text>
                          Bắt đầu:{" "}
                          {new Date(
                            progressData.classInfo.startDate
                          ).toLocaleDateString("vi-VN")}
                        </Text>
                        <Text>
                          Kết thúc:{" "}
                          {new Date(
                            progressData.classInfo.endDate
                          ).toLocaleDateString("vi-VN")}
                        </Text>
                        <Text>
                          Số buổi học: {progressData.classInfo.completedLessons}
                          /{progressData.classInfo.totalLessons}
                        </Text>
                      </Space>
                    </Space>
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

export default ClassProgress;
