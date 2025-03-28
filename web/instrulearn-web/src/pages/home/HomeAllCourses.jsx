import { useState, useEffect } from "react";
import {
  Card,
  Rate,
  Tag,
  Select,
  Input,
  Slider,
  Button,
  Space,
  Spin,
} from "antd";
import {
  PlayCircleFilled,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Option } = Select;
const { Search } = Input;

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseTypes, setCourseTypes] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    priceRange: [0, 5000000],
    rating: 0,
  });
  const [sortBy, setSortBy] = useState("newest");
  const [expandedFilters, setExpandedFilters] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all"
        );
        const data = await response.json();
        setCourses(data);

        // Extract unique course types
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
    // Apply filters whenever filters or courses change
    applyFilters();
  }, [filters, courses, sortBy]);

  const applyFilters = () => {
    let result = [...courses];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (course) =>
          course.courseName.toLowerCase().includes(searchLower) ||
          (course.instructorName &&
            course.instructorName.toLowerCase().includes(searchLower))
      );
    }

    // Apply type filter
    if (filters.type !== "all") {
      result = result.filter((course) => course.typeName === filters.type);
    }

    // Apply price range filter
    result = result.filter(
      (course) =>
        course.price >= filters.priceRange[0] &&
        course.price <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter((course) => course.rating >= filters.rating);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        // Assuming newer courses have higher IDs
        result.sort((a, b) => b.courseId - a.courseId);
        break;
    }

    setFilteredCourses(result);
  };

  const handleSearchChange = (value) => {
    setFilters({ ...filters, search: value });
  };

  const handleTypeChange = (value) => {
    setFilters({ ...filters, type: value });
  };

  const handlePriceChange = (value) => {
    setFilters({ ...filters, priceRange: value });
  };

  const handleRatingChange = (value) => {
    setFilters({ ...filters, rating: value });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      priceRange: [0, 5000000],
      rating: 0,
    });
    setSortBy("newest");
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-gray-900 text-white p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Tất cả khóa học
          </h1>
          <p className="text-lg mb-6">
            Khám phá tất cả các khóa học nhạc cụ chất lượng cao từ các giáo viên
            chuyên nghiệp
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <Search
                placeholder="Tìm kiếm khóa học hoặc giáo viên"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="md:w-2/3"
              />

              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">Sắp xếp theo:</span>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full md:w-48"
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="rating">Đánh giá cao nhất</Option>
                  <Option value="price-low">Giá thấp đến cao</Option>
                  <Option value="price-high">Giá cao đến thấp</Option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <FilterOutlined />
              <span className="font-bold">Bộ lọc</span>
              <Button
                type="link"
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="text-purple-600"
              >
                {expandedFilters ? "Thu gọn" : "Mở rộng"}
              </Button>
            </div>

            {expandedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                  <div className="mb-2 font-semibold">Loại nhạc cụ</div>
                  <Select
                    value={filters.type}
                    onChange={handleTypeChange}
                    className="w-full"
                  >
                    <Option value="all">Tất cả</Option>
                    {courseTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <div className="mb-2 font-semibold">Khoảng giá (VNĐ)</div>
                  <Slider
                    range
                    min={0}
                    max={5000000}
                    step={100000}
                    value={filters.priceRange}
                    onChange={handlePriceChange}
                    tooltip={{
                      formatter: (value) => formatPrice(value),
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 font-semibold">Đánh giá tối thiểu</div>
                  <div className="flex items-center gap-2">
                    <Rate
                      allowHalf
                      value={filters.rating}
                      onChange={handleRatingChange}
                    />
                    <span className="text-gray-500">
                      {filters.rating > 0
                        ? `${filters.rating} sao trở lên`
                        : "Tất cả đánh giá"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {expandedFilters && (
              <div className="mt-4 flex justify-end">
                <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Spin size="large" />
              <div className="mt-4">Đang tải khóa học...</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {filteredCourses.length} khóa học{" "}
                  {filters.type !== "all" ? filters.type : ""}
                </h2>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-2">
                    Không tìm thấy khóa học phù hợp
                  </div>
                  <Button type="primary" onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <Link
                      to={`/course/${course.courseId}`}
                      key={course.courseId}
                      className="no-underline text-inherit"
                    >
                      <Card
                        hoverable
                        className="overflow-hidden shadow-md border border-gray-200 rounded-md hover:shadow-lg transition-shadow h-full flex flex-col"
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
                        <div className="py-1 flex flex-col flex-grow">
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

                          <div className="mt-auto">
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="font-bold text-base">
                                {formatPrice(course.price)}
                              </span>

                              <Space>
                                {Math.random() > 0.5 && (
                                  <Tag color="orange" className="m-0">
                                    Bestseller
                                  </Tag>
                                )}
                                <Tag color="blue" className="m-0">
                                  {course.typeName}
                                </Tag>
                              </Space>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
