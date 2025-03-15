import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Table,
  Rate,
  Input,
  Button,
  Tag,
  Row,
  Col,
  Statistic,
  Avatar,
  Divider,
  Modal,
  Form,
  Select,
  Progress,
  Tooltip,
  message,
} from "antd";
import {
  UserOutlined,
  StarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import { useParams } from "react-router-dom";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Dữ liệu mẫu cho đánh giá học viên
const evaluationData = {
  classInfo: {
    className: "Guitar cơ bản A1",
    totalStudents: 15,
    averageScore: 8.5,
    evaluationDate: "2025-03-15",
  },
  students: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      attendance: 95,
      skills: {
        technique: 4,
        rhythm: 4.5,
        theory: 3.5,
        performance: 4,
      },
      overallScore: 8.5,
      progress: 85,
      strengths: "Kỹ thuật tốt, nhịp điệu chuẩn",
      weaknesses: "Cần cải thiện về lý thuyết",
      recommendations: "Tập trung vào học lý thuyết cơ bản",
      lastEvaluation: "2025-03-01",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      attendance: 90,
      skills: {
        technique: 3.5,
        rhythm: 4,
        theory: 4.5,
        performance: 3.5,
      },
      overallScore: 8.0,
      progress: 80,
      strengths: "Lý thuyết tốt, hiểu bài nhanh",
      weaknesses: "Cần luyện tập kỹ thuật nhiều hơn",
      recommendations: "Dành thêm thời gian luyện tập kỹ thuật",
      lastEvaluation: "2025-03-01",
    },
  ],
};

const StudentEvaluation = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("evaluation");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();
  const { classId } = useParams();

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setData(evaluationData);
      setLoading(false);
    }, 1000);
  }, [classId]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    form.setFieldsValue({
      technique: student.skills.technique,
      rhythm: student.skills.rhythm,
      theory: student.skills.theory,
      performance: student.skills.performance,
      strengths: student.strengths,
      weaknesses: student.weaknesses,
      recommendations: student.recommendations,
    });
    setEditModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const overallScore =
        ((values.technique +
          values.rhythm +
          values.theory +
          values.performance) /
          4) *
        2;

      setData((prev) => ({
        ...prev,
        students: prev.students.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                skills: {
                  technique: values.technique,
                  rhythm: values.rhythm,
                  theory: values.theory,
                  performance: values.performance,
                },
                overallScore,
                strengths: values.strengths,
                weaknesses: values.weaknesses,
                recommendations: values.recommendations,
                lastEvaluation: new Date().toISOString().split("T")[0],
              }
            : student
        ),
      }));

      setEditModalVisible(false);
      message.success("Đã lưu đánh giá thành công");
    });
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Chuyên cần",
      dataIndex: "attendance",
      key: "attendance",
      render: (value) => (
        <Tooltip title={`${value}%`}>
          <Progress
            percent={value}
            size="small"
            status={value >= 80 ? "success" : "exception"}
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.attendance - b.attendance,
    },
    {
      title: "Kỹ thuật",
      dataIndex: ["skills", "technique"],
      key: "technique",
      render: (value) => <Rate disabled allowHalf value={value} />,
      sorter: (a, b) => a.skills.technique - b.skills.technique,
    },
    {
      title: "Nhịp điệu",
      dataIndex: ["skills", "rhythm"],
      key: "rhythm",
      render: (value) => <Rate disabled allowHalf value={value} />,
      sorter: (a, b) => a.skills.rhythm - b.skills.rhythm,
    },
    {
      title: "Lý thuyết",
      dataIndex: ["skills", "theory"],
      key: "theory",
      render: (value) => <Rate disabled allowHalf value={value} />,
      sorter: (a, b) => a.skills.theory - b.skills.theory,
    },
    {
      title: "Biểu diễn",
      dataIndex: ["skills", "performance"],
      key: "performance",
      render: (value) => <Rate disabled allowHalf value={value} />,
      sorter: (a, b) => a.skills.performance - b.skills.performance,
    },
    {
      title: "Điểm tổng",
      dataIndex: "overallScore",
      key: "overallScore",
      render: (value) => (
        <Tag color={value >= 8 ? "green" : value >= 6.5 ? "blue" : "orange"}>
          {value.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.overallScore - b.overallScore,
    },
    {
      title: "Tiến bộ",
      dataIndex: "progress",
      key: "progress",
      render: (value) => (
        <Tooltip title={`${value}%`}>
          <Progress
            percent={value}
            size="small"
            status={value >= 80 ? "success" : "normal"}
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.progress - b.progress,
    },
    {
      title: "Đánh giá gần nhất",
      dataIndex: "lastEvaluation",
      key: "lastEvaluation",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.lastEvaluation) - new Date(b.lastEvaluation),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          type="primary"
        >
          Đánh giá
        </Button>
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
          {data && (
            <>
              <Card className="mb-4">
                <Title level={4}>
                  <StarOutlined className="mr-2" />
                  {data.classInfo.className} - Đánh giá học viên
                </Title>
                <Text type="secondary">
                  Đánh giá và theo dõi sự tiến bộ của học viên
                </Text>
              </Card>

              <Row gutter={16} className="mb-4">
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Tổng số học viên"
                      value={data.classInfo.totalStudents}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Điểm trung bình"
                      value={data.classInfo.averageScore}
                      prefix={<BarChartOutlined />}
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Ngày đánh giá"
                      value={new Date(
                        data.classInfo.evaluationDate
                      ).toLocaleDateString("vi-VN")}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Card>
                <Table
                  columns={columns}
                  dataSource={data.students}
                  rowKey="id"
                  loading={loading}
                />
              </Card>

              <Modal
                title={
                  <Space>
                    <StarOutlined />
                    Đánh giá học viên: {selectedStudent?.name}
                  </Space>
                }
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setEditModalVisible(false)}>
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                  >
                    Lưu đánh giá
                  </Button>,
                ]}
                width={800}
              >
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="technique"
                        label="Kỹ thuật"
                        rules={[{ required: true }]}
                      >
                        <Rate allowHalf />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="rhythm"
                        label="Nhịp điệu"
                        rules={[{ required: true }]}
                      >
                        <Rate allowHalf />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="theory"
                        label="Lý thuyết"
                        rules={[{ required: true }]}
                      >
                        <Rate allowHalf />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="performance"
                        label="Biểu diễn"
                        rules={[{ required: true }]}
                      >
                        <Rate allowHalf />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="strengths"
                    label="Điểm mạnh"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="weaknesses"
                    label="Điểm cần cải thiện"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="recommendations"
                    label="Đề xuất/Khuyến nghị"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
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

export default StudentEvaluation;
