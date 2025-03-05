import React from "react";
import { Layout, Menu, Avatar, Input } from "antd";
import {
  UserOutlined,
  BookOutlined,
  ShoppingOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  DashboardOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Search } = Input;

const ASidebar = ({
  collapsed,
  selectedMenu,
  onMenuSelect,
  toggleCollapsed,
}) => {
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    onMenuSelect(key);
    if (key === "dashboard") {
      navigate("/admin");
    }
    if (key === "staff") {
      navigate("/staff-management");
    }
    if (key === "manager") {
      navigate("/add-course");
    }
    if (key === "learner") {
      navigate("/course-management");
    }
  };
  const menuItems = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "accounts",
      icon: <BookOutlined />,
      label: "Tài khoản",
      children: [
        { key: "staff", label: "Tài khoản Staff" },
        { key: "manager", label: "Tài khoản Manager" },
        { key: "learner", label: "Tài khoản Learner" },
      ],
    },
    {
      key: "packages",
      icon: <ShoppingOutlined />,
      label: "Gói dịch vụ",
      children: [
        { key: "all-packages", label: "Tất cả gói" },
        { key: "add-package", label: "Thêm gói mới" },
      ],
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Người dùng",
      children: [
        { key: "all-users", label: "Tất cả người dùng" },
        { key: "add-user", label: "Thêm người dùng" },
        { key: "roles", label: "Phân quyền" },
      ],
    },
    { key: "analytics", icon: <BarChartOutlined />, label: "Thống kê" },
    { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="shadow-lg"
      style={{ background: "#001529" }}
    >
      <div className="flex items-center justify-center py-4 h-16">
        <div className="text-white text-xl font-bold">
          {collapsed ? "AP" : "ADMIN PORTAL"}
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
              <div className="font-medium">Admin</div>
              <div className="text-xs text-gray-400">admin@example.com</div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default ASidebar;
