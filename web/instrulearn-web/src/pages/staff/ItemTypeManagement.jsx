import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Button,
  Typography,
  Form,
  Input,
  Table,
  Modal,
  Space,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;

const ItemTypeManagement = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("item-type");
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    fetchItemTypes();
  }, []);

  const fetchItemTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/ItemType/get-all"
      );

      if (response.data?.isSucceed && response.data.data) {
        setItemTypes(response.data.data);
      } else {
        message.error("Không thể tải danh sách loại nội dung");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách loại nội dung");
      console.error("Error fetching item types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemType = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/ItemType/get-all"
      );
      if (response.data?.isSucceed && response.data.data) {
        const itemTypesApi = response.data.data;
        const hasVideos = itemTypesApi.some(
          (item) => item.itemTypeName.trim().toLowerCase() === "video"
        );
        const hasPDF = itemTypesApi.some(
          (item) => item.itemTypeName.trim().toLowerCase() === "pdf"
        );
        setShowNote(hasVideos && hasPDF);
      } else {
        setShowNote(false);
      }
    } catch (e) {
      setShowNote(false);
    }
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleAddItemTypeSubmit = async () => {
    try {
      const values = await form.validateFields();
      setProcessing(true);

      const newItemType = {
        itemTypeName: values.itemTypeName,
      };

      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/ItemType/create",
        newItemType
      );

      if (response.data?.isSucceed) {
        message.success("Thêm loại nội dung mới thành công");
        setAddModalVisible(false);
        fetchItemTypes();
      } else {
        message.error(response.data?.message || "Thêm loại nội dung thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi thêm loại nội dung");
        console.error("Error adding item type:", error);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleEditItemType = (record) => {
    setSelectedItemType(record);
    editForm.setFieldsValue({
      itemTypeName: record.itemTypeName,
    });
    setEditModalVisible(true);
  };

  const handleEditItemTypeSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setProcessing(true);

      const updatedItemType = {
        itemTypeName: values.itemTypeName,
      };

      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/ItemType/update/${selectedItemType.itemTypeId}`,
        updatedItemType
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật loại nội dung thành công");
        setEditModalVisible(false);
        fetchItemTypes();
      } else {
        message.error(
          response.data?.message || "Cập nhật loại nội dung thất bại"
        );
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi cập nhật loại nội dung");
        console.error("Error updating item type:", error);
      }
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "itemTypeId",
      key: "itemTypeId",
    },
    {
      title: "Tên loại nội dung",
      dataIndex: "itemTypeName",
      key: "itemTypeName",
      render: (text) => (
        <Space>
          <FileTextOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditItemType(record)}
            type="text"
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
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
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="space-y-6">
            <Card
              bordered={false}
              className="shadow-md"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileTextOutlined className="mr-2" />
                    <span>Quản lý loại nội dung</span>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddItemType}
                  >
                    Thêm loại nội dung
                  </Button>
                </div>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin tip="Đang tải danh sách loại nội dung..." />
                </div>
              ) : (
                <Table
                  dataSource={itemTypes}
                  columns={columns}
                  rowKey="itemTypeId"
                  bordered
                  pagination={{ pageSize: 10 }}
                />
              )}
            </Card>
          </div>

          <Modal
            title="Thêm loại nội dung"
            open={addModalVisible}
            onCancel={() => setAddModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setAddModalVisible(false)}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={processing}
                onClick={handleAddItemTypeSubmit}
              >
                Thêm
              </Button>,
            ]}
          >
            {showNote && (
              <div style={{ color: "orange", marginBottom: 12 }}>
                Lưu ý: Hệ thống chỉ sử dụng 2 loại nội dung là <b>Video</b> và{" "}
                <b>PDF</b>. Nếu đã có đủ 2 loại này, bạn không cần tạo thêm!
              </div>
            )}
            <Form form={form} layout="vertical">
              <Form.Item
                name="itemTypeName"
                label="Tên loại nội dung"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên loại nội dung",
                  },
                  {
                    max: 20,
                    message: "Tên loại nội dung không được vượt quá 20 ký tự!",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const isExist = itemTypes.some(
                        (item) =>
                          item.itemTypeName.trim().toLowerCase() ===
                          value.trim().toLowerCase()
                      );
                      if (isExist) {
                        return Promise.reject(
                          "Tên loại nội dung này đã tồn tại!"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tên loại nội dung"
                  maxLength={20}
                  showCount={{ max: 20 }}
                />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Sửa loại nội dung"
            open={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={processing}
                onClick={handleEditItemTypeSubmit}
              >
                Cập nhật
              </Button>,
            ]}
          >
            <Form form={editForm} layout="vertical">
              <Form.Item
                name="itemTypeName"
                label="Tên loại nội dung"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên loại nội dung",
                  },
                  {
                    max: 20,
                    message: "Tên loại nội dung không được vượt quá 20 ký tự!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tên loại nội dung"
                  maxLength={20}
                  showCount={{ max: 20 }}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ItemTypeManagement;
