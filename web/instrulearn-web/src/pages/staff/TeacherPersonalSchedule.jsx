import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
  Badge,
  Tooltip,
  Drawer,
  Descriptions,
  Divider,
  Empty,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import locale from "antd/es/date-picker/locale/vi_VN";

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const TeacherPersonalSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [timeSlots, setTimeSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/get-all"
      );
      if (response.data) {
        const activeTeachers = response.data
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
    }
  };

  const fetchTeacherSchedules = async (teacherId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Schedules/teacher/${teacherId}/schedules`
      );

      if (response.data?.isSucceed) {
        const scheduleData = response.data.data;
        console.log("Schedule Data:", scheduleData);

        if (scheduleData.length > 0) {
          const startDate = dayjs(scheduleData[0].registrationStartDay);
          const endDate = dayjs(
            scheduleData[scheduleData.length - 1].startDate
          );

          setDateRange({
            start: startDate,
            end: endDate,
          });
          setSelectedWeek(startDate);
        }

        setSchedules(scheduleData);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Không thể tải lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeSlots(getTimeSlotsForCurrentWeek());
  }, [selectedWeek, schedules]);

  const getTimeSlotsForCurrentWeek = () => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    const schedulesInWeek = schedules.filter(
      (schedule) =>
        dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]") &&
        schedule.mode !== 0
    );

    const uniqueTimeSlots = [
      ...new Set(
        schedulesInWeek.map(
          (schedule) => `${schedule.timeStart} - ${schedule.timeEnd}`
        )
      ),
    ].sort();

    return uniqueTimeSlots;
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getDayOfWeekTag = (day) => {
    const dayMap = {
      Monday: { color: "red", text: "Thứ 2" },
      Tuesday: { color: "orange", text: "Thứ 3" },
      Wednesday: { color: "yellow", text: "Thứ 4" },
      Thursday: { color: "green", text: "Thứ 5" },
      Friday: { color: "blue", text: "Thứ 6" },
      Saturday: { color: "purple", text: "Thứ 7" },
      Sunday: { color: "magenta", text: "Chủ nhật" },
    };

    const dayInfo = dayMap[day] || { color: "default", text: day };
    return <Tag color={dayInfo.color}>{dayInfo.text}</Tag>;
  };

  const getWeekDates = (date) => {
    const startOfWeek = date.startOf("isoWeek");
    const endOfWeek = date.endOf("isoWeek");
    return {
      start: startOfWeek.format("DD/MM/YYYY"),
      end: endOfWeek.format("DD/MM/YYYY"),
    };
  };

  const getScheduleForTimeSlot = (day, timeSlot) => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    const schedule = schedules.find(
      (schedule) =>
        schedule.dayOfWeek === day &&
        `${schedule.timeStart} - ${schedule.timeEnd}` === timeSlot &&
        dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]") &&
        schedule.mode !== 0
    );

    if (schedule) {
      console.log("Found schedule:", schedule);
    }
    return schedule;
  };

  const handleWeekChange = (date) => {
    const selectedDate = dayjs(date);
    setSelectedWeek(selectedDate);
  };

  const handleTeacherChange = (teacherId) => {
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    setSelectedTeacher(teacher);
    fetchTeacherSchedules(teacherId);
  };

  const hasSchedulesInCurrentWeek = () => {
    const weekStart = dayjs(selectedWeek).startOf("isoWeek");
    const weekEnd = dayjs(selectedWeek).endOf("isoWeek");

    return schedules.some((schedule) =>
      dayjs(schedule.startDate).isBetween(weekStart, weekEnd, "day", "[]")
    );
  };

  const weekDates = getWeekDates(selectedWeek);

  const handleAddSchedule = async (values) => {
    try {
      const newSchedule = {
        scheduleId: schedules.length + 1,
        ...values,
        teacherName: teachers.find((t) => t.teacherId === values.teacherId)
          ?.fullname,
        studentName: teachers
          .find((t) => t.teacherId === values.teacherId)
          ?.majors.find((m) => m.majorId === values.majorId)?.studentName,
        courseName: teachers
          .find((t) => t.teacherId === values.teacherId)
          ?.majors.find((m) => m.majorId === values.majorId)?.courseName,
        status: "scheduled",
        payment: {
          amount:
            teachers
              .find((t) => t.teacherId === values.teacherId)
              ?.majors.find((m) => m.majorId === values.majorId)?.price || 0,
          status: "pending",
        },
      };

      await axios.post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Schedules/add",
        newSchedule
      );
      message.success("Thêm lịch dạy thành công");
      setModalVisible(false);
      form.resetFields();
      fetchTeacherSchedules(values.teacherId);
    } catch (error) {
      console.error("Error adding schedule:", error);
      message.error("Thêm lịch dạy thất bại");
    }
  };

  const showDrawer = (record) => {
    setSelectedSchedule(record);
    setDrawerVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "processing";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => record.startTime,
    },
    {
      title: "Thời lượng",
      key: "duration",
      render: (_, record) => <Tag color="blue">{record.duration} phút</Tag>,
      filters: [
        { text: "45 phút", value: "45" },
        { text: "90 phút", value: "90" },
        { text: "120 phút", value: "120" },
      ],
      onFilter: (value, record) => record.duration === value,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space>
          <Badge
            status={getStatusColor(record.status)}
            text={getStatusText(record.status)}
          />
        </Space>
      ),
      filters: [
        { text: "Đã lên lịch", value: "scheduled" },
        { text: "Đã hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                /* Handle edit */
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                /* Handle delete */
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="teacher-personal-schedule"
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
              <Title level={4}>Quản lý lịch dạy</Title>
              <Space>
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
                <DatePicker
                  picker="week"
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  format="DD/MM/YYYY"
                />
              </Space>
            </div>

            {selectedTeacher && (
              <div className="mb-4">
                <div className="text-gray-600">
                  <UserOutlined className="mr-2" />
                  Giáo viên: {selectedTeacher.fullname}
                  <br />
                  <CalendarOutlined className="mr-2" />
                  {dateRange.start && dateRange.end ? (
                    <>
                      Lịch dạy từ {dateRange.start.format("DD/MM/YYYY")} đến{" "}
                      {dateRange.end.format("DD/MM/YYYY")}
                      <br />
                      Tuần hiện tại: {weekDates.start} - {weekDates.end}
                      {!hasSchedulesInCurrentWeek() && (
                        <div className="text-orange-500 mt-1">
                          Không có lịch dạy trong tuần này
                        </div>
                      )}
                    </>
                  ) : (
                    "Chưa có lịch dạy"
                  )}
                </div>
              </div>
            )}

            {selectedTeacher ? (
              hasSchedulesInCurrentWeek() ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-100 w-32">
                          Thời gian
                        </th>
                        {days.map((day) => (
                          <th key={day} className="border p-2 bg-gray-100">
                            <div className="text-center">
                              {getDayOfWeekTag(day)}
                              <div className="text-xs text-gray-500 mt-1">
                                {dayjs(selectedWeek)
                                  .day(
                                    day === "Sunday" ? 7 : days.indexOf(day) + 1
                                  )
                                  .format("DD/MM")}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot}>
                          <td className="border p-2 text-center bg-gray-50">
                            <ClockCircleOutlined className="mr-1" />
                            {timeSlot}
                          </td>
                          {days.map((day) => {
                            const schedule = getScheduleForTimeSlot(
                              day,
                              timeSlot
                            );
                            return (
                              <td
                                key={`${day}-${timeSlot}`}
                                className="border p-2"
                              >
                                {schedule && (
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {schedule.learnerName || "---"}
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  description="Không có lịch dạy trong tuần này"
                  className="py-8"
                />
              )
            ) : (
              <Empty
                description="Vui lòng chọn giáo viên để xem lịch dạy"
                className="py-8"
              />
            )}
          </Card>

          <Card title="Chú thích" className="mt-4">
            <Row gutter={[16, 16]}>
              <Col>
                <Space>
                  <Tag color="blue">1-1</Tag>
                  <span>Học một kèm một</span>
                </Space>
              </Col>
            </Row>
          </Card>

          <Modal
            title="Thêm lịch dạy mới"
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={() => form.submit()}>
                Thêm
              </Button>,
            ]}
            width={720}
          >
            <Form form={form} layout="vertical" onFinish={handleAddSchedule}>
              <Form.Item
                name="teacherId"
                label="Giáo viên"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
              >
                <Select placeholder="Chọn giáo viên">
                  {teachers.map((teacher) => (
                    <Option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.fullname}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="majorId"
                label="Khóa học"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              >
                <Select placeholder="Chọn khóa học">
                  {teachers
                    .find(
                      (t) => t.teacherId === form.getFieldValue("teacherId")
                    )
                    ?.majors.map((major) => (
                      <Option key={major.majorId} value={major.majorId}>
                        {major.courseName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày dạy"
                rules={[{ required: true, message: "Vui lòng chọn ngày dạy" }]}
              >
                <DatePicker
                  locale={locale}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Form.Item
                  name="startTime"
                  label="Thời gian bắt đầu"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thời gian bắt đầu",
                    },
                  ]}
                  style={{ width: "300px" }}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="duration"
                  label="Thời lượng"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thời lượng buổi học",
                    },
                  ]}
                  style={{ width: "300px" }}
                >
                  <Select placeholder="Chọn thời lượng">
                    <Option value="45">45 phút</Option>
                    <Option value="90">90 phút</Option>
                    <Option value="120">120 phút</Option>
                  </Select>
                </Form.Item>
              </Space>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ dạy học" />
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Form>
          </Modal>

          <Drawer
            title="Chi tiết lịch dạy"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={600}
          >
            {selectedSchedule && (
              <>
                <Descriptions title="Thông tin chung" bordered column={1}>
                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={getStatusColor(selectedSchedule.status)}
                      text={getStatusText(selectedSchedule.status)}
                    />
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin giáo viên</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Giáo viên
                      </>
                    }
                  >
                    {selectedSchedule.teacherName}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin học viên</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Học viên
                      </>
                    }
                  >
                    {selectedSchedule.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <EnvironmentOutlined /> Địa chỉ
                      </>
                    }
                  >
                    {selectedSchedule.address}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin buổi học</Divider>
                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <>
                        <BookOutlined /> Khóa học
                      </>
                    }
                  >
                    {selectedSchedule.courseName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Thời gian
                      </>
                    }
                  >
                    {dayjs(selectedSchedule.date).format("DD/MM/YYYY")}{" "}
                    {selectedSchedule.startTime} ({selectedSchedule.duration}{" "}
                    phút)
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú">
                    {selectedSchedule.notes || "Không có ghi chú"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherPersonalSchedule;
