import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Button,
  Typography,
  Divider,
  Form,
  Input,
  Select,
  Modal,
  List,
  Space,
  Tag,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import SSidebar from "../components/StaffSidebar";
import SHeader from "../components/StaffHeader";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const CourseContentDetail = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("courses");
  const [contentDetail, setContentDetail] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [editItemModalVisible, setEditItemModalVisible] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchContentDetail();
    fetchItemTypes();
  }, [contentId]);

  const fetchContentDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContent/${contentId}`
      );

      if (response.data?.isSucceed && response.data.data) {
        setContentDetail(response.data.data);
        setContentItems(response.data.data.courseContentItems || []);
      } else {
        setContentDetail(response.data || null);
      }
    } catch (error) {
      message.error("Không thể tải chi tiết nội dung khóa học");
      console.error("Error fetching content detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/ItemType/get-all"
      );

      if (response.data?.isSucceed && response.data.data) {
        setItemTypes(response.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách loại nội dung");
      console.error("Error fetching item types:", error);
    }
  };

  const handleAddItem = () => {
    form.resetFields();
    setAddItemModalVisible(true);
  };

  const handleAddItemSubmit = async () => {
    try {
      const values = await form.validateFields();
      setAddingItem(true);

      const newItem = {
        itemTypeId: parseInt(values.itemTypeId),
        contentId: parseInt(contentId),
        itemDes: values.itemDes,
      };

      const response = await axios.post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContentItem/create",
        newItem
      );

      if (response.data?.isSucceed) {
        message.success("Thêm nội dung mới thành công");
        setAddItemModalVisible(false);
        fetchContentDetail();
      } else {
        message.error(response.data?.message || "Thêm nội dung thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi thêm nội dung");
        console.error("Error adding item:", error);
      }
    } finally {
      setAddingItem(false);
    }
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    editForm.setFieldsValue({
      itemTypeId: item.itemTypeId,
      itemDes: item.itemDes,
    });
    setEditItemModalVisible(true);
  };

  const handleEditItemSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditingItem(true);

      const updatedItem = {
        itemTypeId: parseInt(values.itemTypeId),
        contentId: parseInt(contentId),
        itemDes: values.itemDes,
      };

      const response = await axios.put(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContentItem/update/${selectedItem.itemId}`,
        updatedItem
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật nội dung thành công");
        setEditItemModalVisible(false);
        fetchContentDetail();
      } else {
        message.error(response.data?.message || "Cập nhật nội dung thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi cập nhật nội dung");
        console.error("Error updating item:", error);
      }
    } finally {
      setEditingItem(false);
    }
  };

  const showDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };
  const handleDeleteItem = async (itemId) => {
    setDeleteLoading(true);
    try {
      const response = await axios.delete(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContentItem/delete/${itemId}`
      );

      if (response.data?.isSucceed) {
        message.success("Xóa nội dung thành công");
        fetchContentDetail();
      } else {
        message.error(response.data?.message || "Xóa nội dung thất bại");
      }
    } catch (error) {
      message.error("Lỗi khi xóa nội dung");
      console.error("Error deleting item:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getItemTypeLabel = (typeId) => {
    const type = itemTypes.find((t) => t.itemTypeId === typeId);
    return type ? type.itemTypeName : "Không xác định";
  };

  const getItemTypeIcon = (typeId) => {
    switch (typeId) {
      case 1:
        return <VideoCameraOutlined />;
      case 2:
        return <FileTextOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const renderItemContent = (item) => {
    if (item.itemTypeId === 1) {
      return (
        <div className="mt-2">
          <div className="mb-2">
            <Tag color="blue" icon={<VideoCameraOutlined />}>
              Video
            </Tag>
          </div>
          <div className="mb-2">
            <img
              src={item.itemDes}
              alt="Video thumbnail"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "cover",
              }}
            />
          </div>
          <Text type="secondary" className="break-all">
            {item.itemDes}
          </Text>
        </div>
      );
    } else {
      return (
        <div className="mt-2">
          <div className="mb-2">
            <Tag color="green" icon={<FileTextOutlined />}>
              {getItemTypeLabel(item.itemTypeId)}
            </Tag>
          </div>
          <Text>{item.itemDes}</Text>
        </div>
      );
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50 overflow-auto">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={goBack}
            className="mb-4 p-0"
          >
            Quay lại danh sách
          </Button>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spin tip="Đang tải chi tiết nội dung..." />
            </div>
          ) : contentDetail ? (
            <div className="space-y-6">
              <Card
                bordered={false}
                className="shadow-md"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOutlined className="mr-2" />
                      <span>Danh sách nội dung</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                    >
                      Thêm nội dung
                    </Button>
                  </div>
                }
              >
                <Title level={3}>{contentDetail.heading}</Title>
                {contentItems.length > 0 ? (
                  <List
                    dataSource={contentItems}
                    renderItem={(item) => (
                      <List.Item
                        key={item.itemId}
                        actions={[
                          <Button
                            icon={<EditOutlined />}
                            type="text"
                            onClick={() => handleEditItem(item)}
                          >
                            Sửa
                          </Button>,
                          <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                            onClick={() => showDeleteConfirm(item)}
                          >
                            Xóa
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getItemTypeIcon(item.itemTypeId)}
                          title={`Nội dung #${item.itemId}`}
                          description={renderItemContent(item)}
                        />
                      </List.Item>
                    )}
                    className="border rounded-lg"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="mb-2">Chưa có nội dung nào</div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                    >
                      Thêm nội dung mới
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <Title level={4} type="danger">
                Không tìm thấy thông tin chi tiết nội dung
              </Title>
              <Button type="primary" onClick={goBack} className="mt-4">
                Quay lại
              </Button>
            </div>
          )}
          <Modal
            title="Thêm nội dung mới"
            open={addItemModalVisible}
            onCancel={() => setAddItemModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setAddItemModalVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={addingItem}
                onClick={handleAddItemSubmit}
              >
                Thêm
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="itemTypeId"
                label="Loại nội dung"
                rules={[
                  { required: true, message: "Vui lòng chọn loại nội dung" },
                ]}
              >
                <Select placeholder="Chọn loại nội dung">
                  {itemTypes.map((type) => (
                    <Option key={type.itemTypeId} value={type.itemTypeId}>
                      {type.itemTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="itemDes"
                label="Nội dung"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
              >
                <Input.TextArea
                  placeholder="Nhập đường dẫn video hoặc nội dung tài liệu"
                  rows={4}
                />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Chỉnh sửa nội dung"
            open={editItemModalVisible}
            onCancel={() => setEditItemModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setEditItemModalVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={editingItem}
                onClick={handleEditItemSubmit}
              >
                Cập nhật
              </Button>,
            ]}
          >
            <Form form={editForm} layout="vertical">
              <Form.Item
                name="itemTypeId"
                label="Loại nội dung"
                rules={[
                  { required: true, message: "Vui lòng chọn loại nội dung" },
                ]}
              >
                <Select placeholder="Chọn loại nội dung">
                  {itemTypes.map((type) => (
                    <Option key={type.itemTypeId} value={type.itemTypeId}>
                      {type.itemTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="itemDes"
                label="Nội dung"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
              >
                <Input.TextArea
                  placeholder="Nhập đường dẫn video hoặc nội dung tài liệu"
                  rows={4}
                />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Xác nhận xóa nội dung"
            open={deleteConfirmVisible}
            onCancel={() => setDeleteConfirmVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setDeleteConfirmVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="delete"
                type="primary"
                danger
                loading={deleteLoading}
                onClick={() => {
                  handleDeleteItem(itemToDelete.itemId);
                  setDeleteConfirmVisible(false);
                }}
              >
                Xóa
              </Button>,
            ]}
          >
            <div className="flex items-center">
              <ExclamationCircleOutlined
                style={{
                  color: "#ff4d4f",
                  fontSize: "22px",
                  marginRight: "12px",
                }}
              />
              <span>
                Bạn có chắc chắn muốn xóa nội dung #{itemToDelete?.itemId}{" "}
                không? Hành động này không thể hoàn tác.
              </span>
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourseContentDetail;
