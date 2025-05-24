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
  DatePicker,
  Progress,
  Typography,
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
  PictureOutlined,
  FileImageOutlined,
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

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;

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

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddMajorModalOpen, setIsAddMajorModalOpen] = useState(false);
  const [isUpdateMajorModalOpen, setIsUpdateMajorModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("teacher");
  const [form] = Form.useForm();
  const [majorForm] = Form.useForm();
  const [updateMajorForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchMajors();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Teacher/get-all"
      );
      if (response.data && Array.isArray(response.data)) {
        // Lọc các phản hồi thành công và map dữ liệu
        const validTeachers = response.data
          .filter((item) => item.isSucceed)
          .map((item) => ({
            ...item.data,
            majorName: item.data.majors
              .map((major) => major.majorName)
              .join(", "),
            majorIds: item.data.majors.map((major) => major.majorId),
            isBanned: item.data.isActive === 0,
            email: item.data.email || "",
            heading: item.data.heading || "Chưa cập nhật",
            details: item.data.details || "Chưa cập nhật",
            links: item.data.links || "",
            phoneNumber: item.data.phoneNumber || "",
            gender: item.data.gender || null,
            address: item.data.address || "",
            avatar: item.data.avatar || null,
            dateOfEmployment: item.data.dateOfEmployment || null,
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
        "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
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
    setAvatarUrl(null);
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadStatus("");
    setPreviewImage("");
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingTeacher(record);
    const formValues = {
      ...record,
      gender:
        record.gender === "male"
          ? "Nam"
          : record.gender === "female"
          ? "Nữ"
          : record.gender === "other"
          ? "Khác"
          : record.gender,
      majorId: record.majorIds?.[0],
      dateOfEmployment: record.dateOfEmployment
        ? dayjs(record.dateOfEmployment)
        : null,
    };
    form.setFieldsValue(formValues);
    setAvatarUrl(record.avatar);
    setPreviewImage("");
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
        try {
          const response = await axios.put(
            `https://instrulearnapplication.azurewebsites.net/api/Teacher/update/${editingTeacher.teacherId}`,
            {
              email: editingTeacher.email,
              heading: values.heading,
              details: values.details,
              links: values.links,
              phoneNumber: values.phoneNumber,
              gender: values.gender,
              address: values.address,
              avatar: values.avatar,
            }
          );
          if (response.data.isSucceed) {
            message.success("Cập nhật thông tin giáo viên thành công!");
            setIsModalOpen(false);
            setEditingTeacher(null);
            form.resetFields();
            fetchTeachers();
          } else {
            message.error(
              response.data.message || "Không thể cập nhật thông tin giáo viên!"
            );
          }
        } catch (error) {
          console.error("Error updating teacher:", error);
          message.error("Không thể cập nhật thông tin giáo viên!");
        }
      } else {
        try {
          const response = await axios.post(
            "https://instrulearnapplication.azurewebsites.net/api/Teacher/create",
            {
              majorIds: values.majorIds,
              email: values.email,
              username: values.username,
              fullname: values.fullname,
              password: values.password,
              phoneNumber: values.phoneNumber,
              dateOfEmployment: values.dateOfEmployment
                ? values.dateOfEmployment.format("YYYY-MM-DD")
                : null,
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
    // Lấy lại thông tin giáo viên mới nhất từ teachers (theo id)
    const latest =
      teachers.find((t) => t.teacherId === record.teacherId) || record;
    setSelectedTeacher(latest);
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
        ? `https://instrulearnapplication.azurewebsites.net/api/Teacher/unban/${teacherId}`
        : `https://instrulearnapplication.azurewebsites.net/api/Teacher/ban/${teacherId}`;

      const response = await axios.put(endpoint);

      if (response.data.isSucceed) {
        message.success(
          isBanned
            ? "Mở khóa tài khoản thành công!"
            : "Khóa tài khoản thành công!"
        );
        fetchTeachers();
      } else {
        throw new Error(
          response.data.message || "Không thể thực hiện thao tác!"
        );
      }
    } catch (error) {
      console.error("Error banning/unbanning teacher:", error);
      message.error(error.message || "Không thể thực hiện thao tác!");
    }
  };

  const handleAddMajor = async () => {
    try {
      const values = await majorForm.validateFields();
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Major/create",
        {
          majorName: values.majorName,
          teacherId: selectedTeacher?.teacherId,
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

  const handleUpdateMajor = (record) => {
    setSelectedTeacher(record);
    updateMajorForm.setFieldsValue({
      majorId: record.majorIds || [],
    });
    setIsUpdateMajorModalOpen(true);
  };

  const handleUpdateMajorSubmit = async () => {
    try {
      const values = await updateMajorForm.validateFields();
      const majorIds = Array.isArray(values.majorId)
        ? values.majorId
        : [values.majorId];
      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Teacher/update-major/${selectedTeacher.teacherId}`,
        {
          majorIds: majorIds,
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật nhạc cụ thành công!");
        setIsUpdateMajorModalOpen(false);
        fetchTeachers();
      } else {
        message.error(response.data.message || "Không thể cập nhật nhạc cụ!");
      }
    } catch (error) {
      console.error("Error updating major:", error);
      message.error("Không thể cập nhật nhạc cụ!");
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
      `avatars/${editingTeacher?.teacherId}-${Date.now()}-${uploadFile.name}`
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
          form.setFieldsValue({ avatar: downloadURL });
          setUploadStatus("Tải ảnh thành công!");
          setIsUploading(false);
          message.success("Tải ảnh lên thành công");
        });
      }
    );
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
      title: "Kinh nghiệm",
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
            title="Chỉnh sửa thông tin"
          />
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => handleUpdateMajor(record)}
            title="Cập nhật nhạc cụ"
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
              title={record.isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
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
              {editingTeacher ? (
                <>
                  <Form.Item
                    name="heading"
                    label="Kinh nghiệm"
                    rules={[
                      { required: true, message: "Vui lòng nhập kinh nghiệm!" },
                      {
                        max: 50,
                        message: "Kinh nghiệm không được vượt quá 50 ký tự!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: Kinh nghiệm 10 năm giảng dạy"
                      maxLength={50}
                    />
                  </Form.Item>

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
                      placeholder="Nhập email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="details"
                    label="Mô tả"
                    rules={[
                      { required: true, message: "Vui lòng nhập mô tả!" },
                      {
                        max: 250,
                        message: "Mô tả không được vượt quá 250 ký tự!",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Nhập mô tả về giáo viên"
                      maxLength={250}
                    />
                  </Form.Item>

                  <Form.Item
                    name="links"
                    label="Liên kết"
                    rules={[
                      { required: true, message: "Vui lòng nhập liên kết!" },
                    ]}
                  >
                    <Input placeholder="Nhập liên kết (Facebook, YouTube, etc.)" />
                  </Form.Item>

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
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>

                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính!" },
                    ]}
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="Nam">Nam</Option>
                      <Option value="Nữ">Nữ</Option>
                      <Option value="Khác">Khác</Option>
                    </Select>
                  </Form.Item>

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
                    <Input.TextArea
                      rows={2}
                      placeholder="Nhập địa chỉ của giáo viên"
                      maxLength={100}
                    />
                  </Form.Item>

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
                      <Text strong>Tải ảnh đại diện</Text>
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
                        <Text
                          type="secondary"
                          className="block mt-1 text-center"
                        >
                          {uploadStatus}
                        </Text>
                      </div>
                    )}

                    {uploadStatus === "Tải ảnh thành công!" && !isUploading && (
                      <div className="mt-2">
                        <Text type="success">
                          Ảnh đã được tải lên thành công!
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    {previewImage || editingTeacher?.avatar ? (
                      <div className="text-center">
                        <img
                          src={previewImage || editingTeacher?.avatar}
                          alt="Preview"
                          className="max-w-full h-auto border rounded-lg shadow-sm"
                          style={{ maxHeight: "200px" }}
                        />
                        <Text type="secondary" className="block mt-2">
                          Xem trước ảnh đại diện
                        </Text>
                      </div>
                    ) : (
                      <div
                        className="border rounded-lg flex items-center justify-center bg-gray-50"
                        style={{ height: "200px" }}
                      >
                        <div className="text-center text-gray-400">
                          <FileImageOutlined style={{ fontSize: "32px" }} />
                          <p>Chưa có ảnh xem trước</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Form.Item
                    name="fullname"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên!" },
                      {
                        max: 50,
                        message: "Họ và tên không được vượt quá 50 ký tự!",
                      },
                      {
                        pattern: /^[a-zA-Z0-9\s]*$/,
                        message: "Họ và tên không được chứa ký tự đặc biệt!",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} maxLength={50} />
                  </Form.Item>

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
                        message: "Tên đăng nhập không được vượt quá 50 ký tự!",
                      },
                      {
                        pattern: /^[a-zA-Z0-9\s]*$/,
                        message:
                          "Tên đăng nhập không được chứa ký tự đặc biệt!",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} maxLength={50} />
                  </Form.Item>

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
                      placeholder="Nhập email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                      {
                        max: 50,
                        message: "Mật khẩu không được vượt quá 50 ký tự!",
                      },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} maxLength={50} />
                  </Form.Item>

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
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>

                  <Form.Item
                    name="dateOfEmployment"
                    label="Ngày bắt đầu giảng dạy"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày bắt đầu giảng dạy!",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    name="majorIds"
                    label="Nhạc cụ"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất một nhạc cụ!",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn một hoặc nhiều nhạc cụ"
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
                      <Text strong>Tải ảnh đại diện</Text>
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
                        <Text
                          type="secondary"
                          className="block mt-1 text-center"
                        >
                          {uploadStatus}
                        </Text>
                      </div>
                    )}

                    {uploadStatus === "Tải ảnh thành công!" && !isUploading && (
                      <div className="mt-2">
                        <Text type="success">
                          Ảnh đã được tải lên thành công!
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    {previewImage || editingTeacher?.avatar ? (
                      <div className="text-center">
                        <img
                          src={previewImage || editingTeacher?.avatar}
                          alt="Preview"
                          className="max-w-full h-auto border rounded-lg shadow-sm"
                          style={{ maxHeight: "200px" }}
                        />
                        <Text type="secondary" className="block mt-2">
                          Xem trước ảnh đại diện
                        </Text>
                      </div>
                    ) : (
                      <div
                        className="border rounded-lg flex items-center justify-center bg-gray-50"
                        style={{ height: "200px" }}
                      >
                        <div className="text-center text-gray-400">
                          <FileImageOutlined style={{ fontSize: "32px" }} />
                          <p>Chưa có ảnh xem trước</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
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
                  {selectedTeacher.avatar ? (
                    <Avatar
                      size={100}
                      src={selectedTeacher.avatar}
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
                    {selectedTeacher.fullname}
                  </h2>
                  <p className="text-gray-500">{selectedTeacher.majorName}</p>
                </div>

                <Divider />

                <Card title="Thông tin chi tiết" bordered={false}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Email">
                      {selectedTeacher.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {selectedTeacher.phoneNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      {selectedTeacher.gender === "Nam" ||
                      selectedTeacher.gender === "Nữ" ||
                      selectedTeacher.gender === "Khác"
                        ? selectedTeacher.gender
                        : selectedTeacher.gender === "male"
                        ? "Nam"
                        : selectedTeacher.gender === "female"
                        ? "Nữ"
                        : selectedTeacher.gender === "other"
                        ? "Khác"
                        : "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {selectedTeacher.address || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kinh nghiệm">
                      {selectedTeacher.heading || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                      {selectedTeacher.details || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Liên kết">
                      {selectedTeacher.links ? (
                        <a
                          href={selectedTeacher.links}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {selectedTeacher.links}
                        </a>
                      ) : (
                        "Chưa cập nhật"
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </Modal>

          {/* Modal cập nhật nhạc cụ */}
          <Modal
            title="Cập nhật nhạc cụ"
            open={isUpdateMajorModalOpen}
            onOk={handleUpdateMajorSubmit}
            onCancel={() => {
              setIsUpdateMajorModalOpen(false);
              updateMajorForm.resetFields();
            }}
            width={500}
          >
            <Form form={updateMajorForm} layout="vertical">
              <Form.Item
                name="majorId"
                label="Nhạc cụ"
                rules={[{ required: true, message: "Vui lòng chọn nhạc cụ!" }]}
              >
                <Select
                  mode="multiple"
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherManagement;
