import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Avatar,
  Progress,
  Typography,
  Tooltip,
  Badge,
  Modal,
  message,
  Drawer,
  Descriptions,
  Divider,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";

const { Content } = Layout;
const { Title, Text } = Typography;

// Dữ liệu mẫu cho danh sách học viên
const fakeStudents = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    age: 20,
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    course: "Guitar cơ bản",
    startDate: "2025-01-15",
    attendance: 95,
    performance: 85,
    status: "Đang học",
    lastAttendance: "2025-03-10",
    notes: "Học viên chăm chỉ, tiến bộ đều",
    address: "Quận 1, TP.HCM",
    emergencyContact: "0987654321",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    age: 18,
    email: "tranthib@gmail.com",
    phone: "0912345678",
    course: "Piano cơ bản",
    startDate: "2025-02-01",
    attendance: 88,
    performance: 90,
    status: "Đang học",
    lastAttendance: "2025-03-09",
    notes: "Có năng khiếu âm nhạc tốt",
    address: "Quận 2, TP.HCM",
    emergencyContact: "0987654322",
  },
  // Thêm nhiều học viên mẫu khác...
];

const StudentList = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("students");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState(fakeStudents);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setStudents(fakeStudents);
      setLoading(false);
    }, 1000);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setDrawerVisible(true);
  };

  const handleEditStudent = (student) => {
    message.info("Chức năng chỉnh sửa đang được phát triển");
  };

  const handleDeleteStudent = (student) => {
    Modal.confirm({
      title: "Xác nhận xóa học viên",
      content: `Bạn có chắc chắn muốn xóa học viên ${student.name}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk() {
        message.success("Đã xóa học viên thành công");
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang học":
        return "green";
      case "Tạm nghỉ":
        return "orange";
      case "Đã hoàn thành":
        return "blue";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <span className="font-medium">{text}</span>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <PhoneOutlined /> {record.phone}
          </Space>
          <Space>
            <MailOutlined /> {record.email}
          </Space>
        </Space>
      ),
    },
    {
      title: "Khóa học",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Chuyên cần",
      key: "attendance",
      render: (_, record) => (
        <Tooltip title={`${record.attendance}% chuyên cần`}>
          <Progress
            percent={record.attendance}
            size="small"
            status={record.attendance < 80 ? "exception" : "success"}
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.attendance - b.attendance,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: [
        { text: "Đang học", value: "Đang học" },
        { text: "Tạm nghỉ", value: "Tạm nghỉ" },
        { text: "Đã hoàn thành", value: "Đã hoàn thành" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewStudent(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditStudent(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteStudent(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(searchText.toLowerCase()) ||
      student.phone.includes(searchText) ||
      student.course.toLowerCase().includes(searchText.toLowerCase())
  );

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
              <Title level={4}>Danh sách học viên</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm học viên..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 300 }}
                />
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchStudents} />
                </Tooltip>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredStudents}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} học viên`,
              }}
            />
          </Card>

          <Drawer
            title="Thông tin chi tiết học viên"
            placement="right"
            width={600}
            onClose={() => setDrawerVisible(false)}
            visible={drawerVisible}
          >
            {selectedStudent && (
              <>
                <div className="text-center mb-6">
                  <Avatar
                    src={selectedStudent.avatar}
                    size={100}
                    className="mb-4"
                  />
                  <Title level={4}>{selectedStudent.name}</Title>
                  <Tag color={getStatusColor(selectedStudent.status)}>
                    {selectedStudent.status}
                  </Tag>
                </div>

                <Divider />

                <Descriptions title="Thông tin cá nhân" column={1}>
                  <Descriptions.Item label="Tuổi">
                    {selectedStudent.age}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedStudent.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {selectedStudent.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {selectedStudent.address}
                  </Descriptions.Item>
                  <Descriptions.Item label="Liên hệ khẩn cấp">
                    {selectedStudent.emergencyContact}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions title="Thông tin khóa học" column={1}>
                  <Descriptions.Item label="Khóa học">
                    {selectedStudent.course}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu">
                    {selectedStudent.startDate}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm danh gần nhất">
                    {selectedStudent.lastAttendance}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỷ lệ chuyên cần">
                    <Progress
                      percent={selectedStudent.attendance}
                      status={
                        selectedStudent.attendance < 80
                          ? "exception"
                          : "success"
                      }
                    />
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div>
                  <Title level={5}>Ghi chú</Title>
                  <Text>{selectedStudent.notes}</Text>
                </div>
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentList;
