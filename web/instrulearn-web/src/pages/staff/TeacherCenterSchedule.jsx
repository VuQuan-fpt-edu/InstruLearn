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
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Helper function to generate fake data
const generateFakeScheduleData = () => {
  const teachers = [
    "Nguyễn Văn A",
    "Trần Thị B",
    "Lê Văn C",
    "Phạm Thị D",
    "Hoàng Văn E",
  ];
  const courses = [
    "Guitar Cơ Bản",
    "Piano Nâng Cao",
    "Trống Jazz",
    "Violin Cho Trẻ",
    "Saxophone Chuyên Nghiệp",
  ];
  const rooms = [
    "Phòng 101",
    "Phòng 102",
    "Phòng 103",
    "Phòng 201",
    "Phòng 202",
  ];
  //   const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  return Array.from({ length: 50 }, (_, index) => {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));

    const startHour = Math.floor(Math.random() * 8 + 8);
    const endHour = startHour + 2;

    return {
      id: index + 1,
      teacher: teachers[Math.floor(Math.random() * teachers.length)],
      course: courses[Math.floor(Math.random() * courses.length)],
      room: rooms[Math.floor(Math.random() * rooms.length)],
      //   day: days[Math.floor(Math.random() * days.length)],
      startTime: `${startHour.toString().padStart(2, "0")}:00`,
      endTime: `${endHour.toString().padStart(2, "0")}:00`,
      slot: `Slot ${Math.floor(Math.random() * 5 + 1)}`,
      date: randomDate.toISOString().split("T")[0],
      status: ["Đã xác nhận", "Chờ duyệt", "Hủy"][
        Math.floor(Math.random() * 3)
      ],
    };
  });
};

const TeacherCenterSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("teacher-schedule");
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Simulate data loading
  useEffect(() => {
    const fakeData = generateFakeScheduleData();
    setSchedules(fakeData);
    setFilteredSchedules(fakeData);
    setLoading(false);
  }, []);

  // Search and filter logic
  useEffect(() => {
    const filtered = schedules.filter(
      (schedule) =>
        schedule.teacher.toLowerCase().includes(searchText.toLowerCase()) ||
        schedule.course.toLowerCase().includes(searchText.toLowerCase()) ||
        schedule.room.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSchedules(filtered);
  }, [searchText, schedules]);

  const handleAddSchedule = (values) => {
    const newSchedule = {
      id: schedules.length + 1,
      ...values,
      startTime: values.time[0].format("HH:mm"),
      endTime: values.time[1].format("HH:mm"),
      date: values.date.format("YYYY-MM-DD"),
      status: "Chờ duyệt",
    };

    setSchedules([...schedules, newSchedule]);
    setFilteredSchedules([...schedules, newSchedule]);
    setModalVisible(false);
    form.resetFields();
    message.success("Thêm lịch dạy thành công");
  };

  const handleEditSchedule = (values) => {
    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === editingSchedule.id
        ? {
            ...schedule,
            ...values,
            startTime: values.time[0].format("HH:mm"),
            endTime: values.time[1].format("HH:mm"),
            date: values.date.format("YYYY-MM-DD"),
          }
        : schedule
    );

    setSchedules(updatedSchedules);
    setFilteredSchedules(updatedSchedules);
    setModalVisible(false);
    setEditingSchedule(null);
    form.resetFields();
    message.success("Cập nhật lịch dạy thành công");
  };

  const handleDeleteSchedule = (id) => {
    const updatedSchedules = schedules.filter((schedule) => schedule.id !== id);
    setSchedules(updatedSchedules);
    setFilteredSchedules(updatedSchedules);
    message.success("Xóa lịch dạy thành công");
  };

  const columns = [
    {
      title: "Giáo Viên",
      dataIndex: "teacher",
      key: "teacher",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Khóa Học",
      dataIndex: "course",
      key: "course",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Phòng Học",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    // {
    //   title: "Thứ",
    //   dataIndex: "day",
    //   key: "day",
    // },
    {
      title: "Giờ Học",
      key: "time",
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Slot",
      dataIndex: "slot",
      key: "slot",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "Đã xác nhận": "green",
          "Chờ duyệt": "orange",
          Hủy: "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingSchedule(record);
                form.setFieldsValue({
                  teacher: record.teacher,
                  course: record.course,
                  room: record.room,
                  day: record.day,
                  slot: record.slot,
                  date: dayjs(record.date),
                  time: [
                    dayjs(record.startTime, "HH:mm"),
                    dayjs(record.endTime, "HH:mm"),
                  ],
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteSchedule(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="teacher-schedules"
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
              <Title level={4}>Quản Lý Lịch Giảng Dạy Trung Tâm</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Tooltip title="Làm mới">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setLoading(true);
                      const fakeData = generateFakeScheduleData();
                      setSchedules(fakeData);
                      setFilteredSchedules(fakeData);
                      setLoading(false);
                    }}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingSchedule(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}
                >
                  Thêm Lịch
                </Button>
              </Space>
            </div>

            <Table
              loading={loading}
              columns={columns}
              dataSource={filteredSchedules}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng cộng ${total} lịch dạy`,
              }}
            />
          </Card>

          {/* Schedule Modal */}
          <Modal
            title={editingSchedule ? "Chỉnh Sửa Lịch Dạy" : "Thêm Lịch Dạy"}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setEditingSchedule(null);
            }}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={
                editingSchedule ? handleEditSchedule : handleAddSchedule
              }
            >
              <Form.Item
                name="teacher"
                label="Giáo Viên"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
              >
                <Select placeholder="Chọn giáo viên">
                  {[
                    "Nguyễn Văn A",
                    "Trần Thị B",
                    "Lê Văn C",
                    "Phạm Thị D",
                    "Hoàng Văn E",
                  ].map((teacher) => (
                    <Option key={teacher} value={teacher}>
                      {teacher}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="course"
                label="Khóa Học"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              >
                <Select placeholder="Chọn khóa học">
                  {[
                    "Guitar Cơ Bản",
                    "Piano Nâng Cao",
                    "Trống Jazz",
                    "Violin Cho Trẻ",
                    "Saxophone Chuyên Nghiệp",
                  ].map((course) => (
                    <Option key={course} value={course}>
                      {course}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="room"
                label="Phòng Học"
                rules={[{ required: true, message: "Vui lòng chọn phòng học" }]}
              >
                <Select placeholder="Chọn phòng học">
                  {[
                    "Phòng 101",
                    "Phòng 102",
                    "Phòng 103",
                    "Phòng 201",
                    "Phòng 202",
                  ].map((room) => (
                    <Option key={room} value={room}>
                      {room}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* <Form.Item
                name="day"
                label="Thứ"
                rules={[{ required: true, message: "Vui lòng chọn thứ" }]}
              >
                <Select placeholder="Chọn thứ">
                  {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"].map(
                    (day) => (
                      <Option key={day} value={day}>
                        {day}
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item> */}

              <Form.Item
                name="slot"
                label="Slot"
                rules={[{ required: true, message: "Vui lòng chọn slot" }]}
              >
                <Select placeholder="Chọn slot">
                  {["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"].map(
                    (slot) => (
                      <Option key={slot} value={slot}>
                        {slot}
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker className="w-full" placeholder="Chọn ngày" />
              </Form.Item>

              <Form.Item
                name="time"
                label="Giờ Học"
                rules={[{ required: true, message: "Vui lòng chọn giờ học" }]}
              >
                <TimePicker.RangePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingSchedule ? "Cập Nhật" : "Thêm Mới"}
                  </Button>
                  <Button
                    onClick={() => {
                      setModalVisible(false);
                      setEditingSchedule(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherCenterSchedule;
