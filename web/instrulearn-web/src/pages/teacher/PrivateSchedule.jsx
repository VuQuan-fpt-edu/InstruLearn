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
  Modal,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;

const PrivateSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("private-schedule");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
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
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/register`,
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

  const handleAttendance = async (scheduleId, status) => {
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/update-attendance/${scheduleId}`,
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
          if (schedule.scheduleId === scheduleId) {
            return {
              ...schedule,
              attendanceStatus: status,
            };
          }
          return schedule;
        });
        setSchedules(updatedSchedules);

        // Cập nhật selectedSchedule
        if (selectedSchedule && selectedSchedule.scheduleId === scheduleId) {
          setSelectedSchedule({
            ...selectedSchedule,
            attendanceStatus: status,
          });
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

  const canTakeAttendance = (startDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const classDate = new Date(startDay);
    classDate.setHours(0, 0, 0, 0);
    return classDate <= today;
  };

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

  useEffect(() => {
    fetchSchedules();
  }, []);

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
      setSelectedSchedule(daySchedules[0]);
      setModalVisible(true);
      setPopoverVisible(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const uniqueLearners = [...new Set(schedules.map((s) => s.learnerId))];

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
              <HomeOutlined className="mr-2" />
              Lịch dạy 1-1 tại nhà học viên
            </Title>
            <Text type="secondary">
              Xem và quản lý lịch dạy các buổi học 1-1 tại nhà học viên
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
                  title="Số học viên"
                  value={uniqueLearners.length}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Buổi học đã điểm danh"
                  value={
                    schedules.filter((s) => s.attendanceStatus !== 0).length
                  }
                  prefix={<CheckCircleOutlined />}
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
                                <Avatar
                                  icon={<UserOutlined />}
                                  className="mr-2"
                                />
                                <div className="font-medium">
                                  {schedule.learnerName}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <ClockCircleOutlined className="mr-1" />
                                {schedule.formattedTime}
                              </div>
                              <div className="text-sm text-gray-600">
                                <EnvironmentOutlined className="mr-1" />
                                {schedule.learnerAddress}
                              </div>
                              <div className="mt-1">
                                {getAttendanceStatusTag(
                                  schedule.attendanceStatus
                                )}
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

          {/* Modal chi tiết buổi học */}
          <Modal
            title={
              <Space>
                <HomeOutlined />
                Chi tiết buổi học 1-1
              </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setModalVisible(false)}>
                Đóng
              </Button>,
            ]}
            width={600}
          >
            {selectedSchedule && (
              <div>
                <div className="mb-4">
                  <Space direction="vertical" size="small" className="w-full">
                    <div className="flex items-center">
                      <Avatar icon={<UserOutlined />} className="mr-2" />
                      <Title level={4} className="mb-0">
                        {selectedSchedule.learnerName}
                      </Title>
                    </div>
                    <Text>
                      <ClockCircleOutlined className="mr-2" />
                      {selectedSchedule.formattedTime}
                    </Text>
                    <Text>
                      <CalendarOutlined className="mr-2" />
                      {selectedSchedule.formattedDate} (
                      {selectedSchedule.formattedDayOfWeek})
                    </Text>
                    <Text>
                      <EnvironmentOutlined className="mr-2" />
                      {selectedSchedule.learnerAddress}
                    </Text>
                    {!canTakeAttendance(selectedSchedule.startDay) && (
                      <Tag color="warning" icon={<ClockCircleOutlined />}>
                        Chưa đến ngày dạy
                      </Tag>
                    )}
                  </Space>
                </div>

                <Divider />

                <div className="mb-4">
                  <Title level={5}>Điểm danh</Title>
                  <div className="flex justify-center space-x-4">
                    <Button
                      type="primary"
                      onClick={() =>
                        handleAttendance(selectedSchedule.scheduleId, 1)
                      }
                      className="bg-green-500 hover:bg-green-600"
                      loading={attendanceLoading}
                      disabled={
                        selectedSchedule.attendanceStatus === 1 ||
                        !canTakeAttendance(selectedSchedule.startDay)
                      }
                      icon={<CheckCircleOutlined />}
                    >
                      Có mặt
                    </Button>
                    <Button
                      danger
                      onClick={() =>
                        handleAttendance(selectedSchedule.scheduleId, 2)
                      }
                      loading={attendanceLoading}
                      disabled={
                        selectedSchedule.attendanceStatus === 2 ||
                        !canTakeAttendance(selectedSchedule.startDay)
                      }
                      icon={<CloseCircleOutlined />}
                    >
                      Vắng mặt
                    </Button>
                  </div>
                  <div className="text-center mt-4">
                    <Space>
                      <Text>Trạng thái:</Text>
                      {getAttendanceStatusTag(
                        selectedSchedule.attendanceStatus
                      )}
                    </Space>
                    {!canTakeAttendance(selectedSchedule.startDay) && (
                      <div className="mt-2">
                        <Text type="warning">(Chưa thể điểm danh)</Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PrivateSchedule;
