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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";

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
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [existingClassNames, setExistingClassNames] = useState([]);
  const [isCheckingClassName, setIsCheckingClassName] = useState(false);
  const [classNameError, setClassNameError] = useState("");
  const [checkClassNameTimer, setCheckClassNameTimer] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      fetchSyllabuses(),
      fetchClasses(),
      fetchMajors(),
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

  const fetchAvailableTeachers = async (startDate, classTime) => {
    try {
      setIsLoadingTeachers(true);
      // Chuyển từ POST method sang GET method và truyền tham số qua query parameters
      const url = new URL(
        "https://instrulearnapplication.azurewebsites.net/api/Schedules/available-teachers"
      );

      // Thêm query parameters
      url.searchParams.append("timeLearning", "120");
      url.searchParams.append("timeStart", classTime);
      url.searchParams.append("startDay", startDate);

      // Nếu đã chọn majorId thì truyền vào
      const majorId = form.getFieldValue("majorId");
      if (majorId) {
        url.searchParams.append("majorId", majorId);
      }

      console.log("Calling API with URL:", url.toString());

      const response = await fetch(url);
      const data = await response.json();
      console.log("API response:", data);

      // Kiểm tra dữ liệu trả về
      if (Array.isArray(data)) {
        setAvailableTeachers(data);
        if (data.length === 0) {
          message.warning(
            "Không có giáo viên nào có lịch trống vào thời gian này"
          );
        }
      } else if (data.isSucceed) {
        if (Array.isArray(data.data)) {
          setAvailableTeachers(data.data);
          if (data.data.length === 0) {
            message.warning(
              "Không có giáo viên nào có lịch trống vào thời gian này"
            );
          }
        } else {
          message.error("Định dạng dữ liệu không hợp lệ");
        }
      } else {
        message.error(
          data.message || "Không thể tải danh sách giáo viên khả dụng"
        );
      }
    } catch (error) {
      console.error("Error fetching available teachers:", error);
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
        syllabusId: Number(values.syllabusId),
        className: values.className.trim(),
        startDate: values.startDate.format("YYYY-MM-DD"),
        classTime: values.classTime.format("HH:mm:00"),
        maxStudents: Number(values.maxStudents),
        totalDays: Number(values.totalDays),
        price: Number(values.price),
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
        message.success("Tạo lớp học thành công");
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
        return "green";
      case 2:
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
        return "Đang diễn ra";
      case 2:
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
          <Tooltip title="Sửa & Quản lý">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => handleEditClass(record.classId, e)}
            />
          </Tooltip>
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
    // Kiểm tra nếu đã chọn đủ 3 trường cần thiết
    if (allValues.majorId && allValues.startDate && allValues.classTime) {
      // Reset danh sách giáo viên trước khi gọi API mới
      setAvailableTeachers([]);
      // Gọi API để lấy danh sách giáo viên khả dụng
      fetchAvailableTeachers(
        allValues.startDate.format("YYYY-MM-DD"),
        allValues.classTime.format("HH:mm:00")
      );
    } else {
      // Reset danh sách giáo viên nếu chưa đủ điều kiện
      setAvailableTeachers([]);
      // Nếu thay đổi một trong các trường quan trọng, reset trường giáo viên
      if (
        changedValues.majorId ||
        changedValues.startDate ||
        changedValues.classTime
      ) {
        form.setFieldValue("teacherId", undefined);
      }
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
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="majorId"
              label="Chuyên ngành"
              rules={[
                { required: true, message: "Vui lòng chọn chuyên ngành" },
              ]}
            >
              <Select placeholder="Chọn chuyên ngành">
                {majors.map((major) => (
                  <Option key={major.majorId} value={major.majorId}>
                    {major.majorName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
            >
              <DatePicker className="w-full" />
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
                  !form.getFieldValue("classTime")
                }
              >
                {availableTeachers.map((teacher) => (
                  <Option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.fullname}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="syllabusId"
              label="Giáo trình"
              rules={[{ required: true, message: "Vui lòng chọn giáo trình" }]}
            >
              <Select placeholder="Chọn giáo trình">
                {syllabuses.map((syllabus) => (
                  <Option
                    key={syllabus.data.syllabusId}
                    value={syllabus.data.syllabusId}
                  >
                    {syllabus.data.syllabusName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="className"
              label="Tên lớp"
              rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
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
              rules={[{ required: true, message: "Vui lòng nhập số học viên" }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item
              name="totalDays"
              label="Tổng số buổi học"
              rules={[{ required: true, message: "Vui lòng nhập số buổi học" }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá/buổi"
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              label="Ngày học trong tuần"
              rules={[{ required: true, message: "Vui lòng chọn ngày học" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn ngày học"
                value={selectedDays}
                onChange={setSelectedDays}
                className="w-full"
              >
                {weekDays.map((day) => (
                  <Option key={day.value} value={day.value}>
                    {day.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
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
    </Layout>
  );
};

export default ClassManagement;
