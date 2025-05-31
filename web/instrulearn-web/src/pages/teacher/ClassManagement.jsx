import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Typography,
  Tooltip,
  Modal,
  message,
  Drawer,
  Descriptions,
  Divider,
  Progress,
  Badge,
  Switch,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import axios from "axios";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;

const ClassManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: "" });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Không tìm thấy thông tin đăng nhập");

      // Lấy profile để lấy teacherId
      const profileRes = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!profileRes.data.isSucceed) throw new Error("Không lấy được profile");

      const teacherId = profileRes.data.data.teacherId;
      if (!teacherId) throw new Error("Không tìm thấy teacherId");

      // Lấy danh sách lớp
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Class/teacher/${teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.isSucceed) {
        setClasses(response.data.data);
        console.log("Dữ liệu lớp học từ API:", response.data.data);
      } else {
        throw new Error(
          response.data.message || "Không thể lấy danh sách lớp học"
        );
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error(error.message || "Có lỗi xảy ra khi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewClass = (classData) => {
    setSelectedClass(classData);
    setDrawerVisible(true);
  };

  const handleEditClass = (classData) => {
    message.info("Chức năng chỉnh sửa đang được phát triển");
  };

  const handleDeleteClass = (classData) => {
    Modal.confirm({
      title: "Xác nhận xóa lớp học",
      content: `Bạn có chắc chắn muốn xóa lớp học ${classData.className}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk() {
        message.success("Đã xóa lớp học thành công");
      },
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="blue">Chưa bắt đầu</Tag>;
      case 1:
        return <Tag color="green">Đang kiểm tra</Tag>;
      case 2:
        return <Tag color="orange">Đang diễn ra</Tag>;
      case 3:
        return <Tag color="red">Đã kết thúc</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: "Tên lớp",
      dataIndex: "className",
      key: "className",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.className.localeCompare(b.className),
    },
    {
      title: "Môn học",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Trình độ",
      dataIndex: "levelName",
      key: "levelName",
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <ClockCircleOutlined />{" "}
            {dayjs(record.classTime, "HH:mm:ss").format("HH:mm")} -{" "}
            {dayjs(record.classEndTime, "HH:mm:ss").format("HH:mm")}
          </Space>
          <Space>
            <CalendarOutlined /> {dayjs(record.startDate).format("DD/MM/YYYY")}{" "}
            - {dayjs(record.endDate).format("DD/MM/YYYY")}
          </Space>
        </Space>
      ),
    },
    {
      title: "Học viên",
      key: "students",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Progress
            percent={
              record.maxStudents > 0
                ? Math.round((record.studentCount / record.maxStudents) * 100)
                : 0
            }
            size="small"
            status={
              record.studentCount >= record.maxStudents ? "exception" : "active"
            }
          />
          <Text type="secondary">
            {record.studentCount}/{record.maxStudents} học viên
          </Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewClass(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredClasses = classes.filter(
    (classData) =>
      classData.className.toLowerCase().includes(searchText.toLowerCase()) ||
      classData.majorName.toLowerCase().includes(searchText.toLowerCase()) ||
      classData.levelName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleUpdateEligibility = async (learnerId, classId, isEligible) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "https://instrulearnapplication.azurewebsites.net/api/Class/update-learner-eligibility",
        {
          learnerId,
          classId,
          isEligible,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.isSucceed) {
        message.success({
          content: "Cập nhật trạng thái học viên thành công!",
          type: "success",
          duration: 2,
        });
        fetchClassDetail(classId);
      } else {
        setErrorModal({
          visible: true,
          message: response.data?.message || "Cập nhật trạng thái thất bại!",
        });
      }
    } catch (error) {
      let msg = "Cập nhật trạng thái thất bại!";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        msg = error.response.data.message;
      }
      setErrorModal({ visible: true, message: msg });
    }
  };

  // Hàm lấy chi tiết lớp học theo classId
  const fetchClassDetail = async (classId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.isSucceed) {
        setSelectedClass(response.data.data);
      }
    } catch (error) {
      message.error("Không thể làm mới chi tiết lớp học!");
    }
  };

  return (
    <Layout className="min-h-screen">
      <TeacherSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <TeacherHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <Title level={4}>Quản lý lớp học</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm lớp học..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 300 }}
                />
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchClasses} />
                </Tooltip>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredClasses}
              rowKey="classId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} lớp học`,
              }}
            />
          </Card>

          <Drawer
            title="Thông tin chi tiết lớp học"
            placement="right"
            width={700}
            onClose={() => setDrawerVisible(false)}
            visible={drawerVisible}
          >
            {selectedClass && (
              <>
                <div className="text-center mb-6">
                  <Title level={3}>{selectedClass.className}</Title>
                  <Space className="mb-2">
                    <Tag color="blue" style={{ fontSize: 16 }}>
                      {selectedClass.majorName}
                    </Tag>
                    <span
                      style={{ fontSize: 15, color: "#888", marginRight: 4 }}
                    >
                      Trình độ:
                    </span>
                    <Tag
                      color="purple"
                      style={{ fontSize: 16, fontWeight: 600 }}
                    >
                      {selectedClass.levelName}
                    </Tag>
                    {getStatusTag(selectedClass.status)}
                  </Space>
                  <div className="mt-2">
                    <b>Giáo viên:</b> {selectedClass.teacherName}
                  </div>
                </div>

                <Divider />

                <Descriptions title="Thông tin lớp học" column={2} bordered>
                  <Descriptions.Item label="Mã lớp">
                    {selectedClass.classId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Học phí">
                    {selectedClass.price.toLocaleString("vi-VN")} VNĐ
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian học">
                    {dayjs(selectedClass.classTime, "HH:mm:ss").format("HH:mm")}{" "}
                    -{" "}
                    {dayjs(selectedClass.classEndTime, "HH:mm:ss").format(
                      "HH:mm"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày kiểm tra">
                    {dayjs(selectedClass.testDay).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu">
                    {dayjs(selectedClass.startDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày kết thúc">
                    {dayjs(selectedClass.endDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng số buổi học">
                    {selectedClass.totalDays} buổi
                  </Descriptions.Item>
                  <Descriptions.Item label="Số học viên">
                    <Progress
                      percent={
                        selectedClass.maxStudents > 0
                          ? Math.round(
                              (selectedClass.studentCount /
                                selectedClass.maxStudents) *
                                100
                            )
                          : 0
                      }
                      status={
                        selectedClass.studentCount >= selectedClass.maxStudents
                          ? "exception"
                          : "active"
                      }
                    />
                    <Text type="secondary">
                      {selectedClass.studentCount}/{selectedClass.maxStudents}{" "}
                      học viên
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày học trong tuần" span={2}>
                    {selectedClass.classDays &&
                    selectedClass.classDays.length > 0 ? (
                      selectedClass.classDays.map((day, index) => (
                        <Tag key={index} className="mr-1">
                          {day.day}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">Chưa có thông tin</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Các ngày học cụ thể" span={2}>
                    {selectedClass.sessionDates &&
                    selectedClass.sessionDates.length > 0 ? (
                      <div style={{ maxHeight: 80, overflowY: "auto" }}>
                        {selectedClass.sessionDates.map((date, idx) => (
                          <Tag key={idx}>
                            {dayjs(date).format("DD/MM/YYYY")}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <Text type="secondary">Chưa có thông tin</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div className="mb-4" style={{ textAlign: "center" }}>
                  <Title level={5}>Giáo trình</Title>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    size="large"
                    onClick={() => setShowSyllabus((prev) => !prev)}
                  >
                    {showSyllabus ? "Đóng giáo trình" : "Xem giáo trình"}
                  </Button>
                  {showSyllabus && (
                    <div
                      style={{
                        marginTop: 20,
                        border: "1px solid #eee",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      <iframe
                        src={selectedClass.syllabusLink}
                        title="Syllabus PDF"
                        width="100%"
                        height="600px"
                        style={{ border: "none" }}
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <Divider />

                <div>
                  <Title level={5}>Danh sách học viên</Title>
                  {selectedClass.students &&
                  selectedClass.students.length > 0 ? (
                    <Table
                      dataSource={selectedClass.students}
                      rowKey={(row) => row.learnerId}
                      columns={[
                        {
                          title: "Avatar",
                          dataIndex: "avatar",
                          key: "avatar",
                          render: (avatar) =>
                            avatar ? (
                              <img
                                src={avatar}
                                alt="avatar"
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <span>--</span>
                            ),
                        },
                        {
                          title: "Tên học viên",
                          dataIndex: "fullName",
                          key: "fullName",
                        },
                        {
                          title: "Email",
                          dataIndex: "email",
                          key: "email",
                        },
                        {
                          title: "Số điện thoại",
                          dataIndex: "phoneNumber",
                          key: "phoneNumber",
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "isEligible",
                          key: "isEligible",
                          render: (isEligible, row) => (
                            <Space>
                              <Tag
                                color={isEligible ? "green" : "red"}
                                style={{ fontWeight: 500 }}
                              >
                                {isEligible
                                  ? "Đã đủ điều kiện"
                                  : "Chưa đủ điều kiện"}
                              </Tag>
                              <Switch
                                checked={isEligible}
                                checkedChildren="Đủ"
                                unCheckedChildren="Chưa"
                                onChange={(checked) =>
                                  handleUpdateEligibility(
                                    row.learnerId,
                                    selectedClass.classId,
                                    checked
                                  )
                                }
                                size="small"
                              />
                            </Space>
                          ),
                        },
                      ]}
                      pagination={false}
                    />
                  ) : (
                    <Text type="secondary">Chưa có học viên nào</Text>
                  )}
                </div>
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
      <Modal
        title="Thông báo"
        open={errorModal.visible}
        onCancel={() => setErrorModal({ visible: false, message: "" })}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setErrorModal({ visible: false, message: "" })}
          >
            Đóng
          </Button>,
        ]}
      >
        <p>{errorModal.message}</p>
      </Modal>
    </Layout>
  );
};

export default ClassManagement;
