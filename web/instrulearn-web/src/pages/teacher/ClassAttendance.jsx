import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Avatar,
  message,
  Checkbox,
  Tooltip,
  Divider,
  Row,
  Col,
  Statistic,
  Input,
  Modal,
  Form,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  SaveOutlined,
  RollbackOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Dữ liệu mẫu cho danh sách học viên
const studentData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    phone: "0901234567",
    attendance: true,
    note: "",
    history: [
      { date: "2025-03-10", status: true },
      { date: "2025-03-08", status: true },
      { date: "2025-03-06", status: false },
    ],
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    phone: "0912345678",
    attendance: false,
    note: "Báo nghỉ ốm",
    history: [
      { date: "2025-03-10", status: true },
      { date: "2025-03-08", status: true },
      { date: "2025-03-06", status: true },
    ],
  },
  // Thêm học viên khác...
];

const ClassAttendance = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("center-schedule");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { classId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setStudents(studentData);
      setClassInfo({
        className: "Guitar cơ bản A1",
        date: "2025-03-15",
        time: "08:00 - 09:30",
        room: "Phòng 101",
        totalStudents: studentData.length,
        presentStudents: studentData.filter((s) => s.attendance).length,
      });
      setLoading(false);
    }, 1000);
  }, [classId]);

  const handleAttendanceChange = (studentId, checked) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attendance: checked } : student
      )
    );
  };

  const handleEditNote = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({ note: student.note });
    setNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    form.validateFields().then((values) => {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id
            ? { ...student, note: values.note }
            : student
        )
      );
      setNoteModalVisible(false);
      message.success("Đã lưu ghi chú thành công");
    });
  };

  const handleSaveAttendance = () => {
    message.success("Đã lưu điểm danh thành công");
    navigate("/teacher/center-schedule");
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Điểm danh",
      key: "attendance",
      render: (_, record) => (
        <Checkbox
          checked={record.attendance}
          onChange={(e) => handleAttendanceChange(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Lịch sử điểm danh",
      key: "history",
      render: (_, record) => (
        <Space>
          {record.history.map((h, index) => (
            <Tooltip key={index} title={h.date}>
              <Tag color={h.status ? "green" : "red"}>
                {h.status ? "C" : "V"}
              </Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: "Ghi chú",
      key: "note",
      width: 300,
      render: (_, record) => (
        <Space>
          <Paragraph ellipsis={{ rows: 2 }} className="mb-0">
            {record.note || "Chưa có ghi chú"}
          </Paragraph>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditNote(record)}
          />
        </Space>
      ),
    },
  ];

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
          {classInfo && (
            <>
              <Card className="mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Title level={4}>{classInfo.className}</Title>
                    <Space className="mt-2">
                      <CalendarOutlined />
                      <Text>{classInfo.date}</Text>
                      <ClockCircleOutlined />
                      <Text>{classInfo.time}</Text>
                      <TeamOutlined />
                      <Text>{classInfo.room}</Text>
                    </Space>
                  </div>
                  <Space>
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={() => navigate("/teacher/center-schedule")}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveAttendance}
                    >
                      Lưu điểm danh
                    </Button>
                  </Space>
                </div>
              </Card>

              <Row gutter={16} className="mb-4">
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={classInfo.totalStudents}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Có mặt"
                      value={classInfo.presentStudents}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Vắng mặt"
                      value={
                        classInfo.totalStudents - classInfo.presentStudents
                      }
                      prefix={<UserOutlined />}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card>
                <Table
                  columns={columns}
                  dataSource={students}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              </Card>

              <Modal
                title={
                  <Space>
                    <EditOutlined />
                    Chỉnh sửa ghi chú
                  </Space>
                }
                open={noteModalVisible}
                onCancel={() => setNoteModalVisible(false)}
                onOk={handleSaveNote}
                okText="Lưu"
                cancelText="Hủy"
              >
                <Form form={form}>
                  <Form.Item name="note" label="Ghi chú">
                    <TextArea
                      rows={4}
                      placeholder="Nhập ghi chú về học viên..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassAttendance;
