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
  LineChartOutlined,
  MessageOutlined,
  DollarOutlined,
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
      case "year-revenue":
        navigate("/manager/revenue/year-revenue");
        break;
      case "month-revenue":
        navigate("/manager/revenue/month-revenue");
        break;
      case "date-revenue":
        navigate("/manager/revenue/date-revenue");
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
      case "One-on-one Level":
        navigate("/manager/level-management");
        break;
      case "response-management":
        navigate("/manager/response-management");
        break;
      case "response-type-management":
        navigate("/manager/response-type-management");
        break;
      case "payment-management":
        navigate("/manager/payment-management");
        break;
      case "level-syllabus":
        navigate("/manager/level-syllabus");
        break;
      case "level-feedback-template":
        navigate("/manager/level-feedback-template");
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
        { key: "year-revenue", label: "Doanh thu theo năm" },
        { key: "month-revenue", label: "Doanh thu theo tháng" },
        { key: "date-revenue", label: "Doanh thu theo ngày" },
        { key: "history-transaction", label: "Lịch sử giao dịch" },
      ],
    },
    {
      key: "payment",
      icon: <DollarOutlined />,
      label: "Thanh toán",
      children: [{ key: "payment-management", label: "Quản lý thanh toán" }],
    },
    {
      key: "level",
      icon: <LineChartOutlined />,
      label: "Quản lý cấp độ",
      children: [
        { key: "One-on-one Level", label: "Cấp độ khóa học " },
        { key: "level-syllabus", label: "Giáo trình " },
        {
          key: "level-feedback-template",
          label: "Template phản hồi (Trung tâm)",
        },
      ],
    },
    {
      key: "response",
      icon: <MessageOutlined />,
      label: "Báo cáo phản hồi",
      children: [
        { key: "response-management", label: "Quản lý phản hồi (1-1)" },
        {
          key: "response-type-management",
          label: "Quản lý loại phản hồi (1-1)",
        },
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
