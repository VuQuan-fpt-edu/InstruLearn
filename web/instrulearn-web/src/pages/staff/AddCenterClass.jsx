import React, { useState } from "react";
import {
  Layout,
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  InputNumber,
  message,
  TimePicker,
  DatePicker,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
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
const { TextArea } = Input;

// Dữ liệu mẫu cho các lựa chọn
const instruments = [
  "Piano",
  "Guitar",
  "Violin",
  "Drums",
  "Flute",
  "Saxophone",
  "Cello",
  "Trumpet",
];

const teachers = [
  { id: 1, name: "Nguyễn Thị Ánh", specialty: "Piano" },
  { id: 2, name: "Trần Văn Bình", specialty: "Guitar" },
  { id: 3, name: "Lê Thị Cúc", specialty: "Violin" },
  { id: 4, name: "Phạm Hoàng Dương", specialty: "Drums" },
  { id: 5, name: "Hoàng Thị Emilia", specialty: "Flute" },
];

const rooms = [
  { id: "P001", name: "Phòng Piano 1", capacity: 10 },
  { id: "P002", name: "Phòng Guitar 1", capacity: 12 },
  { id: "P003", name: "Phòng Violin 1", capacity: 8 },
  { id: "P004", name: "Phòng Drums 1", capacity: 6 },
  { id: "P005", name: "Phòng Flute 1", capacity: 8 },
];

const timeSlots = [
  { id: 1, time: "07:00 - 08:30" },
  { id: 2, time: "08:45 - 10:15" },
  { id: 3, time: "10:30 - 12:00" },
  { id: 4, time: "13:00 - 14:30" },
  { id: 5, time: "14:45 - 16:15" },
  { id: 6, time: "16:30 - 18:00" },
  { id: 7, time: "18:15 - 19:45" },
];

const AddCenterClass = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("add-center-class");
  const [form] = Form.useForm();
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleSubmit = async (values) => {
    try {
      // Xử lý dữ liệu trước khi gửi
      const formData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        timeSlot: timeSlots.find((slot) => slot.id === values.timeSlotId).time,
        teacherName: teachers.find((t) => t.id === values.teacherId).name,
        roomName: rooms.find((r) => r.id === values.roomId).name,
      };

      // TODO: Gọi API để lưu dữ liệu
      console.log("Form data:", formData);

      message.success("Thêm lớp học thành công");
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Thêm lớp học thất bại");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="add-center-class"
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
              <Title level={4}>Thêm lớp học mới</Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="max-w-3xl"
            >
              <Divider orientation="left">
                <BookOutlined /> Thông tin lớp học
              </Divider>

              <Form.Item
                name="className"
                label="Tên lớp học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên lớp học" },
                ]}
              >
                <Input placeholder="Nhập tên lớp học" />
              </Form.Item>

              <Form.Item
                name="instrument"
                label="Nhạc cụ"
                rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
              >
                <Select
                  placeholder="Chọn nhạc cụ"
                  onChange={(value) => setSelectedInstrument(value)}
                >
                  {instruments.map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="teacherId"
                label="Giáo viên"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
              >
                <Select
                  placeholder="Chọn giáo viên"
                  onChange={(value) => setSelectedTeacher(value)}
                >
                  {teachers
                    .filter(
                      (teacher) =>
                        !selectedInstrument ||
                        teacher.specialty === selectedInstrument
                    )
                    .map((teacher) => (
                      <Option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.specialty}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="roomId"
                label="Phòng học"
                rules={[{ required: true, message: "Vui lòng chọn phòng học" }]}
              >
                <Select
                  placeholder="Chọn phòng học"
                  onChange={(value) => setSelectedRoom(value)}
                >
                  {rooms.map((room) => (
                    <Option key={room.id} value={room.id}>
                      {room.name} (Sức chứa: {room.capacity} người)
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
                    message: "Vui lòng nhập số học viên tối đa",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={
                    selectedRoom
                      ? rooms.find((r) => r.id === selectedRoom).capacity
                      : 20
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="timeSlotId"
                label="Ca học"
                rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
              >
                <Select placeholder="Chọn ca học">
                  {timeSlots.map((slot) => (
                    <Option key={slot.id} value={slot.id}>
                      {slot.time}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Space style={{ width: "100%" }} size="large">
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  ]}
                  style={{ flex: 1 }}
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  ]}
                  style={{ flex: 1 }}
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Space>

              <Form.Item
                name="price"
                label="Học phí (VNĐ)"
                rules={[{ required: true, message: "Vui lòng nhập học phí" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>

              <Form.Item name="description" label="Mô tả lớp học">
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về lớp học"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Thêm lớp học
                  </Button>
                  <Button onClick={() => form.resetFields()}>Làm mới</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddCenterClass;
