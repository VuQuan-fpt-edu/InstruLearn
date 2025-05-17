import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Steps,
  Typography,
  message,
  Avatar,
  Form,
  Modal,
  Button,
  Alert,
  Result,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import {
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

// Import các components
import BookingForm from "./components/BookingForm";
import TeacherModal from "./components/TeacherModal";
import SuccessModal from "./components/SuccessModal";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

// Constants
const days = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

const sessionOptions = Array.from({ length: 16 }, (_, i) => i + 5);

const levelOptions = [
  { value: "none", label: "Tôi chưa chơi nhạc cụ này bao giờ" },
  { value: "1-3", label: "Tôi đã chơi nhạc cụ này được 1-3 tháng" },
  { value: "3-6", label: "Tôi đã chơi nhạc cụ này được 3-6 tháng" },
  { value: "6-9", label: "Tôi đã chơi nhạc cụ này được 6-9 tháng" },
  { value: "1year", label: "Tôi đã chơi nhạc cụ này được hơn 1 năm rồi" },
];

function getLevelLabel(value) {
  const found = levelOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
}

const StudentBookingForm = () => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchMajors();
  }, [form, navigate]);

  const forceResetTeacherSelection = () => {
    console.log("Force resetting teacher selection");
    setSelectedTeacher(null);
    // Reset form field và đảm bảo UI được cập nhật
    form.setFieldsValue({ teacherId: undefined });
    setTimeout(() => {
      // Sử dụng setTimeout để đảm bảo React có thời gian cập nhật UI
      form.setFieldsValue({ teacherId: undefined });
    }, 0);
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Bạn chưa đăng nhập");

      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.isSucceed) {
        const userData = response.data.data;
        if (userData.username) {
          localStorage.setItem("username", userData.username);
        }

        setUserProfile({
          id: userData.learnerId,
          name: userData.fullname,
          email: userData.email,
          username: userData.username,
          phoneNumber: userData.phoneNumber,
          avatar: "https://via.placeholder.com/50",
        });

        form.setFieldsValue({
          studentName: userData.fullname,
          studentEmail: userData.email,
          phoneNumber: userData.phoneNumber,
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      message.error(err.message || "Không thể tải thông tin người dùng!");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
      );
      if (response.data?.isSucceed) {
        const activeMajors = response.data.data.filter(
          (major) => major.status === 1
        );
        setMajors(activeMajors);
      }
    } catch (error) {
      message.error("Không thể tải danh sách nhạc cụ");
      console.error("Error fetching majors:", error);
    }
  };

  const handleInstrumentChange = (value) => {
    console.log("Instrument changed to:", value);
    const selectedMajor = majors.find((m) => m.majorName === value);
    if (selectedMajor) {
      // Cưỡng chế reset giáo viên khi thay đổi nhạc cụ
      forceResetTeacherSelection();
    }
  };

  const handleTeacherChange = (teacherId) => {
    if (!teacherId) {
      setSelectedTeacher(null);
      form.setFieldsValue({ teacherId: undefined });
      return;
    }

    const teacher = availableTeachers.find((t) => t.teacherId === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher);
      form.setFieldsValue({ teacherId: teacherId });
    } else {
      // Nếu không tìm thấy giáo viên, reset
      setSelectedTeacher(null);
      form.setFieldsValue({ teacherId: undefined });
    }
  };

  const handleDayChange = (values) => {
    setSelectedDays(values);
  };

  const handleViewTeacher = () => {
    if (selectedTeacher) {
      setIsModalVisible(true);
    }
  };

  const handleFormSubmit = (values) => {
    setFormValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setConfirmModalVisible(false);

      const selectedTeacher = availableTeachers.find(
        (t) => t.teacherId === formValues.teacherId
      );
      if (!selectedTeacher) {
        throw new Error("Không tìm thấy thông tin giáo viên");
      }

      const selectedMajor = majors.find(
        (m) => m.majorName === formValues.instrument
      );
      if (!selectedMajor) {
        throw new Error("Không tìm thấy thông tin nhạc cụ");
      }

      const bookingData = {
        learnerId: parseInt(userProfile?.id),
        teacherId: parseInt(formValues.teacherId),
        regisTypeId: 1,
        majorId: parseInt(selectedMajor.majorId),
        videoUrl: formValues.videoUrl || "",
        startDay: dayjs(formValues.startDay).format("YYYY-MM-DD"),
        timeStart: dayjs(formValues.bookingSlot).format("HH:mm:00"),
        timeLearning: parseInt(formValues.timeLearning),
        requestDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        numberOfSession: parseInt(formValues.numberOfSlots),
        learningRequest: formValues.learningRequest || "",
        selfAssessment: getLevelLabel(formValues.level) || "",
        learningDays: formValues.bookingDays.map((day) => parseInt(day)),
      };

      console.log("Sending booking data:", bookingData);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/create",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.isSucceed) {
        message.success("Đăng ký khóa học thành công!");
        const bookingInfo = {
          ...formValues,
          teacherName: selectedTeacher?.fullname,
          bookingId:
            response.data.data?.learningRegisId ||
            `BK${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: dayjs().format(),
          status: "pending",
          bookingDays: formValues.bookingDays
            .map((day) => days.find((d) => d.value === parseInt(day))?.label)
            .join(", "),
        };
        setBookingDetails(bookingInfo);
        setSuccessModalVisible(true);
      } else {
        // Xử lý trường hợp API trả về isSucceed: false
        if (response.data?.message?.includes("Schedule conflict detected")) {
          const conflictData = response.data.data;
          setErrorMessage(
            `Bạn đã đăng ký một buổi học từ ${conflictData.existingStart} đến ${conflictData.existingEnd} vào ngày này. Vui lòng chọn thời gian khác.`
          );
          setErrorModalVisible(true);
        } else {
          throw new Error(response.data?.message || "Đăng ký không thành công");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Xử lý lỗi từ axios error response
      if (
        error.response?.data?.message?.includes("Schedule conflict detected")
      ) {
        const conflictData = error.response.data.data;
        setErrorMessage(
          `Bạn đã đăng ký một buổi học từ ${conflictData.existingStart} đến ${conflictData.existingEnd} vào ngày này. Vui lòng chọn thời gian khác.`
        );
        setErrorModalVisible(true);
      } else {
        message.error({
          content: `Đăng ký thất bại: ${
            error.response?.data?.message ||
            error.message ||
            "Vui lòng kiểm tra lại thông tin"
          }`,
          duration: 5,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Chọn nhạc cụ & giáo viên",
      content: (
        <BookingForm
          form={form}
          majors={majors}
          days={days}
          sessionOptions={sessionOptions}
          selectedTeacher={selectedTeacher}
          setAvailableTeachers={setAvailableTeachers}
          availableTeachers={availableTeachers}
          handleInstrumentChange={handleInstrumentChange}
          handleTeacherChange={handleTeacherChange}
          handleDayChange={handleDayChange}
          handleViewTeacher={handleViewTeacher}
          handleSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          forceResetTeacherSelection={forceResetTeacherSelection}
        />
      ),
    },
  ];

  return (
    <Layout>
      <Content className="p-6 bg-gray-50">
        <Card className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Title level={2}>Đăng Ký Khóa Học 1-1</Title>
            <Text type="secondary">
              Học theo lịch riêng với giáo viên chất lượng cao
            </Text>
          </div>

          {userProfile && (
            <Card
              className="mb-6"
              bordered={false}
              style={{ background: "#f9f9f9" }}
            >
              <div className="flex items-center">
                <Avatar src={userProfile.avatar} size={64} className="mr-4" />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {userProfile.name}
                  </Title>
                  <div className="text-gray-500">{userProfile.email}</div>
                  <div className="text-gray-500">{userProfile.phoneNumber}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <span>ID Học viên: {userProfile.id}</span>
              </div>
            </Card>
          )}

          <Steps current={current} className="mb-8">
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          {steps[current].content}

          <Modal
            title={
              <div className="text-center">
                <CloseCircleOutlined className="text-red-500 text-3xl mb-3" />
                <div className="text-xl font-medium">Lỗi Đăng Ký</div>
              </div>
            }
            open={errorModalVisible}
            onCancel={() => setErrorModalVisible(false)}
            footer={[
              <Button
                key="back"
                type="primary"
                onClick={() => setErrorModalVisible(false)}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700"
              >
                Đã hiểu
              </Button>,
            ]}
            width={480}
            centered
            className="custom-modal"
          >
            <div className="py-4">
              <Result
                status="error"
                title="Trùng lịch học"
                subTitle={
                  <div className="text-center space-y-4 mt-4">
                    <div className="text-gray-600">{errorMessage}</div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center text-red-600 mb-2">
                        <ClockCircleOutlined className="mr-2" />
                        <span>Thời gian trùng lịch</span>
                      </div>
                      <div className="text-gray-600 pl-6">
                        {formValues?.bookingSlot && (
                          <div>
                            {dayjs(formValues.bookingSlot).format("HH:mm")} -{" "}
                            {dayjs(formValues.bookingSlot)
                              .add(formValues.timeLearning, "minutes")
                              .format("HH:mm")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-red-600 mt-3 mb-2">
                        <CalendarOutlined className="mr-2" />
                        <span>Ngày học</span>
                      </div>
                      <div className="text-gray-600 pl-6">
                        {formValues?.startDay &&
                          dayjs(formValues.startDay).format("DD/MM/YYYY")}
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </Modal>

          <Modal
            title="Xác nhận phí đăng ký"
            open={confirmModalVisible}
            onOk={handleConfirmSubmit}
            onCancel={() => setConfirmModalVisible(false)}
            okText="Đồng ý"
            cancelText="Hủy"
            confirmLoading={isSubmitting}
          >
            <div className="text-center py-4">
              <p className="text-lg mb-2">
                Bạn sẽ bị trừ{" "}
                <span className="text-red-500 font-bold">50,000 VNĐ</span> cho
                phí đăng ký
              </p>
              <p className="text-gray-600">
                Số tiền này sẽ được trừ vào tài khoản của bạn sau khi gửi đơn
                thành công
              </p>
            </div>
          </Modal>
        </Card>
      </Content>

      <TeacherModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        teacher={selectedTeacher}
        onViewProfile={(id) => {
          setIsModalVisible(false);
          navigate(`/teacher-profile/${id}`);
        }}
      />

      <SuccessModal
        visible={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          navigate("/");
        }}
        bookingDetails={bookingDetails}
      />
    </Layout>
  );
};

export default StudentBookingForm;
