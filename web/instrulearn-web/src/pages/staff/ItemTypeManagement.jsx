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
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;

const ItemTypeManagement = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("settings");
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);

  useEffect(() => {
    fetchItemTypes();
  }, []);

  const fetchItemTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/ItemType/get-all"
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

  const handleAddItemType = () => {
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
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/ItemType/create",
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
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/ItemType/update/${selectedItemType.itemTypeId}`,
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

  const handleDeleteItemType = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/ItemType/delete/${id}`
      );

      if (response.data?.isSucceed) {
        message.success("Xóa loại nội dung thành công");
        fetchItemTypes();
      } else {
        message.error(response.data?.message || "Xóa loại nội dung thất bại");
      }
    } catch (error) {
      message.error("Lỗi khi xóa loại nội dung");
      console.error("Error deleting item type:", error);
    } finally {
      setLoading(false);
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
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa loại nội dung này?"
            onConfirm={() => handleDeleteItemType(record.itemTypeId)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} type="text" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
            <Form form={form} layout="vertical">
              <Form.Item
                name="itemTypeName"
                label="Tên loại nội dung"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên loại nội dung",
                  },
                ]}
              >
                <Input placeholder="Nhập tên loại nội dung" />
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
                ]}
              >
                <Input placeholder="Nhập tên loại nội dung" />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ItemTypeManagement;
