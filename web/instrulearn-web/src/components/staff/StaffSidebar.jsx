import React from "react";
import { Layout, Menu, Avatar, Input } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  MessageOutlined,
  FileTextOutlined,
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  BellOutlined,
  SettingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Search } = Input;

const StaffSidebar = ({ collapsed, setCollapsed, selectedMenu }) => {
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate("/staff");
        break;
      case "course-management":
        navigate("/staff/course-management");
        break;
      case "add-course":
        navigate("/staff/add-course");
        break;
      case "musical instrument-type":
        navigate("/staff/instrument-management");
        break;
      case "item-type":
        navigate("/staff/item-type");
        break;
      case "teacher-center-schedule":
        navigate("/staff/teacher-center-schedule");
        break;
      case "teacher-personal-schedule":
        navigate("/staff/teacher-personal-schedule");
        break;
      case "student-center-schedule":
        navigate("/staff/student-center-schedule");
        break;
      case "student-personal-schedule":
        navigate("/staff/student-personal-schedule");
        break;
      case "schedule-requests":
        navigate("/staff/schedule-requests");
        break;
      case "makeup-requests":
        navigate("/staff/makeup-requests");
        break;
      case "class-progress":
        navigate("/staff/class-progress");
        break;
      case "assessments":
        navigate("/staff/assessments");
        break;
      case "grades":
        navigate("/staff/grades");
        break;
      case "student-messages":
        navigate("/staff/student-messages");
        break;
      case "announcements":
        navigate("/staff/announcements");
        break;
      case "resources":
        navigate("/staff/resources");
        break;
      case "teacher-personal-schedule":
        navigate("/staff/teacher-personal-schedule");
        break;
      case "student-personal-schedule":
        navigate("/staff/student-personal-schedule");
        break;
      case "makeup-class-requests":
        navigate("/staff/makeup-class-requests");
        break;
      case "booking1-1-requests":
        navigate("/staff/booking1-1-requests");
        break;
      case "class-requests":
        navigate("/staff/center-class-registration");
        break;
      case "refund-requests":
        navigate("/staff/refund-requests");
        break;
      case "add-class":
        navigate("/staff/add-class");
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
      key: "course-management",
      icon: <BookOutlined />,
      label: "Quản lý khóa học",
      children: [
        { key: "course-management", label: "Quản lý gói khóa học" },
        { key: "add-course", label: "Thêm gói khóa học" },
        { key: "musical instrument-type", label: "Quản lý nhạc cụ" },
        { key: "item-type", label: "Nội dung gói khóa học" },
      ],
    },
    {
      key: "teacher-schedules",
      icon: <ScheduleOutlined />,
      label: "Lịch dạy giáo viên",
      children: [
        { key: "teacher-center-schedule", label: "Lịch dạy Trung tâm" },
        { key: "teacher-personal-schedule", label: "Lịch dạy tại nhà" },
      ],
    },
    {
      key: "student-schedules",
      icon: <CalendarOutlined />,
      label: "Lịch học học viên",
      children: [
        { key: "student-center-schedule", label: "Lịch học Trung tâm" },
        { key: "student-personal-schedule", label: "Lịch học tại nhà" },
      ],
    },
    {
      key: "schedule-changes",
      icon: <BellOutlined />,
      label: "Yêu cầu",
      children: [
        { key: "class-requests", label: "Tham gia lớp" },
        { key: "makeup-class-requests", label: "Yêu cầu học bù" },
        { key: "booking1-1-requests", label: "Học 1-1" },
        { key: "refund-requests", label: "Yêu cầu hoàn tiền" },
      ],
    },
    {
      key: "progress-tracking",
      icon: <SolutionOutlined />,
      label: "Theo dõi lớp học",
      children: [
        { key: "add-class", label: "Thêm lớp" },
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

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="shadow-lg overflow-auto fixed left-0 top-0 bottom-0"
      style={{
        background: "#001529",
        height: "100vh",
        zIndex: 999,
      }}
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
        style={{
          height: "calc(100vh - 180px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      />
      <div
        className="fixed bottom-0 w-[250px] p-4 border-t border-gray-700 bg-[#001529]"
        style={{ width: collapsed ? 80 : 250 }}
      >
        {!collapsed && (
          <div className="flex items-center">
            <Avatar size="large" icon={<UserOutlined />} />
            <div className="ml-3 text-white">
              <div className="font-medium">Nguyễn Thị Nhân Viên</div>
              <div className="text-xs text-gray-400">Nhân viên quản lý</div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default StaffSidebar;
