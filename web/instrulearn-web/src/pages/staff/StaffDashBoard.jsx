import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Layout,
  Card,
  Typography,
  Table,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  Modal,
  Row,
  Col,
  Statistic,
  Divider,
  Rate,
  Input,
  Select,
  Empty,
  Tooltip,
  message,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
// MUI
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import GroupIcon from "@mui/icons-material/Group";
import FeedbackIcon from "@mui/icons-material/Feedback";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonIcon from "@mui/icons-material/Person";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const gradientCard = {
  borderRadius: 18,
  background: "linear-gradient(90deg, #e3f2fd 0%, #fff 100%)",
  boxShadow: "0 2px 8px #e3f2fd",
};

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    learningRegistrations: [],
    classes: [],
    feedbacks: [],
    teacherEvaluations: [],
    majors: [],
    teachers: [],
    teacherChangeRequests: [],
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [
        coursesRes,
        learningRegisRes,
        classesRes,
        feedbacksRes,
        teacherEvalsRes,
        majorsRes,
        teachersRes,
        teacherChangeRequestsRes,
      ] = await Promise.all([
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Course/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Class/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Teacher/get-all"
        ),
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/StaffNotification/teacher-change-requests"
        ),
      ]);

      setDashboardData({
        courses: coursesRes.data,
        learningRegistrations: learningRegisRes.data.data.filter(
          (reg) => reg.RegisTypeName === "Đăng kí học theo yêu cầu"
        ),
        classes: classesRes.data,
        feedbacks: feedbacksRes.data.data,
        teacherEvaluations: teacherEvalsRes.data.data,
        majors: majorsRes.data.data,
        teachers: teachersRes.data.map((t) => t.data),
        teacherChangeRequests: teacherChangeRequestsRes.data.data || [],
      });
      setLoading(false);
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewModalVisible(true);
  };

  const handleMarkAsResolved = async (notificationId) => {
    try {
      await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/mark-as-resolved/${notificationId}`
      );
      message.success("Đã đánh dấu đã xử lý");
      fetchDashboardData(); // Gọi lại API để cập nhật dữ liệu
    } catch (error) {
      message.error("Không thể đánh dấu đã xử lý");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  // Tính toán các thống kê
  const totalCourses = dashboardData.courses.length;
  const totalRegistrations = dashboardData.learningRegistrations.length;
  const totalClasses = dashboardData.classes.length;
  const totalTeachers = dashboardData.teachers.length;
  const totalMajors = dashboardData.majors.length;
  const totalFeedbacks = dashboardData.feedbacks.length;
  const totalTeacherEvaluations = dashboardData.teacherEvaluations.length;
  const totalTeacherChangeRequests = dashboardData.teacherChangeRequests.length;

  const getStatusTag = (status, paymentStatus) => {
    switch (status) {
      case "Pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ xác nhận
          </Tag>
        );
      case "Accepted":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã chấp nhận
          </Tag>
        );
      case "Fourty":
        return (
          <Tag icon={<CheckCircleOutlined />} color="orange">
            Đã thanh toán 40%
          </Tag>
        );
      case "Sixty":
        return (
          <Tag icon={<CheckCircleOutlined />} color="blue">
            Đã thanh toán 60%
          </Tag>
        );
      case "Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      case "FourtyFeedbackDone":
        return (
          <Tag icon={<CheckCircleOutlined />} color="purple">
            Đã phản hồi
          </Tag>
        );
      case "Cancelled":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Đã hủy
          </Tag>
        );
      case "FullyPaid":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã thanh toán đầy đủ
          </Tag>
        );
      case "Payment40Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Từ chối thanh toán 40%
          </Tag>
        );
      case "Payment60Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Từ chối thanh toán 60%
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const statusMap = {
    0: { color: "primary", text: "Chưa xử lý" },
    1: { color: "warning", text: "Đã đọc" },
    2: { color: "success", text: "Đã xử lý" },
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "learnerName",
      key: "learnerName",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Lý do đổi giáo viên",
      dataIndex: "teacherChangeReason",
      key: "teacherChangeReason",
      render: (text) => <span style={{ color: "#d32f2f" }}>{text || "-"}</span>,
    },
    {
      title: "Thời gian gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Chip
          label={statusMap[status]?.text}
          color={statusMap[status]?.color}
          size="small"
        />
      ),
    },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => {
            setSelectedRequest(record);
            setViewModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const recentRegistrationsColumns = [
    {
      title: "ID",
      dataIndex: "LearningRegisId",
      key: "LearningRegisId",
    },
    {
      title: "Học viên",
      dataIndex: "FullName",
      key: "FullName",
    },
    {
      title: "Giáo viên",
      dataIndex: "TeacherName",
      key: "TeacherName",
    },
    {
      title: "Môn học",
      dataIndex: "MajorName",
      key: "MajorName",
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      render: (status, record) => (
        <Chip
          label={getStatusTag(status, record)}
          color={
            status === "Pending"
              ? "warning"
              : status === "Accepted"
              ? "success"
              : "default"
          }
          size="small"
        />
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "RequestDate",
      key: "RequestDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
  ];

  const recentClassesColumns = [
    {
      title: "ID",
      dataIndex: "classId",
      key: "classId",
    },
    {
      title: "Tên lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Môn học",
      dataIndex: "majorName",
      key: "majorName",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
  ];

  const recentCoursesColumns = [
    {
      title: "ID",
      dataIndex: "coursePackageId",
      key: "coursePackageId",
    },
    {
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "courseName",
      ellipsis: true,
    },
    {
      title: "Loại khóa học",
      dataIndex: "courseTypeName",
      key: "courseTypeName",
    },
    {
      title: "Mô tả",
      dataIndex: "courseDescription",
      key: "courseDescription",
      ellipsis: true,
    },
    {
      title: "Giá/buổi",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Chip
          label={
            status === 0
              ? "Đang xử lý"
              : status === 1
              ? "Đang mở bán"
              : "Không xác định"
          }
          color={
            status === 1 ? "success" : status === 0 ? "warning" : "default"
          }
          size="small"
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f6f8fa" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 min-h-screen" style={{ marginTop: "64px" }}>
          <Title level={2} className="mb-6">
            Tổng quan của Staff
          </Title>

          {/* Thống kê tổng quan */}
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Tổng số khóa học</span>
                  }
                  value={totalCourses}
                  prefix={
                    <BookOutlined style={{ color: "#1976d2", fontSize: 28 }} />
                  }
                  valueStyle={{
                    color: "#1976d2",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Tổng số đơn đăng ký</span>
                  }
                  value={totalRegistrations}
                  prefix={
                    <PersonIcon style={{ color: "#388e3c", fontSize: 28 }} />
                  }
                  valueStyle={{
                    color: "#388e3c",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Tổng số lớp học</span>
                  }
                  value={totalClasses}
                  prefix={
                    <GroupIcon style={{ color: "#ff9800", fontSize: 28 }} />
                  }
                  valueStyle={{
                    color: "#ff9800",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Tổng số giáo viên</span>
                  }
                  value={totalTeachers}
                  prefix={
                    <AssignmentIndIcon
                      style={{ color: "#d32f2f", fontSize: 28 }}
                    />
                  }
                  valueStyle={{
                    color: "#d32f2f",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Tổng số nhạc cụ</span>
                  }
                  value={totalMajors}
                  prefix={
                    <MusicNoteIcon style={{ color: "#1976d2", fontSize: 28 }} />
                  }
                  valueStyle={{
                    color: "#1976d2",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Phản hồi học viên</span>
                  }
                  value={totalFeedbacks}
                  prefix={
                    <FeedbackIcon style={{ color: "#388e3c", fontSize: 28 }} />
                  }
                  valueStyle={{
                    color: "#388e3c",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={gradientCard} bordered={false}>
                <Statistic
                  title={
                    <span style={{ fontWeight: 600 }}>Phản hồi giáo viên</span>
                  }
                  value={totalTeacherEvaluations}
                  prefix={
                    <FeedbackIcon style={{ color: "#d32f2f", fontSize: 28 }} />
                  }
                  valueStyle={{
                    color: "#d32f2f",
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Yêu cầu thay đổi giáo viên */}
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 18 }}>
                <ExclamationCircleOutlined
                  style={{ color: "#ff9800", fontSize: 22, marginRight: 8 }}
                />
                Yêu cầu thay đổi giáo viên
                {totalTeacherChangeRequests > 0 && (
                  <Chip
                    label={totalTeacherChangeRequests}
                    color="warning"
                    size="small"
                    style={{ marginLeft: 12 }}
                  />
                )}
              </span>
            }
            className="mb-6"
            style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}
          >
            <Table
              columns={columns}
              dataSource={dashboardData.teacherChangeRequests.slice(0, 5)}
              rowKey="notificationId"
              loading={loading}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có yêu cầu nào"
                  />
                ),
              }}
            />
          </Card>

          {/* Danh sách đăng ký gần đây */}
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 18 }}>
                <PersonIcon
                  style={{ color: "#388e3c", fontSize: 22, marginRight: 8 }}
                />
                Đăng ký gần đây
              </span>
            }
            className="mb-6"
            style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}
          >
            <Table
              columns={recentRegistrationsColumns}
              dataSource={dashboardData.learningRegistrations.slice(0, 5)}
              rowKey="LearningRegisId"
              pagination={false}
            />
          </Card>

          {/* Danh sách khóa học gần đây */}
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 18 }}>
                <SchoolIcon
                  style={{ color: "#1976d2", fontSize: 22, marginRight: 8 }}
                />
                Khóa học gần đây
                <Chip
                  label={dashboardData.courses.length}
                  color="primary"
                  size="small"
                  style={{ marginLeft: 12 }}
                />
              </span>
            }
            className="mb-6"
            style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}
          >
            <Table
              columns={recentCoursesColumns}
              dataSource={dashboardData.courses}
              rowKey="coursePackageId"
              pagination={false}
            />
          </Card>

          {/* Danh sách lớp học gần đây */}
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 18 }}>
                <GroupIcon
                  style={{ color: "#ff9800", fontSize: 22, marginRight: 8 }}
                />
                Lớp học gần đây
              </span>
            }
            style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}
          >
            <Table
              columns={recentClassesColumns}
              dataSource={dashboardData.classes.slice(0, 5)}
              rowKey="classId"
              pagination={false}
            />
          </Card>
        </Content>
      </Layout>

      {/* Modal xem chi tiết yêu cầu thay đổi giáo viên */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: 20 }}>
            Chi tiết yêu cầu thay đổi giáo viên
          </span>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button
            key="close"
            variant="contained"
            color="primary"
            onClick={() => setViewModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={700}
        style={{ borderRadius: 18 }}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <Text type="secondary">Học viên</Text>
              <div className="text-lg font-medium">
                {selectedRequest.learnerName}
              </div>
            </div>
            <Divider />
            <div>
              <Text type="secondary">Tiêu đề</Text>
              <div className="text-lg font-medium">{selectedRequest.title}</div>
            </div>
            <Divider />
            <div>
              <Text type="secondary">Nội dung</Text>
              <div className="text-lg">{selectedRequest.message}</div>
            </div>
            <Divider />
            <div>
              <Text type="secondary">Lý do thay đổi</Text>
              <div className="text-lg">
                {selectedRequest.teacherChangeReason}
              </div>
            </div>
            <Divider />
            <div>
              <Text type="secondary">Ngày tạo</Text>
              <div className="text-lg">
                {dayjs(selectedRequest.createdAt).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>
            <Divider />
            <div>
              <Text type="secondary">Trạng thái</Text>
              <div>
                <Chip
                  label={statusMap[selectedRequest.status]?.text}
                  color={statusMap[selectedRequest.status]?.color}
                  size="small"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default StaffDashboard;
