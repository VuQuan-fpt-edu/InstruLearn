import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  TimePicker,
  message,
  Progress,
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

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      initialValues={{
        numberOfSlots: 8,
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
              onChange={handleInstrumentChange}
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
                  <div className="flex items-center">
                    <span className="ml-2">{teacher.fullname}</span>
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
        </div>

        {/* Cột phải */}
        <div>
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
              onChange={handleDayChange}
              disabled={!selectedTeacher}
            >
              {days.map((day) => (
                <Option key={day.value} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
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
            />
          </Form.Item>

          <Form.Item
            name="numberOfSlots"
            label="Số buổi học đăng ký"
            rules={[{ required: true, message: "Vui lòng chọn số buổi học" }]}
          >
            <Select placeholder="Chọn số buổi học đăng ký">
              {sessionOptions.map((num) => (
                <Option key={num} value={num}>
                  {num} buổi
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="videoUrl"
            label="Video trình độ"
            tooltip="Tải lên video ngắn để giáo viên đánh giá trình độ của bạn"
            rules={[
              {
                required: true,
                message: "Vui lòng tải lên video trình độ",
              },
            ]}
          >
            <div>
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
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          size="large"
          disabled={isUploading || !form.getFieldValue("videoUrl")}
        >
          Gửi đơn đăng ký
        </Button>
      </div>
    </Form>
  );
};

export default BookingForm;
