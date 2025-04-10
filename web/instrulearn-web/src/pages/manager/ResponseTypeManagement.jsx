import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
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

const ResponseTypeManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("responseType");
  const [form] = Form.useForm();
  const [responseTypes, setResponseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [modalTitle, setModalTitle] = useState("Thêm mới loại phản hồi");

  useEffect(() => {
    fetchResponseTypes();
  }, []);

  const fetchResponseTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/ResponseType/get-all"
      );

      if (response.data) {
        const formattedData = response.data.map((item) => item.data);
        setResponseTypes(formattedData);
      }
    } catch (error) {
      console.error("Error fetching response types:", error);
      message.error("Không thể tải danh sách loại phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    setModalTitle("Thêm mới loại phản hồi");
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingType(record);
    form.setFieldsValue({
      responseTypeName: record.responseTypeName,
    });
    setModalTitle("Chỉnh sửa loại phản hồi");
    setModalVisible(true);
  };

  const handleDelete = async (responseTypeId) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/ResponseType/delete/${responseTypeId}`
      );

      if (response.data?.isSucceed) {
        message.success("Xóa loại phản hồi thành công");
        fetchResponseTypes();
      } else {
        throw new Error(response.data?.message || "Xóa loại phản hồi thất bại");
      }
    } catch (error) {
      console.error("Error deleting response type:", error);
      message.error("Không thể xóa loại phản hồi");
    }
  };

  const checkExistingResponseType = (responseTypeName) => {
    return responseTypes.some(
      (type) =>
        type.responseTypeName.toLowerCase() === responseTypeName.toLowerCase()
    );
  };

  const handleSubmit = async (values) => {
    try {
      if (editingType) {
        // Kiểm tra nếu đang sửa và tên mới trùng với tên khác (không phải tên hiện tại)
        const isDuplicate = responseTypes.some(
          (type) =>
            type.responseTypeId !== editingType.responseTypeId &&
            type.responseTypeName.toLowerCase() ===
              values.responseTypeName.toLowerCase()
        );

        if (isDuplicate) {
          message.error(
            "Loại phản hồi này đã tồn tại. Vui lòng chọn tên khác!"
          );
          return;
        }

        // Cập nhật ResponseType
        const response = await axios.put(
          `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/ResponseType/update/${editingType.responseTypeId}`,
          {
            responseTypeName: values.responseTypeName,
          }
        );

        if (response.data?.isSucceed) {
          message.success("Cập nhật loại phản hồi thành công");
          setModalVisible(false);
          fetchResponseTypes();
        } else {
          throw new Error(
            response.data?.message || "Cập nhật loại phản hồi thất bại"
          );
        }
      } else {
        // Kiểm tra trùng lặp khi tạo mới
        if (checkExistingResponseType(values.responseTypeName)) {
          message.error(
            "Loại phản hồi này đã tồn tại. Vui lòng chọn tên khác!"
          );
          return;
        }

        // Tạo mới ResponseType
        const response = await axios.post(
          "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/ResponseType/create",
          {
            responseTypeName: values.responseTypeName,
          }
        );

        if (response.data?.isSucceed) {
          message.success("Thêm loại phản hồi thành công");
          setModalVisible(false);
          fetchResponseTypes();
        } else {
          throw new Error(
            response.data?.message || "Thêm loại phản hồi thất bại"
          );
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error.message || "Có lỗi xảy ra");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "responseTypeId",
      key: "responseTypeId",
    },
    {
      title: "Tên loại phản hồi",
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
            title="Bạn có chắc chắn muốn xóa loại phản hồi này?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.responseTypeId)}
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
            <Title level={3}>Quản lý loại phản hồi</Title>
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
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchResponseTypes}
                  />
                </Tooltip>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={responseTypes}
                rowKey="responseTypeId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} loại phản hồi`,
                }}
              />
            </Spin>
          </Card>

          <Modal
            title={modalTitle}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                responseTypeName: "",
              }}
            >
              <Form.Item
                name="responseTypeName"
                label="Tên loại phản hồi"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên loại phản hồi",
                  },
                  {
                    validator: async (_, value) => {
                      if (!value) return;

                      // Nếu đang chỉnh sửa, kiểm tra trùng với các tên khác
                      if (editingType) {
                        const isDuplicate = responseTypes.some(
                          (type) =>
                            type.responseTypeId !==
                              editingType.responseTypeId &&
                            type.responseTypeName.toLowerCase() ===
                              value.toLowerCase()
                        );
                        if (isDuplicate) {
                          throw new Error("Loại phản hồi này đã tồn tại!");
                        }
                      }
                      // Nếu đang tạo mới, kiểm tra trùng với tất cả
                      else if (checkExistingResponseType(value)) {
                        throw new Error("Loại phản hồi này đã tồn tại!");
                      }
                    },
                  },
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  placeholder="Nhập tên loại phản hồi"
                  maxLength={50}
                  showCount
                />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    {editingType ? "Cập nhật" : "Thêm mới"}
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

export default ResponseTypeManagement;
