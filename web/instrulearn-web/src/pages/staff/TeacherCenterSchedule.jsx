import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Space,
  Button,
  Select,
  message,
  Calendar,
  Radio,
  Popover,
  Avatar,
  Tag,
  Spin,
  Input,
  Tooltip,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Table,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const TeacherCenterSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month");
  const [searchText, setSearchText] = useState("");
  const [calendarView, setCalendarView] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách giáo viên khi trang được tải
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Lọc dữ liệu lịch học khi searchText hoặc schedules thay đổi
  useEffect(() => {
    if (schedules.length > 0) {
      const filtered = schedules.filter(
        (schedule) =>
          schedule.teacherName
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          schedule.className.toLowerCase().includes(searchText.toLowerCase()) ||
          schedule.dayOfWeek.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSchedules(filtered);
    }
  }, [searchText, schedules]);

  // Lấy danh sách giáo viên từ API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const teacherResponse = await fetch(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Teacher/get-all"
      );
      const responseData = await teacherResponse.json();
      if (responseData) {
        const activeTeachers = responseData
          .filter((item) => item.isSucceed && item.data.isActive === 1)
          .map((item) => ({
            ...item.data,
            majors: item.data.majors.filter((major) => major.status === 1),
          }));
        setTeachers(activeTeachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("Không thể tải danh sách giáo viên");
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch học của giáo viên từ API
  const fetchTeacherSchedules = async (teacherId) => {
    try {
      setLoading(true);
      const scheduleResponse = await fetch(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/classs`
      );
      const data = await scheduleResponse.json();

      if (data.isSucceed) {
        setSchedules(data.data);
      } else {
        setSchedules([]);
        message.error("Không thể tải lịch dạy của giáo viên");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Không thể tải lịch dạy của giáo viên");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn giáo viên
  const handleTeacherChange = (teacherId) => {
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    setSelectedTeacher(teacher);
    fetchTeacherSchedules(teacherId);
  };

  // Thêm một lịch dạy mới
  const handleAddSchedule = (values) => {
    message.info("Chức năng này đang được phát triển");
    setModalVisible(false);
    form.resetFields();
  };

  // Cập nhật lịch dạy
  const handleEditSchedule = (values) => {
    message.info("Chức năng này đang được phát triển");
    setModalVisible(false);
    setEditingSchedule(null);
    form.resetFields();
  };

  // Xóa lịch dạy
  const handleDeleteSchedule = (id) => {
    message.info("Chức năng này đang được phát triển");
  };

  // Render cell cho calendar view
  const dateCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const daySchedules = schedules.filter(
      (schedule) => schedule.startDay === date
    );

    if (daySchedules.length === 0) return null;

    return (
      <div className="h-full">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-blue-600 font-medium">
            {daySchedules.length} buổi học
          </div>
        </div>
      </div>
    );
  };

  // Style cho cell trong calendar view
  const getDateCellStyle = (value) => {
    const date = value.format("YYYY-MM-DD");
    const hasSchedules = schedules.some(
      (schedule) => schedule.startDay === date
    );

    if (hasSchedules) {
      return {
        backgroundColor: "#f0f7ff",
        borderRadius: "4px",
        cursor: "pointer",
      };
    }
    return {};
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

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: "Giáo Viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Thứ",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      render: (text) => {
        const vietnameseDays = {
          Monday: "Thứ 2",
          Tuesday: "Thứ 3",
          Wednesday: "Thứ 4",
          Thursday: "Thứ 5",
          Friday: "Thứ 6",
          Saturday: "Thứ 7",
          Sunday: "Chủ nhật",
        };
        return vietnameseDays[text] || text;
      },
    },
    {
      title: "Ngày học",
      dataIndex: "startDay",
      key: "startDay",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ Học",
      key: "time",
      render: (_, record) => `${record.timeStart} - ${record.timeEnd}`,
    },
    {
      title: "Loại",
      dataIndex: "mode",
      key: "mode",
      render: (text) => {
        const colorMap = {
          Center: "green",
          OneOnOne: "blue",
          Online: "purple",
        };
        const modeNames = {
          Center: "Trung tâm",
          OneOnOne: "1-1",
          Online: "Trực tuyến",
        };
        return <Tag color={colorMap[text]}>{modeNames[text] || text}</Tag>;
      },
    },
    {
      title: "Học viên",
      dataIndex: "learnerName",
      key: "learnerName",
      render: (text) => text || <Tag color="orange">Chưa có học viên</Tag>,
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingSchedule(record);
                form.setFieldsValue({
                  teacherId: record.teacherId,
                  className: record.className,
                  dayOfWeek: record.dayOfWeek,
                  date: dayjs(record.startDay),
                  time: [
                    dayjs(record.timeStart, "HH:mm"),
                    dayjs(record.timeEnd, "HH:mm"),
                  ],
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteSchedule(record.scheduleId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="teacher-center-schedule"
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
          <Card className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý lịch dạy tại trung tâm</Title>
              <Select
                placeholder="Chọn giáo viên"
                style={{ width: 200 }}
                onChange={handleTeacherChange}
              >
                {teachers.map((teacher) => (
                  <Option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.fullname}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedTeacher && (
              <div className="mb-4">
                <div className="text-gray-600">
                  <UserOutlined className="mr-2" />
                  Giáo viên: {selectedTeacher.fullname}
                </div>
              </div>
            )}

            <Card className="shadow-sm">
              <div className="mb-4">
                <Radio.Group
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <Radio.Button value="month">Tháng</Radio.Button>
                  <Radio.Button value="week">Tuần</Radio.Button>
                </Radio.Group>
              </div>

              <Calendar
                mode={viewMode}
                fullscreen={false}
                className="custom-calendar"
                cellRender={(date) => {
                  const dateStr = date.format("YYYY-MM-DD");
                  const daySchedules = schedules.filter(
                    (schedule) => schedule.startDay === dateStr
                  );

                  if (daySchedules.length === 0) return null;

                  return (
                    <Popover
                      content={
                        <div className="p-2">
                          <div className="font-medium mb-2">
                            Lịch dạy ngày {date.format("DD/MM/YYYY")}
                          </div>
                          <div className="space-y-2">
                            {daySchedules.map((schedule) => (
                              <div
                                key={schedule.scheduleId}
                                className="border rounded p-2"
                              >
                                <div className="flex items-center mb-1">
                                  <Avatar
                                    icon={<UserOutlined />}
                                    size="small"
                                    className="mr-2"
                                  />
                                  <div className="font-medium">
                                    {schedule.className}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <Tag color="blue">
                                    {convertDayToVietnamese(schedule.dayOfWeek)}
                                  </Tag>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <ClockCircleOutlined className="mr-1" />
                                  {schedule.timeStart} - {schedule.timeEnd}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <EnvironmentOutlined className="mr-1" />
                                  Trung tâm
                                </div>
                                {schedule.participants &&
                                  schedule.participants.length > 0 && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      <TeamOutlined className="mr-1" />
                                      Số học viên:{" "}
                                      {schedule.participants.length}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      }
                      trigger="click"
                    >
                      <div style={getDateCellStyle(date)}>
                        {dateCellRender(date)}
                      </div>
                    </Popover>
                  );
                }}
              />
            </Card>
          </Card>

          {/* Modal thêm/sửa lịch dạy */}
          <Modal
            title={editingSchedule ? "Chỉnh Sửa Lịch Dạy" : "Thêm Lịch Dạy"}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setEditingSchedule(null);
            }}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={
                editingSchedule ? handleEditSchedule : handleAddSchedule
              }
            >
              {!editingSchedule && (
                <Form.Item
                  name="teacherId"
                  label="Giáo Viên"
                  rules={[
                    { required: true, message: "Vui lòng chọn giáo viên" },
                  ]}
                >
                  <Select placeholder="Chọn giáo viên">
                    {teachers.map((teacher) => (
                      <Option key={teacher.teacherId} value={teacher.teacherId}>
                        {teacher.fullname}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item
                name="className"
                label="Tên Lớp"
                rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
              >
                <Input placeholder="Nhập tên lớp" />
              </Form.Item>

              <Form.Item
                name="dayOfWeek"
                label="Thứ"
                rules={[{ required: true, message: "Vui lòng chọn thứ" }]}
              >
                <Select placeholder="Chọn thứ">
                  <Option value="Monday">Thứ 2</Option>
                  <Option value="Tuesday">Thứ 3</Option>
                  <Option value="Wednesday">Thứ 4</Option>
                  <Option value="Thursday">Thứ 5</Option>
                  <Option value="Friday">Thứ 6</Option>
                  <Option value="Saturday">Thứ 7</Option>
                  <Option value="Sunday">Chủ nhật</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker className="w-full" placeholder="Chọn ngày" />
              </Form.Item>

              <Form.Item
                name="time"
                label="Giờ Học"
                rules={[{ required: true, message: "Vui lòng chọn giờ học" }]}
              >
                <TimePicker.RangePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingSchedule ? "Cập Nhật" : "Thêm Mới"}
                  </Button>
                  <Button
                    onClick={() => {
                      setModalVisible(false);
                      setEditingSchedule(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherCenterSchedule;
