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
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/TeacherMajor/get-all"
      );

      if (response.data && Array.isArray(response.data)) {
        // Tạo một map để lưu trữ giáo viên theo nhạc cụ
        const teachersByInstrument = {};

        // Lặp qua từng giáo viên
        response.data.forEach((item) => {
          if (item.isSucceed && item.data) {
            const teacher = item.data.teacher;
            const major = teacher.majors[0];
            const status = item.data.status;

            // Chỉ thêm giáo viên vào danh sách nếu status = 1
            if (status === 1) {
              if (!teachersByInstrument[major.majorName]) {
                teachersByInstrument[major.majorName] = {
                  instrument: major.majorName,
                  description: `Học ${major.majorName} để phát triển kỹ năng chơi nhạc cụ`,
                  teachers: [],
                };
              }

              // Thêm giáo viên vào danh sách của nhạc cụ
              teachersByInstrument[major.majorName].teachers.push({
                id: teacher.teacherId,
                name: teacher.fullname,
                experience: "Chưa có thông tin",
                details: "Chưa có mô tả",
                image: "https://randomuser.me/api/portraits/men/1.jpg",
                phoneNumber: "Chưa cập nhật",
                gender: "Chưa cập nhật",
                address: "Chưa cập nhật",
                dateOfEmployment: "Chưa cập nhật",
                isActive: 1,
                majors: teacher.majors,
                links: "Chưa có liên kết",
              });
            }
          }
        });

        const teachersArray = Object.values(teachersByInstrument);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[50vh] bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-pink-900/90 z-10"></div>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Music Background"
            className="w-full h-full object-cover transform scale-105 animate-zoom"
          />
        </div>
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-6xl font-bold text-center mb-6 animate-fade-in">
            Đội Ngũ Giáo Viên Tài Năng
          </h1>
          <p className="text-xl text-center max-w-2xl mb-12 text-gray-200 animate-fade-in-up">
            Khám phá đội ngũ giáo viên giàu kinh nghiệm, tận tâm và chuyên
            nghiệp
          </p>
          <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm giáo viên hoặc nhạc cụ..."
                className="w-full p-5 pl-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchOutlined className="absolute left-6 top-6 text-gray-300 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide">
            <button
              className={`px-8 py-3 rounded-full whitespace-nowrap transition-all duration-300 text-lg font-medium ${
                activeCategoryTab === "all"
                  ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveCategoryTab("all")}
            >
              Tất cả
            </button>
            {teachers.map((category) => (
              <button
                key={category.instrument}
                className={`px-8 py-3 rounded-full whitespace-nowrap transition-all duration-300 text-lg font-medium ${
                  activeCategoryTab === category.instrument
                    ? "bg-indigo-600 text-white shadow-lg transform scale-105"
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
      <main className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">
              Đang tải danh sách giáo viên...
            </p>
          </div>
        ) : filteredTeachersData.length > 0 ? (
          filteredTeachersData.map(
            (category) =>
              category.teachers.length > 0 && (
                <div key={category.instrument} className="mb-20">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-4xl font-bold text-gray-900 mb-3">
                        {category.instrument}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {category.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCategory(category.instrument)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                      {expandedCategories.includes(category.instrument) ? (
                        <UpOutlined className="text-3xl" />
                      ) : (
                        <DownOutlined className="text-3xl" />
                      )}
                    </button>
                  </div>

                  {expandedCategories.includes(category.instrument) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {category.teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl"
                        >
                          <div className="relative h-72">
                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/400/320";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute top-4 right-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(teacher.id);
                                }}
                                className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                              >
                                {favorites.includes(teacher.id) ? (
                                  <HeartFilled className="text-pink-500 text-2xl" />
                                ) : (
                                  <HeartOutlined className="text-gray-500 text-2xl" />
                                )}
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <div className="flex items-center gap-2">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-base font-medium text-gray-700 shadow-lg">
                                  {teacher.experience}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                              {teacher.name}
                            </h3>
                            <p className="text-gray-600 mb-6 line-clamp-2 text-lg">
                              {teacher.details}
                            </p>

                            <div className="flex gap-4">
                              <button
                                onClick={() =>
                                  navigate(`/teacher-profile/${teacher.id}`)
                                }
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg"
                              >
                                Chi tiết
                              </button>
                              <Link to={"/booking1-1"} className="flex-1">
                                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl">
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
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <SearchOutlined className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-3xl font-semibold text-gray-900 mb-4">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              Vui lòng thử lại với từ khóa khác hoặc kiểm tra lại các bộ lọc của
              bạn
            </p>
          </div>
        )}
      </main>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Thống Kê Giáo Viên
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {teachers.map((category) => (
              <div
                key={category.instrument}
                className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {category.instrument}
                </h3>
                <p className="text-5xl font-bold text-indigo-600 mb-2">
                  {category.teachers.length}
                </p>
                <p className="text-gray-600 text-lg">giáo viên</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
