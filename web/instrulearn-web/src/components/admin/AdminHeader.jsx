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

const AdminHeader = ({ collapsed, toggleCollapsed, selectedMenu }) => {
  const [username, setUsername] = useState("Admin");
  const navigate = useNavigate();

  useEffect(() => {
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
        navigate("/admin/profile");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      case "logout":
        localStorage.clear();
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ quản trị viên" },
    // { key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const notificationItems = [
    {
      key: "1",
      icon: <CalendarOutlined />,
      label: "Yêu cầu tạo tài khoản mới từ nhân viên",
      time: "5 phút trước",
    },
    {
      key: "2",
      icon: <MessageOutlined />,
      label: "Báo cáo hoạt động từ nhân viên",
      time: "30 phút trước",
    },
    {
      key: "3",
      icon: <CalendarOutlined />,
      label: "Cần duyệt yêu cầu thay đổi lịch học",
      time: "1 giờ trước",
    },
  ];

  const getPageTitle = () => {
    switch (selectedMenu) {
      case "dashboard":
        return "Tổng quan";
      case "staff":
        return "Quản lý tài khoản Staff";
      case "manager":
        return "Quản lý tài khoản Manager";
      case "learner":
        return "Quản lý tài khoản Learner";
      case "all-packages":
        return "Tất cả gói dịch vụ";
      case "add-package":
        return "Thêm gói dịch vụ mới";
      case "all-users":
        return "Tất cả người dùng";
      case "add-user":
        return "Thêm người dùng mới";
      case "roles":
        return "Quản lý phân quyền";
      case "analytics":
        return "Thống kê";
      case "settings":
        return "Cài đặt hệ thống";
      default:
        return "Admin Portal";
    }
  };

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

export default AdminHeader;
