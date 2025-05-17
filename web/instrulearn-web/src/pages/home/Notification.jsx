import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  Avatar,
  Tag,
  Spin,
  Empty,
  Button,
  Tabs,
  Modal,
  Radio,
  Form,
  Input,
  message,
  Breadcrumb,
  Badge,
  Tooltip,
  Divider,
} from "antd";
import {
  FormOutlined,
  BookOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  BellOutlined,
  RightOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";

// Cấu hình dayjs để sử dụng plugin relativeTime
dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [learnerNotifications, setLearnerNotifications] = useState([]);
  const [showAllSystemNoti, setShowAllSystemNoti] = useState(false);
  const SYSTEM_NOTI_LIMIT = 3;
  const displayedSystemNoti = showAllSystemNoti
    ? learnerNotifications
    : learnerNotifications.slice(0, SYSTEM_NOTI_LIMIT);
  const navigate = useNavigate();
  const [centerNotifications, setCenterNotifications] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("oneone");

  useEffect(() => {
    checkLoginStatus();
    fetchLearnerNotifications();
    fetchCenterNotifications();
  }, []);

  const checkLoginStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);

        if (userData.learnerId) {
          fetchNotifications(userData.learnerId);
        } else {
          message.error("Bạn không có quyền truy cập trang này");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Lỗi xác thực, vui lòng đăng nhập lại");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accountId");
        navigate("/login");
      }
    } else {
      message.error("Vui lòng đăng nhập để xem thông báo");
      navigate("/login");
    }
  };

  const fetchNotifications = async (learnerId) => {
    try {
      setLoading(true);

      if (!learnerId) {
        message.error(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/FeedbackNotification/check-notifications/${learnerId}`
      );

      if (response.data?.isSucceed) {
        setNotifications(response.data.data || []);
      } else {
        console.error("Failed to fetch notifications:", response.data?.message);
        message.error(
          "Không thể tải thông báo: " +
            (response.data?.message || "Lỗi không xác định")
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Đã xảy ra lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchLearnerNotifications = async () => {
    try {
      const learnerId = localStorage.getItem("learnerId");
      if (!learnerId) return;
      const res = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearnerNotification/learner-notifications/${learnerId}`
      );
      if (res.data?.isSucceed) {
        setLearnerNotifications(res.data.data || []);
      }
    } catch (err) {}
  };

  const fetchCenterNotifications = async () => {
    try {
      const learnerId = localStorage.getItem("learnerId");
      if (!learnerId) return;
      const res = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearnerNotification/entrance-test-notifications/${learnerId}`
      );
      if (res.data?.isSucceed) {
        setCenterNotifications(res.data.data || []);
      }
    } catch (err) {}
  };

  const getNotificationIcon = (notification) => {
    const icons = {
      feedback: <FormOutlined style={{ fontSize: "20px", color: "#1890ff" }} />,
      progress: <BookOutlined style={{ fontSize: "20px", color: "#52c41a" }} />,
      payment: (
        <WalletOutlined style={{ fontSize: "20px", color: "#fa8c16" }} />
      ),
    };

    // Xác định loại biểu tượng dựa trên nội dung thông báo
    if (notification.feedbackStatus === "NotStarted") {
      return icons.feedback;
    } else if (notification.progressPercentage > 0) {
      return icons.progress;
    } else if (notification.remainingPayment > 0) {
      return icons.payment;
    }

    return icons.feedback; // Mặc định
  };

  const getStatusTag = (notification) => {
    if (notification.feedbackStatus === "NotStarted") {
      return <Tag color="blue">Chưa phản hồi</Tag>;
    } else if (notification.feedbackStatus === "Submitted") {
      return <Tag color="green">Đã phản hồi</Tag>;
    } else if (notification.feedbackStatus === "Rejected") {
      return <Tag color="red">Từ chối</Tag>;
    }
    return <Tag color="default">Không xác định</Tag>;
  };

  const handleViewFeedback = (notification) => {
    setSelectedNotification(notification);
    setFeedbackModalVisible(true);
    feedbackForm.resetFields();
  };

  const handleFeedbackSubmit = async (values) => {
    if (!selectedNotification || !currentUser?.learnerId) return;

    try {
      setFeedbackSubmitting(true);

      // Chuẩn bị dữ liệu cho API mới
      const answers = selectedNotification.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionId: values[`question_${q.questionId}`],
      }));

      const payload = {
        learningRegistrationId:
          selectedNotification.learningRegistrationId ||
          selectedNotification.learningRegisId ||
          0,
        learnerId: currentUser.learnerId,
        additionalComments: values.overallComment || "",
        teacherChangeReason: values.changeTeacher
          ? values.teacherChangeReason || ""
          : "",
        answers: answers,
        continueStudying: values.continueStudying,
        changeTeacher: values.changeTeacher,
      };

      // Gọi API gửi phản hồi mới
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/SubmitFeedback",
        payload
      );

      if (response.data?.isSucceed) {
        message.success("Đã gửi phản hồi thành công");
        setFeedbackModalVisible(false);
        // Tải lại thông báo
        fetchNotifications(currentUser.learnerId);
      } else {
        message.error(response.data?.message || "Không thể gửi phản hồi");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error("Đã xảy ra lỗi khi gửi phản hồi");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const getFilteredNotifications = () => {
    return notifications;
  };

  const formatTimeAgo = (dateString) => {
    return dayjs(dateString).fromNow();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Trang chủ
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <BellOutlined /> Thông báo
        </Breadcrumb.Item>
      </Breadcrumb>

      <Tabs
        activeKey={activeMainTab}
        onChange={setActiveMainTab}
        className="mb-6"
      >
        <Tabs.TabPane
          tab={
            <span>
              <BellOutlined className="mr-1 text-blue-500" />
              Dạy 1-1
            </span>
          }
          key="oneone"
        >
          {learnerNotifications.length > 0 && (
            <Card
              className="mb-6"
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BellOutlined className="text-blue-500" />
                  <span>Thông báo hệ thống</span>
                </span>
              }
              style={{
                borderRadius: 16,
                background: "#f5faff",
                boxShadow: "0 2px 8px #e6f7ff",
                border: "none",
                maxHeight: showAllSystemNoti ? 400 : undefined,
                overflow: "hidden",
              }}
              bodyStyle={{
                padding: 0,
                maxHeight: showAllSystemNoti ? 340 : undefined,
                overflowY: showAllSystemNoti ? "auto" : "unset",
              }}
            >
              <List
                dataSource={displayedSystemNoti}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "20px 24px",
                      alignItems: "flex-start",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <BellOutlined
                          style={{
                            fontSize: 24,
                            color: "#1890ff",
                            marginTop: 4,
                          }}
                        />
                      }
                      title={
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#222",
                            fontSize: 16,
                          }}
                        >
                          {item.title}
                        </span>
                      }
                      description={
                        <>
                          <div style={{ color: "#444", margin: "8px 0" }}>
                            {item.message}
                          </div>
                          {item.learningRequest && (
                            <div style={{ color: "#1976d2", margin: "4px 0" }}>
                              <b>Yêu cầu đăng ký:</b> {item.learningRequest}
                            </div>
                          )}
                          {item.reason && (
                            <div style={{ color: "#f5222d", margin: "4px 0" }}>
                              <b>Lý do:</b> {item.reason}
                            </div>
                          )}
                          {item.amount && (
                            <div style={{ color: "#fa8c16", margin: "4px 0" }}>
                              <b>Số tiền:</b> {formatCurrency(item.amount)}
                            </div>
                          )}
                          {item.deadline && (
                            <div style={{ color: "#faad14", margin: "4px 0" }}>
                              <b>Hạn chót:</b> {item.deadline}
                            </div>
                          )}
                          <div style={{ color: "#888", fontSize: 13 }}>
                            {dayjs(item.sentDate).format("DD/MM/YYYY HH:mm")}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
                style={{ borderRadius: 16 }}
              />
              {learnerNotifications.length > SYSTEM_NOTI_LIMIT && (
                <div style={{ textAlign: "center", padding: 12 }}>
                  <Button
                    type="link"
                    onClick={() => setShowAllSystemNoti((prev) => !prev)}
                  >
                    {showAllSystemNoti ? "Thu gọn" : "Xem tất cả"}
                  </Button>
                </div>
              )}
            </Card>
          )}

          <Card className="shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <Title level={3} className="mb-0">
                <BellOutlined className="mr-2 text-blue-500" /> Thông báo phản
                hồi
              </Title>
              <Button
                type="primary"
                onClick={() =>
                  currentUser?.learnerId &&
                  fetchNotifications(currentUser.learnerId)
                }
                loading={loading}
              >
                Làm mới
              </Button>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="mb-4"
            >
              <TabPane
                tab={
                  <span>
                    Tất cả{" "}
                    <Badge
                      count={notifications.length}
                      style={{ marginLeft: 5 }}
                    />
                  </span>
                }
                key="all"
              />
            </Tabs>

            <List
              dataSource={getFilteredNotifications()}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có thông báo nào"
                  />
                ),
              }}
              renderItem={(notification) => (
                <List.Item
                  key={notification.feedbackId}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => handleViewFeedback(notification)}
                      disabled={notification.feedbackStatus !== "NotStarted"}
                    >
                      {notification.feedbackStatus === "NotStarted"
                        ? "Phản hồi"
                        : "Xem chi tiết"}
                    </Button>,
                  ]}
                  className="bg-white rounded-lg border mb-4 p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={48}
                        icon={getNotificationIcon(notification)}
                        className="bg-blue-50"
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Phản hồi khóa học với giáo viên{" "}
                            {notification.teacherName}
                          </span>
                          {getStatusTag(notification)}
                        </div>
                        <Text type="secondary" className="text-xs">
                          {formatTimeAgo(notification.createdAt)}
                        </Text>
                      </div>
                    }
                    description={
                      <>
                        <Paragraph className="mb-2 text-gray-600">
                          {notification.message}
                        </Paragraph>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div className="flex items-center">
                            <BookOutlined className="text-green-500 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Tiến độ học tập
                              </div>
                              <div className="font-medium">
                                {notification.completedSessions}/
                                {notification.totalSessions} buổi (
                                {notification.progressPercentage.toFixed(0)}%)
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <WalletOutlined className="text-orange-500 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Còn lại cần thanh toán
                              </div>
                              <div className="font-medium">
                                {formatCurrency(notification.remainingPayment)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ClockCircleOutlined className="text-blue-500 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Ngày tạo
                              </div>
                              <div className="font-medium">
                                {dayjs(notification.createdAt).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Thông tin deadline mới */}
                        {notification.deadlineDate && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-red-500">
                              Hạn hoàn thành phản hồi:
                            </span>{" "}
                            {dayjs(notification.deadlineDate).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </div>
                        )}
                        {typeof notification.daysRemaining === "number" && (
                          <div className="text-sm mt-1">
                            {/* <span
                              className={
                                notification.daysRemaining <= 0
                                  ? "text-red-500 font-semibold"
                                  : "text-gray-700"
                              }
                            >
                              Còn lại: {notification.daysRemaining} ngày
                            </span> */}
                          </div>
                        )}
                        {notification.deadlineMessage && (
                          <div className="text-sm mt-1 text-orange-600">
                            {notification.deadlineMessage}
                          </div>
                        )}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Modal
            title={
              <div className="flex items-center gap-2">
                <FormOutlined className="text-blue-500" />
                <span>Phản hồi khóa học</span>
              </div>
            }
            open={feedbackModalVisible}
            onCancel={() => setFeedbackModalVisible(false)}
            footer={null}
            width={700}
          >
            {selectedNotification && (
              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text strong>Thông tin khóa học</Text>
                    {getStatusTag(selectedNotification)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text type="secondary">Giáo viên:</Text>
                      <div className="font-medium">
                        {selectedNotification.teacherName}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Tiến độ:</Text>
                      <div className="font-medium">
                        {selectedNotification.completedSessions}/
                        {selectedNotification.totalSessions} buổi (
                        {selectedNotification.progressPercentage.toFixed(0)}%)
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Học phí:</Text>
                      <div className="font-medium">
                        {formatCurrency(selectedNotification.totalPrice)}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Còn lại cần thanh toán:</Text>
                      <div className="font-medium">
                        {formatCurrency(selectedNotification.remainingPayment)}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedNotification.feedbackStatus === "NotStarted" ? (
                  <Form
                    form={feedbackForm}
                    layout="vertical"
                    onFinish={handleFeedbackSubmit}
                  >
                    {selectedNotification.questions.map((question) => (
                      <div
                        key={question.questionId}
                        className="mb-6 pb-4 border-b"
                      >
                        <Form.Item
                          label={
                            <div className="flex items-start">
                              <span className="mr-2">
                                {question.questionText}
                              </span>
                              {question.isRequired && (
                                <span className="text-red-500">*</span>
                              )}
                            </div>
                          }
                          name={`question_${question.questionId}`}
                          rules={[
                            {
                              required: question.isRequired,
                              message: "Vui lòng chọn một phương án",
                            },
                          ]}
                        >
                          <Radio.Group>
                            {question.options.map((option) => (
                              <Radio
                                key={option.optionId}
                                value={option.optionId}
                              >
                                {option.optionText}
                              </Radio>
                            ))}
                          </Radio.Group>
                        </Form.Item>
                      </div>
                    ))}
                    <Form.Item
                      label="Bạn có muốn tiếp tục học không?"
                      name="continueStudying"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn một lựa chọn",
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value={true}>Có</Radio>
                        <Radio value={false}>Không</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      shouldUpdate={(prev, curr) =>
                        prev.continueStudying !== curr.continueStudying ||
                        prev.changeTeacher !== curr.changeTeacher
                      }
                    >
                      {({ getFieldValue, setFieldsValue }) => {
                        const continueStudying =
                          getFieldValue("continueStudying");
                        const changeTeacher = getFieldValue("changeTeacher");
                        if (continueStudying !== true) {
                          setTimeout(
                            () =>
                              setFieldsValue({
                                changeTeacher: false,
                                teacherChangeReason: "",
                              }),
                            0
                          );
                          return null;
                        }
                        return (
                          <>
                            <Form.Item
                              label="Bạn có muốn đổi giáo viên không?"
                              name="changeTeacher"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn một lựa chọn",
                                },
                              ]}
                            >
                              <Radio.Group>
                                <Radio value={true}>Có</Radio>
                                <Radio value={false}>Không</Radio>
                              </Radio.Group>
                            </Form.Item>
                            {changeTeacher === true && (
                              <Form.Item
                                label="Lý do đổi giáo viên"
                                name="teacherChangeReason"
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      "Vui lòng nhập lý do đổi giáo viên",
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  rows={3}
                                  placeholder="Nhập lý do bạn muốn đổi giáo viên"
                                />
                              </Form.Item>
                            )}
                            {changeTeacher !== true && (
                              <Form.Item
                                name="teacherChangeReason"
                                initialValue=""
                                hidden
                              >
                                <Input type="hidden" />
                              </Form.Item>
                            )}
                          </>
                        );
                      }}
                    </Form.Item>
                    <Form.Item
                      label="Nhận xét chung về khóa học"
                      name="overallComment"
                    >
                      <TextArea
                        rows={4}
                        placeholder="Nhập nhận xét của bạn về khóa học (không bắt buộc)"
                      />
                    </Form.Item>

                    <Form.Item className="mb-0 mt-6 text-right">
                      <Button
                        className="mr-2"
                        onClick={() => setFeedbackModalVisible(false)}
                      >
                        Đóng
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={feedbackSubmitting}
                      >
                        Gửi phản hồi
                      </Button>
                    </Form.Item>
                  </Form>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircleOutlined className="text-green-500 text-4xl mb-3" />
                    <Title level={4}>Phản hồi đã được gửi</Title>
                    <Text type="secondary">
                      Cảm ơn bạn đã gửi phản hồi về khóa học. Chúng tôi sẽ xem
                      xét và liên hệ lại nếu cần thiết.
                    </Text>
                    <div className="mt-6">
                      <Button onClick={() => setFeedbackModalVisible(false)}>
                        Đóng
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <BookOutlined className="mr-1 text-green-500" />
              Dạy trung tâm
            </span>
          }
          key="center"
        >
          {centerNotifications.length > 0 ? (
            <Card
              className="mb-6"
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BookOutlined className="text-green-500" />
                  <span>Thông báo kiểm tra đầu vào (Dạy trung tâm)</span>
                </span>
              }
              style={{
                borderRadius: 16,
                background: "#f5fff5",
                boxShadow: "0 2px 8px #e6fffb",
                border: "none",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <List
                dataSource={centerNotifications}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "20px 24px",
                      alignItems: "flex-start",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <BookOutlined
                          style={{
                            fontSize: 24,
                            color: "#52c41a",
                            marginTop: 4,
                          }}
                        />
                      }
                      title={
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#222",
                            fontSize: 16,
                          }}
                        >
                          {item.title}
                        </span>
                      }
                      description={
                        <>
                          <div
                            style={{ color: "#444", margin: "8px 0" }}
                            dangerouslySetInnerHTML={{ __html: item.message }}
                          />
                          <div style={{ color: "#888", fontSize: 13 }}>
                            {dayjs(item.sentDate).format("DD/MM/YYYY HH:mm")}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
                style={{ borderRadius: 16 }}
              />
            </Card>
          ) : (
            <Empty description="Không có thông báo nào cho dạy trung tâm" />
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Notification;
