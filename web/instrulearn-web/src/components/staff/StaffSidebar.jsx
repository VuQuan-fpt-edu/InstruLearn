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
  SoundOutlined,
  LineChartOutlined,
  DollarOutlined,
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
        navigate("/staff/instrument-type-management");
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
      case "syllabus":
        navigate("/staff/syllabus");
        break;
      case "grades":
        navigate("/staff/grades");
        break;
      case "student-messages":
        navigate("/staff/student-messages");
        break;
      case "major-test":
        navigate("/staff/major-test");
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
      case "class-management":
        navigate("/staff/class-management");
        break;
      case "instrument-management":
        navigate("/staff/instrument-management");
        break;
      case "teacher-management":
        navigate("/staff/teacher-management");
        break;
      case "syllabus":
        navigate("/staff/syllabus");
        break;
      case "feedback-management":
        navigate("/staff/feedback-management");
        break;
      case "response-management":
        navigate("/staff/response-management");
        break;
      case "student-notification":
        navigate("/staff/student-notification");
        break;
      case "change-teacher":
        navigate("/staff/change-teacher");
        break;
      case "change-all-teacher":
        navigate("/staff/change-all-teacher");
        break;
      case "teacher-evaluation-question-management":
        navigate("/staff/teacher-evaluation-question-management");
        break;
      case "teacher-feedback-management":
        navigate("/staff/teacher-feedback-management");
        break;
      case "self-assessment-management":
        navigate("/staff/self-assessment-management");
        break;
      case "payment-registration":
        navigate("/staff/payment-registration");
        break;
      case "tuition-management":
        navigate("/staff/tuition-management");
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
        { key: "course-management", label: "Quản lý khóa học" },
        { key: "add-course", label: "Thêm khóa học" },
        {
          key: "musical instrument-type",
          label: "Quản lý nhạc cụ khóa học",
        },
        { key: "item-type", label: "Quản lý nội dung khóa học" },
      ],
    },
    {
      key: "payment",
      icon: <DollarOutlined />,
      label: "Thanh toán",
      children: [
        { key: "payment-registration", label: "Quản lý giá xử lý đơn" },
        { key: "tuition-management", label: "Quản lý học phí lớp học" },
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
        { key: "change-teacher", label: "Thay đổi giáo viên" },
        // { key: "change-all-teacher", label: "Yêu cầu đổi giáo viên" },
        { key: "makeup-class-requests", label: "Yêu cầu học bù" },
        { key: "booking1-1-requests", label: "Học theo yêu cầu" },
        // { key: "refund-requests", label: "Yêu cầu hoàn tiền" },
      ],
    },
    {
      key: "progress-tracking",
      icon: <SolutionOutlined />,
      label: "Theo dõi lớp học",
      children: [
        { key: "class-management", label: "Quản lý lớp học" },
        // { key: "class-progress", label: "Tiến độ lớp" },
        // { key: "syllabus", label: "Giáo trình" },
        // { key: "grades", label: "Điểm số" },
      ],
    },
    {
      key: "feedback",
      icon: <MessageOutlined />,
      label: "Phản hồi từ học viên",
      children: [
        { key: "feedback-management", label: "Quản lý câu hỏi " },
        { key: "response-management", label: "Quản lý phản hồi " },
        { key: "student-notification", label: "Thông báo đổi giáo viên" },
      ],
    },
    {
      key: "teacher-evaluation",
      icon: <MessageOutlined />,
      label: "Đánh giá từ giáo viên",
      children: [
        {
          key: "teacher-evaluation-question-management",
          label: "Quản lý câu hỏi ",
        },
        {
          key: "teacher-feedback-management",
          label: "Quản lý phản hồi",
        },
      ],
    },
    {
      key: "self-assessment",
      icon: <LineChartOutlined />,
      label: "Quản lý Tự Đánh Giá",
      children: [
        {
          key: "self-assessment-management",
          label: "Trình Độ Người Học",
        },
      ],
    },
    {
      key: "instrument-management",
      icon: <SoundOutlined />,
      label: "Quản lý nhạc cụ",
      children: [
        { key: "instrument-management", label: "Quản lý nhạc cụ" },
        { key: "major-test", label: "Đề bài" },
      ],
    },
    {
      key: "teacher-management",
      icon: <UserOutlined />,
      label: "Quản lý giáo viên",
      children: [{ key: "teacher-management", label: "Quản lý giáo viên" }],
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
