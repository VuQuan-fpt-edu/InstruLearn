import React, { useState, useEffect } from "react";
import { Layout, Button, Avatar, Dropdown, Badge, message } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
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

const TeacherHeader = ({ collapsed, toggleCollapsed, selectedMenu }) => {
  const [username, setUsername] = useState("Teacher");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userProfile = await getCurrentUser();
        setUsername(userProfile.username);
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
        navigate("/teacher/profile");
        break;
      case "settings":
        navigate("/teacher/settings");
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
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ giảng dạy" },
    { key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const notificationItems = [
    {
      key: "1",
      icon: <CalendarOutlined />,
      label: "Lớp Piano cơ bản sẽ bắt đầu trong 30 phút",
      time: "Hôm nay, 14:30",
    },
    {
      key: "2",
      icon: <MessageOutlined />,
      label: "Phụ huynh của Nguyễn Văn A đã gửi tin nhắn",
      time: "10 phút trước",
    },
    {
      key: "3",
      icon: <CalendarOutlined />,
      label: "Yêu cầu đổi lịch học từ học viên Trần Thị B",
      time: "1 giờ trước",
    },
  ];

  const getPageTitle = () => {
    switch (selectedMenu) {
      case "dashboard":
        return "Tổng quan";
      case "schedule":
        return "Lịch giảng dạy";
      case "students":
        return "Quản lý học viên";
      case "courses":
        return "Khóa học của tôi";
      case "assessments":
        return "Đánh giá học viên";
      case "messages":
        return "Tin nhắn";
      default:
        return "Teacher Portal";
    }
  };

  return (
    <Header className="bg-white shadow px-4 flex items-center justify-between h-16">
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className="mr-4"
        />
        <span className="text-lg font-medium">{getPageTitle()}</span>
      </div>
      <div className="flex items-center space-x-4">
        <Dropdown
          menu={{
            items: notificationItems.map((item) => ({
              key: item.key,
              label: (
                <div>
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                </div>
              ),
            })),
          }}
          placement="bottomRight"
          arrow
          trigger={["click"]}
        >
          <Badge count={notificationItems.length} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </Dropdown>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => handleMenuClick(key),
          }}
          placement="bottomRight"
          arrow
          trigger={["click"]}
        >
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="ml-2 hidden md:inline">{username}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TeacherHeader;
