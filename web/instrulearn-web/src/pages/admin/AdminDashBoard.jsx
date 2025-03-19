import React, { useState } from "react";
import { Layout, Table, Button, Tag } from "antd";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

const { Content } = Layout;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

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
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên khoá học",
      dataIndex: "name",
      key: "name",
      width: "40%",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={status === "Hoạt động" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: () => (
        <div className="flex space-x-2">
          <Button type="primary" size="small">
            Sửa
          </Button>
          <Button type="default" size="small">
            Xem
          </Button>
          <Button type="primary" danger size="small">
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <AdminHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          selectedMenu={selectedMenu}
        />
        <Content
          style={{
            margin: "74px 16px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Danh sách khoá học</h2>
          </div>
          <Table
            dataSource={sampleData}
            columns={columns}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
            }}
            bordered
            size="middle"
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
