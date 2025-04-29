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
          "https://instrulearnapplication.azurewebsites.net/api/Course/get-all"
        );
        const data = await response.json();

        // Xử lý dữ liệu từ API mới và lọc status = 1
        const processedData = data
          .filter((course) => course.status === 1) // Chỉ lấy các khóa học có status = 1
          .map((course) => ({
            coursePackageId: course.coursePackageId,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            headline: course.headline,
            rating: course.rating,
            price: course.price,
            discount: course.discount,
            imageUrl:
              course.imageUrl || "https://placehold.co/600x400?text=No+Image",
            typeName: course.courseTypeName,
            status: course.status,
          }));

        setCourses(processedData);

        // Lấy danh sách loại nhạc cụ duy nhất từ các khóa học có status = 1
        const types = [
          ...new Set(processedData.map((course) => course.typeName)),
        ];
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
          course.courseDescription.toLowerCase().includes(searchLower)
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
        result.sort((a, b) => b.coursePackageId - a.coursePackageId);
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
            Tất cả khóa học online
          </h1>
          <p className="text-lg mb-6">
            Khám phá tất cả các khóa học online chất lượng cao từ các giáo viên
            chuyên nghiệp
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <Search
                placeholder="Tìm kiếm khóa học online hoặc giáo viên"
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
              <div className="mt-4">Đang tải khóa học online...</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {filteredCourses.length} khóa học online{" "}
                  {filters.type !== "all" ? filters.type : ""}
                </h2>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-2">
                    Không tìm thấy khóa học online phù hợp
                  </div>
                  <Button type="primary" onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <Link
                      to={`/package/${course.coursePackageId}`}
                      key={course.coursePackageId}
                      className="no-underline text-inherit"
                    >
                      <Card
                        hoverable
                        className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl border-0 bg-white rounded-xl"
                        bodyStyle={{ padding: "16px" }}
                        cover={
                          <div className="relative group">
                            <img
                              alt={course.courseName}
                              src={course.imageUrl}
                              className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/600x400?text=No+Image";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <PlayCircleFilled className="text-5xl text-white transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
                            </div>
                          </div>
                        }
                      >
                        <div className="flex flex-col h-full">
                          <Tag
                            color="blue"
                            className="self-start mb-2 rounded-full px-3 py-1"
                          >
                            {course.typeName}
                          </Tag>

                          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {course.courseName}
                          </h3>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {course.headline}
                          </p>

                          <div className="flex items-center gap-2 mb-3">
                            {course.rating > 0 ? (
                              <>
                                <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-sm font-semibold">
                                  {course.rating.toFixed(1)}
                                  <Rate
                                    disabled
                                    defaultValue={1}
                                    count={1}
                                    className="text-amber-500 ml-1"
                                  />
                                </span>
                              </>
                            ) : (
                              <Tag color="purple" className="rounded-lg">
                                Mới
                              </Tag>
                            )}
                            {course.status === 1 && (
                              <Tag color="success" className="rounded-lg">
                                Đang mở bán
                              </Tag>
                            )}
                          </div>

                          <div className="mt-auto pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500">
                                  Học phí
                                </span>
                                <span className="font-bold text-sm text-blue-600">
                                  {formatPrice(course.price)}/Buổi
                                </span>
                              </div>
                              <Button
                                type="primary"
                                shape="round"
                                className="bg-blue-600"
                              >
                                Xem chi tiết
                              </Button>
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
