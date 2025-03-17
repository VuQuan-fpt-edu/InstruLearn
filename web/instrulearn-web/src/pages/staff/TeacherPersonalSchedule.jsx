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
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  mockPersonalSchedules,
  mockTeachers,
  mockStudents,
  mockCourses,
  mockApiCall,
} from "../../utils/mockData";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const TeacherPersonalSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await mockApiCall(mockPersonalSchedules);
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Không thể tải danh sách lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (values) => {
    try {
      const newSchedule = {
        scheduleId: schedules.length + 1,
        ...values,
        teacherName: mockTeachers.find((t) => t.teacherId === values.teacherId)
          ?.teacherName,
        studentName: mockStudents.find((s) => s.studentId === values.studentId)
          ?.studentName,
        courseName: mockCourses.find((c) => c.courseId === values.courseId)
          ?.courseName,
        status: "scheduled",
        payment: {
          amount:
            mockCourses.find((c) => c.courseId === values.courseId)?.price || 0,
          status: "pending",
        },
      };

      await mockApiCall(newSchedule);
      message.success("Thêm lịch dạy thành công");
      setModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      console.error("Error adding schedule:", error);
      message.error("Thêm lịch dạy thất bại");
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
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
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
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
      render: (_, record) => record.startTime,
    },
    {
      title: "Thời lượng",
      key: "duration",
      render: (_, record) => <Tag color="blue">{record.duration} phút</Tag>,
      filters: [
        { text: "45 phút", value: "45" },
        { text: "90 phút", value: "90" },
        { text: "120 phút", value: "120" },
      ],
      onFilter: (value, record) => record.duration === value,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space>
          <Badge
            status={getStatusColor(record.status)}
            text={getStatusText(record.status)}
          />
        </Space>
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
              onClick={() => {
                /* Handle edit */
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                /* Handle delete */
              }}
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
        selectedMenu="teacher-personal-schedule"
      />
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: "24px 16px", padding: 24 }}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý lịch dạy tại nhà</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Thêm lịch dạy
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={schedules}
              rowKey="scheduleId"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} lịch dạy`,
              }}
            />
          </Card>

          <Modal
            title="Thêm lịch dạy mới"
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
                name="teacherId"
                label="Giáo viên"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
              >
                <Select placeholder="Chọn giáo viên">
                  {mockTeachers.map((teacher) => (
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
                  {mockStudents.map((student) => (
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
                  {mockCourses.map((course) => (
                    <Option key={course.courseId} value={course.courseId}>
                      {course.courseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày dạy"
                rules={[{ required: true, message: "Vui lòng chọn ngày dạy" }]}
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
                    <Option value="45">45 phút</Option>
                    <Option value="90">90 phút</Option>
                    <Option value="120">120 phút</Option>
                  </Select>
                </Form.Item>
              </Space>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ dạy học" />
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Form>
          </Modal>

          <Drawer
            title="Chi tiết lịch dạy"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={600}
          >
            {selectedSchedule && (
              <>
                <Descriptions title="Thông tin chung" bordered column={1}>
                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={getStatusColor(selectedSchedule.status)}
                      text={getStatusText(selectedSchedule.status)}
                    />
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin giáo viên</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Giáo viên
                      </>
                    }
                  >
                    {selectedSchedule.teacherName}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin học viên</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Học viên
                      </>
                    }
                  >
                    {selectedSchedule.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <EnvironmentOutlined /> Địa chỉ
                      </>
                    }
                  >
                    {selectedSchedule.address}
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
                        <ClockCircleOutlined /> Thời gian
                      </>
                    }
                  >
                    {dayjs(selectedSchedule.date).format("DD/MM/YYYY")}{" "}
                    {selectedSchedule.startTime} ({selectedSchedule.duration}{" "}
                    phút)
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú">
                    {selectedSchedule.notes || "Không có ghi chú"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherPersonalSchedule;
