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
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

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
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    // Giả lập dữ liệu, sau này sẽ gọi API
    const data = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "a@example.com",
        phone: "0123456789",
        status: "active",
        joinDate: "2024-01-01",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        gender: "Nam",
        birthDate: "2000-01-01",
        idCard: "079123456789",
        position: "Học viên",
      },
      {
        id: 2,
        name: "Trần Thị B",
        email: "b@example.com",
        phone: "0987654321",
        status: "inactive",
        joinDate: "2024-02-01",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        gender: "Nữ",
        birthDate: "2002-05-15",
        idCard: "079987654321",
        position: "Học viên",
      },
    ];
    setLearners(data);
  };

  const handleAdd = () => {
    setEditingLearner(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingLearner(record);
    form.setFieldsValue(record);
    setAvatarUrl(record.avatar);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setLearners(learners.filter((learner) => learner.id !== id));
    message.success("Xóa tài khoản học viên thành công!");
  };

  const handleAvatarUpload = (info) => {
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response.url);
      message.success(`${info.file.name} tải lên thành công`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingLearner) {
        setLearners(
          learners.map((learner) =>
            learner.id === editingLearner.id
              ? { ...learner, ...values, avatar: avatarUrl }
              : learner
          )
        );
        message.success("Cập nhật thông tin học viên thành công!");
      } else {
        const newLearner = {
          id: Date.now(),
          ...values,
          status: "active",
          joinDate: new Date().toISOString().split("T")[0],
          position: "Học viên",
          avatar: avatarUrl,
        };
        setLearners([...learners, newLearner]);
        message.success("Thêm học viên mới thành công!");
      }
      setIsModalOpen(false);
      setAvatarUrl(null);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedLearner(record);
    setIsDetailModalOpen(true);
  };

  const handleResetPassword = (id) => {
    message.success("Đã gửi email đặt lại mật khẩu!");
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const columns = [
    {
      title: "Tên học viên",
      dataIndex: "name",
      key: "name",
      width: "25%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: "20%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
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
          <Button
            icon={<LockOutlined />}
            size="small"
            onClick={() => handleResetPassword(record.id)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
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
            rowKey="id"
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
              setAvatarUrl(null);
            }}
            width={700}
          >
            <Form form={form} layout="vertical">
              <div className="text-center mb-4">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="/api/upload" // Thay thế bằng API endpoint thực tế
                  onChange={handleAvatarUpload}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                <p className="text-gray-500 mt-2">
                  Nhấp để tải lên ảnh đại diện
                </p>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên học viên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên học viên!",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
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
                <Col span={12}>
                  <Form.Item
                    name="birthDate"
                    label="Ngày sinh"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày sinh!" },
                    ]}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              {editingLearner && (
                <Form.Item name="status" label="Trạng thái">
                  <Select>
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                  </Select>
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
                    src={selectedLearner.avatar}
                    icon={!selectedLearner.avatar && <UserOutlined />}
                  />
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedLearner.name}
                  </h2>
                  <p className="text-gray-500">{selectedLearner.position}</p>
                </div>

                <Divider />

                <Row gutter={24}>
                  <Col span={12}>
                    <Card title="Thông tin cá nhân" bordered={false}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Ngày sinh">
                          {selectedLearner.birthDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {selectedLearner.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="CMND/CCCD">
                          {selectedLearner.idCard}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                          {selectedLearner.address}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Thông tin học tập" bordered={false}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Ngày tham gia">
                          {selectedLearner.joinDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Tag
                            color={
                              selectedLearner.status === "active"
                                ? "green"
                                : "red"
                            }
                          >
                            {selectedLearner.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
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
                      {selectedLearner.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">
                      <PhoneOutlined className="mr-2" />
                      {selectedLearner.phone}
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
