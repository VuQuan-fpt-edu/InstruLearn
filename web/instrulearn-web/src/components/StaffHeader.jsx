import React from "react";
import { Layout, Button, Avatar, Dropdown, Badge } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const SHeader = ({ collapsed, toggleCollapsed, selectedMenu }) => {
  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ" },
    { key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const notificationItems = [
    { key: "1", label: "Nhắc nhở: Lớp Java bắt đầu sau 30 phút" },
    { key: "2", label: "Học viên Nguyễn Văn A đã nộp bài tập" },
    { key: "3", label: "Yêu cầu thay đổi lịch học từ lớp Python" },
  ];

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
          {selectedMenu.includes("courses") && "Quản lý khoá học"}
          {selectedMenu.includes("schedules") && "Lịch giảng dạy"}
          {selectedMenu.includes("progress") && "Theo dõi lớp học"}
          {selectedMenu.includes("communication") && "Liên lạc"}
          {selectedMenu.includes("resources") && "Tài nguyên"}
          {selectedMenu.includes("musical instrument-type") &&
            "Quản lý nhạc cụ"}
          {selectedMenu.includes("add-course") && "Thêm khóa học"}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          arrow
        >
          <Badge count={3} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </Dropdown>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="ml-2 hidden md:inline">Trần Văn A</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default SHeader;
