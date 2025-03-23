import { Card, Rate, Tag, Input, Button, Badge, Modal } from "antd";
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
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openClasses, setOpenClasses] = useState([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [
    isInsufficientBalanceModalVisible,
    setIsInsufficientBalanceModalVisible,
  ] = useState(false);
  const [isLoginWarningModalVisible, setIsLoginWarningModalVisible] =
    useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all"
        );
        const data = await response.json();
        // Xử lý dữ liệu khóa học
        const processedCourses = data.map((course) => ({
          courseId: course.coursePackageId,
          courseName: course.courseName,
          typeName: course.typeName,
          description: course.courseDescription,
          headline: course.headline,
          rating: course.rating,
          price: course.price,
          discount: course.discount,
          imageUrl: course.imageUrl,
        }));
        setCourses(processedCourses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    // Mocked data for open classes - in a real scenario, you'd fetch this from your API
    const fetchOpenClasses = async () => {
      // This is mock data - replace with actual API call when available
      const mockClasses = [
        {
          id: 1,
          title: "Lớp Piano cho người mới bắt đầu",
          instructor: "Nguyễn Thanh Tùng",
          location: "Số 15 Nguyễn Huệ, Quận 1, TP.HCM",
          startDate: "28/03/2025",
          seatsAvailable: 5,
          totalSeats: 10,
          imageUrl:
            "https://ntt.edu.vn/wp-content/uploads/2023/04/KHOA-AM-NHAC-20-scaled.jpg",
        },
        {
          id: 2,
          title: "Guitar cơ bản - Khóa buổi tối",
          instructor: "Trần Văn Minh",
          location: "Số 27 Lê Lợi, Quận 3, TP.HCM",
          startDate: "01/04/2025",
          seatsAvailable: 3,
          totalSeats: 8,
          imageUrl:
            "https://artiumacademy.mo.cloudinary.net/v1n/Learn_Guitar_Online.jpg",
        },
        {
          id: 3,
          title: "Violin cho trẻ em 8-12 tuổi",
          instructor: "Lê Thị Hương",
          location: "Số 45 Phạm Ngọc Thạch, Quận 3, TP.HCM",
          startDate: "05/04/2025",
          seatsAvailable: 6,
          totalSeats: 12,
          imageUrl:
            "https://images.pexels.com/photos/111287/pexels-photo-111287.jpeg",
        },
      ];

      setOpenClasses(mockClasses);
    };

    const fetchWalletBalance = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const learnerId = localStorage.getItem("learnerId");

        if (!token || !learnerId) {
          throw new Error("Bạn chưa đăng nhập");
        }

        const response = await fetch(
          `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/${learnerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.isSucceed) {
          setWalletBalance(data.data.balance);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchCourses();
    fetchOpenClasses();
    fetchWalletBalance();
  }, []);

  const coursesByType = courses.reduce((acc, course) => {
    if (!acc[course.typeName]) {
      acc[course.typeName] = [];
    }
    acc[course.typeName].push(course);
    return acc;
  }, {});

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
    // Kiểm tra số dư ví trước khi hiển thị modal xác nhận
    if (walletBalance < 50000) {
      setIsInsufficientBalanceModalVisible(true);
    } else {
      setIsConfirmModalVisible(true);
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
              Bạn cần đăng nhập để đăng ký lớp học
            </div>
          </div>
        ),
        content: (
          <div className="text-center py-4">
            <div className="bg-yellow-50 rounded-lg p-6 mb-4">
              <div className="text-lg text-yellow-700 mb-2">
                Để đăng ký lớp học, bạn cần:
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
    // Xử lý đăng ký lớp học khi đã đăng nhập
    Modal.info({
      title: (
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            Đăng ký lớp học
          </div>
          <div className="text-gray-500">
            Vui lòng kiểm tra thông tin lớp học
          </div>
        </div>
      ),
      content: (
        <div className="text-center py-4">
          <div className="bg-purple-50 rounded-lg p-6 mb-4">
            <div className="text-xl font-bold text-purple-600 mb-2">
              {classItem.title}
            </div>
            <div className="text-gray-600">
              Giáo viên: {classItem.instructor}
            </div>
            <div className="text-gray-600">
              Khai giảng: {classItem.startDate}
            </div>
            <div className="text-gray-600">Địa điểm: {classItem.location}</div>
          </div>
        </div>
      ),
      okText: "Xác nhận đăng ký",
      cancelText: "Hủy",
      okButtonProps: { className: "bg-purple-600 hover:bg-purple-700" },
      width: 500,
      centered: true,
      maskClosable: false,
    });
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
            {openClasses.map((classItem) => (
              <Card
                key={classItem.id}
                hoverable
                className="overflow-hidden shadow-md border border-gray-200 rounded-md hover:shadow-lg transition-shadow"
                cover={
                  <img
                    alt={classItem.title}
                    src={classItem.imageUrl}
                    className="w-full h-48 object-cover"
                  />
                }
              >
                <div className="mb-1">
                  <Badge
                    count={`${classItem.seatsAvailable}/${classItem.totalSeats} chỗ`}
                    style={{
                      backgroundColor:
                        classItem.seatsAvailable < 3 ? "#ff4d4f" : "#52c41a",
                    }}
                  />
                </div>
                <h4 className="font-bold text-lg mb-2">{classItem.title}</h4>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <UserOutlined className="mr-2" />
                  GV: {classItem.instructor}
                </p>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <CalendarOutlined className="mr-2" />
                  Khai giảng: {classItem.startDate}
                </p>
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  {classItem.location}
                </p>
                <Button
                  type="primary"
                  block
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleEnrollClass(classItem)}
                >
                  Đăng ký lớp học
                </Button>
              </Card>
            ))}
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
          <h2 className="text-3xl font-bold mb-8">Khóa học nổi bật</h2>

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

      {/* Modal xác nhận phí đăng ký */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              Xác nhận phí đăng ký
            </div>
            <div className="text-gray-500">
              Vui lòng kiểm tra thông tin trước khi tiếp tục
            </div>
          </div>
        }
        open={isConfirmModalVisible}
        onOk={handleConfirmBooking}
        onCancel={() => setIsConfirmModalVisible(false)}
        width={500}
        className="custom-modal"
        okText="Đồng ý"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="text-center py-4">
          <div className="bg-purple-50 rounded-lg p-6 mb-4">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              50,000 VND
            </div>
            <div className="text-gray-600">Phí đăng ký học theo yêu cầu</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Số dư hiện tại:</span>
              <span className="font-semibold text-green-600">
                {formatPrice(walletBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Số dư sau khi trừ:</span>
              <span className="font-semibold text-red-600">
                {formatPrice(walletBalance - 50000)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal thông báo số dư không đủ */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Số dư không đủ
            </div>
            <div className="text-gray-500">
              Vui lòng nạp thêm tiền để tiếp tục
            </div>
          </div>
        }
        open={isInsufficientBalanceModalVisible}
        onOk={handleNavigateToWallet}
        onCancel={() => setIsInsufficientBalanceModalVisible(false)}
        width={500}
        className="custom-modal"
        okText="Nạp tiền ngay"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      >
        <div className="text-center py-4">
          <div className="bg-red-50 rounded-lg p-6 mb-4">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {formatPrice(walletBalance)}
            </div>
            <div className="text-gray-600">Số dư hiện tại của bạn</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Phí đăng ký cần:</span>
              <span className="font-semibold text-purple-600">50,000 VND</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Số tiền cần nạp thêm:</span>
              <span className="font-semibold text-red-600">
                {formatPrice(50000 - walletBalance)}
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Bạn sẽ được chuyển đến trang nạp tiền sau khi xác nhận
          </div>
        </div>
      </Modal>
    </div>
  );
}
