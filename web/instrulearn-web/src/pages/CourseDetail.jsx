import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
} from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";
import SSidebar from "../components/StaffSidebar";
import SHeader from "../components/StaffHeader";
import CourseContent from "./CourseContent";

const { Content } = Layout;
const { Option } = Select;

const CourseDetail = () => {
  const { courseId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("courses");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourseDetail();
    fetchInstrumentTypes();
  }, [courseId]);

  const fetchInstrumentTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/get-all"
      );

      if (response.data && response.data.isSucceed && response.data.data) {
        setInstrumentTypes(response.data.data);
      } else {
        console.error("Unexpected instrument types format:", response.data);
        setInstrumentTypes([]);
      }
    } catch (error) {
      console.error("Error fetching instrument types:", error);
      message.error("Không thể tải danh sách loại nhạc cụ");
    }
  };

  const fetchCourseDetail = async () => {
    try {
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/${courseId}`
      );

      // Check if data is in the expected format
      if (response.data && response.data.data) {
        setCourse(response.data.data);
        // Pre-populate form when course data changes
        form.setFieldsValue(response.data.data);
      } else if (response.data) {
        // If the API returns data directly without a data wrapper
        setCourse(response.data);
        form.setFieldsValue(response.data);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      message.error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    if (!course) return;

    setUpdateLoading(true);
    try {
      const updateData = {
        ...values,
        rating: course.rating || 0,
      };

      console.log("Sending update with data:", updateData);

      const response = await axios.put(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/update/${courseId}`,
        updateData
      );

      console.log("API response:", response.data);

      if (
        response.data &&
        (response.data.isSuccess ||
          response.data.message?.includes("successfully"))
      ) {
        message.success("Cập nhật khóa học thành công");
        setModalVisible(false);
        setTimeout(() => {
          fetchCourseDetail();
        }, 500);
      } else {
        message.warning(
          response.data?.message || "Cập nhật có vấn đề, vui lòng kiểm tra lại"
        );
      }
    } catch (error) {
      console.error("Update error details:", error);

      if (error.message && error.message.includes("successfully")) {
        message.success("Cập nhật khóa học thành công");
        setModalVisible(false);
        setTimeout(() => {
          fetchCourseDetail();
        }, 500);
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Cập nhật khóa học thất bại";
        message.error(errorMsg);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const openEditModal = () => {
    if (course) {
      form.setFieldsValue(course);
      setModalVisible(true);
    }
  };

  if (loading) {
    return (
      <Layout className="h-screen">
        <Spin
          size="large"
          className="flex justify-center items-center h-full"
        />
      </Layout>
    );
  }

  // Check if course data is available before rendering course details
  if (!course) {
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
          <Content className="p-6 bg-gray-50 overflow-auto">
            <Card bordered={false}>
              <div className="py-8 text-center text-gray-500">
                Không thể tải thông tin khóa học. Vui lòng thử lại sau.
              </div>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }

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
        <Content className="p-6 bg-gray-50 overflow-auto">
          <Card
            title={course.courseName}
            bordered={false}
            extra={<Button onClick={openEditModal}>Chỉnh sửa</Button>}
          >
            <p>
              <strong>Mô tả:</strong> {course.courseDescription}
            </p>
            <p>
              <strong>Tiêu đề:</strong> {course.headline}
            </p>
            <p>
              <strong>Giá:</strong> {course.price.toLocaleString()} VND
            </p>
            <p>
              <strong>Loại nhạc cụ:</strong> {course.typeName}
            </p>
            <p>
              <strong>Giảm giá:</strong> {course.discount}%
            </p>
            <p>
              <strong>Đánh giá:</strong> {course.rating}/5
            </p>
            {course.imageUrl && (
              <div className="mt-4">
                <img
                  src={course.imageUrl}
                  alt={course.courseName}
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
              </div>
            )}
          </Card>

          {/* Sử dụng component CourseContent */}
          <CourseContent courseId={courseId} />

          {/* Modal chỉnh sửa khóa học */}
          <Modal
            title="Chỉnh sửa khóa học"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setModalVisible(false)}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={updateLoading}
                onClick={() => form.submit()}
              >
                Cập nhật
              </Button>,
            ]}
            width={600}
          >
            <Form form={form} onFinish={handleUpdate} layout="vertical">
              <Form.Item
                name="courseName"
                label="Tên khóa học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khóa học" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="courseDescription"
                label="Mô tả"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả khóa học" },
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="headline"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="price"
                label="Giá"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                />
              </Form.Item>
              <Form.Item
                name="discount"
                label="Giảm giá (%)"
                rules={[
                  { required: true, message: "Vui lòng nhập % giảm giá" },
                ]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
              <Form.Item
                name="typeId"
                label="Loại nhạc cụ"
                rules={[
                  { required: true, message: "Vui lòng chọn loại nhạc cụ" },
                ]}
              >
                <Select placeholder="Chọn loại nhạc cụ">
                  {instrumentTypes.map((type) => (
                    <Option key={type.typeId} value={type.typeId}>
                      {type.typeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="imageUrl"
                label="Ảnh URL"
                rules={[{ required: true, message: "Vui lòng nhập URL ảnh" }]}
              >
                <Input />
              </Form.Item>
              {form.getFieldValue("imageUrl") && (
                <div className="mb-4">
                  <p className="mb-1">Xem trước ảnh:</p>
                  <img
                    src={form.getFieldValue("imageUrl")}
                    alt="Preview"
                    className="max-w-full h-auto max-h-48 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/600x400?text=Invalid+URL";
                    }}
                  />
                </div>
              )}
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourseDetail;
