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
  PhoneOutlined,
  MailOutlined,
  UnlockOutlined,
  EnvironmentOutlined,
  UserSwitchOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const LearnerManagement = () => {
  const [learners, setLearners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("learner");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Learner/get-all"
      );
      if (response.data.isSucceed) {
        setLearners(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching learners:", error);
      message.error("Không thể tải danh sách học viên!");
    }
  };

  const handleAdd = () => {
    setEditingLearner(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingLearner(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleBanUnban = async (learnerId, isActive) => {
    try {
      const endpoint =
        isActive === 0
          ? `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Learner/unban/${learnerId}`
          : `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Learner/ban/${learnerId}`;

      const response = await axios.put(endpoint);

      if (response.data.isSucceed) {
        message.success(
          isActive === 0
            ? "Mở khóa tài khoản thành công!"
            : "Khóa tài khoản thành công!"
        );
        fetchLearners();
      } else {
        throw new Error(
          response.data.message || "Không thể thực hiện thao tác!"
        );
      }
    } catch (error) {
      console.error("Error banning/unbanning learner:", error);
      message.error(error.message || "Không thể thực hiện thao tác!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingLearner) {
        const updateData = {
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          address: values.address,
          avatar: values.avatar,
        };

        const response = await axios.put(
          `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Learner/update/${editingLearner.learnerId}`,
          updateData
        );

        if (response.data.isSucceed) {
          message.success("Cập nhật thông tin học viên thành công!");
          setIsModalOpen(false);
          fetchLearners();
        } else {
          throw new Error(
            response.data.message || "Không thể cập nhật thông tin!"
          );
        }
      } else {
        // TODO: Implement create API call
        console.log("Create learner:", values);
        message.success("Thêm học viên mới thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      message.error(error.message || "Không thể lưu thông tin học viên!");
    }
  };

  const handleViewDetail = (record) => {
    setSelectedLearner(record);
    setIsDetailModalOpen(true);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: "25%",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "15%",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "10%",
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
            onConfirm={() => handleBanUnban(record.learnerId, record.isActive)}
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
              Quản lý tài khoản Học viên
            </h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm học viên
            </Button>
          </div>

          <Table
            dataSource={learners}
            columns={columns}
            rowKey="learnerId"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
            }}
            bordered
            size="middle"
          />

          {/* Modal thêm/sửa học viên */}
          <Modal
            title={editingLearner ? "Chỉnh sửa thông tin" : "Thêm học viên mới"}
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
                    name="fullName"
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
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn giới tính!",
                      },
                    ]}
                  >
                    <Select prefix={<UserSwitchOutlined />}>
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ!",
                      },
                    ]}
                  >
                    <Input prefix={<EnvironmentOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="avatar"
                label="Ảnh đại diện"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập URL ảnh đại diện!",
                  },
                  {
                    type: "url",
                    message: "URL không hợp lệ!",
                  },
                ]}
              >
                <Input
                  prefix={<PictureOutlined />}
                  placeholder="Nhập URL ảnh đại diện"
                />
              </Form.Item>

              {!editingLearner && (
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
              )}
            </Form>
          </Modal>

          {/* Modal xem chi tiết học viên */}
          <Modal
            title="Chi tiết thông tin học viên"
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            width={800}
          >
            {selectedLearner && (
              <>
                <div className="text-center mb-6">
                  <Avatar
                    size={100}
                    icon={!selectedLearner.avatar && <UserOutlined />}
                  />
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedLearner.fullName}
                  </h2>
                  <p className="text-gray-500">{selectedLearner.username}</p>
                </div>

                <Divider />

                <Card title="Thông tin tài khoản" bordered={false}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Email">
                      <MailOutlined className="mr-2" />
                      {selectedLearner.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <PhoneOutlined className="mr-2" />
                      {selectedLearner.phoneNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={selectedLearner.isActive === 1 ? "green" : "red"}
                      >
                        {selectedLearner.isActive === 1
                          ? "Hoạt động"
                          : "Đã khóa"}
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

export default LearnerManagement;
