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
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";

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
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Auth/Profile",
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
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Major/get-all"
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

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);

      if (!values.instrument || !values.teacherId) {
        throw new Error("Vui lòng chọn nhạc cụ và giáo viên");
      }

      const selectedTeacher = availableTeachers.find(
        (t) => t.teacherId === values.teacherId
      );
      if (!selectedTeacher) {
        throw new Error("Không tìm thấy thông tin giáo viên");
      }

      const selectedMajor = majors.find(
        (m) => m.majorName === values.instrument
      );
      if (!selectedMajor) {
        throw new Error("Không tìm thấy thông tin nhạc cụ");
      }

      const bookingData = {
        learnerId: parseInt(userProfile?.id),
        teacherId: parseInt(values.teacherId),
        regisTypeId: 1,
        majorId: parseInt(selectedMajor.majorId),
        videoUrl: values.videoUrl || "",
        startDay: dayjs(values.startDay).format("YYYY-MM-DD"),
        timeStart: dayjs(values.bookingSlot).format("HH:mm:00"),
        timeLearning: parseInt(values.timeLearning),
        requestDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        numberOfSession: parseInt(values.numberOfSlots),
        learningRequest: values.learningRequest || "",
        learningDays: values.bookingDays.map((day) => parseInt(day)),
      };

      console.log("Sending booking data:", bookingData);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LearningRegis/create",
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
          ...values,
          teacherName: selectedTeacher?.fullname,
          bookingId:
            response.data.data?.learningRegisId ||
            `BK${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: dayjs().format(),
          status: "pending",
          bookingDays: values.bookingDays
            .map((day) => days.find((d) => d.value === parseInt(day))?.label)
            .join(", "),
        };
        setBookingDetails(bookingInfo);
        setSuccessModalVisible(true);
      } else {
        console.error("API returned error:", response.data);
        throw new Error(response.data?.message || "Đăng ký không thành công");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      message.error({
        content: `Đăng ký thất bại: ${
          error.response?.data?.message ||
          error.message ||
          "Vui lòng kiểm tra lại thông tin"
        }`,
        duration: 5,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (values) => {
    setFormValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmModalVisible(false);
    await handleSubmit(formValues);
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
            title="Xác nhận phí đăng ký"
            open={confirmModalVisible}
            onOk={handleConfirmSubmit}
            onCancel={() => setConfirmModalVisible(false)}
            okText="Đồng ý"
            cancelText="Hủy"
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
