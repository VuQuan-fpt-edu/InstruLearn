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
  Modal,
  Form,
  Switch,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;

const TeacherEvaluationQuestionManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(
    "teacher-evaluation-question-management"
  );
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([{ optionText: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editOptions, setEditOptions] = useState([]);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/questions/active"
      );
      setQuestions(response.data.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách câu hỏi đánh giá giáo viên");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    form.resetFields();
    setOptions([{ optionText: "" }]);
    setIsModalVisible(true);
  };

  const handleAddOption = () => {
    setOptions([...options, { optionText: "" }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length === 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].optionText = value;
    setOptions(newOptions);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isDuplicate = questions.some(
        (q) =>
          q.questionText.trim().toLowerCase() ===
          values.questionText.trim().toLowerCase()
      );
      if (isDuplicate) {
        form.setFields([
          {
            name: "questionText",
            errors: ["Nội dung câu hỏi này đã tồn tại!"],
          },
        ]);
        return;
      }
      if (options.some((opt) => !opt.optionText.trim())) {
        message.error("Vui lòng nhập đầy đủ các lựa chọn");
        return;
      }
      setIsSubmitting(true);
      const data = {
        questionText: values.questionText,
        displayOrder: 0,
        isRequired: true,
        isActive: true,
        options: options.map((opt) => ({
          evaluationOptionId: 0,
          evaluationQuestionId: 0,
          optionText: opt.optionText,
        })),
      };
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/create-questions",
        data
      );
      if (response.data?.isSucceed) {
        message.success("Tạo câu hỏi đánh giá thành công");
        setIsModalVisible(false);
        fetchQuestions();
      } else {
        message.error(response.data?.message || "Tạo câu hỏi thất bại");
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = (record) => {
    setEditingQuestion(record);
    editForm.setFieldsValue({ questionText: record.questionText });
    setEditOptions(record.options.map((opt) => ({ ...opt })));
    setIsEditModalVisible(true);
  };

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editOptions];
    newOptions[index].optionText = value;
    setEditOptions(newOptions);
  };

  const handleAddEditOption = () => {
    setEditOptions([...editOptions, { evaluationOptionId: 0, optionText: "" }]);
  };

  const handleRemoveEditOption = (index) => {
    if (editOptions.length === 1) return;
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const isDuplicate = questions.some(
        (q) =>
          q.questionText.trim().toLowerCase() ===
            values.questionText.trim().toLowerCase() &&
          q.evaluationQuestionId !== editingQuestion.evaluationQuestionId
      );
      if (isDuplicate) {
        editForm.setFields([
          {
            name: "questionText",
            errors: ["Nội dung câu hỏi này đã tồn tại!"],
          },
        ]);
        return;
      }
      if (editOptions.some((opt) => !opt.optionText.trim())) {
        message.error("Vui lòng nhập đầy đủ các lựa chọn");
        return;
      }
      setIsEditSubmitting(true);
      const data = {
        questionText: values.questionText,
        displayOrder: editingQuestion.displayOrder,
        isRequired: true,
        isActive: true,
        options: editOptions.map((opt) => ({
          evaluationOptionId: opt.evaluationOptionId,
          optionText: opt.optionText,
        })),
      };
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/update-question/${editingQuestion.evaluationQuestionId}`,
        data
      );
      if (response.data?.isSucceed) {
        message.success("Cập nhật câu hỏi thành công");
        setIsEditModalVisible(false);
        fetchQuestions();
      } else {
        message.error(response.data?.message || "Cập nhật câu hỏi thất bại");
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "evaluationQuestionId",
      key: "evaluationQuestionId",
      width: 60,
      align: "center",
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "questionText",
      key: "questionText",
      width: 350,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Bắt buộc",
      dataIndex: "isRequired",
      key: "isRequired",
      width: 100,
      align: "center",
      render: (val) =>
        val ? (
          <Tag color="#faad14" style={{ fontWeight: 600, fontSize: 13 }}>
            Bắt buộc
          </Tag>
        ) : (
          <Tag color="#d9d9d9">Không</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      align: "center",
      render: (val) =>
        val ? (
          <Tag color="green" style={{ fontSize: 13, padding: "4px 16px" }}>
            Đang hoạt động
          </Tag>
        ) : (
          <Tag color="#bfbfbf" style={{ fontSize: 13, padding: "4px 16px" }}>
            Ngưng hoạt động
          </Tag>
        ),
    },
    {
      title: "Lựa chọn",
      dataIndex: "options",
      key: "options",
      render: (opts) => (
        <Space wrap>
          {opts.map((opt) => (
            <Tag
              key={opt.evaluationOptionId}
              color="#e6f7ff"
              style={{
                color: "#1890ff",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 16,
                padding: "2px 12px",
              }}
              icon={<EditOutlined />}
            >
              {opt.optionText}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEditQuestion(record)}
          size="small"
          type="primary"
        >
          Sửa
        </Button>
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
          style={{ marginTop: "64px" }}
        >
          <Card style={{ borderRadius: 12, padding: 16 }}>
            <div className="flex justify-between items-center mb-4">
              <Title level={3} style={{ margin: 0 }}>
                Quản lý câu hỏi đánh giá cuối kỳ giáo viên
              </Title>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 20, fontWeight: 600, fontSize: 16 }}
                  onClick={handleAddQuestion}
                >
                  Thêm câu hỏi
                </Button>
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchQuestions} />
                </Tooltip>
              </Space>
            </div>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={questions}
                rowKey="evaluationQuestionId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} câu hỏi`,
                }}
                style={{ borderRadius: 12 }}
              />
            </Spin>
          </Card>
          <Modal
            title="Thêm câu hỏi đánh giá cho giáo viên"
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
            okButtonProps={{ loading: isSubmitting }}
            okText="Lưu"
            cancelText="Hủy"
            width={600}
            centered
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="questionText"
                label="Nội dung câu hỏi"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung câu hỏi" },
                  {
                    max: 250,
                    message: "Nội dung câu hỏi không quá 250 ký tự!",
                  },
                ]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập nội dung câu hỏi"
                  maxLength={250}
                  showCount={{ max: 250 }}
                />
              </Form.Item>
              <Form.Item label="Lựa chọn trả lời">
                {options.map((opt, idx) => (
                  <Space
                    key={idx}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Input
                      placeholder={`Lựa chọn ${idx + 1}`}
                      value={opt.optionText}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      maxLength={100}
                      showCount={{ max: 100 }}
                    />
                    {options.length > 1 && (
                      <Button danger onClick={() => handleRemoveOption(idx)}>
                        Xóa
                      </Button>
                    )}
                  </Space>
                ))}
                {options.length < 10 && (
                  <Button
                    type="dashed"
                    onClick={handleAddOption}
                    style={{ width: "100%" }}
                  >
                    Thêm lựa chọn
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Chỉnh sửa câu hỏi đánh giá giáo viên"
            open={isEditModalVisible}
            onOk={handleEditModalOk}
            onCancel={() => setIsEditModalVisible(false)}
            okButtonProps={{ loading: isEditSubmitting }}
            okText="Lưu"
            cancelText="Hủy"
            width={600}
            centered
          >
            <Form form={editForm} layout="vertical">
              <Form.Item
                name="questionText"
                label="Nội dung câu hỏi"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung câu hỏi" },
                  {
                    max: 250,
                    message: "Nội dung câu hỏi không quá 250 ký tự!",
                  },
                ]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập nội dung câu hỏi"
                  maxLength={250}
                  showCount={{ max: 250 }}
                />
              </Form.Item>
              <Form.Item label="Lựa chọn trả lời">
                {editOptions.map((opt, idx) => (
                  <Space
                    key={opt.evaluationOptionId || idx}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Input
                      placeholder={`Lựa chọn ${idx + 1}`}
                      value={opt.optionText}
                      onChange={(e) =>
                        handleEditOptionChange(idx, e.target.value)
                      }
                      maxLength={100}
                      showCount={{ max: 100 }}
                    />
                    {editOptions.length > 1 && (
                      <Button
                        danger
                        onClick={() => handleRemoveEditOption(idx)}
                      >
                        Xóa
                      </Button>
                    )}
                  </Space>
                ))}
                {editOptions.length < 10 && (
                  <Button
                    type="dashed"
                    onClick={handleAddEditOption}
                    style={{ width: "100%" }}
                  >
                    Thêm lựa chọn
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherEvaluationQuestionManagement;
