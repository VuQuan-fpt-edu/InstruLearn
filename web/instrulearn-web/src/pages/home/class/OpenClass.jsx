import { useState, useEffect } from "react";
import {
  Card,
  Badge,
  Button,
  Select,
  Input,
  Tag,
  Spin,
  message,
  Modal,
  Alert,
  Divider,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;
const { Search } = Input;

export default function OpenClasses() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    instrument: "all",
    availability: "all",
  });
  const navigate = useNavigate();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [
    isInsufficientBalanceModalVisible,
    setIsInsufficientBalanceModalVisible,
  ] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://instrulearnapplication.azurewebsites.net/api/Class/get-all"
      );
      const data = await response.json();

      // Xử lý dữ liệu mới từ API và chỉ lấy các lớp đang mở
      const processedClasses = data
        .filter((classItem) => classItem.status === 0) // Chỉ lấy các lớp đang mở
        .map((classItem) => ({
          ...classItem,
          coursePackageName: classItem.majorName,
          students: classItem.students || [],
        }));

      // Kiểm tra trạng thái tham gia ngay khi nhận dữ liệu
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
      setClasses(processedClasses);
      setFilteredClasses(processedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setUserProfile(response.data.data);
        await fetchWalletBalance(response.data.data.learnerId);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    }
  };

  const fetchWalletBalance = async (learnerId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/wallet/${learnerId}`,
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

  useEffect(() => {
    applyFilters();
  }, [filters, classes]);

  useEffect(() => {
    if (selectedClass && userProfile) {
      const isJoined = selectedClass.students?.some(
        (student) => student.learnerId === userProfile.learnerId
      );
      setHasJoined(isJoined);
    }
  }, [selectedClass, userProfile]);

  const applyFilters = () => {
    let result = [...classes];

    // Lọc theo tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (classItem) =>
          classItem.className.toLowerCase().includes(searchLower) ||
          classItem.teacherName.toLowerCase().includes(searchLower) ||
          classItem.coursePackageName.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo nhạc cụ
    if (filters.instrument !== "all") {
      result = result.filter(
        (classItem) => classItem.coursePackageName === filters.instrument
      );
    }

    // Lọc theo chỗ trống
    if (filters.availability === "available") {
      result = result.filter((classItem) => classItem.maxStudents > 0);
    } else if (filters.availability === "limited") {
      result = result.filter(
        (classItem) => classItem.maxStudents > 0 && classItem.maxStudents <= 3
      );
    } else if (filters.availability === "full") {
      result = result.filter((classItem) => classItem.maxStudents === 0);
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

    // Kiểm tra xem học viên đã tham gia lớp chưa
    const isJoined = classItem.students?.some(
      (student) => student.learnerId === userProfile?.learnerId
    );

    if (isJoined) {
      message.info("Bạn đã tham gia lớp học này");
      return;
    }

    const depositAmount = classItem.price * 0.1; // 10% học phí
    setSelectedClass(classItem);

    if (walletBalance < depositAmount) {
      setIsInsufficientBalanceModalVisible(true);
    } else {
      setIsConfirmModalVisible(true);
    }
  };

  const handleConfirmJoin = async () => {
    if (!selectedClass || !userProfile) return;

    try {
      setJoining(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/join-class",
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
        fetchClasses();
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

  const handleNavigateToWallet = () => {
    setIsInsufficientBalanceModalVisible(false);
    navigate("/profile/topup");
  };

  // Thêm useEffect để cập nhật lại danh sách khi userProfile thay đổi
  useEffect(() => {
    if (userProfile) {
      fetchClasses();
    }
  }, [userProfile]);

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
                  onChange={handleInstrumentChange}
                  className="w-full"
                >
                  <Option value="all">Tất cả nhạc cụ</Option>
                  {Array.from(
                    new Set(classes.map((item) => item.coursePackageName))
                  ).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* <div>
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
              </div> */}
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
                      key={classItem.classId}
                      hoverable
                      className="overflow-hidden shadow-md border border-gray-200 rounded-md hover:shadow-lg transition-shadow"
                      cover={
                        <img
                          alt={classItem.className}
                          src={
                            classItem.imageUrl ||
                            "https://placehold.co/600x400?text=No+Image"
                          }
                          className="w-full h-48 object-cover"
                        />
                      }
                    >
                      <div className="mb-2">
                        <Badge
                          count={`${classItem.maxStudents} chỗ`}
                          style={{
                            backgroundColor: getStatusColor(classItem.status),
                          }}
                        />
                        <Tag color="blue" className="ml-2">
                          {classItem.majorName}
                        </Tag>
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
                        {classItem.majorName}
                      </p>

                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <CalendarOutlined className="mr-2" />
                        {formatClassDays(classItem.classDays)}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(classItem.price)}/Buổi
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
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm Join Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              Xác nhận đăng ký lớp học
            </div>
            <div className="text-gray-500">
              Vui lòng kiểm tra thông tin trước khi xác nhận
            </div>
          </div>
        }
        open={isConfirmModalVisible}
        onOk={handleConfirmJoin}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Xác nhận đăng ký"
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
                {selectedClass?.className}
              </div>
              <div className="text-gray-600 mb-4">
                Giáo viên: {selectedClass?.teacherName}
              </div>
              <div className="text-xl font-bold text-purple-600 mb-2">
                Phí giữ chỗ (10%)
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-2">
                {formatPrice(selectedClass?.price * 0.1)}
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
                  {formatPrice(
                    walletBalance - (selectedClass?.price * 0.1 || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
          <Alert
            message="Lưu ý"
            description="Phí giữ chỗ sẽ được trừ ngay khi bạn xác nhận đăng ký. Phí này không được hoàn lại nếu bạn hủy đăng ký."
            type="warning"
            showIcon
          />
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
              Vui lòng nạp thêm tiền để đăng ký lớp học
            </div>
          </div>
        }
        open={isInsufficientBalanceModalVisible}
        onOk={handleNavigateToWallet}
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
                <span>Phí giữ chỗ cần thanh toán:</span>
                <span className="font-medium">
                  {formatPrice(selectedClass?.price * 0.1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền cần nạp thêm:</span>
                <span className="font-medium text-red-600">
                  {formatPrice(
                    (selectedClass?.price * 0.1 || 0) - walletBalance
                  )}
                </span>
              </div>
            </div>
          </div>
          <Alert
            message="Lưu ý"
            description="Bạn cần nạp đủ số tiền phí giữ chỗ để đăng ký tham gia lớp học."
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
}
