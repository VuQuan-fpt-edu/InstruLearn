import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Avatar,
  Typography,
  Divider,
  Tag,
  Tabs,
  Calendar,
  Badge,
  Row,
  Col,
  Rate,
  Button,
  List,
  Timeline,
  Space,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  TrophyOutlined,
  ReadOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Giả lập dữ liệu giáo viên chi tiết
const generateTeacherDetails = (id) => {
  const teachers = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      specialty: "Guitar",
      experience: "5 năm",
      rating: 4.9,
      students: 42,
      description:
        "Chuyên dạy Guitar Fingerstyle và Classic, tốt nghiệp Học viện Âm nhạc Quốc gia. Có kinh nghiệm dạy cho mọi lứa tuổi từ trẻ em đến người lớn, mở các lớp học online và offline.",
      image: "https://via.placeholder.com/200",
      education: [
        "Cử nhân Biểu diễn Guitar - Học viện Âm nhạc Quốc gia Việt Nam",
        "Chứng chỉ Master Class với nghệ sĩ Guitar Tommy Emmanuel",
      ],
      achievements: [
        "Giải nhất cuộc thi Guitar Fingerstyle Việt Nam 2019",
        "Xuất bản 2 album Guitar solo",
      ],
      teachingMethods: [
        "Phương pháp giảng dạy tương tác",
        "Chú trọng kỹ thuật và cảm thụ âm nhạc",
        "Thiết kế lộ trình học phù hợp với từng học viên",
      ],
      contactInfo: {
        phone: "0912.345.678",
        email: "nguyen.van.an@music.com",
        address: "Quận Hai Bà Trưng, Hà Nội",
      },
      reviews: [
        {
          studentName: "Trần Minh",
          rating: 5,
          comment:
            "Thầy An dạy rất tận tình, có phương pháp giảng dạy dễ hiểu và thú vị.",
          date: "15/02/2024",
        },
        {
          studentName: "Lê Hương",
          rating: 5,
          comment:
            "Sau 3 tháng học với thầy, tôi đã có thể chơi được nhiều bài hát yêu thích. Thầy rất kiên nhẫn và luôn động viên học viên.",
          date: "20/01/2024",
        },
        {
          studentName: "Phạm Tuấn",
          rating: 4,
          comment:
            "Thầy An có kiến thức chuyên môn sâu rộng, giảng dạy rất chi tiết từ kỹ thuật cơ bản đến nâng cao.",
          date: "05/12/2023",
        },
      ],
      repertoire: [
        "Classical Pieces (Bach, Tarrega, Sor)",
        "Fingerstyle Arrangements (Pop, Folk)",
        "Vietnamese Traditional Music",
      ],
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      specialty: "Piano",
      experience: "8 năm",
      rating: 4.8,
      students: 56,
      description:
        "Giáo viên dạy Piano cổ điển và hiện đại, tốt nghiệp Conservatory of Music. Có phương pháp giảng dạy phù hợp với từng lứa tuổi, từ trẻ em 4 tuổi đến người lớn.",
      image: "https://via.placeholder.com/200",
      education: [
        "Thạc sĩ Piano Performance - Royal College of Music, London",
        "Cử nhân Piano - Học viện Âm nhạc Quốc gia Việt Nam",
      ],
      achievements: [
        "Giải nhì cuộc thi Piano Quốc tế Hà Nội 2018",
        "Biểu diễn tại nhiều concert quốc tế",
      ],
      teachingMethods: [
        "Phương pháp Suzuki cho trẻ em",
        "Kết hợp lý thuyết âm nhạc và thực hành",
        "Rèn luyện kỹ thuật và biểu cảm",
      ],
      contactInfo: {
        phone: "0987.654.321",
        email: "tran.thi.binh@music.com",
        address: "Quận Ba Đình, Hà Nội",
      },
      reviews: [
        {
          studentName: "Nguyễn Hà",
          rating: 5,
          comment:
            "Cô Bình dạy rất tận tâm, phương pháp dễ hiểu. Con tôi rất thích học piano với cô.",
          date: "10/03/2024",
        },
        {
          studentName: "Đặng Minh",
          rating: 4,
          comment:
            "Cô có kiến thức chuyên môn tốt, giúp tôi tiến bộ nhanh chóng sau 6 tháng học.",
          date: "25/01/2024",
        },
      ],
      repertoire: [
        "Classical (Mozart, Beethoven, Chopin)",
        "Contemporary Piano",
        "Jazz & Blues basics",
      ],
    },
  ];

  return teachers.find((teacher) => teacher.id === parseInt(id)) || teachers[0];
};

const TeacherProfilePage = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trong thực tế sẽ lấy id từ params, nhưng ở đây mặc định là 1
  // const { id } = useParams();
  const id = 1;

  useEffect(() => {
    // Giả lập fetch dữ liệu từ API
    const fetchTeacherDetails = () => {
      setLoading(true);
      setTimeout(() => {
        const teacherData = generateTeacherDetails(id);
        setTeacher(teacherData);
        setLoading(false);
      }, 500);
    };

    fetchTeacherDetails();
  }, [id]);

  if (loading || !teacher) {
    return (
      <Layout className="min-h-screen">
        <Content className="p-6">
          <Card loading={true} />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-blue-600 flex items-center">
        <div className="text-white text-2xl font-bold">
          Trung Tâm Âm Nhạc XYZ
        </div>
      </Header>

      <Content className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <Card className="mb-6">
            <Row gutter={24} align="middle">
              <Col xs={24} md={6} className="text-center">
                <Avatar size={150} src={teacher.image} />
              </Col>
              <Col xs={24} md={18}>
                <Title level={2}>{teacher.name}</Title>
                <Space size="large">
                  <Tag color="blue" className="text-base py-1">
                    <MusicNoteOutlined /> {teacher.specialty}
                  </Tag>
                  <span>
                    <ClockCircleOutlined /> {teacher.experience} kinh nghiệm
                  </span>
                  <span>
                    <StarOutlined /> {teacher.rating}/5 (
                    {teacher.reviews.length} đánh giá)
                  </span>
                  <span>
                    <TeamOutlined /> {teacher.students} học viên
                  </span>
                </Space>
                <Paragraph className="mt-4 text-lg">
                  {teacher.description}
                </Paragraph>
              </Col>
            </Row>
          </Card>

          {/* Main Content */}
          <Tabs defaultActiveKey="1" type="card" className="bg-white">
            <TabPane tab="Giới thiệu" key="1">
              <Card bordered={false}>
                <Row gutter={24}>
                  <Col xs={24} md={16}>
                    <Title level={4}>Học vấn & Chứng chỉ</Title>
                    <Timeline className="mt-4">
                      {teacher.education.map((edu, index) => (
                        <Timeline.Item
                          key={index}
                          color="blue"
                          dot={<ReadOutlined />}
                        >
                          {edu}
                        </Timeline.Item>
                      ))}
                    </Timeline>

                    <Divider />

                    <Title level={4}>Thành tựu</Title>
                    <Timeline className="mt-4">
                      {teacher.achievements.map((achievement, index) => (
                        <Timeline.Item
                          key={index}
                          color="gold"
                          dot={<TrophyOutlined />}
                        >
                          {achievement}
                        </Timeline.Item>
                      ))}
                    </Timeline>

                    <Divider />

                    <Title level={4}>Phương pháp giảng dạy</Title>
                    <List
                      dataSource={teacher.teachingMethods}
                      renderItem={(item) => (
                        <List.Item>
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                          {item}
                        </List.Item>
                      )}
                    />

                    <Divider />

                    <Title level={4}>Các bài học phổ biến</Title>
                    <List
                      dataSource={teacher.repertoire}
                      renderItem={(item) => (
                        <List.Item>
                          <MusicNoteOutlined /> {item}
                        </List.Item>
                      )}
                    />
                  </Col>

                  <Col xs={24} md={8}>
                    <Card title="Thông tin liên hệ" className="mb-6">
                      <p>
                        <PhoneOutlined className="mr-2" />
                        {teacher.contactInfo.phone}
                      </p>
                      <p>
                        <MailOutlined className="mr-2" />
                        {teacher.contactInfo.email}
                      </p>
                      <p>
                        <EnvironmentOutlined className="mr-2" />
                        {teacher.contactInfo.address}
                      </p>
                    </Card>

                    <Button type="primary" size="large" block className="mt-4">
                      Đăng ký học
                    </Button>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            <TabPane tab="Đánh giá" key="3">
              <Card bordered={false}>
                <div className="mb-6 text-center">
                  <Title level={2}>{teacher.rating}</Title>
                  <Rate disabled defaultValue={teacher.rating} allowHalf />
                  <div className="mt-2 text-gray-500">
                    {teacher.reviews.length} đánh giá từ học viên
                  </div>
                </div>

                <Divider />

                <List
                  itemLayout="vertical"
                  dataSource={teacher.reviews}
                  renderItem={(review) => (
                    <List.Item>
                      <div className="flex justify-between">
                        <div className="font-bold">{review.studentName}</div>
                        <div className="text-gray-500">{review.date}</div>
                      </div>
                      <Rate
                        disabled
                        defaultValue={review.rating}
                        className="mt-1 mb-2"
                      />
                      <div>{review.comment}</div>
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </Content>

      <Footer className="text-center bg-blue-600 text-white">
        © 2024 Trung Tâm Âm Nhạc XYZ - Tất cả các quyền được bảo lưu
      </Footer>
    </Layout>
  );
};

// Thêm component MusicNoteOutlined vì không có trong iconlist
const MusicNoteOutlined = () => (
  <svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="music"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M512 128l256 0 0 512c0 35.34-14.36 48-32 48s-32-12.66-32-48 14.36-48 32-48 32 12.66 32 48L768 160l-224 0 0 608c0 35.34-14.36 48-32 48s-32-12.66-32-48 14.36-48 32-48 32 12.66 32 48L544 128z"></path>
  </svg>
);

export default TeacherProfilePage;
