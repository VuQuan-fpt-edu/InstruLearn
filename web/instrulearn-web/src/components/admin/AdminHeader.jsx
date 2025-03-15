import React from "react";
import { Layout, Button, Avatar, Dropdown, Badge } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AHeader = ({ collapsed, toggleCollapsed, selectedMenu }) => {
  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ" },
    { key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const notificationItems = [
    { key: "1", label: "Người dùng mới đăng ký" },
    { key: "2", label: "Đơn hàng mới" },
    { key: "3", label: "Cập nhật hệ thống" },
  ];

  const pageTitles = {
    dashboard: "Tổng quan",
    lessons: "Quản lý bài học",
    packages: "Quản lý gói dịch vụ",
    users: "Quản lý người dùng",
    analytics: "Thống kê",
    settings: "Cài đặt",
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
        <span className="text-lg font-medium">
          {selectedMenu === "dashboard" && "Tổng quan"}
          {selectedMenu === "all-lessons" && "Tất cả bài học"}
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
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="ml-2 hidden md:inline">Admin User</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AHeader;
