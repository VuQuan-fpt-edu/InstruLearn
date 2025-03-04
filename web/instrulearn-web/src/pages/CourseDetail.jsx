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
  Typography,
  Divider,
  Tag,
  Space,
  Tabs,
  Rate,
  Progress,
  Badge,
  Breadcrumb,
  Image,
  Descriptions,
  Skeleton,
  Alert,
} from "antd";
import {
  EditOutlined,
  RollbackOutlined,
  SaveOutlined,
  EyeOutlined,
  DollarOutlined,
  BookOutlined,
  TagOutlined,
  PercentageOutlined,
  StarOutlined,
  PictureOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SSidebar from "../components/StaffSidebar";
import SHeader from "../components/StaffHeader";
import CourseContent from "./CourseContent";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("courses");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
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
    setLoading(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/${courseId}`
      );
      if (response.data && response.data.data) {
        setCourse(response.data.data);
        form.setFieldsValue(response.data.data);
        setImagePreview(response.data.data.imageUrl);
      } else if (response.data) {
        setCourse(response.data);
        form.setFieldsValue(response.data);
        setImagePreview(response.data.imageUrl);
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

  const handleImagePreview = (e) => {
    setImagePreview(e.target.value);
  };

  const handleBackToCourses = () => {
    navigate("/course-management");
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
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
            <div className="flex items-center justify-center h-full">
              <Spin size="large" tip="Đang tải thông tin khóa học..." />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout className="min-h-screen">
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
              <Alert
                message="Không thể tải thông tin khóa học"
                description="Vui lòng thử lại sau hoặc liên hệ với quản trị viên hệ thống."
                type="error"
                showIcon
                action={
                  <Button type="primary" onClick={handleBackToCourses}>
                    Quay lại danh sách
                  </Button>
                }
              />
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
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
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
              <span className="ml-1">Trang chủ</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/course-management">
              <BookOutlined />
              <span className="ml-1">Quản lý khóa học</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span>{course.courseName}</span>
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span>
                      <Title level={4} className="mb-0">
                        {course.courseName}
                      </Title>
                    </span>
                    <Space>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={openEditModal}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        icon={<RollbackOutlined />}
                        onClick={handleBackToCourses}
                      >
                        Quay lại
                      </Button>
                    </Space>
                  </div>
                }
                bordered={false}
                className="mb-6 shadow-sm"
              >
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Thông tin chung" key="1">
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label="Mã khóa học" span={2}>
                        {course.courseId}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tiêu đề" span={2}>
                        {course.headline}
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại nhạc cụ">
                        <Tag color="blue">{course.typeName}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá">
                        <Text strong className="text-red-500">
                          {course.price.toLocaleString()} VND
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giảm giá">
                        {course.discount > 0 ? (
                          <Badge
                            count={`${course.discount}%`}
                            style={{ backgroundColor: "#52c41a" }}
                          />
                        ) : (
                          <Text type="secondary">Không có</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Đánh giá">
                        <Space>
                          <Rate
                            disabled
                            defaultValue={course.rating}
                            allowHalf
                          />
                          <Text>{course.rating}/5</Text>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left">Mô tả</Divider>
                    <Paragraph>{course.courseDescription}</Paragraph>
                  </TabPane>

                  <TabPane tab="Nội dung khóa học" key="2">
                    <CourseContent courseId={courseId} />
                  </TabPane>
                </Tabs>
              </Card>
            </div>
            <div className="w-full md:w-1/3">
              <Card
                title={
                  <span>
                    <PictureOutlined /> Ảnh khóa học
                  </span>
                }
                bordered={false}
                className="mb-6 shadow-sm"
              >
                <div className="flex justify-center">
                  <Image
                    width="100%"
                    src={course.imageUrl}
                    alt={course.courseName}
                    fallback="https://placehold.co/600x400?text=No+Image"
                  />
                </div>
              </Card>

              <Card
                title={
                  <span>
                    <StarOutlined /> Thống kê
                  </span>
                }
                bordered={false}
                className="shadow-sm"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Số lượng học viên">
                    <Text strong>0</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng đánh giá">
                    <Text strong>0</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng bài học">
                    <Text strong>0</Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider>Đánh giá chi tiết</Divider>

                <div className="mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">5 sao</span>
                    <Progress percent={80} size="small" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">4 sao</span>
                    <Progress percent={15} size="small" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">3 sao</span>
                    <Progress percent={5} size="small" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">2 sao</span>
                    <Progress percent={0} size="small" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">1 sao</span>
                    <Progress percent={0} size="small" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <Modal
            title={
              <div className="flex items-center gap-2">
                <EditOutlined />
                <span>Chỉnh sửa khóa học</span>
              </div>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setModalVisible(false)}
                icon={<RollbackOutlined />}
              >
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={updateLoading}
                onClick={() => form.submit()}
                icon={<SaveOutlined />}
              >
                Cập nhật
              </Button>,
            ]}
            width={700}
          >
            <Form form={form} onFinish={handleUpdate} layout="vertical">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="courseName"
                  label={
                    <Space>
                      <BookOutlined /> Tên khóa học
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên khóa học" },
                  ]}
                  className="md:col-span-2"
                >
                  <Input placeholder="Nhập tên khóa học" />
                </Form.Item>

                <Form.Item
                  name="headline"
                  label={
                    <Space>
                      <EyeOutlined /> Tiêu đề
                    </Space>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                  className="md:col-span-2"
                >
                  <Input placeholder="Nhập tiêu đề hiển thị" />
                </Form.Item>

                <Form.Item
                  name="courseDescription"
                  label="Mô tả"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả khóa học" },
                  ]}
                  className="md:col-span-2"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về khóa học"
                  />
                </Form.Item>

                <Form.Item
                  name="price"
                  label={
                    <Space>
                      <DollarOutlined /> Giá
                    </Space>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                >
                  <InputNumber
                    className="w-full"
                    placeholder="VD: 1,000,000"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    min={0}
                    addonAfter="VND"
                  />
                </Form.Item>

                <Form.Item
                  name="discount"
                  label={
                    <Space>
                      <PercentageOutlined /> Giảm giá (%)
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập % giảm giá" },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    max={100}
                    placeholder="VD: 10"
                    addonAfter="%"
                  />
                </Form.Item>

                <Form.Item
                  name="typeId"
                  label={
                    <Space>
                      <TagOutlined /> Loại nhạc cụ
                    </Space>
                  }
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
                  label={
                    <Space>
                      <PictureOutlined /> Ảnh URL
                    </Space>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập URL ảnh" }]}
                  className="md:col-span-2"
                >
                  <Input
                    placeholder="Nhập đường dẫn hình ảnh"
                    onChange={handleImagePreview}
                  />
                </Form.Item>
              </div>

              {imagePreview && (
                <div className="mb-4 border p-2 rounded-md">
                  <Text strong className="block mb-2">
                    Xem trước ảnh:
                  </Text>
                  <div className="flex justify-center bg-gray-50 p-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-48 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Invalid+URL";
                      }}
                    />
                  </div>
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
