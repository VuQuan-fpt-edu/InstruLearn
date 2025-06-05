import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Badge,
  message,
  Typography,
} from "antd";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CalendarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";

const { Header } = Layout;

const StaffHeader = ({ collapsed, toggleCollapsed, selectedMenu }) => {
  const [username, setUsername] = useState("Staff");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user's information when component mounts
    const fetchUserInfo = async () => {
      try {
        const userProfile = await getCurrentUser();
        if (userProfile && userProfile.username) {
          setUsername(userProfile.username);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error("Không thể tải thông tin người dùng");
      }
    };

    fetchUserInfo();
  }, []);

  const handleMenuClick = (key) => {
    switch (key) {
      case "profile":
        navigate("/staff/profile");
        break;
      case "settings":
        navigate("/staff/settings");
        break;
      case "logout":
        // Clear local storage and navigate to login
        localStorage.clear();
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ nhân viên" },
    // { key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const notificationItems = [
    {
      key: "1",
      icon: <CalendarOutlined />,
      label: "Yêu cầu học bù mới từ giáo viên Nguyễn Văn A",
      time: "5 phút trước",
    },
    {
      key: "2",
      icon: <MessageOutlined />,
      label: "Giáo viên Trần Thị B đã gửi báo cáo tiến độ",
      time: "30 phút trước",
    },
    {
      key: "3",
      icon: <CalendarOutlined />,
      label: "Cần duyệt lịch dạy mới cho lớp Piano nâng cao",
      time: "1 giờ trước",
    },
  ];

  const getPageTitle = () => {
    switch (selectedMenu) {
      case "dashboard":
        return "Tổng quan";
      case "course-management":
        return "Quản lý gói khóa học";
      case "add-course":
        return "Thêm gói khóa học";
      case "musical instrument-type":
        return "Quản lý nhạc cụ";
      case "item-type":
        return "Nội dung gói khóa học";
      case "teacher-center-schedule":
        return "Lịch dạy Trung tâm";
      case "teacher-personal-schedule":
        return "Lịch dạy cá nhân";
      case "schedule-requests":
        return "Yêu cầu thay đổi";
      case "student-center-schedule":
        return "Lịch học Trung tâm";
      case "student-personal-schedule":
        return "Lịch học cá nhân";
      case "class-progress":
        return "Tiến độ lớp";
      case "assessments":
        return "Đánh giá";
      case "grades":
        return "Điểm số";
      case "student-messages":
        return "Tin nhắn học viên";
      case "announcements":
        return "Thông báo";
      case "resources":
        return "Tài nguyên";
      default:
        return "Staff Portal";
    }
  };

  const userMenu = (
    <MenuOutlined
      className="text-xl cursor-pointer mr-4"
      onClick={handleMenuClick}
    />
  );

  return (
    <Header
      className="flex items-center justify-between px-6 bg-white shadow-sm"
      style={{
        position: "fixed",
        right: 0,
        width: `calc(100% - ${collapsed ? "80px" : "250px"})`,
        marginLeft: 0,
        height: "64px",
        zIndex: 998,
        transition: "all 0.2s",
      }}
    >
      <div className="flex items-center">
        <MenuOutlined
          className="text-xl cursor-pointer mr-4"
          onClick={toggleCollapsed}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {getPageTitle()}
        </Typography.Title>
      </div>
      <div className="flex items-center">
        {/* <Badge count={5} className="mr-4">
          <BellOutlined className="text-xl cursor-pointer" />
        </Badge> */}
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => handleMenuClick(key),
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="ml-2">{username}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default StaffHeader;
