import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Input,
  Space,
  Typography,
  Card,
  Tag,
  Tooltip,
  Spin,
  Badge,
  Modal,
  Select,
  DatePicker,
  Divider,
  Image,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Fake data generator
const generateFakeBookings = () => {
  const instruments = [
    "Guitar",
    "Piano",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
  ];
  const teachers = [
    { id: 1, name: "Nguyễn Văn An", specialty: "Guitar" },
    { id: 2, name: "Trần Thị Bình", specialty: "Piano" },
    { id: 3, name: "Lê Minh Cường", specialty: "Violin" },
    { id: 4, name: "Phạm Hoàng Dương", specialty: "Drums" },
    { id: 5, name: "Hoàng Thị Emilia", specialty: "Flute" },
  ];
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  const slots = ["8:00 ", "10:00 ", "13:00 ", "15:00 ", "17:00 ", "19:00 "];
  const levels = [
    "Chưa biết gì",
    "1-3 tháng",
    "3-6 tháng",
    "1 năm",
    "Hơn 1 năm",
  ];
  const statuses = ["pending", "accepted", "rejected"];

  // Create one detailed example as requested
  const detailedExample = {
    bookingId: "BK1001",
    studentName: "Đỗ Minh Hiếu",
    studentEmail: "hieu.do@example.com",
    phoneNumber: "0912345678",
    instrument: "Piano",
    teacherId: 2,
    teacherName: "Trần Thị Bình",
    bookingDay: "Thứ 3",
    bookingSlot: "15:00 ",
    numberOfSlots: 12,
    proficiencyLevel: "1-3 tháng",
    learningRequirements:
      "Muốn học các bản nhạc cổ điển và luyện kỹ thuật chơi piano cơ bản",
    bookingDate: dayjs().add(2, "day").format(),
    status: "pending",
    videoUploadUrl: "https://example.com/uploads/hieu_piano_sample.mp4",
    courseName: "Khóa học Piano cá nhân",
    notes: "Học viên đã có kinh nghiệm 1 tháng tự học tại nhà",
    createdAt: dayjs().subtract(1, "day").format(),
  };

  // Generate 15 more random bookings
  const randomBookings = Array.from({ length: 15 }, (_, i) => {
    const teacherIndex = Math.floor(Math.random() * teachers.length);
    const selectedTeacher = teachers[teacherIndex];
    const level = levels[Math.floor(Math.random() * levels.length)];

    return {
      bookingId: `BK${1002 + i}`,
      studentName: `Học viên ${i + 1}`,
      studentEmail: `student${i + 1}@example.com`,
      phoneNumber: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      instrument: instruments[Math.floor(Math.random() * instruments.length)],
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      bookingDay: days[Math.floor(Math.random() * days.length)],
      bookingSlot: slots[Math.floor(Math.random() * slots.length)],
      numberOfSlots: Math.floor(Math.random() * 24) + 1,
      proficiencyLevel: level,
      learningRequirements: `Yêu cầu học ${Math.floor(Math.random() * 3) + 1}`,
      bookingDate: dayjs()
        .add(Math.floor(Math.random() * 14), "day")
        .format(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      videoUploadUrl:
        level !== "Chưa biết gì"
          ? `https://example.com/uploads/video_${i + 1}.mp4`
          : null,
      courseName: `Khóa học ${
        instruments[Math.floor(Math.random() * instruments.length)]
      } cá nhân`,
      notes: Math.random() > 0.5 ? `Ghi chú cho học viên ${i + 1}` : null,
      createdAt: dayjs()
        .subtract(Math.floor(Math.random() * 10), "day")
        .format(),
    };
  });

  return [detailedExample, ...randomBookings];
};

const Booking11Management = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("booking-management");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilterValue, setStatusFilterValue] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [instrumentFilter, setInstrumentFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Using fake data instead of API call
      setTimeout(() => {
        const fakeData = generateFakeBookings();
        setBookings(fakeData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating fake data:", error);
      message.error("Không thể tải danh sách yêu cầu đặt lịch");
      setBookings([]);
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // Simulating API call with timeout
      setLoading(true);
      setTimeout(() => {
        const updatedBookings = bookings.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, status: newStatus }
            : booking
        );
        setBookings(updatedBookings);
        setLoading(false);
        message.success(`Cập nhật trạng thái thành công`);

        // Đóng modal nếu đang mở
        if (viewModalVisible && selectedBooking?.bookingId === bookingId) {
          setViewModalVisible(false);
        }
      }, 500);
    } catch (error) {
      setLoading(false);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleView = (record) => {
    setSelectedBooking(record);
    setViewModalVisible(true);
  };

  const handleViewVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoModalVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ xác nhận
          </Tag>
        );
      case "accepted":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã chấp nhận
          </Tag>
        );
      case "rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    // Filters will be applied through filteredBookings below
  };

  const resetFilters = () => {
    setStatusFilterValue(null);
    setDateRange(null);
    setInstrumentFilter(null);
    setFilterModalVisible(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    // Lọc theo text tìm kiếm
    const searchMatches =
      booking.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.teacherName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.courseName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.instrument?.toLowerCase().includes(searchText.toLowerCase()) ||
      false;

    // Lọc theo trạng thái
    const statusMatches =
      !statusFilterValue || booking.status === statusFilterValue;

    // Lọc theo ngày
    let dateMatches = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const bookingDate = dayjs(booking.bookingDate);
      dateMatches =
        bookingDate.isAfter(dateRange[0]) && bookingDate.isBefore(dateRange[1]);
    }

    // Lọc theo nhạc cụ
    const instrumentMatches =
      !instrumentFilter || booking.instrument === instrumentFilter;

    return searchMatches && statusMatches && dateMatches && instrumentMatches;
  });

  const columns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Nhạc cụ",
      dataIndex: "instrument",
      key: "instrument",
      render: (text) => <Tag color="blue">{text}</Tag>,
      sorter: (a, b) => a.instrument.localeCompare(b.instrument),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (text) => <span>{text}</span>,
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: "Lịch học",
      key: "schedule",
      render: (_, record) => (
        <span>
          {record.bookingDay}, {record.bookingSlot}
        </span>
      ),
    },
    {
      title: "Trình độ",
      dataIndex: "proficiencyLevel",
      key: "proficiencyLevel",
      render: (level) => {
        let color = "default";
        if (level === "Chưa biết gì") color = "cyan";
        if (level === "1-3 tháng") color = "purple";
        if (level === "3-6 tháng") color = "orange";
        if (level === "1 năm") color = "red";
        if (level === "Hơn 1 năm") color = "red";
        return <Tag color={color}>{level}</Tag>;
      },
      filters: [
        { text: "Chưa biết gì", value: "Chưa biết gì" },
        { text: "1-3 tháng", value: "1-3 tháng" },
        { text: "3-6 tháng ", value: "3-6 tháng" },
        { text: "1 năm", value: "1 năm" },
        { text: "Hơn 1 năm", value: "Hơn 1 năm" },
      ],
      onFilter: (value, record) => record.proficiencyLevel === value,
    },
    {
      title: "Video",
      key: "video",
      render: (_, record) => (
        <>
          {record.videoUploadUrl &&
          record.proficiencyLevel !== "Chưa biết gì" ? (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleViewVideo(record.videoUploadUrl)}
            >
              Xem video
            </Button>
          ) : (
            <span className="text-gray-400">Không có</span>
          )}
        </>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ xác nhận", value: "pending" },
        { text: "Đã chấp nhận", value: "accepted" },
        { text: "Từ chối", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Chấp nhận">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ backgroundColor: "#52c41a" }}
                  onClick={() =>
                    handleStatusChange(record.bookingId, "accepted")
                  }
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  onClick={() =>
                    handleStatusChange(record.bookingId, "rejected")
                  }
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const instruments = [
    "Guitar",
    "Piano",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="p-6 min-h-screen bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý đơn học 1-1</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Tooltip title="Bộ lọc nâng cao">
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterModalVisible(true)}
                  />
                </Tooltip>
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchBookings} />
                </Tooltip>
              </Space>
            </div>

            <div className="mb-4">
              <Space wrap>
                <Badge
                  count={
                    filteredBookings.filter((b) => b.status === "pending")
                      .length
                  }
                  showZero
                >
                  <Tag
                    color="warning"
                    style={{ cursor: "pointer" }}
                    onClick={() => setStatusFilterValue("pending")}
                  >
                    Chờ xác nhận
                  </Tag>
                </Badge>
                <Badge
                  count={
                    filteredBookings.filter((b) => b.status === "accepted")
                      .length
                  }
                  showZero
                >
                  <Tag
                    color="success"
                    style={{ cursor: "pointer" }}
                    onClick={() => setStatusFilterValue("accepted")}
                  >
                    Đã chấp nhận
                  </Tag>
                </Badge>
                <Badge
                  count={
                    filteredBookings.filter((b) => b.status === "rejected")
                      .length
                  }
                  showZero
                >
                  <Tag
                    color="error"
                    style={{ cursor: "pointer" }}
                    onClick={() => setStatusFilterValue("rejected")}
                  >
                    Từ chối
                  </Tag>
                </Badge>
                <Divider type="vertical" />
                {instruments.map((instrument) => (
                  <Badge
                    key={instrument}
                    count={
                      filteredBookings.filter(
                        (b) => b.instrument === instrument
                      ).length
                    }
                    showZero
                  >
                    <Tag
                      color="blue"
                      style={{ cursor: "pointer" }}
                      onClick={() => setInstrumentFilter(instrument)}
                    >
                      {instrument}
                    </Tag>
                  </Badge>
                ))}
                {(statusFilterValue || instrumentFilter) && (
                  <Button
                    type="link"
                    onClick={() => {
                      setStatusFilterValue(null);
                      setInstrumentFilter(null);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="bookingId"
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} lịch học`,
                }}
              />
            </Spin>
          </Card>
        </Content>
      </Layout>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết yêu cầu đặt lịch"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={700}
        footer={
          selectedBooking?.status === "pending"
            ? [
                <Button key="cancel" onClick={() => setViewModalVisible(false)}>
                  Đóng
                </Button>,
                <Button
                  key="reject"
                  type="primary"
                  danger
                  onClick={() =>
                    handleStatusChange(selectedBooking.bookingId, "rejected")
                  }
                >
                  Từ chối
                </Button>,
                <Button
                  key="accept"
                  type="primary"
                  style={{ backgroundColor: "#52c41a" }}
                  onClick={() =>
                    handleStatusChange(selectedBooking.bookingId, "accepted")
                  }
                >
                  Chấp nhận
                </Button>,
              ]
            : [
                <Button key="close" onClick={() => setViewModalVisible(false)}>
                  Đóng
                </Button>,
              ]
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">Trạng thái:</p>
                {getStatusTag(selectedBooking.status)}
              </div>
              <div>
                <p className="font-bold">Mã đặt lịch:</p>
                <p>{selectedBooking.bookingId}</p>
              </div>
            </div>

            <Divider />

            <div className="font-bold text-lg">Thông tin học viên</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Học viên:</p>
                <p>{selectedBooking.studentName}</p>
              </div>
              <div>
                <p className="font-bold">Email:</p>
                <p>{selectedBooking.studentEmail || "Không có"}</p>
              </div>
            </div>

            <div>
              <p className="font-bold">Số điện thoại:</p>
              <p>{selectedBooking.phoneNumber || "Không có"}</p>
            </div>

            <Divider />

            <div className="font-bold text-lg">Thông tin đăng ký học</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Nhạc cụ:</p>
                <p>{selectedBooking.instrument}</p>
              </div>
              <div>
                <p className="font-bold">Giáo viên:</p>
                <p>{selectedBooking.teacherName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Ngày học:</p>
                <p>{selectedBooking.bookingDay}</p>
              </div>
              <div>
                <p className="font-bold">Khung giờ:</p>
                <p>{selectedBooking.bookingSlot}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Số buổi đăng ký:</p>
                <p>{selectedBooking.numberOfSlots} buổi</p>
              </div>
              <div>
                <p className="font-bold">Trình độ:</p>
                <p>{selectedBooking.proficiencyLevel}</p>
              </div>
            </div>

            <div>
              <p className="font-bold">Yêu cầu học:</p>
              <p>
                {selectedBooking.learningRequirements ||
                  "Không có yêu cầu cụ thể"}
              </p>
            </div>

            {selectedBooking.videoUploadUrl &&
              selectedBooking.proficiencyLevel !== "Chưa biết gì" && (
                <div>
                  <p className="font-bold">Video đã tải lên:</p>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() =>
                      handleViewVideo(selectedBooking.videoUploadUrl)
                    }
                  >
                    Xem video trình độ
                  </Button>
                </div>
              )}

            <div>
              <p className="font-bold">Ghi chú:</p>
              <p>{selectedBooking.notes || "Không có ghi chú"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Ngày tạo:</p>
                <p>
                  {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
              <div>
                <p className="font-bold">Ngày học dự kiến:</p>
                <p>{dayjs(selectedBooking.bookingDate).format("DD/MM/YYYY")}</p>
              </div>
            </div>

            {selectedBooking.status === "rejected" && (
              <div>
                <p className="font-bold">Lý do từ chối:</p>
                <p>
                  {selectedBooking.rejectionReason || "Không có lý do cụ thể"}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal xem video */}
      <Modal
        title="Xem video trình độ"
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVideoModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedVideo && (
          <div className="flex justify-center">
            {/* For simulation purposes, showing a placeholder image instead of video */}
            <div className="relative">
              <Image
                src="https://via.placeholder.com/640x360.png?text=Video+Preview"
                alt="Video Preview"
                style={{ maxWidth: "100%" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircleOutlined style={{ fontSize: 64, color: "white" }} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-500">
                  (Mô phỏng video - URL thực: {selectedVideo})
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal bộ lọc nâng cao */}
      <Modal
        title="Bộ lọc nâng cao"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={[
          <Button key="reset" onClick={resetFilters}>
            Xóa bộ lọc
          </Button>,
          <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="apply" type="primary" onClick={applyFilters}>
            Áp dụng
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1 font-medium">Trạng thái:</p>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
              value={statusFilterValue}
              onChange={setStatusFilterValue}
              allowClear
            >
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="accepted">Đã chấp nhận</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </div>

          <div>
            <p className="mb-1 font-medium">Nhạc cụ:</p>
            <Select
              placeholder="Chọn nhạc cụ"
              style={{ width: "100%" }}
              value={instrumentFilter}
              onChange={setInstrumentFilter}
              allowClear
            >
              {instruments.map((instrument) => (
                <Option key={instrument} value={instrument}>
                  {instrument}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1 font-medium">Khoảng thời gian:</p>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Booking11Management;
