import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Typography,
  Button,
  Spin,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  message,
  Avatar,
  Modal,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  PhoneOutlined,
  RightOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] =
    useState(false);

  useEffect(() => {
    fetchData();
    checkAuthentication();
  }, [id]);

  useEffect(() => {
    if (classData && userProfile) {
      const isJoined = classData.students?.some(
        (student) => student.learnerId === userProfile.learnerId
      );
      setHasJoined(isJoined);
    }
  }, [classData, userProfile]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setUserProfile(response.data.data);
        setIsAuthenticated(true);
        await fetchWalletBalance(response.data.data.learnerId);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
    }
  };

  const fetchWalletBalance = async (learnerId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/wallet/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setWalletBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const classResponse = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Class/${id}`
      );

      if (classResponse.data.isSucceed) {
        setClassData(classResponse.data.data);
        // Kiểm tra ngay sau khi nhận dữ liệu lớp học
        if (userProfile?.learnerId) {
          const isJoined = classResponse.data.data.students?.some(
            (student) => student.learnerId === userProfile.learnerId
          );
          setHasJoined(isJoined);
        }

        // Fetch teacher data after getting class data
        if (classResponse.data.data.teacherId) {
          const teacherDetailResponse = await axios.get(
            `https://instrulearnapplication.azurewebsites.net/api/Teacher/${classResponse.data.data.teacherId}`
          );
          if (teacherDetailResponse.data.isSucceed) {
            setTeacherData(teacherDetailResponse.data.data);
          }
        }
      } else {
        message.error("Không thể tải thông tin lớp học");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Đã xảy ra lỗi khi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace(/\s₫/, " đ");
  };

  const formatClassDays = (classDays) => {
    if (!classDays) return "";
    return classDays
      .map((day) => {
        switch (day.day) {
          case "Sunday":
            return "Chủ nhật";
          case "Monday":
            return "Thứ 2";
          case "Tuesday":
            return "Thứ 3";
          case "Wednesday":
            return "Thứ 4";
          case "Thursday":
            return "Thứ 5";
          case "Friday":
            return "Thứ 6";
          case "Saturday":
            return "Thứ 7";
          default:
            return day.day;
        }
      })
      .join(", ");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "blue";
      case 1:
        return "green";
      case 2:
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Đang mở lớp";
      case 1:
        return "Đang diễn ra";
      case 2:
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewTeacherDetail = () => {
    if (teacherData) {
      navigate(`/teacher-profile/${teacherData.teacherId}`);
    }
  };

  const handleJoinClass = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const depositAmount = classData.price * 0.1; // 10% của học phí

    if (walletBalance < depositAmount) {
      setShowInsufficientBalanceModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmJoin = async () => {
    try {
      setJoining(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/join-class",
        {
          learnerId: userProfile.learnerId,
          classId: parseInt(id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Đăng ký lớp học thành công!");
        setHasJoined(true);
        setShowConfirmModal(false);
        await fetchWalletBalance(userProfile.learnerId);
        await fetchData();
      } else {
        throw new Error(response.data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Error joining class:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Đã xảy ra lỗi khi đăng ký lớp học"
      );
    } finally {
      setJoining(false);
    }
  };

  const handleNavigateToWallet = () => {
    setShowInsufficientBalanceModal(false);
    navigate("/profile/topup");
  };

  const redirectToLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-8">
        <Text className="text-lg">Không tìm thấy thông tin lớp học</Text>
        <div className="mt-4">
          <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="mb-6 text-white border-white hover:text-gray-300 hover:border-gray-300"
            ghost
          >
            Quay lại
          </Button>
          <Title level={1} className="text-white mb-4">
            {classData.className}
          </Title>
          <Tag
            color={getStatusColor(classData.status)}
            className="text-base px-4 py-1"
          >
            {getStatusText(classData.status)}
          </Tag>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          {/* Left Column - Main Info */}
          <Col xs={24} lg={16}>
            {/* Teacher Card */}
            <Card className="shadow-sm rounded-lg mb-6 overflow-hidden">
              <div className="flex items-start space-x-4">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  src={teacherData?.avatar}
                  className="flex-shrink-0"
                />
                <div className="flex-grow">
                  <Title level={4} className="mb-2">
                    {teacherData?.fullname || classData.teacherName}
                  </Title>
                  {teacherData?.majors && (
                    <div className="mb-3">
                      {teacherData.majors.map((major) => (
                        <Tag
                          key={major.majorId}
                          color="purple"
                          className="mr-2"
                        >
                          {major.majorName}
                        </Tag>
                      ))}
                    </div>
                  )}
                  {teacherData?.phoneNumber && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <PhoneOutlined className="mr-2" />
                      {teacherData.phoneNumber}
                    </div>
                  )}
                  <Button
                    type="link"
                    onClick={handleViewTeacherDetail}
                    className="text-purple-600 hover:text-purple-700 p-0"
                    icon={<RightOutlined />}
                  >
                    Xem chi tiết giáo viên
                  </Button>
                </div>
              </div>
            </Card>

            {/* Class Info Card */}
            <Card className="shadow-sm rounded-lg mb-6">
              <Title level={4} className="mb-4">
                Thông tin lớp học
              </Title>
              <div className="space-y-6">
                <div className="flex items-center">
                  <BookOutlined className="text-purple-600 text-xl mr-4" />
                  <div>
                    <div className="text-gray-500 text-sm">Khóa học</div>
                    <div className="font-medium text-lg">
                      {classData.syllabusName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarOutlined className="text-purple-600 text-xl mr-4" />
                  <div>
                    <div className="text-gray-500 text-sm">Thời gian học</div>
                    <div className="font-medium text-lg">
                      {formatClassDays(classData.classDays)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <ClockCircleOutlined className="text-purple-600 text-xl mr-4" />
                  <div>
                    <div className="text-gray-500 text-sm">Giờ học</div>
                    <div className="font-medium text-lg">
                      {classData.classTime?.substring(0, 5)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <TeamOutlined className="text-purple-600 text-xl mr-4" />
                  <div>
                    <div className="text-gray-500 text-sm">
                      Số học viên hiện tại
                    </div>
                    <div className="font-medium text-lg">
                      {classData.studentCount} / {classData.maxStudents} học
                      viên
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Schedule Card */}
            <Card className="shadow-sm rounded-lg mb-6">
              <Title level={4} className="mb-4">
                Lịch trình khóa học
              </Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={<span className="text-gray-500">Ngày bắt đầu</span>}
                    value={new Date(classData.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                    prefix={<CalendarOutlined className="text-purple-600" />}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={<span className="text-gray-500">Số buổi học</span>}
                    value={classData.totalDays}
                    prefix={<TeamOutlined className="text-purple-600" />}
                    suffix="buổi"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={<span className="text-gray-500">Chuyên ngành</span>}
                    value={classData.majorName}
                    prefix={<BookOutlined className="text-purple-600" />}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={
                      <span className="text-gray-500">Số học viên tối đa</span>
                    }
                    value={classData.maxStudents}
                    prefix={<TeamOutlined className="text-purple-600" />}
                    suffix="học viên"
                  />
                </Col>
              </Row>
            </Card>

            {/* Students List Card */}
            <Card className="shadow-sm rounded-lg">
              <Title level={4} className="mb-4">
                Danh sách học viên ({classData.studentCount} học viên)
              </Title>
              {classData.students && classData.students.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {classData.students.map((student) => (
                    <div
                      key={student.learnerId}
                      className="flex flex-col items-center p-3 border rounded-lg"
                    >
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        src={student.avatar}
                        className="mb-2"
                      />
                      <Text className="text-center font-medium">
                        {student.fullName}
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Chưa có học viên nào trong lớp
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column - Registration */}
          <Col xs={24} lg={8}>
            <Card className="shadow-sm rounded-lg sticky top-6">
              <Title level={4} className="mb-6">
                Thông tin đăng ký
              </Title>
              <div className="mb-6 space-y-4">
                <div>
                  <div className="text-gray-500 mb-2">Chi tiết học phí</div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <Text>Số buổi học</Text>
                      <Text strong>{classData.totalDays} buổi</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text>Học phí/buổi</Text>
                      <Text strong className="text-purple-600">
                        {formatPrice(classData.price)}
                      </Text>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center">
                      <Text>Tổng học phí</Text>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(classData.price * classData.totalDays)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({formatPrice(classData.price)}/buổi ×{" "}
                          {classData.totalDays} buổi)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong className="text-blue-600">
                      Phí giữ chỗ (10%)
                    </Text>
                    <Text strong className="text-blue-600">
                      {formatPrice(classData.price * classData.totalDays * 0.1)}
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm block">
                    * Phí này cần đóng ngay khi đăng ký để giữ chỗ
                  </Text>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Phần học phí còn lại (90%)</Text>
                    <Text strong>
                      {formatPrice(classData.price * classData.totalDays * 0.9)}
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm block">
                    * Sẽ đóng trước khi bắt đầu khóa học
                  </Text>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <Text>Trạng thái</Text>
                  <Tag color={getStatusColor(classData.status)}>
                    {getStatusText(classData.status)}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <Text>Số lượng học viên hiện tại</Text>
                  <Text strong>
                    {classData.studentCount} / {classData.maxStudents} học viên
                  </Text>
                </div>
              </div>
              <Divider />
              {classData.status === 0 ? (
                hasJoined ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircleOutlined className="text-green-500 text-2xl mb-2" />
                    <Text className="block text-green-600 font-medium">
                      Bạn đã tham gia lớp học này
                    </Text>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={classData.maxStudents === classData.studentCount}
                    onClick={handleJoinClass}
                    loading={joining}
                  >
                    {classData.maxStudents === classData.studentCount
                      ? "Lớp đã đầy"
                      : "Đăng ký ngay"}
                  </Button>
                )
              ) : (
                <div className="text-center text-gray-500 italic">
                  {classData.status === 1
                    ? "Lớp học đang diễn ra"
                    : "Lớp học đã kết thúc"}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Login Modal */}
      <Modal
        title="Yêu cầu đăng nhập"
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLoginModal(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="login"
            type="primary"
            onClick={redirectToLogin}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Đăng nhập ngay
          </Button>,
        ]}
      >
        <div className="py-4 flex flex-col items-center">
          <LockOutlined className="text-4xl text-purple-600 mb-4" />
          <Text className="text-lg mb-2">
            Bạn cần đăng nhập để đăng ký lớp học
          </Text>
          <Text type="secondary">
            Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục
          </Text>
        </div>
      </Modal>

      {/* Insufficient Balance Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Số dư không đủ
            </div>
            <div className="text-gray-500">
              Vui lòng nạp thêm tiền để đăng ký lớp học
            </div>
          </div>
        }
        open={showInsufficientBalanceModal}
        onOk={handleNavigateToWallet}
        onCancel={() => setShowInsufficientBalanceModal(false)}
        okText="Nạp tiền ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="py-4">
          <div className="bg-red-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600 mb-2">
                Số dư hiện tại
              </div>
              <div className="text-3xl font-bold text-red-700 mb-2">
                {formatPrice(walletBalance)}
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Phí giữ chỗ cần thanh toán:</span>
                <span className="font-medium">
                  {formatPrice(classData.price * classData.totalDays * 0.1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền cần nạp thêm:</span>
                <span className="font-medium text-red-600">
                  {formatPrice(
                    Math.max(
                      classData.price * classData.totalDays * 0.1 -
                        walletBalance,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
          <Alert
            message="Lưu ý"
            description="Bạn cần nạp đủ số tiền phí giữ chỗ để đăng ký tham gia lớp học."
            type="info"
            showIcon
          />
        </div>
      </Modal>

      {/* Confirm Join Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              Xác nhận đăng ký lớp học
            </div>
            <div className="text-gray-500">
              Vui lòng kiểm tra thông tin trước khi xác nhận
            </div>
          </div>
        }
        open={showConfirmModal}
        onOk={handleConfirmJoin}
        onCancel={() => setShowConfirmModal(false)}
        okText="Xác nhận đăng ký"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-purple-600 hover:bg-purple-700",
          loading: joining,
        }}
      >
        <div className="py-4">
          <div className="bg-purple-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 mb-2">
                Phí giữ chỗ (10%)
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-2">
                {formatPrice(classData.price * classData.totalDays * 0.1)}
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Số dư hiện tại:</span>
                <span className="font-medium">
                  {formatPrice(walletBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số dư sau khi thanh toán:</span>
                <span className="font-medium">
                  {formatPrice(
                    walletBalance - classData.price * classData.totalDays * 0.1
                  )}
                </span>
              </div>
            </div>
          </div>
          <Alert
            message="Lưu ý"
            description={
              <div>
                <p>
                  Phí giữ chỗ (10%) sẽ được trừ ngay khi bạn xác nhận đăng ký.
                  Phí này không được hoàn lại nếu bạn hủy đăng ký.
                </p>
                <p className="mt-2">
                  Phần học phí còn lại (90%) sẽ được đóng trước khi bắt đầu khóa
                  học.
                </p>
              </div>
            }
            type="warning"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default ClassDetail;
