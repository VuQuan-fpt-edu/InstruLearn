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
  Tag,
} from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CourseContent = ({ courseId }) => {
  const navigate = useNavigate();
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
      const contentResponse = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/CourseContent/get-all"
      );

      if (contentResponse.data?.isSucceed && contentResponse.data.data) {
        const filteredContents = contentResponse.data.data.filter(
          (content) => content.coursePackageId === parseInt(courseId)
        );
        setCourseContents(filteredContents);
      }
    } catch (error) {
      console.error("Error fetching course contents:", error);
      message.error("Không thể tải nội dung khóa học");
    } finally {
      setContentLoading(false);
    }
  };

  const handleAddContent = async (values) => {
    try {
      const contentData = {
        coursePackageId: parseInt(courseId),
        heading: values.heading,
      };

      const response = await axios.post(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/CourseContent/create",
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

  const handleUpdateContent = async (values) => {
    if (!selectedContent) return;

    try {
      const updateData = {
        courseId: parseInt(courseId),
        heading: values.heading,
      };

      const response = await axios.put(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/CourseContent/update/${selectedContent.contentId}`,
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

  const handleDeleteContent = async (contentId) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/CourseContent/delete/${contentId}`
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
    e.stopPropagation();
    setSelectedContent(content);
    contentForm.setFieldsValue({ heading: content.heading });
    setEditContentModalVisible(true);
  };

  const navigateToContentDetail = (contentId) => {
    navigate(`/staff/course-content-detail/${contentId}`);
  };

  const getContentStatus = (content) => {
    if (
      !content.courseContentItems ||
      content.courseContentItems.length === 0
    ) {
      return { status: 0, count: 0, total: 0 };
    }

    const total = content.courseContentItems.length;
    const lockedCount = content.courseContentItems.filter(
      (item) => item.status === 0
    ).length;

    return {
      status: lockedCount === total ? 0 : 1,
      count: lockedCount,
      total: total,
    };
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
            renderItem={(item) => {
              const contentStatus = getContentStatus(item);
              return (
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
                        e.stopPropagation();
                        handleDeleteContent(item.contentId);
                      }}
                      onCancel={(e) => e.stopPropagation()}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button
                        key="delete"
                        type="link"
                        danger
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined style={{ fontSize: "24px" }} />}
                    title={
                      <div className="flex items-center gap-3">
                        <span>{item.heading}</span>
                        <Tag
                          icon={
                            contentStatus.status === 0 ? (
                              <LockOutlined />
                            ) : (
                              <UnlockOutlined />
                            )
                          }
                          color={
                            contentStatus.status === 0 ? "error" : "success"
                          }
                        >
                          Đã khóa ({contentStatus.count}/{contentStatus.total})
                        </Tag>
                      </div>
                    }
                    description={`Content ID: ${item.contentId}`}
                  />
                </List.Item>
              );
            }}
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
