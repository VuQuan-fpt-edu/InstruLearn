import { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Divider,
  Spin,
  Alert,
  Button,
  Row,
  Col,
  Skeleton,
  Badge,
  Tabs,
  message,
  Tag,
  Input,
  Empty,
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
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Bạn chưa đăng nhập");
        }

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
    },
    {
      id: 2,
      name: "Piano cho người mới bắt đầu",
      progress: 30,
      lastAccessed: "28/02/2025",
    },
  ];

  const achievements = [
    {
      id: 1,
      name: "Hoàn thành khoá học đầu tiên",
      date: "20/01/2025",
      icon: <TrophyOutlined />,
    },
    {
      id: 2,
      name: "Tham gia 10 buổi học liên tiếp",
      date: "15/02/2025",
      icon: <SafetyCertificateOutlined />,
    },
  ];

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = () => {
    message.success("Cập nhật thông tin thành công!");
    setProfile(editedData);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedData(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <Card className="shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <Skeleton.Avatar active size={120} className="mb-4" />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
          <Divider />
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
    <div className="max-w-4xl mx-auto my-12 px-4">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 -mt-5 -mx-5 mb-8">
          <Row gutter={24} align="middle">
            <Col xs={24} md={6} className="text-center md:text-left">
              <Badge
                count={
                  <SafetyCertificateOutlined
                    style={{
                      color: "#f56a00",
                      fontSize: "1.5rem",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                  />
                }
                offset={[-5, 5]}
              >
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  className="bg-white text-purple-700 mb-4 border-4 border-white shadow-md"
                />
              </Badge>
            </Col>
            <Col xs={24} md={18} className="text-center md:text-left">
              <Title level={2} className="text-white mb-0">
                {profile.fullName}
              </Title>
              <Text className="text-purple-200 text-lg">
                @{profile.username}
              </Text>
              <div className="mt-3">
                <Tag className="bg-purple-800 text-white border-purple-600 mr-2">
                  <BookOutlined className="mr-1" /> Học viên
                </Tag>
                <Tag className="bg-purple-800 text-white border-purple-600">
                  <CalendarOutlined className="mr-1" /> Tham gia từ tháng 1/2025
                </Tag>
              </div>
            </Col>
          </Row>
        </div>

        <Tabs defaultActiveKey="1" className="profile-tabs">
          <TabPane
            tab={
              <span>
                <UserOutlined /> Thông tin cá nhân
              </span>
            }
            key="1"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  className="h-full shadow-md hover:shadow-lg transition-shadow border-0"
                  title={
                    <div className="flex items-center">
                      <UserOutlined className="text-purple-700 mr-2" />
                      <span>Thông tin cá nhân</span>
                    </div>
                  }
                >
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <UserOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                      <div>
                        <Text type="secondary">Họ và tên</Text>
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
                            />
                          ) : (
                            <Text strong className="text-lg">
                              {profile.fullName}
                            </Text>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MailOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                      <div>
                        <Text type="secondary">Email</Text>
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
                            />
                          ) : (
                            <Text strong className="text-lg">
                              {profile.email}
                            </Text>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <PhoneOutlined className="text-purple-700 text-xl mr-4 mt-1" />
                      <div>
                        <Text type="secondary">Số điện thoại</Text>
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
                            />
                          ) : (
                            <Text strong className="text-lg">
                              {profile.phoneNumber}
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
                  className="h-full shadow-md hover:shadow-lg transition-shadow border-0"
                  title={
                    <div className="flex items-center">
                      <LockOutlined className="text-purple-700 mr-2" />
                      <span>Thông tin tài khoản</span>
                    </div>
                  }
                >
                  <div className="space-y-6">
                    <div>
                      <Text type="secondary">ID học viên</Text>
                      <div>
                        <Text
                          strong
                          className="text-lg bg-gray-100 px-2 py-1 rounded"
                        >
                          {profile.learnerId}
                        </Text>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Tên đăng nhập</Text>
                      <div>
                        <Text strong className="text-lg">
                          {profile.username}
                        </Text>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Cấp độ tài khoản</Text>
                      <div>
                        <Tag
                          color="purple"
                          className="mt-1 text-base font-medium"
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
          </TabPane>
          <TabPane
            tab={
              <span>
                <BookOutlined /> Khoá học của tôi
              </span>
            }
            key="2"
          >
            <Card className="shadow-md border-0">
              <Title level={4} className="mb-4">
                Khoá học đã đăng ký
              </Title>
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="bg-gray-50 hover:bg-white transition-colors border border-gray-200"
                    >
                      <Row gutter={16} align="middle">
                        <Col xs={24} md={16}>
                          <Title level={5}>{course.name}</Title>
                          <Text type="secondary" className="block mb-2">
                            <CalendarOutlined className="mr-1" /> Truy cập gần
                            nhất: {course.lastAccessed}
                          </Text>
                        </Col>
                        <Col xs={24} md={8} className="text-right">
                          <div className="mb-2">
                            <Text strong>{course.progress}% hoàn thành</Text>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 mb-3">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <Button
                            type="primary"
                            className="bg-purple-700 hover:bg-purple-800"
                          >
                            Tiếp tục học
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty
                  description="Bạn chưa đăng ký khoá học nào"
                  className="py-8"
                >
                  <Button
                    type="primary"
                    className="bg-purple-700 hover:bg-purple-800"
                    onClick={() => navigate("/")}
                  >
                    Khám phá khoá học
                  </Button>
                </Empty>
              )}
            </Card>
          </TabPane>
          <TabPane
            tab={
              <span>
                <TrophyOutlined /> Thành tích
              </span>
            }
            key="3"
          >
            <Card className="shadow-md border-0">
              <Title level={4} className="mb-4">
                Thành tích đạt được
              </Title>
              <Row gutter={[16, 16]}>
                {achievements.map((achievement) => (
                  <Col xs={24} sm={12} key={achievement.id}>
                    <Card className="bg-gray-50 hover:bg-white transition-colors border border-gray-200">
                      <div className="flex items-center">
                        <div className="mr-4 bg-purple-100 p-3 rounded-full text-purple-700 text-2xl">
                          {achievement.icon}
                        </div>
                        <div>
                          <Title level={5} className="mb-0">
                            {achievement.name}
                          </Title>
                          <Text type="secondary">
                            Đạt được: {achievement.date}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;
