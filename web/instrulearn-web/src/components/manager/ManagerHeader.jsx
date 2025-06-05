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
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";

const { Header } = Layout;

const ManagerHeader = ({ collapsed, toggleCollapsed, selectedMenu }) => {
  const [username, setUsername] = useState("Manager");
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
        navigate("/manager/profile");
        break;
      case "settings":
        navigate("/manager/settings");
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
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ quản lý" },
    // { key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const getPageTitle = () => {
    switch (selectedMenu) {
      case "dashboard":
        return "Tổng quan";
      case "revenue":
        return "Báo cáo doanh thu";
      case "teacher-performance":
        return "Hiệu suất giáo viên";
      case "class-status":
        return "Trạng thái lớp học";
      case "promotions":
        return "Quản lý khuyến mại";
      default:
        return "Manager Portal";
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
        {/* <Badge count={3} className="mr-4">
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

export default ManagerHeader;
