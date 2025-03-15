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
  Spin,
  Badge,
  Tabs,
  Avatar,
  List,
  Progress,
  Divider,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Dữ liệu giả cho các lớp học của giáo viên
const fakeTeacherClasses = [
  {
    classId: 1,
    className: "Guitar cơ bản buổi tối",
    courseName: "Guitar cơ bản",
    startDate: "2025-02-15",
    endDate: "2025-05-15",
    studentCount: 15,
    status: "Đang hoạt động",
    room: "Phòng 101",
    maxStudents: 20,
    completionPercentage: 45,
    nextSession: "2025-03-11 18:00",
    description:
      "Lớp học guitar cơ bản dành cho người mới bắt đầu, tập trung vào kỹ thuật cơ bản và hòa âm.",
  },
  {
    classId: 6,
    className: "Ukulele cơ bản cuối tuần",
    courseName: "Ukulele cơ bản",
    startDate: "2025-03-15",
    endDate: "2025-06-15",
    studentCount: 18,
    status: "Đang hoạt động",
    room: "Phòng 104",
    maxStudents: 20,
    completionPercentage: 25,
    nextSession: "2025-03-10 9:00",
    description:
      "Khóa học ukulele cơ bản, phù hợp cho mọi lứa tuổi, dạy các kỹ thuật cơ bản và các bài hát đơn giản.",
  },
  {
    classId: 10,
    className: "Guitar đệm hát tối",
    courseName: "Guitar đệm hát",
    startDate: "2025-03-05",
    endDate: "2025-06-05",
    studentCount: 13,
    status: "Đang hoạt động",
    room: "Phòng 105",
    maxStudents: 15,
    completionPercentage: 30,
    nextSession: "2025-03-11 19:30",
    description:
      "Khóa học tập trung vào kỹ thuật đệm hát, học các mẫu hợp âm và nhịp điệu phổ biến trong âm nhạc hiện đại.",
  },
];

// Dữ liệu giả cho học sinh trong lớp
const fakeStudents = [
  {
    studentId: 101,
    name: "Nguyễn Văn A",
    age: 18,
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    attendance: 90,
    performance: 85,
    joinDate: "2025-02-15",
    notes: "Học sinh tích cực, nhanh tiếp thu.",
  },
  {
    studentId: 102,
    name: "Trần Thị B",
    age: 20,
    phone: "0912345678",
    email: "tranthib@gmail.com",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    attendance: 95,
    performance: 80,
    joinDate: "2025-02-15",
    notes: "Chăm chỉ, thường xuyên tham gia hoạt động nhóm.",
  },
  {
    studentId: 103,
    name: "Lê Văn C",
    age: 22,
    phone: "0923456789",
    email: "levanc@gmail.com",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    attendance: 75,
    performance: 70,
    joinDate: "2025-02-20",
    notes: "Cần cải thiện về chuyên cần, có tiềm năng.",
  },
  {
    studentId: 104,
    name: "Phạm Thị D",
    age: 19,
    phone: "0934567890",
    email: "phamthid@gmail.com",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    attendance: 85,
    performance: 90,
    joinDate: "2025-02-18",
    notes: "Học sinh xuất sắc, có năng khiếu âm nhạc.",
  },
  {
    studentId: 105,
    name: "Hoàng Văn E",
    age: 21,
    phone: "0945678901",
    email: "hoangvane@gmail.com",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    attendance: 80,
    performance: 75,
    joinDate: "2025-02-25",
    notes: "Cần thêm thời gian luyện tập ở nhà.",
  },
];

// Dữ liệu giả cho lịch sử buổi học
const fakeLessons = [
  {
    lessonId: 1,
    date: "2025-02-15",
    topic: "Giới thiệu cơ bản và cách cầm đàn",
    attendance: 15,
    notes:
      "Buổi học đầu tiên, giới thiệu tổng quan về khóa học và các kỹ thuật cơ bản.",
  },
  {
    lessonId: 2,
    date: "2025-02-17",
    topic: "Các hợp âm cơ bản",
    attendance: 14,
    notes: "Học các hợp âm C, G, D, Em và Am. Học sinh tích cực tham gia.",
  },
  {
    lessonId: 3,
    date: "2025-02-19",
    topic: "Kỹ thuật đánh gẩy cơ bản",
    attendance: 15,
    notes: "Tập trung vào kỹ thuật ngón tay phải, các mẫu đánh gẩy thông dụng.",
  },
  {
    lessonId: 4,
    date: "2025-02-22",
    topic: "Bài tập ứng dụng 1",
    attendance: 13,
    notes: "Thực hành với bài hát đơn giản, 2 học sinh vắng có phép.",
  },
  {
    lessonId: 5,
    date: "2025-02-24",
    topic: "Luyện chuyển hợp âm",
    attendance: 15,
    notes: "Tập trung vào việc chuyển hợp âm mượt mà, học sinh tiến bộ rõ rệt.",
  },
];

const TeacherClassManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("courses");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessonsHistory, setLessonsHistory] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const navigate = useNavigate();
  const { classId } = useParams();

  useEffect(() => {
    // Giả lập việc tải dữ liệu
    const loadFakeData = setTimeout(() => {
      setClasses(fakeTeacherClasses);
      setLoading(false);

      // Nếu có classId từ URL, hiển thị chi tiết lớp đó
      if (classId) {
        const classDetail = fakeTeacherClasses.find(
          (c) => c.classId === parseInt(classId)
        );
        if (classDetail) {
          setSelectedClass(classDetail);
          setStudents(fakeStudents);
          setLessonsHistory(fakeLessons);
          setViewMode("detail");
        }
      }
    }, 800);

    return () => clearTimeout(loadFakeData);
  }, [classId]);

  const fetchClasses = () => {
    setLoading(true);
    // Giả lập việc tải lại dữ liệu
    setTimeout(() => {
      setClasses(fakeTeacherClasses);
      setLoading(false);
      message.success("Đã tải lại danh sách lớp học");
    }, 800);
  };

  const handleViewClassDetail = (record) => {
    setSelectedClass(record);
    setStudents(fakeStudents);
    setLessonsHistory(fakeLessons);
    setViewMode("detail");
    navigate(`/teacher/student-list`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedClass(null);
    navigate("/teacher/classes");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "green";
      case "Sắp khai giảng":
        return "blue";
      case "Đã kết thúc":
        return "gray";
      case "Tạm ngưng":
        return "orange";
      default:
        return "default";
    }
  };

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tên lớp học",
      dataIndex: "className",
      key: "className",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.className.localeCompare(b.className),
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Học viên",
      key: "students",
      render: (_, record) => (
        <Tooltip
          title={`${record.studentCount}/${record.maxStudents} học viên`}
        >
          <Badge
            count={`${record.studentCount}/${record.maxStudents}`}
            style={{
              backgroundColor:
                record.studentCount >= record.maxStudents ? "#f50" : "#108ee9",
            }}
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.studentCount - b.studentCount,
    },
    {
      title: "Tiến độ",
      key: "progress",
      render: (_, record) => (
        <Progress percent={record.completionPercentage} size="small" />
      ),
      sorter: (a, b) => a.completionPercentage - b.completionPercentage,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: [
        { text: "Đang hoạt động", value: "Đang hoạt động" },
        { text: "Sắp khai giảng", value: "Sắp khai giảng" },
        { text: "Đã kết thúc", value: "Đã kết thúc" },
        { text: "Tạm ngưng", value: "Tạm ngưng" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewClassDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render chi tiết lớp học
  const renderClassDetail = () => {
    if (!selectedClass) return null;

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Button onClick={handleBackToList}>← Quay lại</Button>
            <Title level={4}>{selectedClass.className}</Title>
            <Tag color={getStatusColor(selectedClass.status)}>
              {selectedClass.status}
            </Tag>
          </Space>
          <Space>
            <Button>Điểm danh</Button>
            <Button type="primary">Báo cáo</Button>
          </Space>
        </div>

        {/* Thông tin tổng quan về lớp */}
        <Card className="mb-4">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Tổng số học viên"
                value={selectedClass.studentCount}
                prefix={<TeamOutlined />}
                suffix={`/${selectedClass.maxStudents}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Tiến độ khóa học"
                value={selectedClass.completionPercentage}
                prefix={<BookOutlined />}
                suffix="%"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Thời gian còn lại"
                value={Math.round(
                  (new Date(selectedClass.endDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )}
                suffix="ngày"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Buổi học tiếp theo"
                value={new Date(selectedClass.nextSession).toLocaleString(
                  "vi-VN"
                )}
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-2">
                <Text strong>Phòng:</Text> {selectedClass.room}
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-2">
                <Text strong>Ngày bắt đầu:</Text>{" "}
                {new Date(selectedClass.startDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="mb-2">
                <Text strong>Ngày kết thúc:</Text>{" "}
                {new Date(selectedClass.endDate).toLocaleDateString("vi-VN")}
              </div>
            </Col>
          </Row>

          <Divider />

          <div>
            <Text strong>Mô tả khóa học:</Text>
            <p>{selectedClass.description}</p>
          </div>
        </Card>

        {/* Tabs cho danh sách học viên và lịch sử buổi học */}
        <Tabs defaultActiveKey="students">
          <TabPane tab="Danh sách học viên" key="students">
            <Card>
              <List
                itemLayout="horizontal"
                dataSource={students}
                renderItem={(student) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Điểm danh">
                        <Button
                          icon={
                            student.attendance > 80 ? (
                              <CheckCircleOutlined />
                            ) : (
                              <CloseCircleOutlined />
                            )
                          }
                          type={student.attendance > 80 ? "text" : "text"}
                          style={{
                            color: student.attendance > 80 ? "green" : "red",
                          }}
                        />
                      </Tooltip>,
                      <Space>
                        <Text type="secondary">Chuyên cần:</Text>
                        <Progress
                          percent={student.attendance}
                          size="small"
                          style={{ width: 80 }}
                          status={
                            student.attendance < 80 ? "exception" : "active"
                          }
                        />
                      </Space>,
                      <Space>
                        <Text type="secondary">Kết quả:</Text>
                        <Progress
                          percent={student.performance}
                          size="small"
                          style={{ width: 80 }}
                          status={
                            student.performance < 70 ? "exception" : "active"
                          }
                        />
                      </Space>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={student.avatar} size="large" />}
                      title={student.name}
                      description={
                        <Space direction="vertical" size={1}>
                          <Space>
                            <PhoneOutlined /> {student.phone}
                          </Space>
                          <Space>
                            <MailOutlined /> {student.email}
                          </Space>
                          <Text type="secondary">
                            Ngày tham gia:{" "}
                            {new Date(student.joinDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </Space>
                      }
                    />
                    <div>
                      <Text type="secondary">Ghi chú:</Text>
                      <div>{student.notes}</div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
          <TabPane tab="Lịch sử buổi học" key="lessons">
            <Card>
              <List
                itemLayout="horizontal"
                dataSource={lessonsHistory}
                renderItem={(lesson) => (
                  <List.Item
                    actions={[
                      <Space>
                        <Text type="secondary">Điểm danh:</Text>
                        <Badge
                          count={`${lesson.attendance}/${selectedClass.maxStudents}`}
                          style={{
                            backgroundColor:
                              lesson.attendance >=
                              selectedClass.maxStudents * 0.8
                                ? "#52c41a"
                                : "#f5222d",
                          }}
                        />
                      </Space>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <CalendarOutlined />
                          <span>
                            {new Date(lesson.date).toLocaleDateString("vi-VN")}
                          </span>
                          <Tag color="blue">{lesson.topic}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text strong>Ghi chú:</Text> {lesson.notes}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    );
  };

  // Render danh sách lớp học
  const renderClassList = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Lớp học của tôi</Title>
          <Space>
            <Input
              placeholder="Tìm kiếm lớp học..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={fetchClasses} />
            </Tooltip>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredClasses}
            rowKey="classId"
            onRow={(record) => ({
              onClick: () => handleViewClassDetail(record),
              className: "cursor-pointer hover:bg-gray-50",
            })}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Tổng cộng ${total} lớp học`,
            }}
          />
        </Spin>
      </div>
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
          <Card>
            {viewMode === "list" ? renderClassList() : renderClassDetail()}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherClassManagement;
