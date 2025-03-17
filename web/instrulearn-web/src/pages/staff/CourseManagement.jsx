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
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;

const CourseManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("course-management");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all"
      );

      if (response.data) {
        setCourses(response.data);
      } else {
        console.error(
          "API response missing expected data structure:",
          response
        );
        setCourses([]);
        message.error("Dữ liệu không đúng định dạng");
      }
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải danh sách khóa học");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/delete/${courseId}`
      );
      message.success("Xóa khóa học thành công");
      fetchCourses();
    } catch (error) {
      message.error("Xóa khóa học thất bại");
    }
  };

  const handleRowClick = (record) => {
    navigate(`/course-detail/${record.courseId}`);
  };

  const handleAddCourse = () => {
    navigate("/staff/add-course");
  };

  const handleEditCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/edit-course/${courseId}`);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      course.courseDescription
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      course.typeName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "courseName",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: "Mô tả",
      dataIndex: "courseDescription",
      key: "courseDescription",
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Loại nhạc cụ",
      dataIndex: "typeName",
      key: "typeName",
      render: (type) => <Tag color="blue">{type}</Tag>,
      filters: Array.from(
        new Set(courses.map((course) => course.typeName))
      ).map((type) => ({ text: type, value: type })),
      onFilter: (value, record) => record.typeName === value,
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
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => handleDelete(record.courseId, e)}
            />
          </Tooltip>
        </Space>
      ),
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
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý khóa học</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchCourses} />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCourse}
                >
                  Thêm khóa học
                </Button>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredCourses}
                rowKey="courseId"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  className: "cursor-pointer hover:bg-gray-50",
                })}
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} khóa học`,
                }}
              />
            </Spin>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourseManagement;
