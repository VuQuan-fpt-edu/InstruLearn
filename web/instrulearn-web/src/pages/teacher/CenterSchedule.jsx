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
  Tabs,
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
  BookOutlined,
  HomeOutlined,
  BankOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CenterSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("center-schedule");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("info");

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
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/teacher/${teacherId}/classs`,
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

  const handleParticipantAttendance = async (participantScheduleId, status) => {
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/check-attendance/${participantScheduleId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.isSucceed) {
        message.success("Cập nhật điểm danh thành công");
        fetchSchedules(); // Cập nhật lại giao diện
      } else {
        throw new Error("Không thể cập nhật điểm danh");
      }
    } catch (error) {
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

    // Ngày học hơn 1 ngày so với ngày hiện tại thì coi là quá hạn điểm danh
    const diffTime = Math.abs(today - classDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return classDate < today && diffDays > 1;
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
        <div className="bg-blue-50 rounded-lg p-2">
          {daySchedules.map((schedule, index) => (
            <div key={index} className="text-xs">
              <div className="text-blue-600 font-medium truncate">
                {schedule.className}
              </div>
              <div className="text-gray-600">
                {schedule.timeStart} - {schedule.timeEnd}
              </div>
            </div>
          ))}
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

  // Tính tổng số học viên tham gia các lớp học
  const totalStudents = schedules.reduce(
    (total, schedule) => total + schedule.participants.length,
    0
  );

  // Lấy danh sách các lớp học duy nhất
  const uniqueClasses = [...new Set(schedules.map((s) => s.classId))];

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
              <BankOutlined className="mr-2" />
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
                  title="Số lớp học"
                  value={uniqueClasses.length}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tổng số học viên"
                  value={totalStudents}
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
                              {daySchedules.length} buổi học - Lớp:{" "}
                              {daySchedules[0].className}
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
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="font-medium text-gray-900">
                                    {schedule.className}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BankOutlined className="text-blue-500" />
                                  <span className="text-sm">Tại trung tâm</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                  <ClockCircleOutlined />
                                  <span>
                                    {schedule.timeStart} - {schedule.timeEnd}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                  <TeamOutlined />
                                  <span>
                                    {schedule.participants.length} học viên
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                  <CalendarOutlined />
                                  <span>
                                    Thứ trong tuần:{" "}
                                    {schedule.scheduleDays
                                      .map((day) =>
                                        formatDayOfWeek(day.dayOfWeeks)
                                      )
                                      .join(", ")}
                                  </span>
                                </div>
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
                <BankOutlined />
                Chi tiết buổi học tại trung tâm
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
                        className="bg-white rounded-lg border p-4"
                      >
                        <Tabs defaultActiveKey="info" onChange={setSelectedTab}>
                          <TabPane
                            tab={
                              <span>
                                <CalendarOutlined /> Thông tin lớp học
                              </span>
                            }
                            key="info"
                          >
                            <div className="space-y-4">
                              {/* Thông tin lớp học */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-lg">
                                    {schedule.className}
                                  </div>
                                  <Tag color="blue" icon={<BankOutlined />}>
                                    Tại trung tâm
                                  </Tag>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="space-y-2">
                                  <Text>
                                    <ClockCircleOutlined className="mr-2" />
                                    {schedule.timeStart} - {schedule.timeEnd}
                                  </Text>
                                  <div>
                                    <CalendarOutlined className="mr-2" />
                                    {schedule.formattedDate} (
                                    {schedule.formattedDayOfWeek})
                                  </div>
                                  <div>
                                    <TeamOutlined className="mr-2" />
                                    Lịch học hàng tuần:{" "}
                                    {schedule.scheduleDays
                                      .map((day) =>
                                        formatDayOfWeek(day.dayOfWeeks)
                                      )
                                      .join(", ")}
                                  </div>
                                </div>
                              </div>

                              <Divider />

                              {/* Danh sách học viên và điểm danh */}
                              <div>
                                <Title level={5}>Danh sách học viên</Title>
                                {schedule.participants.length > 0 ? (
                                  <List
                                    dataSource={schedule.participants}
                                    renderItem={(participant) => (
                                      <List.Item className="border rounded-lg p-3 mb-2">
                                        <div className="w-full">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                              <Avatar icon={<UserOutlined />} />
                                              <div className="font-medium">
                                                {participant.learnerName}
                                              </div>
                                            </div>
                                            <div>
                                              {getAttendanceStatusTag(
                                                participant.attendanceStatus
                                              )}
                                            </div>
                                          </div>

                                          <Divider className="my-2" />

                                          <div className="flex justify-center space-x-4">
                                            <Button
                                              type="primary"
                                              onClick={() =>
                                                handleParticipantAttendance(
                                                  participant.scheduleId,
                                                  1
                                                )
                                              }
                                              className="bg-green-500 hover:bg-green-600"
                                              loading={attendanceLoading}
                                              disabled={
                                                participant.attendanceStatus ===
                                                  1 ||
                                                !canTakeAttendance(
                                                  schedule.startDay
                                                )
                                              }
                                              icon={<CheckCircleOutlined />}
                                            >
                                              Có mặt
                                            </Button>
                                            <Button
                                              danger
                                              onClick={() =>
                                                handleParticipantAttendance(
                                                  participant.scheduleId,
                                                  2
                                                )
                                              }
                                              loading={attendanceLoading}
                                              disabled={
                                                participant.attendanceStatus ===
                                                  2 ||
                                                !canTakeAttendance(
                                                  schedule.startDay
                                                )
                                              }
                                              icon={<CloseCircleOutlined />}
                                            >
                                              Vắng mặt
                                            </Button>
                                          </div>

                                          {!canTakeAttendance(
                                            schedule.startDay
                                          ) && (
                                            <div className="text-center mt-2">
                                              <Text type="warning">
                                                {getAttendanceMessage(
                                                  schedule.startDay
                                                )}
                                              </Text>
                                            </div>
                                          )}
                                        </div>
                                      </List.Item>
                                    )}
                                  />
                                ) : (
                                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <Text type="secondary">
                                      Không có học viên trong lớp này
                                    </Text>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabPane>
                          <TabPane
                            tab={
                              <span>
                                <BookOutlined /> Thông tin khóa học
                              </span>
                            }
                            key="course"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Title level={5} className="mb-0">
                                  Thông tin lớp học
                                </Title>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="mb-3">
                                  <div className="font-medium">
                                    {schedule.className}
                                  </div>
                                  <div className="text-gray-600 mt-1">
                                    Mã lớp: {schedule.classId}
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <div className="font-medium mb-2">
                                    Lịch học:
                                  </div>
                                  <div className="space-y-1">
                                    {schedule.scheduleDays.map((day, idx) => (
                                      <Tag key={idx} color="blue">
                                        {formatDayOfWeek(day.dayOfWeeks)}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Text type="secondary">
                                    <ClockCircleOutlined className="mr-2" />
                                    {schedule.timeStart} - {schedule.timeEnd}
                                  </Text>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Title level={5}>Danh sách học viên</Title>
                                {schedule.participants.map(
                                  (participant, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 p-2 border-b"
                                    >
                                      <Avatar
                                        icon={<UserOutlined />}
                                        size="small"
                                      />
                                      <div>{participant.learnerName}</div>
                                    </div>
                                  )
                                )}
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

      <style jsx global>{`
        .custom-popover {
          max-width: 500px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .ant-btn-primary {
          background-color: #1890ff;
        }

        .bg-green-500 {
          background-color: #52c41a !important;
        }

        .hover\:bg-green-600:hover {
          background-color: #389e0d !important;
        }
      `}</style>
    </Layout>
  );
};

export default CenterSchedule;
