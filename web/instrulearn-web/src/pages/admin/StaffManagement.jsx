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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  UnlockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const StaffManagement = () => {
  const [staffs, setStaffs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("staff");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Staff/get-all"
      );
      if (response.data.isSucceed) {
        setStaffs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching staffs:", error);
      message.error("Không thể tải danh sách nhân viên!");
    }
  };

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingStaff(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleBanUnban = async (staffId, isActive) => {
    try {
      const endpoint =
        isActive === 0
          ? `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Staff/unban/${staffId}`
          : `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Staff/delete/${staffId}`;

      const response = await axios.delete(endpoint);

      if (response.data.isSucceed) {
        message.success(
          isActive === 0
            ? "Mở khóa tài khoản thành công!"
            : "Khóa tài khoản thành công!"
        );
        fetchStaffs();
      } else {
        message.error(response.data.message || "Không thể thực hiện thao tác!");
      }
    } catch (error) {
      console.error("Error banning/unbanning staff:", error);
      message.error("Không thể thực hiện thao tác!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingStaff) {
        // TODO: Implement update API call
        console.log("Update staff:", values);
        message.success("Cập nhật thông tin nhân viên thành công!");
      } else {
        try {
          const response = await axios.post(
            "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Staff/create",
            {
              email: values.email,
              username: values.username,
              fullname: values.fullname,
              password: values.password,
              phoneNumber: values.phoneNumber,
            }
          );
          if (response.data.isSucceed) {
            message.success("Thêm nhân viên mới thành công!");
          } else {
            message.error(response.data.message || "Không thể thêm nhân viên!");
          }
        } catch (error) {
          console.error("Error creating staff:", error);
          message.error("Không thể thêm nhân viên!");
        }
      }
      setIsModalOpen(false);
      fetchStaffs();
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      message.error("Không thể lưu thông tin nhân viên!");
    }
  };

  const handleViewDetail = (record) => {
    setSelectedStaff(record);
    setIsDetailModalOpen(true);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
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
            onConfirm={() => handleBanUnban(record.staffId, record.isActive)}
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
            <h2 className="text-2xl font-semibold">Quản lý tài khoản Staff</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm nhân viên
            </Button>
          </div>

          <Table
            dataSource={staffs}
            columns={columns}
            rowKey="staffId"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
            }}
            bordered
            size="middle"
          />

          {/* Modal thêm/sửa nhân viên */}
          <Modal
            title={editingStaff ? "Chỉnh sửa thông tin" : "Thêm nhân viên mới"}
            open={isModalOpen}
            onOk={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
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

          {/* Modal xem chi tiết nhân viên */}
          <Modal
            title="Chi tiết thông tin nhân viên"
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            width={800}
          >
            {selectedStaff && (
              <>
                <div className="text-center mb-6">
                  <Avatar
                    size={100}
                    icon={!selectedStaff.avatar && <UserOutlined />}
                  />
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedStaff.fullname}
                  </h2>
                  <p className="text-gray-500">{selectedStaff.username}</p>
                </div>

                <Divider />

                <Card title="Thông tin tài khoản" bordered={false}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Email">
                      <MailOutlined className="mr-2" />
                      {selectedStaff.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={selectedStaff.isActive === 1 ? "green" : "red"}
                      >
                        {selectedStaff.isActive === 1 ? "Hoạt động" : "Đã khóa"}
                      </Tag>
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

export default StaffManagement;
