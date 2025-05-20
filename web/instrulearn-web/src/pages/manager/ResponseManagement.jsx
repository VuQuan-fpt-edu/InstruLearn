import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Tag,
  Popconfirm,
  Tooltip,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ResponseManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("response");
  const [form] = Form.useForm();
  const [responses, setResponses] = useState([]);
  const [responseTypes, setResponseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [modalTitle, setModalTitle] = useState("Thêm mới phản hồi");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 250;
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCharCount, setEditCharCount] = useState(0);

  useEffect(() => {
    fetchResponses();
    fetchResponseTypes();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Response/get-all"
      );

      if (response.data) {
        const formattedData = response.data.map((item) => ({
          ...item.data,
          responseId: item.data.responseId,
          responseTypeId: item.data.responseTypes[0]?.responseTypeId,
          responseTypeName: item.data.responseTypes[0]?.responseTypeName,
        }));
        setResponses(formattedData);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      message.error("Không thể tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const fetchResponseTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/ResponseType/get-all"
      );

      if (response.data) {
        const formattedData = response.data.map((item) => item.data);
        setResponseTypes(formattedData);
      }
    } catch (error) {
      console.error("Error fetching response types:", error);
      message.error("Không thể tải danh sách loại phản hồi");
    }
  };

  const handleAdd = () => {
    setEditingResponse(null);
    form.resetFields();
    setModalTitle("Thêm mới phản hồi");
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingResponse(record);
    editForm.setFieldsValue({
      responseDescription: record.responseDescription,
    });
    editForm.setFields([{ name: "responseDescription", errors: [] }]);
    setEditCharCount(
      record.responseDescription ? record.responseDescription.length : 0
    );
    setIsEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingResponse(null);
    editForm.resetFields();
    editForm.setFields([{ name: "responseDescription", errors: [] }]);
    setEditCharCount(0);
  };

  const handleDelete = async (responseId) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication.azurewebsites.net/api/Response/delete/${responseId}`
      );

      if (response.data?.isSucceed) {
        message.success("Xóa phản hồi thành công");
        fetchResponses();
      } else {
        throw new Error(response.data?.message || "Xóa phản hồi thất bại");
      }
    } catch (error) {
      console.error("Error deleting response:", error);
      message.error("Không thể xóa phản hồi");
    }
  };

  const handleSubmit = async (values) => {
    // Kiểm tra nội dung phản hồi đã tồn tại chưa
    const existingResponse = responses.find(
      (response) =>
        response.responseTypeId ===
          (editingResponse
            ? editingResponse.responseTypeId
            : values.responseTypeId) &&
        response.responseDescription.trim().toLowerCase() ===
          values.responseDescription.trim().toLowerCase() &&
        (!editingResponse || response.responseId !== editingResponse.responseId)
    );

    if (existingResponse) {
      form.setFields([
        {
          name: "responseDescription",
          errors: ["Nội dung phản hồi này đã tồn tại cho loại phản hồi này"],
        },
      ]);
      return;
    }

    try {
      if (editingResponse) {
        // Cập nhật Response
        const response = await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/Response/update/${editingResponse.responseId}`,
          {
            responseDescription: values.responseDescription,
          }
        );

        if (response.data?.isSucceed) {
          message.success("Cập nhật phản hồi thành công");
          setIsEditModalVisible(false);
          editForm.resetFields();
          editForm.setFields([{ name: "responseDescription", errors: [] }]);
          setEditCharCount(0);
          setEditingResponse(null);
          setModalTitle("Thêm mới phản hồi");
          fetchResponses();
        } else {
          throw new Error(
            response.data?.message || "Cập nhật phản hồi thất bại"
          );
        }
      } else {
        // Tạo mới Response
        const response = await axios.post(
          "https://instrulearnapplication.azurewebsites.net/api/Response/create",
          {
            responseTypeId: values.responseTypeId,
            responseDescription: values.responseDescription,
          }
        );

        if (response.data?.isSucceed) {
          message.success("Thêm phản hồi thành công");
          setModalVisible(false);
          form.resetFields();
          form.setFields([{ name: "responseDescription", errors: [] }]);
          setCharCount(0);
          setEditingResponse(null);
          setModalTitle("Thêm mới phản hồi");
          fetchResponses();
        } else {
          throw new Error(response.data?.message || "Thêm phản hồi thất bại");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleTextAreaChange = (e) => {
    const value = e.target.value;
    setCharCount(value.length);
  };

  const handleEditSubmit = async (values) => {
    // Kiểm tra trùng lặp
    const existingResponse = responses.find(
      (response) =>
        response.responseTypeId === editingResponse.responseTypeId &&
        response.responseDescription.trim().toLowerCase() ===
          values.responseDescription.trim().toLowerCase() &&
        response.responseId !== editingResponse.responseId
    );

    if (existingResponse) {
      editForm.setFields([
        {
          name: "responseDescription",
          errors: ["Nội dung phản hồi này đã tồn tại cho loại phản hồi này"],
        },
      ]);
      return;
    }

    try {
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Response/update/${editingResponse.responseId}`,
        {
          responseDescription: values.responseDescription,
        }
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật phản hồi thành công");
        setIsEditModalVisible(false);
        editForm.resetFields();
        editForm.setFields([{ name: "responseDescription", errors: [] }]);
        setEditCharCount(0);
        setEditingResponse(null);
        fetchResponses();
      } else {
        throw new Error(response.data?.message || "Cập nhật phản hồi thất bại");
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra");
    }
  };

  const columns = [
    {
      title: "Loại phản hồi",
      dataIndex: "responseTypeName",
      key: "responseTypeName",
      render: (text) => {
        let color = "blue";
        switch (text) {
          case "Đồng ý":
            color = "success";
            break;
          case "Từ chối":
            color = "error";
            break;
          case "Gợi ý":
            color = "warning";
            break;
          default:
            color = "blue";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Nội dung phản hồi",
      dataIndex: "responseDescription",
      key: "responseDescription",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="bg-blue-500 hover:bg-blue-600 border-none"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phản hồi này?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.responseId)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                className="bg-red-500 hover:bg-red-600 border-none"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <ManagerHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="mb-6">
            <Title level={3}>Quản lý phản hồi</Title>
          </div>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="bg-green-500 hover:bg-green-600 border-none"
                >
                  Thêm mới
                </Button>
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchResponses} />
                </Tooltip>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={responses}
                rowKey="responseId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} phản hồi`,
                }}
              />
            </Spin>
          </Card>

          <Modal
            title={modalTitle}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setCharCount(0);
              form.resetFields();
              form.setFields([{ name: "responseDescription", errors: [] }]);
              setEditingResponse(null);
              setModalTitle("Thêm mới phản hồi");
            }}
            footer={null}
            width={800}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                responseTypeId: undefined,
                responseDescription: "",
              }}
            >
              {!editingResponse && (
                <Form.Item
                  name="responseTypeId"
                  label="Loại phản hồi"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại phản hồi" },
                  ]}
                >
                  <Select placeholder="Chọn loại phản hồi">
                    {responseTypes.map((type) => (
                      <Option
                        key={type.responseTypeId}
                        value={type.responseTypeId}
                      >
                        {type.responseTypeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item
                name="responseDescription"
                label="Nội dung phản hồi"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập nội dung phản hồi",
                  },
                  {
                    max: MAX_CHARS,
                    message: `Nội dung phản hồi không được vượt quá ${MAX_CHARS} ký tự`,
                  },
                ]}
              >
                <div>
                  <Input.TextArea
                    rows={6}
                    placeholder="Nhập nội dung phản hồi"
                    onChange={handleTextAreaChange}
                    maxLength={MAX_CHARS}
                    showCount
                  />
                </div>
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button
                    onClick={() => {
                      setModalVisible(false);
                      setCharCount(0);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingResponse ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Chỉnh sửa phản hồi"
            open={isEditModalVisible}
            onCancel={handleEditModalCancel}
            footer={null}
            width={800}
          >
            <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
              <Form.Item
                name="responseDescription"
                label="Nội dung phản hồi"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập nội dung phản hồi",
                  },
                  { max: 250, message: "Không quá 250 ký tự" },
                ]}
              >
                <Input.TextArea
                  rows={6}
                  maxLength={250}
                  showCount={{ max: 250 }}
                  onChange={(e) => setEditCharCount(e.target.value.length)}
                />
              </Form.Item>
              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={handleEditModalCancel}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ResponseManagement;
