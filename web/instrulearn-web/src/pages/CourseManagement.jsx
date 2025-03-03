import React, { useState, useEffect } from "react";
import { Layout, Table, Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SSidebar from "../components/StaffSidebar";
import SHeader from "../components/StaffHeader";

const { Content } = Layout;

const CourseManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("courses");
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all"
      );

      // Kiểm tra xem response.data có tồn tại không
      if (response.data) {
        setCourses(response.data);
      } else {
        console.error(
          "API response missing expected data structure:",
          response
        );
        setCourses([]); // Đặt courses là mảng rỗng để tránh lỗi render
        message.error("Dữ liệu không đúng định dạng");
      }
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải danh sách khóa học");
      setCourses([]); // Đặt courses là mảng rỗng để tránh lỗi render
    }
  };
  const handleDelete = async (courseId) => {
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

  const columns = [
    { title: "Tên khóa học", dataIndex: "courseName", key: "courseName" },
    {
      title: "Mô tả",
      dataIndex: "courseDescription",
      key: "courseDescription",
    },
    { title: "Giá", dataIndex: "price", key: "price" },
    { title: "Loại nhạc cụ", dataIndex: "typeName", key: "typeName" },
    {
      title: "Hành động",
      key: "actions",
      render: (text, record) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.courseId)}
          danger
        />
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
          <Table
            columns={columns}
            dataSource={Array.isArray(courses) ? courses : []}
            rowKey="courseId"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourseManagement;
