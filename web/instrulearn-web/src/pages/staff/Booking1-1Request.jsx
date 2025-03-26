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
  Form,
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
import axios from "axios";

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

const convertDayToVietnamese = (day) => {
  const dayMap = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
  };
  return dayMap[day] || day;
};

const convertInstrumentToVietnamese = (instrument) => {
  const instrumentMap = {
    Guitar: "Guitar",
    Piano: "Piano",
    Violin: "Violin",
    Drums: "Trống",
    Flute: "Sáo",
    Saxophone: "Kèn Saxophone",
  };
  return instrumentMap[instrument] || instrument;
};

const convertBookingDataToVietnamese = (booking) => {
  return {
    ...booking,
    majorName: convertInstrumentToVietnamese(booking.majorName),
    learningDays: booking.learningDays.map((day) =>
      convertDayToVietnamese(day)
    ),
  };
};

const Booking11Management = () => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("booking-management");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [instrumentFilter, setInstrumentFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/LearningRegis/get-all"
      );
      if (response.data?.isSucceed) {
        const bookings = response.data.data.map((booking) => ({
          ...booking,
          learningDays: booking.learningDays.map((day) =>
            convertDayToVietnamese(day)
          ),
        }));
        setBookings(bookings);
      } else {
        throw new Error(
          response.data?.message || "Không thể tải danh sách yêu cầu"
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Không thể tải danh sách yêu cầu đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking) => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updateData = {
        learningRegisId: booking.learningRegisId,
        score: values.score || 0,
        levelAssigned: values.levelAssigned,
        price: values.price || 0,
        feedback: values.feedback || "",
      };

      const response = await axios.put(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/LearningRegis/update-status",
        updateData
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật trạng thái thành công");
        setStatusModalVisible(false);
        fetchBookings();
      } else {
        throw new Error(response.data?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  const showStatusModal = (record) => {
    setSelectedBooking(record);
    setStatusModalVisible(true);
    form.resetFields();
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
      case "Pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ xác nhận
          </Tag>
        );
      case "Accepted":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã chấp nhận
          </Tag>
        );
      case "Rejected":
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
    const values = form.getFieldsValue();
    setInstrumentFilter(values.instrument);
    setStatusFilter(values.status);
    setDateRange(values.dateRange);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setInstrumentFilter(null);
    setStatusFilter(null);
    setDateRange(null);
    form.resetFields();
  };

  const filteredBookings = bookings
    .filter((booking) => {
      // Lọc theo text tìm kiếm
      const searchMatches =
        booking.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.teacherName?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.majorName?.toLowerCase().includes(searchText.toLowerCase()) ||
        false;

      // Lọc theo nhạc cụ
      const instrumentMatches =
        !instrumentFilter || booking.majorName === instrumentFilter;

      // Lọc theo trạng thái
      const statusMatches = !statusFilter || booking.status === statusFilter;

      // Lọc theo khoảng thời gian
      const dateMatches =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (dayjs(booking.requestDate).isAfter(dateRange[0], "day") &&
          dayjs(booking.requestDate).isBefore(dateRange[1], "day"));

      return searchMatches && instrumentMatches && statusMatches && dateMatches;
    })
    .sort(
      (a, b) => dayjs(b.requestDate).valueOf() - dayjs(a.requestDate).valueOf()
    ); // Sắp xếp theo thời gian mới nhất

  const columns = [
    {
      title: "Học viên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="font-medium">{text}</span>,
      width: 150,
    },
    {
      title: "Nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 100,
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 150,
    },
    {
      title: "Thời gian học",
      key: "schedule",
      render: (_, record) => <span>{record.timeLearning} phút</span>,
      width: 120,
    },
    {
      title: "Số buổi",
      dataIndex: "numberOfSession",
      key: "numberOfSession",
      width: 80,
    },
    {
      title: "Video",
      key: "video",
      render: (_, record) => (
        <>
          {record.videoUrl && record.videoUrl !== "string" ? (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleViewVideo(record.videoUrl)}
            >
              Xem video
            </Button>
          ) : (
            <span className="text-gray-400">Không có</span>
          )}
        </>
      ),
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ xác nhận", value: "Pending" },
        { text: "Đã chấp nhận", value: "Accepted" },
        { text: "Từ chối", value: "Rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
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
          {record.status === "Pending" && (
            <Tooltip title="Cập nhật trạng thái">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => showStatusModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 100,
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
                  placeholder="Tìm kiếm theo tên học viên, giáo viên..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
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

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="bookingId"
                scroll={{ x: 1300 }}
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} đơn đăng ký`,
                  defaultPageSize: 20,
                }}
                size="middle"
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
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          selectedBooking?.status === "Pending" && (
            <Button
              key="update"
              type="primary"
              onClick={() => {
                setViewModalVisible(false);
                showStatusModal(selectedBooking);
              }}
            >
              Cập nhật trạng thái
            </Button>
          ),
        ]}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">Trạng thái:</p>
                {getStatusTag(selectedBooking.status)}
              </div>
            </div>

            <Divider />

            <div className="font-bold text-lg">Thông tin học viên</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Học viên:</p>
                <p>{selectedBooking.fullName}</p>
              </div>
              <div>
                <p className="font-bold">Số điện thoại:</p>
                <p>{selectedBooking.phoneNumber || "Không có"}</p>
              </div>
            </div>

            <Divider />

            <div className="font-bold text-lg">Thông tin đăng ký học</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Nhạc cụ:</p>
                <p>{selectedBooking.majorName}</p>
              </div>
              <div>
                <p className="font-bold">Giáo viên:</p>
                <p>{selectedBooking.teacherName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Thời gian học:</p>
                <p>
                  {selectedBooking.timeStart?.substring(0, 5)} -{" "}
                  {selectedBooking.timeEnd?.substring(0, 5)} (
                  {selectedBooking.timeLearning} phút)
                </p>
              </div>
              <div>
                <p className="font-bold">Số buổi học:</p>
                <p>{selectedBooking.numberOfSession} buổi</p>
              </div>
            </div>

            <div>
              <p className="font-bold">Ngày học trong tuần:</p>
              <div className="flex gap-2 flex-wrap">
                {selectedBooking.learningDays.map((day, index) => (
                  <Tag key={index} color="blue">
                    {day}
                  </Tag>
                ))}
              </div>
            </div>

            {selectedBooking.learningRequest && (
              <div>
                <p className="font-bold">Yêu cầu học:</p>
                <p>{selectedBooking.learningRequest}</p>
              </div>
            )}

            {selectedBooking.videoUrl &&
              selectedBooking.videoUrl !== "string" && (
                <div>
                  <p className="font-bold mb-2">Video đã tải lên:</p>
                  <div className="w-full aspect-video">
                    <video
                      src={selectedBooking.videoUrl}
                      controls
                      className="w-full h-full rounded-lg"
                      controlsList="nodownload"
                      playsInline
                      preload="auto"
                      style={{ maxHeight: "50vh" }}
                    >
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  </div>
                </div>
              )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Ngày yêu cầu:</p>
                <p>
                  {dayjs(selectedBooking.requestDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
              </div>
              {selectedBooking.startDay && (
                <div>
                  <p className="font-bold">Ngày bắt đầu:</p>
                  <p>{dayjs(selectedBooking.startDay).format("DD/MM/YYYY")}</p>
                </div>
              )}
            </div>

            {selectedBooking.levelAssigned && (
              <div>
                <p className="font-bold">Cấp độ được xếp:</p>
                <p>{selectedBooking.levelAssigned}</p>
              </div>
            )}

            {selectedBooking.score !== null && (
              <div>
                <p className="font-bold">Điểm đánh giá:</p>
                <p>{selectedBooking.score}</p>
              </div>
            )}

            {selectedBooking.price && (
              <div>
                <p className="font-bold">Học phí:</p>
                <p>{selectedBooking.price.toLocaleString("vi-VN")} VNĐ</p>
              </div>
            )}

            {selectedBooking.feedback && (
              <div>
                <p className="font-bold">Phản hồi:</p>
                <p>{selectedBooking.feedback}</p>
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
            <div className="w-full aspect-video">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                controlsList="nodownload"
                playsInline
                preload="auto"
                style={{ maxHeight: "70vh" }}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
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
        <Form form={form} layout="vertical">
          <Form.Item name="instrument" label="Nhạc cụ">
            <Select
              placeholder="Chọn nhạc cụ"
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Guitar">Guitar</Option>
              <Option value="Piano">Piano</Option>
              <Option value="Violin">Violin</Option>
              <Option value="Drums">Trống</Option>
              <Option value="Flute">Sáo</Option>
              <Option value="Saxophone">Kèn Saxophone</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select
              placeholder="Chọn trạng thái"
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Pending">Chờ xác nhận</Option>
              <Option value="Accepted">Đã chấp nhận</Option>
              <Option value="Rejected">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Khoảng thời gian">
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái đăng ký"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={() => handleStatusChange(selectedBooking)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="score"
            label="Điểm đánh giá"
            rules={[{ required: true, message: "Vui lòng nhập điểm đánh giá" }]}
          >
            <Input type="number" min={0} max={10} />
          </Form.Item>

          <Form.Item
            name="levelAssigned"
            label="Cấp độ"
            rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
          >
            <Select placeholder="Chọn cấp độ">
              <Option value="Gà">Gà</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Khá">Khá</Option>
              <Option value="Giỏi">Giỏi</Option>
              <Option value="Chuyên gia">Chuyên gia</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Học phí"
            rules={[{ required: true, message: "Vui lòng nhập học phí" }]}
          >
            <Input type="number" min={0} addonAfter="VNĐ" />
          </Form.Item>

          <Form.Item
            name="feedback"
            label="Phản hồi"
            rules={[{ required: true, message: "Vui lòng nhập phản hồi" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Booking11Management;
