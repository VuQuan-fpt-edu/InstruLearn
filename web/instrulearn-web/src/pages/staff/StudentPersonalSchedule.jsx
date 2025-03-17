import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
  Badge,
  Tooltip,
  Drawer,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  HomeOutlined,
  UserOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Định nghĩa các thời lượng học
const durations = [
  { id: 1, value: 45, label: "45 phút" },
  { id: 2, value: 90, label: "90 phút" },
  { id: 3, value: 120, label: "120 phút" },
];

// Định nghĩa danh sách giáo viên
const teachers = [
  {
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    specialization: "Piano",
    status: "active",
  },
  {
    teacherId: 2,
    teacherName: "Trần Thị B",
    specialization: "Guitar",
    status: "active",
  },
  {
    teacherId: 3,
    teacherName: "Lê Văn C",
    specialization: "Violin",
    status: "active",
  },
];

// Định nghĩa danh sách khóa học
const courses = [
  {
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    courseType: "Piano",
  },
  {
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    courseType: "Guitar",
  },
  {
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    courseType: "Violin",
  },
];

// Định nghĩa danh sách học viên
const students = [
  {
    studentId: 1,
    studentName: "Lê Văn X",
    phone: "0909123456",
    email: "studentx@gmail.com",
    address: "123 Nguyễn Văn Linh, Q7, TP.HCM",
  },
  {
    studentId: 2,
    studentName: "Phạm Thị Y",
    phone: "0909123457",
    email: "studenty@gmail.com",
    address: "456 Lê Văn Việt, Q9, TP.HCM",
  },
  {
    studentId: 3,
    studentName: "Trần Văn Z",
    phone: "0909123458",
    email: "studentz@gmail.com",
    address: "789 Võ Văn Tần, Q3, TP.HCM",
  },
];

// Định nghĩa dữ liệu mẫu cho lịch học
const initialSchedules = [
  {
    scheduleId: 1,
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    studentId: 1,
    studentName: "Lê Văn X",
    studentAddress: "123 Nguyễn Văn Linh, Q7, TP.HCM",
    date: "2024-03-20",
    startTime: "14:00",
    duration: 90,
    status: "scheduled",
    notes: "Buổi học đầu tiên",
  },
  {
    scheduleId: 2,
    teacherId: 2,
    teacherName: "Trần Thị B",
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    studentId: 2,
    studentName: "Phạm Thị Y",
    studentAddress: "456 Lê Văn Việt, Q9, TP.HCM",
    date: "2024-03-20",
    startTime: "16:00",
    duration: 120,
    status: "completed",
    notes: "Đã hoàn thành bài học",
  },
  {
    scheduleId: 3,
    teacherId: 3,
    teacherName: "Lê Văn C",
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    studentId: 3,
    studentName: "Trần Văn Z",
    studentAddress: "789 Võ Văn Tần, Q3, TP.HCM",
    date: "2024-03-21",
    startTime: "09:00",
    duration: 45,
    status: "scheduled",
    notes: "Chuẩn bị bài mới",
  },
];

const PersonalTeachingSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();

  // Khởi tạo dữ liệu khi component được tải
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSchedules(initialSchedules);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddSchedule = (values) => {
    try {
      const student = students.find((s) => s.studentId === values.studentId);
      const teacher = teachers.find((t) => t.teacherId === values.teacherId);
      const course = courses.find((c) => c.courseId === values.courseId);

      const newSchedule = {
        scheduleId: schedules.length + 1,
        ...values,
        teacherName: teacher.teacherName,
        courseName: course.courseName,
        studentName: student.studentName,
        studentAddress: student.address,
        startTime: dayjs(values.startTime).format("HH:mm"),
        status: "scheduled",
      };

      setSchedules([...schedules, newSchedule]);
      message.success("Thêm lịch học thành công");
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding schedule:", error);
      message.error("Thêm lịch học thất bại");
    }
  };

  const handleCancelSchedule = (record) => {
    try {
      const updatedSchedules = schedules.map((schedule) =>
        schedule.scheduleId === record.scheduleId
          ? { ...schedule, status: "cancelled" }
          : schedule
      );
      setSchedules(updatedSchedules);
      message.success("Hủy lịch học thành công");
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      message.error("Hủy lịch học thất bại");
    }
  };

  const handleEditSchedule = (record) => {
    try {
      form.setFieldsValue({
        studentId: record.studentId,
        courseId: record.courseId,
        teacherId: record.teacherId,
        date: dayjs(record.date),
        startTime: dayjs(record.startTime, "HH:mm"),
        duration: record.duration,
        notes: record.notes,
      });
      setModalVisible(true);
    } catch (error) {
      console.error("Error editing schedule:", error);
      message.error("Không thể chỉnh sửa lịch học");
    }
  };

  const showDrawer = (record) => {
    setSelectedSchedule(record);
    setDrawerVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "processing";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: "Địa chỉ",
      dataIndex: "studentAddress",
      key: "studentAddress",
      ellipsis: true,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <Space>
          <span>{record.startTime}</span>
          <Tag color="blue">{record.duration} phút</Tag>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Badge
          status={getStatusColor(record.status)}
          text={getStatusText(record.status)}
        />
      ),
      filters: [
        { text: "Đã lên lịch", value: "scheduled" },
        { text: "Đã hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSchedule(record)}
              disabled={record.status !== "scheduled"}
            />
          </Tooltip>
          <Tooltip title="Hủy lịch">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleCancelSchedule(record)}
              disabled={record.status !== "scheduled"}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="personal-teaching"
      />
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: "24px 16px", padding: 24 }}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý lịch dạy 1-1 tại nhà</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Thêm lịch học
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={schedules}
              rowKey="scheduleId"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} lịch học`,
              }}
            />
          </Card>

          <Modal
            title="Thêm lịch học mới"
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={() => form.submit()}>
                Thêm
              </Button>,
            ]}
            width={720}
          >
            <Form form={form} layout="vertical" onFinish={handleAddSchedule}>
              <Form.Item
                name="studentId"
                label="Học viên"
                rules={[{ required: true, message: "Vui lòng chọn học viên" }]}
              >
                <Select
                  placeholder="Chọn học viên"
                  onChange={(value) => {
                    const student = students.find((s) => s.studentId === value);
                    setSelectedStudent(student);
                  }}
                >
                  {students.map((student) => (
                    <Option key={student.studentId} value={student.studentId}>
                      {student.studentName} - {student.address}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="courseId"
                label="Khóa học"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              >
                <Select placeholder="Chọn khóa học">
                  {courses.map((course) => (
                    <Option key={course.courseId} value={course.courseId}>
                      {course.courseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="teacherId"
                label="Giáo viên"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
              >
                <Select placeholder="Chọn giáo viên">
                  {teachers.map((teacher) => (
                    <Option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.teacherName} - {teacher.specialization}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày học"
                rules={[{ required: true, message: "Vui lòng chọn ngày học" }]}
              >
                <DatePicker
                  locale={locale}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Form.Item
                  name="startTime"
                  label="Thời gian bắt đầu"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thời gian bắt đầu",
                    },
                  ]}
                  style={{ width: "300px" }}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="duration"
                  label="Thời lượng"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thời lượng buổi học",
                    },
                  ]}
                  style={{ width: "300px" }}
                >
                  <Select placeholder="Chọn thời lượng">
                    {durations.map((duration) => (
                      <Option key={duration.id} value={duration.value}>
                        {duration.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Space>

              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Form>
          </Modal>

          <Drawer
            title="Chi tiết lịch học"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={600}
          >
            {selectedSchedule && (
              <>
                <Descriptions title="Thông tin học viên" bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <UserOutlined /> Học viên
                      </>
                    }
                  >
                    {selectedSchedule.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <HomeOutlined /> Địa chỉ
                      </>
                    }
                  >
                    {selectedSchedule.studentAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={getStatusColor(selectedSchedule.status)}
                      text={getStatusText(selectedSchedule.status)}
                    />
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin buổi học</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Khóa học
                      </>
                    }
                  >
                    {selectedSchedule.courseName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <TeamOutlined /> Giáo viên
                      </>
                    }
                  >
                    {selectedSchedule.teacherName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Ngày học
                      </>
                    }
                  >
                    {dayjs(selectedSchedule.date).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <FieldTimeOutlined /> Thời gian
                      </>
                    }
                  >
                    {selectedSchedule.startTime} ({selectedSchedule.duration}{" "}
                    phút)
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Ghi chú</Divider>
                <p>{selectedSchedule.notes || "Không có ghi chú"}</p>
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PersonalTeachingSchedule;
