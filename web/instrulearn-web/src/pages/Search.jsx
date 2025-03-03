import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Rate,
  Tag,
  Input,
  Slider,
  Select,
  Checkbox,
  Empty,
  Spin,
  Button,
} from "antd";
import {
  SearchOutlined,
  PlayCircleFilled,
  UserOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import SearchBar from "../components/SearchBar";

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keywordFromUrl = searchParams.get("keyword") || "";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);

  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [hasDiscount, setHasDiscount] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all"
        );
        const data = await response.json();
        setCourses(data);

        const types = [...new Set(data.map((course) => course.typeName))];
        setCourseTypes(types);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      let results = [...courses];

      if (keywordFromUrl) {
        const keyword = keywordFromUrl.toLowerCase();
        results = results.filter((course) =>
          course.courseName.toLowerCase().includes(keyword)
        );
      }

      results = results.filter(
        (course) =>
          course.price >= priceRange[0] && course.price <= priceRange[1]
      );

      if (selectedTypes.length > 0) {
        results = results.filter((course) =>
          selectedTypes.includes(course.typeName)
        );
      }

      if (ratingFilter > 0) {
        results = results.filter((course) => course.rating >= ratingFilter);
      }

      if (hasDiscount) {
        results = results.filter(() => Math.random() > 0.5);
      }

      setFilteredCourses(results);
    }
  }, [
    courses,
    keywordFromUrl,
    priceRange,
    selectedTypes,
    ratingFilter,
    hasDiscount,
  ]);

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

  const clearSearch = () => {
    navigate("/search");
  };

  const resetFilters = () => {
    setPriceRange([0, 5000000]);
    setSelectedTypes([]);
    setRatingFilter(0);
    setHasDiscount(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-gray-900 text-white py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Tìm kiếm khóa học</h1>
          <SearchBar />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              {keywordFromUrl ? (
                <>
                  Kết quả tìm kiếm cho "
                  <span className="text-purple-600">{keywordFromUrl}</span>"
                </>
              ) : (
                "Tất cả khóa học"
              )}
            </h2>
            <p className="text-gray-600">
              {filteredCourses.length} khóa học được tìm thấy
            </p>
          </div>

          {keywordFromUrl && (
            <Button
              icon={<ClearOutlined />}
              onClick={clearSearch}
              className="flex items-center"
            >
              Xóa kết quả tìm kiếm
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 bg-gray-50 p-4 rounded-sm">
            <div className="font-bold text-lg mb-4 flex items-center">
              <FilterOutlined className="mr-2" />
              Bộ lọc
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Giá</h3>
              <Slider
                range
                min={0}
                max={5000000}
                step={100000}
                value={priceRange}
                onChange={setPriceRange}
                tipFormatter={(value) => formatPrice(value)}
              />
              <div className="flex justify-between text-sm mt-1">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Loại khóa học</h3>
              <Checkbox.Group
                options={courseTypes.map((type) => ({
                  label: type,
                  value: type,
                }))}
                value={selectedTypes}
                onChange={setSelectedTypes}
                className="flex flex-col gap-2"
              />
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Đánh giá</h3>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn đánh giá"
                value={ratingFilter || null}
                onChange={setRatingFilter}
                options={[
                  { value: 0, label: "Tất cả" },
                  { value: 4.5, label: "4.5 trở lên" },
                  { value: 4, label: "4.0 trở lên" },
                  { value: 3.5, label: "3.5 trở lên" },
                  { value: 3, label: "3.0 trở lên" },
                ]}
              />
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Khuyến mãi</h3>
              <Checkbox
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
              >
                Có khuyến mãi
              </Checkbox>
            </div>

            <Button
              onClick={resetFilters}
              type="link"
              className="text-purple-600 hover:text-purple-800 p-0"
            >
              Đặt lại bộ lọc
            </Button>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <Empty
                description={
                  <span>
                    Không tìm thấy khóa học nào phù hợp với tìm kiếm của bạn
                  </span>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
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
                          {course.instructorName || "Giáo viên chuyên nghiệp"}
                        </p>

                        <div className="flex items-center mb-1">
                          <span className="font-bold text-amber-700 mr-1">
                            {course.rating ? course.rating.toFixed(1) : "Mới"}
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
                            {Math.floor(Math.random() * 10) + 5} giờ tổng thời
                            lượng
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
