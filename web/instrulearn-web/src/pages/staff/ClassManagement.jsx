import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Input,
  Space,
  Typography,
  Card,
  Tag,
  Tooltip,
  Spin,
  Badge,
  Modal,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

// Dữ liệu giả
const fakeClasses = [
  {
    classId: 1,
    className: "Guitar cơ bản buổi tối",
    courseName: "Guitar cơ bản",
    teacherName: "Nguyễn Văn An",
    startDate: "2024-02-15",
    endDate: "2024-05-15",
    studentCount: 15,
    status: "Đang hoạt động",
    schedule: "Thứ 2, 4, 6 - 18:00-20:00",
    room: "Phòng 101",
    maxStudents: 20,
  },
  {
    classId: 2,
    className: "Piano nâng cao cuối tuần",
    courseName: "Piano nâng cao",
    teacherName: "Trần Thị Bình",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    studentCount: 8,
    status: "Đang hoạt động",
    schedule: "Thứ 7, CN - 14:00-16:00",
    room: "Phòng 205",
    maxStudents: 10,
  },
  {
    classId: 3,
    className: "Violin cơ bản sáng",
    courseName: "Violin cơ bản",
    teacherName: "Lê Văn Cường",
    startDate: "2024-04-01",
    endDate: "2024-07-15",
    studentCount: 0,
    status: "Sắp khai giảng",
    schedule: "Thứ 3, 5 - 8:00-10:00",
    room: "Phòng 103",
    maxStudents: 12,
  },
  {
    classId: 4,
    className: "Trống Jazz buổi tối",
    courseName: "Trống Jazz",
    teacherName: "Phạm Văn Dương",
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    studentCount: 7,
    status: "Đã kết thúc",
    schedule: "Thứ 2, 4 - 19:00-21:00",
    room: "Phòng 302",
    maxStudents: 8,
  },
  {
    classId: 5,
    className: "Sáo trúc truyền thống",
    courseName: "Sáo trúc Việt Nam",
    teacherName: "Nguyễn Thị Ngọc",
    startDate: "2024-02-20",
    endDate: "2024-06-20",
    studentCount: 12,
    status: "Tạm ngưng",
    schedule: "Thứ 2, 6 - 17:30-19:30",
    room: "Phòng 201",
    maxStudents: 15,
  },
  {
    classId: 6,
    className: "Ukulele cơ bản cuối tuần",
    courseName: "Ukulele cơ bản",
    teacherName: "Lê Thị Hương",
    startDate: "2024-03-15",
    endDate: "2024-06-15",
    studentCount: 18,
    status: "Đang hoạt động",
    schedule: "Thứ 7, CN - 9:00-11:00",
    room: "Phòng 104",
    maxStudents: 20,
  },
  {
    classId: 7,
    className: "Thanh nhạc pop",
    courseName: "Thanh nhạc hiện đại",
    teacherName: "Trần Văn Khánh",
    startDate: "2024-04-10",
    endDate: "2024-08-10",
    studentCount: 0,
    status: "Sắp khai giảng",
    schedule: "Thứ 3, 5, 7 - 18:00-19:30",
    room: "Phòng 301",
    maxStudents: 10,
  },
  {
    classId: 8,
    className: "Kèn Saxophone nâng cao",
    courseName: "Saxophone nâng cao",
    teacherName: "Phạm Thị Lan",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    studentCount: 6,
    status: "Đã kết thúc",
    schedule: "Thứ 2, 4, 6 - 19:00-21:00",
    room: "Phòng 202",
    maxStudents: 8,
  },
  {
    classId: 9,
    className: "Đàn tranh cơ bản",
    courseName: "Đàn tranh truyền thống",
    teacherName: "Lê Thị Mai",
    startDate: "2024-02-01",
    endDate: "2024-06-01",
    studentCount: 5,
    status: "Đang hoạt động",
    schedule: "Thứ 3, 5 - 15:00-17:00",
    room: "Phòng 203",
    maxStudents: 10,
  },
  {
    classId: 10,
    className: "Guitar đệm hát tối",
    courseName: "Guitar đệm hát",
    teacherName: "Nguyễn Văn Nam",
    startDate: "2024-03-05",
    endDate: "2024-06-05",
    studentCount: 13,
    status: "Đang hoạt động",
    schedule: "Thứ 2, 4, 6 - 19:30-21:00",
    room: "Phòng 105",
    maxStudents: 15,
  },
];

const ClassManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Giả lập việc tải dữ liệu
    const loadFakeData = setTimeout(() => {
      setClasses(fakeClasses);
      setLoading(false);
    }, 800);

    return () => clearTimeout(loadFakeData);
  }, []);

  const fetchClasses = () => {
    setLoading(true);
    // Giả lập việc tải lại dữ liệu
    setTimeout(() => {
      setClasses(fakeClasses);
      setLoading(false);
      message.success("Đã tải lại danh sách lớp học");
    }, 800);
  };

  const handleDelete = (classId, e) => {
    e.stopPropagation();

    confirm({
      title: "Bạn có chắc chắn muốn xóa lớp học này?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        // Giả lập việc xóa
        setLoading(true);
        setTimeout(() => {
          setClasses(classes.filter((item) => item.classId !== classId));
          setLoading(false);
          message.success("Xóa lớp học thành công");
        }, 500);
      },
    });
  };

  const handleRowClick = (record) => {
    navigate(`/class-detail/${record.classId}`);
    // Hoặc bạn có thể giả lập việc xem chi tiết
    // message.info(`Xem chi tiết lớp: ${record.className}`);
  };

  const handleAddClass = () => {
    navigate("/add-class");
    // Hoặc bạn có thể giả lập việc thêm mới
    // message.info("Chuyển đến trang thêm lớp học mới");
  };

  const handleEditClass = (classId, e) => {
    e.stopPropagation();
    navigate(`/edit-class/${classId}`);
    // Hoặc bạn có thể giả lập việc chỉnh sửa
    // message.info(`Chỉnh sửa lớp có ID: ${classId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "green";
      case "Sắp khai giảng":
        return "blue";
      case "Đã kết thúc":
        return "gray";
      case "Tạm ngưng":
        return "orange";
      default:
        return "default";
    }
  };

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.teacherName.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tên lớp học",
      dataIndex: "className",
      key: "className",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.className.localeCompare(b.className),
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
      render: (text) => <span>{text}</span>,
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: "Lịch học",
      dataIndex: "schedule",
      key: "schedule",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString("vi-VN")}
        </Space>
      ),
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: "Học viên",
      key: "students",
      render: (_, record) => (
        <Tooltip
          title={`${record.studentCount}/${record.maxStudents} học viên`}
        >
          <Badge
            count={`${record.studentCount}/${record.maxStudents}`}
            style={{
              backgroundColor:
                record.studentCount >= record.maxStudents ? "#f50" : "#108ee9",
            }}
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.studentCount - b.studentCount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: [
        { text: "Đang hoạt động", value: "Đang hoạt động" },
        { text: "Sắp khai giảng", value: "Sắp khai giảng" },
        { text: "Đã kết thúc", value: "Đã kết thúc" },
        { text: "Tạm ngưng", value: "Tạm ngưng" },
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
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleRowClick(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => handleEditClass(record.classId, e)}
              disabled={record.status === "Đã kết thúc"}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => handleDelete(record.classId, e)}
              disabled={
                record.status === "Đang hoạt động" && record.studentCount > 0
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý lớp học</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm lớp học..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchClasses} />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddClass}
                >
                  Thêm lớp học
                </Button>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredClasses}
                rowKey="classId"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  className: "cursor-pointer hover:bg-gray-50",
                })}
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} lớp học`,
                }}
              />
            </Spin>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassManagement;
