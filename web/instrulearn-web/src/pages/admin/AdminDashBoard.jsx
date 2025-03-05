import React, { useState } from "react";
import { Layout, Table, Button } from "antd";
import ASidebar from "../../components/AdminSidebar";
import AHeader from "../../components/AdminHeader";

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
      <ASidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={toggleCollapsed}
      />
      <Layout>
        <AHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          selectedMenu={selectedMenu}
        />
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
