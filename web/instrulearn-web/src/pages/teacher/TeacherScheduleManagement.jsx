import React, { useState } from "react";
import { Layout, Card, Content } from "antd";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const TeacherScheduleManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("schedule");

  return (
    <Layout>
      <StaffSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
        <StaffHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50 min-h-screen">
          <Card>{/* ... rest of the content ... */}</Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherScheduleManagement;
