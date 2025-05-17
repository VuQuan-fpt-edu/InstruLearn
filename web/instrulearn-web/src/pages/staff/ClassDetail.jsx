import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Spin,
  message,
  Row,
  Col,
  Divider,
  Menu,
  Dropdown,
  Modal,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import axios from "axios";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";

const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const ClassDetail = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSyllabusModalVisible, setIsSyllabusModalVisible] = useState(false);

  useEffect(() => {
    fetchClassDetail();
  }, [id]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Class/${id}`
      );
      const data = await response.json();
      if (data.isSucceed) {
        setClassData(data.data);
      } else {
        message.error(data.message || "Không thể tải thông tin lớp học");
      }
    } catch (error) {
      console.error("Error fetching class detail:", error);
      message.error("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "blue";
      case 1:
        return "green";
      case 2:
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Đang mở lớp";
      case 1:
        return "Đang diễn ra";
      case 2:
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const formatClassDays = (classDays) => {
    if (!classDays) return "";
    return classDays
      .map((day) => {
        switch (day.day) {
          case "Sunday":
            return "Chủ nhật";
          case "Monday":
            return "Thứ 2";
          case "Tuesday":
            return "Thứ 3";
          case "Wednesday":
            return "Thứ 4";
          case "Thursday":
            return "Thứ 5";
          case "Friday":
            return "Thứ 6";
          case "Saturday":
            return "Thứ 7";
          default:
            return day.day;
        }
      })
      .join(", ");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const updateClassStatus = async (newStatus) => {
    try {
      setLoading(true);
      // Ghi log để kiểm tra dữ liệu gửi đi
      console.log(`Cập nhật lớp học ID: ${id}, trạng thái mới: ${newStatus}`);
      console.log(
        `URL: https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`
      );
      console.log(`Body: ${JSON.stringify({ status: newStatus })}`);

      // Thử sử dụng axios thay vì fetch
      try {
        const axiosResponse = await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`,
          { status: newStatus },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Phản hồi Axios:", axiosResponse);

        if (axiosResponse.status === 200 || axiosResponse.data.isSucceed) {
          message.success("Cập nhật trạng thái lớp học thành công");
          fetchClassDetail();
          return; // Dừng xử lý nếu axios thành công
        }
      } catch (axiosError) {
        console.error("Axios error:", axiosError);
        // Tiếp tục với fetch nếu axios thất bại
      }

      // Sử dụng fetch như phương án dự phòng
      const response = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      console.log(`Mã trạng thái phản hồi: ${response.status}`);

      // Kiểm tra cả status và ok để xử lý đầy đủ các trường hợp
      if (response.ok || response.status === 200) {
        message.success("Cập nhật trạng thái lớp học thành công");
        // Tải lại thông tin lớp học
        fetchClassDetail();
      } else {
        const errorData = await response.json();
        console.error("API Error response:", errorData);
        message.error(
          errorData.message || "Không thể cập nhật trạng thái lớp học"
        );
      }
    } catch (error) {
      console.error("Error updating class status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái lớp học");
    } finally {
      setLoading(false);
    }
  };

  const showStatusUpdateConfirm = (newStatus) => {
    confirm({
      title: "Cập nhật trạng thái lớp học",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có muốn cập nhật trạng thái lớp học này thành '${getStatusText(
        newStatus
      )}' không?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk() {
        updateClassStatus(newStatus);
      },
    });
  };

  const directUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      message.loading({ content: "Đang cập nhật...", key: "statusUpdate" });

      // Sử dụng API trực tiếp
      const apiUrl = `https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        message.success({
          content: "Cập nhật thành công!",
          key: "statusUpdate",
          duration: 2,
        });
        fetchClassDetail();
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        message.error({
          content: "Cập nhật thất bại",
          key: "statusUpdate",
          duration: 2,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      message.error({
        content: "Có lỗi xảy ra",
        key: "statusUpdate",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusMenuItems = [
    {
      key: "0",
      label: "Đang mở lớp",
      onClick: () => directUpdateStatus(0),
      disabled: classData?.status === 0,
    },
    {
      key: "1",
      label: "Đang diễn ra",
      onClick: () => directUpdateStatus(1),
      disabled: classData?.status === 1,
    },
    {
      key: "2",
      label: "Đã kết thúc",
      onClick: () => directUpdateStatus(2),
      disabled: classData?.status === 2,
    },
  ];

  return (
    <Layout className="min-h-screen">
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
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Card className="shadow-md">
            <div className="flex justify-between items-center mb-6">
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/staff/class-management")}
                >
                  Quay lại
                </Button>
                <Title level={2} className="mb-0">
                  Chi tiết lớp học
                </Title>
              </Space>
              <Space>
                <Dropdown
                  menu={{ items: statusMenuItems }}
                  disabled={loading || !classData}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <Button type="primary" icon={<EditOutlined />}>
                    <Space>
                      Cập nhật trạng thái
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </div>

            <Spin spinning={loading}>
              {classData && (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Box
                      component={Paper}
                      elevation={3}
                      sx={{ p: 3, mb: 3, borderRadius: 2 }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, mb: 2, color: "#1976d2" }}
                      >
                        {classData.className}
                      </Typography>
                      <Descriptions column={2} bordered size="middle">
                        <Descriptions.Item label="Chuyên ngành">
                          {classData.majorName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trình độ">
                          {classData.levelName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giáo trình">
                          {classData.syllabusName}
                          {classData.syllabusLink && (
                            <Button
                              type="link"
                              size="small"
                              style={{ marginLeft: 8, padding: 0 }}
                              onClick={() => setIsSyllabusModalVisible(true)}
                            >
                              Xem giáo trình
                            </Button>
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giáo viên">
                          {classData.teacherName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày bắt đầu">
                          {new Date(classData.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian học">
                          {classData.classTime?.substring(0, 5) || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số học viên tối đa">
                          {classData.maxStudents}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng số buổi học">
                          {classData.totalDays}
                        </Descriptions.Item>
                        <Descriptions.Item label="Học phí">
                          <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                            {classData.price?.toLocaleString()} VND
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Tag color={getStatusColor(classData.status)}>
                            {getStatusText(classData.status)}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Lịch học" span={2}>
                          {formatClassDays(classData.classDays)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày học cụ thể" span={2}>
                          <Box
                            sx={{
                              maxHeight: 140,
                              overflowY: "auto",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              p: 1,
                              background: "#fafbfc",
                              borderRadius: 2,
                            }}
                          >
                            {classData.sessionDates &&
                            classData.sessionDates.length > 0
                              ? classData.sessionDates.map((date, idx) => (
                                  <Tag
                                    key={idx}
                                    color="blue"
                                    style={{
                                      marginBottom: 6,
                                      fontSize: 13,
                                      padding: "2px 10px",
                                      borderRadius: 8,
                                      background: "#e6f4ff",
                                      color: "#1677ff",
                                      border: "none",
                                    }}
                                  >
                                    {new Date(date).toLocaleDateString("vi-VN")}
                                  </Tag>
                                ))
                              : "Không có"}
                          </Box>
                        </Descriptions.Item>
                      </Descriptions>
                    </Box>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Box
                      component={Paper}
                      elevation={3}
                      sx={{ p: 3, mb: 3, borderRadius: 2 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Thống kê học viên
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">
                          Số học viên hiện tại:{" "}
                          <b>
                            {classData.studentCount || 0}/
                            {classData.maxStudents}
                          </b>
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={
                              classData.maxStudents > 0
                                ? ((classData.studentCount || 0) /
                                    classData.maxStudents) *
                                  100
                                : 0
                            }
                            sx={{
                              width: "80%",
                              mr: 2,
                              height: 10,
                              borderRadius: 5,
                            }}
                            color="primary"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {classData.maxStudents > 0
                              ? `${Math.round(
                                  ((classData.studentCount || 0) /
                                    classData.maxStudents) *
                                    100
                                )}%`
                              : "0%"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {classData.students && classData.students.length > 0 && (
                      <Box
                        component={Paper}
                        elevation={3}
                        sx={{ p: 3, borderRadius: 2 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 2 }}
                        >
                          Danh sách học viên
                        </Typography>
                        <List>
                          {classData.students.map((student, idx) => (
                            <React.Fragment key={student.learnerId}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                  <Avatar
                                    src={student.avatar}
                                    alt={student.fullName}
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      bgcolor: "#1976d2",
                                      mr: 2,
                                    }}
                                  >
                                    {!student.avatar && <UserOutlined />}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <span style={{ fontWeight: 500 }}>
                                      {student.fullName}
                                    </span>
                                  }
                                  secondary={
                                    <>
                                      <span style={{ color: "#555" }}>
                                        {student.email}
                                      </span>
                                      <br />
                                      <span style={{ color: "#888" }}>
                                        {student.phoneNumber}
                                      </span>
                                    </>
                                  }
                                />
                              </ListItem>
                              {idx < classData.students.length - 1 && (
                                <Divider variant="inset" component="li" />
                              )}
                            </React.Fragment>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Col>
                </Row>
              )}
            </Spin>
          </Card>
          {/* Modal xem giáo trình PDF */}
          <Modal
            title={classData?.syllabusName || "Xem giáo trình"}
            open={isSyllabusModalVisible}
            onCancel={() => setIsSyllabusModalVisible(false)}
            width={900}
            footer={null}
            bodyStyle={{ padding: 0, height: 700 }}
            destroyOnClose
          >
            {classData?.syllabusLink && (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  classData.syllabusLink
                )}&embedded=true`}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Syllabus PDF Viewer"
              />
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassDetail;
