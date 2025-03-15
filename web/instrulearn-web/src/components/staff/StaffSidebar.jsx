import React from "react";
import { Layout, Menu, Avatar, Input } from "antd";
import {
  BookOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  MessageOutlined,
  FileTextOutlined,
  DashboardOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Search } = Input;

const SSidebar = ({
  collapsed,
  selectedMenu,
  onMenuSelect,
  toggleCollapsed,
}) => {
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    onMenuSelect(key);
    if (key === "musical instrument-type") {
      navigate("/instrument-management");
    }
    if (key === "dashboard") {
      navigate("/staff");
    }
    if (key === "add-course") {
      navigate("/add-course");
    }
    if (key === "course-management") {
      navigate("/course-management");
    }
    if (key === "item-type") {
      navigate("/item-type");
    }
  };

  const menuItems = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "Khoá học",
      children: [
        { key: "course-management", label: "Quản lý khóa học" },
        { key: "add-course", label: "Thêm khóa học" },
        { key: "student-progress", label: "Tiến độ học viên" },
      ],
    },
    {
      key: "musical instruments",
      icon: <BookOutlined />,
      label: "Nhạc cụ",
      children: [{ key: "musical instrument-type", label: "Loại nhạc cụ" }],
    },
    {
      key: "item type",
      icon: <BookOutlined />,
      label: "Định dạng",
      children: [{ key: "item-type", label: "Loại định dạng" }],
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
    { key: "resources", icon: <FileTextOutlined />, label: "Tài nguyên" },
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
          {collapsed ? "SP" : "STAFF PORTAL"}
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
              <div className="font-medium">Trần Văn A</div>
              <div className="text-xs text-gray-400">Giảng viên</div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default SSidebar;
