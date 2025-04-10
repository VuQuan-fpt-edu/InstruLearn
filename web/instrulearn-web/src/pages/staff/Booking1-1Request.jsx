import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Input,
  Space,
  Typography,
  Card,
  Tag,
  Tooltip,
  Spin,
  Badge,
  Modal,
  Select,
  DatePicker,
  Divider,
  Image,
  Form,
  Calendar,
  Radio,
  Popover,
  Avatar,
  Progress,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Fake data generator
const generateFakeBookings = () => {
  const instruments = [
    "Guitar",
    "Piano",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
  ];
  const teachers = [
    { id: 1, name: "Nguyễn Văn An", specialty: "Guitar" },
    { id: 2, name: "Trần Thị Bình", specialty: "Piano" },
    { id: 3, name: "Lê Minh Cường", specialty: "Violin" },
    { id: 4, name: "Phạm Hoàng Dương", specialty: "Drums" },
    { id: 5, name: "Hoàng Thị Emilia", specialty: "Flute" },
  ];
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  const slots = ["8:00 ", "10:00 ", "13:00 ", "15:00 ", "17:00 ", "19:00 "];
  const levels = [
    "Chưa biết gì",
    "1-3 tháng",
    "3-6 tháng",
    "1 năm",
    "Hơn 1 năm",
  ];
  const statuses = ["pending", "accepted", "rejected"];

  // Create one detailed example as requested
  const detailedExample = {
    bookingId: "BK1001",
    studentName: "Đỗ Minh Hiếu",
    studentEmail: "hieu.do@example.com",
    phoneNumber: "0912345678",
    instrument: "Piano",
    teacherId: 2,
    teacherName: "Trần Thị Bình",
    bookingDay: "Thứ 3",
    bookingSlot: "15:00 ",
    numberOfSlots: 12,
    proficiencyLevel: "1-3 tháng",
    learningRequirements:
      "Muốn học các bản nhạc cổ điển và luyện kỹ thuật chơi piano cơ bản",
    bookingDate: dayjs().add(2, "day").format(),
    status: "pending",
    videoUploadUrl: "https://example.com/uploads/hieu_piano_sample.mp4",
    courseName: "Khóa học Piano cá nhân",
    notes: "Học viên đã có kinh nghiệm 1 tháng tự học tại nhà",
    createdAt: dayjs().subtract(1, "day").format(),
  };

  // Generate 15 more random bookings
  const randomBookings = Array.from({ length: 15 }, (_, i) => {
    const teacherIndex = Math.floor(Math.random() * teachers.length);
    const selectedTeacher = teachers[teacherIndex];
    const level = levels[Math.floor(Math.random() * levels.length)];

    return {
      bookingId: `BK${1002 + i}`,
      studentName: `Học viên ${i + 1}`,
      studentEmail: `student${i + 1}@example.com`,
      phoneNumber: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      instrument: instruments[Math.floor(Math.random() * instruments.length)],
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      bookingDay: days[Math.floor(Math.random() * days.length)],
      bookingSlot: slots[Math.floor(Math.random() * slots.length)],
      numberOfSlots: Math.floor(Math.random() * 24) + 1,
      proficiencyLevel: level,
      learningRequirements: `Yêu cầu học ${Math.floor(Math.random() * 3) + 1}`,
      bookingDate: dayjs()
        .add(Math.floor(Math.random() * 14), "day")
        .format(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      videoUploadUrl:
        level !== "Chưa biết gì"
          ? `https://example.com/uploads/video_${i + 1}.mp4`
          : null,
      courseName: `Khóa học ${
        instruments[Math.floor(Math.random() * instruments.length)]
      } cá nhân`,
      notes: Math.random() > 0.5 ? `Ghi chú cho học viên ${i + 1}` : null,
      createdAt: dayjs()
        .subtract(Math.floor(Math.random() * 10), "day")
        .format(),
    };
  });

  return [detailedExample, ...randomBookings];
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

const convertInstrumentToVietnamese = (instrument) => {
  const instrumentMap = {
    Guitar: "Guitar",
    Piano: "Piano",
    Violin: "Violin",
    Drums: "Trống",
    Flute: "Sáo",
    Saxophone: "Kèn Saxophone",
  };
  return instrumentMap[instrument] || instrument;
};

const convertBookingDataToVietnamese = (booking) => {
  return {
    ...booking,
    majorName: convertInstrumentToVietnamese(booking.majorName),
    learningDays: booking.learningDays.map((day) =>
      convertDayToVietnamese(day)
    ),
  };
};

const Booking11Management = () => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("booking-management");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [instrumentFilter, setInstrumentFilter] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [responses, setResponses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedResponseType, setSelectedResponseType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileURL, setFileURL] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchResponses();
    fetchLevels();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Response/get-all"
      );
      console.log("Response data:", response.data);
      if (Array.isArray(response.data)) {
        const responseList = response.data.map((item) => item.data);
        setResponses(responseList);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      message.error("Không thể tải danh sách phản hồi");
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LevelAssigned/get-all"
      );
      console.log("Levels data:", response.data);
      if (Array.isArray(response.data)) {
        const levelList = response.data.map((item) => item.data);
        setLevels(levelList);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
      message.error("Không thể tải danh sách cấp độ");
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LearningRegis/get-all"
      );
      if (response.data?.isSucceed) {
        const bookings = response.data.data.map((booking) => ({
          ...booking,
          learningDays: booking.learningDays.map((day) =>
            convertDayToVietnamese(day)
          ),
        }));
        setBookings(bookings);
      } else {
        throw new Error(
          response.data?.message || "Không thể tải danh sách yêu cầu"
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Không thể tải danh sách yêu cầu đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking) => {
    try {
      await form.validateFields();
      setLoading(true);
      const values = form.getFieldsValue();

      if (!values.levelId) {
        message.error("Vui lòng chọn cấp độ trước khi cập nhật");
        return;
      }

      let learningPathUrl = "";
      if (file) {
        try {
          learningPathUrl = await uploadFileToFirebase();
          if (!learningPathUrl) {
            message.error("Không thể tải file lên");
            return;
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          message.error("Lỗi khi tải file lên Firebase");
          return;
        }
      }

      const updateData = {
        learningRegisId: booking.learningRegisId,
        teacherId: values.teacherId,
        levelId: values.levelId,
        responseId: values.responseId,
        learningPath: learningPathUrl || "string",
      };

      const response = await axios.put(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LearningRegis/update-status",
        updateData
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật trạng thái thành công");
        setStatusModalVisible(false);
        fetchBookings();

        // Reset file state
        setFile(null);
        setFileType("");
        setFileURL("");
        setUploadProgress(0);
      } else {
        throw new Error(response.data?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi cập nhật trạng thái");
        console.error("Error updating status:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAvailableTeachers = async (booking) => {
    try {
      // Đảm bảo giáo viên hiện tại là giá trị mặc định
      if (booking.teacherId && booking.teacherName) {
        const currentTeacher = {
          teacherId: booking.teacherId,
          fullname: booking.teacherName,
        };

        // Đặt giáo viên hiện tại làm giá trị mặc định cho danh sách
        setFilteredTeachers([currentTeacher]);
        setSelectedTeacher(booking.teacherId);

        // Fetch lịch của giáo viên hiện tại
        fetchTeacherSchedule(booking.teacherId);
      }

      // Sau đó mới kiểm tra các giáo viên có lịch trống
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/available-teachers",
        {
          params: {
            majorId: booking.majorId,
            timeStart: booking.timeStart,
            timeLearning: booking.timeLearning,
            startDay: booking.startDay,
          },
        }
      );
      console.log("Available teachers:", response.data);
      if (Array.isArray(response.data)) {
        setAvailableTeachers(response.data);

        // Thêm giáo viên có lịch trống vào danh sách, nhưng loại bỏ giáo viên hiện tại nếu đã có
        const availableTeachersWithoutCurrent = response.data.filter(
          (teacher) => teacher.teacherId !== booking.teacherId
        );

        setFilteredTeachers((prevTeachers) => [
          ...prevTeachers,
          ...availableTeachersWithoutCurrent,
        ]);
      }
    } catch (error) {
      console.error("Error checking available teachers:", error);
      message.error("Không thể kiểm tra giáo viên có lịch trống");
    }
  };

  const showStatusModal = async (record) => {
    console.log("Selected booking:", record);
    setSelectedBooking(record);

    // Set default values for the form TRƯỚC KHI kiểm tra giáo viên có lịch trống
    form.setFieldsValue({
      teacherId: record.teacherId,
      responseId: record.responseId,
      // Không đặt giá trị mặc định cho levelId để người dùng bắt buộc phải chọn
    });

    // Kiểm tra giáo viên có lịch trống
    await checkAvailableTeachers(record);

    setStatusModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedBooking(record);
    setViewModalVisible(true);
  };

  const handleViewVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoModalVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ xác nhận
          </Tag>
        );
      case "Accepted":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã chấp nhận
          </Tag>
        );
      case "Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      case "Completed":
        return (
          <Tag icon={<CheckCircleOutlined />} color="processing">
            Đã thanh toán
          </Tag>
        );
      case "Fourty":
        return (
          <Tag icon={<CheckCircleOutlined />} color="processing">
            Đã thanh toán 40%
          </Tag>
        );
      case "Sixty":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã thanh toán đầy đủ
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const applyFilters = () => {
    const values = form.getFieldsValue();
    setInstrumentFilter(values.instrument);
    setStatusFilter(values.status);
    setDateRange(values.dateRange);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setInstrumentFilter(null);
    setStatusFilter(null);
    setDateRange(null);
    form.resetFields();
  };

  const getResponsesByType = (responseTypeId) => {
    if (!responseTypeId || !responses) return [];
    return responses.filter((response) =>
      response.responseTypes.some(
        (type) => type.responseTypeId === parseInt(responseTypeId)
      )
    );
  };

  const handleResponseTypeChange = (value) => {
    setSelectedResponseType(value);
    // Reset response selection when type changes
    form.setFieldsValue({ responseId: undefined });
  };

  const getResponseTypes = () => {
    const types = new Set();
    responses.forEach((response) => {
      response.responseTypes.forEach((type) => {
        types.add(
          JSON.stringify({
            responseTypeId: type.responseTypeId,
            responseName: type.responseTypeName,
          })
        );
      });
    });
    return Array.from(types).map((type) => JSON.parse(type));
  };

  const getSelectedResponseContent = () => {
    if (!selectedResponseType || !responses) return null;
    const selectedResponse = responses.find((response) =>
      response.responseTypes.some(
        (type) => type.responseTypeId === parseInt(selectedResponseType)
      )
    );
    return selectedResponse?.responseDescription;
  };

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
    const selectedLevelData = levels.find(
      (level) => level.levelAssignedId === value
    );
    if (selectedLevelData) {
      form.setFieldsValue({ levelId: selectedLevelData.levelAssignedId });
    }
  };

  const getSelectedLevelContent = () => {
    if (!selectedLevel || !levels) return null;
    const selectedLevelData = levels.find(
      (level) => level.levelAssignedId === selectedLevel
    );
    if (!selectedLevelData) return null;

    return (
      <div className="space-y-2">
        <div className="font-medium">{selectedLevelData.levelName}</div>
        <div className="text-gray-600">
          Học phí: {selectedLevelData.levelPrice.toLocaleString("vi-VN")} VNĐ
        </div>
      </div>
    );
  };

  const fetchTeacherSchedule = async (teacherId) => {
    try {
      setScheduleLoading(true);
      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/register`
      );
      console.log("Teacher schedule:", response.data);
      if (response.data?.isSucceed && Array.isArray(response.data.data)) {
        setTeacherSchedule(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teacher schedule:", error);
      message.error("Không thể tải lịch dạy của giáo viên");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleTeacherChange = (value) => {
    console.log("Giáo viên được chọn:", value);
    setSelectedTeacher(value);
    form.setFieldsValue({ teacherId: value });
    // Lấy lịch của giáo viên mới ngay khi thay đổi
    fetchTeacherSchedule(value);
  };

  const handleViewSchedule = () => {
    // Lấy giá trị teacherId hiện tại từ form
    const currentTeacherId = form.getFieldValue("teacherId");
    console.log("Xem lịch của giáo viên:", currentTeacherId);

    // Đảm bảo sử dụng teacherId hiện tại
    if (currentTeacherId) {
      // Reset lịch cũ trước khi tải lịch mới
      setTeacherSchedule([]);
      // Đảm bảo gửi request API mới
      setSelectedTeacher(currentTeacherId);
      fetchTeacherSchedule(currentTeacherId);
      setCalendarModalVisible(true);
    } else {
      message.warning("Vui lòng chọn giáo viên trước khi xem lịch");
    }
  };

  const dateCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const daySchedules = teacherSchedule.filter(
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
    const hasSchedules = teacherSchedule.some(
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

  const getCalendarEvents = (schedules) => {
    return schedules.map((schedule) => ({
      id: schedule.scheduleId,
      title: `${schedule.learnerName} - ${
        schedule.mode === "OneOnOne" ? "1-1" : "Lớp học"
      }`,
      start: dayjs(`${schedule.startDay} ${schedule.timeStart}`).toDate(),
      end: dayjs(`${schedule.startDay} ${schedule.timeEnd}`).toDate(),
      color: schedule.mode === "OneOnOne" ? "#1890ff" : "#52c41a",
    }));
  };

  // Thêm useEffect để cập nhật lịch khi selectedTeacher thay đổi
  useEffect(() => {
    if (selectedTeacher) {
      fetchTeacherSchedule(selectedTeacher);
    }
  }, [selectedTeacher]);

  useEffect(() => {
    if (teacherSchedule.length > 0) {
      setCalendarEvents(getCalendarEvents(teacherSchedule));
    }
  }, [teacherSchedule]);

  const filteredBookings = bookings
    .filter((booking) => {
      // Lọc theo text tìm kiếm
      const searchMatches =
        booking.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.teacherName?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.majorName?.toLowerCase().includes(searchText.toLowerCase()) ||
        false;

      // Lọc theo nhạc cụ
      const instrumentMatches =
        !instrumentFilter || booking.majorName === instrumentFilter;

      // Lọc theo trạng thái
      const statusMatches = !statusFilter || booking.status === statusFilter;

      // Lọc theo khoảng thời gian
      const dateMatches =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (dayjs(booking.requestDate).isAfter(dateRange[0], "day") &&
          dayjs(booking.requestDate).isBefore(dateRange[1], "day"));

      return searchMatches && instrumentMatches && statusMatches && dateMatches;
    })
    .sort(
      (a, b) => dayjs(b.requestDate).valueOf() - dayjs(a.requestDate).valueOf()
    ); // Sắp xếp theo thời gian mới nhất

  const columns = [
    {
      title: "Học viên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="font-medium">{text}</span>,
      width: 180,
    },
    {
      title: "Nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 120,
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 180,
    },
    {
      title: "Thời gian học",
      key: "schedule",
      render: (_, record) => <span>{record.timeLearning} phút</span>,
      width: 100,
    },
    {
      title: "Số buổi",
      dataIndex: "numberOfSession",
      key: "numberOfSession",
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ xác nhận", value: "Pending" },
        { text: "Đã chấp nhận", value: "Accepted" },
        { text: "Từ chối", value: "Rejected" },
        { text: "Đã thanh toán", value: "Completed" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 150,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status === "Pending" && (
            <Tooltip title="Cập nhật trạng thái">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => showStatusModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 120,
    },
  ];

  const instruments = [
    "Guitar",
    "Piano",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
  ];

  const handleResponseChange = (value) => {
    const selected = responses.find(
      (response) => response.responseId === value
    );
    setSelectedResponse(selected);
    form.setFieldsValue({ responseId: value });
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size (maximum 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 10MB");
        return;
      }

      setFile(selectedFile);
      setFileURL("");
      setFileType(selectedFile.type);
    }
  };

  const uploadFileToFirebase = async () => {
    if (!file) {
      message.error("Vui lòng chọn file trước khi tải lên");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    return new Promise((resolve, reject) => {
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `learning_paths/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progressPercent);
        },
        (error) => {
          console.error("Upload error:", error);
          setIsUploading(false);
          message.error(`Lỗi tải lên: ${error.message}`);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFileURL(downloadURL);
            setIsUploading(false);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
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
              <Title level={4}>Quản lý đơn học 1-1</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm theo tên học viên, giáo viên..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
                <Tooltip title="Bộ lọc nâng cao">
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterModalVisible(true)}
                  />
                </Tooltip>
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchBookings} />
                </Tooltip>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="bookingId"
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} đơn đăng ký`,
                  defaultPageSize: 20,
                }}
                size="middle"
              />
            </Spin>
          </Card>
        </Content>
      </Layout>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết yêu cầu đặt lịch"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          selectedBooking?.status === "Pending" && (
            <Button
              key="update"
              type="primary"
              onClick={() => {
                setViewModalVisible(false);
                showStatusModal(selectedBooking);
              }}
            >
              Cập nhật trạng thái
            </Button>
          ),
        ]}
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Phần trạng thái */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Trạng thái:</span>
                {getStatusTag(selectedBooking.status)}
              </div>
              <div className="text-gray-500">
                {dayjs(selectedBooking.requestDate).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>

            {/* Thông tin học viên */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-4">
                <UserOutlined className="text-blue-500" />
                <h3 className="text-lg font-semibold">Thông tin học viên</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Họ và tên</p>
                  <p className="font-medium">{selectedBooking.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{selectedBooking.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Thông tin đăng ký học */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-4">
                <BookOutlined className="text-blue-500" />
                <h3 className="text-lg font-semibold">Thông tin đăng ký học</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Loại đăng ký</p>
                  <p className="font-medium">{selectedBooking.regisTypeName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nhạc cụ</p>
                  <p className="font-medium">{selectedBooking.majorName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Giáo viên</p>
                  <p className="font-medium">{selectedBooking.teacherName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cấp độ</p>
                  <p className="font-medium">
                    {selectedBooking.levelName || "Chưa xác định"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Học phí</p>
                  <p className="font-medium text-blue-600">
                    {selectedBooking.price?.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Số buổi học</p>
                  <p className="font-medium">
                    {selectedBooking.numberOfSession} buổi
                  </p>
                </div>
              </div>

              {selectedBooking.learningRequest && (
                <div className="mt-4">
                  <p className="text-gray-500">Yêu cầu học</p>
                  <p className="font-medium">
                    {selectedBooking.learningRequest}
                  </p>
                </div>
              )}

              {selectedBooking.videoUrl &&
                selectedBooking.videoUrl !== "string" && (
                  <div className="mt-4">
                    <p className="text-gray-500 mb-2">Video đã tải lên</p>
                    <div className="w-full aspect-video rounded-lg overflow-hidden">
                      <video
                        src={selectedBooking.videoUrl}
                        controls
                        className="w-full h-full"
                        controlsList="nodownload"
                        playsInline
                        preload="auto"
                        style={{ maxHeight: "50vh" }}
                      >
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    </div>
                  </div>
                )}

              {selectedBooking.learningPath && (
                <div className="mt-4">
                  <p className="text-gray-500 mb-2">Lộ trình học</p>
                  <a
                    href={selectedBooking.learningPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <PaperClipOutlined /> Xem lộ trình học
                  </a>
                </div>
              )}
            </div>

            {/* Lịch học */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarOutlined className="text-blue-500" />
                <h3 className="text-lg font-semibold">Lịch học</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Thời gian học</p>
                  <p className="font-medium">
                    {selectedBooking.timeStart?.substring(0, 5)} -{" "}
                    {selectedBooking.timeEnd?.substring(0, 5)} (
                    {selectedBooking.timeLearning} phút)
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày bắt đầu</p>
                  <p className="font-medium">
                    {dayjs(selectedBooking.startDay).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>

              {selectedBooking.learningDays &&
                selectedBooking.learningDays.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 mb-2">Ngày học trong tuần</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedBooking.learningDays.map((day, index) => (
                        <Tag key={index} color="blue">
                          {convertDayToVietnamese(day)}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Thông tin phản hồi */}
            {selectedBooking.responseDescription && (
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-2 mb-4">
                  <InfoCircleOutlined className="text-blue-500" />
                  <h3 className="text-lg font-semibold">Thông tin phản hồi</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500">Loại phản hồi</p>
                    <p className="font-medium">
                      {selectedBooking.responseTypeName}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Nội dung phản hồi</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedBooking.responseDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal xem video */}
      <Modal
        title="Xem video trình độ"
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVideoModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedVideo && (
          <div className="flex justify-center">
            <div className="w-full aspect-video">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                controlsList="nodownload"
                playsInline
                preload="auto"
                style={{ maxHeight: "70vh" }}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal bộ lọc nâng cao */}
      <Modal
        title="Bộ lọc nâng cao"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={[
          <Button key="reset" onClick={resetFilters}>
            Xóa bộ lọc
          </Button>,
          <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="apply" type="primary" onClick={applyFilters}>
            Áp dụng
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="instrument" label="Nhạc cụ">
            <Select
              placeholder="Chọn nhạc cụ"
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Guitar">Guitar</Option>
              <Option value="Piano">Piano</Option>
              <Option value="Violin">Violin</Option>
              <Option value="Drums">Trống</Option>
              <Option value="Flute">Sáo</Option>
              <Option value="Saxophone">Kèn Saxophone</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select
              placeholder="Chọn trạng thái"
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Pending">Chờ xác nhận</Option>
              <Option value="Accepted">Đã chấp nhận</Option>
              <Option value="Rejected">Từ chối</Option>
              <Option value="Completed">Đã thanh toán</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Khoảng thời gian">
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái đăng ký"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={() => handleStatusChange(selectedBooking)}
        confirmLoading={loading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="teacherId"
            label="Giáo viên"
            rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
          >
            <Space>
              <Select
                placeholder="Chọn giáo viên"
                onChange={handleTeacherChange}
                style={{ width: 300 }}
                optionLabelProp="label"
                defaultValue={selectedBooking?.teacherId}
              >
                {selectedBooking && selectedBooking.teacherId && (
                  <Option
                    key={selectedBooking.teacherId}
                    value={selectedBooking.teacherId}
                    label={`${
                      selectedBooking.teacherName || ""
                    } (Giáo viên hiện tại)`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{selectedBooking.teacherName}</span>
                      <Tag color="green">Giáo viên hiện tại</Tag>
                    </div>
                  </Option>
                )}
                {filteredTeachers && filteredTeachers.length > 0
                  ? filteredTeachers
                      .filter(
                        (teacher) =>
                          teacher.teacherId !== selectedBooking?.teacherId
                      )
                      .map((teacher) => (
                        <Option
                          key={teacher.teacherId}
                          value={teacher.teacherId}
                          label={teacher.fullname}
                        >
                          <div className="flex justify-between items-center">
                            <span>{teacher.fullname}</span>
                            <Tag color="blue">Có lịch trống</Tag>
                          </div>
                        </Option>
                      ))
                  : filteredTeachers.length === 0 &&
                    selectedBooking?.teacherId === undefined && (
                      <Option disabled>
                        Không có giáo viên có lịch trống phù hợp
                      </Option>
                    )}
              </Select>
              {selectedTeacher && (
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={handleViewSchedule}
                >
                  Xem lịch
                </Button>
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name="responseTypeId"
            label="Loại phản hồi"
            rules={[{ required: true, message: "Vui lòng chọn loại phản hồi" }]}
          >
            <Select
              placeholder="Chọn loại phản hồi"
              onChange={handleResponseTypeChange}
              className="w-full"
            >
              {getResponseTypes().map((type) => (
                <Option key={type.responseTypeId} value={type.responseTypeId}>
                  {type.responseName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedResponseType && (
            <>
              <Form.Item
                name="responseId"
                label="Nội dung phản hồi"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nội dung phản hồi",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn nội dung phản hồi"
                  onChange={handleResponseChange}
                  className="w-full"
                  optionLabelProp="label"
                >
                  {getResponsesByType(selectedResponseType).map((response) => (
                    <Option
                      key={response.responseId}
                      value={response.responseId}
                      label={`Phản hồi #${response.responseId}`}
                    >
                      <div className="flex items-center py-1">
                        <FileTextOutlined className="mr-2 text-blue-500" />
                        <div className="truncate max-w-[400px]">
                          {response.responseDescription}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedResponse && (
                <div className="mb-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2">
                      <FileTextOutlined className="text-blue-500 mr-2" />
                      <span className="font-medium text-blue-900">
                        Chi tiết nội dung phản hồi
                      </span>
                    </div>
                    <div className="text-blue-800 whitespace-pre-wrap">
                      {selectedResponse.responseDescription}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <Form.Item
            name="levelId"
            label="Cấp độ"
            rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
          >
            <Select placeholder="Chọn cấp độ" onChange={handleLevelChange}>
              {levels && levels.length > 0 ? (
                levels
                  .filter((level) => level.majorId === selectedBooking?.majorId)
                  .map((level) => (
                    <Option
                      key={level.levelAssignedId}
                      value={level.levelAssignedId}
                    >
                      {level.levelName}
                    </Option>
                  ))
              ) : (
                <Option disabled>Không có cấp độ phù hợp</Option>
              )}
            </Select>
          </Form.Item>

          {selectedLevel && (
            <Form.Item name="levelDetails" label="Chi tiết cấp độ">
              <div className="p-3 bg-gray-50 rounded border">
                {getSelectedLevelContent()}
              </div>
            </Form.Item>
          )}

          <Form.Item label="Tải lên lộ trình học">
            <input
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm border border-gray-300 rounded p-2"
            />
            {file && (
              <div className="mt-4 p-4 border rounded">
                <div className="flex items-center mb-2">
                  <PaperClipOutlined />
                  <span className="ml-2 font-medium">{file.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {isUploading && (
                  <Progress
                    percent={uploadProgress}
                    size="small"
                    className="mt-2"
                  />
                )}
                {fileURL && (
                  <div className="mt-2 text-green-600 text-sm">
                    Tệp đã được tải lên thành công!
                  </div>
                )}
              </div>
            )}
            {!fileURL && file && (
              <Button
                type="primary"
                onClick={uploadFileToFirebase}
                disabled={!file || isUploading}
                loading={isUploading}
                icon={<UploadOutlined />}
                className="mt-2"
              >
                Tải lên Firebase
              </Button>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Calendar */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>Lịch dạy của giáo viên</span>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <Radio.Button value="month">Tháng</Radio.Button>
              <Radio.Button value="week">Tuần</Radio.Button>
            </Radio.Group>
          </div>
        }
        open={calendarModalVisible}
        onCancel={() => setCalendarModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setCalendarModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Spin spinning={scheduleLoading}>
          <Calendar
            mode={viewMode}
            fullscreen={false}
            className="custom-calendar"
            cellRender={(date) => {
              const dateStr = date.format("YYYY-MM-DD");
              const daySchedules = teacherSchedule.filter(
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
                                {schedule.learnerName || "Chưa có học viên"}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <ClockCircleOutlined className="mr-1" />
                              {schedule.timeStart} - {schedule.timeEnd}
                            </div>
                            <div className="text-sm text-gray-600">
                              <Tag color="blue">
                                {schedule.mode === "OneOnOne"
                                  ? "1-1"
                                  : "Lớp học"}
                              </Tag>
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
        </Spin>
      </Modal>
    </Layout>
  );
};

export default Booking11Management;
