import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Table,
  Button,
  Tag,
  Row,
  Col,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Avatar,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Dữ liệu mẫu
const makeupRequestsData = {
  requests: [
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      studentAvatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      course: "Guitar cơ bản 1-1",
      originalClass: {
        date: "2025-03-20",
        time: "14:00",
        reason: "Học viên bị ốm",
        reasonType: "student",
      },
      makeupClass: {
        date: "2025-03-25",
        time: "15:00",
        address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      },
      status: "pending",
      adminComment: "",
      createdAt: "2025-03-18",
    },
    {
      id: 2,
      studentName: "Trần Thị B",
      studentAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      course: "Piano cơ bản 1-1",
      originalClass: {
        date: "2025-03-21",
        time: "10:00",
        reason: "Giáo viên có việc đột xuất",
        reasonType: "teacher",
      },
      makeupClass: {
        date: "2025-03-26",
        time: "10:00",
        address: "456 Lê Văn Lương, Quận 7, TP.HCM",
      },
      status: "approved",
      adminComment: "Đã xác nhận với phụ huynh",
      createdAt: "2025-03-19",
    },
  ],
  students: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      course: "Guitar cơ bản 1-1",
      regularTime: "14:00",
      regularDay: "Thứ 4",
      address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      course: "Piano cơ bản 1-1",
      regularTime: "10:00",
      regularDay: "Thứ 5",
      address: "456 Lê Văn Lương, Quận 7, TP.HCM",
    },
  ],
};

const MakeupClass = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("makeup");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setData(makeupRequestsData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateRequest = () => {
    setSelectedRequest(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRequest = (record) => {
    setSelectedRequest(record);
    form.setFieldsValue({
      studentId: record.studentName,
      reasonType: record.originalClass.reasonType,
      originalDate: dayjs(record.originalClass.date),
      originalTime: dayjs(record.originalClass.time, "HH:mm"),
      reason: record.originalClass.reason,
      makeupDate: dayjs(record.makeupClass.date),
      makeupTime: dayjs(record.makeupClass.time, "HH:mm"),
      address: record.makeupClass.address,
    });
    setModalVisible(true);
  };

  const handleDeleteRequest = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa đơn học bù này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        setData((prev) => ({
          ...prev,
          requests: prev.requests.filter((item) => item.id !== record.id),
        }));
        message.success("Đã xóa đơn học bù");
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const selectedStudent = data.students.find(
        (s) => s.id === values.studentId
      );
      const newRequest = {
        id: selectedRequest?.id || Date.now(),
        studentName: selectedStudent.name,
        studentAvatar: selectedStudent.avatar,
        course: selectedStudent.course,
        originalClass: {
          date: values.originalDate.format("YYYY-MM-DD"),
          time: values.originalTime.format("HH:mm"),
          reason: values.reason,
          reasonType: values.reasonType,
        },
        makeupClass: {
          date: values.makeupDate.format("YYYY-MM-DD"),
          time: values.makeupTime.format("HH:mm"),
          address: selectedStudent.address,
        },
        status: "pending",
        adminComment: "",
        createdAt: new Date().toISOString().split("T")[0],
      };

      if (selectedRequest) {
        setData((prev) => ({
          ...prev,
          requests: prev.requests.map((item) =>
            item.id === selectedRequest.id ? newRequest : item
          ),
        }));
        message.success("Đã cập nhật đơn học bù");
      } else {
        setData((prev) => ({
          ...prev,
          requests: [...prev.requests, newRequest],
        }));
        message.success("Đã tạo đơn học bù");
      }

      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.studentAvatar}>{text[0]}</Avatar>
          <div>
            <Text>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.course}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Buổi học gốc",
      key: "originalClass",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CalendarOutlined />
            {new Date(record.originalClass.date).toLocaleDateString("vi-VN")}
          </Space>
          <Space>
            <ClockCircleOutlined />
            {record.originalClass.time}
          </Space>
          <Tag
            color={
              record.originalClass.reasonType === "student"
                ? "orange"
                : "purple"
            }
          >
            {record.originalClass.reasonType === "student"
              ? "Học viên nghỉ"
              : "Giáo viên nghỉ"}
          </Tag>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.originalClass.reason}
          </Text>
        </Space>
      ),
    },
    {
      title: "Đề xuất học bù",
      key: "makeupClass",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CalendarOutlined />
            {new Date(record.makeupClass.date).toLocaleDateString("vi-VN")}
          </Space>
          <Space>
            <ClockCircleOutlined />
            {record.makeupClass.time}
          </Space>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.makeupClass.address}
          </Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {getStatusTag(record.status)}
          {record.adminComment && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.adminComment}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditRequest(record)}
              disabled={record.status !== "pending"}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteRequest(record)}
              disabled={record.status !== "pending"}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Helper function to get status tag
  const getStatusTag = (status) => {
    let color = "blue";
    let text = "Đang chờ duyệt";
    let icon = <ClockCircleOutlined />;

    switch (status) {
      case "approved":
        color = "green";
        text = "Đã được duyệt";
        icon = <CheckCircleOutlined />;
        break;
      case "rejected":
        color = "red";
        text = "Đã từ chối";
        icon = <CloseCircleOutlined />;
        break;
      default:
        break;
    }

    return (
      <Tag color={color} icon={icon}>
        {text}
      </Tag>
    );
  };

  return (
    <Layout className="min-h-screen">
      <TeacherSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <TeacherHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <Card className="mb-4">
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4}>
                  <CalendarOutlined className="mr-2" />
                  Gửi đơn học bù
                </Title>
                <Text type="secondary">
                  Gửi yêu cầu học bù đến trung tâm cho học viên học 1-1
                </Text>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleCreateRequest}
                >
                  Tạo đơn học bù
                </Button>
              </Col>
            </Row>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={data?.requests}
              rowKey="id"
              loading={loading}
            />
          </Card>

          <Modal
            title={
              <Space>
                <CalendarOutlined />
                {selectedRequest ? "Chỉnh sửa đơn học bù" : "Tạo đơn học bù"}
              </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setModalVisible(false)}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
              >
                {selectedRequest ? "Cập nhật" : "Gửi yêu cầu"}
              </Button>,
            ]}
            width={800}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="studentId"
                label="Học viên"
                rules={[{ required: true, message: "Vui lòng chọn học viên" }]}
              >
                <Select placeholder="Chọn học viên">
                  {data?.students.map((student) => (
                    <Option key={student.id} value={student.id}>
                      <Space>
                        <Avatar src={student.avatar} size="small">
                          {student.name[0]}
                        </Avatar>
                        <Text>{student.name}</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="reasonType"
                label="Người nghỉ"
                rules={[
                  { required: true, message: "Vui lòng chọn người nghỉ" },
                ]}
              >
                <Select placeholder="Chọn người nghỉ">
                  <Option value="student">Học viên nghỉ</Option>
                  <Option value="teacher">Giáo viên nghỉ</Option>
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="originalDate"
                    label="Ngày học cần bù"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                  >
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                      locale={locale}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="originalTime"
                    label="Giờ học cần bù"
                    rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                  >
                    <TimePicker
                      className="w-full"
                      format="HH:mm"
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="reason"
                label="Lý do học bù"
                rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập lý do chi tiết cho việc học bù"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="makeupDate"
                    label="Đề xuất ngày học bù"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                  >
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                      locale={locale}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="makeupTime"
                    label="Đề xuất giờ học bù"
                    rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                  >
                    <TimePicker
                      className="w-full"
                      format="HH:mm"
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MakeupClass;
