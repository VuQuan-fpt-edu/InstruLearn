import React, { useState } from "react";
import {
  Layout,
  Menu,
  Table,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Input,
  Tag,
  Progress,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  BookOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  BellOutlined,
  SettingOutlined,
  SearchOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  FileTextOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const StaffDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "Khoá học",
      children: [
        { key: "assigned-courses", label: "Khoá học được giao" },
        { key: "course-materials", label: "Giáo trình" },
        { key: "student-progress", label: "Tiến độ học viên" },
      ],
    },
    {
      key: "schedules",
      icon: <ScheduleOutlined />,
      label: "Lịch dạy",
      children: [
        { key: "upcoming-classes", label: "Lớp sắp tới" },
        { key: "calendar", label: "Lịch tháng" },
        { key: "schedule-requests", label: "Yêu cầu thay đổi" },
      ],
    },
    {
      key: "progress",
      icon: <SolutionOutlined />,
      label: "Theo dõi lớp học",
      children: [
        { key: "class-progress", label: "Tiến độ lớp" },
        { key: "assessments", label: "Đánh giá" },
        { key: "grades", label: "Điểm số" },
      ],
    },
    {
      key: "communication",
      icon: <MessageOutlined />,
      label: "Liên lạc",
      children: [
        { key: "student-messages", label: "Tin nhắn học viên" },
        { key: "announcements", label: "Thông báo" },
      ],
    },
    {
      key: "resources",
      icon: <FileTextOutlined />,
      label: "Tài nguyên",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const notificationItems = [
    {
      key: "1",
      label: "Nhắc nhở: Lớp Java bắt đầu sau 30 phút",
    },
    {
      key: "2",
      label: "Học viên Nguyễn Văn A đã nộp bài tập",
    },
    {
      key: "3",
      label: "Yêu cầu thay đổi lịch học từ lớp Python",
    },
  ];

  // Dữ liệu mẫu cho bảng khoá học
  const courseData = [
    {
      key: "1",
      id: "JAVA-101",
      course: "Java Programming Basics",
      schedule: "Thứ 2, 4, 6: 18:00-20:00",
      students: 15,
      progress: 65,
      status: "Đang diễn ra",
    },
    {
      key: "2",
      id: "PY-202",
      course: "Python for Data Analysis",
      schedule: "Thứ 3, 5: 19:00-21:00",
      students: 12,
      progress: 40,
      status: "Đang diễn ra",
    },
    {
      key: "3",
      id: "WEB-303",
      course: "Web Development with React",
      schedule: "Thứ 7, CN: 09:00-12:00",
      students: 18,
      progress: 25,
      status: "Mới bắt đầu",
    },
    {
      key: "4",
      id: "NET-404",
      course: ".NET Application Development",
      schedule: "Thứ 2, 4: 17:30-19:30",
      students: 10,
      progress: 90,
      status: "Sắp kết thúc",
    },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên khoá học", dataIndex: "course", key: "course" },
    { title: "Lịch học", dataIndex: "schedule", key: "schedule" },
    { title: "Số học viên", dataIndex: "students", key: "students" },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          status={
            progress < 30 ? "exception" : progress < 70 ? "active" : "success"
          }
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        let icon = <CheckCircleOutlined />;

        if (status === "Mới bắt đầu") {
          color = "blue";
          icon = <ClockCircleOutlined />;
        } else if (status === "Đang diễn ra") {
          color = "geekblue";
          icon = <ScheduleOutlined />;
        } else if (status === "Sắp kết thúc") {
          color = "orange";
          icon = <CalendarOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button type="primary" size="small">
            Cập nhật
          </Button>
          <Button type="default" size="small">
            Chi tiết
          </Button>
          <Button type="dashed" size="small">
            Điểm danh
          </Button>
        </div>
      ),
    },
  ];

  // Dữ liệu cho thống kê tổng quan
  const summaryData = {
    totalCourses: 4,
    totalStudents: 55,
    upcomingClasses: 3,
    pendingAssignments: 12,
  };

  // Lịch học hôm nay
  const todaySchedule = [
    {
      time: "09:00 - 12:00",
      course: "Web Development with React",
      room: "P.302",
    },
    {
      time: "14:00 - 16:00",
      course: "Python for Data Analysis",
      room: "P.105",
    },
    {
      time: "18:00 - 20:00",
      course: "Java Programming Basics",
      room: "P.201",
    },
  ];

  return (
    <Layout className="h-screen">
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="shadow-lg"
        style={{ background: "#001529" }}
      >
        <div className="flex items-center justify-center py-4 h-16">
          {!collapsed ? (
            <div className="text-white text-xl font-bold">STAFF PORTAL</div>
          ) : (
            <div className="text-white text-xl font-bold">SP</div>
          )}
        </div>
        <div className="px-4 mb-4">
          {!collapsed && (
            <Search
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-lg"
            />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          defaultOpenKeys={["courses"]}
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => setSelectedMenu(key)}
          items={menuItems}
          className="border-r-0"
        />
        <div className="absolute bottom-0 w-full">
          {!collapsed && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center">
                <Avatar size="large" icon={<UserOutlined />} />
                <div className="ml-3 text-white">
                  <div className="font-medium">Trần Văn A</div>
                  <div className="text-xs text-gray-400">Giảng viên</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Sider>
      <Layout>
        <Header className="bg-white shadow px-4 flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className="mr-4"
            />
            <span className="text-lg font-medium">
              {selectedMenu === "dashboard" && "Tổng quan"}
              {selectedMenu.includes("courses") && "Quản lý khoá học"}
              {selectedMenu.includes("schedules") && "Lịch giảng dạy"}
              {selectedMenu.includes("progress") && "Theo dõi lớp học"}
              {selectedMenu.includes("communication") && "Liên lạc"}
              {selectedMenu.includes("resources") && "Tài nguyên"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Dropdown
              menu={{ items: notificationItems }}
              placement="bottomRight"
              arrow
            >
              <Badge count={3} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="flex items-center justify-center"
                />
              </Badge>
            </Dropdown>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <span className="ml-2 hidden md:inline">Trần Văn A</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50">
          {selectedMenu === "dashboard" && (
            <>
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Khoá học đang dạy"
                      value={summaryData.totalCourses}
                      prefix={<BookOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={summaryData.totalStudents}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Lớp học hôm nay"
                      value={summaryData.upcomingClasses}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Bài tập chưa chấm"
                      value={summaryData.pendingAssignments}
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Card title="Khoá học đang giảng dạy" className="mb-6">
                    <Table
                      dataSource={courseData}
                      columns={columns.filter((col) => col.key !== "actions")}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Lịch dạy hôm nay" className="mb-6">
                    {todaySchedule.map((item, index) => (
                      <div
                        key={index}
                        className="mb-3 pb-3 border-b last:border-0"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{item.time}</span>
                          <Tag color="blue">{item.room}</Tag>
                        </div>
                        <div>{item.course}</div>
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {selectedMenu === "assigned-courses" && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Khoá học được phân công
              </h2>
              <Table
                dataSource={courseData}
                columns={columns}
                pagination={{ pageSize: 10 }}
                className="border rounded"
              />
            </div>
          )}

          {/* Các nội dung khác có thể được hiển thị ở đây dựa trên selectedMenu */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;
