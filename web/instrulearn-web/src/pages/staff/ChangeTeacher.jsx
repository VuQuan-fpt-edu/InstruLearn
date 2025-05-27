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
  Modal,
  Form,
  Empty,
  Input,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ChangeTeacher = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [changeTeacherModalVisible, setChangeTeacherModalVisible] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [changeTeacherForm] = Form.useForm();
  const [teachersFromSchedules, setTeachersFromSchedules] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (schedules.length > 0) {
      const uniqueTeachers = [];
      const teacherIds = new Set();

      schedules.forEach((schedule) => {
        if (!teacherIds.has(schedule.teacherId)) {
          teacherIds.add(schedule.teacherId);
          uniqueTeachers.push({
            teacherId: schedule.teacherId,
            fullName: schedule.teacherName,
          });
        }
      });

      setTeachersFromSchedules(uniqueTeachers);
    }
  }, [schedules]);

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

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Teacher/get-all"
      );

      const processedTeachers = [];

      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          if (item.isSucceed && item.data) {
            const teacherData = {
              ...item.data,
              fullName: item.data.fullname,
            };

            if (teacherData.isActive === 1) {
              processedTeachers.push(teacherData);
            }
          }
        });
      }

      setTeachers(processedTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("Không thể tải danh sách giáo viên");
    }
  };

  const handleStudentChange = async (learnerId) => {
    setSchedules([]);
    setSelectedTeacher(null);
    const student = students.find((s) => s.learnerId === learnerId);
    setSelectedStudent(student);

    if (learnerId) {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://instrulearnapplication.azurewebsites.net/api/Schedules/learner/${learnerId}/schedules`
        );

        if (response.data?.isSucceed) {
          const processedSchedules = response.data.data.map((schedule) => ({
            ...schedule,
            formattedTime: `${schedule.timeStart} - ${schedule.timeEnd}`,
            formattedDate: dayjs(schedule.startDay).format("DD/MM/YYYY"),
            formattedDayOfWeek: convertDayToVietnamese(schedule.dayOfWeek),
            isSessionCompleted: schedule.isSessionCompleted || false,
            majorName: schedule.majorName || "N/A",
            timeLearning: schedule.timeLearning || 45,
          }));
          setSchedules(processedSchedules);
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

  const handleTeacherFilterChange = (teacherId) => {
    setSelectedTeacher(teacherId);
  };

  const getFilteredSchedules = () => {
    if (!selectedTeacher) return schedules;
    return schedules.filter(
      (schedule) => schedule.teacherId === selectedTeacher
    );
  };

  const handleChangeTeacher = async (schedule) => {
    setSelectedSchedule(schedule);
    changeTeacherForm.resetFields();
    setChangeTeacherModalVisible(true);

    try {
      setLoading(true);
      const params = {
        majorId: schedule.majorId,
        timeStart: schedule.timeStart,
        timeLearning: schedule.timeLearning,
        startDay: schedule.startDay,
      };

      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Schedules/available-teachers",
        { params }
      );

      if (Array.isArray(response.data)) {
        setAvailableTeachers(response.data);
      } else if (response.data?.isSucceed) {
        setAvailableTeachers(response.data.data);
      } else {
        setAvailableTeachers([]);
      }
    } catch (error) {
      setAvailableTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const submitChangeTeacher = async () => {
    try {
      const values = await changeTeacherForm.validateFields();
      setLoading(true);

      const payload = {
        teacherId: values.teacherId,
        changeReason: values.changeReason,
      };

      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/update-teacher/${selectedSchedule.scheduleId}`,
        payload
      );

      if (response.data && response.data.isSucceed) {
        message.success("Đã thay đổi giáo viên thành công");
        setChangeTeacherModalVisible(false);

        if (selectedStudent) {
          handleStudentChange(selectedStudent.learnerId);
        }
      } else {
        message.error(response.data?.message || "Không thể thay đổi giáo viên");
      }
    } catch (error) {
      console.error("Error changing teacher:", error);
      message.error("Đã xảy ra lỗi khi thay đổi giáo viên");
    } finally {
      setLoading(false);
    }
  };

  const isPastDate = (startDay) => {
    const today = dayjs().startOf("day");
    const classDate = dayjs(startDay).startOf("day");
    return classDate.isBefore(today);
  };

  const getAttendanceStatus = (status, startDay) => {
    const pastDate = isPastDate(startDay);

    const statusMap = {
      0: {
        color: "default",
        text: pastDate ? "Đã quá hạn điểm danh" : "Chưa điểm danh",
        icon: pastDate ? <ClockCircleOutlined /> : <QuestionCircleOutlined />,
      },
      1: { color: "success", text: "Có mặt", icon: <CheckCircleOutlined /> },
      2: { color: "error", text: "Vắng mặt", icon: <CloseCircleOutlined /> },
    };
    return (
      statusMap[status] || {
        color: "default",
        text: "Không xác định",
        icon: <QuestionCircleOutlined />,
      }
    );
  };

  const dateCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const filteredSchedules = getFilteredSchedules();
    const daySchedules = filteredSchedules.filter(
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
      if (allPresent) {
        bgColor = "bg-green-50";
      } else if (allAbsent) {
        bgColor = "bg-red-50";
      } else {
        bgColor = "bg-yellow-50";
      }
    }

    return (
      <div className="h-full">
        <div className={`${bgColor} rounded-lg p-2`}>
          <div className="space-y-1">
            {daySchedules.map((schedule, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium text-gray-800 truncate">
                  {schedule.teacherName}
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

  const filteredSchedules = getFilteredSchedules();
  const hasNoData = selectedStudent && filteredSchedules.length === 0;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="change-teacher"
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
              <Title level={4}>Quản lý đổi giáo viên từng buổi</Title>
              <Space>
                <Select
                  placeholder="Lọc theo giáo viên"
                  style={{ width: 180 }}
                  onChange={handleTeacherFilterChange}
                  value={selectedTeacher}
                  allowClear
                  disabled={!selectedStudent || schedules.length === 0}
                >
                  {teachersFromSchedules.map((teacher) => (
                    <Option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.fullName}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="Chọn học viên"
                  style={{ width: 180 }}
                  onChange={handleStudentChange}
                >
                  {students.map((student) => (
                    <Option key={student.learnerId} value={student.learnerId}>
                      {student.fullName}
                    </Option>
                  ))}
                </Select>
              </Space>
            </div>

            {selectedStudent && (
              <div className="mb-4">
                <div className="text-gray-600">
                  <UserOutlined className="mr-2" />
                  Học viên: {selectedStudent.fullName}
                </div>
              </div>
            )}

            <Card>
              {hasNoData ? (
                <div className="flex justify-center items-center p-8">
                  <Empty
                    description={
                      selectedTeacher
                        ? "Không có lịch học cho giáo viên này"
                        : "Chưa có lịch học"
                    }
                  />
                </div>
              ) : (
                <>
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
                    cellRender={(value) => {
                      const dateStr = value.format("YYYY-MM-DD");
                      const filteredSchedules = getFilteredSchedules();
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
                                    Lịch học ngày {value.format("DD/MM/YYYY")}
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
                                            schedule.attendanceStatus,
                                            schedule.startDay
                                          ).color
                                        }
                                        icon={
                                          getAttendanceStatus(
                                            schedule.attendanceStatus,
                                            schedule.startDay
                                          ).icon
                                        }
                                      >
                                        {
                                          getAttendanceStatus(
                                            schedule.attendanceStatus,
                                            schedule.startDay
                                          ).text
                                        }
                                      </Tag>
                                    </div>

                                    <div className="flex items-center justify-between mb-3 p-2 bg-white rounded border border-gray-100">
                                      <div className="flex items-center gap-3">
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
                                      <div className="flex gap-2">
                                        {!isPastDate(schedule.startDay) && (
                                          <Button
                                            type="primary"
                                            icon={<SwapOutlined />}
                                            size="small"
                                            onClick={() =>
                                              handleChangeTeacher(schedule)
                                            }
                                          >
                                            Đổi giáo viên
                                          </Button>
                                        )}
                                      </div>
                                    </div>

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

                                      {schedule.mode === "OneOnOne" &&
                                        schedule.learnerAddress && (
                                          <div className="flex items-center text-sm text-gray-600">
                                            <EnvironmentOutlined className="mr-2" />
                                            <span>
                                              {schedule.learnerAddress}
                                            </span>
                                          </div>
                                        )}
                                      {schedule.className &&
                                        schedule.className !== "N/A" && (
                                          <div className="flex items-center text-sm text-gray-600">
                                            <EnvironmentOutlined className="mr-2" />
                                            <span>
                                              Lớp: {schedule.className}
                                            </span>
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
                          <div className="h-full cursor-pointer">
                            {dateCellRender(value)}
                          </div>
                        </Popover>
                      );
                    }}
                  />
                </>
              )}
            </Card>
          </Card>

          {/* Modal đổi giáo viên */}
          <Modal
            title="Đổi giáo viên"
            open={changeTeacherModalVisible}
            onOk={submitChangeTeacher}
            onCancel={() => setChangeTeacherModalVisible(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            confirmLoading={loading}
          >
            {selectedSchedule && (
              <div className="mb-4">
                <div className="text-sm mb-2">Thông tin buổi học:</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div>
                    <strong>Buổi học:</strong> {selectedSchedule.sessionTitle}
                  </div>
                  <div>
                    <strong>Ngày:</strong>{" "}
                    {dayjs(selectedSchedule.startDay).format("DD/MM/YYYY")}
                  </div>
                  <div>
                    <strong>Thời gian:</strong> {selectedSchedule.timeStart} -{" "}
                    {selectedSchedule.timeEnd}
                  </div>
                  <div>
                    <strong>Giáo viên hiện tại:</strong>{" "}
                    {selectedSchedule.teacherName}
                  </div>
                </div>
              </div>
            )}
            {selectedSchedule && (
              <div className="mb-2 text-xs text-gray-400 hidden">
                <div>majorId: {selectedSchedule.majorId}</div>
                <div>timeStart: {selectedSchedule.timeStart}</div>
                <div>timeLearning: {selectedSchedule.timeLearning}</div>
                <div>startDay: {selectedSchedule.startDay}</div>
              </div>
            )}
            <Form form={changeTeacherForm} layout="vertical">
              <Form.Item
                name="teacherId"
                label="Chọn giáo viên mới"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
                tooltip="Danh sách giáo viên đã được lọc theo chuyên ngành phù hợp"
              >
                <Select
                  placeholder="Chọn giáo viên"
                  notFoundContent={
                    <div className="text-center py-3">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không tìm thấy giáo viên phù hợp"
                      />
                    </div>
                  }
                  loading={loading}
                >
                  {availableTeachers.map((teacher) => (
                    <Option key={teacher.teacherId} value={teacher.teacherId}>
                      <div className="flex items-center">
                        <span>{teacher.fullname || teacher.fullName}</span>
                        {teacher.majors && teacher.majors.length > 0 && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({teacher.majors.map((m) => m.majorName).join(", ")}
                            )
                          </span>
                        )}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="changeReason"
                label="Lý do thay đổi"
                rules={[
                  { required: true, message: "Vui lòng nhập lý do thay đổi" },
                ]}
              >
                <Input.TextArea
                  placeholder="Nhập lý do thay đổi giáo viên"
                  rows={4}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
      <style jsx global>{`
        .custom-calendar .ant-picker-calendar-date-content {
          height: ${viewMode === "month" ? "80px" : "120px"};
          overflow-y: auto;
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

export default ChangeTeacher;
