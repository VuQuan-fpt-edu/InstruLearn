import React from "react";
import { Layout, Menu, Avatar, Input } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  MessageOutlined,
  FileTextOutlined,
  DashboardOutlined,
  UserOutlined,
  SearchOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  StarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Search } = Input;

const TeacherSidebar = ({
  collapsed,
  selectedMenu,
  onMenuSelect,
  toggleCollapsed,
}) => {
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    onMenuSelect(key);
    switch (key) {
      case "dashboard":
        navigate("/teacher");
        break;
      case "center-schedule":
        navigate("/teacher/center-schedule");
        break;
      case "students":
        navigate("/teacher/students");
        break;
      case "courses":
        navigate("/teacher/courses");
        break;
      case "assessments":
        navigate("/teacher/student-evaluation");
        break;
      case "private-schedule":
        navigate("/teacher/private-schedule");
        break;
      case "class-progress":
        navigate("/teacher/class-progress");
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "teaching",
      icon: <CalendarOutlined />,
      label: "Lịch dạy",
      children: [
        { key: "center-schedule", label: "Lịch ở trung tâm" },
        { key: "private-schedule", label: "Lịch dạy tại nhà" },
        { key: "schedule-change", label: "Yêu cầu thay đổi" },
      ],
    },
    {
      key: "student-management",
      icon: <TeamOutlined />,
      label: "Quản lý học viên",
      children: [
        { key: "students", label: "Danh sách học viên" },
        { key: "class-progress", label: "Theo dõi tiến độ" },
        { key: "student-feedback", label: "Phản hồi học viên" },
      ],
    },
    {
      key: "course-content",
      icon: <BookOutlined />,
      label: "Nội dung giảng dạy",
      children: [
        { key: "courses", label: "Khóa học của tôi" },
        { key: "materials", label: "Tài liệu giảng dạy" },
        { key: "assignments", label: "Bài tập & Kiểm tra" },
      ],
    },
    {
      key: "assessment",
      icon: <SolutionOutlined />,
      label: "Đánh giá",
      children: [
        { key: "assessments", label: "Đánh giá học viên" },
        { key: "grades", label: "Quản lý điểm số" },
        { key: "reports", label: "Báo cáo tiến độ" },
      ],
    },
    {
      key: "communication",
      icon: <MessageOutlined />,
      label: "Liên lạc",
      children: [
        { key: "messages", label: "Tin nhắn" },
        { key: "announcements", label: "Thông báo lớp học" },
        { key: "parent-communication", label: "Liên hệ phụ huynh" },
      ],
    },
    {
      key: "resources",
      icon: <FileTextOutlined />,
      label: "Tài nguyên giảng dạy",
    },
  ];

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="shadow-lg"
      style={{ background: "#001529" }}
    >
      <div className="flex items-center justify-center py-4 h-16">
        <div className="text-white text-xl font-bold">
          {collapsed ? "TP" : "TEACHER PORTAL"}
        </div>
      </div>
      {!collapsed && (
        <div className="px-4 mb-4">
          <Search
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="rounded-lg"
          />
        </div>
      )}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedMenu]}
        onSelect={handleMenuSelect}
        items={menuItems}
      />
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        {!collapsed && (
          <div className="flex items-center">
            <Avatar size="large" icon={<UserOutlined />} />
            <div className="ml-3 text-white">
              <div className="font-medium">Nguyễn Văn Giảng</div>
              <div className="text-xs text-gray-400">Giáo viên Piano</div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default TeacherSidebar;
