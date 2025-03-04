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
  Progress,
  Tooltip,
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
  ArrowRightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

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
      // Giả lập API call để cập nhật
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
          <BookOutlined className="mr-2" /> Khoá học của tôi
        </span>
      ),
      children: (
        <Card className="shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <Title level={4} className="mb-0">
              Khoá học đã đăng ký ({enrolledCourses.length})
            </Title>
            <Button
              type="primary"
              className="bg-purple-700 hover:bg-purple-800"
              icon={<BookOutlined />}
              onClick={() => navigate("/courses")}
            >
              Khám phá thêm khoá học
            </Button>
          </div>
          {enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              {enrolledCourses.map((course) => (
                <Card
                  key={course.id}
                  className="bg-gray-50 hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
                >
                  <Row gutter={[24, 16]} align="middle">
                    <Col xs={24} md={16}>
                      <div className="flex items-center mb-3">
                        <div className="w-16 h-16 bg-purple-200 rounded-lg flex items-center justify-center text-purple-700 text-2xl mr-4">
                          {course.name.includes("Guitar") ? (
                            "🎸"
                          ) : course.name.includes("Piano") ? (
                            "🎹"
                          ) : (
                            <BookOutlined />
                          )}
                        </div>
                        <div>
                          <Title level={4} className="mb-0">
                            {course.name}
                          </Title>
                          <div className="text-gray-500 mt-1">
                            <Tooltip title="Ngày truy cập gần nhất">
                              <CalendarOutlined className="mr-1" />{" "}
                              {course.lastAccessed}
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <Text strong>Tiến độ học tập</Text>
                          <Text strong>
                            {course.completedLessons}/{course.totalLessons} bài
                            học
                          </Text>
                        </div>
                        <Progress
                          percent={course.progress}
                          status="active"
                          strokeColor={{
                            from: "#7c3aed",
                            to: "#a78bfa",
                          }}
                        />
                      </div>
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                      className="flex flex-col items-center md:items-end"
                    >
                      <Button
                        type="primary"
                        className="bg-purple-700 hover:bg-purple-800 w-full md:w-auto"
                        size="large"
                        icon={<ArrowRightOutlined />}
                      >
                        Tiếp tục học
                      </Button>
                      <Button
                        type="link"
                        className="text-purple-700 hover:text-purple-900 mt-2"
                      >
                        Xem chứng chỉ
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              description="Bạn chưa đăng ký khoá học nào"
              className="py-12"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                className="bg-purple-700 hover:bg-purple-800"
                size="large"
                onClick={() => navigate("/courses")}
              >
                Khám phá khoá học
              </Button>
            </Empty>
          )}
        </Card>
      ),
    },
    {
      key: "3",
      label: (
        <span className="flex items-center text-base">
          <TrophyOutlined className="mr-2" /> Thành tích
        </span>
      ),
      children: (
        <Card className="shadow-sm border border-gray-100">
          <Title level={4} className="mb-6">
            Thành tích đạt được ({achievements.length})
          </Title>
          <Row gutter={[16, 16]}>
            {achievements.map((achievement) => (
              <Col xs={24} sm={12} md={8} key={achievement.id}>
                <Card
                  className="bg-gray-50 hover:shadow-md transition-all duration-300 border border-gray-200 h-full"
                  hoverable
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 bg-purple-100 p-4 rounded-full text-purple-700 text-3xl">
                      {achievement.icon}
                    </div>
                    <Title level={4} className="mb-1">
                      {achievement.name}
                    </Title>
                    <Text type="secondary" className="mb-3">
                      Đạt được: {achievement.date}
                    </Text>
                    <Divider className="my-3" />
                    <Text className="text-gray-600">
                      {achievement.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
            <Col xs={24} sm={12} md={8}>
              <Card className="border-dashed border-2 border-gray-300 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
                <div className="text-center p-6">
                  <div className="bg-gray-200 rounded-full p-4 inline-block mb-4">
                    <TrophyOutlined className="text-3xl text-gray-500" />
                  </div>
                  <Title level={5} className="text-gray-600 mb-1">
                    Thành tích tiếp theo
                  </Title>
                  <Text className="text-gray-500 block">
                    Hoàn thành thêm bài học để mở khoá thành tích mới
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      ),
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
