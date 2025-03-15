import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, Spin, Tag, Divider } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const mockClassDetails = {
  id: 1,
  title: "Lớp Piano cho người mới bắt đầu",
  instructor: {
    name: "Nguyễn Thanh Tùng",
    email: "tung.nguyen@example.com",
    phone: "0987 654 321",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  startDate: "28/03/2025",
  endDate: "30/06/2025",
  classCode: "PNA001",
  schedule: "Thứ 2 - Thứ 5",
  slot: "19:00 - 21:00",
  sessions: 24,
  students: [
    {
      id: 1,
      fullName: "Trần Văn A",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: 2,
      fullName: "Nguyễn Thị B",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: 3,
      fullName: "Lê Văn C",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ],
};

export default function ClassDetail() {
  const { id } = useParams();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập gọi API lấy dữ liệu lớp học theo ID
    setTimeout(() => {
      setClassDetail(mockClassDetails);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Spin size="large" />
        <div className="mt-4">Đang tải thông tin lớp học...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-4">{classDetail.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card giáo viên */}
        <Card className="md:col-span-1 shadow-lg border rounded-lg p-4 flex flex-col items-center text-center">
          <Avatar size={100} src={classDetail.instructor.avatar} />
          <h3 className="text-xl font-bold mt-3">
            {classDetail.instructor.name}
          </h3>
          <p className="text-gray-600 flex items-center mt-1">
            <MailOutlined className="mr-2" /> {classDetail.instructor.email}
          </p>
          <p className="text-gray-600 flex items-center">
            <PhoneOutlined className="mr-2" /> {classDetail.instructor.phone}
          </p>
        </Card>

        {/* Thông tin lớp học */}
        <div className="md:col-span-2 p-4 border rounded-lg shadow-sm">
          <p className="text-gray-600 flex items-center">
            <CalendarOutlined className="mr-2" /> {classDetail.startDate} -{" "}
            {classDetail.endDate}
          </p>
          <p className="text-gray-600 flex items-center">
            <IdcardOutlined className="mr-2" /> Mã lớp: {classDetail.classCode}
          </p>
          <p className="text-gray-600 flex items-center">
            <ClockCircleOutlined className="mr-2" /> Lịch học:{" "}
            {classDetail.schedule} ({classDetail.slot})
          </p>
          <p className="text-gray-600">Số buổi học: {classDetail.sessions}</p>
        </div>
      </div>

      <Divider />

      <h2 className="text-2xl font-bold mt-6">Danh sách học viên</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {classDetail.students.map((student, index) => (
          <Card
            key={student.id}
            className="border rounded-lg shadow-sm flex flex-col items-center p-4"
          >
            <Avatar size={80} src={student.avatar} className="mb-3" />
            <p className="font-semibold">{student.fullName}</p>
            <Tag color="blue">STT: {index + 1}</Tag>
          </Card>
        ))}
      </div>
    </div>
  );
}
