import React from "react";
import { Layout, Menu, Avatar, Input } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  ShoppingOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  SearchOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Search } = Input;

const AdminSidebar = ({ collapsed, setCollapsed, selectedMenu }) => {
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate("/admin");
        break;
      case "staff":
        navigate("/admin/staff-management");
        break;
      case "manager":
        navigate("/admin/manager-management");
        break;
      case "learner":
        navigate("/admin/learner-management");
        break;
      case "teacher":
        navigate("/admin/teacher-management");
        break;
      case "all-packages":
        navigate("/admin/all-packages");
        break;
      case "add-package":
        navigate("/admin/add-package");
        break;
      case "all-users":
        navigate("/admin/all-users");
        break;
      case "add-user":
        navigate("/admin/add-user");
        break;
      case "roles":
        navigate("/admin/roles");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "settings":
        navigate("/admin/settings");
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
      key: "accounts",
      icon: <UserOutlined />,
      label: "Tài khoản",
      children: [
        { key: "staff", icon: <UserAddOutlined />, label: "Tài khoản Staff" },
        {
          key: "manager",
          icon: <UserAddOutlined />,
          label: "Tài khoản Manager",
        },
        {
          key: "learner",
          icon: <UserAddOutlined />,
          label: "Tài khoản Learner",
        },
        {
          key: "teacher",
          icon: <UserAddOutlined />,
          label: "Tài khoản Teacher",
        },
      ],
    },
    // {
    //   key: "packages",
    //   icon: <ShoppingOutlined />,
    //   label: "Gói dịch vụ",
    //   children: [
    //     {
    //       key: "all-packages",
    //       icon: <ShoppingOutlined />,
    //       label: "Tất cả gói",
    //     },
    //     {
    //       key: "add-package",
    //       icon: <ShoppingOutlined />,
    //       label: "Thêm gói mới",
    //     },
    //   ],
    // },
    // {
    //   key: "users",
    //   icon: <UsergroupAddOutlined />,
    //   label: "Người dùng",
    //   children: [
    //     {
    //       key: "all-users",
    //       icon: <TeamOutlined />,
    //       label: "Tất cả người dùng",
    //     },
    //     {
    //       key: "add-user",
    //       icon: <UserAddOutlined />,
    //       label: "Thêm người dùng",
    //     },
    //     {
    //       key: "roles",
    //       icon: <SafetyCertificateOutlined />,
    //       label: "Phân quyền",
    //     },
    //   ],
    // },
    // {
    //   key: "analytics",
    //   icon: <BarChartOutlined />,
    //   label: "Thống kê",
    // },
    // {
    //   key: "settings",
    //   icon: <SettingOutlined />,
    //   label: "Cài đặt",
    // },
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
              <div className="font-medium">Admin</div>
              <div className="text-xs text-gray-400">
                Quản trị viên hệ thống
              </div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default AdminSidebar;
