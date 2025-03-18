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
  Avatar,
  Divider,
  Row,
  Col,
  Statistic,
  message,
  Switch,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Dữ liệu mẫu cho lịch dạy 1-1
const privateClasses = [
  {
    id: 1,
    studentName: "Nguyễn Văn A",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    date: "2025-03-15",
    startTime: "14:00",
    duration: 90,
    course: "Guitar đệm hát",
    address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    phone: "0901234567",
    status: "Đã xác nhận",
    notes: "Học viên mới bắt đầu, cần tập trung vào kỹ thuật cơ bản",
    requirements: "Cần mang theo đàn guitar acoustic",
    isCompleted: false,
  },
  {
    id: 2,
    studentName: "Trần Thị B",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    date: "2025-03-17",
    startTime: "16:00",
    duration: 45,
    course: "Piano cơ bản",
    address: "456 Lê Hồng Phong, Quận 10, TP.HCM",
    phone: "0912345678",
    status: "Chờ xác nhận",
    notes: "Học viên đã có kiến thức cơ bản về piano",
    requirements: "Đã có đàn piano tại nhà",
    isCompleted: true,
  },
];

const PrivateSchedule = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("private-schedule");
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return privateClasses.filter((item) => item.date === dateStr);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.id}>
            <Badge
              status={item.status === "Đã xác nhận" ? "success" : "processing"}
              text={
                <Tooltip title={`${item.studentName} - ${item.startTime}`}>
                  <span className="truncate block">{item.course}</span>
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã xác nhận":
        return "green";
      case "Chờ xác nhận":
        return "orange";
      case "Đã hủy":
        return "red";
      default:
        return "default";
    }
  };

  const handleCompletionChange = (checked) => {
    setSelectedClass((prev) => ({
      ...prev,
      isCompleted: checked,
    }));
    message.success(
      `Đã ${checked ? "xác nhận" : "hủy xác nhận"} hoàn thành buổi học`
    );
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
              Lịch dạy 1-1 tại nhà học viên
            </Title>
            <Text type="secondary">
              Xem và quản lý lịch dạy các buổi học 1-1 tại nhà học viên
            </Text>
          </Card>

          <Row gutter={16} className="mb-4">
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng số buổi học hôm nay"
                  value={2}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Số buổi đã hoàn thành"
                  value={1}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Học viên mới"
                  value={1}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

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
                Chi tiết buổi học 1-1
              </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setModalVisible(false)}>
                Đóng
              </Button>,
            ]}
            width={600}
          >
            {selectedClass && (
              <div>
                <div className="text-center mb-4">
                  <Avatar
                    src={selectedClass.avatar}
                    size={80}
                    className="mb-2"
                  />
                  <Title level={4}>{selectedClass.studentName}</Title>
                  <Tag color={getStatusColor(selectedClass.status)}>
                    {selectedClass.status}
                  </Tag>
                </div>

                <Divider />

                <Space direction="vertical" size="middle" className="w-full">
                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text strong>Thời gian bắt đầu:</Text>
                      <Text>{selectedClass.startTime}</Text>
                    </Space>
                  </div>

                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text strong>Thời lượng:</Text>
                      <Text>{selectedClass.duration} phút</Text>
                    </Space>
                  </div>

                  <div>
                    <Space align="start">
                      <EnvironmentOutlined className="mt-1" />
                      <div>
                        <Text strong>Địa chỉ:</Text>
                        <Paragraph>{selectedClass.address}</Paragraph>
                      </div>
                    </Space>
                  </div>

                  <Divider />

                  <div>
                    <Space>
                      <CheckCircleOutlined />
                      <Text strong>Xác nhận hoàn thành:</Text>
                      <Switch
                        checked={selectedClass.isCompleted}
                        onChange={handleCompletionChange}
                        checkedChildren="Đã học"
                        unCheckedChildren="Chưa học"
                      />
                    </Space>
                  </div>

                  <div>
                    <Text strong>Nội dung buổi học:</Text>
                    <Paragraph className="mt-2">
                      {selectedClass.course}
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong>Ghi chú:</Text>
                    <Paragraph className="mt-2">
                      {selectedClass.notes}
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong>Yêu cầu chuẩn bị:</Text>
                    <Paragraph className="mt-2">
                      {selectedClass.requirements}
                    </Paragraph>
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

export default PrivateSchedule;
