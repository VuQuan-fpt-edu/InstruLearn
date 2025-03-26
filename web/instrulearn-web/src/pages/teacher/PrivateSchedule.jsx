import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Tooltip,
  Avatar,
  Divider,
  Row,
  Col,
  Statistic,
  message,
  Switch,
  Spin,
  DatePicker,
  Empty,
  Modal,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import axios from "axios";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const PrivateSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("private-schedule");
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getDayOfWeekTag = (day) => {
    const dayMap = {
      Monday: { color: "red", text: "Thứ 2" },
      Tuesday: { color: "orange", text: "Thứ 3" },
      Wednesday: { color: "yellow", text: "Thứ 4" },
      Thursday: { color: "green", text: "Thứ 5" },
      Friday: { color: "blue", text: "Thứ 6" },
      Saturday: { color: "purple", text: "Thứ 7" },
      Sunday: { color: "magenta", text: "Chủ nhật" },
    };

    const dayInfo = dayMap[day] || { color: "default", text: day };
    return <Tag color={dayInfo.color}>{dayInfo.text}</Tag>;
  };

  const getWeekDates = (date) => {
    const startOfWeek = date.startOf("isoWeek");
    const endOfWeek = date.endOf("isoWeek");
    return {
      start: startOfWeek.format("DD/MM/YYYY"),
      end: endOfWeek.format("DD/MM/YYYY"),
    };
  };

  const getTimeSlotsForCurrentWeek = () => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    const schedulesInWeek = schedules.filter((schedule) =>
      dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );

    const uniqueTimeSlots = [
      ...new Set(
        schedulesInWeek.map(
          (schedule) => `${schedule.timeStart} - ${schedule.timeEnd}`
        )
      ),
    ].sort();

    return uniqueTimeSlots;
  };

  const getScheduleForTimeSlot = (day, timeSlot) => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    return schedules.find(
      (schedule) =>
        schedule.dayOfWeek === day &&
        `${schedule.timeStart} - ${schedule.timeEnd}` === timeSlot &&
        dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );
  };

  const hasSchedulesInCurrentWeek = () => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    return schedules.some((schedule) =>
      dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      const profileResponse = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Auth/Profile",
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
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setSchedules(response.data.data);
      } else {
        throw new Error("Không thể lấy lịch dạy");
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải lịch dạy");
      message.error(err.message || "Đã xảy ra lỗi khi tải lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleWeekChange = (date) => {
    setSelectedWeek(dayjs(date));
  };

  const handleCompletionChange = async (checked) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      const response = await axios.put(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Schedules/${selectedClass.scheduleId}/status`,
        {
          status: checked ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setSelectedClass((prev) => ({
          ...prev,
          status: checked ? 1 : 0,
        }));
        message.success(
          `Đã ${checked ? "xác nhận" : "hủy xác nhận"} hoàn thành buổi học`
        );
        fetchSchedules();
      } else {
        throw new Error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Đã xảy ra lỗi khi cập nhật trạng thái");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "green";
      case 0:
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Đã xác nhận";
      case 0:
        return "Chờ xác nhận";
      default:
        return "Không xác định";
    }
  };

  const weekDates = getWeekDates(selectedWeek);
  const timeSlots = getTimeSlotsForCurrentWeek();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const todaySchedules = schedules.filter(
    (schedule) =>
      dayjs(schedule.startDate).format("YYYY-MM-DD") ===
        dayjs().format("YYYY-MM-DD") && schedule.mode === 0
  );
  const completedSchedules = schedules.filter(
    (s) => s.status === 1 && s.mode === 0
  );
  const newLearners = [
    ...new Set(schedules.filter((s) => s.mode === 0).map((s) => s.learnerId)),
  ].length;

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
              Lịch dạy 1-1 tại nhà học viên
            </Title>
            <Text type="secondary">
              Xem và quản lý lịch dạy các buổi học 1-1 tại nhà học viên
            </Text>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              <CalendarOutlined className="mr-2" />
              Tuần: {weekDates.start} - {weekDates.end}
            </div>
            <DatePicker
              picker="week"
              value={selectedWeek}
              onChange={handleWeekChange}
              format="DD/MM/YYYY"
            />
          </div>

          <Card>
            {hasSchedulesInCurrentWeek() ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-100 w-32">Thời gian</th>
                      {days.map((day) => (
                        <th key={day} className="border p-2 bg-gray-100">
                          <div className="text-center">
                            {getDayOfWeekTag(day)}
                            <div className="text-xs text-gray-500 mt-1">
                              {dayjs(selectedWeek)
                                .day(
                                  day === "Sunday" ? 7 : days.indexOf(day) + 1
                                )
                                .format("DD/MM")}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="border p-2 text-center bg-gray-50">
                          <ClockCircleOutlined className="mr-1" />
                          {timeSlot}
                        </td>
                        {days.map((day) => {
                          const schedule = getScheduleForTimeSlot(
                            day,
                            timeSlot
                          );
                          return (
                            <td
                              key={`${day}-${timeSlot}`}
                              className="border p-2 cursor-pointer hover:bg-gray-50"
                              onClick={() => {
                                if (schedule) {
                                  setSelectedClass(schedule);
                                  setModalVisible(true);
                                }
                              }}
                            >
                              {schedule && (
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {schedule.learnerName}
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                description="Không có lịch dạy trong tuần này"
                className="py-8"
              />
            )}
          </Card>

          <Modal
            title={
              <Space>
                <CalendarOutlined />
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
            {selectedClass && (
              <div>
                <div className="text-center mb-4">
                  <Avatar icon={<UserOutlined />} size={80} className="mb-2" />
                  <Title level={4}>{selectedClass.learnerName}</Title>
                  <Tag color={getStatusColor(selectedClass.status)}>
                    {getStatusText(selectedClass.status)}
                  </Tag>
                </div>

                <Divider />

                <Space direction="vertical" size="middle" className="w-full">
                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text strong>Thời gian:</Text>
                      <Text>
                        {selectedClass.timeStart} - {selectedClass.timeEnd}
                      </Text>
                    </Space>
                  </div>

                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text strong>Thời lượng:</Text>
                      <Text>{selectedClass.duration} phút</Text>
                    </Space>
                  </div>

                  <div>
                    <Space align="start">
                      <EnvironmentOutlined className="mt-1" />
                      <div>
                        <Text strong>Địa chỉ:</Text>
                        <Paragraph>
                          {selectedClass.address || "Chưa cập nhật"}
                        </Paragraph>
                      </div>
                    </Space>
                  </div>

                  <Divider />

                  <div>
                    <Space>
                      <CheckCircleOutlined />
                      <Text strong>Xác nhận hoàn thành:</Text>
                      <Switch
                        checked={selectedClass.status === 1}
                        onChange={handleCompletionChange}
                        checkedChildren="Đã học"
                        unCheckedChildren="Chưa học"
                      />
                    </Space>
                  </div>

                  <div>
                    <Text strong>Khóa học:</Text>
                    <Paragraph className="mt-2">
                      {selectedClass.courseName}
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong>Ghi chú:</Text>
                    <Paragraph className="mt-2">
                      {selectedClass.note || "Không có ghi chú"}
                    </Paragraph>
                  </div>
                </Space>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PrivateSchedule;
