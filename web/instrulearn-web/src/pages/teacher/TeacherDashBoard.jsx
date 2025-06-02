import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  List as AntList,
  Typography,
  Spin,
  Tabs,
  Empty,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  BellOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
// MUI
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import TabsMUI from "@mui/material/Tabs";
import TabMUI from "@mui/material/Tab";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import TimelineIcon from "@mui/icons-material/Timeline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const gradientCard = {
  borderRadius: 18,
  background: "linear-gradient(90deg, #e3f2fd 0%, #fff 100%)",
  boxShadow: "0 2px 8px #e3f2fd",
};

const TeacherDashBoard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchTeacherId();
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchDashboardData();
    }
  }, [teacherId]);

  const fetchTeacherId = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSucceed) {
        setTeacherId(response.data.data.teacherId);
      }
    } catch (error) {
      setTeacherId(null);
    }
  };

  const fetchDashboardData = async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      // Lấy danh sách lớp và notifications
      const [classesRes, notificationsRes] = await Promise.all([
        axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Class/get-all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/teacher/${teacherId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);
      if (classesRes.data) {
        const teacherClasses = classesRes.data.filter(
          (c) => c.teacherId === teacherId
        );
        // Lấy chi tiết từng lớp để có số học viên
        const detailedClasses = await Promise.all(
          teacherClasses.map(async (cls) => {
            try {
              const detailRes = await axios.get(
                `https://instrulearnapplication.azurewebsites.net/api/Class/${cls.classId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (detailRes.data && detailRes.data.isSucceed) {
                return detailRes.data.data;
              }
              return cls;
            } catch {
              return cls;
            }
          })
        );
        setClasses(detailedClasses);
      }
      if (notificationsRes.data) {
        const notificationsData = Array.isArray(notificationsRes.data)
          ? notificationsRes.data
          : notificationsRes.data.data || [];
        setNotifications(notificationsData);
      }
    } catch (error) {
      // eslint-disable-next-line
    } finally {
      setLoading(false);
    }
  };

  // Helper
  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "success";
      case 2:
        return "warning";
      case 3:
        return "default";
      default:
        return "default";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Đang hoạt động";
      case 2:
        return "Tạm dừng";
      case 3:
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  return (
    <Layout className="min-h-screen" style={{ background: "#f6f8fa" }}>
      <TeacherSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <TeacherHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6" style={{ minHeight: "100vh" }}>
          <Spin spinning={loading}>
            {/* Thống kê */}
            <Row gutter={[24, 24]} className="mb-6">
              <Col xs={24} sm={8} md={8} lg={8}>
                <Card style={gradientCard} bordered={false}>
                  <Statistic
                    title={
                      <span style={{ fontWeight: 600 }}>Tổng số lớp học</span>
                    }
                    value={classes.length}
                    prefix={
                      <BookOutlined
                        style={{ color: "#388e3c", fontSize: 28 }}
                      />
                    }
                    valueStyle={{
                      color: "#388e3c",
                      fontWeight: 700,
                      fontSize: 28,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8}>
                <Card style={gradientCard} bordered={false}>
                  <Statistic
                    title={
                      <span style={{ fontWeight: 600 }}>Tổng số học viên</span>
                    }
                    value={classes.reduce(
                      (acc, curr) =>
                        acc +
                        (curr.students
                          ? curr.students.length
                          : curr.studentCount || 0 || 0),
                      0
                    )}
                    prefix={
                      <TeamOutlined
                        style={{ color: "#1976d2", fontSize: 28 }}
                      />
                    }
                    valueStyle={{
                      color: "#1976d2",
                      fontWeight: 700,
                      fontSize: 28,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8}>
                <Card style={gradientCard} bordered={false}>
                  <Statistic
                    title={
                      <span style={{ fontWeight: 600 }}>Thông báo mới</span>
                    }
                    value={notifications.length}
                    prefix={
                      <BellOutlined
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
            </Row>

            {/* Lớp học sắp tới */}
            <Card
              className="mb-6"
              style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarOutlined
                    style={{ color: "#1976d2", fontSize: 22 }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    Lớp học sắp tới
                  </span>
                </div>
              }
              extra={
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate("/teacher/private-schedule")}
                  style={{ fontWeight: 600 }}
                >
                  Xem tất cả
                </Button>
              }
            >
              {classes.length === 0 ? (
                <Empty description="Không có lớp học nào" />
              ) : (
                <List disablePadding>
                  {classes.slice(0, 5).map((item, idx) => (
                    <React.Fragment key={item.classId}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() =>
                              navigate(`/teacher/class-management`)
                            }
                          >
                            Chi tiết
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={item.imageUrl}>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: 16 }}>
                                {item.className}
                              </span>
                              <Chip
                                label={getStatusText(item.status)}
                                color={getStatusColor(item.status)}
                                size="small"
                                style={{ fontWeight: 500 }}
                              />
                            </div>
                          }
                          secondary={
                            <div style={{ marginTop: 4 }}>
                              <span
                                style={{ color: "#1976d2", fontWeight: 500 }}
                              >
                                {dayjs(item.classTime, "HH:mm:ss").format(
                                  "HH:mm"
                                )}{" "}
                                -{" "}
                                {dayjs(item.classEndTime, "HH:mm:ss").format(
                                  "HH:mm"
                                )}
                              </span>
                              <span
                                style={{ marginLeft: 16, color: "#757575" }}
                              >
                                <TeamOutlined />{" "}
                                {item.students
                                  ? item.students.length
                                  : item.studentCount || 0 || 0}
                                /{item.maxStudents} học viên
                              </span>
                            </div>
                          }
                        />
                      </ListItem>
                      {idx < Math.min(classes.length, 5) - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>

            {/* Thông báo mới */}
            <Card
              className="mb-6"
              style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <NotificationsActiveIcon
                    style={{ color: "#d32f2f", fontSize: 22 }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    Thông báo mới
                  </span>
                </div>
              }
              extra={
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate("/teacher/notification")}
                  style={{ fontWeight: 600 }}
                >
                  Xem tất cả
                </Button>
              }
            >
              {!notifications || notifications.length === 0 ? (
                <Alert severity="info">Không có thông báo nào</Alert>
              ) : (
                <List disablePadding>
                  {notifications.slice(0, 5).map((item, idx) => (
                    <React.Fragment key={item.notificationId || idx}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#d32f2f" }}>
                            <NotificationsActiveIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <span style={{ fontWeight: 600 }}>
                              {item.title}
                            </span>
                          }
                          secondary={
                            <div style={{ marginTop: 2 }}>
                              <span style={{ color: "#757575" }}>
                                {item.message}
                              </span>
                              <Chip
                                label={
                                  item.status === 0
                                    ? "Chưa đọc"
                                    : item.status === 1
                                    ? "Đã đọc"
                                    : "Đã xử lý"
                                }
                                color={
                                  item.status === 0
                                    ? "primary"
                                    : item.status === 1
                                    ? "default"
                                    : "success"
                                }
                                size="small"
                                style={{ marginLeft: 12 }}
                              />
                              <span
                                style={{
                                  float: "right",
                                  color: "#bdbdbd",
                                  fontSize: 13,
                                }}
                              >
                                {dayjs(item.createdAt).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </span>
                            </div>
                          }
                        />
                      </ListItem>
                      {idx < Math.min(notifications.length, 5) - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>

            {/* Tabs thông tin khác */}
            <Card style={{ borderRadius: 18, boxShadow: "0 2px 8px #e3f2fd" }}>
              <TabsMUI
                value={tab}
                onChange={(_, v) => setTab(v)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ marginBottom: 2 }}
              >
                <TabMUI icon={<CalendarOutlined />} label="Lịch dạy" />
                <TabMUI
                  icon={<AssignmentIndIcon />}
                  label="Đánh giá học viên"
                />
                <TabMUI icon={<TimelineIcon />} label="Lộ trình học" />
              </TabsMUI>
              {tab === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/teacher/private-schedule")}
                  sx={{ fontWeight: 600 }}
                >
                  Xem chi tiết lịch dạy
                </Button>
              )}
              {tab === 1 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/teacher/student-evaluation")}
                  sx={{ fontWeight: 600 }}
                >
                  Xem chi tiết đánh giá học viên
                </Button>
              )}
              {tab === 2 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/teacher/learning-path")}
                  sx={{ fontWeight: 600 }}
                >
                  Xem chi tiết lộ trình học
                </Button>
              )}
            </Card>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherDashBoard;
