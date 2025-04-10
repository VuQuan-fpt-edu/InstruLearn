import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Button,
  Row,
  Col,
  Skeleton,
  Tag,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  Progress,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  BookOutlined,
  EditOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import dayjs from "dayjs";

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

const { Title, Text } = Typography;
const { Option } = Select;

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Firebase upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        const profileData = response.data.data;
        setProfile(profileData);
      } else {
        throw new Error(
          response.data.message || "Không thể lấy thông tin hồ sơ"
        );
      }
    } catch (err) {
      console.error("Error details:", err);
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin hồ sơ");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

    const storageRef = ref(
      storage,
      `teacher-profile-images/${Date.now()}-${uploadFile.name}`
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

  const handleUpdateProfile = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      if (!profile?.teacherId) {
        throw new Error("Không tìm thấy ID giáo viên");
      }

      const response = await axios.put(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Teacher/update/${profile.teacherId}`,
        {
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          address: values.address,
          avatar: values.avatar,
          heading: values.heading,
          details: values.details,
          links: values.links,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật thông tin thành công!");
        setIsEditModalVisible(false);
        fetchProfile();
      } else {
        throw new Error(response.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const showEditModal = () => {
    form.setFieldsValue({
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      address: profile.address,
      avatar: profile.avatar,
      heading: profile.heading,
      details: profile.details,
      links: profile.links,
    });
    setIsEditModalVisible(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4">
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 -mt-5 -mx-5 mb-8">
            <Skeleton.Avatar active size={120} className="mb-4" />
            <Skeleton active paragraph={{ rows: 2 }} className="!bg-white/20" />
          </div>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Alert
          message="Lỗi Đăng Nhập"
          description={error}
          type="error"
          showIcon
          className="shadow-md rounded-lg"
          action={
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Đăng nhập
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="mb-4 flex justify-between items-center">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="bg-blue-700 hover:bg-blue-800"
        >
          Quay lại
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 -mt-5 -mx-5 mb-8">
          <Row gutter={24} align="middle">
            <Col
              xs={24}
              md={6}
              className="text-center md:text-left mb-6 md:mb-0"
            >
              <div className="relative inline-block">
                <div className="relative">
                  <Avatar
                    size={150}
                    src={profile?.avatar}
                    icon={!profile?.avatar && <UserOutlined />}
                    className="bg-white text-blue-700 border-4 border-white shadow-lg"
                  />
                  {/* <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={showEditModal}
                    className="absolute bottom-0 right-0 bg-blue-700 hover:bg-blue-800"
                  /> */}
                </div>
              </div>
            </Col>
            <Col xs={24} md={18} className="text-center md:text-left">
              <Title level={1} className="text-white mb-1 text-3xl md:text-4xl">
                {profile.fullname}
              </Title>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                <Tag className="bg-blue-800 text-white border-blue-600 px-3 py-1 text-base">
                  <BookOutlined className="mr-1" /> Giáo viên
                </Tag>
                {profile.majors?.map((major) => (
                  <Tag
                    key={major.majorId}
                    className="bg-blue-800 text-white border-blue-600 px-3 py-1 text-base"
                  >
                    {major.majorName}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card
              className="h-full shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100"
              title={
                <div className="flex items-center text-lg font-medium">
                  <UserOutlined className="text-blue-700 text-xl mr-4" />
                  <span>Thông tin cá nhân</span>
                </div>
              }
            >
              <div className="space-y-6">
                <div>
                  <Text type="secondary" className="block mb-1">
                    Số điện thoại
                  </Text>
                  <Text strong className="text-lg">
                    {profile.phoneNumber || "Chưa cập nhật"}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Giới tính
                  </Text>
                  <Text strong className="text-lg">
                    {profile.gender || "Chưa cập nhật"}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Địa chỉ
                  </Text>
                  <Text strong className="text-lg">
                    {profile.address || "Chưa cập nhật"}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              className="h-full shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100"
              title={
                <div className="flex items-center text-lg font-medium">
                  <CalendarOutlined className="text-blue-700 text-xl mr-4" />
                  <span>Thông tin khác</span>
                </div>
              }
            >
              <div className="space-y-6">
                <div>
                  <Text type="secondary" className="block mb-1">
                    Ngày bắt đầu làm việc
                  </Text>
                  <Text strong className="text-lg">
                    {profile.dateOfEmployment
                      ? dayjs(profile.dateOfEmployment).format("DD/MM/YYYY")
                      : "Chưa cập nhật"}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Kinh nghiệm
                  </Text>
                  <Text strong className="text-lg">
                    {profile.heading || "Chưa cập nhật"}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Mô tả
                  </Text>
                  <Text strong className="text-lg">
                    {profile.details || "Chưa cập nhật"}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Liên kết
                  </Text>
                  <Text strong className="text-lg">
                    {profile.links || "Chưa cập nhật"}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Cập nhật thông tin cá nhân"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
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
                <Form.Item name="gender" label="Giới tính">
                  <Select>
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item name="heading" label="Tiêu đề">
              <Input />
            </Form.Item>

            <Form.Item name="details" label="Chi tiết">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="links" label="Liên kết">
              <Input />
            </Form.Item>

            <Form.Item name="avatar" label="URL Ảnh đại diện" hidden={true}>
              <Input disabled />
            </Form.Item>

            <div className="mb-4">
              <Text strong>Tải ảnh đại diện</Text>
              <div className="mt-3 mb-3">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="block w-full text-sm border border-gray-300 rounded p-2"
                />
              </div>

              {uploadFile && !isUploading && (
                <div className="mt-2 mb-2">
                  <Button
                    type="primary"
                    onClick={handleUploadImage}
                    icon={<UploadOutlined />}
                    block
                  >
                    Tải ảnh lên
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="mt-2">
                  <Progress
                    percent={uploadProgress}
                    size="small"
                    status="active"
                  />
                  <Text type="secondary" className="block mt-1 text-center">
                    {uploadStatus}
                  </Text>
                </div>
              )}

              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full h-auto border rounded-md"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default TeacherProfile;
