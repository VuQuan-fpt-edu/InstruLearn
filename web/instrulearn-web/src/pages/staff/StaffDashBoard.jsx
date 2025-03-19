import React, { useState } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Space,
  Progress,
  Tag,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  BellOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;

// Dữ liệu mẫu cho các yêu cầu gần đây
const recentRequests = [
  {
    id: 1,
    type: "Học bù",
    student: "Nguyễn Văn A",
    course: "Guitar cơ bản A1",
    status: "pending",
    date: "2024-03-20",
  },
  {
    id: 2,
    type: "Hoàn tiền",
    student: "Trần Thị B",
    course: "Piano nâng cao B2",
    status: "approved",
    date: "2024-03-19",
  },
  {
    id: 3,
    type: "Đăng ký lớp",
    student: "Lê Văn C",
    course: "Violin cơ bản A2",
    status: "pending",
    date: "2024-03-18",
  },
];

// Dữ liệu mẫu cho lớp học hôm nay
const todayClasses = [
  {
    id: 1,
    className: "Guitar cơ bản A1",
    teacher: "Nguyễn Văn X",
    time: "09:00 - 10:30",
    room: "Phòng 101",
    students: 12,
  },
  {
    id: 2,
    className: "Piano nâng cao B2",
    teacher: "Trần Thị Y",
    time: "14:00 - 15:30",
    room: "Phòng 202",
    students: 8,
  },
  {
    id: 3,
    className: "Violin cơ bản A2",
    teacher: "Lê Văn Z",
    time: "16:00 - 17:30",
    room: "Phòng 303",
    students: 10,
  },
];

const StaffDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="dashboard"
      />
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: "24px 16px", marginTop: "88px" }}>
          <div
            style={{
              padding: "16px 24px",
              background: "#fff",
              marginBottom: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Tổng quan
            </Title>
          </div>

          <div
            style={{
              padding: "24px",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <BookOutlined
                        style={{ fontSize: 24, color: "#1890ff" }}
                      />
                      <Text>Tổng số lớp đang hoạt động</Text>
                    </Space>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: 600,
                        color: "#1890ff",
                      }}
                    >
                      15
                    </Text>
                    <Progress
                      percent={80}
                      showInfo={false}
                      strokeColor="#1890ff"
                    />
                    <Text type="secondary">Tăng 20% so với tháng trước</Text>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <TeamOutlined
                        style={{ fontSize: 24, color: "#52c41a" }}
                      />
                      <Text>Tổng số học viên</Text>
                    </Space>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: 600,
                        color: "#52c41a",
                      }}
                    >
                      180
                    </Text>
                    <Progress
                      percent={65}
                      showInfo={false}
                      strokeColor="#52c41a"
                    />
                    <Text type="secondary">Tăng 15% so với tháng trước</Text>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <BellOutlined
                        style={{ fontSize: 24, color: "#faad14" }}
                      />
                      <Text>Yêu cầu chờ xử lý</Text>
                    </Space>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: 600,
                        color: "#faad14",
                      }}
                    >
                      8
                    </Text>
                    <Progress
                      percent={40}
                      showInfo={false}
                      strokeColor="#faad14"
                    />
                    <Text type="secondary">4 yêu cầu mới hôm nay</Text>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title="Yêu cầu gần đây"
                  bordered={false}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Loại yêu cầu
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Học viên
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Khóa học
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Trạng thái
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Ngày yêu cầu
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRequests.map((request) => (
                          <tr
                            key={request.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td style={{ padding: "12px 8px" }}>
                              <Tag
                                color={
                                  request.type === "Hoàn tiền"
                                    ? "orange"
                                    : request.type === "Đăng ký lớp"
                                    ? "green"
                                    : "blue"
                                }
                              >
                                {request.type}
                              </Tag>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              <Space>
                                <Avatar icon={<UserOutlined />} />
                                {request.student}
                              </Space>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              {request.course}
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              <Tag
                                color={
                                  request.status === "approved"
                                    ? "success"
                                    : "processing"
                                }
                              >
                                {request.status === "approved"
                                  ? "Đã duyệt"
                                  : "Đang chờ"}
                              </Tag>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              {new Date(request.date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title="Lớp học hôm nay"
                  bordered={false}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Lớp học
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Giáo viên
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Thời gian
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Phòng
                          </th>
                          <th
                            style={{ padding: "12px 8px", textAlign: "left" }}
                          >
                            Sĩ số
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayClasses.map((classItem) => (
                          <tr
                            key={classItem.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td style={{ padding: "12px 8px" }}>
                              {classItem.className}
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              <Space>
                                <Avatar icon={<UserOutlined />} />
                                {classItem.teacher}
                              </Space>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              <Space>
                                <ClockCircleOutlined />
                                {classItem.time}
                              </Space>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              {classItem.room}
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              <Space>
                                <TeamOutlined />
                                {classItem.students}
                              </Space>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;
