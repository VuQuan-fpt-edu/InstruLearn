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

const FeedbackManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("feedback-management");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([{ optionId: 0, optionText: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editOptions, setEditOptions] = useState([]);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/GetActiveQuestions"
      );
      setQuestions(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách câu hỏi feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    form.resetFields();
    setOptions([{ optionId: 0, optionText: "" }]);
    setIsModalVisible(true);
  };

  const handleAddOption = () => {
    setOptions([...options, { optionId: 0, optionText: "" }]);
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
      if (options.some((opt) => !opt.optionText.trim())) {
        message.error("Vui lòng nhập đầy đủ các lựa chọn");
        return;
      }
      setIsSubmitting(true);
      const data = {
        questionId: 0,
        questionText: values.questionText,
        displayOrder: values.displayOrder,
        isRequired: values.isRequired,
        isActive: values.isActive,
        options: options.map((opt) => ({
          optionId: 0,
          optionText: opt.optionText,
        })),
      };
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/CreateQuestion",
        data
      );
      if (response.data?.isSucceed !== false) {
        message.success("Tạo câu hỏi feedback thành công");
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

  const handleActivate = async (questionId) => {
    try {
      await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/questions/${questionId}/activate`
      );
      message.success("Đã kích hoạt câu hỏi");
      fetchQuestions();
    } catch (error) {
      message.error("Không thể kích hoạt câu hỏi");
    }
  };

  const handleDeactivate = async (questionId) => {
    try {
      await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/questions/${questionId}/deactivate`
      );
      message.success("Đã ngưng hoạt động câu hỏi");
      fetchQuestions();
    } catch (error) {
      message.error("Không thể ngưng hoạt động câu hỏi");
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    editForm.setFieldsValue({
      questionText: question.questionText,
      displayOrder: question.displayOrder,
      isRequired: question.isRequired,
      isActive: question.isActive,
    });
    setEditOptions(question.options.map((opt) => ({ ...opt })));
    setIsEditModalVisible(true);
  };

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editOptions];
    newOptions[index].optionText = value;
    setEditOptions(newOptions);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      if (editOptions.some((opt) => !opt.optionText.trim())) {
        message.error("Vui lòng nhập đầy đủ các lựa chọn");
        return;
      }
      setIsSubmitting(true);
      const data = {
        questionId: editingQuestion.questionId,
        questionText: values.questionText,
        displayOrder: values.displayOrder,
        isRequired: values.isRequired,
        isActive: true,
        options: editOptions.map((opt) => ({
          optionId: opt.optionId,
          optionText: opt.optionText,
        })),
      };
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/UpdateQuestion/${editingQuestion.questionId}`,
        data
      );
      if (response.data?.isSucceed !== false) {
        message.success("Cập nhật câu hỏi feedback thành công");
        setIsEditModalVisible(false);
        fetchQuestions();
      } else {
        message.error(response.data?.message || "Cập nhật câu hỏi thất bại");
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "questionId",
      key: "questionId",
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
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 80,
      align: "center",
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
              key={opt.optionId}
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
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditQuestion(record)}
          >
            Chỉnh sửa
          </Button>
          {record.isActive ? (
            <Button
              danger
              size="small"
              shape="round"
              icon={<DeleteOutlined />}
              onClick={() => handleDeactivate(record.questionId)}
            >
              Ngưng
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => handleActivate(record.questionId)}
            >
              Kích hoạt
            </Button>
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
          style={{ marginTop: "64px" }}
        >
          <Card style={{ borderRadius: 12, padding: 16 }}>
            <div className="flex justify-between items-center mb-4">
              <Title level={3} style={{ margin: 0 }}>
                Quản lý câu hỏi feedback
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
                rowKey="questionId"
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
            title="Thêm câu hỏi feedback"
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
                    max: 100,
                    message: "Nội dung câu hỏi không được vượt quá 100 ký tự!",
                  },
                ]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập nội dung câu hỏi"
                  maxLength={100}
                  showCount
                />
              </Form.Item>
              <Form.Item
                name="displayOrder"
                label="Thứ tự hiển thị"
                rules={[
                  { required: true, message: "Vui lòng nhập thứ tự" },
                  {
                    type: "number",
                    min: 1,
                    max: 100,
                    message: "Thứ tự phải từ 1 đến 100",
                  },
                ]}
              >
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Thứ tự"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 100) {
                      e.target.value = 100;
                      if (form) form.setFieldsValue({ displayOrder: 100 });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="isRequired"
                label="Bắt buộc trả lời"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Yêu cầu bắt buộc</Checkbox>
              </Form.Item>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Đang dùng" unCheckedChildren="Ẩn" />
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
                      showCount
                    />
                    {options.length > 1 && (
                      <Button danger onClick={() => handleRemoveOption(idx)}>
                        Xóa
                      </Button>
                    )}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={handleAddOption}
                  style={{ width: "100%" }}
                >
                  Thêm lựa chọn
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Chỉnh sửa câu hỏi feedback"
            open={isEditModalVisible}
            onOk={handleEditModalOk}
            onCancel={() => setIsEditModalVisible(false)}
            okButtonProps={{ loading: isSubmitting }}
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
                    max: 100,
                    message: "Nội dung câu hỏi không được vượt quá 100 ký tự!",
                  },
                ]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập nội dung câu hỏi"
                  maxLength={100}
                  showCount
                />
              </Form.Item>
              <Form.Item
                name="displayOrder"
                label="Thứ tự hiển thị"
                rules={[
                  { required: true, message: "Vui lòng nhập thứ tự" },
                  {
                    type: "number",
                    min: 1,
                    max: 100,
                    message: "Thứ tự phải từ 1 đến 100",
                  },
                ]}
              >
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Thứ tự"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 100) {
                      e.target.value = 100;
                      if (editForm)
                        editForm.setFieldsValue({ displayOrder: 100 });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="isRequired"
                label="Bắt buộc trả lời"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Yêu cầu bắt buộc</Checkbox>
              </Form.Item>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
                hidden={true}
              >
                <Switch checkedChildren="Đang dùng" unCheckedChildren="Ẩn" />
              </Form.Item>
              <Form.Item label="Lựa chọn trả lời">
                {editOptions.map((opt, idx) => (
                  <Space
                    key={opt.optionId || idx}
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
                      showCount
                    />
                  </Space>
                ))}
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FeedbackManagement;
