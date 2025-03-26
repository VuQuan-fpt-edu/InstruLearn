import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Badge,
  Select,
  Empty,
  message,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { Title } = Typography;
const { Option } = Select;

const MySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [timeSlots, setTimeSlots] = useState([]);

  // Hàm lấy time slots cho tuần hiện tại
  const getTimeSlotsForCurrentWeek = () => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    // Lọc ra các lịch học trong tuần hiện tại
    const schedulesInWeek = schedules.filter((schedule) =>
      dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );

    // Lấy các time slots duy nhất từ lịch học trong tuần
    const uniqueTimeSlots = [
      ...new Set(
        schedulesInWeek.map(
          (schedule) => `${schedule.timeStart} - ${schedule.timeEnd}`
        )
      ),
    ].sort();

    return uniqueTimeSlots;
  };

  // Cập nhật timeSlots khi selectedWeek hoặc schedules thay đổi
  useEffect(() => {
    setTimeSlots(getTimeSlotsForCurrentWeek());
  }, [selectedWeek, schedules]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        message.error("Vui lòng đăng nhập để xem lịch học");
        return;
      }

      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Schedules/learner/${learnerId}/schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.isSucceed) {
        const scheduleData = response.data.data;
        console.log("Schedule Data:", scheduleData);

        if (scheduleData.length > 0) {
          // Lấy ngày bắt đầu từ registrationStartDay của buổi học đầu tiên
          const startDate = dayjs(scheduleData[0].registrationStartDay);
          // Lấy ngày kết thúc từ startDate của buổi học cuối cùng
          const endDate = dayjs(
            scheduleData[scheduleData.length - 1].startDate
          );

          setDateRange({
            start: startDate,
            end: endDate,
          });

          // Set selectedWeek về tuần của registrationStartDay
          setSelectedWeek(startDate);
        }

        setSchedules(scheduleData);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Không thể tải lịch học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getModeTag = (mode) => {
    const modeMap = {
      0: { color: "blue", text: "1-1", icon: <UserOutlined /> },
      OneOnOne: { color: "blue", text: "1-1", icon: <UserOutlined /> },
    };

    const modeInfo = modeMap[mode] || {
      color: "default",
      text: mode,
      icon: null,
    };
    return (
      <Tag color={modeInfo.color} icon={modeInfo.icon}>
        {modeInfo.text}
      </Tag>
    );
  };

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

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getWeekDates = (date) => {
    const startOfWeek = date.startOf("isoWeek");
    const endOfWeek = date.endOf("isoWeek");
    return {
      start: startOfWeek.format("DD/MM/YYYY"),
      end: endOfWeek.format("DD/MM/YYYY"),
    };
  };

  const getScheduleForTimeSlot = (day, timeSlot) => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    // Log để debug
    console.log("Looking for schedule:", {
      day,
      timeSlot,
      weekStart: weekStart.format("YYYY-MM-DD"),
      weekEnd: weekEnd.format("YYYY-MM-DD"),
    });

    const schedule = schedules.find(
      (schedule) =>
        schedule.dayOfWeek === day &&
        `${schedule.timeStart} - ${schedule.timeEnd}` === timeSlot &&
        dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );

    // Log kết quả tìm kiếm
    if (schedule) {
      console.log("Found schedule:", schedule);
    }

    return schedule;
  };

  const weekDates = getWeekDates(selectedWeek);

  const handleWeekChange = (date) => {
    const selectedDate = dayjs(date);
    console.log("Selected date:", selectedDate.format("YYYY-MM-DD")); // Log để debug
    setSelectedWeek(selectedDate);
  };

  // Thêm useEffect để log khi schedules thay đổi
  useEffect(() => {
    console.log("Schedules updated:", schedules);
  }, [schedules]);

  const hasSchedulesInCurrentWeek = () => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    // Log để debug
    console.log("Checking schedules in week:", {
      weekStart: weekStart.format("YYYY-MM-DD"),
      weekEnd: weekEnd.format("YYYY-MM-DD"),
      schedules: schedules,
    });

    const hasSchedules = schedules.some((schedule) =>
      dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );

    console.log("Has schedules:", hasSchedules);
    return hasSchedules;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={4}>Thời khóa biểu</Title>
          <div className="text-gray-600">
            <CalendarOutlined className="mr-2" />
            {dateRange.start && dateRange.end ? (
              <>
                Khóa học từ {dateRange.start.format("DD/MM/YYYY")} đến{" "}
                {dateRange.end.format("DD/MM/YYYY")}
                <br />
                Tuần hiện tại: {weekDates.start} - {weekDates.end}
                {!hasSchedulesInCurrentWeek() && (
                  <div className="text-orange-500 mt-1">
                    Không có lịch học trong tuần này
                  </div>
                )}
              </>
            ) : (
              "Chưa có lịch học"
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <DatePicker
            picker="week"
            value={selectedWeek}
            onChange={handleWeekChange}
            format="DD/MM/YYYY"
          />
        </div>
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
                            .day(day === "Sunday" ? 7 : days.indexOf(day) + 1)
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
                      const schedule = getScheduleForTimeSlot(day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="border p-2">
                          {schedule && (
                            <div className="text-sm">
                              <div className="font-medium">
                                {schedule.teacherName}
                              </div>
                              <div className="mt-1">
                                {getModeTag(schedule.mode)}
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
            description="Không có lịch học trong tuần này"
            className="py-8"
          />
        )}
      </Card>

      <Card title="Chú thích">
        <Row gutter={[16, 16]}>
          <Col>
            <Space>
              <Tag color="blue" icon={<UserOutlined />}>
                1-1
              </Tag>
              <span>Học một kèm một</span>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MySchedule;
