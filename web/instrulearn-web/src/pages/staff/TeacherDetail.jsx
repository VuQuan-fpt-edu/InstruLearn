import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Typography,
  Space,
  Tag,
  Button,
  message,
  Spin,
  Descriptions,
  Divider,
  Row,
  Col,
  Avatar,
  Badge,
  Statistic,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("teacher-management");
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacherMajors, setTeacherMajors] = useState([]);
  const [loadingMajors, setLoadingMajors] = useState(true);

  useEffect(() => {
    Promise.all([fetchTeacherDetail(), fetchTeacherMajors()]);
  }, [id]);

  const fetchTeacherDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Teacher/${id}`
      );

      if (response.data.isSucceed && response.data.data) {
        setTeacher(response.data.data);
      } else {
        message.error("Không thể tải thông tin giáo viên");
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      message.error("Đã xảy ra lỗi khi tải thông tin giáo viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherMajors = async () => {
    try {
      setLoadingMajors(true);
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/TeacherMajor/get-all"
      );

      if (response.data && Array.isArray(response.data)) {
        const teacherMajorData = response.data
          .filter(
            (item) =>
              item.isSucceed && item.data.teacher.teacherId === Number(id)
          )
          .map((item) => ({
            teacherMajorId: item.data.teacherMajorId,
            major: item.data.teacher.majors[0],
            status: item.data.status,
          }));
        setTeacherMajors(teacherMajorData);
      }
    } catch (error) {
      console.error("Error fetching teacher majors:", error);
      message.error("Không thể tải thông tin chuyên ngành của giáo viên");
    } finally {
      setLoadingMajors(false);
    }
  };

  const handleUpdateTeacherStatus = async (teacherMajorId, isBusy) => {
    try {
      const endpoint = isBusy
        ? `/api/TeacherMajor/update/${teacherMajorId}/Busy`
        : `/api/TeacherMajor/update/${teacherMajorId}/Free`;

      const response = await axios.put(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net${endpoint}`
      );

      if (response.data.isSucceed) {
        message.success(
          `Cập nhật trạng thái giáo viên ${
            isBusy ? "Tạm ngưng" : "Đang dạy"
          } thành công`
        );
        fetchTeacherMajors(); // Tải lại danh sách sau khi cập nhật
      } else {
        message.error("Không thể cập nhật trạng thái giáo viên");
      }
    } catch (error) {
      console.error("Error updating teacher status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái giáo viên");
    }
  };

  const handleBack = () => {
    navigate("/staff/teacher-management");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-8">
        <Text>Không tìm thấy thông tin giáo viên</Text>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
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
          className="p-8"
          style={{
            marginTop: "64px",
            background: "#f5f5f5",
          }}
        >
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-8">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              size="large"
              className="hover:bg-gray-100 transition-colors"
            >
              Quay lại
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTeacherDetail}
              size="large"
              className="hover:bg-gray-100 transition-colors"
            >
              Làm mới
            </Button>
          </div>

          <Row gutter={[24, 24]}>
            {/* Left Column - Profile Info */}
            <Col xs={24} lg={8}>
              <Card className="shadow-lg rounded-xl border-0 bg-white">
                <div className="text-center">
                  <Avatar
                    size={180}
                    icon={<UserOutlined />}
                    src={teacher.avatar}
                    className="mb-6 border-4 border-blue-100 shadow-xl"
                  />
                  <Title level={2} className="mb-3 text-gray-800">
                    {teacher.fullname}
                    <Badge
                      status={teacher.isActive === 1 ? "success" : "error"}
                      className="ml-3"
                    />
                  </Title>
                  <Paragraph
                    type="secondary"
                    className="text-lg mb-6 text-gray-600"
                  >
                    {teacher.heading || "Chưa có thông tin"}
                  </Paragraph>
                  <Tag
                    color={teacher.isActive === 1 ? "green" : "red"}
                    className="px-6 py-2 text-base rounded-full"
                  >
                    {teacher.isActive === 1
                      ? "Đang hoạt động"
                      : "Không hoạt động"}
                  </Tag>
                </div>

                <Divider className="my-8" />

                <Space direction="vertical" size="large" className="w-full">
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <PhoneOutlined className="text-blue-500 mr-3 text-xl" />
                    <div>
                      <div className="text-sm text-gray-500">Số điện thoại</div>
                      <div className="text-gray-800">
                        {teacher.phoneNumber || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <MailOutlined className="text-blue-500 mr-3 text-xl" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-gray-800">
                        {teacher.email || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <HomeOutlined className="text-blue-500 mr-3 text-xl" />
                    <div>
                      <div className="text-sm text-gray-500">Địa chỉ</div>
                      <div className="text-gray-800">
                        {teacher.address || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <CalendarOutlined className="text-blue-500 mr-3 text-xl" />
                    <div>
                      <div className="text-sm text-gray-500">Ngày vào làm</div>
                      <div className="text-gray-800">
                        {teacher.dateOfEmployment === "0001-01-01"
                          ? "Chưa cập nhật"
                          : new Date(
                              teacher.dateOfEmployment
                            ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Right Column - Additional Info */}
            <Col xs={24} lg={16}>
              {/* Expertise Section */}
              <Card className="shadow-lg rounded-xl border-0 bg-white mb-6">
                <div className="flex items-center mb-6">
                  <BookOutlined className="text-2xl mr-3 text-blue-500" />
                  <Title level={4} className="m-0 text-gray-800">
                    Chuyên môn
                  </Title>
                </div>
                <Row gutter={[16, 16]}>
                  {teacherMajors.map((item) => (
                    <Col key={item.teacherMajorId} xs={24} sm={12} md={8}>
                      <Card
                        className="text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        bordered={false}
                        style={{ background: "#f8f9fa" }}
                      >
                        <div className="flex flex-col items-center">
                          <Text
                            strong
                            className="text-lg block mb-2 text-gray-800"
                          >
                            {item.major.majorName}
                          </Text>
                          <Tag
                            color={item.status === 0 ? "red" : "green"}
                            className="mb-2"
                          >
                            {item.status === 0 ? "Tạm ngưng" : "Đang dạy"}
                          </Tag>
                          <Button
                            type="link"
                            size="small"
                            onClick={() =>
                              handleUpdateTeacherStatus(
                                item.teacherMajorId,
                                item.status === 1
                              )
                            }
                          >
                            {item.status === 1
                              ? "Đánh dấu Tạm ngưng"
                              : "Đánh dấu Đang dạy"}
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* Description Section */}
              <Card className="shadow-lg rounded-xl border-0 bg-white mb-6">
                <div className="flex items-center mb-6">
                  <TrophyOutlined className="text-2xl mr-3 text-yellow-500" />
                  <Title level={4} className="m-0 text-gray-800">
                    Mô tả
                  </Title>
                </div>
                <Paragraph className="text-base text-gray-700 leading-relaxed">
                  {teacher.details || "Chưa có mô tả"}
                </Paragraph>
              </Card>

              {/* Links Section */}
              {teacher.links && (
                <Card className="shadow-lg rounded-xl border-0 bg-white">
                  <Title level={4} className="mb-4 text-gray-800">
                    Liên kết
                  </Title>
                  <Paragraph className="text-base text-gray-700">
                    {teacher.links || "Chưa có liên kết"}
                  </Paragraph>
                </Card>
              )}
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherDetail;
