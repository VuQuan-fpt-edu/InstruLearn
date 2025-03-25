import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Progress,
  Tooltip,
  Empty,
  message,
  Skeleton,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        message.error("Vui lòng đăng nhập để xem khóa học");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Purchase/by-learner/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        // Lấy danh sách khóa học từ các giao dịch
        const purchases = response.data.data;

        // Tạo Map để loại bỏ các khóa học trùng lặp và lấy thông tin mua gần nhất
        const courseMap = new Map();

        purchases.forEach((purchase) => {
          const purchaseDate = new Date(purchase.purchaseDate);

          purchase.purchaseItems.forEach((item) => {
            const courseId = item.coursePackageId;
            const courseInfo = item.coursePackage;

            // Nếu khóa học chưa tồn tại trong Map hoặc ngày mua gần hơn
            if (
              !courseMap.has(courseId) ||
              purchaseDate > courseMap.get(courseId).purchaseDate
            ) {
              courseMap.set(courseId, {
                id: courseId,
                name: courseInfo.courseName,
                typeName: courseInfo.typeName,
                imageUrl: courseInfo.imageUrl,
                totalLessons:
                  courseInfo.courseContents?.reduce(
                    (total, content) =>
                      total + (content.courseContentItems?.length || 0),
                    0
                  ) || 0,
                completedLessons: 0,
                purchaseDate: purchaseDate,
                formattedPurchaseDate: purchaseDate.toLocaleDateString("vi-VN"),
                progress: 0,
              });
            }
          });
        });

        // Chuyển Map thành mảng
        const enrolledCourses = Array.from(courseMap.values());
        setCourses(enrolledCourses);
      } else {
        throw new Error(
          response.data.message || "Không thể lấy danh sách khóa học"
        );
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      message.error(
        error.message || "Có lỗi xảy ra khi tải danh sách khóa học"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/package/${courseId}`);
  };

  if (loading) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <div className="space-y-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="bg-gray-50">
              <Row gutter={[24, 16]} align="middle">
                <Col xs={24} md={16}>
                  <div className="flex items-center mb-3">
                    <Skeleton.Avatar active size={64} className="mr-4" />
                    <div className="flex-1">
                      <Skeleton.Input active size="large" />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 200 }}
                      />
                    </div>
                  </div>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
                <Col xs={24} md={8}>
                  <Skeleton.Button active size="large" block />
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          Khoá học đã đăng ký ({courses.length})
        </Title>
        <Button
          type="primary"
          className="bg-purple-700 hover:bg-purple-800"
          icon={<BookOutlined />}
          onClick={() => navigate("/home-allcourse")}
        >
          Khám phá thêm khoá học
        </Button>
      </div>
      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-gray-50 hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <Row gutter={[24, 16]} align="middle">
                <Col xs={24} md={16}>
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-purple-200 rounded-lg flex items-center justify-center text-purple-700 text-2xl mr-4">
                      <PlayCircleOutlined />
                    </div>
                    <div>
                      <Title level={4} className="mb-0">
                        {course.typeName} - {course.name}
                      </Title>
                      <div className="text-gray-500 mt-2">
                        <CalendarOutlined className="mr-1" />
                        Ngày mua: {course.formattedPurchaseDate}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <Text strong>Tiến độ học tập</Text>
                      <Text strong>
                        {course.completedLessons}/{course.totalLessons} bài học
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
                    onClick={() => handleContinueLearning(course.id)}
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
            onClick={() => navigate("/home-allcourse")}
          >
            Khám phá khoá học
          </Button>
        </Empty>
      )}
    </Card>
  );
};

export default EnrolledCourses;
