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
  Input,
  Alert,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  FormOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import EnrolledCourses from "./MyCourse";
import Achievements from "./Achievements";
import WalletComponent from "./MyWallet";
import MyRegistrations from "./MyRegistrations";

const { Title, Text } = Typography;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();

  useEffect(() => {
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
          setProfile(response.data.data);
          setEditedData(response.data.data);
          if (response.data.data.username) {
            localStorage.setItem("username", response.data.data.username);
          }
        } else {
          throw new Error(
            response.data.message || "Không thể lấy thông tin hồ sơ"
          );
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

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

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfile(editedData);
      setEditing(false);
      message.success({
        content: "Cập nhật thông tin thành công!",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin.");
    }
  };

  const handleCancelEdit = () => {
    setEditedData(profile);
    setEditing(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
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
                  <UserOutlined className="text-purple-700 mr-2" />
                  <span>Thông tin cá nhân</span>
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
                      {editing ? (
                        <Input
                          value={editedData.fullName}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              fullName: e.target.value,
                            })
                          }
                          className="mt-1"
                          placeholder="Nhập họ và tên của bạn"
                        />
                      ) : (
                        <Text strong className="text-lg">
                          {profile.fullName || "Chưa cập nhật"}
                        </Text>
                      )}
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
                      {editing ? (
                        <Input
                          value={editedData.email}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              email: e.target.value,
                            })
                          }
                          className="mt-1"
                          placeholder="Nhập email của bạn"
                        />
                      ) : (
                        <Text strong className="text-lg">
                          {profile.email || "Chưa cập nhật"}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                  <div className="flex-1">
                    <Text type="secondary" className="block mb-1">
                      Số điện thoại
                    </Text>
                    <div>
                      {editing ? (
                        <Input
                          value={editedData.phoneNumber}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="mt-1"
                          placeholder="Nhập số điện thoại của bạn"
                        />
                      ) : (
                        <Text strong className="text-lg">
                          {profile.phoneNumber || "Chưa cập nhật"}
                        </Text>
                      )}
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
                  <LockOutlined className="text-purple-700 mr-2" />
                  <span>Thông tin tài khoản</span>
                </div>
              }
            >
              <div className="space-y-8">
                <div>
                  <Text type="secondary" className="block mb-1">
                    ID học viên
                  </Text>
                  <div>
                    <Text
                      strong
                      className="text-lg bg-gray-50 px-3 py-1 rounded border border-gray-100"
                    >
                      {profile.learnerId}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="block mb-1">
                    Tên đăng nhập
                  </Text>
                  <div>
                    <Text strong className="text-lg">
                      {profile.username}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="block mb-1">
                    Cấp độ tài khoản
                  </Text>
                  <div>
                    <Tag
                      color="purple"
                      className="mt-1 text-base font-medium px-3 py-1"
                    >
                      <SafetyCertificateOutlined className="mr-1" />
                      Học viên chính thức
                    </Tag>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                {editing ? (
                  <>
                    <Button onClick={handleCancelEdit}>Huỷ</Button>
                    <Button
                      type="primary"
                      onClick={handleSaveProfile}
                      className="bg-purple-700 hover:bg-purple-800"
                      loading={loading}
                    >
                      Lưu thay đổi
                    </Button>
                  </>
                ) : (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    className="bg-purple-700 hover:bg-purple-800"
                  >
                    Cập nhật thông tin
                  </Button>
                )}
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
          <BookOutlined className="mr-2" /> Khoá học của tôi
        </span>
      ),
      children: <EnrolledCourses courses={enrolledCourses} />,
    },
    {
      key: "4",
      label: (
        <span className="flex items-center text-base">
          <TrophyOutlined className="mr-2" /> Thành tích
        </span>
      ),
      children: <Achievements achievements={achievements} />,
    },
    {
      key: "5",
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
              <Badge
                count={
                  <SafetyCertificateOutlined
                    style={{
                      color: "#f56a00",
                      fontSize: "1.5rem",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: "8px",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                    }}
                  />
                }
                offset={[-10, 10]}
              >
                <Avatar
                  size={150}
                  icon={<UserOutlined />}
                  className="bg-white text-purple-700 border-4 border-white shadow-lg"
                />
              </Badge>
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
                  <BookOutlined className="mr-1" /> Học viên
                </Tag>
                <Tag className="bg-purple-800 text-white border-purple-600 px-3 py-1 text-base">
                  <CalendarOutlined className="mr-1" /> Tham gia từ tháng 1/2025
                </Tag>
                <Tag className="bg-purple-800 text-white border-purple-600 px-3 py-1 text-base">
                  <TrophyOutlined className="mr-1" /> {achievements.length}{" "}
                  thành tích
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
      </Card>
    </div>
  );
};

export default Profile;
