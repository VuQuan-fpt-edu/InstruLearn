import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  message,
  Collapse,
  Tag,
  Button,
  Modal,
  List,
  Avatar,
  Image,
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  RightOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MyLibrary = () => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  const fetchPurchasedCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        throw new Error("Vui lòng đăng nhập để xem thông tin");
      }

      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Purchase/by-learner/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.isSucceed) {
        throw new Error(response.data.message);
      }

      setPurchases(response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách khóa học"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoModalVisible(true);
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const getItemTypeIcon = (itemTypeId) => {
    switch (itemTypeId) {
      case 1:
        return <FileImageOutlined className="text-blue-500" />;
      case 2:
        return <PlayCircleOutlined className="text-green-500" />;
      case 3:
        return <FilePdfOutlined className="text-red-500" />;
      default:
        return <FileImageOutlined />;
    }
  };

  const getItemTypeName = (itemTypeId) => {
    switch (itemTypeId) {
      case 1:
        return "Hình ảnh";
      case 2:
        return "Video";
      case 3:
        return "Tài liệu";
      default:
        return "Khác";
    }
  };

  const renderCourseContent = (coursePackage) => {
    return (
      <Collapse
        expandIcon={({ isActive }) => (
          <RightOutlined rotate={isActive ? 90 : 0} />
        )}
        className="bg-white"
      >
        {coursePackage.courseContents.map((content) => (
          <Panel
            header={
              <div className="flex items-center">
                <BookOutlined className="mr-2 text-purple-600" />
                <span className="font-medium">{content.heading}</span>
              </div>
            }
            key={content.contentId}
          >
            <List
              itemLayout="horizontal"
              dataSource={content.courseContentItems}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    item.itemTypeId === 2 ? (
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleViewVideo(item.itemDes)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Xem video
                      </Button>
                    ) : item.itemTypeId === 1 ? (
                      <Button
                        type="primary"
                        icon={<FileImageOutlined />}
                        onClick={() => handleViewImage(item.itemDes)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Xem hình ảnh
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        href={item.itemDes}
                        target="_blank"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Xem tài liệu
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getItemTypeIcon(item.itemTypeId)}
                        className="bg-gray-100"
                      />
                    }
                    title={
                      <div className="flex items-center">
                        <span className="mr-2">
                          Nội dung {getItemTypeName(item.itemTypeId)}
                        </span>
                        <Tag
                          color={
                            item.itemTypeId === 1
                              ? "blue"
                              : item.itemTypeId === 2
                              ? "green"
                              : "red"
                          }
                        >
                          {getItemTypeName(item.itemTypeId)}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!purchases.length) {
    return <Empty description="Bạn chưa có khóa học nào" className="my-8" />;
  }

  return (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        {purchases.map((purchase) =>
          purchase.purchaseItems.map((item) => (
            <Col xs={24} key={item.purchaseItemId}>
              <Card
                className="shadow-sm hover:shadow-md transition-all duration-300"
                cover={
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${item.coursePackage.imageUrl})`,
                    }}
                  />
                }
              >
                <div className="mb-4">
                  <Title level={4} className="mb-2">
                    {item.coursePackage.courseName}
                  </Title>
                  <Tag color="purple" className="mb-2">
                    {item.coursePackage.courseTypeName}
                  </Tag>
                  <Text className="block text-gray-600">
                    {item.coursePackage.courseDescription}
                  </Text>
                </div>

                {renderCourseContent(item.coursePackage)}
              </Card>
            </Col>
          ))
        )}
      </Row>

      <Modal
        title="Xem Video"
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedVideo && (
          <div className="aspect-video">
            <video
              src={selectedVideo}
              controls
              className="w-full h-full"
              controlsList="nodownload"
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        )}
      </Modal>

      <Modal
        title="Xem Hình Ảnh"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedImage && (
          <div className="flex justify-center">
            <Image
              src={selectedImage}
              alt="Course content"
              style={{ maxWidth: "100%", maxHeight: "80vh" }}
              preview={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyLibrary;
