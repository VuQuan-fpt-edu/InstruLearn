import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  Tooltip,
  message,
  Spin,
  Progress,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Dữ liệu mẫu - thay thế bằng API call thực tế
  const mockData = {
    totalStudents: 250,
    totalTeachers: 25,
    totalClasses: 45,
    totalRevenue: 25000000,
    recentEnrollments: [
      {
        id: 1,
        studentName: "Nguyễn Văn A",
        courseName: "Guitar cơ bản",
        type: "Lớp học tại trung tâm",
        date: "2024-03-20",
        status: "Đã xác nhận",
      },
      {
        id: 2,
        studentName: "Trần Thị B",
        courseName: "Piano nâng cao",
        type: "Học 1-1 tại nhà",
        date: "2024-03-19",
        status: "Chờ xác nhận",
      },
      {
        id: 3,
        studentName: "Lê Văn C",
        courseName: "Violin cơ bản",
        type: "Khóa học tự học",
        date: "2024-03-18",
        status: "Đã xác nhận",
      },
    ],
    upcomingClasses: [
      {
        id: 1,
        className: "Guitar cơ bản - Lớp 1",
        teacher: "Nguyễn Văn X",
        time: "09:00 - 10:30",
        date: "2024-03-21",
        students: 12,
        status: "Sắp diễn ra",
      },
      {
        id: 2,
        className: "Piano nâng cao - Lớp 2",
        teacher: "Trần Thị Y",
        time: "14:00 - 15:30",
        date: "2024-03-21",
        students: 8,
        status: "Sắp diễn ra",
      },
      {
        id: 3,
        className: "Violin cơ bản - Lớp 3",
        teacher: "Lê Văn Z",
        time: "16:00 - 17:30",
        date: "2024-03-21",
        students: 10,
        status: "Sắp diễn ra",
      },
    ],
    revenueStats: {
      onlineCourses: 8000000,
      centerClasses: 10000000,
      privateLessons: 7000000,
      total: 25000000,
    },
    attendanceStats: {
      present: 85,
      absent: 15,
      total: 100,
    },
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Trong thực tế, bạn sẽ gọi API thực tế ở đây
      setTimeout(() => {
        setDashboardData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải dữ liệu dashboard");
      setLoading(false);
    }
  };

  // Cột cho bảng đăng ký gần đây
  const recentEnrollmentColumns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
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
      title: "Ngày đăng ký",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{ color: status === "Đã xác nhận" ? "#52c41a" : "#faad14" }}
        >
          {status}
        </span>
      ),
    },
  ];

  // Cột cho bảng lớp học sắp tới
  const upcomingClassesColumns = [
    {
      title: "Tên lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher",
      key: "teacher",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Số học viên",
      dataIndex: "students",
      key: "students",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: "#1890ff" }}>
          <ClockCircleOutlined style={{ marginRight: 5 }} />
          {status}
        </span>
      ),
    },
  ];

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
            <Title level={3}>Tổng quan</Title>
            <Text type="secondary">
              Thống kê tổng hợp về hoạt động của trung tâm
            </Text>
          </div>

          <Spin spinning={loading}>
            {dashboardData && (
              <>
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng số học viên"
                        value={dashboardData.totalStudents}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng số giáo viên"
                        value={dashboardData.totalTeachers}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng số lớp học"
                        value={dashboardData.totalClasses}
                        prefix={<BarChartOutlined />}
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng doanh thu"
                        value={dashboardData.totalRevenue}
                        prefix={<DollarCircleOutlined />}
                        suffix="VND"
                        formatter={(value) => `${value.toLocaleString()}`}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Thống kê doanh thu và điểm danh */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} md={12}>
                    <Card title="Thống kê doanh thu">
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span>Khóa học tự học</span>
                          <span>
                            {(
                              (dashboardData.revenueStats.onlineCourses /
                                dashboardData.revenueStats.total) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          percent={Math.round(
                            (dashboardData.revenueStats.onlineCourses /
                              dashboardData.revenueStats.total) *
                              100
                          )}
                          strokeColor="#1890ff"
                        />
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span>Lớp học tại trung tâm</span>
                          <span>
                            {(
                              (dashboardData.revenueStats.centerClasses /
                                dashboardData.revenueStats.total) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          percent={Math.round(
                            (dashboardData.revenueStats.centerClasses /
                              dashboardData.revenueStats.total) *
                              100
                          )}
                          strokeColor="#52c41a"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Học 1-1 tại nhà</span>
                          <span>
                            {(
                              (dashboardData.revenueStats.privateLessons /
                                dashboardData.revenueStats.total) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          percent={Math.round(
                            (dashboardData.revenueStats.privateLessons /
                              dashboardData.revenueStats.total) *
                              100
                          )}
                          strokeColor="#722ed1"
                        />
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Thống kê điểm danh">
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span>Có mặt</span>
                          <span>{dashboardData.attendanceStats.present}%</span>
                        </div>
                        <Progress
                          percent={dashboardData.attendanceStats.present}
                          strokeColor="#52c41a"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Vắng mặt</span>
                          <span>{dashboardData.attendanceStats.absent}%</span>
                        </div>
                        <Progress
                          percent={dashboardData.attendanceStats.absent}
                          strokeColor="#ff4d4f"
                        />
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Bảng đăng ký gần đây */}
                <Card className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <Title level={4}>Đăng ký gần đây</Title>
                    <Tooltip title="Làm mới">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchDashboardData}
                      />
                    </Tooltip>
                  </div>
                  <Table
                    columns={recentEnrollmentColumns}
                    dataSource={dashboardData.recentEnrollments}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>

                {/* Bảng lớp học sắp tới */}
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <Title level={4}>Lớp học sắp tới</Title>
                    <Tooltip title="Làm mới">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchDashboardData}
                      />
                    </Tooltip>
                  </div>
                  <Table
                    columns={upcomingClassesColumns}
                    dataSource={dashboardData.upcomingClasses}
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

export default Dashboard;
