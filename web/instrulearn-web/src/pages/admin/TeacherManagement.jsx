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
  Descriptions,
  Divider,
  Row,
  Col,
  Card,
  Avatar,
  Upload,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  IdcardOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddMajorModalOpen, setIsAddMajorModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("teacher");
  const [form] = Form.useForm();
  const [majorForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchMajors();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/get-all"
      );
      if (response.data && Array.isArray(response.data)) {
        // Lọc các phản hồi thành công và map dữ liệu
        const validTeachers = response.data
          .filter((item) => item.isSucceed)
          .map((item) => ({
            ...item.data,
            majorName: item.data.major.majorName,
            majorId: item.data.major.majorId,
          }));
        setTeachers(validTeachers);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("Không thể tải danh sách giáo viên!");
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/get-all"
      );
      if (response.data.isSucceed) {
        setMajors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching majors:", error);
      message.error("Không thể tải danh sách nhạc cụ!");
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingTeacher(record);
    form.setFieldsValue(record);
    setAvatarUrl(record.avatar);
    setIsModalOpen(true);
  };

  const handleDelete = async (teacherId) => {
    try {
      // TODO: Implement delete API call
      console.log("Delete teacher:", teacherId);
      message.success("Xóa giáo viên thành công!");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      message.error("Không thể xóa giáo viên!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingTeacher) {
        // TODO: Implement update API call
        console.log("Update teacher:", values);
        message.success("Cập nhật thông tin giáo viên thành công!");
      } else {
        try {
          const response = await axios.post(
            "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/create",
            {
              majorId: values.majorId,
              email: values.email,
              username: values.username,
              fullname: values.fullname,
              password: values.password,
            }
          );
          if (response.data.isSucceed) {
            message.success("Thêm giáo viên mới thành công!");
          } else {
            message.error(response.data.message || "Không thể thêm giáo viên!");
          }
        } catch (error) {
          console.error("Error creating teacher:", error);
          message.error("Không thể thêm giáo viên!");
        }
      }
      setIsModalOpen(false);
      setAvatarUrl(null);
      fetchTeachers();
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      message.error("Không thể lưu thông tin giáo viên!");
    }
  };

  const handleViewDetail = (record) => {
    setSelectedTeacher(record);
    setIsDetailModalOpen(true);
  };

  const handleResetPassword = (id) => {
    message.success("Đã gửi email đặt lại mật khẩu!");
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

  const handleBanUnban = async (teacherId, isBanned) => {
    try {
      const endpoint = isBanned
        ? `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/unban/${teacherId}`
        : `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/delete/${teacherId}`;

      const response = await axios.post(endpoint);
      if (response.data.isSucceed) {
        message.success(
          isBanned
            ? "Mở khóa tài khoản thành công!"
            : "Khóa tài khoản thành công!"
        );
        fetchTeachers();
      } else {
        message.error(response.data.message || "Không thể thực hiện thao tác!");
      }
    } catch (error) {
      console.error("Error banning/unbanning teacher:", error);
      message.error("Không thể thực hiện thao tác!");
    }
  };

  const handleAddMajor = async () => {
    try {
      const values = await majorForm.validateFields();
      const response = await axios.post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/create",
        {
          majorName: values.majorName,
        }
      );
      if (response.data.isSucceed) {
        message.success("Thêm nhạc cụ mới thành công!");
        setIsAddMajorModalOpen(false);
        majorForm.resetFields();
        fetchMajors();
      } else {
        message.error(response.data.message || "Không thể thêm nhạc cụ!");
      }
    } catch (error) {
      console.error("Error creating major:", error);
      message.error("Không thể thêm nhạc cụ!");
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
      title: "Nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
      width: "25%",
    },
    {
      title: "Chức danh",
      dataIndex: "heading",
      key: "heading",
      width: "25%",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Trạng thái",
      dataIndex: "isBanned",
      key: "isBanned",
      width: "15%",
      render: (isBanned) => (
        <Tag color={isBanned ? "red" : "green"}>
          {isBanned ? "Đã khóa" : "Hoạt động"}
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
              record.isBanned
                ? "Bạn có chắc chắn muốn mở khóa tài khoản?"
                : "Bạn có chắc chắn muốn khóa tài khoản?"
            }
            onConfirm={() => handleBanUnban(record.teacherId, record.isBanned)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              type={record.isBanned ? "primary" : "default"}
              icon={record.isBanned ? <UnlockOutlined /> : <LockOutlined />}
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
              Quản lý tài khoản Giáo viên
            </h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm giáo viên
            </Button>
          </div>

          <Table
            dataSource={teachers}
            columns={columns}
            rowKey="teacherId"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
            }}
            bordered
            size="middle"
          />

          {/* Modal thêm/sửa giáo viên */}
          <Modal
            title={
              editingTeacher ? "Chỉnh sửa thông tin" : "Thêm giáo viên mới"
            }
            open={isModalOpen}
            onOk={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setAvatarUrl(null);
            }}
            width={700}
          >
            <Form form={form} layout="vertical">
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

              <Form.Item
                name="majorId"
                label="Nhạc cụ"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nhạc cụ!",
                  },
                ]}
              >
                <Select
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddMajorModalOpen(true)}
                        style={{ width: "100%", textAlign: "left" }}
                      >
                        Thêm nhạc cụ mới
                      </Button>
                    </>
                  )}
                >
                  {majors.map((major) => (
                    <Option key={major.majorId} value={major.majorId}>
                      {major.majorName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal thêm nhạc cụ mới */}
          <Modal
            title="Thêm nhạc cụ mới"
            open={isAddMajorModalOpen}
            onOk={handleAddMajor}
            onCancel={() => {
              setIsAddMajorModalOpen(false);
              majorForm.resetFields();
            }}
          >
            <Form form={majorForm} layout="vertical">
              <Form.Item
                name="majorName"
                label="Tên nhạc cụ"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên nhạc cụ!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal xem chi tiết giáo viên */}
          <Modal
            title="Chi tiết thông tin giáo viên"
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            width={800}
          >
            {selectedTeacher && (
              <>
                <div className="text-center mb-6">
                  <Avatar size={100} icon={<UserOutlined />} />
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedTeacher.fullname}
                  </h2>
                  <p className="text-gray-500">{selectedTeacher.majorName}</p>
                </div>

                <Divider />

                <Card title="Thông tin chi tiết" bordered={false}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Chức danh">
                      {selectedTeacher.heading || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chi tiết">
                      {selectedTeacher.details || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Liên kết">
                      {selectedTeacher.links || "Chưa cập nhật"}
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

export default TeacherManagement;
