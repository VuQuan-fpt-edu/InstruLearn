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

// Định nghĩa dữ liệu mẫu cho đơn học bù
const initialRequests = [
  {
    requestId: 1,
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    studentId: 1,
    studentName: "Lê Văn X",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    originalDate: "2024-03-15",
    originalTime: "14:00",
    proposedDate: "2024-03-20",
    proposedTime: "15:00",
    duration: 90,
    reason: "Giáo viên bị ốm",
    status: "pending",
    requestDate: "2024-03-14",
  },
  {
    requestId: 2,
    teacherId: 2,
    teacherName: "Trần Thị B",
    studentId: 2,
    studentName: "Phạm Thị Y",
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    originalDate: "2024-03-16",
    originalTime: "09:00",
    proposedDate: "2024-03-21",
    proposedTime: "09:00",
    duration: 120,
    reason: "Sự cố giao thông",
    status: "approved",
    requestDate: "2024-03-15",
    approvalDate: "2024-03-15",
    approvalNote: "Đã xác nhận với phụ huynh",
  },
  {
    requestId: 3,
    teacherId: 3,
    teacherName: "Lê Văn C",
    studentId: 3,
    studentName: "Trần Văn Z",
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    originalDate: "2024-03-17",
    originalTime: "16:00",
    proposedDate: "2024-03-22",
    proposedTime: "16:00",
    duration: 45,
    reason: "Lịch trình cá nhân",
    status: "rejected",
    requestDate: "2024-03-16",
    approvalDate: "2024-03-16",
    approvalNote: "Thời gian đề xuất không phù hợp với lịch học viên",
  },
];

const MakeupClassRequests = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRequests(initialRequests);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddRequest = (values) => {
    try {
      const student = students.find((s) => s.studentId === values.studentId);
      const teacher = teachers.find((t) => t.teacherId === values.teacherId);
      const course = courses.find((c) => c.courseId === values.courseId);

      const newRequest = {
        requestId: requests.length + 1,
        ...values,
        teacherName: teacher.teacherName,
        studentName: student.studentName,
        courseName: course.courseName,
        originalTime: dayjs(values.originalTime).format("HH:mm"),
        proposedTime: dayjs(values.proposedTime).format("HH:mm"),
        status: "pending",
        requestDate: dayjs().format("YYYY-MM-DD"),
      };

      setRequests([...requests, newRequest]);
      message.success("Thêm đơn học bù thành công");
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding request:", error);
      message.error("Thêm đơn học bù thất bại");
    }
  };

  const showApprovalModal = (record) => {
    setSelectedRequest(record);
    setApprovalModalVisible(true);
  };

  const handleApproveRequest = (values) => {
    try {
      const updatedRequests = requests.map((request) =>
        request.requestId === selectedRequest.requestId
          ? {
              ...request,
              status: "approved",
              approvalDate: dayjs().format("YYYY-MM-DD"),
              approvalNote: values.approvalNote,
            }
          : request
      );
      setRequests(updatedRequests);
      message.success("Phê duyệt đơn học bù thành công");
      setApprovalModalVisible(false);
      approvalForm.resetFields();
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Phê duyệt đơn học bù thất bại");
    }
  };

  const handleRejectRequest = (values) => {
    try {
      const updatedRequests = requests.map((request) =>
        request.requestId === selectedRequest.requestId
          ? {
              ...request,
              status: "rejected",
              approvalDate: dayjs().format("YYYY-MM-DD"),
              approvalNote: values.approvalNote,
            }
          : request
      );
      setRequests(updatedRequests);
      message.success("Từ chối đơn học bù thành công");
      setApprovalModalVisible(false);
      approvalForm.resetFields();
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error("Từ chối đơn học bù thất bại");
    }
  };

  const showDrawer = (record) => {
    setSelectedRequest(record);
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

  const columns = [
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
    },
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
    },
    {
      title: "Buổi học cũ",
      key: "originalSchedule",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(record.originalDate).format("DD/MM/YYYY")}</span>
          <Tag color="blue">{record.originalTime}</Tag>
        </Space>
      ),
    },
    {
      title: "Đề xuất học bù",
      key: "proposedSchedule",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(record.proposedDate).format("DD/MM/YYYY")}</span>
          <Tag color="green">{record.proposedTime}</Tag>
        </Space>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration} phút`,
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
        selectedMenu="makeup-requests"
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
              <Title level={4}>Quản lý đơn xin học bù</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Thêm đơn học bù
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={requests}
              rowKey="requestId"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} đơn`,
              }}
            />
          </Card>

          <Modal
            title="Thêm đơn học bù mới"
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
            <Form form={form} layout="vertical" onFinish={handleAddRequest}>
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
                name="studentId"
                label="Học viên"
                rules={[{ required: true, message: "Vui lòng chọn học viên" }]}
              >
                <Select placeholder="Chọn học viên">
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

              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Form.Item
                  name="originalDate"
                  label="Ngày học cũ"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày học cũ" },
                  ]}
                  style={{ width: "300px" }}
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="originalTime"
                  label="Giờ học cũ"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ học cũ" },
                  ]}
                  style={{ width: "300px" }}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Space>

              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Form.Item
                  name="proposedDate"
                  label="Ngày học bù"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày học bù" },
                  ]}
                  style={{ width: "300px" }}
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="proposedTime"
                  label="Giờ học bù"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ học bù" },
                  ]}
                  style={{ width: "300px" }}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Space>

              <Form.Item
                name="duration"
                label="Thời lượng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời lượng buổi học",
                  },
                ]}
              >
                <Select placeholder="Chọn thời lượng">
                  {durations.map((duration) => (
                    <Option key={duration.id} value={duration.value}>
                      {duration.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="reason"
                label="Lý do học bù"
                rules={[
                  { required: true, message: "Vui lòng nhập lý do học bù" },
                ]}
              >
                <TextArea rows={3} placeholder="Nhập lý do học bù" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Phê duyệt đơn học bù"
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
                onClick={() => approvalForm.submit()}
              >
                Từ chối
              </Button>,
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() =>
                  handleApproveRequest(approvalForm.getFieldsValue())
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
            title="Chi tiết đơn học bù"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={600}
          >
            {selectedRequest && (
              <>
                <Descriptions title="Thông tin chung" bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <TeamOutlined /> Giáo viên
                      </>
                    }
                  >
                    {selectedRequest.teacherName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <UserOutlined /> Học viên
                      </>
                    }
                  >
                    {selectedRequest.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Khóa học
                      </>
                    }
                  >
                    {selectedRequest.courseName}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin buổi học</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Buổi học cũ
                      </>
                    }
                  >
                    {dayjs(selectedRequest.originalDate).format("DD/MM/YYYY")}{" "}
                    {selectedRequest.originalTime}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Đề xuất học bù
                      </>
                    }
                  >
                    {dayjs(selectedRequest.proposedDate).format("DD/MM/YYYY")}{" "}
                    {selectedRequest.proposedTime}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Thời lượng
                      </>
                    }
                  >
                    {selectedRequest.duration} phút
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
                      status={getStatusColor(selectedRequest.status)}
                      text={getStatusText(selectedRequest.status)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Ngày yêu cầu
                      </>
                    }
                  >
                    {dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  {selectedRequest.approvalDate && (
                    <Descriptions.Item
                      label={
                        <>
                          <CalendarOutlined /> Ngày phê duyệt
                        </>
                      }
                    >
                      {dayjs(selectedRequest.approvalDate).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider orientation="left">Lý do và ghi chú</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Lý do học bù">
                    {selectedRequest.reason}
                  </Descriptions.Item>
                  {selectedRequest.approvalNote && (
                    <Descriptions.Item label="Ghi chú phê duyệt">
                      {selectedRequest.approvalNote}
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

export default MakeupClassRequests;
