import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Calendar,
  Typography,
  Space,
  Tag,
  Button,
  Tooltip,
  Avatar,
  Divider,
  message,
  Spin,
  Radio,
  Popover,
  List,
  Modal,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;

const CenterSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("center-schedule");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month");
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      const profileResponse = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.data.isSucceed) {
        throw new Error("Không thể lấy thông tin giáo viên");
      }

      const teacherId = profileResponse.data.data.teacherId;

      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/classs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        const processedSchedules = response.data.data.map((schedule) => ({
          ...schedule,
          formattedTime: `${schedule.timeStart} - ${schedule.timeEnd}`,
          formattedDate: new Date(schedule.startDay).toLocaleDateString(
            "vi-VN"
          ),
          formattedDayOfWeek: formatDayOfWeek(schedule.dayOfWeek),
        }));
        setSchedules(processedSchedules);
      } else {
        throw new Error("Không thể lấy lịch dạy");
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
      message.error(err.message || "Đã xảy ra lỗi khi tải lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (participantScheduleId, status) => {
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/update-attendance/${participantScheduleId}`,
        status,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật điểm danh thành công");
        // Cập nhật trạng thái điểm danh trong state
        const updatedSchedules = schedules.map((schedule) => {
          if (schedule.scheduleId === selectedClass.scheduleId) {
            return {
              ...schedule,
              participants: schedule.participants.map((participant) => {
                if (participant.scheduleId === participantScheduleId) {
                  return {
                    ...participant,
                    attendanceStatus: status,
                  };
                }
                return participant;
              }),
            };
          }
          return schedule;
        });
        setSchedules(updatedSchedules);

        // Cập nhật selectedClass
        if (selectedClass) {
          const updatedClass = updatedSchedules.find(
            (s) => s.scheduleId === selectedClass.scheduleId
          );
          setSelectedClass(updatedClass);
        }
      } else {
        throw new Error("Không thể cập nhật điểm danh");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      message.error("Không thể cập nhật điểm danh");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const formatDayOfWeek = (dayOfWeek) => {
    const dayMap = {
      Monday: "Thứ 2",
      Tuesday: "Thứ 3",
      Wednesday: "Thứ 4",
      Thursday: "Thứ 5",
      Friday: "Thứ 6",
      Saturday: "Thứ 7",
      Sunday: "Chủ nhật",
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getAttendanceStatusTag = (status) => {
    switch (status) {
      case 1:
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Có mặt
          </Tag>
        );
      case 2:
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Vắng mặt
          </Tag>
        );
      default:
        return (
          <Tag icon={<QuestionCircleOutlined />} color="default">
            Chưa điểm danh
          </Tag>
        );
    }
  };

  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const daySchedules = schedules.filter(
      (schedule) => schedule.startDay === dateStr
    );

    if (daySchedules.length === 0) return null;

    return (
      <div className="h-full">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-blue-600 font-medium">
            {daySchedules.length} buổi học
          </div>
        </div>
      </div>
    );
  };

  const getDateCellStyle = (value) => {
    const date = value.format("YYYY-MM-DD");
    const hasSchedules = schedules.some(
      (schedule) => schedule.startDay === date
    );

    if (hasSchedules) {
      return {
        backgroundColor: "#f0f7ff",
        borderRadius: "4px",
        cursor: "pointer",
      };
    }
    return {};
  };

  const handleDateSelect = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const daySchedules = schedules.filter(
      (schedule) => schedule.startDay === dateStr
    );
    if (daySchedules.length > 0) {
      setSelectedClass(daySchedules[0]);
      setModalVisible(true);
      setPopoverVisible(false);
    }
  };

  // Thêm hàm kiểm tra ngày dạy
  const canTakeAttendance = (startDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const classDate = new Date(startDay);
    classDate.setHours(0, 0, 0, 0);
    return classDate <= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
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
        <Content className="p-6 bg-gray-50">
          <Card className="mb-4">
            <Title level={4}>
              <CalendarOutlined className="mr-2" />
              Lịch dạy tại trung tâm
            </Title>
            <Text type="secondary">
              Xem và quản lý lịch dạy các lớp học tại trung tâm
            </Text>
          </Card>

          <Card className="mb-4">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Tổng số buổi học"
                  value={schedules.length}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Số lớp"
                  value={new Set(schedules.map((s) => s.classId)).size}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tổng số học viên"
                  value={schedules.reduce(
                    (total, schedule) => total + schedule.participants.length,
                    0
                  )}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card>
            <div className="mb-4">
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <Radio.Button value="month">Tháng</Radio.Button>
                <Radio.Button value="week">Tuần</Radio.Button>
              </Radio.Group>
            </div>

            <Calendar
              onSelect={handleDateSelect}
              mode={viewMode}
              dateCellRender={dateCellRender}
              className="custom-calendar"
              cellRender={(date) => {
                const dateStr = date.format("YYYY-MM-DD");
                const daySchedules = schedules.filter(
                  (schedule) => schedule.startDay === dateStr
                );

                if (daySchedules.length === 0) return null;

                return (
                  <Popover
                    open={popoverVisible}
                    onOpenChange={(visible) => setPopoverVisible(visible)}
                    content={
                      <div className="p-2">
                        <div className="font-medium mb-2">
                          Lịch dạy ngày {date.format("DD/MM/YYYY")}
                        </div>
                        <div className="space-y-2">
                          {daySchedules.map((schedule) => (
                            <div
                              key={schedule.scheduleId}
                              className="border rounded p-2"
                            >
                              <div className="flex items-center mb-1">
                                <div className="font-medium">
                                  {schedule.className}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <ClockCircleOutlined className="mr-1" />
                                {schedule.formattedTime}
                              </div>
                              <div className="text-sm text-gray-600">
                                <TeamOutlined className="mr-1" />
                                {schedule.participants.length} học viên
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                    trigger="click"
                  >
                    <div style={getDateCellStyle(date)}>
                      {dateCellRender(date)}
                    </div>
                  </Popover>
                );
              }}
            />
          </Card>

          {/* Modal chi tiết lớp học và điểm danh */}
          <Modal
            title={
              <Space>
                <CalendarOutlined />
                Chi tiết lớp học
              </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setModalVisible(false)}>
                Đóng
              </Button>,
            ]}
            width={800}
          >
            {selectedClass && (
              <div>
                <div className="mb-4">
                  <Title level={4}>{selectedClass.className}</Title>
                  <Space direction="vertical" size="small">
                    <Text>
                      <ClockCircleOutlined className="mr-2" />
                      {selectedClass.formattedTime}
                    </Text>
                    <Text>
                      <CalendarOutlined className="mr-2" />
                      {selectedClass.formattedDate} (
                      {selectedClass.formattedDayOfWeek})
                    </Text>
                    {!canTakeAttendance(selectedClass.startDay) && (
                      <Tag color="warning" icon={<ClockCircleOutlined />}>
                        Chưa đến ngày dạy
                      </Tag>
                    )}
                  </Space>
                </div>

                <Divider />

                <div className="mb-4">
                  <Title level={5}>Danh sách học viên</Title>
                  <List
                    dataSource={selectedClass.participants}
                    renderItem={(participant) => (
                      <List.Item
                        actions={[
                          <Button
                            type="primary"
                            onClick={() =>
                              handleAttendance(participant.scheduleId, 1)
                            }
                            className="bg-green-500 hover:bg-green-600"
                            loading={attendanceLoading}
                            disabled={
                              participant.attendanceStatus === 1 ||
                              !canTakeAttendance(selectedClass.startDay)
                            }
                            title={
                              !canTakeAttendance(selectedClass.startDay)
                                ? "Chưa đến ngày dạy"
                                : ""
                            }
                          >
                            <CheckCircleOutlined /> Có mặt
                          </Button>,
                          <Button
                            danger
                            onClick={() =>
                              handleAttendance(participant.scheduleId, 2)
                            }
                            loading={attendanceLoading}
                            disabled={
                              participant.attendanceStatus === 2 ||
                              !canTakeAttendance(selectedClass.startDay)
                            }
                            title={
                              !canTakeAttendance(selectedClass.startDay)
                                ? "Chưa đến ngày dạy"
                                : ""
                            }
                          >
                            <CloseCircleOutlined /> Vắng mặt
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={participant.learnerName}
                          description={
                            <Space>
                              {getAttendanceStatusTag(
                                participant.attendanceStatus
                              )}
                              {!canTakeAttendance(selectedClass.startDay) && (
                                <Text type="warning">(Chưa thể điểm danh)</Text>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CenterSchedule;
