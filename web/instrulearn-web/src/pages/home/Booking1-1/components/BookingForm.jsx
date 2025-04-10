import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  TimePicker,
  DatePicker,
  message,
  Progress,
  Alert,
  Modal,
  Card,
  Typography,
  Spin,
} from "antd";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import dayjs from "dayjs";
import axios from "axios";

const { Option } = Select;
const { Title } = Typography;

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const BookingForm = ({
  form,
  majors,
  days,
  sessionOptions,
  selectedTeacher,
  availableTeachers,
  setAvailableTeachers,
  handleInstrumentChange,
  handleTeacherChange,
  handleDayChange,
  handleViewTeacher,
  handleSubmit,
  isSubmitting,
  forceResetTeacherSelection,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [majorTest, setMajorTest] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("none");
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isCheckingTeachers, setIsCheckingTeachers] = useState(false);

  // Thêm hàm resetUploadedVideo để xóa video đã tải lên
  const resetUploadedVideo = () => {
    console.log("Resetting uploaded video");
    // Reset videoUrl trong form
    form.setFieldsValue({ videoUrl: "" });
    // Reset các state liên quan đến video
    setUploadProgress(0);
    setUploadStatus("");
    // Revoke URL nếu có
    if (previewVideoUrl) {
      URL.revokeObjectURL(previewVideoUrl);
      setPreviewVideoUrl(null);
    }
    // Đóng modal xem trước nếu đang mở
    if (isPreviewModalVisible) {
      setIsPreviewModalVisible(false);
    }
  };

  const levelOptions = [
    { value: "none", label: "Chưa chơi bao giờ" },
    { value: "1-3", label: "1-3 tháng" },
    { value: "3-6", label: "3-6 tháng" },
    { value: "6-9", label: "6-9 tháng" },
    { value: "1year", label: "Hơn 1 năm" },
  ];

  const timeLearningOptions = [
    { value: 45, label: "45 phút" },
    { value: 60, label: "60 phút" },
    { value: 90, label: "90 phút" },
    { value: 120, label: "120 phút" },
  ];

  // Hàm kiểm tra xem một ngày có phải là thứ được chọn không
  const isSelectedDay = (date, selectedDayValue) => {
    const dayOfWeek = date.day();
    // Chuyển đổi dayOfWeek (0 = Chủ nhật) sang định dạng của chúng ta (0 = Chủ nhật)
    return dayOfWeek === selectedDayValue;
  };

  // Hàm kiểm tra xem một ngày có được chọn không
  const disabledDate = (current) => {
    if (!current) return false;

    // Lấy ngày hiện tại
    const today = dayjs().startOf("day");

    // Lấy ngày đầu tiên của tuần tiếp theo
    const nextWeekStart = today.add(1, "week").startOf("week");

    // Lấy ngày đầu tiên của tháng hiện tại
    const currentMonthStart = today.startOf("month");

    // Lấy ngày cuối cùng của tháng tiếp theo
    const nextMonthEnd = currentMonthStart.add(1, "month").endOf("month");

    // Nếu ngày được chọn nhỏ hơn ngày đầu tiên của tuần tiếp theo hoặc lớn hơn ngày cuối cùng của tháng tiếp theo
    if (current.isBefore(nextWeekStart) || current.isAfter(nextMonthEnd)) {
      return true;
    }

    // Nếu chưa chọn thứ nào thì không cho chọn ngày
    if (
      !form.getFieldValue("bookingDays") ||
      form.getFieldValue("bookingDays").length === 0
    ) {
      return true;
    }

    // Kiểm tra xem ngày có trùng với các thứ đã chọn không
    const selectedDayValues = form.getFieldValue("bookingDays").map(Number);
    const isValidDay = selectedDayValues.some((dayValue) =>
      isSelectedDay(current, dayValue)
    );

    return !isValidDay;
  };

  const handleBookingDaysChange = (values) => {
    setSelectedDays(values);
    // Reset ngày bắt đầu khi thay đổi thứ
    form.setFieldsValue({ startDay: null });

    // Cập nhật số buổi học dựa trên số ngày được chọn và số tuần
    const numberOfWeeks = form.getFieldValue("numberOfWeeks");
    if (numberOfWeeks) {
      const totalSessions = values.length * numberOfWeeks;
      form.setFieldsValue({ numberOfSlots: totalSessions });
    }

    handleDayChange(values);
  };

  const fetchMajorTest = async (majorId) => {
    try {
      setLoadingTest(true);
      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/MajorTest/by-major/${majorId}`
      );

      if (response.data?.isSucceed && response.data.data.length > 0) {
        setMajorTest(response.data.data[0]);
      } else {
        setMajorTest(null);
      }
    } catch (error) {
      console.error("Error fetching major test:", error);
      message.error("Không thể tải đề bài kiểm tra");
    } finally {
      setLoadingTest(false);
    }
  };

  const handleMajorChange = (value) => {
    const selectedMajor = majors.find((m) => m.majorName === value);
    if (selectedMajor) {
      handleInstrumentChange(value);
      fetchMajorTest(selectedMajor.majorId);

      // Reset giáo viên
      forceResetTeacherSelection();

      // Reset video đã tải lên
      resetUploadedVideo();

      // Reset level về mặc định
      setSelectedLevel("none");
      form.setFieldsValue({ level: "none" });

      // Sau đó gọi API kiểm tra giáo viên có sẵn
      checkAvailableTeachers();
    }
  };

  // Thêm hàm xử lý cho bookingSlot
  const handleTimeChange = (time) => {
    // Xóa giáo viên đã chọn khi thay đổi giờ học
    form.setFieldsValue({ teacherId: undefined });
    handleTeacherChange(null);
    // Gọi ngay lập tức nếu có đủ thông tin
    if (time) {
      checkAvailableTeachers();
    }
  };

  // Thêm hàm xử lý cho timeLearning
  const handleTimeLearningChange = (value) => {
    // Xóa giáo viên đã chọn khi thay đổi thời lượng học
    form.setFieldsValue({ teacherId: undefined });
    handleTeacherChange(null);
    // Gọi ngay lập tức nếu có đủ thông tin
    checkAvailableTeachers();
  };

  // Thêm hàm xử lý cho startDay
  const handleDateChange = (date) => {
    // Xóa giáo viên đã chọn khi thay đổi ngày bắt đầu
    form.setFieldsValue({ teacherId: undefined });
    handleTeacherChange(null);
    // Gọi ngay lập tức nếu có đủ thông tin
    if (date) {
      checkAvailableTeachers();
    }
  };

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
    // Reset video URL nếu chọn "Chưa chơi bao giờ"
    if (value === "none") {
      resetUploadedVideo();
    }
  };

  const handleUploadVideo = async (file) => {
    // Kiểm tra kích thước file (giới hạn 100MB)
    if (file.size > 100 * 1024 * 1024) {
      message.error("Video không được vượt quá 100MB!");
      return Upload.LIST_IGNORE;
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith("video/")) {
      message.error("Chỉ hỗ trợ tải lên file video!");
      return Upload.LIST_IGNORE;
    }

    try {
      const videoPreviewUrl = URL.createObjectURL(file);
      setPreviewVideoUrl(videoPreviewUrl);

      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus("Đang tải video lên...");

      // Tạo reference đến storage với tên file duy nhất
      const storageRef = ref(
        storage,
        `booking-videos/${Date.now()}-${file.name}`
      );

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Theo dõi tiến trình upload
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          message.error("Tải video lên thất bại: " + error.message);
          setUploadStatus("Tải video thất bại");
          setIsUploading(false);
          URL.revokeObjectURL(videoPreviewUrl);
          setPreviewVideoUrl(null);
          form.setFieldsValue({ videoUrl: "" });
        },
        () => {
          // Upload hoàn tất, lấy URL download
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("Video uploaded successfully. URL:", downloadURL);
              form.setFieldsValue({ videoUrl: downloadURL });
              setUploadStatus("Tải video thành công!");
              setIsUploading(false);
              message.success("Tải video lên thành công");
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
              message.error("Không thể lấy URL video: " + error.message);
              setUploadStatus("Tải video thất bại");
              setIsUploading(false);
              URL.revokeObjectURL(videoPreviewUrl);
              setPreviewVideoUrl(null);
              form.setFieldsValue({ videoUrl: "" });
            });
        }
      );
    } catch (error) {
      console.error("Upload preparation error:", error);
      message.error("Lỗi chuẩn bị tải lên: " + error.message);
      setUploadStatus("Tải video thất bại");
      setIsUploading(false);
      form.setFieldsValue({ videoUrl: "" });
    }

    return false;
  };
  const showVideoPreview = () => {
    setIsPreviewModalVisible(true);
  };
  const handleClosePreview = () => {
    setIsPreviewModalVisible(false);
  };

  const handleFieldChange = (changedField) => {
    console.log(`Field ${changedField} changed, resetting teacher selection`);

    // Sử dụng hàm cưỡng chế reset từ component cha
    forceResetTeacherSelection();

    // Gọi API check giáo viên có sẵn
    checkAvailableTeachers();
  };

  const checkAvailableTeachers = async () => {
    // Reset giáo viên đã chọn trước khi gọi API
    forceResetTeacherSelection();

    const instrument = form.getFieldValue("instrument");
    const bookingSlot = form.getFieldValue("bookingSlot");
    const timeLearning = form.getFieldValue("timeLearning");
    const startDay = form.getFieldValue("startDay");
    const selectedMajor = majors.find((m) => m.majorName === instrument);

    if (
      instrument &&
      bookingSlot &&
      timeLearning &&
      startDay &&
      selectedMajor
    ) {
      try {
        setIsCheckingTeachers(true);
        console.log("Checking available teachers with params:", {
          majorId: selectedMajor.majorId,
          timeStart: dayjs(bookingSlot).format("HH:mm"),
          timeLearning: timeLearning,
          startDay: dayjs(startDay).format("YYYY-MM-DD"),
        });

        const response = await axios.get(
          "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/available-teachers",
          {
            params: {
              majorId: selectedMajor.majorId,
              timeStart: dayjs(bookingSlot).format("HH:mm"),
              timeLearning: timeLearning,
              startDay: dayjs(startDay).format("YYYY-MM-DD"),
            },
          }
        );

        console.log("Available teachers response:", response.data);

        // Xử lý response
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            setAvailableTeachers(response.data);
            console.log(
              `Tìm thấy ${response.data.length} giáo viên có lịch trống`
            );
          } else {
            setAvailableTeachers([]);
            console.log("Không tìm thấy giáo viên nào có lịch trống");
            message.warning(
              "Không có giáo viên nào có lịch trống vào thời gian này"
            );
          }
        } else {
          console.error("API response không phải mảng:", response.data);
          setAvailableTeachers([]);
          message.error("Định dạng dữ liệu không hợp lệ");
        }
      } catch (error) {
        console.error("Error checking available teachers:", error);
        message.error("Không thể kiểm tra danh sách giáo viên có lịch trống");
        setAvailableTeachers([]);
      } finally {
        setIsCheckingTeachers(false);
      }
    } else {
      console.log("Thiếu thông tin để gọi API:", {
        instrument,
        bookingSlot,
        timeLearning,
        startDay,
        majorId: selectedMajor?.majorId,
      });
      setAvailableTeachers([]);
    }
  };

  // Sử dụng useEffect để theo dõi các thay đổi của form
  useEffect(() => {
    const subscription = form.getFieldsValue();
    return () => {
      // Hủy subscription khi component unmount
    };
  }, [form]);

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      initialValues={{
        numberOfSlots: 8,
        timeLearning: 45,
        videoUrl: "",
      }}
      onFinish={handleSubmit}
      className="max-w-6xl mx-auto"
      onValuesChange={(changedValues, allValues) => {
        // Nếu thay đổi một trong bốn trường, reset giáo viên và gọi API
        if (changedValues.instrument !== undefined) {
          handleFieldChange("instrument");
        } else if (changedValues.bookingSlot !== undefined) {
          handleFieldChange("bookingSlot");
        } else if (changedValues.timeLearning !== undefined) {
          handleFieldChange("timeLearning");
        } else if (changedValues.startDay !== undefined) {
          handleFieldChange("startDay");
        }
      }}
    >
      {/* Thêm trường ẩn để lưu URL video */}
      <Form.Item name="videoUrl" hidden>
        <Input />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái */}
        <div className="space-y-6">
          <Card className="shadow-md rounded-xl border-0 bg-white">
            <Title level={4} className="mb-6 text-gray-800">
              Thông tin cơ bản
            </Title>
            <Form.Item
              name="instrument"
              label="Nhạc cụ"
              rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
            >
              <Select
                placeholder="Chọn nhạc cụ bạn muốn học"
                onChange={handleMajorChange}
                className="w-full"
              >
                {majors.map((major) => (
                  <Option key={major.majorId} value={major.majorName}>
                    {major.majorName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="bookingDays"
              label="Lịch học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một ngày học",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các ngày học trong tuần"
                onChange={(values) => {
                  handleBookingDaysChange(values);
                }}
                className="w-full"
              >
                {days.map((day) => (
                  <Option key={day.value} value={day.value}>
                    {day.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="numberOfWeeks"
              label="Số tuần học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn số tuần học",
                },
              ]}
            >
              <Select
                placeholder="Chọn số tuần học"
                onChange={(value) => {
                  const selectedDays = form.getFieldValue("bookingDays") || [];
                  const totalSessions = selectedDays.length * value;
                  form.setFieldsValue({ numberOfSlots: totalSessions });
                }}
                className="w-full"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                  <Option key={week} value={week}>
                    {week} tuần
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="numberOfSlots"
              label="Số buổi học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn số tuần học",
                },
              ]}
            >
              <Input disabled className="w-full" />
            </Form.Item>

            <Form.Item
              name="bookingSlot"
              label="Giờ học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn giờ học",
                },
              ]}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Chọn giờ học"
                minuteStep={30}
                disabledTime={() => ({
                  disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 22, 23],
                })}
                hideDisabledOptions={true}
                style={{ width: "100%" }}
                onChange={() => handleFieldChange("bookingSlot")}
              />
            </Form.Item>

            <Form.Item
              name="timeLearning"
              label="Thời lượng buổi học"
              rules={[
                { required: true, message: "Vui lòng chọn thời lượng học" },
              ]}
            >
              <Select
                placeholder="Chọn thời lượng mỗi buổi học"
                className="w-full"
                onChange={() => handleFieldChange("timeLearning")}
              >
                {timeLearningOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="startDay"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
              tooltip="Chọn ngày bắt đầu phải trùng với thứ đã chọn ở trên"
            >
              <DatePicker
                placeholder="Chọn ngày bắt đầu"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                onChange={() => handleFieldChange("startDay")}
              />
            </Form.Item>
          </Card>

          <Card className="shadow-md rounded-xl border-0 bg-white">
            <Title level={4} className="mb-6 text-gray-800">
              Thông tin giáo viên
            </Title>
            <Form.Item
              name="teacherId"
              label="Giáo viên"
              rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
            >
              <div className="space-y-4">
                <Link to="/teacher-list">
                  {/* <Button
                    type="primary"
                    ghost
                    icon={<InfoCircleOutlined />}
                    className="mb-4"
                  >
                    Danh sách giáo viên
                  </Button> */}
                </Link>

                <Select
                  placeholder={
                    isCheckingTeachers
                      ? "Đang kiểm tra giáo viên có lịch trống..."
                      : "Chọn giáo viên dạy cho bạn"
                  }
                  onChange={handleTeacherChange}
                  disabled={
                    isCheckingTeachers || availableTeachers.length === 0
                  }
                  className="w-full"
                  loading={isCheckingTeachers}
                  value={selectedTeacher?.teacherId}
                  allowClear
                  showSearch={false}
                >
                  {availableTeachers.map((teacher) => (
                    <Option key={teacher.teacherId} value={teacher.teacherId}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-800">
                            {teacher.fullname}
                          </span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          {teacher.majors
                            ? teacher.majors
                                .filter((major) => major.status === 1)
                                .map((major) => major.majorName)
                                .join(", ")
                            : ""}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
                {!isCheckingTeachers &&
                  availableTeachers.length === 0 &&
                  form.getFieldValue("instrument") &&
                  form.getFieldValue("bookingSlot") &&
                  form.getFieldValue("timeLearning") &&
                  form.getFieldValue("startDay") && (
                    <div className="text-red-500 text-sm mt-2">
                      Không có giáo viên nào có lịch trống vào thời gian này
                    </div>
                  )}
              </div>
            </Form.Item>

            {selectedTeacher && (
              <div className="mt-4">
                {/* <Button
                  type="primary"
                  ghost
                  icon={<InfoCircleOutlined />}
                  onClick={handleViewTeacher}
                  className="w-full"
                >
                  Xem thông tin giáo viên
                </Button> */}
              </div>
            )}
          </Card>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          <Card className="shadow-md rounded-xl border-0 bg-white">
            <Title level={4} className="mb-6 text-gray-800">
              Thông tin học viên
            </Title>
            <Form.Item
              name="learningRequest"
              label="Yêu cầu học"
              tooltip="Mô tả yêu cầu học của bạn"
              rules={[{ required: true, message: "Vui lòng nhập yêu cầu học" }]}
            >
              <Input.TextArea
                placeholder="Ví dụ: Muốn học các bản nhạc cổ điển, muốn luyện kỹ thuật chơi piano cơ bản..."
                rows={4}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="level"
              label="Trình độ hiện tại"
              rules={[{ required: true, message: "Vui lòng chọn trình độ" }]}
            >
              <Select
                placeholder="Chọn trình độ của bạn"
                onChange={handleLevelChange}
                className="w-full"
              >
                {levelOptions.map((level) => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          {selectedLevel && selectedLevel !== "none" && (
            <Card className="shadow-md rounded-xl border-0 bg-white">
              <Title level={4} className="mb-6 text-gray-800">
                Video trình độ
              </Title>
              {loadingTest ? (
                <Alert
                  message="Đang tải đề bài..."
                  type="info"
                  showIcon
                  className="mb-4"
                />
              ) : majorTest ? (
                <Alert
                  message="Đề bài kiểm tra trình độ"
                  description={majorTest.majorTestName}
                  type="info"
                  showIcon
                  className="mb-4"
                />
              ) : form.getFieldValue("instrument") ? (
                <Alert
                  message="Chưa có đề bài cho nhạc cụ này"
                  description="Vui lòng tải lên video thể hiện kỹ năng của bạn với nhạc cụ này"
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              ) : null}

              <Upload
                maxCount={1}
                beforeUpload={handleUploadVideo}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} className="w-full">
                  Tải lên video
                </Button>
              </Upload>

              {isUploading && (
                <div className="mt-4">
                  <Progress
                    percent={uploadProgress}
                    size="small"
                    status="active"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    {uploadStatus}
                  </div>
                </div>
              )}

              {uploadStatus === "Tải video thành công!" && !isUploading && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-green-600 text-sm">
                    Video đã được tải lên thành công!
                  </div>
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={showVideoPreview}
                    className="ml-4"
                  >
                    Xem video
                  </Button>
                </div>
              )}

              {uploadStatus === "Tải video thất bại" && !isUploading && (
                <div className="mt-4 text-red-500 text-sm">
                  <div>Tải video thất bại. Vui lòng thử lại:</div>
                  <ul className="list-disc pl-4 mt-1 text-xs">
                    <li>Đảm bảo video nhỏ hơn 100MB</li>
                    <li>Đảm bảo kết nối mạng ổn định</li>
                    <li>Thử tải video có định dạng khác (mp4, mov, avi)</li>
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          size="large"
          disabled={isUploading}
          className="px-8 py-2 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Gửi đơn đăng ký
        </Button>
      </div>

      <Modal
        title="Xem trước video"
        visible={isPreviewModalVisible}
        onCancel={handleClosePreview}
        footer={[
          <Button key="back" onClick={handleClosePreview}>
            Đóng
          </Button>,
        ]}
        width={600}
        className="rounded-xl"
      >
        <video
          src={previewVideoUrl}
          controls
          style={{ width: "100%" }}
          className="rounded-lg"
        >
          Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      </Modal>
    </Form>
  );
};

export default BookingForm;
