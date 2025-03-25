// import React, { useState, useEffect } from "react";
// import {
//   Layout,
//   Card,
//   Form,
//   Input,
//   Select,
//   Button,
//   Steps,
//   DatePicker,
//   TimePicker,
//   Radio,
//   Upload,
//   Divider,
//   Tag,
//   Modal,
//   Typography,
//   message,
//   Space,
//   Tooltip,
//   Avatar,
//   Row,
//   Col,
// } from "antd";
// import {
//   UserOutlined,
//   CalendarOutlined,
//   UploadOutlined,
//   InfoCircleOutlined,
//   CheckCircleOutlined,
//   ClockCircleOutlined,
//   MusicNoteOutlined,
//   VideoCameraOutlined,
//   StarOutlined,
//   PushpinOutlined,
//   SafetyCertificateOutlined,
// } from "@ant-design/icons";
// import { Link, useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import axios from "axios";

// const { Header, Content, Footer } = Layout;
// const { Title, Paragraph, Text } = Typography;
// const { Option } = Select;
// const { TextArea } = Input;
// const { Step } = Steps;

// // Giả lập danh sách giáo viên
// const generateTeachers = () => {
//   return [
//     {
//       id: 1,
//       name: "Nguyễn Văn An",
//       specialty: "Guitar",
//       experience: "5 năm",
//       rating: 4.9,
//       students: 42,
//       description:
//         "Chuyên dạy Guitar Fingerstyle và Classic, tốt nghiệp Học viện Âm nhạc Quốc gia",
//       image: "https://via.placeholder.com/150",
//       availableDays: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 6", "Thứ 7"],
//       availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
//       price: "350.000đ / buổi",
//     },
//     {
//       id: 2,
//       name: "Trần Thị Bình",
//       specialty: "Piano",
//       experience: "8 năm",
//       rating: 4.8,
//       students: 56,
//       description:
//         "Giáo viên dạy Piano cổ điển và hiện đại, tốt nghiệp Conservatory of Music",
//       image: "https://via.placeholder.com/150",
//       availableDays: ["Thứ 2", "Thứ 4", "Thứ 5", "Thứ 7", "Chủ nhật"],
//       availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
//       price: "400.000đ / buổi",
//     },
//     {
//       id: 3,
//       name: "Lê Minh Cường",
//       specialty: "Violin",
//       experience: "7 năm",
//       rating: 4.7,
//       students: 38,
//       description:
//         "Giáo viên violin với phương pháp Suzuki, từng biểu diễn ở nhiều sân khấu quốc tế",
//       image: "https://via.placeholder.com/150",
//       availableDays: ["Thứ 3", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
//       availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
//       price: "380.000đ / buổi",
//     },
//     {
//       id: 4,
//       name: "Phạm Hoàng Dương",
//       specialty: "Drums",
//       experience: "6 năm",
//       rating: 4.6,
//       students: 45,
//       description:
//         "Chuyên dạy trống Jazz, Rock, và nhạc hiện đại. Thành viên ban nhạc underground",
//       image: "https://via.placeholder.com/150",
//       availableDays: ["Thứ 2", "Thứ 3", "Thứ 6", "Thứ 7", "Chủ nhật"],
//       availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
//       price: "350.000đ / buổi",
//     },
//     {
//       id: 5,
//       name: "Hoàng Thị Emilia",
//       specialty: "Flute",
//       experience: "9 năm",
//       rating: 4.9,
//       students: 32,
//       description:
//         "Giáo viên sáo từng đoạt giải quốc tế, chuyên dạy classical và nhạc phim",
//       image: "https://via.placeholder.com/150",
//       availableDays: ["Thứ 2", "Thứ 4", "Thứ 5", "Thứ 7"],
//       availableSlots: ["45 Phút", "90 Phút", "135 Phút", "180 Phút"],
//       price: "420.000đ / buổi",
//     },
//   ];
// };

// const StudentBookingForm = () => {
//   const [form] = Form.useForm();
//   const [current, setCurrent] = useState(0);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [teachers, setTeachers] = useState([]);
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedDays, setSelectedDays] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [successModalVisible, setSuccessModalVisible] = useState(false);
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [majors, setMajors] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   // Các nhạc cụ hỗ trợ
//   const instruments = [
//     "Guitar",
//     "Piano",
//     "Violin",
//     "Drums",
//     "Flute",
//     "Saxophone",
//   ];

//   // Các ngày trong tuần
//   const days = [
//     { value: 0, label: "Chủ nhật" },
//     { value: 1, label: "Thứ 2" },
//     { value: 2, label: "Thứ 3" },
//     { value: 3, label: "Thứ 4" },
//     { value: 4, label: "Thứ 5" },
//     { value: 5, label: "Thứ 6" },
//     { value: 6, label: "Thứ 7" },
//   ];

//   // Số buổi học
//   const sessionOptions = Array.from({ length: 16 }, (_, i) => i + 5);

//   useEffect(() => {
//     // Lấy danh sách giáo viên từ API thực tế
//     const fetchTeachers = async () => {
//       try {
//         const response = await axios.get(
//           "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/get-all"
//         );
//         if (response.data && Array.isArray(response.data)) {
//           // Lưu trữ toàn bộ danh sách giáo viên
//           const allTeachers = response.data
//             .filter((item) => item.isSucceed)
//             .map((item) => item.data);
//           setTeachers(allTeachers);
//         } else {
//           throw new Error("Dữ liệu không hợp lệ");
//         }
//       } catch (error) {
//         console.error("Error fetching teachers:", error);
//         message.error("Không thể tải danh sách giáo viên!");
//       }
//     };

//     // Lấy thông tin người dùng từ API
//     const fetchUserProfile = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         if (!token) {
//           throw new Error("Bạn chưa đăng nhập");
//         }

//         setLoading(true);
//         const response = await axios.get(
//           "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Auth/Profile",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.data?.isSucceed) {
//           const userData = response.data.data;
//           // Lưu username vào localStorage nếu có
//           if (userData.username) {
//             localStorage.setItem("username", userData.username);
//           }

//           setUserProfile({
//             id: userData.learnerId,
//             name: userData.fullname,
//             email: userData.email,
//             username: userData.username,
//             phoneNumber: userData.phoneNumber,
//             avatar: "https://via.placeholder.com/50", // Mặc định avatar
//           });

//           // Pre-fill form với thông tin người dùng
//           form.setFieldsValue({
//             studentName: userData.fullname,
//             studentEmail: userData.email,
//             phoneNumber: userData.phoneNumber,
//           });
//         } else {
//           throw new Error(
//             response.data?.message || "Không thể lấy thông tin người dùng"
//           );
//         }
//       } catch (err) {
//         console.error("Error fetching user profile:", err);
//         message.error(err.message || "Không thể tải thông tin người dùng!");
//         navigate("/login");
//       }
//     };

//     fetchTeachers();
//     fetchUserProfile();
//     fetchMajors();
//   }, [form, navigate]);

//   const fetchMajors = async () => {
//     try {
//       const response = await axios.get(
//         "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Major/get-all"
//       );
//       if (response.data?.isSucceed) {
//         setMajors(response.data.data);
//       }
//     } catch (error) {
//       message.error("Không thể tải danh sách nhạc cụ");
//       console.error("Error fetching majors:", error);
//     }
//   };

//   const handleInstrumentChange = (value) => {
//     // Lọc giáo viên dạy nhạc cụ được chọn
//     const selectedMajor = majors.find((m) => m.majorName === value);
//     if (selectedMajor) {
//       // Lọc danh sách giáo viên có majorId tương ứng
//       const filtered = teachers.filter(
//         (teacher) => teacher.major?.majorId === selectedMajor.majorId
//       );
//       setFilteredTeachers(filtered);
//     }
//     // Reset giá trị giáo viên đã chọn
//     form.setFieldsValue({ teacherId: undefined });
//     setSelectedTeacher(null);
//   };

//   const handleTeacherChange = (teacherId) => {
//     if (!teacherId) {
//       setSelectedTeacher(null);
//       form.setFieldsValue({ teacherId: undefined });
//       return;
//     }

//     const teacher = teachers.find((t) => t.teacherId === teacherId);
//     if (teacher) {
//       setSelectedTeacher(teacher);
//       form.setFieldsValue({ teacherId: teacherId });
//       setSelectedDays([]);
//       // Reset các trường phụ thuộc vào giáo viên
//       form.setFieldsValue({
//         bookingDays: [],
//         bookingSlot: undefined,
//       });
//     }
//   };

//   const handleDayChange = (values) => {
//     setSelectedDays(values);
//   };

//   const handleViewTeacher = () => {
//     if (selectedTeacher) {
//       setIsModalVisible(true);
//     }
//   };

//   const next = async () => {
//     try {
//       if (current === 0) {
//         const values = await form.validateFields(["instrument", "teacherId"]);
//         if (!values.instrument || !values.teacherId) {
//           throw new Error("Vui lòng chọn nhạc cụ và giáo viên");
//         }
//       } else {
//         const values = await form.validateFields([
//           "bookingDays",
//           "bookingSlot",
//           "numberOfSlots",
//           "videoUpload",
//         ]);
//         if (!values.bookingDays?.length) {
//           throw new Error("Vui lòng chọn ít nhất một ngày học");
//         }
//       }
//       setCurrent(current + 1);
//     } catch (error) {
//       console.error("Form validation error:", error);
//       if (error.errorFields) {
//         error.errorFields.forEach((field) => {
//           message.error(field.errors[0]);
//         });
//       } else {
//         message.error(
//           error.message || "Vui lòng điền đầy đủ thông tin bắt buộc"
//         );
//       }
//     }
//   };

//   const prev = () => {
//     setCurrent(current - 1);
//   };

//   const handleSubmit = async () => {
//     try {
//       const values = await form.validateFields();
//       setIsSubmitting(true);

//       console.log("Form values:", values);

//       // Kiểm tra nhạc cụ và giáo viên đã được chọn chưa
//       if (!values.instrument || !values.teacherId) {
//         throw new Error("Vui lòng chọn nhạc cụ và giáo viên");
//       }

//       // Lấy thông tin từ form
//       const selectedTeacher = teachers.find(
//         (t) => t.teacherId === values.teacherId
//       );
//       console.log("Selected teacher:", selectedTeacher);

//       if (!selectedTeacher) {
//         throw new Error("Không tìm thấy thông tin giáo viên");
//       }

//       const selectedMajor = majors.find(
//         (m) => m.majorName === values.instrument
//       );
//       console.log("Selected major:", selectedMajor);

//       if (!selectedMajor) {
//         throw new Error("Không tìm thấy thông tin nhạc cụ");
//       }

//       // Kiểm tra video đã upload chưa
//       if (
//         !values.videoUpload ||
//         !values.videoUpload.fileList ||
//         values.videoUpload.fileList.length === 0
//       ) {
//         throw new Error("Vui lòng tải lên video trình độ");
//       }

//       // Format lại dữ liệu theo yêu cầu API
//       const bookingData = {
//         learnerId: parseInt(userProfile?.id),
//         teacherId: parseInt(values.teacherId),
//         regisTypeId: 1,
//         majorId: parseInt(selectedMajor.majorId),
//         videoUrl: values.videoUpload.fileList[0]?.name || "",
//         timeStart: dayjs(values.bookingSlot).format("HH:mm:00"),
//         requestDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
//         numberOfSession: parseInt(values.numberOfSlots),
//         learningDays: values.bookingDays.map((day) => parseInt(day)),
//       };

//       console.log("Booking data to be sent:", bookingData);

//       // Kiểm tra dữ liệu trước khi gửi
//       if (
//         !bookingData.learnerId ||
//         !bookingData.teacherId ||
//         !bookingData.majorId
//       ) {
//         throw new Error("Thiếu thông tin cần thiết để đăng ký");
//       }

//       const token = localStorage.getItem("authToken");
//       // Gọi API đăng ký với token xác thực
//       const response = await axios.post(
//         "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/LearningRegis/create",
//         bookingData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data?.isSucceed) {
//         message.success("Đăng ký khóa học thành công!");

//         // Tạo đối tượng thông tin đặt lịch để hiển thị
//         const bookingInfo = {
//           ...values,
//           teacherName: selectedTeacher?.fullname,
//           bookingId:
//             response.data.data?.regisId ||
//             `BK${Math.floor(1000 + Math.random() * 9000)}`,
//           createdAt: dayjs().format(),
//           status: "pending",
//           bookingDays: values.bookingDays
//             .map((day) => days.find((d) => d.value === parseInt(day))?.label)
//             .join(", "),
//         };

//         setBookingDetails(bookingInfo);
//         setSuccessModalVisible(true);
//       } else {
//         throw new Error(response.data?.message || "Đăng ký không thành công");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       message.error({
//         content: `Đăng ký thất bại: ${
//           error.response?.data?.message ||
//           error.message ||
//           "Vui lòng kiểm tra lại thông tin"
//         }`,
//         duration: 5,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const redirectToHome = () => {
//     setSuccessModalVisible(false);
//     // Giả lập chuyển hướng về trang chủ
//     navigate("/");
//   };

//   const viewTeacherProfile = () => {
//     // Giả lập chuyển hướng đến trang chi tiết giáo viên
//     navigate(`/teacher-profile`);
//   };

//   const handleLogout = () => {
//     // Xử lý đăng xuất
//     message.success("Đăng xuất thành công");
//     navigate("/login");
//   };

//   // Các bước trong form đặt lịch - đã bỏ bước đầu tiên vì đã có thông tin người dùng
//   const steps = [
//     {
//       title: "Chọn nhạc cụ & giáo viên",
//       content: (
//         <div className="space-y-6">
//           <Form.Item
//             name="instrument"
//             label="Nhạc cụ"
//             rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
//           >
//             <Select
//               placeholder="Chọn nhạc cụ bạn muốn học"
//               onChange={handleInstrumentChange}
//             >
//               {majors.map((major) => (
//                 <Option key={major.majorId} value={major.majorName}>
//                   {major.majorName}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="teacherId"
//             label="Giáo viên"
//             rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
//           >
//             <div className="mb-4">
//               <Link to={"/teacher-list"}>
//                 <Button type="primary" ghost icon={<InfoCircleOutlined />}>
//                   Danh sách giáo viên
//                 </Button>
//               </Link>
//             </div>

//             <Select
//               placeholder="Chọn giáo viên dạy cho bạn"
//               onChange={handleTeacherChange}
//               disabled={!form.getFieldValue("instrument")}
//             >
//               {filteredTeachers.map((teacher) => (
//                 <Option key={teacher.teacherId} value={teacher.teacherId}>
//                   <div className="flex items-center">
//                     <Avatar icon={<UserOutlined />} size="small" />
//                     <span className="ml-2">{teacher.fullname}</span>
//                     {teacher.heading && (
//                       <Tag color="blue" className="ml-2">
//                         {teacher.heading}
//                       </Tag>
//                     )}
//                   </div>
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           {selectedTeacher && (
//             <div className="mt-4">
//               <Button
//                 type="primary"
//                 ghost
//                 icon={<InfoCircleOutlined />}
//                 onClick={handleViewTeacher}
//               >
//                 Xem thông tin giáo viên
//               </Button>
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       title: "Lịch học & Video",
//       content: (
//         <div className="space-y-6">
//           <Form.Item
//             name="bookingDays"
//             label="Ngày học trong tuần"
//             rules={[
//               { required: true, message: "Vui lòng chọn ít nhất một ngày học" },
//             ]}
//           >
//             <Select
//               mode="multiple"
//               placeholder="Chọn các ngày học trong tuần"
//               onChange={handleDayChange}
//               disabled={!selectedTeacher}
//             >
//               {days.map((day) => (
//                 <Option key={day.value} value={day.value}>
//                   {day.label}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="bookingSlot"
//             label="Giờ học"
//             rules={[
//               {
//                 required: true,
//                 message: "Vui lòng chọn giờ học",
//               },
//             ]}
//           >
//             <TimePicker
//               format="HH:mm"
//               placeholder="Chọn giờ học"
//               minuteStep={30}
//               disabledTime={() => ({
//                 disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 22, 23],
//               })}
//               hideDisabledOptions={true}
//               style={{ width: "100%" }}
//             />
//           </Form.Item>

//           <Form.Item
//             name="numberOfSlots"
//             label="Số buổi học đăng ký"
//             rules={[{ required: true, message: "Vui lòng chọn số buổi học" }]}
//           >
//             <Select placeholder="Chọn số buổi học đăng ký">
//               {sessionOptions.map((num) => (
//                 <Option key={num} value={num}>
//                   {num} buổi
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="videoUpload"
//             label="Video trình độ"
//             tooltip="Tải lên video ngắn để giáo viên đánh giá trình độ của bạn"
//             rules={[
//               {
//                 required: true,
//                 message: "Vui lòng tải lên video trình độ",
//               },
//             ]}
//           >
//             <Upload
//               maxCount={1}
//               beforeUpload={(file) => {
//                 const isVideo = file.type.startsWith("video/");
//                 if (!isVideo) {
//                   message.error("Chỉ hỗ trợ tải lên file video!");
//                 }
//                 return false;
//               }}
//             >
//               <Button icon={<UploadOutlined />}>Tải lên video</Button>
//             </Upload>
//           </Form.Item>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Layout>
//       <Content className="p-6 bg-gray-50">
//         <Card className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <Title level={2}>Đăng Ký Khóa Học 1-1</Title>
//             <Text type="secondary">
//               Học theo lịch riêng với giáo viên chất lượng cao
//             </Text>
//           </div>

//           {userProfile && (
//             <Card
//               className="mb-6"
//               bordered={false}
//               style={{ background: "#f9f9f9" }}
//             >
//               <div className="flex items-center">
//                 <Avatar src={userProfile.avatar} size={64} className="mr-4" />
//                 <div>
//                   <Title level={4} style={{ margin: 0 }}>
//                     {userProfile.name}
//                   </Title>
//                   <div className="text-gray-500">{userProfile.email}</div>
//                   <div className="text-gray-500">{userProfile.phoneNumber}</div>
//                 </div>
//               </div>
//               <div className="mt-2 text-sm text-gray-700">
//                 <span>ID Học viên: {userProfile.id}</span>
//               </div>
//             </Card>
//           )}

//           <Steps current={current} className="mb-8">
//             {steps.map((item) => (
//               <Step key={item.title} title={item.title} />
//             ))}
//           </Steps>

//           <Form
//             form={form}
//             layout="vertical"
//             requiredMark="optional"
//             initialValues={{
//               numberOfSlots: 8,
//             }}
//             onFinish={handleSubmit}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Cột trái */}
//               <div>
//                 <Form.Item
//                   name="instrument"
//                   label="Nhạc cụ"
//                   rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
//                 >
//                   <Select
//                     placeholder="Chọn nhạc cụ bạn muốn học"
//                     onChange={handleInstrumentChange}
//                   >
//                     {majors.map((major) => (
//                       <Option key={major.majorId} value={major.majorName}>
//                         {major.majorName}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>

//                 <Form.Item
//                   name="teacherId"
//                   label="Giáo viên"
//                   rules={[
//                     { required: true, message: "Vui lòng chọn giáo viên" },
//                   ]}
//                 >
//                   <div className="mb-4">
//                     <Link to={"/teacher-list"}>
//                       <Button
//                         type="primary"
//                         ghost
//                         icon={<InfoCircleOutlined />}
//                       >
//                         Danh sách giáo viên
//                       </Button>
//                     </Link>
//                   </div>

//                   <Select
//                     placeholder="Chọn giáo viên dạy cho bạn"
//                     onChange={handleTeacherChange}
//                     disabled={!form.getFieldValue("instrument")}
//                   >
//                     {filteredTeachers.map((teacher) => (
//                       <Option key={teacher.teacherId} value={teacher.teacherId}>
//                         <div className="flex items-center">
//                           <Avatar icon={<UserOutlined />} size="small" />
//                           <span className="ml-2">{teacher.fullname}</span>
//                           {teacher.heading && (
//                             <Tag color="blue" className="ml-2">
//                               {teacher.heading}
//                             </Tag>
//                           )}
//                         </div>
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>

//                 {selectedTeacher && (
//                   <div className="mt-4 mb-6">
//                     <Button
//                       type="primary"
//                       ghost
//                       icon={<InfoCircleOutlined />}
//                       onClick={handleViewTeacher}
//                     >
//                       Xem thông tin giáo viên
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Cột phải */}
//               <div>
//                 <Form.Item
//                   name="bookingDays"
//                   label="Ngày học trong tuần"
//                   rules={[
//                     {
//                       required: true,
//                       message: "Vui lòng chọn ít nhất một ngày học",
//                     },
//                   ]}
//                 >
//                   <Select
//                     mode="multiple"
//                     placeholder="Chọn các ngày học trong tuần"
//                     onChange={handleDayChange}
//                     disabled={!selectedTeacher}
//                   >
//                     {days.map((day) => (
//                       <Option key={day.value} value={day.value}>
//                         {day.label}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>

//                 <Form.Item
//                   name="bookingSlot"
//                   label="Giờ học"
//                   rules={[
//                     {
//                       required: true,
//                       message: "Vui lòng chọn giờ học",
//                     },
//                   ]}
//                 >
//                   <TimePicker
//                     format="HH:mm"
//                     placeholder="Chọn giờ học"
//                     minuteStep={30}
//                     disabledTime={() => ({
//                       disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 22, 23],
//                     })}
//                     hideDisabledOptions={true}
//                     style={{ width: "100%" }}
//                   />
//                 </Form.Item>

//                 <Form.Item
//                   name="numberOfSlots"
//                   label="Số buổi học đăng ký"
//                   rules={[
//                     { required: true, message: "Vui lòng chọn số buổi học" },
//                   ]}
//                 >
//                   <Select placeholder="Chọn số buổi học đăng ký">
//                     {sessionOptions.map((num) => (
//                       <Option key={num} value={num}>
//                         {num} buổi
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>

//                 <Form.Item
//                   name="videoUpload"
//                   label="Video trình độ"
//                   tooltip="Tải lên video ngắn để giáo viên đánh giá trình độ của bạn"
//                   rules={[
//                     {
//                       required: true,
//                       message: "Vui lòng tải lên video trình độ",
//                     },
//                   ]}
//                 >
//                   <Upload
//                     maxCount={1}
//                     beforeUpload={(file) => {
//                       const isVideo = file.type.startsWith("video/");
//                       if (!isVideo) {
//                         message.error("Chỉ hỗ trợ tải lên file video!");
//                       }
//                       return false;
//                     }}
//                   >
//                     <Button icon={<UploadOutlined />}>Tải lên video</Button>
//                   </Upload>
//                 </Form.Item>
//               </div>
//             </div>

//             <div className="mt-8 flex justify-center">
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={isSubmitting}
//                 size="large"
//               >
//                 Hoàn tất đăng ký
//               </Button>
//             </div>
//           </Form>
//         </Card>
//       </Content>

//       {/* Modal xem thông tin giáo viên */}
//       <Modal
//         title="Thông tin giáo viên"
//         open={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={[
//           <Button
//             key="view-full"
//             type="primary"
//             onClick={() => {
//               setIsModalVisible(false);
//               viewTeacherProfile(selectedTeacher?.teacherId);
//             }}
//           >
//             Xem trang đầy đủ
//           </Button>,
//           <Button key="close" onClick={() => setIsModalVisible(false)}>
//             Đóng
//           </Button>,
//         ]}
//         width={600}
//       >
//         {selectedTeacher && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-4">
//               <Avatar
//                 size={64}
//                 src={selectedTeacher.image || "https://via.placeholder.com/150"}
//               />
//               <div>
//                 <div className="text-xl font-bold">{selectedTeacher.name}</div>
//                 <div className="text-blue-600 font-medium">
//                   Chuyên môn: {selectedTeacher.specialty}
//                 </div>
//               </div>
//             </div>

//             <Divider />

//             <Row gutter={16}>
//               <Col span={8}>
//                 <Statistic
//                   title="Kinh nghiệm"
//                   value={selectedTeacher.experience || "Chưa cập nhật"}
//                   prefix={<ClockCircleOutlined />}
//                 />
//               </Col>
//               <Col span={8}>
//                 <Statistic
//                   title="Đánh giá"
//                   value={selectedTeacher.rating || "N/A"}
//                   prefix={<StarOutlined />}
//                   suffix="/5"
//                 />
//               </Col>
//               <Col span={8}>
//                 <Statistic
//                   title="Học viên"
//                   value={selectedTeacher.students || 0}
//                   prefix={<UserOutlined />}
//                 />
//               </Col>
//             </Row>

//             <Divider />

//             <div>
//               <div className="font-medium mb-2">Giới thiệu:</div>
//               <Paragraph>
//                 {selectedTeacher.description || "Chưa có thông tin giới thiệu"}
//               </Paragraph>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Modal đăng ký thành công */}
//       <Modal
//         title={
//           <div className="text-center">
//             <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 32 }} />
//             <div className="text-xl mt-2">Đăng ký thành công!</div>
//           </div>
//         }
//         open={successModalVisible}
//         onCancel={redirectToHome}
//         footer={[
//           <Button key="close" type="primary" onClick={redirectToHome}>
//             Quay về trang chủ
//           </Button>,
//         ]}
//         width={500}
//       >
//         {bookingDetails && (
//           <div className="space-y-4 mt-4">
//             <Paragraph>
//               Yêu cầu đặt lịch học của bạn đã được gửi thành công. Chúng tôi sẽ
//               liên hệ với bạn trong vòng 24 giờ để xác nhận lịch học.
//             </Paragraph>

//             <div className="bg-blue-50 p-4 rounded-lg">
//               <div className="font-medium mb-2">Thông tin đặt lịch:</div>
//               <ul className="space-y-2">
//                 <li>
//                   <strong>Mã đặt lịch:</strong> {bookingDetails.bookingId}
//                 </li>
//                 <li>
//                   <strong>Nhạc cụ:</strong> {bookingDetails.instrument}
//                 </li>
//                 <li>
//                   <strong>Giáo viên:</strong> {bookingDetails.teacherName}
//                 </li>
//                 <li>
//                   <strong>Lịch học:</strong> {bookingDetails.bookingDays}
//                 </li>
//                 <li>
//                   <strong>Thời gian:</strong>{" "}
//                   {dayjs(bookingDetails.bookingSlot).format("HH:mm")} giờ
//                 </li>
//                 <li>
//                   <strong>Số buổi:</strong> {bookingDetails.numberOfSlots} buổi
//                 </li>
//               </ul>
//             </div>

//             <Paragraph>
//               Vui lòng kiểm tra email để xác nhận thông tin đặt lịch. Nếu có bất
//               kỳ thay đổi nào, hãy liên hệ với chúng tôi qua số điện thoại{" "}
//               <a href="tel:19001234">1900 1234</a>.
//             </Paragraph>
//           </div>
//         )}
//       </Modal>
//     </Layout>
//   );
// };

// // Thêm component Statistic thay vì sử dụng thư viện
// const Statistic = ({ title, value, prefix, suffix }) => {
//   return (
//     <div className="text-center">
//       <div className="text-gray-500 text-sm">{title}</div>
//       <div className="text-xl font-medium mt-1">
//         {prefix && <span className="mr-1">{prefix}</span>}
//         {value}
//         {suffix && <span className="ml-1">{suffix}</span>}
//       </div>
//     </div>
//   );
// };

// export default StudentBookingForm;
