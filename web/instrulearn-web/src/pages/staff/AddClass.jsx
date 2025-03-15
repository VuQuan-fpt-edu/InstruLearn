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
  Breadcrumb,
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
  HomeOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Dữ liệu giả
const fakeTeachers = [
  { id: 1, name: "Nguyễn Văn An" },
  { id: 2, name: "Trần Thị Bình" },
  { id: 3, name: "Lê Văn Cường" },
  { id: 4, name: "Phạm Văn Dương" },
  { id: 5, name: "Nguyễn Thị Ngọc" },
  { id: 6, name: "Lê Thị Hương" },
  { id: 7, name: "Trần Văn Khánh" },
  { id: 8, name: "Phạm Thị Lan" },
];

const fakeCourses = [
  { id: 1, name: "Guitar cơ bản" },
  { id: 2, name: "Piano nâng cao" },
  { id: 3, name: "Violin cơ bản" },
  { id: 4, name: "Trống Jazz" },
  { id: 5, name: "Sáo trúc Việt Nam" },
  { id: 6, name: "Ukulele cơ bản" },
  { id: 7, name: "Thanh nhạc hiện đại" },
  { id: 8, name: "Saxophone nâng cao" },
  { id: 9, name: "Đàn tranh truyền thống" },
  { id: 10, name: "Guitar đệm hát" },
];

const fakeRooms = [
  { id: 1, name: "Phòng 101" },
  { id: 2, name: "Phòng 102" },
  { id: 3, name: "Phòng 103" },
  { id: 4, name: "Phòng 201" },
  { id: 5, name: "Phòng 202" },
  { id: 6, name: "Phòng 203" },
  { id: 7, name: "Phòng 301" },
  { id: 8, name: "Phòng 302" },
];

const weekdays = [
  { value: "Thứ 2", label: "Thứ 2" },
  { value: "Thứ 3", label: "Thứ 3" },
  { value: "Thứ 4", label: "Thứ 4" },
  { value: "Thứ 5", label: "Thứ 5" },
  { value: "Thứ 6", label: "Thứ 6" },
  { value: "Thứ 7", label: "Thứ 7" },
  { value: "CN", label: "Chủ nhật" },
];

const AddClass = () => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Giả lập việc tải dữ liệu
    const loadFakeData = setTimeout(() => {
      setTeachers(fakeTeachers);
      setCourses(fakeCourses);
      setRooms(fakeRooms);
      setLoading(false);
    }, 800);

    return () => clearTimeout(loadFakeData);
  }, []);

  const handleSubmit = (values) => {
    setSubmitting(true);

    // Xử lý dữ liệu từ form
    const formData = {
      ...values,
      startDate: values.dateRange[0].format("YYYY-MM-DD"),
      endDate: values.dateRange[1].format("YYYY-MM-DD"),
      schedule: `${values.weekdays.join(", ")} - ${values.timeRange[0].format(
        "HH:mm"
      )}-${values.timeRange[1].format("HH:mm")}`,
      status: "Sắp khai giảng", // Trạng thái mặc định cho lớp mới
      studentCount: 0, // Số học viên ban đầu
    };

    // Giả lập việc gửi dữ liệu lên server
    setTimeout(() => {
      console.log("Submitted data:", formData);
      message.success("Thêm lớp học mới thành công!");
      setSubmitting(false);
      navigate("/class-management");
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/class-management");
  };

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined /> Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/class-management">
              Quản lý lớp học
            </Breadcrumb.Item>
            <Breadcrumb.Item>Thêm lớp học mới</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Title level={4}>Thêm lớp học mới</Title>
            <Divider />

            <Spin spinning={loading || submitting}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  maxStudents: 10,
                }}
              >
                <Row gutter={24}>
                  {/* Thông tin cơ bản */}
                  <Col span={24}>
                    <Title level={5}>
                      <BookOutlined /> Thông tin cơ bản
                    </Title>
                  </Col>

                  <Col span={12}>
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
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="courseId"
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
                          <Option key={course.id} value={course.id}>
                            {course.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
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
                          <Option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
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
                  </Col>

                  {/* Thời gian và lịch học */}
                  <Col span={24} className="mt-4">
                    <Title level={5}>
                      <CalendarOutlined /> Thời gian và lịch học
                    </Title>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="dateRange"
                      label="Thời gian (bắt đầu - kết thúc)"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn thời gian!",
                        },
                      ]}
                    >
                      <RangePicker
                        locale={locale}
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="weekdays"
                      label="Các ngày học trong tuần"
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
                        options={weekdays}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="timeRange"
                      label="Thời gian học (bắt đầu - kết thúc)"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn giờ học!",
                        },
                      ]}
                    >
                      <TimePicker.RangePicker
                        format="HH:mm"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="roomId"
                      label="Phòng học"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn phòng học!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn phòng học">
                        {rooms.map((room) => (
                          <Option key={room.id} value={room.id}>
                            {room.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Thông tin bổ sung */}
                  <Col span={24} className="mt-4">
                    <Title level={5}>
                      <TeamOutlined /> Thông tin bổ sung
                    </Title>
                  </Col>

                  <Col span={24}>
                    <Form.Item name="description" label="Mô tả lớp học">
                      <TextArea
                        rows={4}
                        placeholder="Nhập mô tả và thông tin bổ sung về lớp học"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={submitting}
                    >
                      Tạo lớp học
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddClass;
