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
  Tabs,
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
  BookOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

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
  const [selectedTab, setSelectedTab] = useState("info");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedules, setSelectedSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      const profileResponse = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
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
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/teacher/${teacherId}/register`,
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
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/update-attendance/${scheduleId}`,
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

    // Tính số ngày chênh lệch
    const diffTime = Math.abs(today - classDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Chỉ cho phép điểm danh trong ngày học hoặc 1 ngày sau
    return diffDays <= 1 && classDate <= today && !isPastDate(startDay);
  };

  const isPastDate = (startDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const classDate = new Date(startDay);
    classDate.setHours(0, 0, 0, 0);
    return classDate < today;
  };

  const getAttendanceMessage = (startDay) => {
    if (isPastDate(startDay)) {
      return (
        <Tag color="error" icon={<ClockCircleOutlined />}>
          Đã quá hạn điểm danh
        </Tag>
      );
    }
    return (
      <Tag color="warning" icon={<ClockCircleOutlined />}>
        Chưa đến ngày dạy
      </Tag>
    );
  };

  const getAttendanceStatus = (status) => {
    switch (status) {
      case 1:
        return { color: "success", text: "Có mặt" };
      case 2:
        return { color: "error", text: "Vắng mặt" };
      default:
        return { color: "default", text: "Chưa điểm danh" };
    }
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
            {isPastDate(selectedSchedule?.startDay)
              ? "Đã quá hạn điểm danh"
              : "Chưa điểm danh"}
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
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="space-y-1">
            {daySchedules.map((schedule, index) => (
              <div key={index} className="text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-800 truncate">
                    {schedule.learnerName}
                  </div>
                  <Tag color="blue" className="ml-1">
                    Buổi {schedule.sessionNumber}
                  </Tag>
                </div>
                <div className="text-gray-500">
                  {schedule.timeStart} - {schedule.timeEnd}
                </div>
              </div>
            ))}
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
      setSelectedDate(date);
      setSelectedSchedules(daySchedules);
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
                      <div className="w-[500px]">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                          <div>
                            <div className="text-lg font-medium">
                              Lịch dạy ngày {date.format("DD/MM/YYYY")}
                            </div>
                            <div className="text-gray-500 text-sm mt-1">
                              {daySchedules.length} buổi học
                            </div>
                          </div>
                          <Tag color="blue">
                            {formatDayOfWeek(daySchedules[0]?.dayOfWeek)}
                          </Tag>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                          {daySchedules.map((schedule, index) => (
                            <div
                              key={schedule.scheduleId}
                              className={`bg-white rounded-lg border ${
                                schedule.attendanceStatus === 1
                                  ? "border-green-200 bg-green-50"
                                  : schedule.attendanceStatus === 2
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200"
                              } p-4`}
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-medium">
                                    {schedule.sessionNumber}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {schedule.sessionTitle}
                                    </div>
                                    {schedule.sessionDescription && (
                                      <div className="text-sm text-gray-600 mt-1">
                                        {schedule.sessionDescription}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Tag
                                  color={
                                    getAttendanceStatus(
                                      schedule.attendanceStatus
                                    ).color
                                  }
                                >
                                  {
                                    getAttendanceStatus(
                                      schedule.attendanceStatus
                                    ).text
                                  }
                                </Tag>
                              </div>

                              {/* Student Info */}
                              <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded border border-gray-100">
                                <Avatar icon={<UserOutlined />} />
                                <div>
                                  <div className="font-medium">
                                    {schedule.learnerName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Học viên
                                  </div>
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                  <div className="flex items-center gap-2">
                                    <ClockCircleOutlined />
                                    <span>
                                      {schedule.timeStart} - {schedule.timeEnd}
                                    </span>
                                  </div>
                                  <Tag color="blue" icon={<HomeOutlined />}>
                                    Học tại nhà
                                  </Tag>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                  <EnvironmentOutlined className="mr-2" />
                                  <span>{schedule.learnerAddress}</span>
                                </div>

                                {schedule.isSessionCompleted !== null && (
                                  <Tag
                                    color={
                                      schedule.isSessionCompleted
                                        ? "success"
                                        : "default"
                                    }
                                  >
                                    {schedule.isSessionCompleted
                                      ? "Đã hoàn thành"
                                      : "Chưa hoàn thành"}
                                  </Tag>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                    trigger="click"
                    placement="right"
                    overlayClassName="custom-popover"
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
            onCancel={() => {
              setModalVisible(false);
              setSelectedSchedules([]);
              setSelectedDate(null);
            }}
            footer={[
              <Button
                key="back"
                onClick={() => {
                  setModalVisible(false);
                  setSelectedSchedules([]);
                  setSelectedDate(null);
                }}
              >
                Đóng
              </Button>,
            ]}
            width={800}
          >
            {selectedDate && selectedSchedules.length > 0 && (
              <div>
                <div className="mb-4">
                  <Title level={4} className="mb-4">
                    Lịch dạy ngày {selectedDate.format("DD/MM/YYYY")}
                  </Title>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedSchedules.map((schedule, index) => (
                      <div
                        key={schedule.scheduleId}
                        className={`bg-white rounded-lg border ${
                          schedule.attendanceStatus === 1
                            ? "border-green-200 bg-green-50"
                            : schedule.attendanceStatus === 2
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200"
                        } p-4`}
                      >
                        <Tabs defaultActiveKey="info">
                          <TabPane
                            tab={
                              <span>
                                <CalendarOutlined /> Thông tin buổi học
                              </span>
                            }
                            key="info"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar icon={<UserOutlined />} />
                                  <div>
                                    <div className="font-medium text-lg">
                                      {schedule.learnerName}
                                    </div>
                                    <Tag color="blue">
                                      Buổi {schedule.sessionNumber}
                                    </Tag>
                                  </div>
                                </div>
                                <div>
                                  {getAttendanceStatusTag(
                                    schedule.attendanceStatus
                                  )}
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-lg mb-1">
                                  {schedule.sessionTitle}
                                </div>
                                {schedule.sessionDescription && (
                                  <Text type="secondary">
                                    {schedule.sessionDescription}
                                  </Text>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Text>
                                  <ClockCircleOutlined className="mr-2" />
                                  {schedule.timeStart} - {schedule.timeEnd}
                                </Text>
                                <Text>
                                  <CalendarOutlined className="mr-2" />
                                  {schedule.formattedDate} (
                                  {schedule.formattedDayOfWeek})
                                </Text>
                                <Text>
                                  <EnvironmentOutlined className="mr-2" />
                                  {schedule.learnerAddress}
                                </Text>
                              </div>

                              <Divider />

                              <div>
                                <Title level={5}>Điểm danh</Title>
                                <div className="flex justify-center space-x-4">
                                  <Button
                                    type="primary"
                                    onClick={() =>
                                      handleAttendance(schedule.scheduleId, 1)
                                    }
                                    className="bg-green-500 hover:bg-green-600"
                                    loading={attendanceLoading}
                                    disabled={
                                      schedule.attendanceStatus === 1 ||
                                      !canTakeAttendance(schedule.startDay)
                                    }
                                    icon={<CheckCircleOutlined />}
                                  >
                                    Có mặt
                                  </Button>
                                  <Button
                                    danger
                                    onClick={() =>
                                      handleAttendance(schedule.scheduleId, 2)
                                    }
                                    loading={attendanceLoading}
                                    disabled={
                                      schedule.attendanceStatus === 2 ||
                                      !canTakeAttendance(schedule.startDay)
                                    }
                                    icon={<CloseCircleOutlined />}
                                  >
                                    Vắng mặt
                                  </Button>
                                </div>
                                {!canTakeAttendance(schedule.startDay) && (
                                  <div className="text-center mt-2">
                                    <Text type="warning">
                                      {isPastDate(schedule.startDay)
                                        ? "Đã quá hạn điểm danh"
                                        : "Chưa đến ngày dạy"}
                                    </Text>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabPane>
                          <TabPane
                            tab={
                              <span>
                                <BookOutlined /> Lộ trình học
                              </span>
                            }
                            key="path"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Title level={5} className="mb-0">
                                  Thông tin lộ trình
                                </Title>
                                <Tag
                                  color={
                                    schedule.isSessionCompleted
                                      ? "success"
                                      : "default"
                                  }
                                >
                                  {schedule.isSessionCompleted
                                    ? "Đã hoàn thành"
                                    : "Chưa hoàn thành"}
                                </Tag>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-medium">
                                    {schedule.sessionNumber}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {schedule.sessionTitle}
                                    </div>
                                    {schedule.sessionDescription && (
                                      <div className="text-gray-600 mt-1">
                                        {schedule.sessionDescription}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Text type="secondary">
                                    <CalendarOutlined className="mr-2" />
                                    Ngày học: {schedule.formattedDate}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </TabPane>
                        </Tabs>
                      </div>
                    ))}
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
