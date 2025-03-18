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
  List,
  Avatar,
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
} from "@ant-design/icons";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Định nghĩa các slot thời gian
const timeSlots = [
  { id: 1, start: "07:00", end: "08:30" },
  { id: 2, start: "08:45", end: "10:15" },
  { id: 3, start: "10:30", end: "12:00" },
  { id: 4, start: "13:00", end: "14:30" },
  { id: 5, start: "14:45", end: "16:15" },
  { id: 6, start: "16:30", end: "18:00" },
  { id: 7, start: "18:15", end: "19:45" },
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

// Định nghĩa danh sách phòng học
const rooms = [
  {
    roomId: 1,
    roomName: "Phòng Piano 1",
    capacity: 10,
    status: "active",
  },
  {
    roomId: 2,
    roomName: "Phòng Guitar 1",
    capacity: 15,
    status: "active",
  },
  {
    roomId: 3,
    roomName: "Phòng Violin 1",
    capacity: 8,
    status: "active",
  },
];

// Định nghĩa danh sách học viên
const students = [
  {
    studentId: 1,
    studentName: "Lê Văn X",
    phone: "0909123456",
    email: "studentx@gmail.com",
  },
  {
    studentId: 2,
    studentName: "Phạm Thị Y",
    phone: "0909123457",
    email: "studenty@gmail.com",
  },
  {
    studentId: 3,
    studentName: "Trần Văn Z",
    phone: "0909123458",
    email: "studentz@gmail.com",
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
    roomId: 1,
    roomName: "Phòng Piano 1",
    date: "2024-03-20",
    startTime: "07:00",
    endTime: "08:30",
    status: "scheduled",
    enrolledStudents: [
      {
        studentId: 1,
        studentName: "Lê Văn X",
        attendance: null,
      },
    ],
    notes: "Buổi học đầu tiên",
  },
  {
    scheduleId: 2,
    teacherId: 2,
    teacherName: "Trần Thị B",
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    roomId: 2,
    roomName: "Phòng Guitar 1",
    date: "2024-03-20",
    startTime: "08:45",
    endTime: "10:15",
    status: "completed",
    enrolledStudents: [
      {
        studentId: 2,
        studentName: "Phạm Thị Y",
        attendance: "present",
      },
    ],
    notes: "Đã hoàn thành bài học",
  },
  {
    scheduleId: 3,
    teacherId: 3,
    teacherName: "Lê Văn C",
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    roomId: 3,
    roomName: "Phòng Violin 1",
    date: "2024-03-21",
    startTime: "13:00",
    endTime: "14:30",
    status: "scheduled",
    enrolledStudents: [
      {
        studentId: 3,
        studentName: "Trần Văn Z",
        attendance: null,
      },
    ],
    notes: "Chuẩn bị bài mới",
  },
];

const StudentCenterSchedule = () => {
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
      const selectedSlot = timeSlots.find(
        (slot) => slot.id === values.timeSlot
      );
      const teacher = teachers.find((t) => t.teacherId === values.teacherId);
      const course = courses.find((c) => c.courseId === values.courseId);
      const room = rooms.find((r) => r.roomId === values.roomId);

      const newSchedule = {
        scheduleId: schedules.length + 1,
        ...values,
        teacherName: teacher.teacherName,
        courseName: course.courseName,
        roomName: room.roomName,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        status: "scheduled",
        enrolledStudents: [
          {
            studentId: student.studentId,
            studentName: student.studentName,
            attendance: null,
          },
        ],
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
        studentId: record.enrolledStudents[0].studentId,
        courseId: record.courseId,
        teacherId: record.teacherId,
        roomId: record.roomId,
        date: dayjs(record.date),
        timeSlot: timeSlots.find(
          (slot) =>
            slot.start === record.startTime && slot.end === record.endTime
        )?.id,
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
      dataIndex: "enrolledStudents",
      key: "student",
      render: (students) => students[0]?.studentName,
      sorter: (a, b) =>
        a.enrolledStudents[0]?.studentName.localeCompare(
          b.enrolledStudents[0]?.studentName
        ),
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
      title: "Phòng học",
      dataIndex: "roomName",
      key: "roomName",
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
        <span>
          {record.startTime} - {record.endTime}
        </span>
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
        selectedMenu="student-schedule"
      />
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: "24px 16px", padding: 24 }}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>
                Quản lý lịch học của học viên tại Trung Tâm
              </Title>
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
                      {student.studentName}
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
                name="roomId"
                label="Phòng học"
                rules={[{ required: true, message: "Vui lòng chọn phòng học" }]}
              >
                <Select placeholder="Chọn phòng học">
                  {rooms.map((room) => (
                    <Option key={room.roomId} value={room.roomId}>
                      {room.roomName} (Sức chứa: {room.capacity} học viên)
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

              <Form.Item
                name="timeSlot"
                label="Thời gian học"
                rules={[
                  { required: true, message: "Vui lòng chọn thời gian học" },
                ]}
              >
                <Select placeholder="Chọn thời gian học">
                  {timeSlots.map((slot) => (
                    <Option key={slot.id} value={slot.id}>
                      {slot.start} - {slot.end}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

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
                    {selectedSchedule.enrolledStudents[0]?.studentName}
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
                        <HomeOutlined /> Phòng học
                      </>
                    }
                  >
                    {selectedSchedule.roomName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Thời gian
                      </>
                    }
                  >
                    {dayjs(selectedSchedule.date).format("DD/MM/YYYY")}{" "}
                    {selectedSchedule.startTime} - {selectedSchedule.endTime}
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

export default StudentCenterSchedule;
