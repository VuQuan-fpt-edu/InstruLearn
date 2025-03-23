import { useState, useEffect } from "react";
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
import axios from "axios";

export default function MusicTeachersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/get-all"
      );

      if (response.data) {
        // Nhóm giáo viên theo majorName
        const groupedTeachers = response.data.reduce((acc, teacher) => {
          const majorName = teacher.data.major.majorName;
          if (!acc[majorName]) {
            acc[majorName] = {
              instrument: majorName,
              description: `Học ${majorName} để phát triển kỹ năng chơi nhạc cụ`,
              teachers: [],
            };
          }
          acc[majorName].teachers.push({
            id: teacher.data.teacherId,
            name: teacher.data.fullname,
            experience: teacher.data.heading || "Chưa có thông tin",
            details: teacher.data.details || "Chưa có mô tả",
            image: "https://randomuser.me/api/portraits/men/1.jpg",
            links: teacher.data.links,
          });
          return acc;
        }, {});

        const teachersArray = Object.values(groupedTeachers);
        setTeachers(teachersArray);
        setExpandedCategories(teachersArray.map((cat) => cat.instrument));
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

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
  const filteredTeachersData = teachers
    .map((category) => {
      const filteredTeachers = category.teachers.filter((teacher) => {
        if (searchTerm === "") return true;
        const term = searchTerm.toLowerCase();
        return (
          teacher.name.toLowerCase().includes(term) ||
          teacher.experience.toLowerCase().includes(term) ||
          teacher.details.toLowerCase().includes(term)
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
                placeholder="Tìm kiếm giáo viên hoặc nhạc cụ..."
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
            {teachers.map((category) => (
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
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredTeachersData.length > 0 ? (
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
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {teacher.details}
                            </p>

                            <div className="flex gap-3">
                              <button
                                onClick={() =>
                                  navigate(`/teacher-profile/${teacher.id}`)
                                }
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
            {teachers.map((category) => (
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
