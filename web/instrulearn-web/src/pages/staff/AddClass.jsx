import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  TimePicker,
  Typography,
  Space,
  message,
  Spin,
  Divider,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Content } = Layout;
const { Title } = Typography;
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

const AddClass = () => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchCourses(), fetchTeachers(), fetchSyllabuses()]);
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Teacher/get-all"
      );
      const data = await response.json();
      const activeTeachers = data.filter(
        (teacher) => teacher.data.isActive === 1
      );
      setTeachers(activeTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("Không thể tải danh sách giáo viên");
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

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      // Chuyển đổi selectedDays thành mảng số và sắp xếp
      const classDays = selectedDays.map(Number).sort((a, b) => a - b);

      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Class/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId: values.teacherId,
            coursePackageId: values.coursePackageId,
            syllabusId: values.syllabusId,
            className: values.className,
            startDate: values.startDate.format("YYYY-MM-DD"),
            classTime: values.classTime.format("HH:mm"),
            maxStudents: values.maxStudents,
            totalDays: values.totalDays,
            price: values.price,
            status: 0,
            classDays: classDays,
          }),
        }
      );

      if (response.ok) {
        message.success("Tạo lớp học thành công!");
        navigate("/staff/class-management");
      } else {
        message.error("Không thể tạo lớp học");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      message.error("Có lỗi xảy ra khi tạo lớp học");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/staff/class-management");
  };

  // Thêm hàm kiểm tra thời gian hợp lệ
  const disabledTime = () => ({
    disabledHours: () => [
      ...Array(7).keys(),
      ...Array(5)
        .keys()
        .map((x) => x + 19),
    ],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  });

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
            <Title level={2} className="text-center mb-6">
              Thêm Lớp Học Mới
            </Title>
            <Divider />

            <Spin spinning={loadingData}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  maxStudents: 10,
                  teacherId: undefined,
                  syllabusId: undefined,
                }}
              >
                <Row gutter={24}>
                  {/* Thông tin cơ bản */}
                  <Col xs={24} lg={16}>
                    <Title level={4}>Thông tin cơ bản</Title>

                    <Form.Item
                      name="teacherId"
                      label="Giáo viên"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn giáo viên!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn giáo viên">
                        {teachers.map((teacher) => (
                          <Option
                            key={teacher.data.teacherId}
                            value={teacher.data.teacherId}
                          >
                            {teacher.data.fullname}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="syllabusId"
                      label="Giáo trình"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn giáo trình!",
                        },
                      ]}
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
                      label="Tên lớp học"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên lớp học!",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập tên lớp học" />
                    </Form.Item>

                    <Form.Item
                      name="coursePackageId"
                      label="Khóa học"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn khóa học!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn khóa học">
                        {courses.map((course) => (
                          <Option
                            key={course.coursePackageId}
                            value={course.coursePackageId}
                          >
                            {course.courseName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="maxStudents"
                      label="Số học viên tối đa"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số học viên tối đa!",
                        },
                      ]}
                    >
                      <InputNumber min={1} max={30} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      name="price"
                      label="Giá"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập giá!",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>

                  {/* Thời gian và lịch học */}
                  <Col xs={24} lg={8}>
                    <Title level={4}>Thời gian và lịch học</Title>

                    <Form.Item
                      name="startDate"
                      label="Ngày bắt đầu"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn ngày bắt đầu!",
                        },
                      ]}
                    >
                      <DatePicker
                        locale={locale}
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>

                    <Form.Item
                      name="classTime"
                      label="Thời gian học"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn thời gian học!",
                        },
                      ]}
                    >
                      <TimePicker
                        format="HH:mm"
                        style={{ width: "100%" }}
                        disabledTime={disabledTime}
                        minuteStep={15}
                        showNow={false}
                        placeholder="Chọn thời gian (7:00 - 19:00)"
                      />
                    </Form.Item>

                    <Form.Item
                      name="totalDays"
                      label="Tổng số buổi học"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tổng số buổi học!",
                        },
                      ]}
                    >
                      <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      label="Ngày học trong tuần"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn ngày học!",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn các ngày học trong tuần"
                        value={selectedDays}
                        onChange={setSelectedDays}
                        style={{ width: "100%" }}
                      >
                        {weekDays.map((day) => (
                          <Option key={day.value} value={day.value}>
                            {day.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <div className="flex justify-center mt-4">
                  <Button
                    type="default"
                    className="mr-4"
                    onClick={handleCancel}
                    icon={<CloseOutlined />}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    Tạo lớp học
                  </Button>
                </div>
              </Form>
            </Spin>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddClass;
