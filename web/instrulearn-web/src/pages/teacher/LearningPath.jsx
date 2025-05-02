import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Empty,
  Checkbox,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
  FileOutlined,
  CalendarOutlined,
  DownloadOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import axios from "axios";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;

const LearningPath = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("learning-path");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [learningPathSessions, setLearningPathSessions] = useState([]);
  const [loadingPathSessions, setLoadingPathSessions] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [teacherId, setTeacherId] = useState(null);
  const [registrationPaths, setRegistrationPaths] = useState({});
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchTeacherId();
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchRegistrations();
    }
  }, [teacherId]);

  const fetchTeacherId = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSucceed) {
        setTeacherId(response.data.data.teacherId);
      }
    } catch (error) {
      console.error("Error fetching teacher ID:", error);
      message.error("Không thể lấy thông tin giáo viên");
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningRegis/LearningRegis/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSucceed) {
        setRegistrations(response.data.data);
        // Fetch learning paths for all registrations
        const paths = {};
        await Promise.all(
          response.data.data.map(async (registration) => {
            try {
              const pathResponse = await axios.get(
                `https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/${registration.learningRegisId}/learning-path-sessions`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              paths[registration.learningRegisId] =
                pathResponse.data.data || [];
            } catch (error) {
              console.error(
                `Error fetching path for registration ${registration.learningRegisId}:`,
                error
              );
              paths[registration.learningRegisId] = [];
            }
          })
        );
        setRegistrationPaths(paths);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      message.error("Không thể tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPathSessions = async (learningRegisId) => {
    try {
      setLoadingPathSessions(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/${learningRegisId}/learning-path-sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSucceed) {
        setLearningPathSessions(response.data.data);
        // Cập nhật registrationPaths
        setRegistrationPaths((prev) => ({
          ...prev,
          [learningRegisId]: response.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching learning path sessions:", error);
      message.error("Không thể tải thông tin lộ trình học");
    } finally {
      setLoadingPathSessions(false);
    }
  };

  const handleCreateLearningPathSubmit = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      const sessions = Array.from(
        { length: selectedRegistration.numberOfSession },
        (_, i) => ({
          learningRegisId: 0,
          sessionNumber: i + 1,
          title: values[`title_${i}`],
          description: values[`description_${i}`],
          isCompleted: false,
        })
      );

      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegis/create-learning-path-sessions",
        {
          learningRegisId: selectedRegistration.learningRegisId,
          learningPathSessions: sessions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Tạo lộ trình học thành công");
        setModalVisible(false);
        setSelectedRegistration(null);
        form.resetFields();
        fetchRegistrations(); // Tải lại toàn bộ danh sách để cập nhật trạng thái
      }
    } catch (error) {
      console.error("Error creating learning path:", error);
      message.error("Không thể tạo lộ trình học");
    }
  };

  const handleViewLearningPath = (record) => {
    setSelectedRegistration(record);
    setViewModalVisible(true);
    fetchLearningPathSessions(record.learningRegisId);
  };

  const handleCreateLearningPath = (record) => {
    setSelectedRegistration(record);
    setModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setModalVisible(false);
    setSelectedRegistration(null);
    form.resetFields();
  };

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setSelectedRegistration(null);
  };

  const handleViewDetails = (record) => {
    setSelectedDetails(record);
    setDetailsModalVisible(true);
  };

  const handleViewVideo = (videoUrl) => {
    setCurrentVideoUrl(videoUrl);
    setVideoModalVisible(true);
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

  const handleUpdateSessionStatus = async (session) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/update-learning-path-session",
        {
          learningPathSessionId: session.learningPathSessionId,
          sessionNumber: session.sessionNumber,
          title: session.title,
          description: session.description,
          isCompleted: !session.isCompleted,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật trạng thái thành công");
        // Cập nhật lại danh sách sessions
        const updatedSessions = learningPathSessions.map((s) =>
          s.learningPathSessionId === session.learningPathSessionId
            ? { ...s, isCompleted: !s.isCompleted }
            : s
        );
        setLearningPathSessions(updatedSessions);
        // Cập nhật registrationPaths
        setRegistrationPaths((prev) => ({
          ...prev,
          [selectedRegistration.learningRegisId]: updatedSessions,
        }));
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      message.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    editForm.setFieldsValue({
      title: session.title,
      description: session.description,
      isCompleted: false,
    });
    setEditModalVisible(true);
  };

  const handleUpdateSession = async (values) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/update-learning-path-session",
        {
          learningPathSessionId: selectedSession.learningPathSessionId,
          sessionNumber: selectedSession.sessionNumber,
          title: values.title,
          description: values.description,
          isCompleted: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        message.success("Cập nhật thông tin thành công");
        // Cập nhật lại danh sách sessions
        const updatedSessions = learningPathSessions.map((s) =>
          s.learningPathSessionId === selectedSession.learningPathSessionId
            ? { ...s, ...values, isCompleted: false }
            : s
        );
        setLearningPathSessions(updatedSessions);
        // Cập nhật registrationPaths
        setRegistrationPaths((prev) => ({
          ...prev,
          [selectedRegistration.learningRegisId]: updatedSessions,
        }));
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating session:", error);
      message.error("Không thể cập nhật thông tin");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleConfirmLearningPath = async () => {
    if (!selectedRegistration) return;
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("authToken");
      await axios.post(
        `https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/confirm-learning-path/${selectedRegistration.learningRegisId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Xác nhận lộ trình học thành công");
      fetchLearningPathSessions(selectedRegistration.learningRegisId);
      fetchRegistrations();
    } catch (error) {
      message.error("Không thể xác nhận lộ trình học");
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Nhạc cụ",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Số buổi học",
      dataIndex: "numberOfSession",
      key: "numberOfSession",
      render: (text) => `${text} buổi`,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDay",
      key: "startDay",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Thời gian học",
      key: "time",
      render: (_, record) => (
        <span>
          {record.timeStart?.substring(0, 5)} -{" "}
          {record.timeEnd?.substring(0, 5)}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => handleViewLearningPath(record)}
          >
            Xem lộ trình
          </Button>
          {(!registrationPaths[record.learningRegisId] ||
            registrationPaths[record.learningRegisId].length === 0) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateLearningPath(record)}
            >
              Tạo lộ trình
            </Button>
          )}
        </Space>
      ),
    },
  ];

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
            <Title level={4}>
              <BookOutlined className="mr-2" />
              Quản lý lộ trình học
            </Title>
            <Table
              columns={columns}
              dataSource={registrations}
              loading={loading}
              rowKey="learningRegisId"
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* Modal xem lộ trình học */}
          <Modal
            title={`Lộ trình học của ${selectedRegistration?.fullName}`}
            open={viewModalVisible}
            onCancel={handleCloseViewModal}
            footer={null}
            width={800}
          >
            {loadingPathSessions ? (
              <div className="flex justify-center">
                <Spin />
              </div>
            ) : learningPathSessions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {learningPathSessions.map((session) => (
                    <div
                      key={session.learningPathSessionId}
                      className={`p-4 rounded-lg border ${
                        session.isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              session.isCompleted
                                ? "bg-green-500"
                                : "bg-gray-300"
                            } text-white`}
                          >
                            {session.sessionNumber}
                          </div>
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-gray-600">
                              {session.description}
                            </p>
                            <div className="mt-2">
                              <Tag
                                color={
                                  session.isCompleted ? "success" : "default"
                                }
                              >
                                {session.isCompleted
                                  ? "Đã hoàn thành"
                                  : "Chưa hoàn thành"}
                              </Tag>
                            </div>
                          </div>
                        </div>
                        {!session.isCompleted && (
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditSession(session)}
                          >
                            Chỉnh sửa
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Nút xác nhận lộ trình học */}
                {learningPathSessions.some((s) => !s.isCompleted) && (
                  <div className="flex justify-end mt-6">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={updateLoading}
                      onClick={handleConfirmLearningPath}
                    >
                      Xác nhận lộ trình học
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Empty description="Chưa có lộ trình học" />
            )}
          </Modal>

          {/* Modal tạo lộ trình học */}
          <Modal
            title={`Tạo lộ trình học cho ${selectedRegistration?.fullName}`}
            open={modalVisible}
            onCancel={handleCloseCreateModal}
            footer={null}
            width={800}
          >
            <Form
              form={form}
              onFinish={handleCreateLearningPathSubmit}
              layout="vertical"
            >
              {selectedRegistration &&
                Array.from(
                  { length: selectedRegistration.numberOfSession },
                  (_, i) => (
                    <div key={i} className="mb-4 p-4 border rounded-lg">
                      <h3 className="text-lg font-medium mb-4">
                        Buổi học {i + 1}
                      </h3>
                      <Form.Item
                        name={`title_${i}`}
                        label="Tiêu đề"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tiêu đề buổi học",
                          },
                        ]}
                      >
                        <Input placeholder="Nhập tiêu đề buổi học" />
                      </Form.Item>
                      <Form.Item
                        name={`description_${i}`}
                        label="Mô tả"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mô tả buổi học",
                          },
                        ]}
                      >
                        <Input.TextArea
                          placeholder="Nhập mô tả buổi học"
                          rows={4}
                        />
                      </Form.Item>
                    </div>
                  )
                )}
              <div className="flex justify-end space-x-4">
                <Button onClick={handleCloseCreateModal}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  Tạo lộ trình
                </Button>
              </div>
            </Form>
          </Modal>

          {/* Modal xem chi tiết */}
          <Modal
            title="Chi tiết đăng ký học"
            open={detailsModalVisible}
            onCancel={() => setDetailsModalVisible(false)}
            footer={null}
            width={800}
          >
            {selectedDetails && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-4">
                    <UserOutlined className="text-blue-500" />
                    <h3 className="text-lg font-semibold">
                      Thông tin học viên
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Họ và tên</p>
                      <p className="font-medium">{selectedDetails.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số điện thoại</p>
                      <p className="font-medium">
                        {selectedDetails.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mã học viên</p>
                      <p className="font-medium">{selectedDetails.learnerId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOutlined className="text-blue-500" />
                    <h3 className="text-lg font-semibold">
                      Thông tin đăng ký học
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Loại đăng ký</p>
                      <p className="font-medium">
                        {selectedDetails.regisTypeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nhạc cụ</p>
                      <p className="font-medium">{selectedDetails.majorName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cấp độ</p>
                      <p className="font-medium">
                        {selectedDetails.levelName || "Chưa xác định"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Học phí/buổi</p>
                      <p className="font-medium text-blue-600">
                        {selectedDetails.levelPrice?.toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số buổi học</p>
                      <p className="font-medium">
                        {selectedDetails.numberOfSession} buổi
                      </p>
                    </div>
                  </div>

                  {selectedDetails.learningRequest && (
                    <div className="mt-4">
                      <p className="text-gray-500">Yêu cầu học</p>
                      <p className="font-medium whitespace-pre-wrap">
                        {selectedDetails.learningRequest}
                      </p>
                    </div>
                  )}

                  {selectedDetails.syllabusLink && (
                    <div className="mt-4">
                      <p className="text-gray-500 mb-2">Giáo trình</p>
                      <div className="flex items-center gap-2">
                        <Tag color="blue" icon={<FileOutlined />}>
                          Giáo trình
                        </Tag>
                        <Button
                          type="primary"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() =>
                            window.open(selectedDetails.syllabusLink, "_blank")
                          }
                        >
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedDetails.videoUrl && (
                    <div className="mt-4">
                      <p className="text-gray-500 mb-2">Video trình độ</p>
                      <div className="flex items-center gap-2">
                        <Tag color="red" icon={<VideoCameraOutlined />}>
                          Video
                        </Tag>
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() =>
                            handleViewVideo(selectedDetails.videoUrl)
                          }
                        >
                          Xem video
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-4">
                    <CalendarOutlined className="text-blue-500" />
                    <h3 className="text-lg font-semibold">Lịch học</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Thời gian học</p>
                      <p className="font-medium">
                        {selectedDetails.timeStart?.substring(0, 5)} -{" "}
                        {selectedDetails.timeEnd?.substring(0, 5)} (
                        {selectedDetails.timeLearning} phút)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày bắt đầu</p>
                      <p className="font-medium">
                        {dayjs(selectedDetails.startDay).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>

                  {selectedDetails.learningDays &&
                    selectedDetails.learningDays.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-500 mb-2">
                          Ngày học trong tuần
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedDetails.learningDays.map((day, index) => (
                            <Tag key={index} color="blue">
                              {convertDayToVietnamese(day)}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </Modal>

          {/* Modal xem video */}
          <Modal
            title="Video trình độ"
            open={videoModalVisible}
            onCancel={() => setVideoModalVisible(false)}
            footer={null}
            width={800}
            destroyOnClose
          >
            {currentVideoUrl && (
              <div className="w-full aspect-video">
                <iframe
                  src={currentVideoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </Modal>

          {/* Modal chỉnh sửa thông tin buổi học */}
          <Modal
            title="Chỉnh sửa thông tin buổi học"
            open={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form
              form={editForm}
              onFinish={handleUpdateSession}
              layout="vertical"
            >
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="Nhập tiêu đề buổi học" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea rows={4} placeholder="Nhập mô tả buổi học" />
              </Form.Item>
              <div className="flex justify-end space-x-4">
                <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateLoading}
                >
                  Cập nhật
                </Button>
              </div>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LearningPath;
