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
  PhoneOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Paper, Stack, Chip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ChangeAllTeacher = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [changeAllTeacherModalVisible, setChangeAllTeacherModalVisible] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [changeAllTeacherForm] = Form.useForm();
  const [teachersFromSchedules, setTeachersFromSchedules] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [regisData, setRegisData] = useState(null);
  const [acceptChange, setAcceptChange] = useState(null);

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

  // Lấy learningRegisId từ query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const learningRegisId = params.get("learningRegisId");
    if (learningRegisId) {
      fetchRegisData(learningRegisId);
    }
  }, [location.search]);

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

  // Hàm lấy thông tin đơn
  const fetchRegisData = async (learningRegisId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/GetLearningRegis-ChangeTeacher/${learningRegisId}`
      );
      if (response.data?.isSucceed) {
        setRegisData(response.data.data);
      } else {
        setRegisData(null);
        message.error("Không thể lấy thông tin đơn đổi giáo viên");
      }
    } catch (error) {
      setRegisData(null);
      message.error("Không thể lấy thông tin đơn đổi giáo viên");
    } finally {
      setLoading(false);
    }
  };

  // Hàm đổi giáo viên toàn bộ
  const handleChangeAllTeacher = async () => {
    if (!regisData) return;
    changeAllTeacherForm.resetFields();
    setChangeAllTeacherModalVisible(true);
    try {
      setLoading(true);
      // Lấy sessionDates từ regisData
      const sessionDates = Array.isArray(regisData.sessionDates)
        ? regisData.sessionDates.map((dateStr) => dateStr.split(" ")[0])
        : [];
      const startDayParam = sessionDates.join(",");
      const params = {
        majorId: regisData.majorId,
        timeStart: regisData.timeStart,
        timeLearning: regisData.timeLearning,
        startDay: startDayParam,
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
      message.error("Không thể lấy danh sách giáo viên có sẵn");
    } finally {
      setLoading(false);
    }
  };

  const submitChangeAllTeacher = async () => {
    try {
      const values = await changeAllTeacherForm.validateFields();
      setLoading(true);

      // Lấy notificationId từ API teacher-change-requests
      let notificationId = 0;
      try {
        const res = await axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/StaffNotification/teacher-change-requests"
        );
        if (res.data?.isSucceed && Array.isArray(res.data.data)) {
          const found = res.data.data.find(
            (item) =>
              item.learningRegisId ===
              (regisData.learningRegisId || regisData.LearningRegisId)
          );
          if (found) notificationId = found.notificationId;
        }
      } catch (err) {
        // Nếu không lấy được notificationId thì vẫn để 0
      }

      const payload = {
        notificationId,
        learningRegisId: regisData.learningRegisId || regisData.LearningRegisId,
        newTeacherId: values.teacherId,
        changeReason: values.changeReason,
      };

      const response = await axios.put(
        "https://instrulearnapplication.azurewebsites.net/api/StaffNotification/changeTeacher",
        payload
      );

      if (response.data && response.data.isSucceed) {
        message.success("Đã gửi yêu cầu đổi giáo viên thành công");
        setChangeAllTeacherModalVisible(false);
        if (selectedStudent) {
          handleStudentChange(selectedStudent.learnerId);
        }
      } else {
        message.error(
          response.data?.message || "Không thể gửi yêu cầu đổi giáo viên"
        );
      }
    } catch (error) {
      console.error("Error changing all teacher:", error);
      message.error("Đã xảy ra lỗi khi gửi yêu cầu đổi giáo viên");
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

  if (!regisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Empty description="Không tìm thấy đơn đổi giáo viên" />
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
        selectedMenu="change-all-teacher"
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
          <Box
            minHeight="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box width="100%" maxWidth={700} mx="auto">
              <Box textAlign="center" mb={4}>
                <PersonIcon sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography
                  variant="h4"
                  color="primary"
                  fontWeight={700}
                  mt={2}
                >
                  Đơn yêu cầu đổi giáo viên
                </Typography>
              </Box>
              <Paper
                elevation={3}
                sx={{ borderRadius: 4, p: 4, bgcolor: "#f5faff" }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PersonIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Học viên:
                    </Typography>
                    <Typography>{regisData.fullName}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PhoneIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Số điện thoại:
                    </Typography>
                    <Typography>{regisData.phoneNumber}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <MusicNoteIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Nhạc cụ:
                    </Typography>
                    <Chip
                      label={regisData.majorName}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PersonIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Giáo viên hiện tại:
                    </Typography>
                    <Typography>{regisData.teacherName}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CalendarMonthIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Ngày bắt đầu:
                    </Typography>
                    <Typography>{regisData.startDay}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AccessTimeIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Thời gian học:
                    </Typography>
                    <Typography>
                      {regisData.timeStart} - {regisData.timeEnd}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                      label={`${regisData.numberOfSession} buổi`}
                      color="secondary"
                      variant="outlined"
                    />
                    <Typography fontWeight={600} minWidth={140}>
                      Số buổi:
                    </Typography>
                    <Typography>{regisData.numberOfSession}</Typography>
                  </Stack>
                  {/* <Stack direction="row" alignItems="center" spacing={2}>
                    <SwapHorizIcon color="primary" />
                    <Typography fontWeight={600} minWidth={140}>
                      Lý do đổi giáo viên:
                    </Typography>
                    <Typography color="error" fontWeight={600}>
                      {regisData.teacherChangeReason || "Không có"}
                    </Typography>
                  </Stack> */}
                </Stack>
              </Paper>
              <Box display="flex" justifyContent="flex-end" mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SwapHorizIcon />}
                  style={{
                    borderRadius: 8,
                    padding: "0 32px",
                    fontWeight: 600,
                  }}
                  onClick={handleChangeAllTeacher}
                >
                  Đổi giáo viên toàn bộ
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Modal đổi giáo viên toàn bộ */}
          <Modal
            title={
              <div className="flex items-center gap-2 text-blue-700">
                <SwapOutlined /> Đổi giáo viên toàn bộ
              </div>
            }
            open={changeAllTeacherModalVisible}
            onOk={submitChangeAllTeacher}
            onCancel={() => setChangeAllTeacherModalVisible(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            confirmLoading={loading}
            className="custom-modal-change-teacher"
          >
            <Form form={changeAllTeacherForm} layout="vertical">
              <Form.Item
                label={<span className="font-semibold">Lựa chọn xử lý</span>}
                name="acceptChange"
                rules={[
                  { required: true, message: "Vui lòng chọn phương án xử lý" },
                ]}
                className="mb-4"
              >
                <Radio.Group
                  onChange={(e) => {
                    setAcceptChange(e.target.value);
                    if (e.target.value === "reject" && regisData) {
                      changeAllTeacherForm.setFieldsValue({
                        teacherId: regisData.teacherId,
                      });
                    }
                    if (e.target.value === "accept") {
                      changeAllTeacherForm.setFieldsValue({
                        teacherId: undefined,
                      });
                    }
                  }}
                  value={acceptChange}
                  className="flex gap-6"
                >
                  <Radio value="accept">Chấp nhận đổi giáo viên</Radio>
                  <Radio value="reject">Từ chối đổi giáo viên</Radio>
                </Radio.Group>
              </Form.Item>
              {acceptChange === "accept" && (
                <Form.Item
                  name="teacherId"
                  label={
                    <span className="font-semibold">Chọn giáo viên mới</span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn giáo viên" },
                  ]}
                  tooltip="Danh sách giáo viên đã được lọc theo chuyên ngành phù hợp"
                  className="mb-4"
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
                    className="rounded-lg"
                  >
                    {availableTeachers.map((teacher) => (
                      <Option key={teacher.teacherId} value={teacher.teacherId}>
                        <div className="flex items-center">
                          <span>{teacher.fullname || teacher.fullName}</span>
                          {teacher.majors && teacher.majors.length > 0 && (
                            <span className="ml-2 text-xs text-gray-400">
                              (
                              {teacher.majors
                                .map((m) => m.majorName)
                                .join(", ")}
                              )
                            </span>
                          )}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {acceptChange === "reject" && regisData && (
                <Form.Item
                  name="teacherId"
                  label={
                    <span className="font-semibold">Giáo viên hiện tại</span>
                  }
                  initialValue={regisData.teacherId}
                  rules={[
                    { required: true, message: "Vui lòng chọn giáo viên" },
                  ]}
                  className="mb-4"
                >
                  <Select disabled className="rounded-lg">
                    <Option value={regisData.teacherId}>
                      {regisData.teacherName}
                    </Option>
                  </Select>
                </Form.Item>
              )}
              <Form.Item
                name="changeReason"
                label={<span className="font-semibold">Lý do </span>}
                rules={[
                  { required: true, message: "Vui lòng nhập lý do thay đổi" },
                ]}
                className="mb-2"
              >
                <Input.TextArea
                  placeholder="Nhập lý do thay đổi giáo viên"
                  rows={4}
                  className="rounded-lg"
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
        .custom-modal-change-teacher .ant-modal-content {
          border-radius: 16px;
          padding: 32px 24px;
        }
        .custom-modal-change-teacher .ant-modal-header {
          border-radius: 16px 16px 0 0;
          background: #e6f7ff;
        }
        .custom-modal-change-teacher .ant-modal-title {
          color: #1890ff;
          font-weight: 600;
          font-size: 20px;
        }
        .custom-modal-change-teacher .ant-form-item {
          margin-bottom: 20px;
        }
      `}</style>
    </Layout>
  );
};

export default ChangeAllTeacher;
