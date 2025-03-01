import React, { useState } from "react";
import {
  Layout,
  Menu,
  Table,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Input,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  SearchOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "lessons",
      icon: <BookOutlined />,
      label: "Bài học",
      children: [
        { key: "all-lessons", label: "Tất cả bài học" },
        { key: "add-lesson", label: "Thêm bài học" },
        { key: "categories", label: "Danh mục" },
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
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "Thống kê",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const notificationItems = [
    {
      key: "1",
      label: "Người dùng mới đăng ký",
    },
    {
      key: "2",
      label: "Đơn hàng mới",
    },
    {
      key: "3",
      label: "Cập nhật hệ thống",
    },
  ];

  // Dữ liệu mẫu cho bảng
  const sampleData = [
    {
      key: "1",
      id: "1",
      name: "Khoá học Python cơ bản",
      price: "599,000 đ",
      status: "Hoạt động",
    },
    {
      key: "2",
      id: "2",
      name: "Khoá học JavaScript nâng cao",
      price: "899,000 đ",
      status: "Hoạt động",
    },
    {
      key: "3",
      id: "3",
      name: "Khoá học ReactJS",
      price: "799,000 đ",
      status: "Tạm ngưng",
    },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên khoá học", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", key: "price" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Thao tác",
      key: "actions",
      render: () => (
        <div className="flex space-x-2">
          <Button type="primary" size="small">
            Sửa
          </Button>
          <Button type="default" size="small">
            Xem
          </Button>
          <Button danger size="small">
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout className="h-screen">
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="shadow-lg"
        style={{ background: "#001529" }}
      >
        <div className="flex items-center justify-center py-4 h-16">
          {!collapsed ? (
            <div className="text-white text-xl font-bold">ADMIN PORTAL</div>
          ) : (
            <div className="text-white text-xl font-bold">AP</div>
          )}
        </div>
        <div className="px-4 mb-4">
          {!collapsed && (
            <Search
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-lg"
            />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          defaultOpenKeys={["lessons"]}
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => setSelectedMenu(key)}
          items={menuItems}
          className="border-r-0"
        />
        <div className="absolute bottom-0 w-full">
          {!collapsed && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center">
                <Avatar size="large" icon={<UserOutlined />} />
                <div className="ml-3 text-white">
                  <div className="font-medium">Admin</div>
                  <div className="text-xs text-gray-400">admin@example.com</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Sider>
      <Layout>
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
              {selectedMenu === "lessons" && "Quản lý bài học"}
              {selectedMenu === "packages" && "Quản lý gói dịch vụ"}
              {selectedMenu === "users" && "Quản lý người dùng"}
              {selectedMenu === "analytics" && "Thống kê"}
              {selectedMenu === "settings" && "Cài đặt"}
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
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <span className="ml-2 hidden md:inline">Admin User</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Danh sách khoá học</h2>
            <Table
              dataSource={sampleData}
              columns={columns}
              pagination={{ pageSize: 10 }}
              className="border rounded"
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
