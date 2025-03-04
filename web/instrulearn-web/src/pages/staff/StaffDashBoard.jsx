import React, { useState } from "react";
import { Layout, Card, Row, Col, Statistic } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import SSidebar from "../../components/StaffSidebar";
import SHeader from "../../components/StaffHeader";

const { Content } = Layout;

const StaffDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          {selectedMenu === "dashboard" && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Khoá học đang dạy"
                    value={4}
                    prefix={<BookOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng số học viên"
                    value={55}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Lớp học hôm nay"
                    value={3}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Bài tập chưa chấm"
                    value={12}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;
