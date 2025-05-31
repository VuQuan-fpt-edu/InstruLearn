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
  Form,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import axios from "axios";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;

const ClassFeedback = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("feedback");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [scoreModal, setScoreModal] = useState({
    visible: false,
    loading: false,
    learner: null,
    feedback: null,
  });
  const [errorModal, setErrorModal] = useState({ visible: false, message: "" });
  const [form] = Form.useForm();

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
      } else {
        throw new Error(
          response.data.message || "Không thể lấy danh sách lớp học"
        );
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewClass = async (classData) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Class/${classData.classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.isSucceed) {
        setSelectedClass(response.data.data);
        setDrawerVisible(true);
      } else {
        message.error(
          response.data.message || "Không lấy được chi tiết lớp học"
        );
      }
    } catch (error) {
      message.error("Không lấy được chi tiết lớp học!");
    }
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

  // Hàm mở modal chấm điểm
  const handleOpenScoreModal = async (learner) => {
    setScoreModal({ visible: true, loading: true, learner, feedback: null });
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/ClassFeedback/class/${selectedClass.classId}/learner/${learner.learnerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setScoreModal({
          visible: true,
          loading: false,
          learner,
          feedback: res.data,
        });
        if (res.data.evaluations) {
          form.setFieldsValue({
            evaluations: res.data.evaluations.map((e) => ({
              achievedPercentage: e.achievedPercentage,
              comment: e.comment,
            })),
            additionalComments: res.data.additionalComments || "",
          });
        }
      } else {
        setScoreModal({
          visible: true,
          loading: false,
          learner,
          feedback: null,
        });
      }
    } catch (err) {
      let msg = "Không lấy được bảng chấm điểm!";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setScoreModal({
        visible: false,
        loading: false,
        learner: null,
        feedback: null,
      });
      setErrorModal({ visible: true, message: msg });
    }
  };

  // Hàm gửi chấm điểm
  const handleSubmitScore = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("authToken");
      const body = {
        classId: selectedClass.classId,
        learnerId: scoreModal.learner.learnerId,
        additionalComments: values.additionalComments || "",
        evaluations: values.evaluations.map((item, idx) => ({
          criterionId: scoreModal.feedback.evaluations[idx].criterionId,
          achievedPercentage: item.achievedPercentage,
          comment: item.comment ? String(item.comment) : "",
        })),
      };
      const res = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/ClassFeedback/CreateFeedback",
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.message) {
        setErrorModal({ visible: true, message: res.data.message });
      } else {
        setErrorModal({ visible: true, message: "Chấm điểm thành công!" });
      }
      setScoreModal({
        visible: false,
        loading: false,
        learner: null,
        feedback: null,
      });
    } catch (err) {
      let msg = "Chấm điểm thất bại!";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorModal({ visible: true, message: msg });
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
              <Title level={4}>Phản hồi lớp học</Title>
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
                          render: (isEligible) => (
                            <Tag
                              color={isEligible ? "green" : "red"}
                              style={{ fontWeight: 500 }}
                            >
                              {isEligible
                                ? "Đã đủ điều kiện"
                                : "Chưa đủ điều kiện"}
                            </Tag>
                          ),
                        },
                        {
                          title: "Chấm điểm",
                          key: "score",
                          render: (_, row) => (
                            <Button
                              type="primary"
                              onClick={() => handleOpenScoreModal(row)}
                            >
                              Chấm điểm
                            </Button>
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
          {/* Modal chấm điểm */}
          <Modal
            title={
              scoreModal.learner ? (
                <div style={{ fontWeight: 700, fontSize: 20 }}>
                  <span style={{ color: "#1677ff" }}>Chấm điểm học viên: </span>
                  <span>{scoreModal.learner.fullName}</span>
                </div>
              ) : (
                "Chấm điểm"
              )
            }
            open={scoreModal.visible}
            onCancel={() =>
              setScoreModal({
                visible: false,
                loading: false,
                learner: null,
                feedback: null,
              })
            }
            onOk={handleSubmitScore}
            okText="Lưu"
            cancelText="Hủy"
            width={750}
            confirmLoading={scoreModal.loading}
            destroyOnClose
            bodyStyle={{ background: "#f8fafc" }}
          >
            {scoreModal.loading ? (
              <div style={{ textAlign: "center" }}>Đang tải...</div>
            ) : scoreModal.feedback ? (
              <Form form={form} layout="vertical">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {scoreModal.feedback.evaluations &&
                    scoreModal.feedback.evaluations.map((evalItem, idx) => (
                      <div
                        key={evalItem.criterionId}
                        style={{
                          background: "#fff",
                          borderRadius: 8,
                          padding: 18,
                          boxShadow: "0 1px 4px #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          {evalItem.gradeCategory}{" "}
                          <span style={{ color: "#1677ff" }}>
                            ({evalItem.weight}%)
                          </span>
                        </div>
                        <div style={{ color: "#888", marginBottom: 10 }}>
                          {evalItem.description}
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <Form.Item
                            name={["evaluations", idx, "achievedPercentage"]}
                            style={{ marginBottom: 0, flex: 1 }}
                            rules={[
                              { required: true, message: "Nhập điểm (%)" },
                              {
                                validator: (_, value) => {
                                  if (
                                    value === undefined ||
                                    value === null ||
                                    value === ""
                                  )
                                    return Promise.resolve();
                                  if (isNaN(value))
                                    return Promise.reject("Chỉ nhập số!");
                                  if (value < 0)
                                    return Promise.reject("Không nhỏ hơn 0");
                                  if (value > evalItem.weight)
                                    return Promise.reject(
                                      `Tối đa là ${evalItem.weight}%`
                                    );
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              min={0}
                              max={evalItem.weight}
                              placeholder={`Điểm (tối đa ${evalItem.weight}%)`}
                              style={{ width: 160, fontWeight: 600 }}
                            />
                          </Form.Item>
                          <Form.Item
                            name={["evaluations", idx, "comment"]}
                            style={{ marginBottom: 0, flex: 2 }}
                          >
                            <Input
                              placeholder="Nhận xét cho tiêu chí này"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    ))}
                </div>
                <Form.Item
                  name="additionalComments"
                  label={<b>Nhận xét chung</b>}
                  style={{ marginTop: 24 }}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Nhận xét chung cho học viên này"
                    style={{ background: "#fff" }}
                  />
                </Form.Item>
              </Form>
            ) : (
              <div>Không có dữ liệu chấm điểm.</div>
            )}
          </Modal>
          {/* Modal lỗi lấy câu hỏi chấm điểm */}
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassFeedback;
