import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Button,
  Select,
  message,
  Calendar,
  Radio,
  Popover,
  Avatar,
  Tag,
  Spin,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const TeacherPersonalSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Teacher/get-all"
      );
      if (response.data) {
        const activeTeachers = response.data
          .filter((item) => item.isSucceed && item.data.isActive === 1)
          .map((item) => ({
            ...item.data,
            majors: item.data.majors.filter((major) => major.status === 1),
          }));
        setTeachers(activeTeachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("Không thể tải danh sách giáo viên");
    }
  };

  const handleTeacherChange = async (teacherId) => {
    setSchedules([]);
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    setSelectedTeacher(teacher);

    if (teacherId) {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://instrulearnapplication.azurewebsites.net/api/Schedules/teacher/${teacherId}/register`
        );

        if (response.data?.isSucceed) {
          const processedSchedules = response.data.data.map((schedule) => ({
            ...schedule,
            formattedTime: `${schedule.timeStart} - ${schedule.timeEnd}`,
            formattedDate: dayjs(schedule.startDay).format("DD/MM/YYYY"),
            formattedDayOfWeek: convertDayToVietnamese(schedule.dayOfWeek),
          }));
          setSchedules(processedSchedules);
        } else {
          setSchedules([]);
          message.error("Không thể tải lịch dạy của giáo viên");
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        message.error("Không thể tải lịch dạy của giáo viên");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSchedules([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="teacher-personal-schedule"
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="p-6 min-h-screen bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý lịch dạy</Title>
              <Select
                placeholder="Chọn giáo viên"
                style={{ width: 200 }}
                onChange={handleTeacherChange}
              >
                {teachers.map((teacher) => (
                  <Option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.fullname}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedTeacher && (
              <div className="mb-4">
                <div className="text-gray-600">
                  <UserOutlined className="mr-2" />
                  Giáo viên: {selectedTeacher.fullname}
                </div>
              </div>
            )}

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
                  const daySchedules = schedules.filter(
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
                                Lịch dạy ngày {date.format("DD/MM/YYYY")}
                              </div>
                              <div className="text-gray-500 text-sm mt-1">
                                {daySchedules.length} buổi học
                              </div>
                            </div>
                            <Tag color="blue">
                              {daySchedules[0]?.formattedDayOfWeek}
                            </Tag>
                          </div>

                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {daySchedules.map((schedule, index) => (
                              <div
                                key={schedule.scheduleId}
                                className="bg-white rounded-lg border border-gray-200 p-4"
                              >
                                {/* Header Session Info */}
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
                                  {/* <Tag
                                    color={
                                      schedule.isSessionCompleted
                                        ? "success"
                                        : "default"
                                    }
                                  >
                                    {!schedule.isSessionCompleted &&
                                      "Chưa hoàn thành"}
                                  </Tag> */}
                                </div>

                                {/* Learner Info */}
                                <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded border border-gray-100">
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

                                {/* Schedule Details */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <div className="flex items-center gap-2">
                                      <ClockCircleOutlined />
                                      <span>
                                        {schedule.timeStart} -{" "}
                                        {schedule.timeEnd}
                                      </span>
                                    </div>
                                    {getModeTag(schedule.mode)}
                                  </div>

                                  <div className="flex items-center text-sm text-gray-600">
                                    <EnvironmentOutlined className="mr-2" />
                                    <span>
                                      {schedule.learnerAddress ||
                                        "Chưa có địa chỉ"}
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
          </Card>
        </Content>
      </Layout>

      {/* Thêm CSS cho thanh cuộn tùy chỉnh */}
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
    </Layout>
  );
};

export default TeacherPersonalSchedule;
