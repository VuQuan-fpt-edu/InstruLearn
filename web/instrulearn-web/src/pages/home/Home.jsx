import { Card, Rate, Tag, Input } from "antd";
import {
  SoundOutlined,
  PlayCircleFilled,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all"
        );
        const data = await response.json();
        setCourses(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
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

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Khóa học nổi bật</h2>

          {loading ? (
            <div className="text-center py-12">Đang tải khóa học...</div>
          ) : (
            <>
              {Object.keys(coursesByType).map((typeName) => (
                <div key={typeName} className="mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Khóa học {typeName}</h3>
                    <button className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
                      Xem tất cả
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {coursesByType[typeName].map((course) => (
                      <Link
                        to={`/course/${course.courseId}`}
                        key={course.courseId}
                        className="no-underline text-inherit"
                      >
                        <Card
                          hoverable
                          className="overflow-hidden shadow-md border border-gray-200 rounded-md hover:shadow-lg transition-shadow"
                          cover={
                            <div className="relative">
                              <img
                                alt={course.courseName}
                                src={course.imageUrl}
                                className="w-full aspect-video object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                <div className="opacity-0 hover:opacity-100 transition-opacity">
                                  <PlayCircleFilled className="text-4xl text-white" />
                                </div>
                              </div>
                            </div>
                          }
                        >
                          <div className="py-1">
                            <h4 className="font-bold text-base mb-1 line-clamp-2">
                              {course.courseName}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1 flex items-center">
                              <UserOutlined className="mr-1" />
                              {course.instructorName ||
                                "Giáo viên chuyên nghiệp"}
                            </p>

                            <div className="flex items-center mb-1">
                              <span className="font-bold text-amber-700 mr-1">
                                {course.rating
                                  ? course.rating.toFixed(1)
                                  : "Mới"}
                              </span>
                              {course.rating > 0 ? (
                                <>
                                  <Rate
                                    disabled
                                    defaultValue={course.rating}
                                    className="text-xs text-amber-500"
                                  />
                                  <span className="text-xs text-gray-600 ml-1">
                                    ({Math.floor(Math.random() * 1000) + 100})
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-600 ml-1">
                                  (Chưa có đánh giá)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center text-xs mb-2">
                              <ClockCircleOutlined className="mr-1" />
                              <span>
                                {Math.floor(Math.random() * 10) + 5} giờ tổng
                                thời lượng
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                              <span className="font-bold text-base">
                                {formatPrice(course.price)}
                              </span>

                              {Math.random() > 0.5 && (
                                <Tag color="orange" className="m-0">
                                  Bestseller
                                </Tag>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
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

        <div className="text-center bg-gray-900 text-white p-12 rounded-sm">
          <h2 className="text-3xl font-bold mb-4">
            Bắt đầu hành trình âm nhạc của bạn ngay hôm nay
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Đăng ký để nhận thông báo về các khóa học mới và ưu đãi đặc biệt
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-sm transition duration-300">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}
