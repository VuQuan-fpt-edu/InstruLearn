import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Button,
  List,
  Popconfirm,
} from "antd";
import { BookOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng

const CourseContent = ({ courseId }) => {
  const navigate = useNavigate(); // Hook điều hướng
  const [courseContents, setCourseContents] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editContentModalVisible, setEditContentModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentForm] = Form.useForm();

  useEffect(() => {
    if (courseId) {
      fetchCourseContents();
    }
  }, [courseId]);

  const fetchCourseContents = async () => {
    setContentLoading(true);
    try {
      // First try to get content from the course API response
      const courseResponse = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/${courseId}`
      );

      if (courseResponse.data && courseResponse.data.courseContents) {
        setCourseContents(courseResponse.data.courseContents);
      } else if (
        courseResponse.data &&
        courseResponse.data.data &&
        courseResponse.data.data.courseContents
      ) {
        setCourseContents(courseResponse.data.data.courseContents);
      } else {
        // Fallback to the original courseContent API if needed
        const contentResponse = await axios.get(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContent/get-all"
        );

        if (
          contentResponse.data &&
          contentResponse.data.isSucceed &&
          contentResponse.data.data
        ) {
          // Filter content by courseId
          const filteredContents = contentResponse.data.data.filter(
            (content) => content.courseId === parseInt(courseId)
          );
          setCourseContents(filteredContents);
        }
      }
    } catch (error) {
      console.error("Error fetching course contents:", error);
      message.error("Không thể tải nội dung khóa học");
    } finally {
      setContentLoading(false);
    }
  };

  // Thêm nội dung khóa học mới
  const handleAddContent = async (values) => {
    try {
      const contentData = {
        courseId: parseInt(courseId),
        heading: values.heading,
      };

      const response = await axios.post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContent/create",
        contentData
      );

      if (response.data && response.data.isSucceed) {
        message.success("Thêm nội dung khóa học thành công");
        setContentModalVisible(false);
        contentForm.resetFields();
        fetchCourseContents();
      } else {
        message.error(
          response.data?.message || "Thêm nội dung khóa học thất bại"
        );
      }
    } catch (error) {
      console.error("Error adding course content:", error);
      message.error("Thêm nội dung khóa học thất bại");
    }
  };

  // Cập nhật nội dung khóa học
  const handleUpdateContent = async (values) => {
    if (!selectedContent) return;

    try {
      const updateData = {
        courseId: parseInt(courseId),
        heading: values.heading,
      };

      const response = await axios.put(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContent/update/${selectedContent.contentId}`,
        updateData
      );

      if (
        response.data &&
        (response.data.isSucceed || response.data.isSuccess)
      ) {
        message.success("Cập nhật nội dung khóa học thành công");
        setEditContentModalVisible(false);
        fetchCourseContents();
      } else {
        message.error(
          response.data?.message || "Cập nhật nội dung khóa học thất bại"
        );
      }
    } catch (error) {
      console.error("Error updating course content:", error);
      message.error("Cập nhật nội dung khóa học thất bại");
    }
  };

  // Xóa nội dung khóa học
  const handleDeleteContent = async (contentId) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContent/delete/${contentId}`
      );

      if (
        response.data &&
        (response.data.isSucceed || response.data.isSuccess)
      ) {
        message.success("Xóa nội dung khóa học thành công");
        fetchCourseContents();
      } else {
        message.error(
          response.data?.message || "Xóa nội dung khóa học thất bại"
        );
      }
    } catch (error) {
      console.error("Error deleting course content:", error);
      message.error("Xóa nội dung khóa học thất bại");
    }
  };

  const openAddContentModal = () => {
    contentForm.resetFields();
    setContentModalVisible(true);
  };

  const openEditContentModal = (content, e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa đến item cha
    setSelectedContent(content);
    contentForm.setFieldsValue({ heading: content.heading });
    setEditContentModalVisible(true);
  };

  // Hàm xử lý điều hướng đến trang chi tiết
  const navigateToContentDetail = (contentId) => {
    navigate(`/course-content-detail/${contentId}`);
  };

  return (
    <>
      <Card
        className="mt-6"
        title={
          <div className="flex items-center">
            <BookOutlined className="mr-2" />
            <span>Nội dung khóa học</span>
          </div>
        }
        bordered={false}
        extra={
          <Button type="primary" onClick={openAddContentModal}>
            Thêm nội dung
          </Button>
        }
      >
        {contentLoading ? (
          <div className="flex justify-center py-8">
            <Spin tip="Đang tải nội dung khóa học..." />
          </div>
        ) : courseContents.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={courseContents}
            renderItem={(item) => (
              <List.Item
                className="cursor-pointer hover:bg-gray-50 transition duration-300"
                onClick={() => navigateToContentDetail(item.contentId)}
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    onClick={(e) => openEditContentModal(item, e)}
                  >
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa nội dung này?"
                    onConfirm={(e) => {
                      e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa
                      handleDeleteContent(item.contentId);
                    }}
                    onCancel={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan tỏa
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button
                      key="delete"
                      type="link"
                      danger
                      onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan tỏa
                    >
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: "24px" }} />}
                  title={item.heading}
                  description={`Content ID: ${item.contentId}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="py-8 text-center text-gray-500">
            Không có nội dung nào cho khóa học này.
            <div className="mt-3">
              <Button type="primary" onClick={openAddContentModal}>
                Thêm nội dung mới
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal thêm nội dung khóa học */}
      <Modal
        title="Thêm nội dung khóa học"
        open={contentModalVisible}
        onCancel={() => setContentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setContentModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => contentForm.submit()}
          >
            Thêm
          </Button>,
        ]}
      >
        <Form form={contentForm} onFinish={handleAddContent} layout="vertical">
          <Form.Item
            name="heading"
            label="Tiêu đề nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề nội dung" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa nội dung khóa học */}
      <Modal
        title="Chỉnh sửa nội dung khóa học"
        open={editContentModalVisible}
        onCancel={() => setEditContentModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setEditContentModalVisible(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => contentForm.submit()}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form
          form={contentForm}
          onFinish={handleUpdateContent}
          layout="vertical"
        >
          <Form.Item
            name="heading"
            label="Tiêu đề nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề nội dung" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CourseContent;
