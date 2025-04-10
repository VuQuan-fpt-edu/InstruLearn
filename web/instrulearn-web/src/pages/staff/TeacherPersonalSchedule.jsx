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
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Teacher/get-all"
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
    // Reset schedules trước khi fetch dữ liệu mới
    setSchedules([]);

    // Cập nhật giáo viên được chọn
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    setSelectedTeacher(teacher);

    if (teacherId) {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/register`
        );

        if (response.data?.isSucceed) {
          setSchedules(response.data.data);
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
    const date = value.format("YYYY-MM-DD");
    const daySchedules = schedules.filter(
      (schedule) => schedule.startDay === date
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
                                    size="small"
                                    className="mr-2"
                                  />
                                  <div className="font-medium">
                                    {schedule.learnerName}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <Tag color="blue">
                                    {convertDayToVietnamese(schedule.dayOfWeek)}
                                  </Tag>
                                  <span className="ml-1">
                                    {getModeTag(schedule.mode)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <ClockCircleOutlined className="mr-1" />
                                  {schedule.timeStart} - {schedule.timeEnd}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <EnvironmentOutlined className="mr-1" />
                                  {schedule.learnerAddress || "Chưa cập nhật"}
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
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherPersonalSchedule;
