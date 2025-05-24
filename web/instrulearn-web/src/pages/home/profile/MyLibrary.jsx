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
  Progress,
  Drawer,
  Image,
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MyLibrary = () => {
  const [loading, setLoading] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [coursesProgress, setCoursesProgress] = useState([]);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoItemId, setSelectedVideoItemId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [contentProgress, setContentProgress] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [lastWatchTimeUpdate, setLastWatchTimeUpdate] = useState(0);
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [isVideoLearned, setIsVideoLearned] = useState(false);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [itemTypes, setItemTypes] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  useEffect(() => {
    fetchData();
    fetchItemTypes();
  }, []);

  useEffect(() => {
    if (selectedVideoItemId && contentProgress) {
      const progress = getVideoProgress(selectedVideoItemId);
      setIsVideoLearned(progress?.isLearned || false);
    }
    // eslint-disable-next-line
  }, [selectedVideoItemId, contentProgress]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        throw new Error("Vui lòng đăng nhập để xem thông tin");
      }

      // Fetch purchased courses
      const purchasesResponse = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Purchase/by-learner/${learnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch courses progress
      const progressResponse = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/CourseProgress/learner/${learnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (purchasesResponse.data.isSucceed && progressResponse.data.isSucceed) {
        console.log(
          "API Purchase response full:",
          JSON.stringify(purchasesResponse.data, null, 2)
        );

        // Log chi tiết cấu trúc dữ liệu
        if (
          purchasesResponse.data.data &&
          purchasesResponse.data.data.length > 0
        ) {
          const firstPurchase = purchasesResponse.data.data[0];
          console.log("First purchase structure:", firstPurchase);

          if (
            firstPurchase.purchaseItems &&
            firstPurchase.purchaseItems.length > 0
          ) {
            const firstItem = firstPurchase.purchaseItems[0];
            console.log("First purchase item:", firstItem);
            console.log(
              "Course package in first item:",
              firstItem.coursePackage
            );
            console.log(
              "coursePackageId in first item:",
              firstItem.coursePackageId
            );
          }
        }

        setPurchasedCourses(purchasesResponse.data.data);
        setCoursesProgress(progressResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/ItemType/get-all"
      );
      if (response.data?.isSucceed) {
        setItemTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching item types:", error);
    }
  };

  const fetchContentProgress = async (coursePackageId) => {
    try {
      setLoadingProgress(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!learnerId || !coursePackageId) {
        console.error(
          `Thiếu thông tin: learnerId=${learnerId}, coursePackageId=${coursePackageId}`
        );
        message.error("Không thể tải thông tin tiến độ học tập");
        setLoadingProgress(false);
        return;
      }

      console.log(
        `Fetching progress for learnerId: ${learnerId}, coursePackageId: ${coursePackageId}`
      );

      try {
        const response = await axios.get(
          `https://instrulearnapplication.azurewebsites.net/api/CourseProgress/all-course-packages/${learnerId}/${coursePackageId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.isSucceed) {
          console.log("Progress API response:", response.data);
          setContentProgress(response.data.data);
        } else {
          console.error("API không trả về thành công:", response.data);
          message.warning(
            `Không thể tải tiến độ: ${
              response.data.message || "Lỗi không xác định"
            }`
          );
        }
      } catch (apiError) {
        console.error("Lỗi API:", apiError);

        if (apiError.response) {
          console.error(
            "API response error:",
            apiError.response.status,
            apiError.response.data
          );
          message.error(
            `Lỗi API (${apiError.response.status}): ${
              apiError.response.data?.message || "Không thể kết nối đến API"
            }`
          );
        } else if (apiError.request) {
          console.error("API request error - no response:", apiError.request);
          message.error("Không nhận được phản hồi từ máy chủ");
        } else {
          console.error("API setup error:", apiError.message);
          message.error(`Lỗi: ${apiError.message}`);
        }

        // Sử dụng dữ liệu từ selectedCourse khi API lỗi
        if (selectedCourse) {
          console.log("Sử dụng dữ liệu từ selectedCourse khi API gặp lỗi");

          // Tạo dữ liệu mô phỏng từ selectedCourse với coursePackageId được truyền vào
          const mockProgressData = {
            coursePackageId: coursePackageId,
            courseName: selectedCourse.courseName,
            totalContents: selectedCourse.courseContents?.length || 0,
            totalContentItems:
              selectedCourse.courseContents?.reduce(
                (total, content) =>
                  total + (content.courseContentItems?.length || 0),
                0
              ) || 0,
            overallProgressPercentage: 0,
            contents:
              selectedCourse.courseContents?.map((content) => ({
                contentId: content.contentId,
                heading: content.heading,
                totalContentItems: content.courseContentItems?.length || 0,
                contentItems:
                  content.courseContentItems?.map((item) => ({
                    itemId: item.itemId,
                    itemDes: item.itemDes,
                    itemTypeId: item.itemTypeId,
                    itemTypeName: item.itemTypeId === 2 ? "videos" : "docs",
                    isLearned: item.status === 1,
                    durationInSeconds: item.itemTypeId === 2 ? 0 : null,
                    watchTimeInSeconds: 0,
                    completionPercentage: item.status === 1 ? 100 : 0,
                    lastAccessDate: new Date().toISOString(),
                  })) || [],
              })) || [],
          };

          console.log("Dữ liệu mô phỏng được tạo:", mockProgressData);
          setContentProgress(mockProgressData);
        }
      }
    } catch (error) {
      console.error("Lỗi tổng quát:", error);
      message.error("Không thể tải thông tin tiến độ học tập");
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleViewVideo = (videoUrl, itemId) => {
    console.log(`Xem video: ${videoUrl}, itemId: ${itemId}`);
    const progress = getVideoProgress(itemId);
    const startTime = progress?.watchTimeInSeconds || 0;
    console.log("Lấy thời gian bắt đầu video:", startTime);

    // Kiểm tra trạng thái isLearned
    const isLearned = progress?.isLearned || false;
    setIsVideoLearned(isLearned);

    setSelectedVideo(videoUrl);
    setSelectedVideoItemId(itemId);
    setIsVideoLoaded(false);
    setLastWatchTimeUpdate(startTime);
    setVideoStartTime(startTime);
    setVideoModalVisible(true);
  };

  const handleVideoLoad = (e) => {
    const video = e.target;
    const duration = Math.floor(video.duration);
    setIsVideoLoaded(true);
    console.log(`Video đã tải, tổng thời lượng: ${duration} giây`);

    // Chỉ set về vị trí đã xem nếu có
    if (videoStartTime > 0 && videoStartTime < duration) {
      video.currentTime = videoStartTime;
    }

    updateVideoDuration(duration);
  };

  const updateVideoDuration = async (duration) => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!learnerId || !selectedVideoItemId) {
        console.error(
          `Thiếu thông tin: learnerId=${learnerId}, itemId=${selectedVideoItemId}`
        );
        return;
      }

      console.log(
        `Cập nhật tổng thời lượng: learnerId=${learnerId}, itemId=${selectedVideoItemId}, duration=${duration}`
      );

      const response = await axios.post(
        `https://instrulearnapplication.azurewebsites.net/api/CourseProgress/update-video-duration`,
        {
          learnerId: Number(learnerId),
          itemId: Number(selectedVideoItemId),
          totalDuration: duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.isSucceed) {
        console.log("Cập nhật thời lượng video thành công:", response.data);
        message.success("Đã cập nhật thời lượng video");

        // Nếu đang xem chi tiết khóa học, chỉ fetch lại khi KHÔNG mở modal video
        if (
          selectedCourse &&
          selectedCourse.coursePackageId &&
          !videoModalVisible
        ) {
          console.log(
            "Cập nhật lại dữ liệu tiến độ sau khi cập nhật thời lượng"
          );
          fetchContentProgress(selectedCourse.coursePackageId);
        }
      } else {
        console.error("Cập nhật thời lượng video thất bại:", response.data);
        message.error(
          `Không thể cập nhật thời lượng: ${
            response.data.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thời lượng video:", error);
      message.error("Không thể cập nhật thời lượng video");
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const video = e.target;
    const currentTime = Math.floor(video.currentTime);

    // Lưu lại vị trí đã xem lớn nhất
    setMaxWatchedTime((prev) => Math.max(prev, currentTime));

    // Cập nhật thời gian xem cho UI
    if (currentTime % 10 === 0 && currentTime > 0) {
      console.log(`Đã xem ${currentTime} giây`);
    }

    // Chỉ cập nhật khi thời gian xem thay đổi đáng kể (ít nhất 5 giây) để tránh gọi API quá nhiều
    if (currentTime >= lastWatchTimeUpdate + 5) {
      updateVideoWatchTime(currentTime);
    }
  };

  const handleVideoEnded = (e) => {
    console.log("Video đã kết thúc");

    // Cập nhật thời gian xem cuối cùng
    const totalDuration = Math.floor(e.target.duration);
    updateVideoWatchTime(totalDuration);

    // Cập nhật trạng thái isLearned
    setIsVideoLearned(true);

    message.success("Đã xem xong video");
  };

  const handleVideoSeeking = (e) => {
    const video = e.target;
    const currentTime = video.currentTime;
    const progress = getVideoProgress(selectedVideoItemId);

    if (!isVideoLoaded) {
      e.preventDefault();
      video.currentTime = 0;
      message.warning("Vui lòng chờ video tải xong trước khi tua.");
      return;
    }

    if (progress?.isLearned) {
      return; // Cho phép tua tự do nếu đã học xong
    }

    const lastWatch = progress?.watchTimeInSeconds || 0;

    // Nếu tua tới vượt quá vùng đã học thì chặn và cảnh báo
    if (currentTime > lastWatch + 1) {
      video.currentTime = lastWatch;
      message.warning(
        "Bạn chỉ có thể tua ngược, không được tua tới khi chưa học xong."
      );
    }
    // Nếu tua ngược (currentTime < lastWatch) thì cho phép tự do, KHÔNG set lại vị trí
  };

  const handleCourseClick = (course) => {
    console.log("Course clicked:", course);
    // Xác minh cấu trúc dữ liệu chi tiết
    console.log("Course type:", typeof course);
    console.log("Course keys:", Object.keys(course));
    console.log("Course data structure:", JSON.stringify(course, null, 2));

    setSelectedCourse(course);
    setDrawerVisible(true);

    // Lấy coursePackageId đúng từ cấu trúc dữ liệu API
    let coursePackageId = null;

    // Kiểm tra các trường hợp cấu trúc khác nhau
    if (course?.coursePackageId) {
      coursePackageId = course.coursePackageId;
      console.log("Found coursePackageId directly:", coursePackageId);
    } else if (course?.coursePackage?.coursePackageId) {
      coursePackageId = course.coursePackage.coursePackageId;
      console.log("Found coursePackageId in coursePackage:", coursePackageId);
    } else {
      // Thử tìm kiếm trong các thuộc tính khác
      for (const key in course) {
        if (
          key.includes("coursePackageId") ||
          key.includes("CoursePackageId")
        ) {
          coursePackageId = course[key];
          console.log(
            `Found coursePackageId in field ${key}:`,
            coursePackageId
          );
          break;
        }
      }
    }

    if (coursePackageId) {
      console.log("Using coursePackageId:", coursePackageId);
      fetchContentProgress(coursePackageId);
    } else {
      console.error("Không tìm thấy coursePackageId trong dữ liệu:", course);
      message.error("Không thể tải thông tin khóa học");
    }
  };

  const getItemTypeName = (itemTypeId) => {
    const found = itemTypes.find((type) => type.itemTypeId === itemTypeId);
    return found ? found.itemTypeName : "Nội dung";
  };

  const getItemTypeIcon = (itemTypeId) => {
    const typeName = getItemTypeName(itemTypeId);
    if (typeName === "Video")
      return <PlayCircleOutlined className="text-green-500" />;
    if (typeName === "PDF") return <FilePdfOutlined className="text-red-500" />;
    if (typeName === "Hình ảnh" || typeName === "Image")
      return <FileImageOutlined className="text-blue-500" />;
    return <FileTextOutlined className="text-blue-500" />;
  };

  const getCourseProgress = (coursePackageId) => {
    const progress = coursesProgress.find(
      (p) => p.coursePackageId === coursePackageId
    );
    return progress || null;
  };

  const getVideoProgress = (itemId) => {
    if (!contentProgress?.contents || !itemId) return null;

    for (const content of contentProgress.contents) {
      if (!content.contentItems) continue;
      const item = content.contentItems.find((item) => item.itemId === itemId);
      if (item) return item;
    }
    return null;
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return "0%";

    const numValue = Number(value);
    // Kiểm tra nếu là số nguyên (không có phần thập phân)
    if (Number.isInteger(numValue)) {
      return `${numValue}%`;
    }
    // Nếu có phần thập phân, giữ 2 chữ số thập phân
    return `${numValue.toFixed(2)}%`;
  };

  const renderCourseContent = () => {
    if (!selectedCourse?.courseContents) return null;

    return (
      <Collapse
        defaultActiveKey={[selectedCourse.courseContents[0]?.contentId]}
        expandIcon={({ isActive }) => (
          <RightOutlined rotate={isActive ? 90 : 0} />
        )}
        className="bg-white"
      >
        {selectedCourse.courseContents.map((content) => (
          <Panel
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOutlined className="mr-2 text-purple-600" />
                  <span className="font-medium">{content.heading}</span>
                </div>
                <Tag color="blue">
                  {content.courseContentItems.length} nội dung
                </Tag>
              </div>
            }
            key={content.contentId}
          >
            {loadingProgress ? (
              <div className="py-4 flex justify-center">
                <Spin size="small" />
              </div>
            ) : content.courseContentItems.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={content.courseContentItems}
                renderItem={(item) => {
                  const typeName = getItemTypeName(item.itemTypeId);
                  return (
                    <List.Item
                      className="border border-gray-100 rounded-md p-3 mb-2 hover:bg-gray-50"
                      actions={[
                        typeName === "Video" ? (
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() =>
                              handleViewVideo(item.itemDes, item.itemId)
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Xem video
                          </Button>
                        ) : typeName === "PDF" ? (
                          <Button
                            type="primary"
                            icon={<FilePdfOutlined />}
                            onClick={() =>
                              handleViewDocument(item.itemDes, item.itemId)
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Xem PDF
                          </Button>
                        ) : typeName === "Hình ảnh" || typeName === "Image" ? (
                          <Button
                            type="primary"
                            icon={<FileImageOutlined />}
                            onClick={() => handleViewImage(item.itemDes)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Xem ảnh
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={() =>
                              handleViewDocument(item.itemDes, item.itemId)
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Xem nội dung
                          </Button>
                        ),
                      ]}
                    >
                      <div className="w-full">
                        <div className="flex items-start mb-3">
                          <Avatar
                            icon={getItemTypeIcon(item.itemTypeId)}
                            className={`${
                              item.status === 1 ||
                              getVideoProgress(item.itemId)?.isLearned === true
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                            size="large"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <Text strong>{typeName}</Text>
                              {getVideoProgress(item.itemId)?.isLearned ===
                                true && (
                                <Tag
                                  color="success"
                                  icon={<CheckCircleOutlined />}
                                >
                                  Đã học xong
                                </Tag>
                              )}
                              {typeName === "Video" &&
                                getVideoProgress(item.itemId)
                                  ?.durationInSeconds > 0 && (
                                  <Tag color="processing">
                                    {Math.floor(
                                      getVideoProgress(item.itemId)
                                        ?.durationInSeconds / 60
                                    )}
                                    :
                                    {(
                                      getVideoProgress(item.itemId)
                                        ?.durationInSeconds % 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}
                                  </Tag>
                                )}
                            </div>
                            {typeName === "Video" && (
                              <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                  <Text className="text-xs">Tiến độ xem:</Text>
                                  <Text className="text-xs">
                                    {getVideoProgress(item.itemId)
                                      ?.watchTimeInSeconds || 0}
                                    s /{" "}
                                    {getVideoProgress(item.itemId)
                                      ?.durationInSeconds || 0}
                                    s
                                  </Text>
                                </div>
                                <Progress
                                  percent={
                                    getVideoProgress(item.itemId)
                                      ? Number(
                                          getVideoProgress(item.itemId)
                                            ?.completionPercentage
                                        )
                                      : 0
                                  }
                                  size="small"
                                  strokeColor="#1677ff"
                                  status={
                                    getVideoProgress(item.itemId)
                                      ?.completionPercentage === 100
                                      ? "success"
                                      : "active"
                                  }
                                  format={(percent) => {
                                    const val =
                                      getVideoProgress(item.itemId)
                                        ?.completionPercentage || 0;
                                    return formatPercentage(val);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {getVideoProgress(item.itemId)?.lastAccessDate && (
                          <div className="mt-2 flex justify-end">
                            <Text type="secondary" className="text-xs">
                              {typeName === "Video" ? "Xem" : "Truy cập"} lần
                              cuối:{" "}
                              {dayjs(
                                getVideoProgress(item.itemId)?.lastAccessDate
                              ).format("DD/MM/YYYY HH:mm")}
                            </Text>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="Chưa có nội dung" />
            )}
          </Panel>
        ))}
      </Collapse>
    );
  };

  const handleViewDocument = (documentUrl, itemId) => {
    console.log(`Xem tài liệu: ${documentUrl}, itemId: ${itemId}`);

    // Hiển thị PDF trong modal
    setCurrentPdfUrl(documentUrl);
    setPdfViewerVisible(true);

    // Gọi API để đánh dấu đã xem tài liệu
    updateContentItemStatus(itemId);

    // Fetch lại dữ liệu luôn để cập nhật UI
    if (selectedCourse && selectedCourse.coursePackageId) {
      setTimeout(() => {
        console.log("Fetch lại dữ liệu sau khi xem tài liệu");
        fetchContentProgress(selectedCourse.coursePackageId);
      }, 1000); // Đợi 1 giây để API có thời gian xử lý
    }
  };

  const updateContentItemStatus = async (itemId) => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!learnerId || !itemId) {
        console.error(
          `Thiếu thông tin: learnerId=${learnerId}, itemId=${itemId}`
        );
        return;
      }

      console.log(
        `Cập nhật trạng thái tài liệu: learnerId=${learnerId}, itemId=${itemId}`
      );

      // Gửi đúng format dữ liệu mà API mong đợi
      // Sử dụng query parameter thay vì request body
      const response = await axios.post(
        `https://instrulearnapplication.azurewebsites.net/api/CourseProgress/update-content-item?learnerId=${learnerId}&itemId=${itemId}`,
        {}, // Để body trống vì chúng ta sử dụng query parameters
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.isSucceed) {
        console.log("Cập nhật trạng thái tài liệu thành công:", response.data);

        // Hiển thị thông báo thành công dựa trên response
        const documentInfo = response.data.data.isDocument
          ? "tài liệu"
          : "nội dung";
        const completionStatus = response.data.data.isCompleted
          ? "đã hoàn thành"
          : "chưa hoàn thành";
        message.success(
          `${response.data.message} (${documentInfo} ${completionStatus})`
        );

        // Nếu đang xem chi tiết khóa học, chỉ fetch lại khi KHÔNG mở modal video
        if (
          selectedCourse &&
          selectedCourse.coursePackageId &&
          !videoModalVisible
        ) {
          console.log("Cập nhật lại dữ liệu tiến độ sau khi đánh dấu tài liệu");
          fetchContentProgress(selectedCourse.coursePackageId);
        }
      } else {
        console.error("Cập nhật trạng thái tài liệu thất bại:", response.data);
        message.warning(
          `Không thể cập nhật trạng thái: ${
            response.data.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái tài liệu:", error);
      // Chi tiết lỗi
      if (error.response) {
        console.error(
          "Lỗi response:",
          error.response.status,
          error.response.data
        );
        message.error(
          `Lỗi cập nhật (${error.response.status}): ${
            error.response.data?.message || "Không thể cập nhật trạng thái"
          }`
        );
      } else if (error.request) {
        console.error("Không nhận được response:", error.request);
        message.error("Không nhận được phản hồi từ máy chủ");
      } else {
        console.error("Lỗi cấu hình request:", error.message);
        message.error(`Lỗi: ${error.message}`);
      }

      // Vẫn fetch lại dữ liệu ngay cả khi có lỗi
      if (selectedCourse && selectedCourse.coursePackageId) {
        console.log("Fetch lại dữ liệu dù có lỗi khi cập nhật");
        fetchContentProgress(selectedCourse.coursePackageId);
      }
    }
  };

  const updateVideoWatchTime = async (watchTimeInSeconds) => {
    try {
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!learnerId || !selectedVideoItemId) {
        console.error(
          `Thiếu thông tin: learnerId=${learnerId}, itemId=${selectedVideoItemId}`
        );
        return;
      }

      console.log(
        `Cập nhật thời gian xem: learnerId=${learnerId}, itemId=${selectedVideoItemId}, watchTime=${watchTimeInSeconds}s`
      );

      const response = await axios.post(
        `https://instrulearnapplication.azurewebsites.net/api/CourseProgress/update-video-watchtime`,
        {
          learnerId: Number(learnerId),
          itemId: Number(selectedVideoItemId),
          watchTimeInSeconds: watchTimeInSeconds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.isSucceed) {
        console.log("Cập nhật thời gian xem thành công:", response.data);

        // Lưu lại thời gian đã cập nhật
        setLastWatchTimeUpdate(watchTimeInSeconds);

        // Nếu đang xem chi tiết khóa học, chỉ fetch lại khi KHÔNG mở modal video
        if (
          selectedCourse &&
          selectedCourse.coursePackageId &&
          !videoModalVisible
        ) {
          console.log(
            "Cập nhật lại dữ liệu tiến độ sau khi cập nhật thời gian xem"
          );
          fetchContentProgress(selectedCourse.coursePackageId);
        }
      } else {
        console.error("Cập nhật thời gian xem thất bại:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thời gian xem video:", error);
    }
  };

  const handleViewImage = (url) => {
    setCurrentImageUrl(url);
    setImageModalVisible(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!purchasedCourses.length) {
    return <Empty description="Bạn chưa có khóa học nào" className="my-8" />;
  }

  return (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        {purchasedCourses.map((purchase) =>
          purchase.purchaseItems.map((item) => {
            const progress = getCourseProgress(item.coursePackageId);
            return (
              <Col xs={24} sm={12} lg={8} key={item.purchaseItemId}>
                <Card
                  hoverable
                  onClick={() => {
                    // Log thông tin trước khi gọi handleCourseClick
                    console.log("Card clicked for item:", item);
                    console.log(
                      "coursePackageId từ item:",
                      item.coursePackageId
                    );
                    console.log("CoursePackage từ item:", item.coursePackage);

                    // Truyền coursePackageId và coursePackage cùng với course
                    const courseData = {
                      ...item.coursePackage,
                      coursePackageId: item.coursePackageId, // Đảm bảo coursePackageId được truyền đúng
                    };

                    handleCourseClick(courseData);
                  }}
                  className="h-full"
                  cover={
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${item.coursePackage.imageUrl})`,
                      }}
                    />
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <Title level={4} className="mb-2">
                        {item.coursePackage.courseName}
                      </Title>
                      <div className="space-y-2">
                        <Tag color="purple" className="mb-2">
                          {item.coursePackage.courseTypeName}
                        </Tag>
                        <div className="flex items-center gap-2">
                          <CalendarOutlined className="text-gray-500" />
                          <Text type="secondary">
                            Ngày mua:{" "}
                            {dayjs(purchase.purchaseDate).format("DD/MM/YYYY")}
                          </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarOutlined className="text-gray-500" />
                          <Text type="secondary">
                            Giá: {item.totalAmount.toLocaleString()}đ
                          </Text>
                        </div>
                        {progress && (
                          <div className="flex items-center gap-2">
                            <ClockCircleOutlined className="text-gray-500" />
                            <Text type="secondary">
                              Truy cập gần nhất:{" "}
                              {dayjs(progress.lastAccessDate).format(
                                "DD/MM/YYYY HH:mm"
                              )}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text strong>Tiến độ học tập:</Text>
                        <Text>
                          {contentProgress &&
                          contentProgress.coursePackageId ===
                            item.coursePackageId
                            ? formatPercentage(
                                contentProgress.overallProgressPercentage !== -1
                                  ? contentProgress.overallProgressPercentage
                                  : 0
                              )
                            : formatPercentage(
                                progress?.completionPercentage !== -1
                                  ? progress?.completionPercentage
                                  : 0
                              )}
                        </Text>
                      </div>
                      <Progress
                        percent={
                          contentProgress &&
                          contentProgress.coursePackageId ===
                            item.coursePackageId
                            ? Number(
                                contentProgress.overallProgressPercentage !== -1
                                  ? contentProgress.overallProgressPercentage
                                  : 0
                              )
                            : Number(
                                progress?.completionPercentage !== -1
                                  ? progress?.completionPercentage
                                  : 0
                              ) || 0
                        }
                        strokeColor="#1677ff"
                        size="small"
                        status={
                          (
                            contentProgress &&
                            contentProgress.coursePackageId ===
                              item.coursePackageId
                              ? contentProgress.overallProgressPercentage ===
                                100
                              : progress?.completionPercentage === 100
                          )
                            ? "success"
                            : "active"
                        }
                        showInfo={false}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <Tag color="blue">
                        {item.coursePackage.courseContents.length} bài học
                      </Tag>
                      <Button type="link">Xem chi tiết</Button>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span>{selectedCourse?.courseName}</span>
            <Tag color="blue">
              {selectedCourse?.courseContents?.length || 0} bài học
            </Tag>
          </div>
        }
        placement="right"
        width={800}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedCourse(null);
        }}
        open={drawerVisible}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="mb-3">
              {selectedCourse?.headline}
            </Title>
            <Text type="secondary">{selectedCourse?.courseDescription}</Text>
          </div>
          {renderCourseContent()}
        </div>
      </Drawer>

      <Modal
        title="Xem Video"
        open={videoModalVisible}
        onCancel={() => {
          // Lưu thời gian xem cuối cùng khi đóng modal
          if (maxWatchedTime > lastWatchTimeUpdate) {
            updateVideoWatchTime(maxWatchedTime);
          }
          setVideoModalVisible(false);
          // Chỉ fetch lại khi modal đóng
          if (selectedCourse && selectedCourse.coursePackageId) {
            fetchContentProgress(selectedCourse.coursePackageId);
          }
          setMaxWatchedTime(0); // reset cho lần xem tiếp theo
        }}
        footer={null}
        width={800}
        centered
        destroyOnClose={true}
      >
        {selectedVideo && (
          <div className="aspect-video relative">
            <video
              id="videoPlayer"
              src={selectedVideo}
              controls
              className="w-full h-full"
              controlsList="nodownload noplaybackrate"
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              autoPlay
              onSeeking={handleVideoSeeking}
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        )}
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        title="Xem tài liệu"
        open={pdfViewerVisible}
        onCancel={() => setPdfViewerVisible(false)}
        width={800}
        footer={null}
        bodyStyle={{ padding: 0 }}
      >
        <iframe
          src={`${currentPdfUrl}#toolbar=0`}
          width="100%"
          height="600px"
          style={{ border: "none" }}
          title="PDF Viewer"
        />
      </Modal>

      {/* Modal xem ảnh */}
      <Modal
        title="Xem ảnh"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        width={600}
        footer={null}
        centered
      >
        <Image src={currentImageUrl} alt="Hình ảnh bài học" width="100%" />
      </Modal>
    </div>
  );
};

export default MyLibrary;
