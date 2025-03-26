import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Avatar,
  Typography,
  Divider,
  Tag,
  Tabs,
  Row,
  Col,
  Button,
  Space,
  Spin,
  Statistic,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const TeacherProfilePage = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Teacher/${id}`
      );

      if (response.data?.isSucceed) {
        const teacherData = response.data.data;
        setTeacher({
          id: teacherData.teacherId,
          name: teacherData.fullname,
          specialty: teacherData.majors[0]?.majorName,
          experience: teacherData.heading || "Chưa có thông tin",
          description: teacherData.details || "Chưa có mô tả",
          image:
            teacherData.avatar ||
            "https://randomuser.me/api/portraits/men/1.jpg",
          contactInfo: {
            phone: teacherData.phoneNumber || "Chưa có thông tin",
            email: "Chưa có thông tin",
            address: teacherData.address || "Chưa có thông tin",
            links: teacherData.links || "Chưa có thông tin",
          },
          gender: teacherData.gender,
          dateOfEmployment: teacherData.dateOfEmployment,
          isActive: teacherData.isActive,
          majors: teacherData.majors,
          accountId: teacherData.accountId,
        });
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Content className="p-6 flex items-center justify-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!teacher) {
    return (
      <Layout className="min-h-screen">
        <Content className="p-6">
          <Card>
            <div className="text-center">
              <Title level={3}>Không tìm thấy thông tin giáo viên</Title>
              <Button type="primary" onClick={() => navigate("/teachers")}>
                Quay lại danh sách
              </Button>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center">
            <Avatar
              size={160}
              src={teacher.image}
              className="border-4 border-white shadow-lg"
            />
            <div className="text-white ml-8">
              <Title level={2} className="!text-white mb-2">
                {teacher.name}
              </Title>
              <Space size="large" className="mb-4">
                <Tag color="blue" className="text-base py-1 px-3">
                  <BookOutlined className="mr-1" /> {teacher.specialty}
                </Tag>
                <Tag
                  color={teacher.isActive === 1 ? "success" : "error"}
                  className="text-base py-1 px-3"
                >
                  {teacher.isActive === 1
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </Tag>
              </Space>
              <Paragraph className="text-white opacity-90">
                {teacher.experience}
              </Paragraph>
            </div>
          </div>
        </div>
      </div>

      <Content className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Row gutter={24}>
            {/* Main Content */}
            <Col xs={24} lg={16}>
              <Card className="mb-6 shadow-sm">
                <Title level={4} className="mb-4">
                  <UserOutlined className="mr-2" />
                  Giới thiệu
                </Title>
                <Paragraph className="text-gray-600">
                  {teacher.description}
                </Paragraph>
              </Card>

              <Card className="mb-6 shadow-sm">
                <Title level={4} className="mb-4">
                  <BookOutlined className="mr-2" />
                  Chuyên môn
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="Chuyên ngành"
                      value={teacher.majors
                        ?.map((major) => major.majorName)
                        .join(", ")}
                      prefix={<TrophyOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Kinh nghiệm"
                      value={teacher.experience}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Ngày bắt đầu"
                      value={dayjs(teacher.dateOfEmployment).format(
                        "DD/MM/YYYY"
                      )}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              <Card className="shadow-sm">
                <Title level={4} className="mb-4">
                  <PhoneOutlined className="mr-2" />
                  Thông tin liên hệ
                </Title>
                <Space direction="vertical" className="w-full">
                  <div className="flex items-center p-3 bg-gray-50 rounded">
                    <PhoneOutlined className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-gray-500 text-sm">Số điện thoại</div>
                      <div>{teacher.contactInfo.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded">
                    <MailOutlined className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-gray-500 text-sm">
                        Liên kết mạng xã hội
                      </div>
                      <div>
                        {teacher.contactInfo.links !== "Chưa có thông tin" ? (
                          <a
                            href={teacher.contactInfo.links}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {teacher.contactInfo.links}
                          </a>
                        ) : (
                          teacher.contactInfo.links
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded">
                    <EnvironmentOutlined className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-gray-500 text-sm">Địa chỉ</div>
                      <div>{teacher.contactInfo.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded">
                    <UserOutlined className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-gray-500 text-sm">Giới tính</div>
                      <div>
                        {teacher.gender === "male"
                          ? "Nam"
                          : teacher.gender === "female"
                          ? "Nữ"
                          : "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer className="text-center bg-white">
        © 2024 InstruLearn - Nền tảng học nhạc trực tuyến
      </Footer>
    </Layout>
  );
};

export default TeacherProfilePage;
