import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
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
  Tag,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  DollarOutlined,
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

// Định nghĩa các khóa học
const courses = [
  {
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    courseType: "Piano",
    price: 2500000,
    duration: "3 tháng",
    schedule: "Thứ 2, 4, 6",
    teacherId: 1,
    teacherName: "Nguyễn Thị Ánh",
    roomId: "P001",
    roomName: "Phòng Piano 1",
  },
  {
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    courseType: "Guitar",
    price: 3000000,
    duration: "4 tháng",
    schedule: "Thứ 3, 5, 7",
    teacherId: 2,
    teacherName: "Trần Văn Bình",
    roomId: "P002",
    roomName: "Phòng Guitar 1",
  },
  {
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    courseType: "Violin",
    price: 2800000,
    duration: "3 tháng",
    schedule: "Thứ 2, 4, 6",
    teacherId: 3,
    teacherName: "Lê Thị Cúc",
    roomId: "P003",
    roomName: "Phòng Violin 1",
  },
];

// Định nghĩa các ca học
const timeSlots = [
  { id: 1, time: "07:00 - 08:30" },
  { id: 2, time: "08:45 - 10:15" },
  { id: 3, time: "10:30 - 12:00" },
  { id: 4, time: "13:00 - 14:30" },
  { id: 5, time: "14:45 - 16:15" },
  { id: 6, time: "16:30 - 18:00" },
  { id: 7, time: "18:15 - 19:45" },
];

// Định nghĩa dữ liệu mẫu cho đơn đăng ký
const initialRegistrations = [
  {
    registrationId: 1,
    studentName: "Nguyễn Văn A",
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    teacherName: "Nguyễn Thị Ánh",
    roomName: "Phòng Piano 1",
    timeSlot: "07:00 - 08:30",
    registrationDate: "2025-03-15",
    startDate: "2025-04-01",
    status: "pending",
    notes: "Học sinh đã có kinh nghiệm 1 năm học piano",
  },
  {
    registrationId: 2,
    studentName: "Trần Thị B",
    phone: "0907654321",
    email: "tranthib@gmail.com",
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    teacherName: "Trần Văn Bình",
    roomName: "Phòng Guitar 1",
    timeSlot: "14:45 - 16:15",
    registrationDate: "2025-03-16",
    startDate: "2025-04-01",
    status: "approved",
    notes: "Đã hoàn thành khóa cơ bản",
    approvalDate: "2025-03-17",
  },
  {
    registrationId: 3,
    studentName: "Phạm Văn D",
    phone: "0909876543",
    email: "phamvand@gmail.com",
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    teacherName: "Lê Thị Cúc",
    roomName: "Phòng Violin 1",
    timeSlot: "16:30 - 18:00",
    registrationDate: "2025-03-17",
    startDate: "2025-04-01",
    status: "rejected",
    notes: "Lớp đã đủ số lượng học viên",
    approvalDate: "2025-03-18",
  },
];

const CenterClassRegistration = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("center-registration");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRegistrations(initialRegistrations);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddRegistration = (values) => {
    try {
      const course = courses.find((c) => c.courseId === values.courseId);
      const timeSlot = timeSlots.find((t) => t.id === values.timeSlotId);

      const newRegistration = {
        registrationId: registrations.length + 1,
        ...values,
        courseName: course.courseName,
        teacherName: course.teacherName,
        roomName: course.roomName,
        timeSlot: timeSlot.time,
        registrationDate: dayjs().format("YYYY-MM-DD"),
        status: "pending",
      };

      setRegistrations([...registrations, newRegistration]);
      message.success("Thêm đơn đăng ký thành công");
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding registration:", error);
      message.error("Thêm đơn đăng ký thất bại");
    }
  };

  const showApprovalModal = (record) => {
    setSelectedRegistration(record);
    setApprovalModalVisible(true);
  };

  const handleApproveRegistration = (values) => {
    try {
      const updatedRegistrations = registrations.map((registration) =>
        registration.registrationId === selectedRegistration.registrationId
          ? {
              ...registration,
              status: "approved",
              approvalDate: dayjs().format("YYYY-MM-DD"),
              approvalNote: values.approvalNote,
            }
          : registration
      );
      setRegistrations(updatedRegistrations);
      message.success("Phê duyệt đơn đăng ký thành công");
      setApprovalModalVisible(false);
      approvalForm.resetFields();
    } catch (error) {
      console.error("Error approving registration:", error);
      message.error("Phê duyệt đơn đăng ký thất bại");
    }
  };

  const handleRejectRegistration = (values) => {
    try {
      const updatedRegistrations = registrations.map((registration) =>
        registration.registrationId === selectedRegistration.registrationId
          ? {
              ...registration,
              status: "rejected",
              approvalDate: dayjs().format("YYYY-MM-DD"),
              approvalNote: values.approvalNote,
            }
          : registration
      );
      setRegistrations(updatedRegistrations);
      message.success("Từ chối đơn đăng ký thành công");
      setApprovalModalVisible(false);
      approvalForm.resetFields();
    } catch (error) {
      console.error("Error rejecting registration:", error);
      message.error("Từ chối đơn đăng ký thất bại");
    }
  };

  const showDrawer = (record) => {
    setSelectedRegistration(record);
    setDrawerVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "processing";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusTag = (status) => {
    return status === "paid" ? (
      <Tag color="success">Đã thanh toán</Tag>
    ) : (
      <Tag color="warning">Chưa thanh toán</Tag>
    );
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
      title: "Phòng học",
      dataIndex: "roomName",
      key: "roomName",
    },
    {
      title: "Ca học",
      dataIndex: "timeSlot",
      key: "timeSlot",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
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
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Đã từ chối", value: "rejected" },
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
          {record.status === "pending" && (
            <Tooltip title="Phê duyệt/Từ chối">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => showApprovalModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

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
              <Title level={4}>Quản lý đơn đăng ký học tại trung tâm</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Thêm đơn đăng ký
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={registrations}
              rowKey="registrationId"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} đơn`,
              }}
            />
          </Card>

          <Modal
            title="Thêm đơn đăng ký mới"
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
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddRegistration}
            >
              <Divider>Thông tin học viên</Divider>
              <Form.Item
                name="studentName"
                label="Tên học viên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên học viên" },
                ]}
              >
                <Input />
              </Form.Item>

              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                  style={{ width: "300px" }}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                  style={{ width: "300px" }}
                >
                  <Input />
                </Form.Item>
              </Space>

              <Divider>Thông tin khóa học</Divider>
              <Form.Item
                name="courseId"
                label="Khóa học"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              >
                <Select placeholder="Chọn khóa học">
                  {courses.map((course) => (
                    <Option key={course.courseId} value={course.courseId}>
                      {course.courseName} - {course.teacherName} -{" "}
                      {course.roomName} - {course.schedule}
                    </Option>
                  ))}
                </Select>
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

              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker
                  locale={locale}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Phê duyệt đơn đăng ký"
            open={approvalModalVisible}
            onCancel={() => {
              setApprovalModalVisible(false);
              approvalForm.resetFields();
            }}
            footer={[
              <Button
                key="reject"
                danger
                icon={<CloseOutlined />}
                onClick={() =>
                  handleRejectRegistration(approvalForm.getFieldsValue())
                }
              >
                Từ chối
              </Button>,
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() =>
                  handleApproveRegistration(approvalForm.getFieldsValue())
                }
              >
                Phê duyệt
              </Button>,
            ]}
          >
            <Form form={approvalForm} layout="vertical">
              <Form.Item name="approvalNote" label="Ghi chú">
                <TextArea
                  rows={4}
                  placeholder="Nhập ghi chú cho quyết định phê duyệt/từ chối"
                />
              </Form.Item>
            </Form>
          </Modal>

          <Drawer
            title="Chi tiết đơn đăng ký"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={600}
          >
            {selectedRegistration && (
              <>
                <Descriptions title="Thông tin học viên" bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <UserOutlined /> Học viên
                      </>
                    }
                  >
                    {selectedRegistration.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Số điện thoại
                      </>
                    }
                  >
                    {selectedRegistration.phone}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined /> Email
                      </>
                    }
                  >
                    {selectedRegistration.email}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin khóa học</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Khóa học
                      </>
                    }
                  >
                    {selectedRegistration.courseName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <TeamOutlined /> Giáo viên
                      </>
                    }
                  >
                    {selectedRegistration.teacherName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <HomeOutlined /> Phòng học
                      </>
                    }
                  >
                    {selectedRegistration.roomName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Ca học
                      </>
                    }
                  >
                    {selectedRegistration.timeSlot}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Ngày bắt đầu
                      </>
                    }
                  >
                    {dayjs(selectedRegistration.startDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Trạng thái đơn</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <InfoCircleOutlined /> Trạng thái
                      </>
                    }
                  >
                    <Badge
                      status={getStatusColor(selectedRegistration.status)}
                      text={getStatusText(selectedRegistration.status)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Ngày đăng ký
                      </>
                    }
                  >
                    {dayjs(selectedRegistration.registrationDate).format(
                      "DD/MM/YYYY"
                    )}
                  </Descriptions.Item>
                  {selectedRegistration.approvalDate && (
                    <Descriptions.Item
                      label={
                        <>
                          <CalendarOutlined /> Ngày phê duyệt
                        </>
                      }
                    >
                      {dayjs(selectedRegistration.approvalDate).format(
                        "DD/MM/YYYY"
                      )}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider orientation="left">Ghi chú</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Ghi chú">
                    {selectedRegistration.notes || "Không có ghi chú"}
                  </Descriptions.Item>
                  {selectedRegistration.approvalNote && (
                    <Descriptions.Item label="Ghi chú phê duyệt">
                      {selectedRegistration.approvalNote}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CenterClassRegistration;
