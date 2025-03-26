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
} from "antd";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  UploadOutlined,
  InfoCircleOutlined,
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
  filteredTeachers,
  selectedTeacher,
  handleInstrumentChange,
  handleTeacherChange,
  handleDayChange,
  handleViewTeacher,
  handleSubmit,
  isSubmitting,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [majorTest, setMajorTest] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);
  const [scheduleConflict, setScheduleConflict] = useState(null);

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
    if (current && current < dayjs().startOf("day")) {
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

    // Cập nhật số buổi học tối thiểu dựa trên số ngày được chọn
    const currentNumberOfSlots = form.getFieldValue("numberOfSlots");
    const minSlots = Math.max(5, values.length); // Tối thiểu là 5 hoặc bằng số ngày học

    // Nếu số buổi hiện tại nhỏ hơn số buổi tối thiểu mới, cập nhật lại
    if (currentNumberOfSlots < minSlots) {
      form.setFieldsValue({ numberOfSlots: minSlots });
    }

    handleDayChange(values);
  };

  const fetchMajorTest = async (majorId) => {
    try {
      setLoadingTest(true);
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/MajorTest/by-major/${majorId}`
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
    }
  };

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
    // Reset video URL nếu chọn "Chưa chơi bao giờ"
    if (value === "none") {
      form.setFieldsValue({ videoUrl: "" });
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
        message.error("Tải video lên thất bại");
        setUploadStatus("Tải video thất bại");
        setIsUploading(false);
      },
      () => {
        // Upload hoàn tất, lấy URL download
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          form.setFieldsValue({ videoUrl: downloadURL });
          setUploadStatus("Tải video thành công!");
          setIsUploading(false);
          message.success("Tải video lên thành công");
        });
      }
    );

    return false;
  };

  const fetchTeacherSchedules = async (teacherId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      setIsCheckingSchedule(true);
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setTeacherSchedules(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teacher schedules:", error);
      message.error("Không thể kiểm tra lịch dạy của giáo viên");
    } finally {
      setIsCheckingSchedule(false);
    }
  };

  const checkScheduleConflict = (selectedTime, selectedDate) => {
    if (!selectedTime || !selectedDate || teacherSchedules.length === 0) {
      setScheduleConflict(null);
      return false;
    }

    const selectedTimeStart = selectedTime.format("HH:mm");
    const timeLearning = form.getFieldValue("timeLearning") || 45; // Lấy thời lượng buổi học
    const selectedTimeEnd = selectedTime
      .add(timeLearning, "minute")
      .format("HH:mm");
    const selectedDateStr = selectedDate.format("YYYY-MM-DD");
    const selectedDayOfWeek = selectedDate.format("dddd");

    const conflictingSchedule = teacherSchedules.find((schedule) => {
      const scheduleDate = dayjs(schedule.startDate).format("YYYY-MM-DD");
      const scheduleTimeStart = schedule.timeStart;
      const scheduleTimeEnd = schedule.timeEnd;

      // Kiểm tra xem thời gian có overlap không
      const isTimeOverlap =
        (selectedTimeStart >= scheduleTimeStart &&
          selectedTimeStart < scheduleTimeEnd) || // Thời gian bắt đầu nằm trong khoảng
        (selectedTimeEnd > scheduleTimeStart &&
          selectedTimeEnd <= scheduleTimeEnd) || // Thời gian kết thúc nằm trong khoảng
        (selectedTimeStart <= scheduleTimeStart &&
          selectedTimeEnd >= scheduleTimeEnd); // Bao trọn lịch cũ

      const isDateConflict =
        scheduleDate === selectedDateStr ||
        schedule.dayOfWeek === selectedDayOfWeek;

      if (isTimeOverlap && isDateConflict) {
        setScheduleConflict({
          date: scheduleDate,
          timeStart: scheduleTimeStart,
          timeEnd: scheduleTimeEnd,
          learnerName: schedule.learnerName,
          dayOfWeek: schedule.dayOfWeek,
        });
        return true;
      }
      return false;
    });

    if (!conflictingSchedule) {
      setScheduleConflict(null);
    }
    return !!conflictingSchedule;
  };

  const handleTimeChange = (time) => {
    const startDay = form.getFieldValue("startDay");
    if (time && startDay) {
      const hasConflict = checkScheduleConflict(time, startDay);
      if (hasConflict) {
        message.warning("Giáo viên đã có lịch dạy vào thời gian này!");
        form.setFieldsValue({ bookingSlot: null });
      }
    } else {
      setScheduleConflict(null);
    }
  };

  const handleDateChange = (date) => {
    const bookingSlot = form.getFieldValue("bookingSlot");
    if (date && bookingSlot) {
      const hasConflict = checkScheduleConflict(bookingSlot, date);
      if (hasConflict) {
        message.warning("Giáo viên đã có lịch dạy vào ngày này!");
        form.setFieldsValue({ startDay: null });
      }
    } else {
      setScheduleConflict(null);
    }
  };

  useEffect(() => {
    if (selectedTeacher?.teacherId) {
      fetchTeacherSchedules(selectedTeacher.teacherId);
    }
  }, [selectedTeacher]);

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
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái */}
        <div>
          <Form.Item
            name="instrument"
            label="Nhạc cụ"
            rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
          >
            <Select
              placeholder="Chọn nhạc cụ bạn muốn học"
              onChange={handleMajorChange}
            >
              {majors.map((major) => (
                <Option key={major.majorId} value={major.majorName}>
                  {major.majorName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="Giáo viên"
            rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
          >
            <div className="mb-4">
              <Link to="/teacher-list">
                <Button type="primary" ghost icon={<InfoCircleOutlined />}>
                  Danh sách giáo viên
                </Button>
              </Link>
            </div>

            <Select
              placeholder="Chọn giáo viên dạy cho bạn"
              onChange={handleTeacherChange}
              disabled={!form.getFieldValue("instrument")}
            >
              {filteredTeachers.map((teacher) => (
                <Option key={teacher.teacherId} value={teacher.teacherId}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{teacher.fullname}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {teacher.majors
                        .filter((major) => major.status === 1)
                        .map((major) => major.majorName)
                        .join(", ")}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedTeacher && (
            <div className="mt-4">
              <Button
                type="primary"
                ghost
                icon={<InfoCircleOutlined />}
                onClick={handleViewTeacher}
              >
                Xem thông tin giáo viên
              </Button>
            </div>
          )}

          <Form.Item
            name="bookingDays"
            label="Ngày học trong tuần"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một ngày học" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các ngày học trong tuần"
              onChange={(values) => {
                handleBookingDaysChange(values);
                setScheduleConflict(null);
              }}
              disabled={!selectedTeacher}
            >
              {days.map((day) => (
                <Option key={day.value} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {scheduleConflict && (
            <Alert
              message="Cảnh báo trùng lịch"
              description={
                <div>
                  <p>Giáo viên đã có lịch dạy vào thời gian này:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>
                      Thời gian: {scheduleConflict.timeStart} -{" "}
                      {scheduleConflict.timeEnd}
                    </li>
                    <li>
                      Ngày: {dayjs(scheduleConflict.date).format("DD/MM/YYYY")}
                    </li>
                    <li>Thứ: {scheduleConflict.dayOfWeek}</li>
                  </ul>
                  <p className="mt-2">Vui lòng chọn thời gian khác.</p>
                </div>
              }
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Form.Item
            name="startDay"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
            tooltip="Chọn ngày bắt đầu phải trùng với thứ đã chọn ở trên"
          >
            <DatePicker
              placeholder="Chọn ngày bắt đầu"
              style={{ width: "100%" }}
              disabledDate={disabledDate}
              onChange={handleDateChange}
              disabled={
                !form.getFieldValue("bookingDays") ||
                form.getFieldValue("bookingDays").length === 0 ||
                isCheckingSchedule
              }
            />
          </Form.Item>

          <Form.Item
            name="learningRequest"
            label="Yêu cầu học"
            tooltip="Mô tả yêu cầu học của bạn"
            rules={[{ required: true, message: "Vui lòng nhập yêu cầu học" }]}
          >
            <Input.TextArea
              placeholder="Ví dụ: Muốn học các bản nhạc cổ điển, muốn luyện kỹ thuật chơi piano cơ bản..."
              rows={4}
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
            >
              {levelOptions.map((level) => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Cột phải */}
        <div>
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
              onChange={handleTimeChange}
              disabled={!selectedTeacher || isCheckingSchedule}
            />
          </Form.Item>

          <Form.Item
            name="timeLearning"
            label="Thời lượng buổi học"
            rules={[
              { required: true, message: "Vui lòng chọn thời lượng học" },
            ]}
          >
            <Select placeholder="Chọn thời lượng mỗi buổi học">
              {timeLearningOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="numberOfSlots"
            label="Số buổi học đăng ký"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn số buổi học",
              },
              {
                validator: async (_, value) => {
                  const selectedDays = form.getFieldValue("bookingDays") || [];
                  const minSlots = Math.max(5, selectedDays.length);
                  if (value < minSlots) {
                    throw new Error(
                      `Số buổi học phải ít nhất ${minSlots} buổi với ${selectedDays.length} ngày học đã chọn`
                    );
                  }
                },
              },
            ]}
          >
            <Select
              placeholder="Chọn số buổi học đăng ký"
              disabled={!form.getFieldValue("bookingDays")?.length}
            >
              {sessionOptions
                .filter((num) => {
                  const selectedDays = form.getFieldValue("bookingDays") || [];
                  const minSlots = Math.max(5, selectedDays.length);
                  return num >= minSlots;
                })
                .map((num) => (
                  <Option key={num} value={num}>
                    {num} buổi
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {selectedLevel && selectedLevel !== "none" && (
            <Form.Item
              name="videoUrl"
              label="Video trình độ"
              tooltip={
                majorTest
                  ? "Hãy quay video theo yêu cầu đề bài ở trên"
                  : "Tải lên video ngắn để giáo viên đánh giá trình độ của bạn"
              }
              rules={[
                { required: true, message: "Vui lòng tải lên video trình độ" },
              ]}
            >
              <div>
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
                  <Button icon={<UploadOutlined />}>Tải lên video</Button>
                </Upload>

                {isUploading && (
                  <div className="mt-2">
                    <Progress
                      percent={uploadProgress}
                      size="small"
                      status="active"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {uploadStatus}
                    </div>
                  </div>
                )}

                {uploadStatus === "Tải video thành công!" && !isUploading && (
                  <div className="mt-2 text-green-600 text-sm">
                    Video đã được tải lên thành công!
                  </div>
                )}
              </div>
            </Form.Item>
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
        >
          Gửi đơn đăng ký
        </Button>
      </div>
    </Form>
  );
};

export default BookingForm;
