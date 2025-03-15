import { useState } from "react";
import {
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  DownOutlined,
  UpOutlined,
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  FilterOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

// Dữ liệu giáo viên
const teachersData = [
  {
    instrument: "Piano",
    description:
      "Học piano để phát triển kỹ năng chơi đàn phím và hiểu biết về hòa âm",
    teachers: [
      {
        id: 1,
        name: "Nguyễn Văn A",
        experience: "10 năm",
        contact: "0901234567",
        rating: 4.8,
        location: "Quận 1, TP.HCM",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        specialties: ["Piano cổ điển", "Jazz piano"],
      },
      {
        id: 2,
        name: "Trần Thị B",
        experience: "8 năm",
        contact: "0912345678",
        rating: 4.5,
        location: "Quận 3, TP.HCM",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
        specialties: ["Piano cho trẻ em", "Piano đệm hát"],
      },
      {
        id: 8,
        name: "Lý Thanh H",
        experience: "12 năm",
        contact: "0978901234",
        rating: 4.9,
        location: "Quận Phú Nhuận, TP.HCM",
        image: "https://randomuser.me/api/portraits/women/8.jpg",
        specialties: ["Piano cổ điển", "Nhạc lý piano"],
      },
    ],
  },
  {
    instrument: "Guitar",
    description: "Học guitar để nắm vững các kỹ thuật đệm hát và solo",
    teachers: [
      {
        id: 3,
        name: "Lê Văn C",
        experience: "5 năm",
        contact: "0923456789",
        rating: 4.2,
        location: "Quận 7, TP.HCM",
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        specialties: ["Guitar Acoustic", "Fingerstyle"],
      },
      {
        id: 4,
        name: "Phạm Thị D",
        experience: "6 năm",
        contact: "0934567890",
        rating: 4.7,
        location: "Quận Bình Thạnh, TP.HCM",
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        specialties: ["Guitar đệm hát", "Guitar pop"],
      },
      {
        id: 9,
        name: "Ngô Minh I",
        experience: "9 năm",
        contact: "0989012345",
        rating: 4.4,
        location: "Quận 5, TP.HCM",
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        specialties: ["Guitar điện", "Rock guitar"],
      },
    ],
  },
  {
    instrument: "Violin",
    description:
      "Khám phá âm nhạc cổ điển và hiện đại thông qua việc học violin",
    teachers: [
      {
        id: 5,
        name: "Hoàng Văn E",
        experience: "7 năm",
        contact: "0945678901",
        rating: 4.6,
        location: "Quận 2, TP.HCM",
        image: "https://randomuser.me/api/portraits/men/5.jpg",
        specialties: ["Violin cổ điển", "Violin cho người mới bắt đầu"],
      },
      {
        id: 10,
        name: "Trương Thị J",
        experience: "11 năm",
        contact: "0990123456",
        rating: 4.8,
        location: "Quận 4, TP.HCM",
        image: "https://randomuser.me/api/portraits/women/10.jpg",
        specialties: ["Violin nâng cao", "Violin cổ điển"],
      },
    ],
  },
  {
    instrument: "Saxophone",
    description: "Tạo những âm thanh Jazz đầy cảm xúc với saxophone",
    teachers: [
      {
        id: 6,
        name: "Phan Thị F",
        experience: "9 năm",
        contact: "0956789012",
        rating: 4.9,
        location: "Quận 10, TP.HCM",
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        specialties: ["Alto Saxophone", "Jazz Saxophone"],
      },
    ],
  },
  {
    instrument: "Trống",
    description: "Học nhịp điệu và kỹ thuật chơi trống chuyên nghiệp",
    teachers: [
      {
        id: 7,
        name: "Đỗ Văn G",
        experience: "11 năm",
        contact: "0967890123",
        rating: 4.4,
        location: "Quận Tân Bình, TP.HCM",
        image: "https://randomuser.me/api/portraits/men/7.jpg",
        specialties: ["Trống Jazz", "Trống Rock"],
      },
      {
        id: 11,
        name: "Huỳnh Thanh K",
        experience: "7 năm",
        contact: "0991234567",
        rating: 4.3,
        location: "Quận 6, TP.HCM",
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        specialties: ["Trống đệm nhạc Pop", "Kỹ thuật cơ bản"],
      },
    ],
  },
];

export default function MusicTeachersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(
    teachersData.map((cat) => cat.instrument)
  );
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const navigate = useNavigate();

  // Xử lý thêm/xóa giáo viên vào danh sách yêu thích
  const toggleFavorite = (teacherId) => {
    if (favorites.includes(teacherId)) {
      setFavorites(favorites.filter((id) => id !== teacherId));
    } else {
      setFavorites([...favorites, teacherId]);
    }
  };

  // Xử lý đóng/mở category
  const toggleCategory = (instrument) => {
    if (expandedCategories.includes(instrument)) {
      setExpandedCategories(
        expandedCategories.filter((cat) => cat !== instrument)
      );
    } else {
      setExpandedCategories([...expandedCategories, instrument]);
    }
  };

  // Lọc danh sách giáo viên theo từ khóa tìm kiếm
  const filteredTeachersData = teachersData
    .map((category) => {
      const filteredTeachers = category.teachers.filter((teacher) => {
        if (searchTerm === "") return true;
        const term = searchTerm.toLowerCase();
        return (
          teacher.name.toLowerCase().includes(term) ||
          teacher.location.toLowerCase().includes(term) ||
          teacher.specialties.some((spec) => spec.toLowerCase().includes(term))
        );
      });

      return {
        ...category,
        teachers: filteredTeachers,
      };
    })
    .filter(
      (category) =>
        activeCategoryTab === "all" || category.instrument === activeCategoryTab
    );

  // Hàm định dạng số điện thoại
  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 z-10"></div>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Music Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl font-bold text-center mb-6">
            Đội Ngũ Giáo Viên Tài Năng
          </h1>
          <p className="text-xl text-center max-w-2xl mb-8 text-gray-200">
            Khám phá đội ngũ giáo viên giàu kinh nghiệm, tận tâm và chuyên
            nghiệp
          </p>
          <div className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm giáo viên, nhạc cụ hoặc địa điểm..."
                className="w-full p-4 pl-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchOutlined className="absolute left-5 top-5 text-gray-300 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide">
            <button
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                activeCategoryTab === "all"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveCategoryTab("all")}
            >
              Tất cả
            </button>
            {teachersData.map((category) => (
              <button
                key={category.instrument}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  activeCategoryTab === category.instrument
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveCategoryTab(category.instrument)}
              >
                {category.instrument}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {filteredTeachersData.length > 0 ? (
          filteredTeachersData.map(
            (category) =>
              category.teachers.length > 0 && (
                <div key={category.instrument} className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {category.instrument}
                      </h2>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                    <button
                      onClick={() => toggleCategory(category.instrument)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedCategories.includes(category.instrument) ? (
                        <UpOutlined className="text-2xl" />
                      ) : (
                        <DownOutlined className="text-2xl" />
                      )}
                    </button>
                  </div>

                  {expandedCategories.includes(category.instrument) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {category.teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 transition-all duration-300"
                        >
                          <div className="relative h-64">
                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/400/320";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute top-4 right-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(teacher.id);
                                }}
                                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                              >
                                {favorites.includes(teacher.id) ? (
                                  <HeartFilled className="text-pink-500 text-lg" />
                                ) : (
                                  <HeartOutlined className="text-gray-500 text-lg" />
                                )}
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <div className="flex items-center gap-2">
                                <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {teacher.rating} ★
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                                  {teacher.experience}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {teacher.name}
                            </h3>
                            <p className="text-gray-600 mb-4 flex items-center">
                              <span className="mr-2">📍</span>
                              {teacher.location}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                              {teacher.specialties.map((specialty, index) => (
                                <span
                                  key={index}
                                  className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => navigate(`/teacher-profile`)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                              >
                                Chi tiết
                              </button>
                              <Link to={"/booking1-1"} className="flex-1">
                                <button className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                                  Đăng ký
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
          )
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchOutlined className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Vui lòng thử lại với từ khóa khác hoặc kiểm tra lại các bộ lọc của
              bạn
            </p>
          </div>
        )}
      </main>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Thống Kê Giáo Viên
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {teachersData.map((category) => (
              <div
                key={category.instrument}
                className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.instrument}
                </h3>
                <p className="text-4xl font-bold text-indigo-600 mb-1">
                  {category.teachers.length}
                </p>
                <p className="text-gray-600 text-sm">giáo viên</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
