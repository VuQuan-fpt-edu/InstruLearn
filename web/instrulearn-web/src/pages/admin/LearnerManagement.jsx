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
  Progress,
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
  UploadOutlined,
} from "@ant-design/icons";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const { Content } = Layout;
const { Option } = Select;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const LearnerManagement = () => {
  const [learners, setLearners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("learner");
  const [form] = Form.useForm();

  // Firebase upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Learner/get-all"
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
          ? `https://instrulearnapplication.azurewebsites.net/api/Learner/unban/${learnerId}`
          : `https://instrulearnapplication.azurewebsites.net/api/Learner/ban/${learnerId}`;

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

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        message.error("Vui lòng chỉ chọn file hình ảnh");
        return;
      }

      // Validate file size (maximum 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      setUploadFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
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

    // Create a storage reference with a unique filename
    const storageRef = ref(
      storage,
      `learner-avatars/${Date.now()}-${uploadFile.name}`
    );

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, uploadFile);

    // Monitor upload progress
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
        // Upload complete, get download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Set the avatar field with the Firebase URL
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
      if (editingLearner) {
        const updateData = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          address: values.address,
          avatar: values.avatar,
        };

        const response = await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/Learner/update/${editingLearner.learnerId}`,
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

  const handleViewDetail = async (record) => {
    try {
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Learner/${record.learnerId}`
      );
      if (response.data.isSucceed) {
        setSelectedLearner(response.data.data);
        setIsDetailModalOpen(true);
      } else {
        throw new Error(
          response.data.message || "Không thể lấy thông tin chi tiết!"
        );
      }
    } catch (error) {
      console.error("Error fetching learner details:", error);
      message.error("Không thể lấy thông tin chi tiết học viên!");
    }
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
                    <Input
                      prefix={<UserOutlined />}
                      disabled={!!editingLearner}
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
                ]}
              >
                <div className="space-y-4">
                  <Input
                    prefix={<PictureOutlined />}
                    placeholder="URL ảnh đại diện"
                    value={form.getFieldValue("avatar")}
                    readOnly
                  />

                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center mb-3">
                      <PictureOutlined className="mr-2 text-blue-600" />
                      <span className="font-medium">Tải ảnh lên</span>
                    </div>

                    <div className="mb-3">
                      <input
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
                        <div className="text-center text-gray-500 mt-1">
                          {uploadStatus}
                        </div>
                      </div>
                    )}

                    {previewImage && (
                      <div className="mt-4">
                        <div className="text-center">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full h-auto mx-auto border rounded-lg shadow-sm"
                            style={{ maxHeight: "200px" }}
                          />
                          <div className="text-gray-500 mt-2">
                            Xem trước ảnh đại diện
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                    size={120}
                    src={selectedLearner.avatar}
                    icon={!selectedLearner.avatar && <UserOutlined />}
                  />
                  <h2 className="text-xl font-semibold mt-3">
                    {selectedLearner.fullName}
                  </h2>
                  <p className="text-gray-500">{selectedLearner.username}</p>
                  <Tag
                    color={selectedLearner.isActive === 1 ? "green" : "red"}
                    className="mt-2"
                  >
                    {selectedLearner.isActive === 1 ? "Hoạt động" : "Đã khóa"}
                  </Tag>
                </div>

                <Divider />

                <Card
                  title="Thông tin cá nhân"
                  bordered={false}
                  className="mb-4"
                >
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Họ và tên" span={2}>
                      <UserOutlined className="mr-2" />
                      {selectedLearner.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <MailOutlined className="mr-2" />
                      {selectedLearner.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <PhoneOutlined className="mr-2" />
                      {selectedLearner.phoneNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      <UserSwitchOutlined className="mr-2" />
                      {selectedLearner.gender}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>
                      <EnvironmentOutlined className="mr-2" />
                      {selectedLearner.address}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Thông tin tài khoản" bordered={false}>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Mã học viên">
                      {selectedLearner.learnerId}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Mã tài khoản">
                      {selectedLearner.accountId}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Tên đăng nhập">
                      {selectedLearner.username}
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
