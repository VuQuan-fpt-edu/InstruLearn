import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Tag,
  message,
  Calendar,
  Radio,
  Popover,
  Avatar,
  Spin,
  Tabs,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MySchedule = () => {
  const [classSchedules, setClassSchedules] = useState([]);
  const [oneOnOneSchedules, setOneOnOneSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        message.error("Vui lòng đăng nhập để xem lịch học");
        return;
      }

      // Fetch class schedules
      const classResponse = await fetch(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/learner/${learnerId}/class`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch one-on-one schedules
      const oneOnOneResponse = await fetch(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/learner/${learnerId}/schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const classData = await classResponse.json();
      const oneOnOneData = await oneOnOneResponse.json();

      if (classData?.isSucceed) {
        setClassSchedules(classData.data);
      }

      if (oneOnOneData?.isSucceed) {
        setOneOnOneSchedules(oneOnOneData.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Không thể tải lịch học");
    } finally {
      setLoading(false);
    }
  };

  const getModeTag = (mode) => {
    const modeMap = {
      Center: {
        color: "green",
        text: "Tại trung tâm",
        icon: <EnvironmentOutlined />,
      },
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

  const getDateCellStyle = (value, schedules) => {
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

  const getAttendanceStatus = (status) => {
    const statusMap = {
      0: { color: "default", text: "Chưa điểm danh" },
      1: { color: "success", text: "Có mặt" },
      2: { color: "error", text: "Vắng mặt" },
    };
    return statusMap[status] || { color: "default", text: "Không xác định" };
  };

  const renderScheduleContent = (schedules) => {
    return (
      <div className="p-2">
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div key={schedule.scheduleId} className="border rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <Avatar
                    icon={<UserOutlined />}
                    size="small"
                    className="mr-2"
                  />
                  <div className="font-medium">{schedule.teacherName}</div>
                </div>
                <Tag
                  color={getAttendanceStatus(schedule.attendanceStatus).color}
                >
                  {getAttendanceStatus(schedule.attendanceStatus).text}
                </Tag>
              </div>
              <div className="text-sm text-gray-600">
                <Tag color="blue">
                  {convertDayToVietnamese(schedule.dayOfWeek)}
                </Tag>
                <span className="ml-1">{getModeTag(schedule.mode)}</span>
              </div>
              <div className="text-sm text-gray-600">
                <ClockCircleOutlined className="mr-1" />
                {schedule.timeStart} - {schedule.timeEnd}
              </div>
              {schedule.className && schedule.className !== "N/A" && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Lớp:</span> {schedule.className}
                </div>
              )}
              {schedule.learnerAddress && schedule.mode === "OneOnOne" && (
                <div className="text-sm text-gray-600">
                  <EnvironmentOutlined className="mr-1" />
                  {schedule.learnerAddress}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const dateCellRender = (value, schedules) => {
    const date = value.format("YYYY-MM-DD");
    const daySchedules = schedules.filter(
      (schedule) => schedule.startDay === date
    );

    if (daySchedules.length === 0) return null;

    const hasAttendance = daySchedules.some(
      (schedule) => schedule.attendanceStatus > 0
    );
    const allPresent = daySchedules.every(
      (schedule) => schedule.attendanceStatus === 1
    );
    const allAbsent = daySchedules.every(
      (schedule) => schedule.attendanceStatus === 2
    );

    let bgColor = "bg-blue-50";
    if (hasAttendance) {
      bgColor = allPresent
        ? "bg-green-50"
        : allAbsent
        ? "bg-red-50"
        : "bg-yellow-50";
    }

    return (
      <div className="h-full">
        <div className={`${bgColor} rounded-lg p-2 text-center`}>
          <div
            className={`${
              hasAttendance
                ? allPresent
                  ? "text-green-600"
                  : allAbsent
                  ? "text-red-600"
                  : "text-yellow-600"
                : "text-blue-600"
            } font-medium`}
          >
            {daySchedules.length} buổi học
          </div>
        </div>
      </div>
    );
  };

  const convertDayToVietnamese = (day) => {
    const dayMap = {
      Monday: "Thứ 2",
      Tuesday: "Thứ 3",
      Wednesday: "Thứ 4",
      Thursday: "Thứ 5",
      Friday: "Thứ 6",
      Saturday: "Thứ 7",
      Sunday: "Chủ nhật",
    };
    return dayMap[day] || day;
  };

  const getFilteredSchedules = () => {
    switch (activeTab) {
      case "class":
        return classSchedules;
      case "oneOnOne":
        return oneOnOneSchedules;
      case "all":
      default:
        return [...classSchedules, ...oneOnOneSchedules];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const filteredSchedules = getFilteredSchedules();

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Lịch học của tôi</Title>
          <div className="text-gray-600">
            <CalendarOutlined className="mr-2" />
            Lịch học cá nhân
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Lớp học
              </span>
            }
            key="class"
          />
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Học 1-1
              </span>
            }
            key="oneOnOne"
          />
        </Tabs>

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
            mode={viewMode}
            fullscreen={false}
            className="custom-calendar"
            cellRender={(date) => {
              const dateStr = date.format("YYYY-MM-DD");
              const daySchedules = filteredSchedules.filter(
                (schedule) => schedule.startDay === dateStr
              );

              if (daySchedules.length === 0) return null;

              return (
                <Popover
                  content={
                    <div>
                      <div className="font-medium mb-2">
                        Lịch học ngày {date.format("DD/MM/YYYY")}
                      </div>
                      {renderScheduleContent(daySchedules)}
                    </div>
                  }
                  trigger="click"
                >
                  <div style={getDateCellStyle(date, filteredSchedules)}>
                    {dateCellRender(date, filteredSchedules)}
                  </div>
                </Popover>
              );
            }}
          />
        </Card>
      </Card>

      <Card title="Chú thích">
        <div className="space-y-2">
          <div className="flex items-center">
            <Tag color="blue" icon={<UserOutlined />}>
              1-1
            </Tag>
            <span className="ml-2">Học một kèm một</span>
          </div>
          <div className="flex items-center">
            <Tag color="green" icon={<EnvironmentOutlined />}>
              Tại trung tâm
            </Tag>
            <span className="ml-2">Học tại trung tâm</span>
          </div>
          <div className="flex items-center">
            <Tag color="success">Có mặt</Tag>
            <span className="ml-2">Đã điểm danh có mặt</span>
          </div>
          <div className="flex items-center">
            <Tag color="error">Vắng mặt</Tag>
            <span className="ml-2">Đã điểm danh vắng mặt</span>
          </div>
          <div className="flex items-center">
            <Tag>Chưa điểm danh</Tag>
            <span className="ml-2">Chưa được điểm danh</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-50 rounded mr-2"></div>
            <span>Ngày có lịch học (chưa điểm danh)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-50 rounded mr-2"></div>
            <span>Ngày có mặt đầy đủ</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-red-50 rounded mr-2"></div>
            <span>Ngày vắng mặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-50 rounded mr-2"></div>
            <span>Ngày có cả buổi có mặt và vắng mặt</span>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        .custom-calendar .ant-picker-calendar-date-content {
          height: 40px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MySchedule;
