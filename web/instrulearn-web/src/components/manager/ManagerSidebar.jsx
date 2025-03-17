import React from "react";
import { Layout, Menu, Avatar, Input } from "antd";
import {
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  BookOutlined,
  GiftOutlined,
  UserOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Search } = Input;

const ManagerSidebar = ({ collapsed, setCollapsed, selectedMenu }) => {
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate("/manager");
        break;
      case "total-revenue":
        navigate("/manager/revenue");
        break;
      case "video-revenue":
        navigate("/manager/revenue/online-course-payments");
        break;
      case "class-revenue":
        navigate("/manager/revenue/center-class-payments");
        break;
      case "private-revenue":
        navigate("/manager/revenue/one-on-one-payments");
        break;
      case "history-transaction":
        navigate("/manager/revenue/history-transaction");
        break;
      case "teacher-performance":
        navigate("/manager/teacher-performance");
        break;
      case "class-status":
        navigate("/manager/class-status");
        break;
      case "promotions":
        navigate("/manager/promotions");
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
      key: "revenue",
      icon: <BarChartOutlined />,
      label: "Báo cáo doanh thu",
      children: [
        { key: "total-revenue", label: "Tổng doanh thu" },
        { key: "video-revenue", label: "Gói học online" },
        { key: "class-revenue", label: "Lớp học trung tâm" },
        { key: "private-revenue", label: "Học 1-1" },
        { key: "history-transaction", label: "Lịch sử giao dịch" },
      ],
    },
    {
      key: "teacher-performance",
      icon: <TeamOutlined />,
      label: "Hiệu suất giáo viên",
    },
    {
      key: "class-status",
      icon: <BookOutlined />,
      label: "Trạng thái lớp học",
    },
    {
      key: "promotions",
      icon: <GiftOutlined />,
      label: "Quản lý khuyến mại",
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
          {collapsed ? "MP" : "MANAGER PORTAL"}
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
              <div className="font-medium">Nguyễn Văn Quản Lý</div>
              <div className="text-xs text-gray-400">Quản lý trung tâm</div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default ManagerSidebar;
