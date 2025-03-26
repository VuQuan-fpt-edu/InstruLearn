import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Button,
  Row,
  Col,
  Skeleton,
  Badge,
  Tabs,
  message,
  Tag,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Progress,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  FormOutlined,
  EditOutlined,
  UploadOutlined,
  FileImageOutlined,
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

import EnrolledCourses from "./MyCourse";
import Achievements from "./Achievements";
import WalletComponent from "./MyWallet";
import MyRegistrations from "./MyRegistrations";
import MySchedule from "./MySchedule";

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

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Firebase upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const convertRoleToVietnamese = (role) => {
    const roleMap = {
      learner: "Học viên",
      Learner: "Học viên",
      LEARNER: "Học viên",
    };
    return roleMap[role] || role;
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        const profileData = response.data.data;
        setProfile(profileData);
        if (profileData.username) {
          localStorage.setItem("username", profileData.username);
        }
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

  const enrolledCourses = [
    {
      id: 1,
      name: "Khoá học Guitar cơ bản",
      progress: 75,
      lastAccessed: "02/03/2025",
      image: "guitar-course.jpg",
      totalLessons: 20,
      completedLessons: 15,
    },
    {
      id: 2,
      name: "Piano cho người mới bắt đầu",
      progress: 30,
      lastAccessed: "28/02/2025",
      image: "piano-course.jpg",
      totalLessons: 24,
      completedLessons: 7,
    },
  ];

  const achievements = [
    {
      id: 1,
      name: "Hoàn thành khoá học đầu tiên",
      date: "20/01/2025",
      icon: <TrophyOutlined />,
      description: "Bạn đã hoàn thành toàn bộ bài học trong một khoá học",
    },
    {
      id: 2,
      name: "Tham gia 10 buổi học liên tiếp",
      date: "15/02/2025",
      icon: <SafetyCertificateOutlined />,
      description: "Bạn đã học tập đều đặn 10 ngày liên tiếp",
    },
    {
      id: 3,
      name: "Người học chăm chỉ",
      date: "01/03/2025",
      icon: <CheckCircleOutlined />,
      description: "Hoàn thành ít nhất 3 bài học mỗi tuần trong 1 tháng",
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
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
      `profile-images/${Date.now()}-${uploadFile.name}`
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

  const handleUpdateProfile = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      if (!profile?.learnerId) {
        throw new Error("Không tìm thấy ID người dùng");
      }

      const response = await axios.put(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Learner/update/${profile.learnerId}`,
        {
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          address: values.address,
          avatar: values.avatar,
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
        // Refresh profile data
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
    });
    setIsEditModalVisible(true);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto my-12 px-4">
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 -mt-5 -mx-5 mb-8">
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
      <div className="max-w-3xl mx-auto my-12 px-4">
        <Alert
          message="Lỗi Đăng Nhập"
          description={error}
          type="error"
          showIcon
          className="shadow-md rounded-lg"
          action={
            <Button
              type="primary"
              onClick={() => (window.location.href = "/login")}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Đăng nhập
            </Button>
          }
        />
      </div>
    );
  }

  const tabItems = [
    {
      key: "1",
      label: (
        <span className="flex items-center text-base">
          <UserOutlined className="mr-2" /> Thông tin cá nhân
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card
              className="h-full shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100"
              title={
                <div className="flex items-center text-lg font-medium">
                  <UserOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                  <span>Thông tin đăng ký</span>
                </div>
              }
            >
              <div className="space-y-8">
                <div className="flex items-start">
                  <UserOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                  <div className="flex-1">
                    <Text type="secondary" className="block mb-1">
                      Họ và tên
                    </Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile.fullName || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MailOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                  <div className="flex-1">
                    <Text type="secondary" className="block mb-1">
                      Email
                    </Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile.email || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <LockOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                  <div className="flex-1">
                    <Text type="secondary" className="block mb-1">
                      Tên đăng nhập
                    </Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile.username}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              className="h-full shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100"
              title={
                <div className="flex items-center text-lg font-medium">
                  <UserOutlined className="text-purple-700 mr-2" />
                  <span>Thông tin bổ sung</span>
                </div>
              }
            >
              <div className="space-y-8">
                <div>
                  <Text type="secondary" className="block mb-1">
                    Số điện thoại
                  </Text>
                  <div>
                    <Text strong className="text-lg">
                      {profile.phoneNumber || "Chưa cập nhật"}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Giới tính
                  </Text>
                  <div>
                    <Text strong className="text-lg">
                      {profile.gender || "Chưa cập nhật"}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">
                    Địa chỉ
                  </Text>
                  <div>
                    <Text strong className="text-lg">
                      {profile.address || "Chưa cập nhật"}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center text-base">
          <FormOutlined className="mr-2" /> Đăng ký học
        </span>
      ),
      children: <MyRegistrations />,
    },
    {
      key: "3",
      label: (
        <span className="flex items-center text-base">
          <CalendarOutlined className="mr-2" /> Lịch học
        </span>
      ),
      children: <MySchedule />,
    },
    {
      key: "4",
      label: (
        <span className="flex items-center text-base">
          <BookOutlined className="mr-2" /> Khoá học của tôi
        </span>
      ),
      children: <EnrolledCourses courses={enrolledCourses} />,
    },
    {
      key: "5",
      label: (
        <span className="flex items-center text-base">
          <TrophyOutlined className="mr-2" /> Thành tích
        </span>
      ),
      children: <Achievements achievements={achievements} />,
    },
    {
      key: "6",
      label: (
        <span className="flex items-center text-base">
          <WalletOutlined className="mr-2" /> Ví của tôi
        </span>
      ),
      children: <WalletComponent />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-8 -mt-5 -mx-5 mb-8">
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
                    className="bg-white text-purple-700 border-4 border-white shadow-lg"
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={showEditModal}
                    className="absolute bottom-0 right-0 bg-purple-700 hover:bg-purple-800"
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} md={18} className="text-center md:text-left">
              <Title level={1} className="text-white mb-1 text-3xl md:text-4xl">
                {profile.fullName}
              </Title>
              <Text className="text-purple-200 text-xl block mb-4">
                @{profile.username}
              </Text>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Tag className="bg-purple-800 text-white border-purple-600 px-3 py-1 text-base">
                  <BookOutlined className="mr-1" />{" "}
                  {convertRoleToVietnamese(profile.role)}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>

        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={handleTabChange}
          size="large"
          className="profile-tabs"
          items={tabItems}
        />

        <Modal
          title="Cập nhật thông tin cá nhân"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
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

            <Form.Item name="gender" label="Giới tính">
              <Select>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea rows={3} />
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
              <Button
                type="primary"
                htmlType="submit"
                disabled={!form.getFieldValue("avatar")}
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Profile;
