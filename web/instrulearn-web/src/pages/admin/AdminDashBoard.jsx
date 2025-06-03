import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Spin,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalTeachers: 0,
    totalStaffs: 0,
    totalManagers: 0,
    activeLearners: 0,
    activeTeachers: 0,
    activeStaffs: 0,
    activeManagers: 0,
  });
  const [recentLearners, setRecentLearners] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [learnersRes, teachersRes, staffsRes, managersRes] =
        await Promise.all([
          axios.get(
            "https://instrulearnapplication.azurewebsites.net/api/Learner/get-all"
          ),
          axios.get(
            "https://instrulearnapplication.azurewebsites.net/api/Teacher/get-all"
          ),
          axios.get(
            "https://instrulearnapplication.azurewebsites.net/api/Staff/get-all"
          ),
          axios.get(
            "https://instrulearnapplication.azurewebsites.net/api/Manager/get-all"
          ),
        ]);

      const learners = learnersRes.data.isSucceed ? learnersRes.data.data : [];
      // Lấy dữ liệu giáo viên đúng chuẩn API
      let teachersRaw = Array.isArray(teachersRes.data)
        ? teachersRes.data
        : teachersRes.data.data;
      const teachers = Array.isArray(teachersRaw)
        ? teachersRaw.filter((item) => item.isSucceed).map((item) => item.data)
        : [];
      const staffs = staffsRes.data.isSucceed ? staffsRes.data.data : [];
      const managers = managersRes.data.isSucceed ? managersRes.data.data : [];

      setStats({
        totalLearners: learners.length,
        totalTeachers: teachers.length,
        totalStaffs: staffs.length,
        totalManagers: managers.length,
        activeLearners: learners.filter((l) => l.isActive === 1).length,
        activeTeachers: teachers.filter((t) => t.isActive === 1).length,
        activeStaffs: staffs.filter((s) => s.isActive === 1).length,
        activeManagers: managers.filter((m) => m.isActive === 1).length,
      });

      // Lấy 5 học viên mới nhất
      setRecentLearners(learners.slice(0, 5));
      // Lấy 5 giáo viên mới nhất
      setRecentTeachers(teachers.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const learnerColumns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive === 1 ? "green" : "red"}>
          {isActive === 1 ? "Hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
  ];

  const teacherColumns = [
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive === 1 ? "green" : "red"}>
          {isActive === 1 ? "Hoạt động" : "Đã khóa"}
        </Tag>
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
          <Title level={2} className="mb-6">
            Tổng quan hệ thống
          </Title>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={stats.totalLearners}
                      prefix={<UserOutlined />}
                      suffix={`/ ${stats.activeLearners} hoạt động`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng số giáo viên"
                      value={stats.totalTeachers}
                      prefix={<TeamOutlined />}
                      suffix={`/ ${stats.activeTeachers} hoạt động`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng số nhân viên"
                      value={stats.totalStaffs}
                      prefix={<TeamOutlined />}
                      suffix={`/ ${stats.activeStaffs} hoạt động`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng số quản lý"
                      value={stats.totalManagers}
                      prefix={<TeamOutlined />}
                      suffix={`/ ${stats.activeManagers} hoạt động`}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    title="Học viên mới nhất"
                    extra={
                      <Button type="link" href="/admin/learner-management">
                        Xem tất cả
                      </Button>
                    }
                  >
                    <Table
                      dataSource={recentLearners}
                      columns={learnerColumns}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card
                    title="Giáo viên mới nhất"
                    extra={
                      <Button type="link" href="/admin/teacher-management">
                        Xem tất cả
                      </Button>
                    }
                  >
                    <Table
                      dataSource={recentTeachers}
                      columns={teacherColumns}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
