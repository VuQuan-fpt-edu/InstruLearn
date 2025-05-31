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
  Row,
  Col,
  Statistic,
  Form,
  DatePicker,
  Select,
  InputNumber,
  TimePicker,
  Dropdown,
  Menu,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  BookOutlined,
  DownOutlined,
  CheckCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const { Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const weekDays = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

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
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const ClassManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [weekCount, setWeekCount] = useState(1);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [existingClassNames, setExistingClassNames] = useState([]);
  const [isCheckingClassName, setIsCheckingClassName] = useState(false);
  const [classNameError, setClassNameError] = useState("");
  const [checkClassNameTimer, setCheckClassNameTimer] = useState(null);
  const [levels, setLevels] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState(undefined);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      fetchSyllabuses(),
      fetchClasses(),
      fetchMajors(),
      fetchLevels(),
    ]);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Course/get-all"
      );
      const data = await response.json();
      // Lọc chỉ hiển thị khóa học có coursePackageType là 1
      const filteredData = data.filter(
        (course) => course.coursePackageType === 1
      );
      setCourses(filteredData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSyllabuses = async () => {
    try {
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Syllabus/get-all"
      );
      const data = await response.json();
      setSyllabuses(data);
    } catch (error) {
      console.error("Error fetching syllabuses:", error);
      message.error("Không thể tải danh sách giáo trình");
    }
  };

  const fetchClasses = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Class/get-all"
      );
      const data = await response.json();
      setClasses(data);
      // Lưu danh sách tên lớp hiện có
      setExistingClassNames(data.map((c) => c.className.toLowerCase()));
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error("Không thể tải danh sách lớp học");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
      );
      const data = await response.json();
      if (data.isSucceed) {
        // Lọc chỉ các major có status = 1 (Đang diễn ra)
        const activeMajors = data.data.filter((major) => major.status === 1);
        setMajors(activeMajors);
      } else {
        message.error(data.message || "Không thể tải danh sách ngành học");
      }
    } catch (error) {
      console.error("Error fetching majors:", error);
      message.error("Không thể tải danh sách ngành học");
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/get-all"
      );
      const data = await response.json();
      // data là mảng các object có .data
      const formattedLevels = data.map((item) => item.data);
      setLevels(formattedLevels);
    } catch (error) {
      message.error("Không thể tải danh sách cấp độ");
    }
  };

  // Hàm tính tất cả các ngày học thực tế (bao gồm ngày kiểm tra đầu vào và các ngày học chính thức)
  const getAllSessionDates = (startDate, classDays, weekCount, testDay) => {
    if (!startDate || !classDays || classDays.length === 0 || !weekCount)
      return [];
    let result = [];
    // Thêm ngày kiểm tra đầu vào nếu có
    if (testDay) {
      result.push(dayjs(testDay).format("YYYY-MM-DD"));
    }
    // Tính các ngày học chính thức
    const start = dayjs(startDate);
    for (let week = 0; week < weekCount; week++) {
      classDays.forEach((dayOfWeek) => {
        // Tìm ngày đầu tiên của tuần hiện tại (thứ 2)
        const weekStart = start.startOf("week").add(week, "week");
        // Tìm ngày học trong tuần này
        const sessionDate = weekStart.day(dayOfWeek);
        // Nếu tuần đầu tiên, chỉ lấy ngày >= startDate
        if (week === 0 && sessionDate.isBefore(start, "day")) return;
        // Không trùng ngày kiểm tra đầu vào
        const sessionDateStr = sessionDate.format("YYYY-MM-DD");
        if (!result.includes(sessionDateStr)) {
          result.push(sessionDateStr);
        }
      });
    }
    // Sắp xếp tăng dần
    result = result.sort();
    return result;
  };

  const fetchAvailableTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const majorId = form.getFieldValue("majorId");
      const classTime = form.getFieldValue("classTime")?.format("HH:mm:00");
      const classDays = form.getFieldValue("classDays");
      const weekCount = form.getFieldValue("weekCount");
      const startDate = form.getFieldValue("startDate");
      const testDay = form.getFieldValue("testDay");

      // Tính danh sách ngày học thực tế
      const sessionDates = getAllSessionDates(
        startDate,
        classDays,
        weekCount,
        testDay
      );
      const startDayParam = sessionDates.join(",");

      const url = new URL(
        "https://instrulearnapplication.azurewebsites.net/api/Schedules/available-teachers"
      );
      url.searchParams.append("majorId", majorId);
      url.searchParams.append("timeStart", classTime);
      url.searchParams.append("timeLearning", "120");
      url.searchParams.append("startDay", startDayParam);

      const response = await fetch(url);
      const data = await response.json();
      setAvailableTeachers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách giáo viên khả dụng");
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      // Chuyển đổi selectedDays thành mảng số và sắp xếp
      const classDays = selectedDays.map(Number).sort((a, b) => a - b);

      // Log dữ liệu trước khi gửi để kiểm tra
      const requestData = {
        teacherId: Number(values.teacherId),
        majorId: Number(values.majorId),
        levelId: Number(values.levelId),
        className: values.className.trim(),
        testDay: values.testDay
          ? values.testDay.format("YYYY-MM-DD")
          : values.startDate.format("YYYY-MM-DD"),
        startDate: values.startDate.format("YYYY-MM-DD"),
        classTime: values.classTime.format("HH:mm:00"),
        maxStudents: Number(values.maxStudents),
        totalDays: Number(values.totalDays),
        price: Number(values.price),
        imageUrl: values.imageUrl || imageUrl || "",
        status: 0,
        classDays: classDays,
      };

      console.log("Request data:", requestData);

      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Class/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        setSuccessModalVisible(true);
        form.resetFields();
        setIsModalVisible(false);
        setSelectedDays([]);
        // Tải lại danh sách lớp học
        fetchClasses();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Không thể tạo lớp học");
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      message.error("Có lỗi xảy ra khi tạo lớp học");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (classId, e) => {
    e.stopPropagation();

    confirm({
      title: "Bạn có chắc chắn muốn xóa lớp học này?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        // TODO: Implement delete API call
        message.success("Xóa lớp học thành công");
        fetchClasses();
      },
    });
  };

  const handleRowClick = (record) => {
    navigate(`/staff/class-detail/${record.classId}`);
  };

  const handleAddClass = () => {
    navigate("/staff/add-class");
    // Hoặc bạn có thể giả lập việc thêm mới
    // message.info("Chuyển đến trang thêm lớp học mới");
  };

  const handleEditClass = (classId, e) => {
    e.stopPropagation();
    navigate(`/staff/class-detail/${classId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "blue";
      case 1:
        return "orange";
      case 2:
        return "green";
      case 3:
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Đang mở lớp";
      case 1:
        return "Đang kiểm tra đầu vào";
      case 2:
        return "Đang diễn ra";
      case 3:
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const getStatistics = () => {
    return {
      total: classes.length,
      active: classes.filter((c) => c.status === 1).length,
      upcoming: classes.filter((c) => c.status === 0).length,
      ended: classes.filter((c) => c.status === 2).length,
    };
  };

  const columns = [
    {
      title: "Tên lớp học",
      dataIndex: "className",
      key: "className",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.className.localeCompare(b.className),
    },
    {
      title: "Nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => (
        <Space>
          <BookOutlined />
          {text}
        </Space>
      ),
      sorter: (a, b) => a.majorName.localeCompare(b.majorName),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: "Thời gian học",
      key: "classTime",
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          {`${record.classTime.substring(
            0,
            5
          )} - ${record.classEndTime.substring(0, 5)}`}
        </Space>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString("vi-VN")}
        </Space>
      ),
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: "Đang mở lớp", value: 0 },
        { text: "Đang diễn ra", value: 1 },
        { text: "Đã kết thúc", value: 2 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleRowClick(record)}
            />
          </Tooltip>
          {/* <Tooltip title="Sửa & Quản lý">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => handleEditClass(record.classId, e)}
            />
          </Tooltip> */}
          {/* <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => handleDelete(record.classId, e)}
              disabled={record.status === 1}
            />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  const stats = getStatistics();

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.majorName.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.teacherName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFormValuesChange = (changedValues, allValues) => {
    // Kiểm tra nếu đã chọn đủ các trường cần thiết để lấy giáo viên
    if (
      allValues.majorId &&
      allValues.startDate &&
      allValues.classTime &&
      allValues.classDays &&
      allValues.classDays.length > 0 &&
      allValues.weekCount
    ) {
      fetchAvailableTeachers();
    } else {
      setAvailableTeachers([]);
      if (
        changedValues.majorId ||
        changedValues.startDate ||
        changedValues.classTime
      ) {
        form.setFieldValue("teacherId", undefined);
      }
    }

    // Tự động tính tổng số buổi học khi thay đổi ngày học hoặc số tuần học
    if (
      changedValues.weekCount !== undefined ||
      changedValues.classDays !== undefined
    ) {
      const days =
        changedValues.classDays !== undefined
          ? changedValues.classDays
          : selectedDays;
      const weeks =
        changedValues.weekCount !== undefined
          ? changedValues.weekCount
          : weekCount;
      const total = (days ? days.length : 0) * (weeks ? weeks : 0);
      form.setFieldsValue({ totalDays: total });
    }
  };

  // Thêm hàm kiểm tra thời gian hợp lệ
  const disabledTime = () => ({
    disabledHours: () => [
      ...Array(7).keys(),
      ...Array(4)
        .keys()
        .map((x) => x + 20),
    ],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  });

  const checkExistingClassName = async (value) => {
    if (!value) return true;

    setIsCheckingClassName(true);
    try {
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Class/get-all"
      );
      const data = await response.json();
      const existingNames = data.map((c) => c.className.toLowerCase());
      const trimmedValue = value.trim().toLowerCase();

      if (existingNames.includes(trimmedValue)) {
        setClassNameError("Tên lớp này đã tồn tại!");
        return false;
      } else {
        setClassNameError("");
        return true;
      }
    } catch (error) {
      console.error("Error checking class name:", error);
      return true;
    } finally {
      setIsCheckingClassName(false);
    }
  };

  const validateClassName = async (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error("Vui lòng nhập tên lớp!"));
    }

    const isValid = await checkExistingClassName(value);
    if (!isValid) {
      return Promise.reject(new Error("Tên lớp này đã tồn tại!"));
    }
    return Promise.resolve();
  };

  // Hàm kiểm tra ngày bắt đầu hợp lệ: chỉ cho chọn ngày trong tuần đã chọn và từ tuần sau nữa trở đi (cách 2 tuần)
  const isValidStartDate = (date) => {
    if (!selectedDays || selectedDays.length === 0) return false;
    const dayOfWeek = date.day(); // 0: Chủ nhật, 1: Thứ 2, ...
    const today = dayjs();
    const twoWeeksLaterStart = today.startOf("week").add(2, "week");
    // Nếu ngày đang xét < ngày đầu tuần sau nữa => không hợp lệ
    if (date.isBefore(twoWeeksLaterStart, "day")) return false;
    // Chỉ cho phép chọn ngày trong selectedDays
    return selectedDays.includes(dayOfWeek);
  };

  // Hàm kiểm tra ngày kiểm tra đầu vào hợp lệ: chỉ cho chọn ngày trong tuần đã chọn và từ tuần sau trở đi (cách 1 tuần)
  const isValidTestDay = (date) => {
    if (!selectedDays || selectedDays.length === 0) return false;
    const dayOfWeek = date.day(); // 0: Chủ nhật, 1: Thứ 2, ...
    const today = dayjs();
    const nextWeekStart = today.startOf("week").add(1, "week");
    // Nếu ngày đang xét < ngày đầu tuần sau => không hợp lệ
    if (date.isBefore(nextWeekStart, "day")) return false;
    // Chỉ cho phép chọn ngày trong selectedDays
    return selectedDays.includes(dayOfWeek);
  };

  const handleUploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      message.error("Chỉ cho phép tải lên file ảnh!");
      return false;
    }
    setUploading(true);
    setUploadedFileName("");
    const storageRef = ref(storage, `class-images/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        setUploading(false);
        setUploadedFileName("");
        message.error("Tải file thất bại: " + error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadURL);
        setUploading(false);
        setUploadedFileName(file.name);
        message.success("Tải ảnh thành công!");
        form.setFieldsValue({ imageUrl: downloadURL });
      }
    );
    return false; // Ngăn antd upload tự động
  };

  return (
    <Layout className="min-h-screen">
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
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Card className="shadow-md">
            <div className="flex justify-between items-center mb-6">
              <Title level={2}>Quản lý lớp học</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm lớp học..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchClasses} />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                >
                  Tạo lớp học mới
                </Button>
              </Space>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={6}>
                <Card className="bg-blue-50">
                  <Statistic
                    title="Tổng số lớp"
                    value={stats.total}
                    prefix={<TeamOutlined className="text-blue-500" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="bg-green-50">
                  <Statistic
                    title="Đang diễn ra"
                    value={stats.active}
                    prefix={<TeamOutlined className="text-green-500" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="bg-yellow-50">
                  <Statistic
                    title="Đang mở lớp"
                    value={stats.upcoming}
                    prefix={<TeamOutlined className="text-yellow-500" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="bg-gray-50">
                  <Statistic
                    title="Đã kết thúc"
                    value={stats.ended}
                    prefix={<TeamOutlined className="text-gray-500" />}
                  />
                </Card>
              </Col>
            </Row>

            <Spin spinning={loadingData}>
              <Table
                columns={columns}
                dataSource={filteredClasses}
                rowKey="classId"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  className: "cursor-pointer hover:bg-gray-50",
                })}
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} lớp học`,
                }}
              />
            </Spin>
          </Card>
        </Content>
      </Layout>

      <Modal
        title="Tạo lớp học mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedDays([]);
          setAvailableTeachers([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormValuesChange}
          initialValues={{
            teacherId: undefined,
            syllabusId: undefined,
            majorId: undefined,
            levelId: undefined,
            imageUrl: "",
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="className"
              label="Tên lớp"
              rules={[
                { required: true, message: "Vui lòng nhập tên lớp" },
                { max: 50, message: "Tên lớp không được vượt quá 50 ký tự" },
              ]}
              validateTrigger={["onBlur", "onChange", "onSubmit"]}
              validateStatus={
                form.getFieldError("className").length > 0 || classNameError
                  ? "error"
                  : ""
              }
              help={form.getFieldError("className")[0] || classNameError}
            >
              <Input
                placeholder="Nhập tên lớp"
                maxLength={50}
                showCount
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    checkExistingClassName(value);
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setClassNameError("Vui lòng nhập tên lớp");
                  } else if (classNameError) {
                    setClassNameError("");
                  }
                }}
                suffix={isCheckingClassName ? <Spin size="small" /> : null}
              />
            </Form.Item>

            <Form.Item
              name="maxStudents"
              label="Số học viên tối đa"
              rules={[
                { required: true, message: "Vui lòng nhập số học viên" },
                {
                  type: "number",
                  min: 1,
                  max: 100,
                  message: "Số học viên phải từ 1 đến 100",
                },
              ]}
            >
              <Input
                type="number"
                min={1}
                max={100}
                placeholder="Số học viên tối đa"
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (value > 100) value = 100;
                  if (value < 1) value = 1;
                  if (form) form.setFieldsValue({ maxStudents: value });
                }}
              />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá/buổi"
              rules={[
                { required: true, message: "Vui lòng nhập giá" },
                {
                  type: "number",
                  min: 1000,
                  max: 10000000,
                  message: "Giá phải từ 1.000 đến 10.000.000 VNĐ",
                },
              ]}
              initialValue={1000}
            >
              <Input
                type="number"
                min={1000}
                max={10000000}
                placeholder="Giá/buổi"
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (value > 10000000) value = 10000000;
                  if (value < 1000) value = 1000;
                  if (form) form.setFieldsValue({ price: value });
                }}
              />
            </Form.Item>

            <Form.Item
              name="majorId"
              label="Chuyên ngành"
              rules={[
                { required: true, message: "Vui lòng chọn chuyên ngành" },
              ]}
            >
              <Select
                placeholder="Chọn chuyên ngành"
                onChange={(value) => {
                  setSelectedMajorId(value);
                  form.setFieldsValue({ levelId: undefined }); // reset level khi đổi major
                }}
              >
                {majors.map((major) => (
                  <Option key={major.majorId} value={major.majorId}>
                    {major.majorName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="levelId"
              label="Cấp độ"
              rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
            >
              <Select placeholder="Chọn cấp độ" disabled={!selectedMajorId}>
                {levels
                  .filter((level) => level.majorId === selectedMajorId)
                  .map((level) => (
                    <Option
                      key={level.levelAssignedId}
                      value={level.levelAssignedId}
                    >
                      {level.levelName} -{" "}
                      {majors.find((m) => m.majorId === level.majorId)
                        ?.majorName || "Chuyên ngành?"}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="classTime"
              label="Thời gian học"
              rules={[
                { required: true, message: "Vui lòng chọn thời gian học" },
              ]}
            >
              <TimePicker
                className="w-full"
                format="HH:mm"
                disabledTime={disabledTime}
                minuteStep={15}
                showNow={false}
                placeholder="Chọn thời gian (7:00 - 19:00)"
              />
            </Form.Item>

            <Form.Item
              label="Ngày học trong tuần"
              name="classDays"
              rules={[{ required: true, message: "Vui lòng chọn ngày học" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn ngày học"
                value={selectedDays}
                onChange={(days) => {
                  setSelectedDays(days);
                  // Tự động tính lại tổng số buổi học khi chọn ngày học
                  const total = days.length * weekCount;
                  form.setFieldsValue({ totalDays: total });
                }}
                className="w-full"
              >
                {weekDays.map((day) => (
                  <Option key={day.value} value={day.value}>
                    {day.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Số tuần học"
              name="weekCount"
              rules={[{ required: true, message: "Vui lòng chọn số tuần học" }]}
              initialValue={1}
            >
              <Select
                placeholder="Chọn số tuần học"
                onChange={(value) => {
                  setWeekCount(value);
                  // Tự động tính lại tổng số buổi học khi chọn số tuần học
                  const total = selectedDays.length * value;
                  form.setFieldsValue({ totalDays: total });
                }}
              >
                {[...Array(12)].map((_, idx) => (
                  <Option key={idx + 1} value={idx + 1}>
                    {idx + 1} tuần
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="totalDays"
              label="Tổng số buổi học"
              rules={[{ required: true, message: "Vui lòng nhập số buổi học" }]}
            >
              <InputNumber className="w-full" min={1} disabled />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
            >
              <DatePicker
                className="w-full"
                disabledDate={(current) => !isValidStartDate(dayjs(current))}
                placeholder="Chọn ngày bắt đầu"
              />
            </Form.Item>

            <Form.Item
              name="testDay"
              label="Ngày kiểm tra đầu vào"
              rules={[{ required: false }]}
            >
              <DatePicker
                className="w-full"
                disabledDate={(current) => !isValidTestDay(dayjs(current))}
                placeholder="Chọn ngày kiểm tra (Bắt buộc)"
              />
            </Form.Item>

            <Form.Item
              name="teacherId"
              label="Giáo viên"
              rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
            >
              <Select
                placeholder="Chọn giáo viên"
                loading={isLoadingTeachers}
                disabled={
                  !form.getFieldValue("majorId") ||
                  !form.getFieldValue("startDate") ||
                  !form.getFieldValue("classTime") ||
                  !form.getFieldValue("classDays") ||
                  !form.getFieldValue("weekCount")
                }
              >
                {availableTeachers.map((teacher) => (
                  <Option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.fullname}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="imageUrl" label="Ảnh đại diện lớp học" rules={[]}>
              <Input
                placeholder="Dán link ảnh hoặc tải ảnh lên"
                addonAfter={
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleUploadImage}
                    accept="image/*"
                    disabled={uploading}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      Tải ảnh
                    </Button>
                  </Upload>
                }
              />
            </Form.Item>

            {uploadedFileName && (
              <div style={{ color: "green", marginBottom: 8 }}>
                Đã tải lên: <b>{uploadedFileName}</b>
              </div>
            )}

            {form.getFieldValue("imageUrl") && (
              <div style={{ marginBottom: 8 }}>
                <img
                  src={form.getFieldValue("imageUrl")}
                  alt="Ảnh lớp học"
                  style={{
                    maxWidth: 200,
                    maxHeight: 120,
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setSelectedDays([]);
                setAvailableTeachers([]);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Tạo lớp
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal thông báo thành công */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              Tạo lớp học thành công
            </div>
          </div>
        }
        open={successModalVisible}
        onOk={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
        okText="Đồng ý"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
      >
        <div className="py-4 text-center">
          <div className="mb-4">
            <CheckCircleOutlined className="text-6xl text-green-500" />
          </div>
          <div className="text-lg mb-4">Lớp học đã được tạo thành công!</div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ClassManagement;
