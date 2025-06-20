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
  Badge,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const StudentCenterSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Learner/get-all"
      );
      if (response.data?.isSucceed) {
        const activeStudents = response.data.data.filter(
          (student) => student.isActive === 1
        );
        setStudents(activeStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Không thể tải danh sách học viên");
    }
  };

  const handleStudentChange = async (learnerId) => {
    setSchedules([]);
    const student = students.find((s) => s.learnerId === learnerId);
    setSelectedStudent(student);

    if (learnerId) {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://instrulearnapplication.azurewebsites.net/api/Schedules/learner/${learnerId}/class`
        );

        if (response.data?.isSucceed) {
          setSchedules(response.data.data);
        } else {
          setSchedules([]);
          message.error("Không thể tải lịch học của học viên");
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        message.error("Không thể tải lịch học của học viên");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSchedules([]);
    }
  };

  const getAttendanceStatusTag = (status) => {
    const statusMap = {
      0: { color: "default", text: "Chưa điểm danh" },
      1: { color: "success", text: "Có mặt" },
      2: { color: "error", text: "Vắng mặt" },
      3: { color: "warning", text: "Có phép" },
    };
    const statusInfo = statusMap[status] || statusMap[0];
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
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
        selectedMenu="personal-teaching"
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
              <Title level={4}>Quản lý lịch học học viên tại trung tâm</Title>
              <Select
                placeholder="Chọn học viên"
                style={{ width: 200 }}
                onChange={handleStudentChange}
              >
                {students.map((student) => (
                  <Option key={student.learnerId} value={student.learnerId}>
                    {student.fullName}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedStudent && (
              <div className="mb-4 space-y-2">
                <div className="text-gray-600">
                  <UserOutlined className="mr-2" />
                  Học viên: {selectedStudent.fullName}
                </div>
                <div className="text-gray-600">
                  <HomeOutlined className="mr-2" />
                  Địa chỉ: {selectedStudent.address}
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
                            Lịch học ngày {date.format("DD/MM/YYYY")}
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
                                    Giáo viên: {schedule.teacherName}
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
                                  {schedule.className}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
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
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentCenterSchedule;
