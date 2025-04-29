import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Spin,
  message,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Statistic,
  Steps,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ScheduleOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isConfirmInitialPaymentVisible, setIsConfirmInitialPaymentVisible] =
    useState(false);
  const [
    isConfirmRemainingPaymentVisible,
    setIsConfirmRemainingPaymentVisible,
  ] = useState(false);
  const [
    isInsufficientBalanceModalVisible,
    setIsInsufficientBalanceModalVisible,
  ] = useState(false);
  const [paymentSuccessVisible, setPaymentSuccessVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("initial");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
  });
  const [learningPathSessions, setLearningPathSessions] = useState([]);
  const [loadingPathSessions, setLoadingPathSessions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        throw new Error("Vui lòng đăng nhập để xem thông tin");
      }

      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegis/status/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.isSucceed) {
        // Lọc chỉ lấy các đăng ký có regisTypeName là "Đăng ký học theo yêu cầu"
        const filteredData = response.data.data.filter(
          (reg) => reg.regisTypeName === "Đăng ký học theo yêu cầu"
        );

        const vietnameseData = filteredData
          .map((reg) => ({
            ...reg,
            learningDays: reg.learningDays.map((day) =>
              convertDayToVietnamese(day)
            ),
            price: reg.price,
            levelName: reg.levelName,
            responseName: reg.responseName,
            levelPrice: reg.levelPrice,
          }))
          .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        setRegistrations(vietnameseData);

        // Tính toán thống kê chỉ cho các đăng ký đã lọc
        const newStats = {
          total: vietnameseData.length,
          pending: vietnameseData.filter((reg) => reg.status === "Pending")
            .length,
          accepted: vietnameseData.filter((reg) => reg.status === "Accepted")
            .length,
          rejected: vietnameseData.filter((reg) => reg.status === "Rejected")
            .length,
          completed: vietnameseData.filter((reg) => reg.status === "Completed")
            .length,
        };
        setStats(newStats);
      } else {
        throw new Error(
          response.data?.message || "Không thể tải danh sách đăng ký"
        );
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      message.error("Không thể tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPathSessions = async (learningRegisId) => {
    try {
      setLoadingPathSessions(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/${learningRegisId}/learning-path-sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.isSucceed) {
        setLearningPathSessions(response.data.data);
      } else {
        throw new Error(response.data?.message || "Không thể tải lộ trình học");
      }
    } catch (error) {
      console.error("Error fetching learning path sessions:", error);
      message.error("Không thể tải lộ trình học");
    } finally {
      setLoadingPathSessions(false);
    }
  };

  const convertDayToVietnamese = (day) => {
    const dayMap = {
      Monday: "Thứ 2",
      Tuesday: "Thứ 3",
      Wednesday: "Thứ 4",
      Thursday: "Thứ 5",
      Friday: "Thứ 6",
      Saturday: "Thứ 7",
      Sunday: "Chủ nhật",
    };
    return dayMap[day] || day;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color="warning"
            className="px-3 py-1 text-base"
          >
            Chờ xác nhận
          </Tag>
        );
      case "Accepted":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="px-3 py-1 text-base"
          >
            Đã chấp nhận
          </Tag>
        );
      case "Rejected":
        return (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            className="px-3 py-1 text-base"
          >
            Từ chối
          </Tag>
        );
      case "Completed":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="processing"
            className="px-3 py-1 text-base"
          >
            Đã thanh toán
          </Tag>
        );
      case "Fourty":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="processing"
            className="px-3 py-1 text-base"
          >
            Đã thanh toán 40%
          </Tag>
        );
      case "Sixty":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="px-3 py-1 text-base"
          >
            Đã thanh toán đầy đủ
          </Tag>
        );
      case "FourtyFeedbackDone":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="processing"
            className="px-3 py-1 text-base"
          >
            Đã phản hồi
          </Tag>
        );
      case "Cancelled":
        return (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            className="px-3 py-1 text-base"
          >
            Đã hủy
          </Tag>
        );
      default:
        return (
          <Tag color="default" className="px-3 py-1 text-base">
            {status}
          </Tag>
        );
    }
  };

  const handleView = (record) => {
    setSelectedRegistration(record);
    setViewModalVisible(true);
    if (record.status !== "Pending") {
      fetchLearningPathSessions(record.learningRegisId);
    }
  };

  const handleViewVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoModalVisible(true);
  };

  const handleInitialPaymentClick = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        message.error("Vui lòng đăng nhập để thực hiện thanh toán");
        return;
      }

      // Kiểm tra số dư ví
      const walletResponse = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/wallet/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!walletResponse.data.isSucceed) {
        throw new Error("Không thể kiểm tra số dư ví");
      }

      const currentBalance = walletResponse.data.data.balance;
      const requiredAmount = selectedRegistration.price * 0.4; // 40% học phí

      if (currentBalance < requiredAmount) {
        setPaymentType("initial"); // Set payment type trước khi hiển thị modal
        setIsInsufficientBalanceModalVisible(true);
      } else {
        setPaymentType("initial");
        setIsConfirmInitialPaymentVisible(true);
      }
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      message.error(error.message || "Không thể kiểm tra số dư ví");
    }
  };

  const handleRemainingPaymentClick = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        message.error("Vui lòng đăng nhập để thực hiện thanh toán");
        return;
      }

      // Kiểm tra số dư ví
      const walletResponse = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/wallet/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!walletResponse.data.isSucceed) {
        throw new Error("Không thể kiểm tra số dư ví");
      }

      const currentBalance = walletResponse.data.data.balance;
      const requiredAmount = selectedRegistration.price * 0.6; // 60% học phí

      if (currentBalance < requiredAmount) {
        setPaymentType("remaining"); // Set payment type trước khi hiển thị modal
        setIsInsufficientBalanceModalVisible(true);
      } else {
        setPaymentType("remaining");
        setIsConfirmRemainingPaymentVisible(true);
      }
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      message.error(error.message || "Không thể kiểm tra số dư ví");
    }
  };

  const handleConfirmInitialPayment = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("authToken");
      const regisId = selectedRegistration.learningRegisId;

      const data = {
        learningRegisId: regisId,
        paymentMethod: 0,
      };

      const response = await axios({
        method: "post",
        url: "https://instrulearnapplication.azurewebsites.net/api/Payment/process-learning-payment",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: data,
      });

      if (response.data?.isSucceed) {
        setIsConfirmInitialPaymentVisible(false);
        setViewModalVisible(false);
        await fetchRegistrations();
        setPaymentSuccessVisible(true);
        message.success("Thanh toán 40% học phí thành công!");
      } else {
        throw new Error(response.data?.message || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Error processing initial payment:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmRemainingPayment = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("authToken");
      const regisId = selectedRegistration.learningRegisId;

      const response = await axios({
        method: "post",
        url: `https://instrulearnapplication.azurewebsites.net/api/Payment/process-remaining-payment/${regisId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.isSucceed) {
        setIsConfirmRemainingPaymentVisible(false);
        setViewModalVisible(false);
        await fetchRegistrations();
        setPaymentSuccessVisible(true);
        message.success("Thanh toán phần còn lại thành công!");
      } else {
        throw new Error(response.data?.message || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Error processing remaining payment:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleNavigateToWallet = () => {
    setIsInsufficientBalanceModalVisible(false);
    navigate("/profile/topup");
  };

  const columns = [
    {
      title: "Nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => (
        <Tag color="purple" className="px-3 py-1 text-base">
          <BookOutlined className="mr-2" />
          {text}
        </Tag>
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (text) => (
        <span className="text-base">
          <TeamOutlined className="mr-2 text-blue-500" />
          {text}
        </span>
      ),
    },
    {
      title: "Thời gian học",
      key: "schedule",
      render: (_, record) => (
        <span className="text-base">
          <ScheduleOutlined className="mr-2 text-green-500" />
          {record.timeStart?.substring(0, 5)} -{" "}
          {record.timeEnd?.substring(0, 5)}
        </span>
      ),
    },
    {
      title: "Số buổi",
      dataIndex: "numberOfSession",
      key: "numberOfSession",
      render: (text) => (
        <span className="text-base">
          <CalendarOutlined className="mr-2 text-orange-500" />
          {text} buổi
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          className="bg-purple-600 hover:bg-purple-700 border-none shadow-md hover:shadow-lg transition-all duration-300"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <Statistic
              title={<span className="text-gray-600">Tổng số đăng ký</span>}
              value={stats.total}
              prefix={<BookOutlined className="text-blue-500" />}
              className="text-blue-500"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
            <Statistic
              title={<span className="text-gray-600">Chờ xác nhận</span>}
              value={stats.pending}
              prefix={<ClockCircleOutlined className="text-yellow-500" />}
              className="text-yellow-500"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <Statistic
              title={<span className="text-gray-600">Đã chấp nhận</span>}
              value={stats.accepted}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              className="text-green-500"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
            <Statistic
              title={<span className="text-gray-600">Từ chối</span>}
              value={stats.rejected}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              className="text-red-500"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <Statistic
              title={<span className="text-gray-600">Đã thanh toán</span>}
              value={stats.completed}
              prefix={<CheckCircleOutlined className="text-purple-500" />}
              className="text-purple-500"
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng danh sách */}
      <Card
        className="shadow-md hover:shadow-lg transition-all duration-300"
        title={
          <Title level={4} className="mb-0 flex items-center">
            <BookOutlined className="mr-2 text-purple-600" />
            Danh sách đăng ký học
          </Title>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={registrations}
            rowKey="learningRegisId"
            pagination={{
              pageSize: 5,
              showTotal: (total) => `Tổng cộng ${total} đăng ký`,
            }}
            className="custom-table"
            rowClassName="hover:bg-purple-50 transition-colors duration-300"
          />
        </Spin>
      </Card>

      {/* Modal xem chi tiết */}
      <Modal
        title={
          <div className="flex items-center text-lg">
            <BookOutlined className="mr-2 text-purple-600" />
            Chi tiết đăng ký học
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={700}
        footer={[
          selectedRegistration?.status === "Accepted" && (
            <Button
              key="initialPayment"
              type="primary"
              onClick={handleInitialPaymentClick}
              className="bg-green-600 hover:bg-green-700 border-none mr-2"
            >
              Thanh toán 40% học phí
            </Button>
          ),
          selectedRegistration?.status === "FourtyFeedbackDone" && (
            <Button
              key="remainingPayment"
              type="primary"
              onClick={handleRemainingPaymentClick}
              className="bg-blue-600 hover:bg-blue-700 border-none mr-2"
            >
              Thanh toán phần còn lại
            </Button>
          ),
          <Button
            key="close"
            onClick={() => setViewModalVisible(false)}
            className="hover:bg-gray-100 transition-colors duration-300"
          >
            Đóng
          </Button>,
        ]}
        className="custom-modal"
      >
        {selectedRegistration && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <Text type="secondary" className="block mb-1">
                  Trạng thái
                </Text>
                {getStatusTag(selectedRegistration.status)}
              </div>
            </div>

            <Divider className="my-6" />

            <div className="bg-purple-50 p-4 rounded-lg">
              <Title level={4} className="text-purple-700 mb-4">
                <BookOutlined className="mr-2" />
                Thông tin đăng ký học
              </Title>

              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <div className="space-y-1">
                    <Text type="secondary">Nhạc cụ</Text>
                    <div className="text-lg font-medium">
                      {selectedRegistration.majorName}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-1">
                    <Text type="secondary">Giáo viên</Text>
                    <div className="text-lg font-medium">
                      {selectedRegistration.teacherName}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-1">
                    <Text type="secondary">Thời gian học</Text>
                    <div className="text-lg font-medium">
                      {selectedRegistration.timeStart?.substring(0, 5)} -{" "}
                      {selectedRegistration.timeEnd?.substring(0, 5)} (
                      {selectedRegistration.timeLearning} phút)
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-1">
                    <Text type="secondary">Số buổi học</Text>
                    <div className="text-lg font-medium">
                      {selectedRegistration.numberOfSession} buổi
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="mt-6">
                <Text type="secondary">Ngày học trong tuần</Text>
                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedRegistration.learningDays.map((day, index) => (
                    <Tag
                      key={index}
                      color="purple"
                      className="px-3 py-1 text-base"
                    >
                      {day}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Nguyên nhân hủy đơn hoặc Yêu cầu học */}
              {selectedRegistration.learningRequest && (
                <div className="mt-6">
                  {selectedRegistration.status === "Cancelled" &&
                  (selectedRegistration.learningRequest ===
                    "Quá hạn thanh toán" ||
                    selectedRegistration.learningRequest ===
                      "Quá hạn thanh toán 60%") ? (
                    <>
                      <Text
                        type="danger"
                        strong
                        style={{ color: "#e53935", fontWeight: 600 }}
                      >
                        Nguyên nhân hủy đơn
                      </Text>
                      <div className="text-lg font-bold mt-1 text-red-600">
                        {selectedRegistration.learningRequest}
                      </div>
                    </>
                  ) : (
                    <>
                      <Text type="secondary">Yêu cầu học</Text>
                      <div className="text-lg font-medium mt-1">
                        {selectedRegistration.learningRequest}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {selectedRegistration.videoUrl &&
              selectedRegistration.videoUrl !== "string" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Title level={4} className="text-blue-700 mb-4">
                    <PlayCircleOutlined className="mr-2" />
                    Video đã tải lên
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() =>
                      handleViewVideo(selectedRegistration.videoUrl)
                    }
                    className="bg-blue-600 hover:bg-blue-700 border-none"
                  >
                    Xem video
                  </Button>
                </div>
              )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <div className="space-y-1">
                    <Text type="secondary">Ngày yêu cầu</Text>
                    <div className="text-lg font-medium">
                      {dayjs(selectedRegistration.requestDate).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </div>
                </Col>
                {selectedRegistration.startDay && (
                  <Col xs={24} sm={12}>
                    <div className="space-y-1">
                      <Text type="secondary">Ngày bắt đầu</Text>
                      <div className="text-lg font-medium">
                        {dayjs(selectedRegistration.startDay).format(
                          "DD/MM/YYYY"
                        )}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {selectedRegistration.status !== "Pending" && (
              <>
                <Divider className="my-6" />
                <div className="bg-green-50 p-4 rounded-lg">
                  <Title level={4} className="text-green-700 mb-4">
                    <CheckCircleOutlined className="mr-2" />
                    Thông tin xác nhận
                  </Title>

                  <Row gutter={[24, 24]}>
                    {selectedRegistration.levelName && (
                      <Col xs={24} sm={12}>
                        <div className="space-y-1">
                          <Text type="secondary">Cấp độ được xếp</Text>
                          <div className="text-lg font-medium">
                            {selectedRegistration.levelName}
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRegistration.responseTypeName && (
                      <Col xs={24} sm={12}>
                        <div className="space-y-1">
                          <Text type="secondary">Loại phản hồi</Text>
                          <div className="text-lg font-medium">
                            {selectedRegistration.responseTypeName}
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRegistration.responseDescription && (
                      <Col xs={24}>
                        <div className="space-y-1">
                          <Text type="secondary">Nội dung phản hồi</Text>
                          <div className="text-lg font-medium">
                            {selectedRegistration.responseDescription}
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRegistration?.price && (
                      <Col xs={24}>
                        <div className="space-y-1">
                          <Text type="secondary">Học phí</Text>
                          <div className="text-lg font-medium text-red-600">
                            {selectedRegistration.price.toLocaleString("vi-VN")}{" "}
                            VNĐ
                            {selectedRegistration.numberOfSession && (
                              <Text type="secondary" className="text-sm ml-2">
                                (
                                {(
                                  selectedRegistration.price /
                                  selectedRegistration.numberOfSession
                                ).toLocaleString("vi-VN")}{" "}
                                VNĐ/buổi)
                              </Text>
                            )}
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Lộ trình thanh toán */}
                    <Col xs={24}>
                      <div className="space-y-1">
                        <Text type="secondary">Lộ trình thanh toán</Text>
                        <div className="mt-4">
                          <Steps
                            direction="vertical"
                            current={(() => {
                              // Nếu Cancelled và learningRequest là 'Quá hạn thanh toán 60%' thì chỉ có 2 bước
                              if (
                                selectedRegistration.status === "Cancelled" &&
                                selectedRegistration.learningRequest ===
                                  "Quá hạn thanh toán 60%"
                              ) {
                                return 2;
                              }
                              return selectedRegistration.status === "Fourty" ||
                                selectedRegistration.status ===
                                  "FourtyFeedbackDone"
                                ? 2
                                : selectedRegistration.status === "Sixty" ||
                                  selectedRegistration.status === "Completed"
                                ? 3
                                : 1;
                            })()}
                            items={(() => {
                              // Nếu bị từ chối hoặc hủy thì chỉ hiện bước đăng ký học
                              if (
                                selectedRegistration.status === "Rejected" ||
                                (selectedRegistration.status === "Cancelled" &&
                                  selectedRegistration.learningRequest !==
                                    "Quá hạn thanh toán 60%")
                              ) {
                                return [
                                  {
                                    title: "Đăng ký học",
                                    description: (
                                      <div>
                                        <div>
                                          Ngày đăng ký:{" "}
                                          {dayjs(
                                            selectedRegistration.requestDate
                                          ).format("DD/MM/YYYY HH:mm")}
                                        </div>
                                        <div>
                                          Trạng thái:{" "}
                                          {getStatusTag(
                                            selectedRegistration.status
                                          )}
                                        </div>
                                      </div>
                                    ),
                                    status: "finish",
                                  },
                                ];
                              }
                              // Nếu Cancelled và learningRequest là 'Quá hạn thanh toán 60%' thì chỉ có 2 bước
                              if (
                                selectedRegistration.status === "Cancelled" &&
                                selectedRegistration.learningRequest ===
                                  "Quá hạn thanh toán 60%"
                              ) {
                                return [
                                  {
                                    title: "Đăng ký học",
                                    description: (
                                      <div>
                                        <div>
                                          Ngày đăng ký:{" "}
                                          {dayjs(
                                            selectedRegistration.requestDate
                                          ).format("DD/MM/YYYY HH:mm")}
                                        </div>
                                        <div>
                                          Trạng thái: {getStatusTag("Accepted")}
                                        </div>
                                      </div>
                                    ),
                                    status: "finish",
                                  },
                                  {
                                    title: "Thanh toán 40% học phí",
                                    description: (
                                      <div>
                                        <div>
                                          Số tiền:{" "}
                                          {(
                                            selectedRegistration.price * 0.4
                                          ).toLocaleString("vi-VN")}{" "}
                                          VNĐ
                                        </div>
                                        <div>
                                          Trạng thái: {getStatusTag("Fourty")}
                                        </div>
                                      </div>
                                    ),
                                    status: "finish",
                                  },
                                ];
                              }
                              // Các trường hợp còn lại
                              return [
                                {
                                  title: "Đăng ký học",
                                  description: (
                                    <div>
                                      <div>
                                        Ngày đăng ký:{" "}
                                        {dayjs(
                                          selectedRegistration.requestDate
                                        ).format("DD/MM/YYYY HH:mm")}
                                      </div>
                                      <div>
                                        Trạng thái:{" "}
                                        {getStatusTag(
                                          selectedRegistration.status ===
                                            "Accepted" ||
                                            selectedRegistration.status ===
                                              "Fourty" ||
                                            selectedRegistration.status ===
                                              "FourtyFeedbackDone" ||
                                            selectedRegistration.status ===
                                              "Sixty" ||
                                            selectedRegistration.status ===
                                              "Completed"
                                            ? "Accepted"
                                            : selectedRegistration.status
                                        )}
                                      </div>
                                    </div>
                                  ),
                                  status: "finish",
                                },
                                {
                                  title: "Thanh toán 40% học phí",
                                  description: (
                                    <div>
                                      <div>
                                        Số tiền:{" "}
                                        {(
                                          selectedRegistration.price * 0.4
                                        ).toLocaleString("vi-VN")}{" "}
                                        VNĐ
                                      </div>
                                      <div>
                                        Trạng thái:{" "}
                                        {selectedRegistration.status ===
                                          "Fourty" ||
                                        selectedRegistration.status ===
                                          "FourtyFeedbackDone" ||
                                        selectedRegistration.status ===
                                          "Sixty" ||
                                        selectedRegistration.status ===
                                          "Completed"
                                          ? getStatusTag("Fourty")
                                          : getStatusTag("Pending")}
                                      </div>
                                      {/* Hạn thanh toán chỉ hiện khi đã hoàn thành đăng ký học */}
                                      {(selectedRegistration.status ===
                                        "Accepted" ||
                                        selectedRegistration.status ===
                                          "Fourty" ||
                                        selectedRegistration.status ===
                                          "FourtyFeedbackDone" ||
                                        selectedRegistration.status ===
                                          "Sixty" ||
                                        selectedRegistration.status ===
                                          "Completed") &&
                                        selectedRegistration.paymentDeadline && (
                                          <div className="text-red-500">
                                            Hạn thanh toán:{" "}
                                            {dayjs(
                                              selectedRegistration.paymentDeadline
                                            ).format("DD/MM/YYYY")}
                                          </div>
                                        )}
                                    </div>
                                  ),
                                  status:
                                    selectedRegistration.status === "Fourty" ||
                                    selectedRegistration.status ===
                                      "FourtyFeedbackDone" ||
                                    selectedRegistration.status === "Sixty" ||
                                    selectedRegistration.status === "Completed"
                                      ? "finish"
                                      : "wait",
                                },
                                {
                                  title: "Thanh toán 60% học phí còn lại",
                                  description: (
                                    <div>
                                      <div>
                                        Số tiền:{" "}
                                        {(
                                          selectedRegistration.price * 0.6
                                        ).toLocaleString("vi-VN")}{" "}
                                        VNĐ
                                      </div>
                                      <div>
                                        Trạng thái:{" "}
                                        {selectedRegistration.status ===
                                          "Sixty" ||
                                        selectedRegistration.status ===
                                          "Completed"
                                          ? getStatusTag("Sixty")
                                          : getStatusTag("Pending")}
                                      </div>
                                      {/* Hạn thanh toán chỉ hiện khi đã hoàn thành 40% */}
                                      {(selectedRegistration.status ===
                                        "Fourty" ||
                                        selectedRegistration.status ===
                                          "FourtyFeedbackDone" ||
                                        selectedRegistration.status ===
                                          "Sixty" ||
                                        selectedRegistration.status ===
                                          "Completed") &&
                                        selectedRegistration.paymentDeadline && (
                                          <div className="text-red-500">
                                            Hạn thanh toán:{" "}
                                            {dayjs(
                                              selectedRegistration.paymentDeadline
                                            ).format("DD/MM/YYYY")}
                                          </div>
                                        )}
                                    </div>
                                  ),
                                  status:
                                    selectedRegistration.status === "Sixty" ||
                                    selectedRegistration.status === "Completed"
                                      ? "finish"
                                      : "wait",
                                },
                              ];
                            })()}
                          />
                        </div>
                      </div>
                    </Col>

                    {/* Lộ trình học tập */}
                    {[
                      "Accepted",
                      "Fourty",
                      "FourtyFeedbackDone",
                      "Sixty",
                      "Completed",
                    ].includes(selectedRegistration.status) && (
                      <Col xs={24}>
                        <div className="space-y-1">
                          <Text type="secondary">Lộ trình học tập</Text>
                          <div className="mt-4">
                            {loadingPathSessions ? (
                              <div className="text-center py-4">
                                <Spin />
                              </div>
                            ) : (
                              <>
                                {!learningPathSessions.length ||
                                !learningPathSessions.some(
                                  (s) => s.isCompleted
                                ) ? (
                                  <div className="text-base text-gray-500 italic">
                                    Lộ trình học tập của bạn đang được giáo viên
                                    soạn, nếu giáo viên đã soạn xong lộ trình
                                    bạn sẽ nhận được thông báo sớm nhất trong
                                    Email
                                  </div>
                                ) : (
                                  <Steps
                                    direction="vertical"
                                    current={
                                      learningPathSessions.filter(
                                        (s) => s.isCompleted
                                      ).length
                                    }
                                    items={learningPathSessions
                                      .filter((session) => session.isCompleted)
                                      .map((session) => ({
                                        title: (
                                          <Text
                                            strong
                                          >{`Buổi ${session.sessionNumber}: ${session.title}`}</Text>
                                        ),
                                        description: session.description,
                                      }))}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal xem video */}
      <Modal
        title={
          <div className="flex items-center text-lg">
            <PlayCircleOutlined className="mr-2 text-blue-600" />
            Xem video
          </div>
        }
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setVideoModalVisible(false)}
            className="hover:bg-gray-100 transition-colors duration-300"
          >
            Đóng
          </Button>,
        ]}
        width={800}
        className="custom-modal"
      >
        {selectedVideo && (
          <div className="flex justify-center">
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-full"
                controlsList="nodownload"
                playsInline
                preload="auto"
                style={{ maxHeight: "70vh" }}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xác nhận thanh toán 40% */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              Xác nhận thanh toán 40% học phí
            </div>
            <div className="text-gray-500">
              Vui lòng kiểm tra thông tin trước khi xác nhận thanh toán
            </div>
          </div>
        }
        open={isConfirmInitialPaymentVisible}
        onOk={handleConfirmInitialPayment}
        onCancel={() => setIsConfirmInitialPaymentVisible(false)}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-green-600 hover:bg-green-700",
          loading: paymentLoading,
        }}
      >
        <div className="py-4">
          <div className="bg-green-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 mb-2">
                Số tiền cần thanh toán (40% học phí)
              </div>
              <div className="text-3xl font-bold text-green-700 mb-2">
                {selectedRegistration?.price
                  ? (selectedRegistration.price * 0.4).toLocaleString("vi-VN")
                  : 0}{" "}
                VNĐ
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận thanh toán phần còn lại */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              Xác nhận thanh toán phần còn lại
            </div>
            <div className="text-gray-500">
              Vui lòng kiểm tra thông tin trước khi xác nhận thanh toán
            </div>
          </div>
        }
        open={isConfirmRemainingPaymentVisible}
        onOk={handleConfirmRemainingPayment}
        onCancel={() => setIsConfirmRemainingPaymentVisible(false)}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-blue-600 hover:bg-blue-700",
          loading: paymentLoading,
        }}
      >
        <div className="py-4">
          <div className="bg-blue-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 mb-2">
                Số tiền cần thanh toán (60% học phí còn lại)
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {selectedRegistration?.price
                  ? (selectedRegistration.price * 0.6).toLocaleString("vi-VN")
                  : 0}{" "}
                VNĐ
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal số dư không đủ */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Số dư không đủ
            </div>
            <div className="text-gray-500">
              Vui lòng nạp thêm tiền để thực hiện thanh toán
            </div>
          </div>
        }
        open={isInsufficientBalanceModalVisible}
        onOk={handleNavigateToWallet}
        onCancel={() => setIsInsufficientBalanceModalVisible(false)}
        okText="Nạp tiền ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="py-4">
          <div className="bg-red-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600 mb-2">
                {paymentType === "initial"
                  ? "Thanh toán 40% học phí"
                  : "Thanh toán 60% học phí còn lại"}
              </div>
              <div className="text-3xl font-bold text-red-700 mb-2">
                {selectedRegistration?.price
                  ? (
                      selectedRegistration.price *
                      (paymentType === "initial" ? 0.4 : 0.6)
                    ).toLocaleString("vi-VN")
                  : 0}{" "}
                VNĐ
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal thông báo thanh toán thành công */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              Thanh toán thành công
            </div>
          </div>
        }
        open={paymentSuccessVisible}
        onOk={() => setPaymentSuccessVisible(false)}
        onCancel={() => setPaymentSuccessVisible(false)}
        okText="Đồng ý"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
      >
        <div className="py-4 text-center">
          <div className="mb-4">
            <CheckCircleOutlined className="text-6xl text-green-500" />
          </div>
          <div className="text-lg mb-4">
            Bạn đã thanh toán thành công{" "}
            {paymentType === "initial" ? "40% học phí" : "phần học phí còn lại"}
          </div>
          <div className="text-2xl font-bold text-green-700">
            {selectedRegistration?.price
              ? (
                  selectedRegistration.price *
                  (paymentType === "initial" ? 0.4 : 0.6)
                ).toLocaleString("vi-VN")
              : 0}{" "}
            VNĐ
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f3f4f6;
          font-weight: 600;
        }

        .custom-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }

        .custom-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 24px;
        }

        .custom-modal .ant-modal-body {
          padding: 24px;
        }

        .custom-modal .ant-modal-footer {
          border-top: 1px solid #f0f0f0;
          padding: 16px 24px;
        }
      `}</style>
    </div>
  );
};

export default MyRegistrations;
