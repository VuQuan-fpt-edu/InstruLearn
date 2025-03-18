import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Select,
  Button,
  Steps,
  DatePicker,
  TimePicker,
  Radio,
  Upload,
  Divider,
  Tag,
  Modal,
  Typography,
  message,
  Space,
  Tooltip,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MusicNoteOutlined,
  VideoCameraOutlined,
  StarOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

// Giả lập danh sách giáo viên
const generateTeachers = () => {
  return [
    {
      id: 1,
      name: "Nguyễn Văn An",
      specialty: "Guitar",
      experience: "5 năm",
      rating: 4.9,
      students: 42,
      description:
        "Chuyên dạy Guitar Fingerstyle và Classic, tốt nghiệp Học viện Âm nhạc Quốc gia",
      image: "https://via.placeholder.com/150",
      availableDays: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 6", "Thứ 7"],
      availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
      price: "350.000đ / buổi",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      specialty: "Piano",
      experience: "8 năm",
      rating: 4.8,
      students: 56,
      description:
        "Giáo viên dạy Piano cổ điển và hiện đại, tốt nghiệp Conservatory of Music",
      image: "https://via.placeholder.com/150",
      availableDays: ["Thứ 2", "Thứ 4", "Thứ 5", "Thứ 7", "Chủ nhật"],
      availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
      price: "400.000đ / buổi",
    },
    {
      id: 3,
      name: "Lê Minh Cường",
      specialty: "Violin",
      experience: "7 năm",
      rating: 4.7,
      students: 38,
      description:
        "Giáo viên violin với phương pháp Suzuki, từng biểu diễn ở nhiều sân khấu quốc tế",
      image: "https://via.placeholder.com/150",
      availableDays: ["Thứ 3", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
      availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
      price: "380.000đ / buổi",
    },
    {
      id: 4,
      name: "Phạm Hoàng Dương",
      specialty: "Drums",
      experience: "6 năm",
      rating: 4.6,
      students: 45,
      description:
        "Chuyên dạy trống Jazz, Rock, và nhạc hiện đại. Thành viên ban nhạc underground",
      image: "https://via.placeholder.com/150",
      availableDays: ["Thứ 2", "Thứ 3", "Thứ 6", "Thứ 7", "Chủ nhật"],
      availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
      price: "350.000đ / buổi",
    },
    {
      id: 5,
      name: "Hoàng Thị Emilia",
      specialty: "Flute",
      experience: "9 năm",
      rating: 4.9,
      students: 32,
      description:
        "Giáo viên sáo từng đoạt giải quốc tế, chuyên dạy classical và nhạc phim",
      image: "https://via.placeholder.com/150",
      availableDays: ["Thứ 2", "Thứ 4", "Thứ 5", "Thứ 7"],
      availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
      price: "420.000đ / buổi",
    },
  ];
};

const StudentBookingForm = () => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const navigate = useNavigate();

  // Các nhạc cụ hỗ trợ
  const instruments = [
    "Guitar",
    "Piano",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
  ];

  // Các ngày trong tuần
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  // Các Thời gian học
  const timeSlots = ["45 Phút", "90 Phút", "135 Phút", "180 Phút"];

  // Cấp độ thành thạo
  const proficiencyLevels = ["Chưa biết gì", "1 tháng", "1 năm", "Hơn 1 năm"];

  useEffect(() => {
    // Giả lập lấy danh sách giáo viên từ API
    const fetchTeachers = () => {
      const teachersData = generateTeachers();
      setTeachers(teachersData);
    };

    // Giả lập lấy thông tin người dùng đã đăng nhập
    const fetchUserProfile = () => {
      // Trong thực tế, đây sẽ là một API call để lấy thông tin từ server
      const mockUserData = {
        id: 123456,
        name: "Trần Văn Học",
        email: "hoc.tran@example.com",
        phoneNumber: "0912345678",
        avatar: "https://via.placeholder.com/50",
        previousLessons: [
          {
            instrument: "Guitar",
            level: "1 tháng",
            teacherId: 1,
          },
        ],
      };

      setUserProfile(mockUserData);

      // Pre-fill form với thông tin người dùng
      form.setFieldsValue({
        studentName: mockUserData.name,
        studentEmail: mockUserData.email,
        phoneNumber: mockUserData.phoneNumber,
        // Nếu có thông tin khóa học trước đó, cũng có thể pre-fill
        instrument: mockUserData.previousLessons?.[0]?.instrument,
        proficiencyLevel: mockUserData.previousLessons?.[0]?.level,
      });

      // Nếu có instrument pre-filled, trigger change để lọc giáo viên
      if (mockUserData.previousLessons?.[0]?.instrument) {
        handleInstrumentChange(mockUserData.previousLessons[0].instrument);

        // Nếu có teacherId pre-filled
        if (mockUserData.previousLessons?.[0]?.teacherId) {
          setTimeout(() => {
            form.setFieldsValue({
              teacherId: mockUserData.previousLessons[0].teacherId,
            });
            handleTeacherChange(mockUserData.previousLessons[0].teacherId);
          }, 100);
        }
      }
    };

    fetchTeachers();
    fetchUserProfile();
  }, [form]);

  const handleInstrumentChange = (value) => {
    // Lọc giáo viên dạy nhạc cụ được chọn
    form.setFieldsValue({ teacherId: undefined });
    setSelectedTeacher(null);
  };

  const handleTeacherChange = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    setSelectedTeacher(teacher);
    setSelectedDays([]);

    // Reset các trường phụ thuộc vào giáo viên
    form.setFieldsValue({
      bookingDay: undefined,
      bookingSlot: undefined,
    });
  };

  const handleDayChange = (day) => {
    setSelectedDays([day]);

    // Reset giờ học
    form.setFieldsValue({ bookingSlot: undefined });
  };

  const handleViewTeacher = () => {
    if (selectedTeacher) {
      setIsModalVisible(true);
    }
  };

  const handleProficiencyChange = (value) => {
    // Chỉ yêu cầu video nếu không phải "Chưa biết gì"
    const requiresVideo = value !== "Chưa biết gì";
    form.validateFields(["videoUpload"]);
  };

  const next = () => {
    form.validateFields().then(() => {
      setCurrent(current + 1);
    });
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setIsSubmitting(true);

      // Giả lập gửi form
      setTimeout(() => {
        const teacher = teachers.find((t) => t.id === values.teacherId);

        // Tạo đối tượng thông tin đặt lịch
        const bookingInfo = {
          ...values,
          teacherName: teacher?.name,
          bookingId: `BK${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: dayjs().format(),
          status: "pending",
        };

        setBookingDetails(bookingInfo);
        setIsSubmitting(false);
        setSuccessModalVisible(true);
      }, 1500);
    });
  };

  const redirectToHome = () => {
    setSuccessModalVisible(false);
    // Giả lập chuyển hướng về trang chủ
    navigate("/");
  };

  const viewTeacherProfile = () => {
    // Giả lập chuyển hướng đến trang chi tiết giáo viên
    navigate(`/teacher-profile`);
  };

  const handleLogout = () => {
    // Xử lý đăng xuất
    message.success("Đăng xuất thành công");
    navigate("/login");
  };

  // Các bước trong form đặt lịch - đã bỏ bước đầu tiên vì đã có thông tin người dùng
  const steps = [
    {
      title: "Chọn nhạc cụ & giáo viên",
      content: (
        <div className="space-y-6">
          <Form.Item
            name="instrument"
            label="Nhạc cụ"
            rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
          >
            <Select
              placeholder="Chọn nhạc cụ bạn muốn học"
              onChange={handleInstrumentChange}
            >
              {instruments.map((instrument) => (
                <Option key={instrument} value={instrument}>
                  {instrument}
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
              <Link to={"/teacher-list"}>
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
              {teachers
                .filter(
                  (teacher) =>
                    !form.getFieldValue("instrument") ||
                    teacher.specialty === form.getFieldValue("instrument")
                )
                .map((teacher) => (
                  <Option key={teacher.id} value={teacher.id}>
                    <div className="flex items-center">
                      <Avatar src={teacher.image} size="small" />
                      <span className="ml-2">{teacher.name}</span>
                      <Tag color="blue" className="ml-2">
                        {teacher.specialty}
                      </Tag>
                      <span className="ml-2">
                        <StarOutlined /> {teacher.rating}
                      </span>
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
      ),
    },
    {
      title: "Lịch học & trình độ",
      content: (
        <div className="space-y-6">
          <Form.Item
            name="bookingDay"
            label="Ngày học trong tuần"
            rules={[{ required: true, message: "Vui lòng chọn ngày học" }]}
          >
            <Select
              placeholder="Chọn ngày học trong tuần"
              onChange={handleDayChange}
              disabled={!selectedTeacher}
            >
              {selectedTeacher?.availableDays.map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bookingSlot"
            label="Thời gian học"
            rules={[{ required: true, message: "Vui lòng chọn Thời gian học" }]}
          >
            <Select
              placeholder="Chọn Thời gian học"
              disabled={!selectedTeacher || selectedDays.length === 0}
            >
              {selectedTeacher?.availableSlots.map((slot) => (
                <Option key={slot} value={slot}>
                  {slot}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="numberOfSlots"
            label="Số buổi học đăng ký"
            rules={[{ required: true, message: "Vui lòng chọn số buổi học" }]}
          >
            <Select placeholder="Chọn số buổi học đăng ký">
              {[4, 8, 12, 16, 24].map((num) => (
                <Option key={num} value={num}>
                  {num} buổi
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="proficiencyLevel"
            label="Trình độ của bạn"
            rules={[
              { required: true, message: "Vui lòng chọn trình độ của bạn" },
            ]}
          >
            <Select
              placeholder="Chọn trình độ hiện tại của bạn"
              onChange={handleProficiencyChange}
            >
              {proficiencyLevels.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Yêu cầu bổ sung",
      content: (
        <div className="space-y-6">
          <Form.Item
            name="learningRequirements"
            label="Yêu cầu học tập"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập yêu cầu học tập của bạn",
              },
            ]}
          >
            <TextArea
              placeholder="Nhập những yêu cầu, mong muốn khi bạn học nhạc cụ này..."
              rows={4}
            />
          </Form.Item>

          {form.getFieldValue("proficiencyLevel") !== "Chưa biết gì" && (
            <Form.Item
              name="videoUpload"
              label="Video trình độ"
              tooltip="Tải lên video ngắn để giáo viên đánh giá trình độ của bạn"
              rules={[
                {
                  required: true,
                  message: "Vui lòng tải lên video trình độ",
                },
              ]}
            >
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  const isVideo = file.type.startsWith("video/");
                  if (!isVideo) {
                    message.error("Chỉ hỗ trợ tải lên file video!");
                  }
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Tải lên video</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item name="notes" label="Ghi chú khác">
            <TextArea
              placeholder="Thông tin khác bạn muốn chia sẻ với giáo viên..."
              rows={4}
            />
          </Form.Item>
        </div>
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
                {userProfile.previousLessons?.length > 0 && (
                  <Tag color="blue" className="ml-2">
                    Từng học {userProfile.previousLessons[0].instrument}
                  </Tag>
                )}
              </div>
            </Card>
          )}

          <Steps current={current} className="mb-8">
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
            initialValues={{
              numberOfSlots: 8,
              // Các giá trị từ userProfile sẽ được điền bởi useEffect
            }}
          >
            {/* Form fields người dùng vẫn được giữ trong form nhưng ẩn đi */}
            <div style={{ display: "none" }}>
              <Form.Item name="studentName" label="Họ và tên">
                <Input />
              </Form.Item>
              <Form.Item name="studentEmail" label="Email">
                <Input />
              </Form.Item>
              <Form.Item name="phoneNumber" label="Số điện thoại">
                <Input />
              </Form.Item>
            </div>

            <div className="steps-content p-4">{steps[current].content}</div>

            <div className="steps-action mt-8 flex justify-between">
              {current > 0 && <Button onClick={prev}>Quay lại</Button>}

              {current < steps.length - 1 && (
                <Button type="primary" onClick={next}>
                  Tiếp theo
                </Button>
              )}

              {current === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Hoàn tất đăng ký
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </Content>

      {/* Modal xem thông tin giáo viên */}
      <Modal
        title="Thông tin giáo viên"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="view-full"
            type="primary"
            onClick={() => {
              setIsModalVisible(false);
              viewTeacherProfile(selectedTeacher?.id);
            }}
          >
            Xem trang đầy đủ
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size={64} src={selectedTeacher.image} />
              <div>
                <div className="text-xl font-bold">{selectedTeacher.name}</div>
                <div className="text-blue-600 font-medium">
                  Chuyên môn: {selectedTeacher.specialty}
                </div>
              </div>
            </div>

            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Kinh nghiệm"
                  value={selectedTeacher.experience}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đánh giá"
                  value={selectedTeacher.rating}
                  prefix={<StarOutlined />}
                  suffix="/5"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Học viên"
                  value={selectedTeacher.students}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>

            <Divider />

            <div>
              <div className="font-medium mb-2">Giới thiệu:</div>
              <Paragraph>{selectedTeacher.description}</Paragraph>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal đăng ký thành công */}
      <Modal
        title={
          <div className="text-center">
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 32 }} />
            <div className="text-xl mt-2">Đăng ký thành công!</div>
          </div>
        }
        open={successModalVisible}
        onCancel={redirectToHome}
        footer={[
          <Button key="close" type="primary" onClick={redirectToHome}>
            Quay về trang chủ
          </Button>,
        ]}
        width={500}
      >
        {bookingDetails && (
          <div className="space-y-4 mt-4">
            <Paragraph>
              Yêu cầu đặt lịch học của bạn đã được gửi thành công. Chúng tôi sẽ
              liên hệ với bạn trong vòng 24 giờ để xác nhận lịch học.
            </Paragraph>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium mb-2">Thông tin đặt lịch:</div>
              <ul className="space-y-2">
                <li>
                  <strong>Mã đặt lịch:</strong> {bookingDetails.bookingId}
                </li>
                <li>
                  <strong>Nhạc cụ:</strong> {bookingDetails.instrument}
                </li>
                <li>
                  <strong>Giáo viên:</strong> {bookingDetails.teacherName}
                </li>
                <li>
                  <strong>Lịch học:</strong> {bookingDetails.bookingDay},{" "}
                  {bookingDetails.bookingSlot}
                </li>
                <li>
                  <strong>Số buổi:</strong> {bookingDetails.numberOfSlots} buổi
                </li>
              </ul>
            </div>

            <Paragraph>
              Vui lòng kiểm tra email để xác nhận thông tin đặt lịch. Nếu có bất
              kỳ thay đổi nào, hãy liên hệ với chúng tôi qua số điện thoại{" "}
              <a href="tel:19001234">1900 1234</a>.
            </Paragraph>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

// Thêm component Statistic thay vì sử dụng thư viện
const Statistic = ({ title, value, prefix, suffix }) => {
  return (
    <div className="text-center">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-medium mt-1">
        {prefix && <span className="mr-1">{prefix}</span>}
        {value}
        {suffix && <span className="ml-1">{suffix}</span>}
      </div>
    </div>
  );
};

export default StudentBookingForm;
