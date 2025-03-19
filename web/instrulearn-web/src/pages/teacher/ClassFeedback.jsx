import React, { useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Table,
  Select,
  Rate,
  Avatar,
  Divider,
  Button,
  Modal,
  Descriptions,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  TeamOutlined,
  StarOutlined,
  CalendarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Dữ liệu mẫu cho các lớp học
const classData = [
  {
    classId: 1,
    className: "Guitar cơ bản A1",
    totalStudents: 15,
    totalReviews: 12,
    averageRating: 4.5,
    startDate: "2025-01-15",
    endDate: "2025-04-15",
    status: "active",
  },
  {
    classId: 2,
    className: "Piano nâng cao B2",
    totalStudents: 10,
    totalReviews: 8,
    averageRating: 4.8,
    startDate: "2025-02-01",
    endDate: "2025-05-01",
    status: "active",
  },
  {
    classId: 3,
    className: "Violin trung cấp C1",
    totalStudents: 12,
    totalReviews: 10,
    averageRating: 4.2,
    startDate: "2025-01-20",
    endDate: "2025-04-20",
    status: "active",
  },
];

// Dữ liệu mẫu cho đánh giá của học viên
const studentReviewsData = {
  1: [
    {
      studentId: 1,
      name: "Nguyễn Văn A",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      rating: 5,
      comment: "Giáo viên dạy rất nhiệt tình và dễ hiểu",
      date: "2025-03-15",
      attendance: 95,
      progress: 85,
    },
    {
      studentId: 2,
      name: "Trần Thị B",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      rating: 4,
      comment: "Nội dung bài học rất hay và bổ ích",
      date: "2025-03-14",
      attendance: 90,
      progress: 92,
    },
  ],
  2: [
    {
      studentId: 3,
      name: "Lê Văn C",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      rating: 5,
      comment: "Phương pháp giảng dạy rất hiệu quả",
      date: "2025-03-16",
      attendance: 88,
      progress: 90,
    },
  ],
};

const ClassFeedback = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("feedback");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: "Chuyên cần",
      dataIndex: "attendance",
      key: "attendance",
      render: (attendance) => `${attendance}%`,
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => `${progress}%`,
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<MessageOutlined />}
          onClick={() => setSelectedStudent(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
            <div className="flex justify-between items-center">
              <Title level={4}>
                <StarOutlined className="mr-2" />
                Quản lý đánh giá lớp học
              </Title>
              <Select
                placeholder="Chọn lớp học"
                style={{ width: 300 }}
                onChange={handleClassSelect}
              >
                {classData.map((cls) => (
                  <Option key={cls.classId} value={cls.classId}>
                    {cls.className}
                  </Option>
                ))}
              </Select>
            </div>
            <Text type="secondary">
              Theo dõi và quản lý đánh giá từ học viên
            </Text>
          </Card>

          {selectedClass ? (
            <Card>
              <Row gutter={16} className="mb-4">
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={
                        classData.find((c) => c.classId === selectedClass)
                          ?.totalStudents
                      }
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Số đánh giá"
                      value={
                        classData.find((c) => c.classId === selectedClass)
                          ?.totalReviews
                      }
                      prefix={<StarOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Đánh giá trung bình"
                      value={
                        classData.find((c) => c.classId === selectedClass)
                          ?.averageRating
                      }
                      precision={1}
                      prefix={<StarOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Thời gian học"
                      value={`${new Date(
                        classData.find(
                          (c) => c.classId === selectedClass
                        )?.startDate
                      ).toLocaleDateString("vi-VN")} - ${new Date(
                        classData.find(
                          (c) => c.classId === selectedClass
                        )?.endDate
                      ).toLocaleDateString("vi-VN")}`}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Table
                columns={columns}
                dataSource={studentReviewsData[selectedClass]}
                rowKey="studentId"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} đánh giá`,
                }}
              />
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Text type="secondary">
                  Vui lòng chọn một lớp học để xem đánh giá
                </Text>
              </div>
            </Card>
          )}

          {/* Modal chi tiết đánh giá */}
          <Modal
            title="Chi tiết đánh giá"
            open={!!selectedStudent}
            onCancel={() => setSelectedStudent(null)}
            footer={null}
            width={600}
          >
            {selectedStudent && (
              <div>
                <div className="text-center mb-4">
                  <Avatar
                    size={80}
                    src={selectedStudent.avatar}
                    className="mb-2"
                  />
                  <Title level={4}>{selectedStudent.name}</Title>
                  <Rate disabled defaultValue={selectedStudent.rating} />
                </div>
                <Divider />
                <Descriptions column={1}>
                  <Descriptions.Item label="Nhận xét">
                    {selectedStudent.comment}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuyên cần">
                    {selectedStudent.attendance}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiến độ học tập">
                    {selectedStudent.progress}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đánh giá">
                    {new Date(selectedStudent.date).toLocaleDateString("vi-VN")}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassFeedback;
