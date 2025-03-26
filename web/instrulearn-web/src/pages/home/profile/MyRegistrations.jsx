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
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

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
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/LearningRegis/status/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.isSucceed) {
        const vietnameseData = response.data.data.map((reg) => ({
          ...reg,
          learningDays: reg.learningDays.map((day) =>
            convertDayToVietnamese(day)
          ),
          calculatedPrice: reg.price
            ? reg.price * reg.numberOfSession * 0.4
            : null,
        }));
        setRegistrations(vietnameseData);

        // Tính toán thống kê
        const newStats = {
          total: vietnameseData.length,
          pending: vietnameseData.filter((reg) => reg.status === "Pending")
            .length,
          accepted: vietnameseData.filter((reg) => reg.status === "Accepted")
            .length,
          rejected: vietnameseData.filter((reg) => reg.status === "Rejected")
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
  };

  const handleViewVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoModalVisible(true);
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

              {selectedRegistration.learningRequest && (
                <div className="mt-6">
                  <Text type="secondary">Yêu cầu học</Text>
                  <div className="text-lg font-medium mt-1">
                    {selectedRegistration.learningRequest}
                  </div>
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

            {selectedRegistration.status === "Accepted" && (
              <>
                <Divider className="my-6" />
                <div className="bg-green-50 p-4 rounded-lg">
                  <Title level={4} className="text-green-700 mb-4">
                    <CheckCircleOutlined className="mr-2" />
                    Thông tin xác nhận
                  </Title>

                  <Row gutter={[24, 24]}>
                    {selectedRegistration.levelAssigned && (
                      <Col xs={24} sm={12}>
                        <div className="space-y-1">
                          <Text type="secondary">Cấp độ được xếp</Text>
                          <div className="text-lg font-medium">
                            {selectedRegistration.levelAssigned}
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRegistration.score !== null && (
                      <Col xs={24} sm={12}>
                        <div className="space-y-1">
                          <Text type="secondary">Điểm đánh giá</Text>
                          <div className="text-lg font-medium">
                            {selectedRegistration.score}
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRegistration.calculatedPrice && (
                      <Col xs={24}>
                        <div className="space-y-1">
                          <Text type="secondary">
                            Học phí (40% tổng học phí)
                          </Text>
                          <div className="text-lg font-medium text-red-600">
                            {selectedRegistration.calculatedPrice.toLocaleString()}{" "}
                            VNĐ
                            <Text type="secondary" className="text-sm ml-2">
                              ({selectedRegistration.price.toLocaleString()}{" "}
                              VNĐ/buổi )
                            </Text>
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRegistration.feedback && (
                      <Col xs={24}>
                        <div className="space-y-1">
                          <Text type="secondary">Phản hồi</Text>
                          <div className="text-lg font-medium">
                            {selectedRegistration.feedback}
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
