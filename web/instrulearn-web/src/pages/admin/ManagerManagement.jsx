import { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Tag,
  Select,
  Descriptions,
  Divider,
  Row,
  Col,
  Card,
  Avatar,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  IdcardOutlined,
  UploadOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const ManagerManagement = () => {
  const [managers, setManagers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("manager");
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Manager/get-all"
      );
      if (response.data.isSucceed) {
        setManagers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      message.error("Không thể tải danh sách quản lý!");
    }
  };

  const handleAdd = () => {
    setEditingManager(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingManager(record);
    form.setFieldsValue(record);
    setAvatarUrl(record.avatar);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setManagers(managers.filter((manager) => manager.managerId !== id));
    message.success("Xóa tài khoản quản lý thành công!");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingManager) {
        // TODO: Implement update API call
        console.log("Update manager:", values);
        message.success("Cập nhật thông tin quản lý thành công!");
      } else {
        try {
          const response = await axios.post(
            "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Manager/create",
            {
              email: values.email,
              username: values.username,
              fullname: values.fullname,
              password: values.password,
              phoneNumber: values.phoneNumber,
            }
          );
          if (response.data.isSucceed) {
            message.success("Thêm quản lý mới thành công!");
          } else {
            message.error(response.data.message || "Không thể thêm quản lý!");
          }
        } catch (error) {
          console.error("Error creating manager:", error);
          message.error("Không thể thêm quản lý!");
        }
      }
      setIsModalOpen(false);
      setAvatarUrl(null);
      fetchManagers();
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      message.error("Không thể lưu thông tin quản lý!");
    }
  };

  const handleViewDetail = (record) => {
    setSelectedManager(record);
    setIsDetailModalOpen(true);
  };

  const handleBanUnban = async (managerId, isActive) => {
    try {
      const endpoint =
        isActive === 0
          ? `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Manager/unban/${managerId}`
          : `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Manager/delete/${managerId}`;

      const response = await axios.delete(endpoint);

      if (response.data.isSucceed) {
        message.success(
          isActive === 0
            ? "Mở khóa tài khoản thành công!"
            : "Khóa tài khoản thành công!"
        );
        fetchManagers();
      } else {
        message.error(response.data.message || "Không thể thực hiện thao tác!");
      }
    } catch (error) {
      console.error("Error banning/unbanning manager:", error);
      message.error("Không thể thực hiện thao tác!");
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleAvatarUpload = (info) => {
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response.url);
      message.success(`${info.file.name} tải lên thành công`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      width: "25%",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      width: "25%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "15%",
      render: (isActive) => (
        <Tag color={isActive === 1 ? "green" : "red"}>
          {isActive === 1 ? "Hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          />
          <Popconfirm
            title={
              record.isActive === 0
                ? "Bạn có chắc chắn muốn mở khóa tài khoản?"
                : "Bạn có chắc chắn muốn khóa tài khoản?"
            }
            onConfirm={() => handleBanUnban(record.managerId, record.isActive)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              type={record.isActive === 0 ? "primary" : "default"}
              icon={
                record.isActive === 0 ? <UnlockOutlined /> : <LockOutlined />
              }
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <AdminHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          selectedMenu={selectedMenu}
        />
        <Content
          style={{
            margin: "74px 16px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Quản lý tài khoản Quản lý
            </h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm quản lý
            </Button>
          </div>

          <Table
            dataSource={managers}
            columns={columns}
            rowKey="managerId"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
            }}
            bordered
            size="middle"
          />

          {/* Modal thêm/sửa quản lý */}
          <Modal
            title={editingManager ? "Chỉnh sửa thông tin" : "Thêm quản lý mới"}
            open={isModalOpen}
            onOk={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setAvatarUrl(null);
            }}
            width={700}
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fullname"
                    label="Họ và tên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên!",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên đăng nhập!",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập email!",
                      },
                      {
                        type: "email",
                        message: "Email không hợp lệ!",
                      },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                      },
                      {
                        min: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự!",
                      },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Số điện thoại phải có đúng 10 chữ số!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          {/* Modal xem chi tiết quản lý */}
          <Modal
            title="Chi tiết thông tin quản lý"
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            width={800}
          >
            {selectedManager && (
              <>
                <div className="text-center mb-6">
                  <Avatar
                    size={100}
                    src={selectedManager.avatar}
                    icon={!selectedManager.avatar && <UserOutlined />}
                  />
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedManager.fullname}
                  </h2>
                  <p className="text-gray-500">{selectedManager.username}</p>
                </div>

                <Divider />

                <Row gutter={24}>
                  <Col span={12}>
                    <Card title="Thông tin cá nhân" bordered={false}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Ngày sinh">
                          {selectedManager.birthDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {selectedManager.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="CMND/CCCD">
                          {selectedManager.idCard}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                          {selectedManager.address}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Thông tin công việc" bordered={false}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Ngày vào làm">
                          {selectedManager.joinDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Tag
                            color={
                              selectedManager.isActive === 1 ? "green" : "red"
                            }
                          >
                            {selectedManager.isActive === 1
                              ? "Hoạt động"
                              : "Đã khóa"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Card title="Thông tin liên hệ" bordered={false}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Email">
                      <MailOutlined className="mr-2" />
                      {selectedManager.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">
                      <PhoneOutlined className="mr-2" />
                      {selectedManager.phone}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerManagement;
