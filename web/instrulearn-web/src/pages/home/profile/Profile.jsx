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
  Dropdown,
  Menu,
  Drawer,
  List,
  Collapse,
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
  HistoryOutlined,
  MenuOutlined,
  HomeOutlined,
  RightOutlined,
  AppstoreOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
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
import TransactionHistory from "./TransactionHistory";
import MyLibrary from "./MyLibrary";
import TeacherEvaluations from "./MyCourse";

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
const { Panel } = Collapse;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditInfoModalVisible, setIsEditInfoModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // Firebase upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [activeContent, setActiveContent] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const [visible, setVisible] = useState(false);

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
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
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

  // Xử lý callback từ PayOS
  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Decode URL trước khi parse
        const decodedSearch = decodeURIComponent(window.location.search);
        console.log("Decoded search:", decodedSearch);

        // Parse URL để lấy tất cả các params
        const urlParams = new URLSearchParams(decodedSearch);

        // Log tất cả các params để debug
        const allParams = {};
        urlParams.forEach((value, key) => {
          allParams[key] = value;
        });
        console.log("All URL params:", allParams);

        // Lấy orderCode và status từ URL
        const orderCode = urlParams.get("orderCode");
        const status = urlParams.get("status");

        console.log("Payment params check:", {
          orderCode,
          status,
          hasOrderCode: !!orderCode,
          hasStatus: !!status,
        });

        if (orderCode && status) {
          const token = localStorage.getItem("authToken");

          console.log("Calling payment status update API with:", {
            orderCode: parseInt(orderCode),
            status: status,
          });

          try {
            // Gọi API cập nhật trạng thái thanh toán
            const response = await axios.put(
              `https://instrulearnapplication.azurewebsites.net/api/wallet/update-payment-status-by-ordercode`,
              {
                orderCode: parseInt(orderCode),
                status: status,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("API Response:", response.data);

            if (response.data.isSucceed) {
              message.success("Cập nhật trạng thái thanh toán thành công");
              // Reload trang profile để cập nhật số dư
              window.location.href = "/profile";
            } else {
              message.error(
                response.data.message ||
                  "Cập nhật trạng thái thanh toán thất bại"
              );
            }
          } catch (error) {
            console.error("API call error:", error.response?.data || error);
            message.error("Có lỗi xảy ra khi cập nhật trạng thái thanh toán");
          }
        }
      } catch (error) {
        console.error("Error processing payment callback:", error);
        message.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
      }
    };

    // Kiểm tra xem URL có chứa params thanh toán không
    const hasPaymentParams =
      window.location.search.includes("orderCode") &&
      window.location.search.includes("status");

    if (hasPaymentParams) {
      console.log("Detected payment callback, processing...");
      handlePaymentCallback();
    }
  }, [location.search]); // Chạy lại khi URL thay đổi

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

  const showEditModal = () => {
    if (!profile) return;

    form.setFieldsValue({
      avatar: profile?.avatar || "",
    });
    setIsEditModalVisible(true);
  };

  const showEditInfoModal = () => {
    if (!profile) return;

    form.setFieldsValue({
      fullName: profile?.fullName || localStorage.getItem("fullName"),
      phoneNumber: profile?.phoneNumber || "",
      gender: profile?.gender || undefined,
      address: profile?.address || "",
    });
    setIsEditInfoModalVisible(true);
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

      // Sử dụng dữ liệu hiện tại cho các trường khác
      const updateData = {
        phoneNumber: profile.phoneNumber || "",
        gender: profile.gender || "",
        address: profile.address || "",
        avatar: values.avatar,
      };

      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Learner/update/${profile.learnerId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật ảnh đại diện thành công!");
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

  const handleUpdateInfo = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      if (!profile?.learnerId) {
        throw new Error("Không tìm thấy ID người dùng");
      }

      // Sử dụng dữ liệu hiện tại cho avatar
      const updateData = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || "",
        gender: values.gender || "",
        address: values.address || "",
        avatar: profile.avatar || "",
      };

      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/Learner/update/${profile.learnerId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật thông tin thành công!");
        setIsEditInfoModalVisible(false);
        // Cập nhật lại localStorage
        localStorage.setItem("fullName", values.fullName);
        fetchProfile();
      } else {
        throw new Error(response.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const renderMenuContent = () => {
    switch (selectedMenu) {
      case "profile":
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
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
                          {profile?.fullName ||
                            localStorage.getItem("fullName") ||
                            "Chưa cập nhật"}
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
                          {profile?.email || "Chưa cập nhật"}
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
                          {profile?.username || "Chưa cập nhật"}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                className="h-full shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100"
                title={
                  <div className="flex items-center justify-between text-lg font-medium">
                    <div className="flex items-center">
                      <UserOutlined className="text-purple-700 mr-2" />
                      <span>Thông tin bổ sung</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={showEditInfoModal}
                      className="bg-purple-700 hover:bg-purple-800"
                    >
                      Chỉnh sửa
                    </Button>
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
                        {profile?.phoneNumber || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="block mb-1">
                      Giới tính
                    </Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile?.gender || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="block mb-1">
                      Địa chỉ
                    </Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile?.address || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        );
      case "registrations":
        return <MyRegistrations />;
      case "schedule":
        return <MySchedule />;
      case "courses":
        return <TeacherEvaluations />;
      case "achievements":
        return <Achievements achievements={achievements} />;
      case "wallet":
        return <WalletComponent />;
      case "transactions":
        return <TransactionHistory />;
      case "library":
        return <MyLibrary />;
      default:
        return (
          <div className="text-center py-12">
            <Text>Vui lòng chọn một mục từ menu</Text>
          </div>
        );
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined className="text-lg" />,
      label: "Thông tin cá nhân",
    },
    {
      key: "registrations",
      icon: <FormOutlined className="text-lg" />,
      label: "Đăng ký học",
    },
    {
      key: "schedule",
      icon: <CalendarOutlined className="text-lg" />,
      label: "Lịch học",
    },
    {
      key: "library",
      icon: <ReadOutlined className="text-lg" />,
      label: "Thư viện khóa học online",
    },
    {
      key: "courses",
      icon: <BookOutlined className="text-lg" />,
      label: "Đánh giá của giáo viên",
    },
    // {
    //   key: "achievements",
    //   icon: <TrophyOutlined className="text-lg" />,
    //   label: "Thành tích",
    // },
    {
      key: "wallet",
      icon: <WalletOutlined className="text-lg" />,
      label: "Ví của tôi",
    },
    {
      key: "transactions",
      icon: <HistoryOutlined className="text-lg" />,
      label: "Lịch sử giao dịch",
    },
  ];

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

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <Card className="shadow-lg rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 -mt-5 -mx-5 mb-6">
          <Row gutter={24} align="middle">
            <Col
              xs={24}
              md={6}
              className="text-center md:text-left mb-4 md:mb-0"
            >
              <div className="relative inline-block">
                <div className="relative">
                  <Avatar
                    size={120}
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
              <Title level={2} className="text-white mb-1">
                {profile?.fullName ||
                  localStorage.getItem("fullName") ||
                  "Chưa cập nhật"}
              </Title>
              <Text className="text-purple-200 text-lg block mb-2">
                @{profile?.username || ""}
              </Text>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Tag className="bg-purple-800 text-white border-purple-600 px-3 py-1">
                  <BookOutlined className="mr-1" />{" "}
                  {profile?.role ? convertRoleToVietnamese(profile.role) : ""}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <Button
            type="primary"
            onClick={() => setVisible(true)}
            icon={<MenuOutlined />}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Menu
          </Button>
        </div>

        {/* Desktop and Mobile Layout */}
        <Row gutter={24}>
          {/* Desktop Menu - Left Sidebar */}
          <Col xs={0} md={6} lg={5} className="hidden md:block">
            <Card className="sticky top-4 shadow-sm">
              <Menu
                mode="vertical"
                selectedKeys={[selectedMenu]}
                style={{ borderRight: 0 }}
                onClick={({ key }) => setSelectedMenu(key)}
                items={menuItems}
                className="profile-menu"
              />
            </Card>
          </Col>

          {/* Content Area */}
          <Col xs={24} md={18} lg={19}>
            <div className="bg-white rounded-lg">
              <div className="flex items-center mb-4 border-b pb-3">
                <div className="flex-1">
                  <Title level={4} className="mb-0">
                    {menuItems.find((item) => item.key === selectedMenu)
                      ?.label || "Thông tin cá nhân"}
                  </Title>
                </div>
                <Button
                  type="link"
                  icon={<HomeOutlined />}
                  onClick={() => setSelectedMenu("profile")}
                  className="hidden xs:inline-block"
                >
                  Trang chủ
                </Button>
              </div>

              {renderMenuContent()}
            </div>
          </Col>
        </Row>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setVisible(false)}
          visible={visible}
          width={280}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="vertical"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => {
              setSelectedMenu(key);
              setVisible(false);
            }}
            items={menuItems}
            style={{ borderRight: 0 }}
            className="profile-menu-mobile"
          />
        </Drawer>

        {/* Edit Profile Modal */}
        <Modal
          title="Cập nhật ảnh đại diện"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
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

        {/* Edit Info Modal */}
        <Modal
          title="Cập nhật thông tin bổ sung"
          open={isEditInfoModalVisible}
          onCancel={() => setIsEditInfoModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateInfo}>
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

            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditInfoModalVisible(false)}>
                Hủy
              </Button>
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

export default Profile;
