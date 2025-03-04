import React from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Progress,
  Tooltip,
  Empty,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const EnrolledCourses = ({ courses }) => {
  const navigate = useNavigate();

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
          onClick={() => navigate("/courses")}
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
  );
};

export default EnrolledCourses;
