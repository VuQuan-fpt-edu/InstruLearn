import React, { useState } from "react";
import {
  Layout,
  Card,
  Calendar,
  Badge,
  Modal,
  Typography,
  Space,
  Tag,
  Button,
  Tooltip,
  List,
  Avatar,
  Divider,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

// Dữ liệu mẫu cho lịch dạy tại trung tâm
const centerClasses = [
  {
    id: 1,
    className: "Guitar cơ bản A1",
    date: "2025-03-15",
    time: "08:00 - 09:30",
    room: "Phòng 101",
    students: 12,
    maxStudents: 15,
    type: "Nhóm cơ bản",
    status: "Đang diễn ra",
    studentList: [
      {
        name: "Nguyễn Văn A",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      },
      {
        name: "Trần Thị B",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      },
    ],
  },
  {
    id: 2,
    className: "Piano nâng cao B2",
    date: "2025-03-17",
    time: "10:00 - 11:30",
    room: "Phòng 202",
    students: 8,
    maxStudents: 10,
    type: "Nhóm nâng cao",
    status: "Sắp diễn ra",
    studentList: [
      {
        name: "Lê Văn C",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      },
      {
        name: "Phạm Thị D",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      },
    ],
  },
  // Thêm nhiều lớp học khác...
];

const CenterSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("center-schedule");
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return centerClasses.filter((item) => item.date === dateStr);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.id}>
            <Badge
              status={item.status === "Đang diễn ra" ? "processing" : "default"}
              text={
                <Tooltip title={`${item.className} - ${item.time}`}>
                  <span className="truncate block">{item.className}</span>
                </Tooltip>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const classes = getListData(date);
    if (classes.length > 0) {
      setSelectedClass(classes[0]);
      setModalVisible(true);
    }
  };

  const handleAttendance = (classId) => {
    navigate(`/teacher/class-attendance/${classId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang diễn ra":
        return "green";
      case "Sắp diễn ra":
        return "blue";
      case "Đã kết thúc":
        return "gray";
      default:
        return "default";
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
          <Card className="mb-4">
            <Title level={4}>
              <CalendarOutlined className="mr-2" />
              Lịch dạy tại trung tâm
            </Title>
            <Text type="secondary">
              Xem và quản lý lịch dạy các lớp học tại trung tâm
            </Text>
          </Card>

          <Card>
            <Calendar
              onSelect={handleDateSelect}
              dateCellRender={dateCellRender}
              className="custom-calendar"
            />
          </Card>

          <Modal
            title={
              <Space>
                <CalendarOutlined />
                Chi tiết lớp học
              </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setModalVisible(false)}>
                Đóng
              </Button>,
              <Button
                key="attendance"
                type="primary"
                icon={<TeamOutlined />}
                onClick={() => handleAttendance(selectedClass.id)}
              >
                Điểm danh
              </Button>,
            ]}
            width={600}
          >
            {selectedClass && (
              <div>
                <div className="mb-4">
                  <Title level={4}>{selectedClass.className}</Title>
                  <Tag color={getStatusColor(selectedClass.status)}>
                    {selectedClass.status}
                  </Tag>
                </div>

                <Divider />

                <Space direction="vertical" size="middle" className="w-full">
                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text strong>Thời gian:</Text>
                      <Text>{selectedClass.time}</Text>
                    </Space>
                  </div>

                  <div>
                    <Space>
                      <EnvironmentOutlined />
                      <Text strong>Phòng học:</Text>
                      <Text>{selectedClass.room}</Text>
                    </Space>
                  </div>

                  <div>
                    <Space>
                      <TeamOutlined />
                      <Text strong>Sĩ số:</Text>
                      <Text>
                        {selectedClass.students}/{selectedClass.maxStudents} học
                        viên
                      </Text>
                    </Space>
                  </div>

                  <div>
                    <Text strong>Loại lớp:</Text>
                    <Tag color="blue" className="ml-2">
                      {selectedClass.type}
                    </Tag>
                  </div>
                </Space>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CenterSchedule;
