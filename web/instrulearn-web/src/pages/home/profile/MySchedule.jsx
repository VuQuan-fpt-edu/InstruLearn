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
  CheckCircleOutlined,
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
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/learner/${learnerId}/class`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch one-on-one schedules
      const oneOnOneResponse = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/learner/${learnerId}/schedules`,
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
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors duration-200"
            >
              {/* Header với thông tin buổi học */}
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag color="purple">Buổi {schedule.sessionNumber}</Tag>
                    <span className="font-medium text-gray-800">
                      {schedule.sessionTitle}
                    </span>
                  </div>
                  <Tag
                    color={getAttendanceStatus(schedule.attendanceStatus).color}
                  >
                    {getAttendanceStatus(schedule.attendanceStatus).text}
                  </Tag>
                </div>
              </div>

              {/* Nội dung chính */}
              <div className="p-3 space-y-3">
                {/* Thông tin giảng viên */}
                <div className="flex items-center space-x-2">
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {schedule.teacherName}
                    </div>
                    <div className="text-xs text-gray-500">Giảng viên</div>
                  </div>
                </div>

                {/* Thông tin thời gian và địa điểm */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2" />
                    <Tag color="blue">
                      {convertDayToVietnamese(schedule.dayOfWeek)}
                    </Tag>
                  </div>
                  <div className="flex items-center">
                    <ClockCircleOutlined className="mr-2" />
                    <span>
                      {schedule.timeStart} - {schedule.timeEnd}
                    </span>
                  </div>
                  {getModeTag(schedule.mode)}
                </div>

                {/* Địa chỉ hoặc lớp học */}
                {schedule.mode === "OneOnOne" && schedule.learnerAddress && (
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvironmentOutlined className="mr-2" />
                    <span>{schedule.learnerAddress}</span>
                  </div>
                )}

                {schedule.className && schedule.className !== "N/A" && (
                  <div className="flex items-center text-sm text-gray-600">
                    <TeamOutlined className="mr-2" />
                    <span>Lớp: {schedule.className}</span>
                  </div>
                )}

                {/* Mô tả buổi học */}
                {schedule.sessionDescription && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {schedule.sessionDescription}
                  </div>
                )}
              </div>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={4} className="mb-1">
              Lịch học của tôi
            </Title>
            <Text type="secondary">
              <CalendarOutlined className="mr-2" />
              Quản lý lịch học và theo dõi tiến độ
            </Text>
          </div>
          <div className="flex items-center gap-4">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="month">
                <CalendarOutlined /> Tháng
              </Radio.Button>
              <Radio.Button value="week">
                <ClockCircleOutlined /> Tuần
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mb-6"
          items={[
            {
              key: "all",
              label: (
                <span>
                  <TeamOutlined className="mr-2" />
                  Tất cả
                </span>
              ),
            },
            {
              key: "class",
              label: (
                <span>
                  <TeamOutlined className="mr-2" />
                  Lớp học
                </span>
              ),
            },
            {
              key: "oneOnOne",
              label: (
                <span>
                  <UserOutlined className="mr-2" />
                  Học 1-1
                </span>
              ),
            },
          ]}
        />

        <div className="bg-white rounded-lg border border-gray-200">
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
                    <div className="w-[500px]">
                      <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div>
                          <div className="text-lg font-medium">
                            Lịch học ngày {date.format("DD/MM/YYYY")}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            {daySchedules.length} buổi học
                          </div>
                        </div>
                        <Tag color="blue">
                          {convertDayToVietnamese(daySchedules[0]?.dayOfWeek)}
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
                                  getAttendanceStatus(schedule.attendanceStatus)
                                    .color
                                }
                              >
                                {
                                  getAttendanceStatus(schedule.attendanceStatus)
                                    .text
                                }
                              </Tag>
                            </div>

                            {/* Teacher Info */}
                            <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded border border-gray-100">
                              <Avatar icon={<UserOutlined />} />
                              <div>
                                <div className="font-medium">
                                  {schedule.teacherName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Giảng viên
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
                                {getModeTag(schedule.mode)}
                                {schedule.className &&
                                  schedule.className !== "N/A" && (
                                    <Tag icon={<TeamOutlined />} color="cyan">
                                      Lớp: {schedule.className}
                                    </Tag>
                                  )}
                              </div>

                              {schedule.mode === "OneOnOne" &&
                                schedule.learnerAddress && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <EnvironmentOutlined className="mr-2" />
                                    <span>{schedule.learnerAddress}</span>
                                  </div>
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
                  <div
                    className={`h-full p-2 rounded-lg cursor-pointer ${
                      daySchedules.some((s) => s.attendanceStatus === 1)
                        ? "bg-green-50"
                        : daySchedules.some((s) => s.attendanceStatus === 2)
                        ? "bg-red-50"
                        : "bg-blue-50"
                    }`}
                  >
                    <div className="space-y-1">
                      {daySchedules.map((schedule, index) => (
                        <div key={index} className="text-xs">
                          <div className="font-medium text-gray-800 truncate">
                            {schedule.teacherName}
                          </div>
                          <div className="text-gray-500">
                            {schedule.timeStart?.substring(0, 5)} -{" "}
                            {schedule.timeEnd?.substring(0, 5)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popover>
              );
            }}
          />
        </div>
      </Card>

      <Card title="Chú thích" className="mt-6">
        <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="space-y-2">
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
        </div>
      </Card>

      <style jsx global>{`
        .custom-calendar .ant-picker-calendar-date-content {
          height: ${viewMode === "month" ? "80px" : "120px"};
          overflow-y: auto;
        }
        .custom-calendar .ant-picker-calendar-date {
          padding: 4px;
        }
        .custom-calendar .ant-picker-calendar-date-value {
          font-size: 1.2em;
        }
        .custom-calendar .ant-picker-calendar-header {
          padding: 12px 0;
        }
        .custom-calendar .ant-picker-calendar-date-content::-webkit-scrollbar {
          width: 4px;
        }
        .custom-calendar
          .ant-picker-calendar-date-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-calendar
          .ant-picker-calendar-date-content::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 2px;
        }
        .custom-calendar
          .ant-picker-calendar-date-content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .custom-popover {
          max-width: 90vw;
        }

        .custom-popover .ant-popover-inner {
          padding: 0;
        }

        .custom-popover .ant-popover-inner-content {
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default MySchedule;
