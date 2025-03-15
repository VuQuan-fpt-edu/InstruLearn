import { useState, useEffect } from "react";
import { Card, Badge, Button, Select, Input, Tag, Spin } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Option } = Select;
const { Search } = Input;

export default function OpenClasses() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    location: "all",
    availability: "all",
  });

  useEffect(() => {
    // Giả lập tải dữ liệu từ API
    const fetchClasses = async () => {
      // Đây là dữ liệu mẫu - thay thế bằng API thực tế khi có
      const mockClasses = [
        {
          id: 1,
          title: "Lớp Piano cho người mới bắt đầu",
          instructor: "Nguyễn Thanh Tùng",
          location: "Quận 1, TP.HCM",
          startDate: "28/03/2025",
          seatsAvailable: 5,
          totalSeats: 10,
          imageUrl:
            "https://ntt.edu.vn/wp-content/uploads/2023/04/KHOA-AM-NHAC-20-scaled.jpg",
          courseType: "Piano",
          price: 2500000,
        },
        {
          id: 2,
          title: "Guitar cơ bản - Khóa buổi tối",
          instructor: "Trần Văn Minh",
          location: "Quận 3, TP.HCM",
          startDate: "01/04/2025",
          seatsAvailable: 3,
          totalSeats: 8,
          imageUrl:
            "https://artiumacademy.mo.cloudinary.net/v1n/Learn_Guitar_Online.jpg",
          courseType: "Guitar",
          price: 1800000,
        },
        {
          id: 3,
          title: "Violin cho trẻ em 8-12 tuổi",
          instructor: "Lê Thị Hương",
          location: "Quận 3, TP.HCM",
          startDate: "05/04/2025",
          seatsAvailable: 6,
          totalSeats: 12,
          imageUrl:
            "https://images.pexels.com/photos/111287/pexels-photo-111287.jpeg",
          courseType: "Violin",
          price: 3000000,
        },
        {
          id: 4,
          title: "Khóa học Trống cơ bản",
          instructor: "Phạm Anh Tuấn",
          location: "Quận 7, TP.HCM",
          startDate: "10/04/2025",
          seatsAvailable: 2,
          totalSeats: 6,
          imageUrl: "https://toplist.vn/images/800px/-1114204.jpg",
          courseType: "Trống",
          price: 2200000,
        },
        {
          id: 5,
          title: "Lớp Sáo trúc dành cho người lớn",
          instructor: "Nguyễn Hoàng Nam",
          location: "Quận 2, TP.HCM",
          startDate: "15/04/2025",
          seatsAvailable: 8,
          totalSeats: 10,
          imageUrl:
            "https://www.teachingenglish.org.uk/sites/teacheng/files/images/classroom_practice_professional_development_0.jpg",
          courseType: "Sáo trúc",
          price: 1500000,
        },
        {
          id: 6,
          title: "Lớp học Organ nâng cao",
          instructor: "Trần Thị Mai",
          location: "Quận 5, TP.HCM",
          startDate: "03/04/2025",
          seatsAvailable: 0,
          totalSeats: 5,
          imageUrl:
            "https://www.schoolofmusic.asia/wp-content/uploads/2020/09/14-1024x683.jpg",
          courseType: "Organ",
          price: 2700000,
        },
      ];

      // Trích xuất các địa điểm độc nhất
      const uniqueLocations = [
        ...new Set(mockClasses.map((item) => item.location)),
      ];
      setLocations(uniqueLocations);

      setClasses(mockClasses);
      setFilteredClasses(mockClasses);
      setLoading(false);
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, classes]);

  const applyFilters = () => {
    let result = [...classes];

    // Lọc theo tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (classItem) =>
          classItem.title.toLowerCase().includes(searchLower) ||
          classItem.instructor.toLowerCase().includes(searchLower) ||
          classItem.courseType.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo nhạc cụ
    if (filters.instrument !== "all") {
      result = result.filter(
        (classItem) => classItem.courseType === filters.instrument
      );
    }

    // Lọc theo chỗ trống
    if (filters.availability === "available") {
      result = result.filter((classItem) => classItem.seatsAvailable > 0);
    } else if (filters.availability === "limited") {
      result = result.filter(
        (classItem) =>
          classItem.seatsAvailable > 0 && classItem.seatsAvailable <= 3
      );
    } else if (filters.availability === "full") {
      result = result.filter((classItem) => classItem.seatsAvailable === 0);
    }

    setFilteredClasses(result);
  };

  const handleSearchChange = (value) => {
    setFilters({ ...filters, search: value });
  };

  const handleInstrumentChange = (value) => {
    setFilters({ ...filters, instrument: value });
  };

  const handleAvailabilityChange = (value) => {
    setFilters({ ...filters, availability: value });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      instrument: "all",
      availability: "all",
    });
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
            Các lớp học đang mở
          </h1>
          <p className="text-lg mb-6">
            Đăng ký tham gia các lớp học nhạc cụ đang mở với giáo viên chuyên
            nghiệp
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <Search
                placeholder="Tìm kiếm lớp học hoặc giáo viên"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="md:w-2/3"
              />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <FilterOutlined />
              <span className="font-bold">Bộ lọc</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              <div>
                <div className="mb-2 font-semibold">Nhạc cụ</div>
                <Select
                  value={filters.instrument}
                  onChange={(value) =>
                    setFilters({ ...filters, instrument: value })
                  }
                  className="w-full"
                >
                  <Option value="all">Tất cả nhạc cụ</Option>
                  {Array.from(
                    new Set(classes.map((item) => item.courseType))
                  ).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="mb-2 font-semibold">Tình trạng chỗ ngồi</div>
                <Select
                  value={filters.availability}
                  onChange={handleAvailabilityChange}
                  className="w-full"
                >
                  <Option value="all">Tất cả tình trạng</Option>
                  <Option value="available">Còn chỗ</Option>
                  <Option value="limited">Sắp đầy (≤ 3 chỗ)</Option>
                  <Option value="full">Đã đầy</Option>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Spin size="large" />
              <div className="mt-4">Đang tải dữ liệu lớp học...</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {filteredClasses.length} lớp học đang mở
                </h2>
              </div>

              {filteredClasses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-2">
                    Không tìm thấy lớp học phù hợp
                  </div>
                  <Button type="primary" onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((classItem) => (
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
                      <div className="mb-2">
                        <Tag
                          color={
                            classItem.seatsAvailable === 0
                              ? "red"
                              : classItem.seatsAvailable <= 3
                              ? "orange"
                              : "green"
                          }
                        >
                          {classItem.seatsAvailable === 0
                            ? "Đã đầy"
                            : `Còn ${classItem.seatsAvailable}/${classItem.totalSeats} chỗ`}
                        </Tag>
                        <Tag color="blue">{classItem.courseType}</Tag>
                      </div>

                      <h4 className="font-bold text-lg mb-2">
                        {classItem.title}
                      </h4>

                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <UserOutlined className="mr-2" />
                        GV: {classItem.instructor}
                      </p>

                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <CalendarOutlined className="mr-2" />
                        Khai giảng: {classItem.startDate}
                      </p>

                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <EnvironmentOutlined className="mr-2" />
                        {classItem.location}
                      </p>

                      <p className="text-base font-bold mb-3">
                        {formatPrice(classItem.price)}
                      </p>

                      <div className="flex items-center justify-between">
                        <Button
                          type="primary"
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={classItem.seatsAvailable === 0}
                        >
                          Đăng ký lớp học
                        </Button>
                        <Link to={"/center-class-detail"}>
                          <Button type="link" className="text-purple-600">
                            Chi tiết
                          </Button>
                        </Link>
                      </div>
                    </Card>
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
