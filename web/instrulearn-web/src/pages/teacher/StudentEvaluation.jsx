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

// Updated sample data to match the images
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
      description: "Học chơi Guitar như nghệ sĩ chuyên nghiệp",
      skills: {
        basicTechnique: 0.0, // Kỹ thuật cơ bản - 0.0%
        rhythmDetail: 17.0, // Nhịp điệu & tiết tấu - 17.0%
        advancedTechnique: 17.0, // Kỹ thuật nâng cao - 17.0%
        expressionPerformance: 13.0, // Cảm xúc & diễn tấu - 13.0%
        musicReading: 15.0, // Đọc bản nhạc & khả năng ghi nhớ - 15.0%
      },
      skillWeights: {
        basicTechnique: 30, // Kỹ thuật cơ bản - 30%
        rhythmDetail: 20, // Nhịp điệu & tiết tấu - 20%
        advancedTechnique: 20, // Kỹ thuật nâng cao - 20%
        expressionPerformance: 15, // Cảm xúc & diễn tấu - 15%
        musicReading: 15, // Đọc bản nhạc & khả năng ghi nhớ - 15%
      },
      comments: {
        basicTechnique:
          "Chơi được cả hai tay động đều, đúng nhịp, Không bị cứng tay, di chuyển mượt mà",
        rhythmDetail:
          "Không bị lệch tốc độ, không ngập ngừng, Không tăng giảm tốc độ đột ngột khi hit cho 2 âm nhạc",
        advancedTechnique:
          "Không bị lạm dụng pedal, pedal không làm âm thanh bị rối, kiểm soát độ mượt và ngắt âm theo yêu cầu bài nhạc, thay đổi âm lượng, không chơi đều tầm tập thiếu cảm xúc",
        expressionPerformance:
          "Chơi có hồn, không chỉ đánh đúng nốt, Không bị lạc tone/lạc nhịp khi chơi cùng người khác",
        musicReading:
          "Có thể chơi theo bản nhạc chuẩn xác, Không cần nhìn sheet vẫn có thể chơi lại bài đã tập luyện",
      },
      overallScore: 62,
      evaluationLevel: "Fair",
      progress: 62,
      lastEvaluation: "2025-03-01",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      attendance: 90,
      description: "Học chơi Guitar cổ điển",
      skills: {
        basicTechnique: 24.0,
        rhythmDetail: 15.0,
        advancedTechnique: 14.0,
        expressionPerformance: 10.0,
        musicReading: 12.0,
      },
      skillWeights: {
        basicTechnique: 30,
        rhythmDetail: 20,
        advancedTechnique: 20,
        expressionPerformance: 15,
        musicReading: 15,
      },
      comments: {
        basicTechnique: "Kỹ thuật cơ bản tốt, tư thế đúng",
        rhythmDetail: "Nhịp điệu ổn định",
        advancedTechnique: "Cần cải thiện kỹ thuật nâng cao",
        expressionPerformance: "Biểu cảm chưa tốt",
        musicReading: "Đọc nhạc khá tốt",
      },
      overallScore: 75,
      evaluationLevel: "Good",
      progress: 75,
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
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      setData(evaluationData);
      setLoading(false);
    }, 1000);
  }, [classId]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    form.setFieldsValue({
      basicTechnique: student.comments.basicTechnique,
      rhythmDetail: student.comments.rhythmDetail,
      advancedTechnique: student.comments.advancedTechnique,
      expressionPerformance: student.comments.expressionPerformance,
      musicReading: student.comments.musicReading,
      basicTechniqueValue: student.skills.basicTechnique,
      rhythmDetailValue: student.skills.rhythmDetail,
      advancedTechniqueValue: student.skills.advancedTechnique,
      expressionPerformanceValue: student.skills.expressionPerformance,
      musicReadingValue: student.skills.musicReading,
    });
    setEditModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Calculate total score based on weights
      const totalScore =
        (values.basicTechniqueValue *
          selectedStudent.skillWeights.basicTechnique) /
          100 +
        (values.rhythmDetailValue * selectedStudent.skillWeights.rhythmDetail) /
          100 +
        (values.advancedTechniqueValue *
          selectedStudent.skillWeights.advancedTechnique) /
          100 +
        (values.expressionPerformanceValue *
          selectedStudent.skillWeights.expressionPerformance) /
          100 +
        (values.musicReadingValue * selectedStudent.skillWeights.musicReading) /
          100;

      const roundedTotal = Math.round(totalScore);

      // Determine evaluation level
      let evaluationLevel = "Poor";
      if (roundedTotal >= 90) evaluationLevel = "Excellent";
      else if (roundedTotal >= 80) evaluationLevel = "Very Good";
      else if (roundedTotal >= 70) evaluationLevel = "Good";
      else if (roundedTotal >= 60) evaluationLevel = "Fair";
      else if (roundedTotal >= 50) evaluationLevel = "Needs Improvement";

      setData((prev) => ({
        ...prev,
        students: prev.students.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                skills: {
                  basicTechnique: values.basicTechniqueValue,
                  rhythmDetail: values.rhythmDetailValue,
                  advancedTechnique: values.advancedTechniqueValue,
                  expressionPerformance: values.expressionPerformanceValue,
                  musicReading: values.musicReadingValue,
                },
                comments: {
                  basicTechnique: values.basicTechnique,
                  rhythmDetail: values.rhythmDetail,
                  advancedTechnique: values.advancedTechnique,
                  expressionPerformance: values.expressionPerformance,
                  musicReading: values.musicReading,
                },
                overallScore: roundedTotal,
                evaluationLevel: evaluationLevel,
                progress: roundedTotal,
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
          <Avatar src={record.avatar}>{record.name[0]}</Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.description}
            </Text>
          </div>
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
      title: "Kỹ thuật cơ bản",
      dataIndex: ["skills", "basicTechnique"],
      key: "basicTechnique",
      render: (value) => (
        <Tag color={getValueColor(value)}>{value.toFixed(1)}%</Tag>
      ),
      sorter: (a, b) => a.skills.basicTechnique - b.skills.basicTechnique,
    },
    {
      title: "Nhịp điệu & tiết tấu",
      dataIndex: ["skills", "rhythmDetail"],
      key: "rhythmDetail",
      render: (value) => (
        <Tag color={getValueColor(value)}>{value.toFixed(1)}%</Tag>
      ),
      sorter: (a, b) => a.skills.rhythmDetail - b.skills.rhythmDetail,
    },
    {
      title: "Kỹ thuật nâng cao",
      dataIndex: ["skills", "advancedTechnique"],
      key: "advancedTechnique",
      render: (value) => (
        <Tag color={getValueColor(value)}>{value.toFixed(1)}%</Tag>
      ),
      sorter: (a, b) => a.skills.advancedTechnique - b.skills.advancedTechnique,
    },
    {
      title: "Điểm tổng",
      dataIndex: "overallScore",
      key: "overallScore",
      render: (value, record) => (
        <Tag color={getEvaluationColor(record.evaluationLevel)}>
          {value}% - {record.evaluationLevel}
        </Tag>
      ),
      sorter: (a, b) => a.overallScore - b.overallScore,
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

  // Helper function to get color based on value
  const getValueColor = (value) => {
    if (value >= 80) return "green";
    if (value >= 60) return "blue";
    if (value >= 40) return "orange";
    return "red";
  };

  // Helper function to get color based on evaluation level
  const getEvaluationColor = (level) => {
    switch (level) {
      case "Excellent":
        return "green";
      case "Very Good":
        return "cyan";
      case "Good":
        return "blue";
      case "Fair":
        return "orange";
      case "Needs Improvement":
        return "red";
      case "Poor":
        return "magenta";
      default:
        return "blue";
    }
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
                        name="basicTechniqueValue"
                        label={
                          <Space>
                            <span>Kỹ thuật cơ bản</span>
                            <Tag>
                              {selectedStudent?.skillWeights.basicTechnique}%
                            </Tag>
                          </Space>
                        }
                        rules={[{ required: true }]}
                      >
                        <Input type="number" min={0} max={100} step={0.1} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="rhythmDetailValue"
                        label={
                          <Space>
                            <span>Nhịp điệu & tiết tấu</span>
                            <Tag>
                              {selectedStudent?.skillWeights.rhythmDetail}%
                            </Tag>
                          </Space>
                        }
                        rules={[{ required: true }]}
                      >
                        <Input type="number" min={0} max={100} step={0.1} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="advancedTechniqueValue"
                        label={
                          <Space>
                            <span>Kỹ thuật nâng cao</span>
                            <Tag>
                              {selectedStudent?.skillWeights.advancedTechnique}%
                            </Tag>
                          </Space>
                        }
                        rules={[{ required: true }]}
                      >
                        <Input type="number" min={0} max={100} step={0.1} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="expressionPerformanceValue"
                        label={
                          <Space>
                            <span>Cảm xúc & diễn tấu</span>
                            <Tag>
                              {
                                selectedStudent?.skillWeights
                                  .expressionPerformance
                              }
                              %
                            </Tag>
                          </Space>
                        }
                        rules={[{ required: true }]}
                      >
                        <Input type="number" min={0} max={100} step={0.1} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="musicReadingValue"
                        label={
                          <Space>
                            <span>Đọc bản nhạc & khả năng ghi nhớ</span>
                            <Tag>
                              {selectedStudent?.skillWeights.musicReading}%
                            </Tag>
                          </Space>
                        }
                        rules={[{ required: true }]}
                      >
                        <Input type="number" min={0} max={100} step={0.1} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Form.Item
                    name="basicTechnique"
                    label="Nhận xét về kỹ thuật cơ bản"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="rhythmDetail"
                    label="Nhận xét về nhịp điệu & tiết tấu"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="advancedTechnique"
                    label="Nhận xét về kỹ thuật nâng cao"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="expressionPerformance"
                    label="Nhận xét về cảm xúc & diễn tấu"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="musicReading"
                    label="Nhận xét về đọc bản nhạc & khả năng ghi nhớ"
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
