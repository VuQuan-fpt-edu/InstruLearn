import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Tag,
  Button,
  Row,
  Col,
  Divider,
  Steps,
  Modal,
  message,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ScheduleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

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

// Custom tag màu cho trạng thái thanh toán
const getCustomPaymentStatusTag = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return (
        <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-700 font-semibold border border-green-300">
          Đã thanh toán
        </span>
      );
    case "Chưa thanh toán":
      return (
        <span className="inline-block px-3 py-1 rounded bg-red-100 text-red-600 font-semibold border border-red-300">
          Chưa thanh toán
        </span>
      );
    case "Chờ xác nhận":
      return (
        <span className="inline-block px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold border border-yellow-300">
          Chờ xác nhận
        </span>
      );
    default:
      return (
        <span className="inline-block px-3 py-1 rounded bg-gray-100 text-gray-600 font-semibold border border-gray-300">
          {status}
        </span>
      );
  }
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
    case "Fourty":
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color="orange"
          className="px-3 py-1 text-base"
        >
          Đã thanh toán 40%
        </Tag>
      );
    case "Sixty":
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color="blue"
          className="px-3 py-1 text-base"
        >
          Đã thanh toán 60%
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
    case "FourtyFeedbackDone":
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color="purple"
          className="px-3 py-1 text-base"
        >
          Đã phản hồi
        </Tag>
      );
    case "Cancelled":
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          color="default"
          className="px-3 py-1 text-base"
        >
          Đã hủy
        </Tag>
      );
    case "FullyPaid":
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
          className="px-3 py-1 text-base"
        >
          Đã thanh toán đầy đủ
        </Tag>
      );
    case "Payment40Rejected":
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          color="red"
          className="px-3 py-1 text-base"
        >
          Từ chối thanh toán 40%
        </Tag>
      );
    case "Payment60Rejected":
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          color="red"
          className="px-3 py-1 text-base"
        >
          Từ chối thanh toán 60%
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

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shouldScroll = searchParams.get("scrollToLearningPath") === "true";
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [learningPathSessions, setLearningPathSessions] = useState([]);
  const [loadingPathSessions, setLoadingPathSessions] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
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
  const [paymentType, setPaymentType] = useState("initial");
  const [rejectPaymentLoading, setRejectPaymentLoading] = useState(false);
  const [rejectPaymentSuccessVisible, setRejectPaymentSuccessVisible] =
    useState(false);
  const [isConfirmRejectPaymentVisible, setIsConfirmRejectPaymentVisible] =
    useState(false);
  const [rejectPaymentType, setRejectPaymentType] = useState("");
  const learningPathRef = useRef(null);

  const fetchRegistrationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegis/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.isSucceed) {
        const reg = response.data.data;
        reg.LearningDays = (reg.LearningDays || []).map((day) =>
          convertDayToVietnamese(day)
        );
        setRegistration(reg);
        fetchLearningPathSessions(reg.LearningRegisId);
      } else {
        throw new Error(
          response.data?.message || "Không thể tải chi tiết đăng ký"
        );
      }
    } catch (error) {
      message.error(error.message || "Không thể tải chi tiết đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationDetail();
  }, [id]);

  useEffect(() => {
    if (!loading && registration && learningPathRef.current && shouldScroll) {
      setTimeout(() => {
        learningPathRef.current.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [loading, registration, shouldScroll]);

  const fetchLearningPathSessions = async (learningRegisId) => {
    try {
      setLoadingPathSessions(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/${learningRegisId}/learning-path-sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.isSucceed) {
        setLearningPathSessions(response.data.data);
        console.log("learningPathSessions", response.data.data);
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

  // Thanh toán 40%
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!walletResponse.data.isSucceed) {
        throw new Error("Không thể kiểm tra số dư ví");
      }
      const currentBalance = walletResponse.data.data.balance;
      const requiredAmount = registration.Price * 0.4;
      if (currentBalance < requiredAmount) {
        setPaymentType("initial");
        setIsInsufficientBalanceModalVisible(true);
      } else {
        setPaymentType("initial");
        setIsConfirmInitialPaymentVisible(true);
      }
    } catch (error) {
      message.error(error.message || "Không thể kiểm tra số dư ví");
    }
  };

  // Thanh toán 60%
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!walletResponse.data.isSucceed) {
        throw new Error("Không thể kiểm tra số dư ví");
      }
      const currentBalance = walletResponse.data.data.balance;
      const requiredAmount = registration.Price * 0.6;
      if (currentBalance < requiredAmount) {
        setPaymentType("remaining");
        setIsInsufficientBalanceModalVisible(true);
      } else {
        setPaymentType("remaining");
        setIsConfirmRemainingPaymentVisible(true);
      }
    } catch (error) {
      message.error(error.message || "Không thể kiểm tra số dư ví");
    }
  };

  // Xác nhận thanh toán 40%
  const handleConfirmInitialPayment = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("authToken");
      const regisId = registration.LearningRegisId;
      const data = { learningRegisId: regisId, paymentMethod: 0 };
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
        setPaymentSuccessVisible(true);
        fetchRegistrationDetail();
        message.success("Thanh toán 40% học phí thành công!");
      } else {
        throw new Error(response.data?.message || "Thanh toán thất bại");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Xác nhận thanh toán 60%
  const handleConfirmRemainingPayment = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("authToken");
      const regisId = registration.LearningRegisId;
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
        setPaymentSuccessVisible(true);
        fetchRegistrationDetail();
        message.success("Thanh toán phần còn lại thành công!");
      } else {
        throw new Error(response.data?.message || "Thanh toán thất bại");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Xử lý từ chối thanh toán 40%
  const handleRejectInitialPayment = async () => {
    try {
      setRejectPaymentLoading(true);
      const token = localStorage.getItem("authToken");
      const regisId = registration.LearningRegisId;
      const response = await axios({
        method: "post",
        url: `https://instrulearnapplication.azurewebsites.net/api/Payment/reject-payment/${regisId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.isSucceed) {
        setIsConfirmInitialPaymentVisible(false);
        setIsConfirmRejectPaymentVisible(false);
        setRejectPaymentSuccessVisible(true);
        fetchRegistrationDetail();
        message.success("Từ chối thanh toán thành công!");
      } else {
        throw new Error(
          response.data?.message || "Từ chối thanh toán thất bại"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Từ chối thanh toán thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setRejectPaymentLoading(false);
    }
  };

  // Xử lý từ chối thanh toán phần còn lại (60%)
  const handleRejectRemainingPayment = async () => {
    try {
      setRejectPaymentLoading(true);
      const token = localStorage.getItem("authToken");
      const regisId = registration.LearningRegisId;
      const response = await axios({
        method: "post",
        url: `https://instrulearnapplication.azurewebsites.net/api/Payment/reject-payment/${regisId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.isSucceed) {
        setIsConfirmRemainingPaymentVisible(false);
        setIsConfirmRejectPaymentVisible(false);
        setRejectPaymentSuccessVisible(true);
        fetchRegistrationDetail();
        message.success("Từ chối thanh toán thành công!");
      } else {
        throw new Error(
          response.data?.message || "Từ chối thanh toán thất bại"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Từ chối thanh toán thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setRejectPaymentLoading(false);
    }
  };

  // Xử lý hiển thị modal xác nhận từ chối
  const handleShowRejectConfirmation = (type) => {
    setRejectPaymentType(type);
    setIsConfirmRejectPaymentVisible(true);
  };

  const handleNavigateToWallet = () => {
    setIsInsufficientBalanceModalVisible(false);
    navigate("/profile/topup");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin tip="Đang tải chi tiết..." />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="text-center py-8">
        <Title level={4} type="danger">
          Không tìm thấy thông tin đăng ký
        </Title>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        className="shadow-md hover:shadow-lg transition-all duration-300 max-w-3xl mx-auto"
        bordered={false}
        title={
          <Title level={4} className="mb-0 flex items-center">
            <BookOutlined className="mr-2 text-purple-600" />
            Chi tiết đăng ký học
          </Title>
        }
      >
        <div className="space-y-6">
          {/* Trạng thái */}
          <div>
            <Text type="secondary" className="block mb-1">
              Trạng thái
            </Text>
            {getStatusTag(registration.Status)}
          </div>

          <Divider className="my-6" />

          {/* Thông tin đăng ký học */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <Title level={4} className="text-purple-700 mb-4">
              <BookOutlined className="mr-2" /> Thông tin đăng ký học
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <Text type="secondary">Họ tên học viên</Text>
                <div className="text-lg font-medium">
                  {registration.FullName}
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Số điện thoại</Text>
                <div className="text-lg font-medium">
                  {registration.PhoneNumber}
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Nhạc cụ</Text>
                <div className="text-lg font-medium">
                  {registration.MajorName}
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Giáo viên</Text>
                <div className="text-lg font-medium">
                  {registration.TeacherName}
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Thời gian học</Text>
                <div className="text-lg font-medium">
                  {registration.TimeStart?.substring(0, 5)} -{" "}
                  {registration.TimeEnd?.substring(0, 5)} (
                  {registration.TimeLearning} phút)
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Số buổi học</Text>
                <div className="text-lg font-medium">
                  {registration.NumberOfSession} buổi
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Trình độ của học viên</Text>
                <div className="text-lg font-medium">
                  {registration.SelfAssessment || "Chưa cung cấp"}
                </div>
              </Col>
            </Row>
            <div className="mt-6">
              <Text type="secondary">Ngày học trong tuần</Text>
              <div className="flex gap-2 flex-wrap mt-2">
                {(registration.LearningDays || []).map((day, idx) => (
                  <Tag key={idx} color="purple" className="px-3 py-1 text-base">
                    {day}
                  </Tag>
                ))}
              </div>
            </div>
            {registration.LearningRequest && (
              <div className="mt-6">
                {registration.Status === "Cancelled" &&
                (registration.LearningRequest === "Quá hạn thanh toán" ||
                  registration.LearningRequest === "Quá hạn thanh toán 60%") ? (
                  <>
                    <Text
                      type="danger"
                      strong
                      style={{ color: "#e53935", fontWeight: 600 }}
                    >
                      Nguyên nhân hủy đơn
                    </Text>
                    <div className="text-lg font-bold mt-1 text-red-600">
                      {registration.LearningRequest}
                    </div>
                  </>
                ) : (
                  <>
                    <Text type="secondary">Yêu cầu học</Text>
                    <div className="text-lg font-medium mt-1">
                      {registration.LearningRequest}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Video đã tải lên */}
          {registration.VideoUrl && registration.VideoUrl !== "string" && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <Title level={4} className="text-blue-700 mb-4">
                <PlayCircleOutlined className="mr-2" /> Video đã tải lên
              </Title>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => setVideoModalVisible(true)}
                className="bg-blue-600 hover:bg-blue-700 border-none"
              >
                Xem video
              </Button>
            </div>
          )}

          {/* Ngày yêu cầu, ngày bắt đầu */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <Text type="secondary">Ngày yêu cầu</Text>
                <div className="text-lg font-medium">
                  {dayjs(registration.RequestDate).format("DD/MM/YYYY HH:mm")}
                </div>
              </Col>
              {registration.StartDay && (
                <Col xs={24} sm={12}>
                  <Text type="secondary">Ngày bắt đầu</Text>
                  <div className="text-lg font-medium">
                    {dayjs(registration.StartDay).format("DD/MM/YYYY")}
                  </div>
                </Col>
              )}
            </Row>
          </div>

          {/* Thông tin xác nhận, học phí, lộ trình thanh toán, nút thanh toán, lộ trình học tập */}
          {registration.Status !== "Pending" && (
            <>
              <Divider className="my-6" />
              <div className="bg-green-50 p-4 rounded-lg">
                <Title level={4} className="text-green-700 mb-4">
                  <CheckCircleOutlined className="mr-2" /> Thông tin xác nhận
                </Title>
                <Row gutter={[24, 24]}>
                  {registration.LevelName && (
                    <Col xs={24} sm={12}>
                      <Text type="secondary">Cấp độ được xếp</Text>
                      <div className="text-lg font-medium">
                        {registration.LevelName}
                      </div>
                    </Col>
                  )}
                  {registration.ResponseTypeName && (
                    <Col xs={24} sm={12}>
                      <Text type="secondary">Loại phản hồi</Text>
                      <div className="text-lg font-medium">
                        {registration.ResponseTypeName}
                      </div>
                    </Col>
                  )}
                  {registration.ResponseDescription && (
                    <Col xs={24}>
                      <Text type="secondary">Nội dung phản hồi</Text>
                      <div className="text-lg font-medium">
                        {registration.ResponseDescription}
                      </div>
                    </Col>
                  )}
                  {registration.Price && (
                    <Col xs={24}>
                      <Text type="secondary">Học phí</Text>
                      <div className="text-lg font-medium text-red-600">
                        {registration.Price.toLocaleString("vi-VN")} VNĐ
                        {registration.NumberOfSession && (
                          <Text type="secondary" className="text-sm ml-2">
                            (
                            {(
                              registration.Price / registration.NumberOfSession
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ/buổi)
                          </Text>
                        )}
                      </div>
                    </Col>
                  )}
                  {/* Lộ trình thanh toán */}
                  <Col xs={24}>
                    <Text
                      type="secondary"
                      className="text-lg font-semibold mb-2 block"
                    >
                      Lộ trình thanh toán
                    </Text>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                      {/* Bước 1: Đăng ký học */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex flex-col items-center">
                          <CheckCircleOutlined className="text-3xl text-green-500 mb-1" />
                          <div
                            className="h-full w-1 bg-green-200"
                            style={{ minHeight: 60 }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-green-700 mb-1">
                            Đăng ký học
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            Ngày đăng ký:{" "}
                            {dayjs(registration.RequestDate).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </div>
                          <div className="mb-1">
                            Trạng thái:{" "}
                            {getStatusTag(
                              [
                                "Accepted",
                                "Fourty",
                                "FourtyFeedbackDone",
                                "Sixty",
                                "Completed",
                              ].includes(registration.Status)
                                ? "Accepted"
                                : registration.Status
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Bước 2: Thanh toán 40% */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex flex-col items-center">
                          <CheckCircleOutlined
                            className={`text-3xl mb-1 ${
                              [
                                "Fourty",
                                "FourtyFeedbackDone",
                                "Sixty",
                                "Completed",
                              ].includes(registration.Status)
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                          <div
                            className="h-full w-1 bg-green-200"
                            style={{ minHeight: 60 }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-green-700 mb-1">
                            Thanh toán 40% học phí
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            Phần trăm:{" "}
                            {registration.firstPaymentPeriod?.PaymentPercent ||
                              40}
                            %
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            Số tiền:{" "}
                            {(
                              registration.firstPaymentPeriod?.PaymentAmount ||
                              registration.Price * 0.4
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </div>
                          {registration.firstPaymentPeriod?.PaymentDeadline && (
                            <div className="text-gray-600 text-sm mb-1">
                              Hạn thanh toán:{" "}
                              {dayjs(
                                registration.firstPaymentPeriod.PaymentDeadline
                              ).format("DD/MM/YYYY HH:mm")}
                            </div>
                          )}
                          {registration.firstPaymentPeriod?.PaymentDate && (
                            <div className="text-gray-600 text-sm mb-1">
                              Ngày thanh toán:{" "}
                              {dayjs(
                                registration.firstPaymentPeriod.PaymentDate
                              ).format("DD/MM/YYYY HH:mm")}
                            </div>
                          )}
                          <div className="mb-1">
                            Trạng thái:{" "}
                            {getCustomPaymentStatusTag(
                              registration.firstPaymentPeriod?.PaymentStatus ||
                                ""
                            )}
                          </div>
                          {typeof registration.firstPaymentPeriod
                            ?.RemainingDays === "number" && (
                            <div className="text-sm mb-1">
                              Số ngày còn lại:{" "}
                              <span
                                className={
                                  registration.firstPaymentPeriod
                                    .RemainingDays <= 0
                                    ? "text-red-500 font-semibold"
                                    : "text-gray-700"
                                }
                              >
                                {registration.firstPaymentPeriod.RemainingDays}{" "}
                                ngày
                              </span>
                            </div>
                          )}
                          {registration.firstPaymentPeriod?.IsOverdue && (
                            <div className="text-red-500 font-semibold">
                              Đã quá hạn thanh toán
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Bước 3: Thanh toán 60% */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <CheckCircleOutlined
                            className={`text-3xl mb-1 ${
                              ["Sixty", "Completed"].includes(
                                registration.Status
                              )
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-green-700 mb-1">
                            Thanh toán 60% học phí còn lại
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            Phần trăm:{" "}
                            {registration.secondPaymentPeriod?.PaymentPercent ||
                              60}
                            %
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            Số tiền:{" "}
                            {(
                              registration.secondPaymentPeriod?.PaymentAmount ||
                              registration.Price * 0.6
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </div>
                          {registration.secondPaymentPeriod
                            ?.PaymentDeadline && (
                            <div className="text-gray-600 text-sm mb-1">
                              Hạn thanh toán:{" "}
                              {dayjs(
                                registration.secondPaymentPeriod.PaymentDeadline
                              ).format("DD/MM/YYYY HH:mm")}
                            </div>
                          )}
                          {registration.secondPaymentPeriod?.PaymentDate && (
                            <div className="text-gray-600 text-sm mb-1">
                              Ngày thanh toán:{" "}
                              {dayjs(
                                registration.secondPaymentPeriod.PaymentDate
                              ).format("DD/MM/YYYY HH:mm")}
                            </div>
                          )}
                          <div className="mb-1">
                            Trạng thái:{" "}
                            {getCustomPaymentStatusTag(
                              registration.secondPaymentPeriod?.PaymentStatus ||
                                ""
                            )}
                          </div>
                          {typeof registration.secondPaymentPeriod
                            ?.RemainingDays === "number" && (
                            <div className="text-sm mb-1">
                              Số ngày còn lại:{" "}
                              <span
                                className={
                                  registration.secondPaymentPeriod
                                    .RemainingDays <= 0
                                    ? "text-red-500 font-semibold"
                                    : "text-gray-700"
                                }
                              >
                                {registration.secondPaymentPeriod.RemainingDays}{" "}
                                ngày
                              </span>
                            </div>
                          )}
                          {registration.secondPaymentPeriod?.IsOverdue && (
                            <div className="text-red-500 font-semibold">
                              Đã quá hạn thanh toán
                            </div>
                          )}
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="text-sm text-yellow-700">
                              <ExclamationCircleOutlined className="mr-1" />
                              Sau khi học xong 40% tổng số buổi học viên sẽ phải
                              làm feedback đánh giá để xác định học viên có muốn
                              tiếp tục học tiếp hay không?
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  {/* Nút thanh toán */}
                  {registration.Status === "Accepted" &&
                    learningPathSessions.some((s) => s.isCompleted) && (
                      <Col xs={24}>
                        <Button
                          type="primary"
                          onClick={handleInitialPaymentClick}
                          className="bg-green-600 hover:bg-green-700 border-none mr-2 mt-4"
                          loading={paymentLoading}
                        >
                          Thanh toán 40% học phí
                        </Button>
                      </Col>
                    )}
                  {registration.Status === "FourtyFeedbackDone" && (
                    <Col xs={24}>
                      <Button
                        type="primary"
                        onClick={handleRemainingPaymentClick}
                        className="bg-blue-600 hover:bg-blue-700 border-none mr-2 mt-4"
                        loading={paymentLoading}
                      >
                        Thanh toán phần còn lại
                      </Button>
                    </Col>
                  )}
                  {/* Lộ trình học tập */}
                  {[
                    "Accepted",
                    "Fourty",
                    "FourtyFeedbackDone",
                    "Sixty",
                    "Completed",
                  ].includes(registration.Status) && (
                    <Col xs={24}>
                      <div className="mt-6" ref={learningPathRef}>
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
                                  Lộ trình học tập của học viên đang được giáo
                                  viên soạn, nếu giáo viên đã soạn xong lộ trình
                                  học viên sẽ nhận được thông báo sớm nhất trong
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
      </Card>

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
        {registration.VideoUrl && (
          <div className="flex justify-center">
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
              <video
                src={registration.VideoUrl}
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
        open={isConfirmInitialPaymentVisible}
        onCancel={() => setIsConfirmInitialPaymentVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            className="bg-green-600 hover:bg-green-700"
            loading={paymentLoading}
            onClick={handleConfirmInitialPayment}
            style={{ background: "#16a34a", borderColor: "#16a34a" }}
          >
            Xác nhận thanh toán
          </Button>,
          <Button
            key="reject"
            danger
            loading={rejectPaymentLoading}
            onClick={() => handleShowRejectConfirmation("initial")}
            style={{ borderColor: "#e53935", color: "#e53935" }}
          >
            Từ chối thanh toán
          </Button>,
        ]}
        width={500}
        centered
        closable
      >
        <div className="text-center">
          <div className="text-2xl font-bold mb-2" style={{ color: "#16a34a" }}>
            Xác nhận thanh toán 40% học phí
          </div>
          <div className="mb-4" style={{ color: "#6b7280", fontWeight: 500 }}>
            Vui lòng kiểm tra thông tin trước khi xác nhận thanh toán
          </div>
          <div
            className="rounded-lg p-6 mb-4"
            style={{
              background: "#ecfdf5",
              display: "inline-block",
              width: "100%",
            }}
          >
            <div
              className="text-xl font-semibold mb-2"
              style={{ color: "#16a34a" }}
            >
              Số tiền cần thanh toán (40% học phí)
            </div>
            <div className="text-3xl font-bold" style={{ color: "#16a34a" }}>
              {registration?.Price
                ? (registration.Price * 0.4).toLocaleString("vi-VN")
                : 0}{" "}
              VNĐ
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
        footer={[
          <Button
            key="reject"
            danger
            loading={rejectPaymentLoading}
            onClick={() => handleShowRejectConfirmation("remaining")}
          >
            Từ chối thanh toán
          </Button>,
          <Button
            key="ok"
            type="primary"
            className="bg-blue-600 hover:bg-blue-700"
            loading={paymentLoading}
            onClick={handleConfirmRemainingPayment}
          >
            Xác nhận thanh toán
          </Button>,
        ]}
      >
        <div className="py-4">
          <div className="bg-blue-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 mb-2">
                Số tiền cần thanh toán (60% học phí còn lại)
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {registration?.Price
                  ? (registration.Price * 0.6).toLocaleString("vi-VN")
                  : 0}{" "}
                VNĐ
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận từ chối thanh toán */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Xác nhận từ chối thanh toán
            </div>
            <div className="text-gray-500">
              Học viên có chắc sẽ từ chối thanh toán học phí không? Khi từ chối
              thanh toán lịch học của học viên trong tương lai sẽ bị hủy, điều
              này không thể hoàn tác
            </div>
          </div>
        }
        open={isConfirmRejectPaymentVisible}
        onOk={() => {
          if (rejectPaymentType === "initial") {
            handleRejectInitialPayment();
          } else {
            handleRejectRemainingPayment();
          }
        }}
        onCancel={() => setIsConfirmRejectPaymentVisible(false)}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-600 hover:bg-red-700",
          loading: rejectPaymentLoading,
        }}
      >
        <div className="py-4 text-center">
          <div className="mb-4">
            <CloseCircleOutlined className="text-6xl text-red-500" />
          </div>
          {/* <div className="text-lg mb-4">
            Việc từ chối thanh toán đồng nghĩa với việc lịch học của bạn sẽ bị
            hủy bỏ.
          </div> */}
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
                {registration?.Price
                  ? (
                      registration.Price *
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
            {registration?.Price
              ? (
                  registration.Price * (paymentType === "initial" ? 0.4 : 0.6)
                ).toLocaleString("vi-VN")
              : 0}{" "}
            VNĐ
          </div>
        </div>
      </Modal>

      {/* Modal thông báo từ chối thanh toán thành công */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Đã từ chối thanh toán
            </div>
          </div>
        }
        open={rejectPaymentSuccessVisible}
        onOk={() => setRejectPaymentSuccessVisible(false)}
        okText="Đồng ý"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ className: "bg-red-600 hover:bg-red-700" }}
      >
        <div className="py-4 text-center">
          <div className="mb-4">
            <CloseCircleOutlined className="text-6xl text-red-500" />
          </div>
          <div className="text-lg mb-4">
            Việc từ chối thanh toán đồng nghĩa với việc lịch học của bạn sẽ bị
            hủy bỏ.
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

export default RegistrationDetail;
