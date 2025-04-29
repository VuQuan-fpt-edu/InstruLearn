import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Rate,
  Tag,
  Button,
  Badge,
  Modal,
  Tabs,
  Avatar,
  List,
  Input,
  Form,
  Space,
  message,
  Result,
} from "antd";
import {
  PlayCircleFilled,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  FileImageOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;
const { TextArea } = Input;

// Tạo component Comment tùy chỉnh
const CustomComment = ({ author, avatar, content, datetime, children }) => (
  <div className="ant-comment">
    <div className="ant-comment-inner">
      <div className="ant-comment-avatar">{avatar}</div>
      <div className="ant-comment-content">
        <div className="ant-comment-content-author">
          <span className="ant-comment-content-author-name">{author}</span>
          <span className="ant-comment-content-author-time">{datetime}</span>
        </div>
        <div className="ant-comment-content-detail">{content}</div>
        {children && <div className="ant-comment-actions">{children}</div>}
      </div>
    </div>
  </div>
);

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginWarningModalVisible, setIsLoginWarningModalVisible] =
    useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userInfo, setUserInfo] = useState({
    token: null,
    accountId: null,
    learnerId: null,
    username: null,
    role: null,
  });
  const [
    isInsufficientBalanceModalVisible,
    setIsInsufficientBalanceModalVisible,
  ] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [showReplies, setShowReplies] = useState({});
  const [showQAReplies, setShowQAReplies] = useState({});

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Course/${id}`
      );
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course detail:", error);
      message.error("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("authToken");
      const accountId = localStorage.getItem("accountId");
      const learnerId = localStorage.getItem("learnerId");
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("role");

      const isLoggedIn = !!token && !!accountId;
      setIsLoggedIn(isLoggedIn);

      if (isLoggedIn) {
        setUserInfo({
          token,
          accountId,
          learnerId,
          username,
          role,
        });
        checkPurchaseStatus(learnerId);
      }
    };

    checkLoginStatus();
    fetchCourseDetail();
    fetchWalletBalance();
  }, [id]);

  const checkPurchaseStatus = async (learnerId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Purchase/by-learner/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        const purchases = response.data.data;
        const hasBought = purchases.some((purchase) =>
          purchase.purchaseItems.some(
            (item) => item.coursePackageId === parseInt(id)
          )
        );
        setHasPurchased(hasBought);
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        throw new Error("Bạn chưa đăng nhập");
      }

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

  const handleFeedbackSubmit = async (values) => {
    if (!isLoggedIn) {
      message.error("Vui lòng đăng nhập để đánh giá");
      navigate("/login", { state: { from: `/package/${id}` } });
      return;
    }

    try {
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Feedback/create",
        {
          coursePackageId: parseInt(id),
          accountId: userInfo.accountId,
          feedbackContent: values.feedback,
          rating: values.rating,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Gửi đánh giá thành công!");
        form.resetFields();
        fetchCourseDetail();
      } else {
        throw new Error(response.data.message || "Gửi đánh giá thất bại");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error(error.message || "Có lỗi xảy ra khi gửi đánh giá");
    }
  };

  const handleReplySubmit = async (feedbackId, values) => {
    if (!isLoggedIn) {
      message.error("Vui lòng đăng nhập để phản hồi");
      navigate("/login", { state: { from: `/package/${id}` } });
      return;
    }

    if (!hasPurchased) {
      message.error("Bạn cần mua khóa học để phản hồi");
      return;
    }

    try {
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/FeedbackReplies/create",
        {
          feedbackId: feedbackId,
          accountId: userInfo.accountId,
          repliesContent: values.reply,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Gửi phản hồi thành công!");
        replyForm.resetFields();
        fetchCourseDetail();
      } else {
        throw new Error(response.data.message || "Gửi phản hồi thất bại");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      message.error(error.message || "Có lỗi xảy ra khi gửi phản hồi");
    }
  };

  const handleQuestionSubmit = async (values) => {
    if (!isLoggedIn) {
      message.error("Vui lòng đăng nhập để đặt câu hỏi");
      navigate("/login", { state: { from: `/package/${id}` } });
      return;
    }

    try {
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/QnA/create",
        {
          coursePackageId: parseInt(id),
          accountId: userInfo.accountId,
          title: values.title,
          questionContent: values.question,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Đặt câu hỏi thành công!");
        questionForm.resetFields();
        fetchCourseDetail();
      } else {
        throw new Error(response.data.message || "Đặt câu hỏi thất bại");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      message.error(error.message || "Có lỗi xảy ra khi đặt câu hỏi");
    }
  };

  const handleQnAReplySubmit = async (questionId, values) => {
    if (!isLoggedIn) {
      message.error("Vui lòng đăng nhập để trả lời");
      navigate("/login", { state: { from: `/package/${id}` } });
      return;
    }

    if (!hasPurchased) {
      message.error("Bạn cần mua khóa học để trả lời");
      return;
    }

    try {
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/QnAReplies/create",
        {
          questionId: questionId,
          accountId: userInfo.accountId,
          qnAContent: values.qnaReply,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Gửi câu trả lời thành công!");
        replyForm.resetFields();
        fetchCourseDetail();
      } else {
        throw new Error(response.data.message || "Gửi câu trả lời thất bại");
      }
    } catch (error) {
      console.error("Error submitting QnA reply:", error);
      message.error(error.message || "Có lỗi xảy ra khi gửi câu trả lời");
    }
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        message.error("Vui lòng đăng nhập để đăng ký khóa học");
        navigate("/login");
        return;
      }

      if (walletBalance < course.price) {
        setIsInsufficientBalanceModalVisible(true);
        return;
      }

      setIsEnrolling(true);
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/PurchaseItem/create",
        {
          purchaseItemId: 0,
          learnerId: parseInt(learnerId),
          coursePackages: [
            {
              coursePackageId: parseInt(id),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      setShowConfirmModal(false);

      if (response.data.isSucceed) {
        setSuccessData(response.data);
        setShowSuccessModal(true);
      } else {
        Modal.error({
          title: "Đăng ký khóa học thất bại",
          width: 500,
          content: (
            <div className="text-center py-4">
              <div className="bg-red-50 rounded-lg p-6 mb-4">
                <div className="text-xl font-bold text-red-600 mb-2">
                  Có lỗi xảy ra!
                </div>
                <div className="text-gray-600">
                  {response.data.message ||
                    "Không thể đăng ký khóa học. Vui lòng thử lại sau."}
                </div>
              </div>
            </div>
          ),
          okText: "Đóng",
          okButtonProps: {
            style: { backgroundColor: "#9333ea", borderColor: "#9333ea" },
          },
        });
      }
    } catch (error) {
      console.error("Error enrolling course:", error);
      setShowConfirmModal(false);
      Modal.error({
        title: "Đăng ký khóa học thất bại",
        width: 500,
        content: (
          <div className="text-center py-4">
            <div className="bg-red-50 rounded-lg p-6 mb-4">
              <div className="text-xl font-bold text-red-600 mb-2">
                Có lỗi xảy ra!
              </div>
              <div className="text-gray-600">
                {error.response?.data?.message ||
                  error.message ||
                  "Không thể đăng ký khóa học. Vui lòng thử lại sau."}
              </div>
            </div>
          </div>
        ),
        okText: "Đóng",
        okButtonProps: {
          style: { backgroundColor: "#9333ea", borderColor: "#9333ea" },
        },
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleNavigateToWallet = () => {
    setIsInsufficientBalanceModalVisible(false);
    navigate("/profile/topup");
  };

  const handleEnrollClick = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsLoginWarningModalVisible(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleVideoClick = (item) => {
    if (item.status === 0) {
      message.warning("Nội dung này hiện đang bị khóa");
      return;
    }
    setSelectedVideo(item);
    setIsVideoModalVisible(true);
  };

  const toggleReplies = (feedbackId) => {
    setShowReplies((prev) => ({
      ...prev,
      [feedbackId]: !prev[feedbackId],
    }));
  };

  const toggleQAReplies = (questionId) => {
    setShowQAReplies((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">Đang tải thông tin khóa học...</div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">Không tìm thấy thông tin khóa học</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {course.courseName}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <Tag color="blue">{course.courseTypeName}</Tag>
                <div className="flex items-center">
                  <Rate disabled defaultValue={course.rating} />
                  <span className="ml-2 text-gray-600">
                    ({course.feedBacks?.length || 0} đánh giá)
                  </span>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-6">{course.headline}</p>
              <p className="text-gray-700 mb-8">{course.courseDescription}</p>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-purple-600">
                  {formatPrice(course.price)}
                </div>
                {course.discount > 0 && (
                  <Tag color="red">-{course.discount}%</Tag>
                )}
                {hasPurchased ? (
                  <div className="flex gap-4">
                    <Button
                      type="primary"
                      size="large"
                      className="bg-green-600 hover:bg-green-700"
                      disabled
                    >
                      Đã mua khóa học
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate("/profile")}
                    >
                      Đi đến thư viện khóa học
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleEnrollClick}
                    loading={isEnrolling}
                  >
                    Mua khóa học
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <img
                src={course.imageUrl}
                alt={course.courseName}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <PlayCircleFilled /> Nội dung khóa học
              </span>
            }
            key="1"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              {hasPurchased ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Bạn đã mua khóa học này!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vui lòng truy cập thư viện khóa học của bạn để xem nội dung
                  </p>
                  <Button
                    type="primary"
                    onClick={() => navigate("/profile")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Đi đến thư viện khóa học
                  </Button>
                </div>
              ) : (
                course.courseContents?.map((content) => (
                  <div key={content.contentId} className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {content.heading}
                    </h3>
                    {content.courseContentItems?.map((item) => (
                      <div
                        key={item.itemId}
                        className={`flex items-center p-4 ${
                          item.status === 0
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        } rounded-lg mb-2`}
                        onClick={() =>
                          item.status === 1 && handleVideoClick(item)
                        }
                      >
                        {item.itemTypeId === 1 ? (
                          <FileImageOutlined
                            className={`text-2xl mr-3 ${
                              item.status === 0
                                ? "text-gray-400"
                                : "text-purple-600"
                            }`}
                          />
                        ) : item.itemTypeId === 2 ? (
                          <VideoCameraOutlined
                            className={`text-2xl mr-3 ${
                              item.status === 0
                                ? "text-gray-400"
                                : "text-purple-600"
                            }`}
                          />
                        ) : (
                          <FileTextOutlined
                            className={`text-2xl mr-3 ${
                              item.status === 0
                                ? "text-gray-400"
                                : "text-purple-600"
                            }`}
                          />
                        )}
                        <div className="flex-1">
                          <span
                            className={item.status === 0 ? "text-gray-400" : ""}
                          >
                            {item.itemTypeId === 1
                              ? "Hình ảnh bài học"
                              : item.itemTypeId === 2
                              ? "Video bài học"
                              : "Tài liệu bài học"}
                          </span>
                        </div>
                        {item.status === 0 && (
                          <Badge
                            count="Khóa"
                            style={{ backgroundColor: "#d9d9d9" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <StarOutlined /> Đánh giá
              </span>
            }
            key="2"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              {!isLoggedIn ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg mb-8">
                  <p className="text-gray-600 mb-4">
                    Vui lòng đăng nhập để đánh giá khóa học
                  </p>
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate("/login", { state: { from: `/package/${id}` } })
                    }
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Đăng nhập
                  </Button>
                </div>
              ) : (
                <Form
                  form={form}
                  onFinish={handleFeedbackSubmit}
                  className="mb-8"
                >
                  <Form.Item
                    name="rating"
                    label="Đánh giá"
                    rules={[
                      { required: true, message: "Vui lòng chọn số sao" },
                    ]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item
                    name="feedback"
                    label="Nội dung đánh giá"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập nội dung đánh giá",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Gửi đánh giá
                    </Button>
                  </Form.Item>
                </Form>
              )}

              <List
                className="comment-list"
                header={`${course.feedBacks?.length || 0} đánh giá`}
                itemLayout="horizontal"
                dataSource={course.feedBacks}
                renderItem={(feedback) => (
                  <li className="border-b border-gray-200 last:border-b-0 py-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <CustomComment
                        author={
                          <span className="font-semibold">
                            {feedback.email}
                          </span>
                        }
                        avatar={<Avatar icon={<UserOutlined />} />}
                        content={
                          <div>
                            <Rate disabled defaultValue={feedback.rating} />
                            <p className="mt-2 text-gray-700">
                              {feedback.feedbackContent}
                            </p>
                          </div>
                        }
                        datetime={new Date(
                          feedback.createdAt
                        ).toLocaleDateString()}
                      />

                      <div className="mt-4">
                        <Button
                          type="link"
                          onClick={() => toggleReplies(feedback.feedbackId)}
                          className="text-purple-600"
                        >
                          {showReplies[feedback.feedbackId]
                            ? "Ẩn phản hồi"
                            : `Xem phản hồi (${feedback.replies?.length || 0})`}
                        </Button>
                      </div>

                      {showReplies[feedback.feedbackId] && (
                        <div className="ml-12 mt-4 border-l-2 border-purple-200 pl-4">
                          {feedback.replies?.map((reply) => (
                            <div
                              key={reply.feedbackRepliesId}
                              className="bg-gray-50 p-3 rounded-lg mb-3"
                            >
                              <CustomComment
                                author={
                                  <span className="font-semibold">
                                    {reply.email}
                                  </span>
                                }
                                avatar={<Avatar icon={<UserOutlined />} />}
                                content={
                                  <p className="text-gray-600">
                                    {reply.repliesContent}
                                  </p>
                                }
                                datetime={new Date(
                                  reply.createdAt
                                ).toLocaleDateString()}
                              />
                            </div>
                          ))}
                          {hasPurchased && (
                            <Form
                              form={replyForm}
                              onFinish={(values) =>
                                handleReplySubmit(feedback.feedbackId, values)
                              }
                              className="mt-4"
                            >
                              <Form.Item
                                name="reply"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập nội dung phản hồi",
                                  },
                                ]}
                              >
                                <TextArea
                                  rows={2}
                                  placeholder="Viết phản hồi của bạn..."
                                />
                              </Form.Item>
                              <Form.Item>
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  size="small"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Gửi phản hồi
                                </Button>
                              </Form.Item>
                            </Form>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                )}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <QuestionCircleOutlined /> Hỏi & Đáp
              </span>
            }
            key="3"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              {!isLoggedIn ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg mb-8">
                  <p className="text-gray-600 mb-4">
                    Vui lòng đăng nhập để đặt câu hỏi
                  </p>
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate("/login", { state: { from: `/package/${id}` } })
                    }
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Đăng nhập
                  </Button>
                </div>
              ) : (
                <Form
                  form={questionForm}
                  onFinish={handleQuestionSubmit}
                  className="mb-8"
                >
                  <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tiêu đề câu hỏi",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập tiêu đề câu hỏi của bạn..." />
                  </Form.Item>
                  <Form.Item
                    name="question"
                    label="Nội dung câu hỏi"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập nội dung câu hỏi",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Mô tả chi tiết câu hỏi của bạn..."
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Đặt câu hỏi
                    </Button>
                  </Form.Item>
                </Form>
              )}

              <List
                className="comment-list"
                header={`${course.qnAs?.length || 0} câu hỏi`}
                itemLayout="horizontal"
                dataSource={course.qnAs}
                renderItem={(qa) => (
                  <li className="border-b border-gray-200 last:border-b-0 py-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <CustomComment
                        author={
                          <span className="font-semibold">{qa.email}</span>
                        }
                        avatar={<Avatar icon={<UserOutlined />} />}
                        content={
                          <div>
                            <h4 className="text-lg font-semibold text-purple-600">
                              {qa.title}
                            </h4>
                            <p className="mt-2 text-gray-700">
                              {qa.questionContent}
                            </p>
                          </div>
                        }
                        datetime={new Date(qa.createdAt).toLocaleDateString()}
                      />

                      <div className="mt-4">
                        <Button
                          type="link"
                          onClick={() => toggleQAReplies(qa.questionId)}
                          className="text-purple-600"
                        >
                          {showQAReplies[qa.questionId]
                            ? "Ẩn câu trả lời"
                            : `Xem câu trả lời (${qa.replies?.length || 0})`}
                        </Button>
                      </div>

                      {showQAReplies[qa.questionId] && (
                        <div className="ml-12 mt-4 border-l-2 border-purple-200 pl-4">
                          {qa.replies?.map((reply) => (
                            <div
                              key={reply.replyId}
                              className="bg-gray-50 p-3 rounded-lg mb-3"
                            >
                              <CustomComment
                                author={
                                  <span className="font-semibold">
                                    {reply.email}
                                  </span>
                                }
                                avatar={<Avatar icon={<UserOutlined />} />}
                                content={
                                  <p className="text-gray-600">
                                    {reply.qnAContent}
                                  </p>
                                }
                                datetime={new Date(
                                  reply.createdAt
                                ).toLocaleDateString()}
                              />
                            </div>
                          ))}
                          {hasPurchased && (
                            <Form
                              form={replyForm}
                              onFinish={(values) =>
                                handleQnAReplySubmit(qa.questionId, values)
                              }
                              className="mt-4"
                            >
                              <Form.Item
                                name="qnaReply"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập câu trả lời",
                                  },
                                ]}
                              >
                                <TextArea
                                  rows={2}
                                  placeholder="Viết câu trả lời của bạn..."
                                />
                              </Form.Item>
                              <Form.Item>
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  size="small"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Gửi câu trả lời
                                </Button>
                              </Form.Item>
                            </Form>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                )}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Modal cảnh báo chưa đăng nhập */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              Vui lòng đăng nhập
            </div>
            <div className="text-gray-500">
              Bạn cần đăng nhập để đăng ký khóa học
            </div>
          </div>
        }
        open={isLoginWarningModalVisible}
        onOk={() => {
          setIsLoginWarningModalVisible(false);
          navigate("/login");
        }}
        onCancel={() => setIsLoginWarningModalVisible(false)}
        width={500}
        className="custom-modal"
        okText="Đăng nhập ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="text-center py-4">
          <div className="bg-yellow-50 rounded-lg p-6 mb-4">
            <div className="text-lg text-yellow-700 mb-2">
              Để đăng ký khóa học, bạn cần:
            </div>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Đăng nhập vào tài khoản của bạn
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Có đủ số dư trong ví
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Xác nhận thông tin đăng ký
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận đăng ký */}
      <Modal
        title="Xác nhận đăng ký khóa học"
        open={showConfirmModal}
        onOk={handleEnroll}
        onCancel={() => setShowConfirmModal(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="py-4">
          <p className="mb-4">Bạn có chắc chắn muốn đăng ký khóa học này?</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Số dư hiện tại:</span>
              <span className="font-semibold text-green-600">
                {formatPrice(walletBalance)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Giá khóa học:</span>
              <span className="font-semibold text-purple-600">
                {formatPrice(course.price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số dư sau khi trừ:</span>
              <span className="font-semibold text-red-600">
                {formatPrice(walletBalance - course.price)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal thông báo số dư không đủ */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Số dư không đủ
            </div>
            <div className="text-gray-500">
              Vui lòng nạp thêm tiền để tiếp tục
            </div>
          </div>
        }
        open={isInsufficientBalanceModalVisible}
        onOk={handleNavigateToWallet}
        onCancel={() => setIsInsufficientBalanceModalVisible(false)}
        width={500}
        className="custom-modal"
        okText="Nạp tiền ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="text-center py-4">
          <div className="bg-red-50 rounded-lg p-6 mb-4">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {formatPrice(walletBalance)}
            </div>
            <div className="text-gray-600">Số dư hiện tại của bạn</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Phí đăng ký cần:</span>
              <span className="font-semibold text-purple-600">
                {formatPrice(course.price)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Số tiền cần nạp thêm:</span>
              <span className="font-semibold text-red-600">
                {formatPrice(course.price - walletBalance)}
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Bạn sẽ được chuyển đến trang nạp tiền sau khi xác nhận
          </div>
        </div>
      </Modal>

      {/* Modal đăng ký thành công */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              Đăng ký khóa học thành công!
            </div>
          </div>
        }
        open={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        width={600}
        centered
        maskClosable={false}
        className="success-modal"
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setShowSuccessModal(false);
              navigate("/profile");
            }}
            style={{ width: "100%" }}
            className="bg-purple-600 hover:bg-purple-700 h-10 text-base font-medium"
          >
            Đi đến khóa học của tôi
          </Button>,
        ]}
      >
        {successData && (
          <div className="text-center py-4">
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-xl font-bold text-green-600 mb-2">
                Xin chào, {successData.data.learner.fullName}!
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tên khóa học:</span>
                  <span className="font-semibold text-purple-600">
                    {successData.data.coursePackages[0].coursePackageName}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <span className="text-gray-600">Số tiền thanh toán:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {formatPrice(successData.data.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 bg-blue-50 p-4 rounded-xl flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Bạn có thể xem khóa học trong mục "Khóa học của tôi"
            </div>
          </div>
        )}
      </Modal>

      {/* Modal hiển thị nội dung bài học */}
      <Modal
        title="Xem bài học"
        open={isVideoModalVisible}
        onCancel={() => setIsVideoModalVisible(false)}
        width={800}
        footer={null}
        centered
      >
        {selectedVideo && (
          <div className="space-y-4">
            {selectedVideo.itemTypeId === 1 ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Hình ảnh bài học</h3>
                <img
                  src={selectedVideo.itemDes}
                  alt="Hình ảnh bài học"
                  className="w-full rounded-lg shadow-md"
                  onError={(e) => {
                    console.error("Image error:", e);
                    message.error(
                      "Không thể tải hình ảnh. Vui lòng thử lại sau."
                    );
                  }}
                />
              </div>
            ) : selectedVideo.itemTypeId === 2 ? (
              <div className="aspect-w-16 aspect-h-9">
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  src={selectedVideo.itemDes}
                  controlsList="nodownload"
                  onError={(e) => {
                    console.error("Video error:", e);
                    message.error(
                      "Không thể phát video. Vui lòng thử lại sau."
                    );
                  }}
                >
                  Trình duyệt của bạn không hỗ trợ phát video.
                </video>
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Tài liệu bài học</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <a
                    href={selectedVideo.itemDes}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    <FileTextOutlined className="mr-2" />
                    Xem tài liệu
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
