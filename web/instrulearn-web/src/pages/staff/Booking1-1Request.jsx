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
  Switch,
  Empty,
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
  FileOutlined,
  DownloadOutlined,
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
    learningDays: Array.isArray(booking.learningDays)
      ? booking.learningDays.map((day) => convertDayToVietnamese(day))
      : [],
  };
};

const Booking11Management = () => {
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("booking-management");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
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
  const [learningPathSessions, setLearningPathSessions] = useState([]);
  const [loadingPathSessions, setLoadingPathSessions] = useState(false);
  const [allowedResponseTypes, setAllowedResponseTypes] = useState([]);
  const [allowedRejectResponseTypes, setAllowedRejectResponseTypes] = useState(
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchResponses();
    fetchLevels();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Response/get-all"
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
        "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/get-all"
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
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/get-all"
      );
      console.log("API response:", response.data);
      if (response.data?.isSucceed && Array.isArray(response.data.data)) {
        const bookings = response.data.data.map((item) => ({
          learningRegisId: item.LearningRegisId,
          learnerId: item.LearnerId,
          fullName: item.FullName,
          phoneNumber: item.PhoneNumber,
          teacherId: item.TeacherId,
          teacherName: item.TeacherName,
          regisTypeId: item.RegisTypeId,
          regisTypeName: item.RegisTypeName,
          majorId: item.MajorId,
          majorName: item.MajorName,
          responseTypeId: item.ResponseTypeId,
          responseTypeName: item.ResponseTypeName,
          responseId: item.ResponseId,
          responseDescription: item.ResponseDescription,
          levelId: item.LevelId,
          levelName: item.LevelName,
          levelPrice: item.LevelPrice,
          syllabusLink: item.SyllabusLink,
          startDay: item.StartDay,
          timeStart: item.TimeStart,
          timeLearning: item.TimeLearning,
          timeEnd: item.TimeEnd,
          requestDate: item.RequestDate,
          numberOfSession: item.NumberOfSession,
          selfAssessment: item.Description,
          videoUrl: item.VideoUrl,
          learningRequest: item.LearningRequest,
          learningDays: Array.isArray(item.LearningDays)
            ? item.LearningDays.map((day) => convertDayToVietnamese(day))
            : [],
          price: item.Price,
          remainingAmount: item.RemainingAmount,
          status: item.Status,
          acceptedDate: item.AcceptedDate,
          paymentDeadline: item.PaymentDeadline,
          daysRemaining: item.DaysRemaining,
          paymentStatus: item.PaymentStatus,
          firstPaymentPeriod: item.firstPaymentPeriod,
          secondPaymentPeriod: item.secondPaymentPeriod,
          sessionDates: item.SessionDates || [],
        }));
        console.log("Mapped bookings:", bookings);
        setBookings(bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      setBookings([]);
      console.error("Error fetching bookings:", error);
      message.error("Không thể tải danh sách yêu cầu đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking) => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!values.levelId) {
        message.error("Vui lòng chọn cấp độ trước khi cập nhật");
        return;
      }

      const updateData = {
        learningRegisId: booking.learningRegisId,
        teacherId: values.teacherId || booking.teacherId,
        levelId: values.levelId,
        responseId: values.responseId,
      };

      console.log("Update data:", updateData);

      const response = await axios.put(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/update-status",
        updateData
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật trạng thái thành công");
        setStatusModalVisible(false);
        form.resetFields();
        setSelectedBooking(null);
        fetchBookings();
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
        setFilteredTeachers([currentTeacher]);
        setSelectedTeacher(booking.teacherId);
        fetchTeacherSchedule(booking.teacherId);
      }
      // Lấy danh sách ngày từ SessionDates, chỉ lấy phần ngày
      const sessionDays = (booking.sessionDates || []).map(
        (s) => s.split(" ")[0]
      );
      const startDayParam = sessionDays.join(",");
      // Sau đó mới kiểm tra các giáo viên có lịch trống
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Schedules/available-teachers",
        {
          params: {
            majorId: booking.majorId,
            timeStart: booking.timeStart,
            timeLearning: booking.timeLearning,
            startDay: startDayParam,
          },
        }
      );
      console.log("Available teachers:", response.data);
      if (Array.isArray(response.data)) {
        setAvailableTeachers(response.data);
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

    // Reset form và các state liên quan
    form.setFieldsValue({
      teacherId: record.teacherId,
      responseId: undefined,
      responseTypeId: undefined,
      levelId: record.levelId,
    });
    setSelectedResponseType(undefined);
    setSelectedResponse(null);
    setSelectedLevel(undefined); // Reset selectedLevel khi mở modal

    // Kiểm tra giáo viên có lịch trống
    await checkAvailableTeachers(record);

    // Xác định allowedResponseTypes ban đầu dựa vào giáo viên hiện tại
    const filteredTypes = [
      ...getResponseTypes().filter((type) => type.responseName === "Đồng ý"),
    ];
    setAllowedResponseTypes(filteredTypes);
    if (filteredTypes.length > 0) {
      setSelectedResponseType(filteredTypes[0].responseTypeId);
      form.setFieldsValue({ responseTypeId: filteredTypes[0].responseTypeId });
    }

    setStatusModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedBooking(record);
    setViewModalVisible(true);
    fetchLearningPathSessions(record.learningRegisId);
  };

  const handleViewVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoModalVisible(true);
  };

  const getStatusTag = (status, paymentStatus) => {
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
      case "Fourty":
        return (
          <Tag icon={<CheckCircleOutlined />} color="orange">
            Đã thanh toán 40%
          </Tag>
        );
      case "Sixty":
        return (
          <Tag icon={<CheckCircleOutlined />} color="blue">
            Đã thanh toán 60%
          </Tag>
        );
      case "Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      case "FourtyFeedbackDone":
        return (
          <Tag icon={<CheckCircleOutlined />} color="purple">
            Đã phản hồi
          </Tag>
        );
      case "Cancelled":
        return (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Đã hủy
          </Tag>
        );
      case "FullyPaid":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã thanh toán đầy đủ
          </Tag>
        );
      case "Payment40Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Từ chối thanh toán 40%
          </Tag>
        );
      case "Payment60Rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Từ chối thanh toán 60%
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

  const getFileTypeInfo = (url) => {
    if (!url) return { icon: null, color: "", text: "", type: "" };

    // Xử lý URL từ Firebase
    if (url.includes("firebasestorage.googleapis.com")) {
      // Lấy tên file từ URL Firebase (nằm giữa /o/ và ?)
      const fileNameMatch = url.match(/\/o\/([^?]+)/);
      if (fileNameMatch) {
        const fileName = decodeURIComponent(
          fileNameMatch[1].replace("syllabus%2F", "")
        );
        const extension = fileName.split(".").pop().toLowerCase();

        if (extension === "pdf") {
          return {
            icon: <FileOutlined style={{ fontSize: "16px" }} />,
            color: "#ff4d4f",
            text: "PDF",
            type: "pdf",
          };
        } else if (["doc", "docx"].includes(extension)) {
          return {
            icon: <FileOutlined style={{ fontSize: "16px" }} />,
            color: "#1890ff",
            text: "Word",
            type: "word",
          };
        }
      }
    }

    // Xử lý đường dẫn thông thường
    const extension = url.split(".").pop().toLowerCase();
    if (extension === "pdf") {
      return {
        icon: <FileOutlined style={{ fontSize: "16px" }} />,
        color: "#ff4d4f",
        text: "PDF",
        type: "pdf",
      };
    } else if (["doc", "docx"].includes(extension)) {
      return {
        icon: <FileOutlined style={{ fontSize: "16px" }} />,
        color: "#1890ff",
        text: "Word",
        type: "word",
      };
    }

    return {
      icon: <FileOutlined style={{ fontSize: "16px" }} />,
      color: "default",
      text: "Tệp",
      type: "other",
    };
  };

  const getSelectedLevelContent = () => {
    if (!selectedLevel || !levels) return null;
    const selectedLevelData = levels.find(
      (level) => level.levelAssignedId === selectedLevel
    );
    if (!selectedLevelData) return null;

    return (
      <div className="space-y-4">
        <div>
          <div className="font-medium text-lg mb-2">
            {selectedLevelData.levelName}
          </div>
          <div className="text-gray-600 text-lg">
            Học phí: {selectedLevelData.levelPrice.toLocaleString("vi-VN")}{" "}
            VNĐ/Buổi
          </div>
        </div>

        {selectedLevelData.syllabusLink ? (
          <div className="mt-4">
            <div className="font-medium mb-2">Giáo trình:</div>
            {selectedLevelData.syllabusLink.startsWith("https://") ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const fileInfo = getFileTypeInfo(
                    selectedLevelData.syllabusLink
                  );
                  return (
                    <div className="flex items-center gap-2">
                      <Tag color={fileInfo.color} icon={fileInfo.icon}>
                        {fileInfo.text}
                      </Tag>
                      <Button
                        type="primary"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          window.open(selectedLevelData.syllabusLink, "_blank")
                        }
                        style={{
                          background: fileInfo.color,
                          borderColor: fileInfo.color,
                        }}
                      >
                        Tải xuống
                      </Button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <Tag color="error">Link không hợp lệ</Tag>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <div className="font-medium mb-2">Giáo trình:</div>
            <Tag color="warning">Chưa có</Tag>
          </div>
        )}
      </div>
    );
  };

  const fetchTeacherSchedule = async (teacherId) => {
    try {
      setScheduleLoading(true);
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Schedules/teacher/${teacherId}/register`
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
    setSelectedTeacher(value);
    form.setFieldsValue({ teacherId: value });
    fetchTeacherSchedule(value);

    // Xác định allowedResponseTypes dựa vào lựa chọn giáo viên
    let filteredTypes = [];
    if (selectedBooking) {
      if (value === selectedBooking.teacherId) {
        filteredTypes = [
          ...getResponseTypes().filter(
            (type) => type.responseName === "Đồng ý"
          ),
        ];
      } else {
        filteredTypes = [
          ...getResponseTypes().filter((type) => type.responseName === "Gợi ý"),
        ];
      }
      setAllowedResponseTypes(filteredTypes);
      // Reset cả hai trường khi đổi giáo viên
      form.setFieldsValue({ responseTypeId: undefined, responseId: undefined });
      setSelectedResponseType(undefined);
      setSelectedResponse(null);
      // Nếu có option thì tự động chọn
      if (filteredTypes.length > 0) {
        setSelectedResponseType(filteredTypes[0].responseTypeId);
        form.setFieldsValue({
          responseTypeId: filteredTypes[0].responseTypeId,
        });
      }
    }
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
      // Lọc theo regisTypeName
      if (booking.regisTypeName !== "Đăng kí học theo yêu cầu") {
        return false;
      }

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
      render: (_, record) => (
        <span>
          {record.timeStart?.substring(0, 5)} -{" "}
          {record.timeEnd?.substring(0, 5)} ({record.timeLearning} phút)
        </span>
      ),
      width: 150,
    },
    {
      title: "Số buổi",
      dataIndex: "numberOfSession",
      key: "numberOfSession",
      width: 100,
    },
    // {
    //   title: "Học phí",
    //   key: "price",
    //   render: (_, record) => (
    //     <span className="font-medium text-blue-600">
    //       {record.price?.toLocaleString("vi-VN")} VNĐ
    //     </span>
    //   ),
    //   width: 150,
    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => getStatusTag(status, record.paymentStatus),
      filters: [
        { text: "Chờ xác nhận", value: "Pending" },
        { text: "Đã chấp nhận", value: "Accepted" },
        { text: "Đã thanh toán 40%", value: "Fourty" },
        { text: "Đã thanh toán 60%", value: "Sixty" },
        { text: "Từ chối", value: "Rejected" },
        { text: "Đã phản hồi", value: "FourtyFeedbackDone" },
        { text: "Đã hủy", value: "Cancelled" },
        { text: "Đã thanh toán đầy đủ", value: "FullyPaid" },
        { text: "Từ chối thanh toán 40%", value: "Payment40Rejected" },
        { text: "Từ chối thanh toán 60%", value: "Payment60Rejected" },
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
            <>
              <Tooltip title="Cập nhật trạng thái">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  onClick={() => showStatusModal(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối yêu cầu">
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  onClick={() => showRejectModal(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
      width: 140,
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

  const fetchLearningPathSessions = async (learningRegisId) => {
    setLoadingPathSessions(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/${learningRegisId}/learning-path-sessions`
      );
      if (response.data?.isSucceed) {
        setLearningPathSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching learning path sessions:", error);
      message.error("Không thể tải thông tin lộ trình học");
    } finally {
      setLoadingPathSessions(false);
    }
  };

  const showRejectModal = (record) => {
    console.log("Selected booking for rejection:", record);
    setSelectedBooking(record);

    // Reset form và các state liên quan
    rejectForm.setFieldsValue({
      responseTypeId: undefined,
      responseId: undefined,
    });
    setSelectedResponseType(undefined);
    setSelectedResponse(null);

    const filteredTypes = [
      ...getResponseTypes().filter((type) => type.responseName === "Từ chối"),
    ];
    setAllowedRejectResponseTypes(filteredTypes);
    if (filteredTypes.length > 0) {
      setSelectedResponseType(filteredTypes[0].responseTypeId);
      rejectForm.setFieldsValue({
        responseTypeId: filteredTypes[0].responseTypeId,
      });
    }
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      setLoading(true);

      if (!values.responseId) {
        message.error("Vui lòng chọn phản hồi trước khi từ chối");
        return;
      }

      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegis/reject/${selectedBooking.learningRegisId}`,
        {
          responseId: values.responseId,
        }
      );

      if (response.data?.isSucceed) {
        message.success("Đã từ chối yêu cầu thành công");
        setRejectModalVisible(false);
        rejectForm.resetFields();
        setSelectedBooking(null);
        fetchBookings();
      } else {
        throw new Error(response.data?.message || "Từ chối thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi từ chối yêu cầu: " + (error.message || error));
        console.error("Error rejecting request:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Trong useEffect, khi showStatusModal được gọi, cần set allowedResponseTypes đúng theo mặc định giáo viên hiện tại
  useEffect(() => {
    if (statusModalVisible && selectedBooking) {
      setAllowedResponseTypes([
        ...getResponseTypes().filter((type) => type.responseName === "Đồng ý"),
      ]);
    }
    // eslint-disable-next-line
  }, [statusModalVisible, selectedBooking]);

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
            {/* Phần trạng thái và thời gian */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Trạng thái:</span>
                  {getStatusTag(
                    selectedBooking.status,
                    selectedBooking.paymentStatus
                  )}
                </div>
                {selectedBooking.paymentStatus && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Thanh toán:</span>
                    <Tag
                      color={
                        selectedBooking.paymentStatus === "Pending"
                          ? "warning"
                          : selectedBooking.paymentStatus === "40% payment"
                          ? "processing"
                          : selectedBooking.paymentStatus === "Overdue"
                          ? "error"
                          : "success"
                      }
                    >
                      {selectedBooking.paymentStatus === "Pending"
                        ? "Chưa thanh toán"
                        : selectedBooking.paymentStatus === "40% payment"
                        ? "Đã thanh toán 40%"
                        : selectedBooking.paymentStatus === "Overdue"
                        ? "Quá hạn"
                        : selectedBooking.paymentStatus}
                    </Tag>
                  </div>
                )}
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
                <div>
                  <p className="text-gray-500">Mã học viên</p>
                  <p className="font-medium">{selectedBooking.learnerId}</p>
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
                  <p className="text-gray-500">Trình độ của học viên</p>
                  <p className="font-medium">
                    {selectedBooking.selfAssessment || "Chưa cung cấp"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Học phí/buổi</p>
                  <p className="font-medium text-blue-600">
                    {selectedBooking.levelPrice?.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tổng học phí</p>
                  <p className="font-medium text-red-600">
                    {selectedBooking.price?.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Số buổi học</p>
                  <p className="font-medium">
                    {selectedBooking.numberOfSession} buổi
                  </p>
                </div>
                {selectedBooking.remainingAmount !== null && (
                  <div>
                    <p className="text-gray-500">Số tiền còn lại</p>
                    <p className="font-medium text-orange-500">
                      {selectedBooking.remainingAmount?.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </p>
                  </div>
                )}
              </div>

              {/* Thông tin thanh toán */}
              {(selectedBooking.paymentDeadline ||
                selectedBooking.acceptedDate) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBooking.acceptedDate && (
                      <div>
                        <p className="text-gray-500">Ngày chấp nhận</p>
                        <p className="font-medium">
                          {dayjs(selectedBooking.acceptedDate).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </p>
                      </div>
                    )}
                    {selectedBooking.paymentDeadline && (
                      <div>
                        <p className="text-gray-500">Hạn thanh toán</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {dayjs(selectedBooking.paymentDeadline).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </p>
                          {selectedBooking.daysRemaining !== null && (
                            <Tag
                              color={
                                selectedBooking.daysRemaining >= 0
                                  ? "warning"
                                  : "error"
                              }
                            >
                              {selectedBooking.daysRemaining >= 0
                                ? `Còn ${selectedBooking.daysRemaining} ngày`
                                : "Đã quá hạn"}
                            </Tag>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.learningRequest && (
                <div className="mt-4">
                  <p className="text-gray-500">Yêu cầu học</p>
                  <p className="font-medium whitespace-pre-wrap">
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

              {selectedBooking.syllabusLink && (
                <div className="mt-4">
                  <p className="text-gray-500 mb-2">Giáo trình</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const fileInfo = getFileTypeInfo(
                        selectedBooking.syllabusLink
                      );
                      return (
                        <>
                          <Tag color={fileInfo.color} icon={fileInfo.icon}>
                            {fileInfo.text}
                          </Tag>
                          <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() =>
                              window.open(
                                selectedBooking.syllabusLink,
                                "_blank"
                              )
                            }
                            style={{
                              background: fileInfo.color,
                              borderColor: fileInfo.color,
                            }}
                          >
                            Tải xuống
                          </Button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Thông tin lộ trình học */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOutlined className="text-blue-500" />
                  <h3 className="text-lg font-semibold">Lộ trình học</h3>
                </div>
                {loadingPathSessions && <Spin size="small" />}
              </div>

              {learningPathSessions.length > 0 &&
              learningPathSessions.every((session) => session.isCompleted) ? (
                <div className="space-y-4">
                  {learningPathSessions.map((session) => (
                    <div
                      key={session.learningPathSessionId}
                      className={`p-4 rounded-lg border bg-green-50 border-green-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                            {session.sessionNumber}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Buổi {session.sessionNumber}
                            </h4>
                            <p className="text-gray-600">
                              {session.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loadingPathSessions ? (
                <Empty
                  description="Chưa có thông tin lộ trình học hoặc lộ trình chưa được xác nhận"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : null}
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
              disabled
            >
              {allowedResponseTypes.length > 0
                ? allowedResponseTypes.map((type) => (
                    <Option
                      key={type.responseTypeId}
                      value={type.responseTypeId}
                    >
                      {type.responseName}
                    </Option>
                  ))
                : null}
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

          {/* Chỉ hiển thị Chi tiết cấp độ khi selectedLevel là giá trị hợp lệ */}
          {selectedLevel !== undefined &&
            selectedLevel !== null &&
            selectedLevel !== "" &&
            selectedLevel !== 0 && (
              <Form.Item name="levelDetails" label="Chi tiết cấp độ">
                <div className="p-3 bg-gray-50 rounded border">
                  {getSelectedLevelContent()}
                </div>
              </Form.Item>
            )}
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

      {/* Modal từ chối đơn */}
      <Modal
        title={
          <div className="flex items-center text-red-500">
            <CloseCircleOutlined className="mr-2" /> Từ chối yêu cầu đăng ký
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleReject}
        confirmLoading={loading}
        okText="Từ chối yêu cầu"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        width={700}
      >
        {selectedBooking && (
          <Form form={rejectForm} layout="vertical">
            <div className="p-4 bg-red-50 rounded-lg mb-4 border border-red-200">
              <div className="flex items-center mb-2">
                <InfoCircleOutlined className="text-red-500 mr-2" />
                <span className="font-medium">
                  Bạn đang từ chối yêu cầu đăng ký của{" "}
                  <span className="text-red-600">
                    {selectedBooking.fullName}
                  </span>
                </span>
              </div>
              <p className="text-gray-600">
                Khi từ chối, học viên sẽ không thể tiếp tục quá trình đăng ký
                này và sẽ nhận được thông báo từ chối.
              </p>
            </div>

            <Form.Item
              name="responseTypeId"
              label="Loại phản hồi"
              rules={[
                { required: true, message: "Vui lòng chọn loại phản hồi" },
              ]}
            >
              <Select
                placeholder="Chọn loại phản hồi"
                onChange={handleResponseTypeChange}
                className="w-full"
                disabled
              >
                {allowedRejectResponseTypes.length > 0
                  ? allowedRejectResponseTypes.map((type) => (
                      <Option
                        key={type.responseTypeId}
                        value={type.responseTypeId}
                      >
                        {type.responseName}
                      </Option>
                    ))
                  : null}
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
                    {getResponsesByType(selectedResponseType).map(
                      (response) => (
                        <Option
                          key={response.responseId}
                          value={response.responseId}
                          label={`Phản hồi #${response.responseId}`}
                        >
                          <div className="flex items-center py-1">
                            <FileTextOutlined className="mr-2 text-red-500" />
                            <div className="truncate max-w-[400px]">
                              {response.responseDescription}
                            </div>
                          </div>
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>

                {selectedResponse && (
                  <div className="mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <FileTextOutlined className="text-red-500 mr-2" />
                        <span className="font-medium">
                          Chi tiết nội dung phản hồi
                        </span>
                      </div>
                      <div className="text-gray-800 whitespace-pre-wrap">
                        {selectedResponse.responseDescription}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Form>
        )}
      </Modal>
    </Layout>
  );
};

export default Booking11Management;
