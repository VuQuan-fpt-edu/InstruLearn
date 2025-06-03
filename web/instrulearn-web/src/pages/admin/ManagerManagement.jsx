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
  Progress,
  DatePicker,
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
  PictureOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";
import dayjs from "dayjs";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const { Content } = Layout;
const { Option } = Select;

const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [apiError, setApiError] = useState("");
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });
  const [uploadFileKey, setUploadFileKey] = useState(0);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Manager/get-all"
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
    const formValues = {
      ...record,
      dateOfEmployment: record.dateOfEmployment
        ? dayjs(record.dateOfEmployment)
        : null,
    };
    form.setFieldsValue(formValues);
    setAvatarUrl(record.avatar);
    setPreviewImage("");
    setUploadFile(null);
    setUploadStatus("");
    setIsUploading(false);
    setUploadProgress(0);
    setUploadFileKey((prev) => prev + 1);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setManagers(managers.filter((manager) => manager.managerId !== id));
    message.success("Xóa tài khoản quản lý thành công!");
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        message.error("Vui lòng chỉ chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 5MB");
        return;
      }
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    if (!uploadFile) {
      message.error("Vui lòng chọn file hình ảnh trước");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Đang tải ảnh lên...");
    const storageRef = ref(
      storage,
      `manager-avatars/${editingManager?.managerId || "new"}-${Date.now()}-${
        uploadFile.name
      }`
    );
    const uploadTask = uploadBytesResumable(storageRef, uploadFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        message.error("Tải ảnh lên thất bại");
        setUploadStatus("Tải ảnh thất bại");
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          form.setFieldsValue({ avatar: downloadURL });
          setUploadStatus("Tải ảnh thành công!");
          setIsUploading(false);
          message.success("Tải ảnh lên thành công");
        });
      }
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingManager) {
        try {
          const response = await axios.put(
            `https://instrulearnapplication.azurewebsites.net/api/Manager/update/${editingManager.managerId}`,
            {
              fullname: values.fullname,
              email: values.email,
              phoneNumber: values.phoneNumber,
              gender: values.gender,
              address: values.address,
              avatar: values.avatar,
              dateOfEmployment:
                values.dateOfEmployment && values.dateOfEmployment.format
                  ? values.dateOfEmployment.format("YYYY-MM-DD")
                  : null,
            }
          );
          if (response.data.isSucceed) {
            setApiError("");
            setIsModalOpen(false);
            setEditingManager(null);
            form.resetFields();
            setAvatarUrl(null);
            setUploadFile(null);
            setPreviewImage(null);
            setUploadStatus("");
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileKey((prev) => prev + 1);
            fetchManagers();
            setSuccessModal({
              open: true,
              message: "Cập nhật thông tin quản lý thành công!",
            });
          } else {
            setApiError(
              response.data.message || "Không thể cập nhật thông tin quản lý!"
            );
          }
        } catch (error) {
          console.error("Error updating manager:", error);
          setApiError("Không thể cập nhật thông tin quản lý!");
        }
      } else {
        try {
          const response = await axios.post(
            "https://instrulearnapplication.azurewebsites.net/api/Manager/create",
            {
              email: values.email,
              username: values.username,
              fullname: values.fullname,
              password: values.password,
              phoneNumber: values.phoneNumber,
            }
          );
          if (response.data.isSucceed) {
            setApiError("");
            setIsModalOpen(false);
            form.resetFields();
            setAvatarUrl(null);
            setUploadFile(null);
            setPreviewImage(null);
            setUploadStatus("");
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileKey((prev) => prev + 1);
            fetchManagers();
            setSuccessModal({
              open: true,
              message: "Thêm quản lý mới thành công!",
            });
          } else {
            setApiError(response.data.message || "Không thể thêm quản lý!");
          }
        } catch (error) {
          console.error("Error creating manager:", error);
          setApiError("Không thể thêm quản lý!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      setApiError("Không thể lưu thông tin quản lý!");
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
          ? `https://instrulearnapplication.azurewebsites.net/api/Manager/unban/${managerId}`
          : `https://instrulearnapplication.azurewebsites.net/api/Manager/delete/${managerId}`;

      const response = await axios.put(endpoint);

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
              setUploadFile(null);
              setPreviewImage(null);
              setApiError("");
              setUploadStatus("");
              setIsUploading(false);
              setUploadProgress(0);
              setUploadFileKey((prev) => prev + 1);
            }}
            width={700}
          >
            {apiError && (
              <div style={{ color: "red", marginBottom: 12, fontWeight: 500 }}>
                {apiError}
              </div>
            )}
            <Form form={form} layout="vertical">
              {editingManager ? (
                <>
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
                          {
                            max: 50,
                            message: "Họ và tên không được vượt quá 50 ký tự!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          maxLength={50}
                          showCount
                        />
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
                          {
                            max: 50,
                            message:
                              "Tên đăng nhập không được vượt quá 50 ký tự!",
                          },
                          {
                            pattern: /^[a-zA-Z0-9\s]*$/,
                            message:
                              "Tên đăng nhập không được chứa ký tự đặc biệt!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          maxLength={50}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                          {
                            max: 50,
                            message: "Email không được vượt quá 50 ký tự!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          maxLength={50}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
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
                            message: "Số điện thoại phải có 10 chữ số!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          maxLength={10}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}></Col>
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
                        <Select placeholder="Chọn giới tính">
                          <Option value="Nam">Nam</Option>
                          <Option value="Nữ">Nữ</Option>
                          <Option value="Khác">Khác</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[
                          { required: true, message: "Vui lòng nhập địa chỉ!" },
                          {
                            max: 100,
                            message: "Địa chỉ không được vượt quá 100 ký tự!",
                          },
                        ]}
                      >
                        <Input.TextArea rows={2} maxLength={100} showCount />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="dateOfEmployment"
                        label="Ngày bắt đầu làm việc"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn ngày bắt đầu làm việc!",
                          },
                        ]}
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                  <Form.Item
                    name="avatar"
                    label="Ảnh đại diện"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng tải lên ảnh đại diện!",
                      },
                    ]}
                    hidden={true}
                  >
                    <Input disabled />
                  </Form.Item>
                  <div className="mb-4 border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center mb-3">
                      <PictureOutlined className="mr-2 text-blue-600" />
                      <span className="font-medium">Tải ảnh đại diện</span>
                    </div>
                    <div className="mb-3">
                      <input
                        key={uploadFileKey}
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="block w-full text-sm border border-gray-300 rounded-md p-2 hover:border-blue-500 transition-colors"
                      />
                    </div>
                    {uploadFile && !isUploading && (
                      <Button
                        type="primary"
                        onClick={handleUploadImage}
                        icon={<UploadOutlined />}
                        block
                        className="rounded-md"
                      >
                        Tải ảnh lên
                      </Button>
                    )}
                    {isUploading && (
                      <div className="mt-2">
                        <Progress
                          percent={uploadProgress}
                          size="small"
                          status="active"
                          strokeColor="#1890ff"
                        />
                        <span className="block mt-1 text-center text-gray-500">
                          {uploadStatus}
                        </span>
                      </div>
                    )}
                    {uploadStatus === "Tải ảnh thành công!" && !isUploading && (
                      <div className="mt-2">
                        <span className="text-green-600">
                          Ảnh đã được tải lên thành công!
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {previewImage || editingManager?.avatar ? (
                      <div className="text-center">
                        <img
                          src={previewImage || editingManager?.avatar}
                          alt="Preview"
                          className="max-w-full h-auto border rounded-lg shadow-sm"
                          style={{ maxHeight: "200px" }}
                        />
                        <span className="block mt-2 text-gray-500">
                          Xem trước ảnh đại diện
                        </span>
                      </div>
                    ) : (
                      <div
                        className="border rounded-lg flex items-center justify-center bg-gray-50"
                        style={{ height: "200px" }}
                      >
                        <div className="text-center text-gray-400">
                          <IdcardOutlined style={{ fontSize: "32px" }} />
                          <p>Chưa có ảnh xem trước</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
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
                          {
                            max: 50,
                            message: "Họ và tên không được vượt quá 50 ký tự!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          maxLength={50}
                          showCount
                        />
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
                          {
                            max: 50,
                            message:
                              "Tên đăng nhập không được vượt quá 50 ký tự!",
                          },
                          {
                            pattern: /^[a-zA-Z0-9\s]*$/,
                            message:
                              "Tên đăng nhập không được chứa ký tự đặc biệt!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          maxLength={50}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                          {
                            max: 50,
                            message: "Email không được vượt quá 50 ký tự!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          maxLength={50}
                          showCount
                        />
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
                            min: 8,
                            message: "Mật khẩu phải có ít nhất 8 ký tự!",
                          },
                          {
                            max: 50,
                            message: "Mật khẩu không được vượt quá 50 ký tự!",
                          },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          maxLength={50}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
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
                            message: "Số điện thoại phải có 10 chữ số!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          maxLength={10}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                </>
              )}
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
                  {selectedManager.avatar ? (
                    <Avatar
                      size={100}
                      src={selectedManager.avatar}
                      className="border-2 border-gray-200 shadow-md"
                    />
                  ) : (
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      className="bg-purple-500"
                    />
                  )}
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedManager.fullname}
                  </h2>
                  <p className="text-gray-500">{selectedManager.username}</p>
                </div>
                <Divider />
                <Card title="Thông tin chi tiết" bordered={false}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Email">
                      <MailOutlined className="mr-2" />
                      {selectedManager.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <PhoneOutlined className="mr-2" />
                      {selectedManager.phoneNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      {selectedManager.gender || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {selectedManager.address || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu làm việc">
                      {selectedManager.dateOfEmployment || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={selectedManager.isActive === 1 ? "green" : "red"}
                      >
                        {selectedManager.isActive === 1
                          ? "Hoạt động"
                          : "Đã khóa"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </Modal>

          {/* Modal thông báo thành công */}
          <Modal
            open={successModal.open}
            onOk={() => setSuccessModal({ ...successModal, open: false })}
            onCancel={() => setSuccessModal({ ...successModal, open: false })}
            footer={[
              <Button
                key="ok"
                type="primary"
                onClick={() =>
                  setSuccessModal({ ...successModal, open: false })
                }
              >
                Đóng
              </Button>,
            ]}
            centered
            closable={false}
            bodyStyle={{ textAlign: "center", padding: 32 }}
          >
            <CheckCircleIcon
              style={{ color: "#52c41a", fontSize: 64, marginBottom: 16 }}
            />
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              {successModal.message}
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerManagement;
