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
    form.setFieldsValue({
      responseTypeId: record.responseTypeId,
      responseDescription: record.responseDescription,
    });
    setModalTitle("Chỉnh sửa phản hồi");
    setModalVisible(true);
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
          setModalVisible(false);
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
            onCancel={() => setModalVisible(false)}
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
                ]}
              >
                <Input.TextArea rows={6} placeholder="Nhập nội dung phản hồi" />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    {editingResponse ? "Cập nhật" : "Thêm mới"}
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
