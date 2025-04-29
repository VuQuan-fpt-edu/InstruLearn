import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Spin,
  message,
  Row,
  Col,
  Divider,
  Menu,
  Dropdown,
  Modal,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const ClassDetail = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassDetail();
  }, [id]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Class/${id}`
      );
      const data = await response.json();
      if (data.isSucceed) {
        setClassData(data.data);
      } else {
        message.error(data.message || "Không thể tải thông tin lớp học");
      }
    } catch (error) {
      console.error("Error fetching class detail:", error);
      message.error("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const updateClassStatus = async (newStatus) => {
    try {
      setLoading(true);
      // Ghi log để kiểm tra dữ liệu gửi đi
      console.log(`Cập nhật lớp học ID: ${id}, trạng thái mới: ${newStatus}`);
      console.log(
        `URL: https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`
      );
      console.log(`Body: ${JSON.stringify({ status: newStatus })}`);

      // Thử sử dụng axios thay vì fetch
      try {
        const axiosResponse = await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`,
          { status: newStatus },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Phản hồi Axios:", axiosResponse);

        if (axiosResponse.status === 200 || axiosResponse.data.isSucceed) {
          message.success("Cập nhật trạng thái lớp học thành công");
          fetchClassDetail();
          return; // Dừng xử lý nếu axios thành công
        }
      } catch (axiosError) {
        console.error("Axios error:", axiosError);
        // Tiếp tục với fetch nếu axios thất bại
      }

      // Sử dụng fetch như phương án dự phòng
      const response = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      console.log(`Mã trạng thái phản hồi: ${response.status}`);

      // Kiểm tra cả status và ok để xử lý đầy đủ các trường hợp
      if (response.ok || response.status === 200) {
        message.success("Cập nhật trạng thái lớp học thành công");
        // Tải lại thông tin lớp học
        fetchClassDetail();
      } else {
        const errorData = await response.json();
        console.error("API Error response:", errorData);
        message.error(
          errorData.message || "Không thể cập nhật trạng thái lớp học"
        );
      }
    } catch (error) {
      console.error("Error updating class status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái lớp học");
    } finally {
      setLoading(false);
    }
  };

  const showStatusUpdateConfirm = (newStatus) => {
    confirm({
      title: "Cập nhật trạng thái lớp học",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có muốn cập nhật trạng thái lớp học này thành '${getStatusText(
        newStatus
      )}' không?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk() {
        updateClassStatus(newStatus);
      },
    });
  };

  const directUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      message.loading({ content: "Đang cập nhật...", key: "statusUpdate" });

      // Sử dụng API trực tiếp
      const apiUrl = `https://instrulearnapplication.azurewebsites.net/api/Class/update/${id}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        message.success({
          content: "Cập nhật thành công!",
          key: "statusUpdate",
          duration: 2,
        });
        fetchClassDetail();
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        message.error({
          content: "Cập nhật thất bại",
          key: "statusUpdate",
          duration: 2,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      message.error({
        content: "Có lỗi xảy ra",
        key: "statusUpdate",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusMenuItems = [
    {
      key: "0",
      label: "Đang mở lớp",
      onClick: () => directUpdateStatus(0),
      disabled: classData?.status === 0,
    },
    {
      key: "1",
      label: "Đang diễn ra",
      onClick: () => directUpdateStatus(1),
      disabled: classData?.status === 1,
    },
    {
      key: "2",
      label: "Đã kết thúc",
      onClick: () => directUpdateStatus(2),
      disabled: classData?.status === 2,
    },
  ];

  return (
    <Layout className="min-h-screen">
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
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Card className="shadow-md">
            <div className="flex justify-between items-center mb-6">
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/staff/class-management")}
                >
                  Quay lại
                </Button>
                <Title level={2} className="mb-0">
                  Chi tiết lớp học
                </Title>
              </Space>
              <Space>
                <Dropdown
                  menu={{ items: statusMenuItems }}
                  disabled={loading || !classData}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <Button type="primary" icon={<EditOutlined />}>
                    <Space>
                      Cập nhật trạng thái
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </div>

            <Spin spinning={loading}>
              {classData && (
                <>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <Card title="Thông tin cơ bản" className="mb-6">
                        <Descriptions column={1} bordered>
                          <Descriptions.Item
                            label={
                              <Space>
                                <BookOutlined /> Tên lớp
                              </Space>
                            }
                          >
                            {classData.className}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <BookOutlined /> Khóa học
                              </Space>
                            }
                          >
                            {classData.coursePackageName}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <UserOutlined /> Giáo viên
                              </Space>
                            }
                          >
                            {classData.teacherName}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <CalendarOutlined /> Ngày bắt đầu
                              </Space>
                            }
                          >
                            {new Date(classData.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <CalendarOutlined /> Ngày kết thúc
                              </Space>
                            }
                          >
                            {new Date(classData.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <ClockCircleOutlined /> Thời gian học
                              </Space>
                            }
                          >
                            {`${
                              classData.classTime?.substring(0, 5) || "N/A"
                            } - ${
                              classData.classEndTime?.substring(0, 5) || "N/A"
                            }`}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <CalendarOutlined /> Lịch học
                              </Space>
                            }
                          >
                            {formatClassDays(classData.classDays)}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>

                      <Card title="Thông tin bổ sung">
                        <Descriptions column={1} bordered>
                          <Descriptions.Item
                            label={
                              <Space>
                                <TeamOutlined /> Số học viên tối đa
                              </Space>
                            }
                          >
                            {classData.maxStudents}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <CalendarOutlined /> Tổng số buổi học
                              </Space>
                            }
                          >
                            {classData.totalDays}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <DollarOutlined /> Học phí
                              </Space>
                            }
                          >
                            {formatPrice(classData.price)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Trạng thái">
                            <div className="flex items-center">
                              <Tag color={getStatusColor(classData.status)}>
                                {getStatusText(classData.status)}
                              </Tag>
                            </div>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Card title="Thống kê">
                        <Descriptions column={1} bordered>
                          <Descriptions.Item label="Số học viên hiện tại">
                            <span className="text-2xl font-bold">
                              {classData.studentCount || 0}/
                              {classData.maxStudents}
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Tỷ lệ lấp đầy">
                            <span className="text-2xl font-bold">
                              {classData.maxStudents > 0
                                ? `${Math.round(
                                    ((classData.studentCount || 0) /
                                      classData.maxStudents) *
                                      100
                                  )}%`
                                : "0%"}
                            </span>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>

                      {classData.students && classData.students.length > 0 && (
                        <Card title="Danh sách học viên" className="mt-6">
                          {classData.students.map((student) => (
                            <div
                              key={student.learnerId}
                              className="border-b py-3 last:border-0"
                            >
                              <div className="flex items-center">
                                <Avatar
                                  src={student.avatar}
                                  icon={!student.avatar && <UserOutlined />}
                                  size={40}
                                  className="mr-3"
                                />
                                <div>
                                  <div className="font-medium">
                                    {student.fullName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {student.email}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {student.phoneNumber}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </Card>
                      )}
                    </Col>
                  </Row>
                </>
              )}
            </Spin>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassDetail;
