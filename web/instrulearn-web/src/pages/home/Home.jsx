import {
  Card,
  Rate,
  Tag,
  Input,
  Button,
  Badge,
  Modal,
  Divider,
  Alert,
} from "antd";
import {
  SoundOutlined,
  PlayCircleFilled,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FormOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import { message } from "antd";
import axios from "axios";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openClasses, setOpenClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [
    isInsufficientBalanceModalVisible,
    setIsInsufficientBalanceModalVisible,
  ] = useState(false);
  const [isLoginWarningModalVisible, setIsLoginWarningModalVisible] =
    useState(false);
  const [isProfileUpdateModalVisible, setIsProfileUpdateModalVisible] =
    useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Course/get-all"
      );
      const data = await response.json();
      const processedCourses = data
        .filter((course) => course.status === 1)
        .map((course) => ({
          courseId: course.coursePackageId,
          courseName: course.courseName,
          typeName: course.courseTypeName,
          description: course.courseDescription,
          headline: course.headline,
          rating: course.rating,
          price: course.price,
          discount: course.discount,
          imageUrl:
            course.imageUrl || "https://placehold.co/600x400?text=No+Image",
        }));
      setCourses(processedCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải danh sách khóa học");
      setLoading(false);
    }
  };

  const fetchOpenClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await fetch(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Class/get-all"
      );
      const data = await response.json();

      // Xử lý dữ liệu mới từ API
      const processedClasses = data.map((classItem) => ({
        ...classItem,
        coursePackageName: classItem.majorName, // Sử dụng majorName thay vì coursePackageName
        students: classItem.students || [], // Đảm bảo có mảng students
      }));

      setOpenClasses(processedClasses);
      if (userProfile?.learnerId) {
        processedClasses.forEach((classItem) => {
          const isJoined = classItem.students?.some(
            (student) => student.learnerId === userProfile.learnerId
          );
          if (isJoined) {
            classItem.hasJoined = true;
          }
        });
      }
    } catch (error) {
      console.error("Error fetching open classes:", error);
      message.error("Không thể tải danh sách lớp học");
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchWalletBalance = async (learnerId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/wallet/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setWalletBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchCourses(), fetchOpenClasses()]);
  };

  const checkUserProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        const profileData = response.data.data;
        setUserProfile(profileData);

        // Kiểm tra thông tin địa chỉ và số điện thoại
        if (!profileData.address || !profileData.phoneNumber) {
          setIsProfileUpdateModalVisible(true);
        }
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
    }
  };

  useEffect(() => {
    fetchData();
    checkUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchOpenClasses();
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedClass && userProfile) {
      const isJoined = selectedClass.students?.some(
        (student) => student.learnerId === userProfile.learnerId
      );
      setHasJoined(isJoined);
    }
  }, [selectedClass, userProfile]);

  useEffect(() => {
    if (userProfile?.learnerId) {
      fetchWalletBalance(userProfile.learnerId);
    }
  }, [userProfile]);

  const coursesByType = courses.reduce((acc, course) => {
    if (!acc[course.typeName]) {
      acc[course.typeName] = [];
    }
    acc[course.typeName].push(course);
    return acc;
  }, {});

  const formatClassDays = (classDays) => {
    if (!classDays) return "";
    return classDays
      .map((day) => {
        switch (day.day) {
          case "Sunday":
            return "Chủ nhật";
          case "Monday":
            return "Thứ 2";
          case "Tuesday":
            return "Thứ 3";
          case "Wednesday":
            return "Thứ 4";
          case "Thursday":
            return "Thứ 5";
          case "Friday":
            return "Thứ 6";
          case "Saturday":
            return "Thứ 7";
          default:
            return day.day;
        }
      })
      .join(", ");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace(/\s₫/, " đ");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "blue";
      case 1:
        return "green";
      case 2:
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Đang mở lớp";
      case 1:
        return "Đang diễn ra";
      case 2:
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      review: "Khoá học rất tuyệt vời! Tôi đã học được rất nhiều kỹ năng mới.",
      rating: 5,
    },
    {
      name: "Trần Thị B",
      review: "Giáo viên tận tâm, nội dung dễ hiểu. Rất đáng giá!",
      rating: 4.5,
    },
  ];

  const handleBookingClick = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsLoginWarningModalVisible(true);
      return;
    }

    // Kiểm tra thông tin địa chỉ và số điện thoại
    if (!userProfile?.address || !userProfile?.phoneNumber) {
      setIsProfileUpdateModalVisible(true);
      return;
    }

    // Cập nhật số dư ví trước khi kiểm tra
    if (userProfile?.learnerId) {
      fetchWalletBalance(userProfile.learnerId).then(() => {
        // Kiểm tra số dư ví sau khi đã cập nhật
        const requiredBalance = 50000;
        if (walletBalance < requiredBalance) {
          setIsInsufficientBalanceModalVisible(true);
        } else {
          setIsConfirmModalVisible(true);
        }
      });
    }
  };

  const handleConfirmBooking = () => {
    setIsConfirmModalVisible(false);
    if (walletBalance >= 50000) {
      navigate("/booking1-1");
    } else {
      setIsInsufficientBalanceModalVisible(true);
    }
  };

  const handleNavigateToWallet = () => {
    setIsInsufficientBalanceModalVisible(false);
    navigate("/profile/topup");
  };

  const handleEnrollClass = (classItem) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      Modal.warning({
        title: (
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              Vui lòng đăng nhập
            </div>
            <div className="text-gray-500">
              Bạn cần đăng nhập để đăng ký học theo yêu cầu
            </div>
          </div>
        ),
        content: (
          <div className="text-center py-4">
            <div className="bg-yellow-50 rounded-lg p-6 mb-4">
              <div className="text-lg text-yellow-700 mb-2">
                Để đăng ký học theo yêu cầu, bạn cần:
              </div>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Đăng nhập vào tài khoản của bạn
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Có đủ số dư trong ví
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Xác nhận thông tin đăng ký
                </li>
              </ul>
            </div>
          </div>
        ),
        okText: "Đăng nhập ngay",
        cancelText: "Hủy",
        onOk: () => navigate("/login"),
        okButtonProps: { className: "bg-purple-600 hover:bg-purple-700" },
        width: 500,
        centered: true,
        maskClosable: false,
      });
      return;
    }

    // Kiểm tra xem học viên đã tham gia lớp chưa
    const isJoined = classItem.students?.some(
      (student) => student.learnerId === userProfile?.learnerId
    );

    if (isJoined) {
      message.info("Bạn đã tham gia lớp học này");
      return;
    }

    setSelectedClass(classItem);
    const depositAmount = classItem.price * 0.1; // 10% học phí

    // Cập nhật số dư ví trước khi kiểm tra
    if (userProfile?.learnerId) {
      fetchWalletBalance(userProfile.learnerId).then(() => {
        // Kiểm tra số dư ví sau khi đã cập nhật
        if (walletBalance < depositAmount) {
          setIsInsufficientBalanceModalVisible(true);
        } else {
          setIsConfirmModalVisible(true);
        }
      });
    }
  };

  const handleConfirmJoin = async () => {
    if (!selectedClass || !userProfile) return;

    try {
      setJoining(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LearningRegis/join-class",
        {
          learnerId: userProfile.learnerId,
          classId: selectedClass.classId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Đăng ký lớp học thành công!");
        setIsConfirmModalVisible(false);
        // Cập nhật lại danh sách lớp học
        fetchData();
        // Cập nhật số dư ví
        await fetchWalletBalance(userProfile.learnerId);
      } else {
        throw new Error(response.data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Error joining class:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Đã xảy ra lỗi khi đăng ký lớp học"
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-gray-900 text-white p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg flex items-center">
            <SoundOutlined className="mr-3 text-3xl md:text-4xl" /> Chào mừng
            đến với Trang học Nhạc cụ
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl">
            Học nhạc cụ theo yêu cầu với giáo viên chuyên nghiệp. Khám phá các
            khoá học nâng cao giúp bạn thành thạo nhạc cụ yêu thích!
          </p>

          <div className="mb-8">
            <SearchBar />
          </div>

          <div className="flex gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-sm transition duration-300">
              Khám phá khóa học
            </button>
            <button className="bg-transparent border-2 border-white text-white font-bold px-6 py-3 rounded-sm hover:bg-white hover:text-gray-900 transition duration-300">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>

      {/* Phần đăng ký học theo yêu cầu - Section nổi bật */}
      <div className="bg-purple-50 py-12 border-b border-purple-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col md:flex-row items-center bg-white rounded-md shadow-lg overflow-hidden">
            <div className="md:w-2/5 bg-purple-600 p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Đăng ký học theo yêu cầu
              </h2>
              <p className="mb-6 text-lg">
                Bạn muốn học nhạc cụ với lịch trình riêng? Hãy đặt lịch với giáo
                viên của chúng tôi theo nhu cầu của bạn.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Lịch học linh hoạt
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Giáo viên chuyên nghiệp
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Chương trình học cá nhân hóa
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Học tại trung tâm hoặc tự học
                  online
                </li>
              </ul>
              <button
                onClick={handleBookingClick}
                className="bg-white text-purple-600 font-bold px-8 py-3 rounded-sm hover:bg-gray-100 transition duration-300 flex items-center"
              >
                <FormOutlined className="mr-2" /> Đăng ký ngay
              </button>
            </div>
            <div className="md:w-3/5 p-8">
              <img
                src="https://toplist.vn/images/800px/-1114204.jpg"
                alt="Học nhạc theo yêu cầu"
                className="w-full h-64 object-cover rounded-md shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Phần các lớp học đang mở */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Các lớp học đang mở</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingClasses ? (
              <div className="col-span-full text-center py-12">
                Đang tải lớp học...
              </div>
            ) : (
              openClasses
                .filter((classItem) => classItem.status === 0)
                .slice(0, 3)
                .map((classItem) => (
                  <Card
                    key={classItem.classId}
                    hoverable
                    className="overflow-hidden shadow-md border border-gray-200 rounded-md hover:shadow-lg transition-shadow"
                    cover={
                      <img
                        alt={classItem.className}
                        src="https://ntt.edu.vn/wp-content/uploads/2023/04/KHOA-AM-NHAC-20-scaled.jpg"
                        className="w-full h-48 object-cover"
                      />
                    }
                  >
                    <div className="mb-1">
                      <Badge
                        count={`${classItem.maxStudents} chỗ`}
                        style={{
                          backgroundColor: getStatusColor(classItem.status),
                        }}
                      />
                    </div>
                    <h4 className="font-bold text-lg mb-2">
                      {classItem.className}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <UserOutlined className="mr-2" />
                      GV: {classItem.teacherName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <CalendarOutlined className="mr-2" />
                      Khai giảng:{" "}
                      {new Date(classItem.startDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <ClockCircleOutlined className="mr-2" />
                      {classItem.classTime.substring(0, 5)} -{" "}
                      {classItem.classEndTime.substring(0, 5)}
                    </p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <BookOutlined className="mr-2" />
                      {classItem.coursePackageName}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <CalendarOutlined className="mr-2" />
                      {formatClassDays(classItem.classDays)}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(classItem.price)}
                      </span>
                      <Tag color={getStatusColor(classItem.status)}>
                        {getStatusText(classItem.status)}
                      </Tag>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {classItem.status === 0 && "Lớp học đang mở"}
                        {classItem.status === 1 && "Lớp đang diễn ra"}
                        {classItem.status === 2 && "Lớp đã kết thúc"}
                      </div>
                      <Link to={`/class-detail/${classItem.classId}`}>
                        <Button type="link" className="text-purple-600">
                          Chi tiết
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/open-classes">
              <Button type="default" size="large">
                Xem tất cả lớp học đang mở <span>&rarr;</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Gói học online</h2>

          {loading ? (
            <div className="text-center py-12">Đang tải khóa học...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <Link
                    to={`/package/${course.courseId}`}
                    key={course.courseId}
                    className="no-underline text-inherit"
                  >
                    <Card
                      hoverable
                      className="overflow-hidden shadow-md border border-gray-200 rounded-md hover:shadow-lg transition-shadow h-full"
                      cover={
                        <div className="relative">
                          <img
                            alt={course.courseName}
                            src={course.imageUrl}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity">
                              <PlayCircleFilled className="text-4xl text-white" />
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag color="blue">{course.typeName}</Tag>
                        </div>

                        <h4 className="text-lg font-semibold mb-2">
                          {course.courseName}
                        </h4>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex items-center mb-3">
                          {course.rating > 0 ? (
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-amber-500 mr-2">
                                {course.rating.toFixed(1)}
                              </span>
                              <Rate
                                disabled
                                defaultValue={course.rating}
                                className="text-sm text-amber-500"
                              />
                            </div>
                          ) : (
                            <Tag color="processing">Khóa học mới</Tag>
                          )}
                        </div>

                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-bold text-red-600">
                                {formatPrice(course.price)}
                              </div>
                              {course.discount > 0 && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(
                                    course.price * (1 + course.discount / 100)
                                  )}
                                </div>
                              )}
                            </div>
                            {course.discount > 0 && (
                              <Tag color="red">-{course.discount}%</Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link to="/home-allcourse">
                  <Button type="default" size="large">
                    Xem tất cả khóa học <span>&rarr;</span>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mb-16 bg-gray-100 p-8 rounded-sm">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Học viên nói gì về chúng tôi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-sm shadow-sm flex flex-col items-center"
              >
                <Rate
                  disabled
                  defaultValue={testimonial.rating}
                  className="text-yellow-500 mb-4"
                />
                <p className="italic mb-4 text-gray-700">
                  "{testimonial.review}"
                </p>
                <span className="font-bold">- {testimonial.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action section with focus on custom learning */}
        <div className="text-center bg-gray-900 text-white p-12 rounded-sm mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Bắt đầu hành trình âm nhạc của bạn ngay hôm nay
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Đăng ký để nhận thông báo về các khóa học mới và ưu đãi đặc biệt
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleBookingClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-sm transition duration-300"
            >
              Đăng ký học theo yêu cầu
            </button>
            <Link to={"/open-classes"}>
              <button className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-sm hover:bg-white hover:text-gray-900 transition duration-300">
                Xem các lớp học đang mở
              </button>
            </Link>
          </div>
        </div>

        {/* Thông tin về đăng ký học theo yêu cầu */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Quy trình đăng ký học theo yêu cầu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-sm shadow-sm flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FormOutlined className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Bước 1: Điền thông tin</h3>
              <p className="text-gray-700">
                Hoàn thành form đăng ký với thông tin cá nhân và yêu cầu học tập
                của bạn.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-sm shadow-sm flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <TeamOutlined className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Bước 2: Ghép đôi giáo viên
              </h3>
              <p className="text-gray-700">
                Chúng tôi sẽ ghép đôi bạn với giáo viên phù hợp dựa trên yêu cầu
                của bạn.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-sm shadow-sm flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CalendarOutlined className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Bước 3: Bắt đầu học</h3>
              <p className="text-gray-700">
                Xác nhận lịch học và bắt đầu hành trình âm nhạc của bạn với giáo
                viên chuyên nghiệp.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={handleBookingClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-sm transition duration-300"
            >
              Đăng ký học theo yêu cầu
            </button>
          </div>
        </div>
      </div>

      {/* Modal yêu cầu cập nhật thông tin */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              Cập nhật thông tin cá nhân
            </div>
            <div className="text-gray-500">
              Vui lòng cập nhật thông tin cá nhân đầy đủ để sử dụng các tính
              năng của trang
            </div>
          </div>
        }
        open={isProfileUpdateModalVisible}
        onOk={() => {
          setIsProfileUpdateModalVisible(false);
          navigate("/profile");
        }}
        onCancel={() => setIsProfileUpdateModalVisible(false)}
        width={500}
        className="custom-modal"
        okText="Cập nhật ngay"
        cancelText="Để sau"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="text-center py-4">
          <div className="bg-yellow-50 rounded-lg p-6 mb-4">
            <div className="text-lg text-yellow-700 mb-2">
              Thông tin cần cập nhật:
            </div>
            <ul className="text-left space-y-2 text-gray-600">
              {!userProfile?.address && (
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Địa chỉ
                </li>
              )}
              {!userProfile?.phoneNumber && (
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Số điện thoại
                </li>
              )}
            </ul>
          </div>
        </div>
      </Modal>

      {/* Modal cảnh báo chưa đăng nhập */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              Vui lòng đăng nhập
            </div>
            <div className="text-gray-500">
              Bạn cần đăng nhập để đăng ký học theo yêu cầu
            </div>
          </div>
        }
        open={isLoginWarningModalVisible}
        onOk={() => {
          setIsLoginWarningModalVisible(false);
          navigate("/login");
        }}
        onCancel={() => setIsLoginWarningModalVisible(false)}
        width={500}
        className="custom-modal"
        okText="Đăng nhập ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="text-center py-4">
          <div className="bg-yellow-50 rounded-lg p-6 mb-4">
            <div className="text-lg text-yellow-700 mb-2">
              Để đăng ký học theo yêu cầu, bạn cần:
            </div>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Đăng nhập vào tài khoản của bạn
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Có đủ số dư trong ví (50,000 VND)
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Điền đầy đủ thông tin đăng ký
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Confirm Join Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              Xác nhận đăng ký học theo yêu cầu
            </div>
            <div className="text-gray-500">
              Vui lòng kiểm tra thông tin trước khi xác nhận
            </div>
          </div>
        }
        open={isConfirmModalVisible}
        onOk={handleConfirmBooking}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Bắt đầu đăng ký"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-purple-600 hover:bg-purple-700",
          loading: joining,
        }}
      >
        <div className="py-4">
          <div className="bg-purple-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 mb-2">
                Phí đăng ký học theo yêu cầu
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-2">
                50,000 VND
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Số dư hiện tại:</span>
                <span className="font-medium">
                  {formatPrice(walletBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số dư sau khi thanh toán:</span>
                <span className="font-medium">
                  {formatPrice(walletBalance - 50000)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Insufficient Balance Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Số dư không đủ
            </div>
            <div className="text-gray-500">
              Vui lòng nạp thêm tiền để đăng ký học theo yêu cầu
            </div>
          </div>
        }
        open={isInsufficientBalanceModalVisible}
        onOk={() => {
          setIsInsufficientBalanceModalVisible(false);
          navigate("/profile/topup");
        }}
        onCancel={() => setIsInsufficientBalanceModalVisible(false)}
        okText="Nạp tiền ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="py-4">
          <div className="bg-red-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600 mb-2">
                Số dư hiện tại
              </div>
              <div className="text-3xl font-bold text-red-700 mb-2">
                {formatPrice(walletBalance)}
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Phí đăng ký học theo yêu cầu :</span>
                <span className="font-medium">{formatPrice(50000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền cần nạp thêm:</span>
                <span className="font-medium text-red-600">
                  {formatPrice(50000 - walletBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
