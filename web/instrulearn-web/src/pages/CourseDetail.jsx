import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Rate,
  Tag,
  Collapse,
  Button,
  Divider,
  Spin,
  List,
  Avatar,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  StarOutlined,
  QuestionCircleOutlined,
  CommentOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;

const Comment = ({ author, avatar, content, datetime, actions, children }) => (
  <div className="ant-comment">
    <div className="ant-comment-inner">
      <div className="ant-comment-avatar">{avatar}</div>
      <div className="ant-comment-content">
        <div className="ant-comment-content-author">
          <span className="ant-comment-content-author-name">{author}</span>
          <span className="ant-comment-content-author-time">{datetime}</span>
        </div>
        <div className="ant-comment-content-detail">{content}</div>
        {actions && actions.length > 0 && (
          <ul className="ant-comment-actions">
            {actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
    {children && <div className="ant-comment-nested">{children}</div>}
  </div>
);

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [qnas, setQnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [qnaLoading, setQnaLoading] = useState(true);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState([]);
  const [expandedQnas, setExpandedQnas] = useState([]);
  const [feedbackDetails, setFeedbackDetails] = useState({});
  const [qnaDetails, setQnaDetails] = useState({});

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(
          `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/${id}`
        );
        const data = await response.json();
        setCourse(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setLoading(false);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Feedback/get-all"
        );
        const data = await response.json();
        const courseFeedbacks = data.filter(
          (feedback) => feedback.courseId.toString() === id
        );
        setFeedbacks(courseFeedbacks);
        setFeedbackLoading(false);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setFeedbackLoading(false);
      }
    };

    const fetchQnAs = async () => {
      try {
        const response = await fetch(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/QnA/get-all"
        );
        const data = await response.json();
        const courseQnAs = data.filter((qna) => qna.courseId.toString() === id);
        setQnas(courseQnAs);
        setQnaLoading(false);
      } catch (error) {
        console.error("Error fetching Q&As:", error);
        setQnaLoading(false);
      }
    };

    fetchCourseDetail();
    fetchFeedbacks();
    fetchQnAs();
  }, [id]);

  const fetchFeedbackDetails = async (feedbackId) => {
    try {
      const response = await fetch(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Feedback/${feedbackId}`
      );
      const data = await response.json();
      setFeedbackDetails((prev) => ({
        ...prev,
        [feedbackId]: data,
      }));
      return data;
    } catch (error) {
      console.error(
        `Error fetching feedback details for ID ${feedbackId}:`,
        error
      );
      return null;
    }
  };

  const fetchQnADetails = async (questionId) => {
    try {
      const response = await fetch(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/QnA/${questionId}`
      );
      const data = await response.json();
      setQnaDetails((prev) => ({
        ...prev,
        [questionId]: data,
      }));
      return data;
    } catch (error) {
      console.error(`Error fetching QnA details for ID ${questionId}:`, error);
      return null;
    }
  };

  const handleFeedbackClick = async (feedbackId) => {
    if (expandedFeedbacks.includes(feedbackId)) {
      setExpandedFeedbacks(expandedFeedbacks.filter((id) => id !== feedbackId));
    } else {
      setExpandedFeedbacks([...expandedFeedbacks, feedbackId]);
      if (!feedbackDetails[feedbackId]) {
        await fetchFeedbackDetails(feedbackId);
      }
    }
  };

  const handleQnAClick = async (questionId) => {
    if (expandedQnas.includes(questionId)) {
      setExpandedQnas(expandedQnas.filter((id) => id !== questionId));
    } else {
      setExpandedQnas([...expandedQnas, questionId]);
      if (!qnaDetails[questionId]) {
        await fetchQnADetails(questionId);
      }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getUsername = (email) => {
    return email ? email.split("@")[0] : "Người dùng";
  };

  const renderReplies = (feedback) => {
    const feedbackDetail = feedbackDetails[feedback.feedbackId];

    if (
      !feedbackDetail ||
      !feedbackDetail.replies ||
      feedbackDetail.replies.length === 0
    ) {
      return null;
    }

    return (
      <div className="ml-12 mt-4 border-l-2 border-gray-200 pl-4">
        {feedbackDetail.replies.map((reply) => (
          <Comment
            key={reply.feedbackRepliesId}
            author={
              <span className="font-medium">
                {getUsername(reply.email)}{" "}
                {reply.role && <Tag color="blue">{reply.role}</Tag>}
              </span>
            }
            avatar={<Avatar icon={<UserOutlined />} />}
            content={<p>{reply.repliesContent}</p>}
            datetime={
              <Tooltip title={formatDate(reply.createdAt)}>
                <span className="text-gray-500 text-xs">
                  {formatDate(reply.createdAt)}
                </span>
              </Tooltip>
            }
          />
        ))}
      </div>
    );
  };

  const renderQnAReplies = (qna) => {
    const qnaDetail = qnaDetails[qna.questionId];

    if (!qnaDetail || !qnaDetail.replies || qnaDetail.replies.length === 0) {
      return null;
    }

    return (
      <div className="ml-12 mt-4 border-l-2 border-gray-200 pl-4">
        {qnaDetail.replies.map((reply) => (
          <Comment
            key={reply.replyId}
            author={
              <span className="font-medium">
                {getUsername(reply.email)}{" "}
                {reply.role && <Tag color="blue">{reply.role}</Tag>}
              </span>
            }
            avatar={<Avatar icon={<UserOutlined />} />}
            content={<p>{reply.qnAContent}</p>}
            datetime={
              <Tooltip title={formatDate(reply.createdAt)}>
                <span className="text-gray-500 text-xs">
                  {formatDate(reply.createdAt)}
                </span>
              </Tooltip>
            }
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
        <Link to="/" className="text-purple-600 hover:text-purple-800">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <div className="flex items-center mb-2">
              <Tag color="purple">{course.typeName}</Tag>
              {course.rating > 4.5 && (
                <Tag color="orange" className="ml-2">
                  Bestseller
                </Tag>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {course.courseName}
            </h1>
            <p className="text-xl mb-4">{course.headline}</p>

            <div className="flex items-center mb-4">
              <span className="font-bold text-amber-500 mr-2">
                {course.rating ? course.rating.toFixed(1) : "Mới"}
              </span>
              {course.rating > 0 ? (
                <>
                  <Rate
                    disabled
                    defaultValue={course.rating}
                    className="text-sm text-amber-500"
                  />
                  <span className="ml-2 text-sm">
                    ({Math.floor(Math.random() * 1000) + 100} đánh giá)
                  </span>
                </>
              ) : (
                <span className="text-sm ml-1">(Chưa có đánh giá)</span>
              )}
            </div>

            <div className="flex items-center text-sm mb-2">
              <UserOutlined className="mr-2" />
              <span>{course.instructorName || "Giáo viên chuyên nghiệp"}</span>
            </div>

            <div className="flex items-center text-sm">
              <ClockCircleOutlined className="mr-2" />
              <span>
                {Math.floor(Math.random() * 10) + 5} giờ tổng thời lượng
              </span>
            </div>
          </div>

          <div className="md:w-1/3">
            <Card className="shadow-lg">
              <div className="relative mb-4">
                <img
                  src={course.imageUrl}
                  alt={course.courseName}
                  className="w-full aspect-video object-cover rounded-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircleOutlined className="text-5xl text-white" />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {formatPrice(course.price)}
                  </span>
                  {course.discount > 0 && (
                    <span className="text-gray-500 line-through">
                      {formatPrice(course.price / (1 - course.discount / 100))}
                    </span>
                  )}
                </div>

                {course.discount > 0 && (
                  <div className="bg-red-100 text-red-800 p-2 rounded-sm text-sm mb-4">
                    <span className="font-bold">Giảm {course.discount}%</span> -
                    Ưu đãi có hạn!
                  </div>
                )}
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="bg-purple-600 hover:bg-purple-700 mb-3"
                icon={<ShoppingCartOutlined />}
              >
                Đăng ký ngay
              </Button>

              <Button
                size="large"
                block
                className="mb-4"
                icon={<HeartOutlined />}
              >
                Thêm vào yêu thích
              </Button>

              <div className="text-center text-sm text-gray-500">
                Đảm bảo hoàn tiền trong 30 ngày
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="mb-8">
              <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Nắm vững kỹ thuật cơ bản",
                  "Thực hành với các bài tập thực tế",
                  "Phát triển phong cách chơi của riêng bạn",
                  "Hiểu biết về lý thuyết âm nhạc",
                  "Biểu diễn các bản nhạc nổi tiếng",
                  "Tự tin trình diễn trước đám đông",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleOutlined className="text-green-500 mt-1 mr-2" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-xl font-bold mb-4">Mô tả khóa học</h2>
              <div className="whitespace-pre-line">
                {course.courseDescription || (
                  <p>
                    Khóa học {course.courseName} cung cấp cho bạn kiến thức toàn
                    diện về {course.typeName}. Từ những nguyên tắc cơ bản đến kỹ
                    thuật nâng cao, khóa học này được thiết kế để giúp bạn tiến
                    bộ nhanh chóng và tự tin.
                    <br />
                    <br />
                    Với sự hướng dẫn của giáo viên chuyên nghiệp và tài liệu học
                    tập chất lượng cao, bạn sẽ học được cách chơi các bài nhạc
                    phổ biến và phát triển phong cách riêng của mình.
                    <br />
                    <br />
                    Khóa học phù hợp cho cả người mới bắt đầu và người đã có
                    kinh nghiệm muốn nâng cao kỹ năng.
                  </p>
                )}
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
              <div className="mb-3">
                <span className="text-sm">
                  {course.courseContents?.length || 0} chương •{" "}
                  {Math.floor(Math.random() * 10) + 5} giờ tổng thời lượng
                </span>
              </div>

              <Collapse defaultActiveKey={["1"]} className="bg-white">
                {course.courseContents?.map((content) => (
                  <Panel
                    header={
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{content.heading}</span>
                        <span className="text-sm text-gray-500">
                          {Math.floor(Math.random() * 5) + 1} bài học
                        </span>
                      </div>
                    }
                    key={content.contentId}
                    className="mb-2"
                  >
                    {content.courseContentItems.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={content.courseContentItems}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <span className="text-sm text-gray-500">
                                {Math.floor(Math.random() * 15) + 5}:00
                              </span>,
                            ]}
                          >
                            <div className="flex items-center">
                              <PlayCircleOutlined className="mr-3 text-purple-600" />
                              <div>
                                {item.title ||
                                  `Bài học ${item.courseContentItemId}`}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          ...Array(Math.floor(Math.random() * 5) + 2).keys(),
                        ]}
                        renderItem={(i) => (
                          <List.Item
                            actions={[
                              <span className="text-sm text-gray-500">
                                {Math.floor(Math.random() * 15) + 5}:00
                              </span>,
                            ]}
                          >
                            <div className="flex items-center">
                              <PlayCircleOutlined className="mr-3 text-purple-600" />
                              <div>{`Bài học ${i + 1}`}</div>
                            </div>
                          </List.Item>
                        )}
                      />
                    )}
                  </Panel>
                ))}
              </Collapse>
            </Card>

            <Card className="mb-8">
              <h2 className="text-xl font-bold mb-4">Đánh giá từ học viên</h2>

              {feedbackLoading ? (
                <div className="text-center py-4">
                  <Spin />
                </div>
              ) : feedbacks && feedbacks.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={feedbacks}
                  renderItem={(feedback) => (
                    <div className="border-b border-gray-100 last:border-0 py-4">
                      <Comment
                        author={
                          <div>
                            <span className="font-medium">
                              {getUsername(feedback.email)}
                            </span>
                            {feedback.role && (
                              <Tag color="blue" className="ml-2">
                                {feedback.role}
                              </Tag>
                            )}
                          </div>
                        }
                        avatar={<Avatar icon={<UserOutlined />} />}
                        content={
                          <div>
                            <Rate
                              disabled
                              defaultValue={feedback.rating}
                              className="text-amber-500 mb-2"
                            />
                            <p>{feedback.feedbackContent}</p>
                          </div>
                        }
                        datetime={
                          <Tooltip title={formatDate(feedback.createdAt)}>
                            <span className="text-gray-500 text-xs">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </Tooltip>
                        }
                        actions={[
                          <Button
                            type="text"
                            onClick={() =>
                              handleFeedbackClick(feedback.feedbackId)
                            }
                            icon={<CommentOutlined />}
                          >
                            {expandedFeedbacks.includes(feedback.feedbackId)
                              ? "Ẩn phản hồi"
                              : feedbackDetails[feedback.feedbackId]?.replies
                                  ?.length > 0
                              ? `${
                                  feedbackDetails[feedback.feedbackId].replies
                                    .length
                                } phản hồi`
                              : "Xem phản hồi"}
                          </Button>,
                        ]}
                      />

                      {expandedFeedbacks.includes(feedback.feedbackId) &&
                        renderReplies(feedback)}
                    </div>
                  )}
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-sm">
                  <div className="text-center py-8">
                    <StarOutlined className="text-4xl text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-2">
                      Chưa có đánh giá nào
                    </h3>
                    <p className="text-gray-500">
                      Hãy là người đầu tiên đánh giá khóa học này
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4">Hỏi đáp</h2>

              {qnaLoading ? (
                <div className="text-center py-4">
                  <Spin />
                </div>
              ) : qnas && qnas.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={qnas}
                  renderItem={(qna) => (
                    <div className="border-b border-gray-100 last:border-0 py-4">
                      <Comment
                        author={
                          <div>
                            <span className="font-medium">
                              {getUsername(qna.email)}
                            </span>
                            {qna.role && (
                              <Tag color="blue" className="ml-2">
                                {qna.role}
                              </Tag>
                            )}
                          </div>
                        }
                        avatar={<Avatar icon={<UserOutlined />} />}
                        content={
                          <div>
                            <h4 className="font-medium mb-2">{qna.title}</h4>
                            <p>{qna.questionContent}</p>
                          </div>
                        }
                        datetime={
                          <Tooltip title={formatDate(qna.createdAt)}>
                            <span className="text-gray-500 text-xs">
                              {formatDate(qna.createdAt)}
                            </span>
                          </Tooltip>
                        }
                        actions={[
                          <Button
                            type="text"
                            onClick={() => handleQnAClick(qna.questionId)}
                            icon={<CommentOutlined />}
                          >
                            {expandedQnas.includes(qna.questionId)
                              ? "Ẩn câu trả lời"
                              : qnaDetails[qna.questionId]?.replies?.length > 0
                              ? `${
                                  qnaDetails[qna.questionId].replies.length
                                } câu trả lời`
                              : "Xem câu trả lời"}
                          </Button>,
                        ]}
                      />

                      {expandedQnas.includes(qna.questionId) &&
                        renderQnAReplies(qna)}
                    </div>
                  )}
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-sm">
                  <div className="text-center py-8">
                    <QuestionCircleOutlined className="text-4xl text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-2">
                      Chưa có câu hỏi nào
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Bạn có thắc mắc về khóa học này?
                    </p>
                    <Button
                      type="primary"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Đặt câu hỏi
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="mb-6">
              <h2 className="text-xl font-bold mb-4">Giáo viên</h2>
              <div className="flex items-center mb-3">
                <Avatar size={64} icon={<UserOutlined />} className="mr-4" />
                <div>
                  <h3 className="font-medium">
                    {course.instructorName || "Giáo viên chuyên nghiệp"}
                  </h3>
                  <p className="text-gray-500">Chuyên gia {course.typeName}</p>
                </div>
              </div>
              <p className="text-sm mb-4">
                Giáo viên có hơn 10 năm kinh nghiệm giảng dạy và biểu diễn{" "}
                {course.typeName}
                chuyên nghiệp. Đã đào tạo hơn 1000 học viên thành công.
              </p>
              <Button block>Xem thông tin giáo viên</Button>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4">Khóa học liên quan</h2>
              <List
                itemLayout="horizontal"
                dataSource={[...Array(3).keys()]}
                renderItem={(i) => (
                  <List.Item className="py-3">
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <img
                          src={course.imageUrl}
                          alt={`Khóa học ${i + 1}`}
                          className="w-20 h-14 object-cover rounded-sm"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium line-clamp-2 mb-1">
                          {`Khóa học ${course.typeName} nâng cao ${i + 1}`}
                        </h4>
                        <div className="flex items-center text-xs">
                          <Rate
                            disabled
                            defaultValue={4.5}
                            className="text-xs text-amber-500"
                          />
                          <span className="ml-1 text-gray-500">(125)</span>
                        </div>
                        <div className="font-medium mt-1">
                          {formatPrice(350000 + i * 50000)}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
