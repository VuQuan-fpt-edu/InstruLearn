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
  Empty,
  Upload,
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
  UploadOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import CourseContent from "./CourseContent";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("course-management");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [form] = Form.useForm();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedInstrumentType, setSelectedInstrumentType] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseResponse, typesResponse] = await Promise.all([
        axios.get(
          `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Course/${courseId}`
        ),
        axios.get(
          "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/CourseType/get-all"
        ),
      ]);

      if (courseResponse.data) {
        setCourse(courseResponse.data);
        setImagePreview(courseResponse.data.imageUrl);
        console.log("Course data:", courseResponse.data);
      }

      if (typesResponse.data?.isSucceed && typesResponse.data.data) {
        setInstrumentTypes(typesResponse.data.data);
        // Tìm và set loại nhạc cụ hiện tại
        const currentType = typesResponse.data.data.find(
          (type) => type.courseTypeId === courseResponse.data.courseTypeId
        );
        setSelectedInstrumentType(currentType);
        console.log("Current instrument type:", currentType);
      } else {
        console.error("Failed to load instrument types:", typesResponse.data);
        message.error("Không thể tải danh sách loại nhạc cụ");
      }

      // Set form values after both APIs have responded
      if (courseResponse.data) {
        const formData = {
          courseName: courseResponse.data.courseName,
          headline: courseResponse.data.headline,
          courseDescription: courseResponse.data.courseDescription,
          price: courseResponse.data.price,
          discount: courseResponse.data.discount,
          imageUrl: courseResponse.data.imageUrl,
          courseTypeId: courseResponse.data.courseTypeId,
          status: courseResponse.data.status,
        };
        console.log("Setting form values:", formData);
        form.setFieldsValue(formData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleUpdate = async (values) => {
    if (!course) return;

    setUpdateLoading(true);
    try {
      const updateData = {
        courseTypeId: values.courseTypeId,
        courseName: values.courseName,
        courseDescription: values.courseDescription,
        headline: values.headline,
        rating: course.rating || 0,
        price: values.price,
        discount: values.discount,
        imageUrl: values.imageUrl,
        status: values.status || 0,
      };

      console.log("Sending update with data:", updateData);

      const response = await axios.put(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Course/update/${courseId}`,
        updateData
      );

      if (response.data && response.data.isSucceed) {
        message.success("Cập nhật khóa học thành công");
        setModalVisible(false);
        fetchData(); // Gọi lại fetchData thay vì fetchCourseDetail
      } else {
        throw new Error(response.data?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update error details:", error);
      message.error(error.message || "Cập nhật khóa học thất bại");
    } finally {
      setUpdateLoading(false);
    }
  };

  const openEditModal = () => {
    if (course) {
      const currentType = instrumentTypes.find(
        (type) => type.courseTypeId === course.courseTypeId
      );
      setSelectedInstrumentType(currentType);

      form.setFieldsValue({
        courseName: course.courseName,
        headline: course.headline,
        courseDescription: course.courseDescription,
        price: course.price,
        discount: course.discount,
        imageUrl: course.imageUrl,
        courseTypeId: course.courseTypeId,
        status: course.status,
      });
      setPreviewImage(course.imageUrl);
      setModalVisible(true);
    }
  };

  const handleInstrumentTypeChange = (value) => {
    const selectedType = instrumentTypes.find(
      (type) => type.courseTypeId === value
    );
    setSelectedInstrumentType(selectedType);
    form.setFieldsValue({ courseTypeId: value });
  };

  const handleImagePreview = (e) => {
    setImagePreview(e.target.value);
  };

  const handleBackToCourses = () => {
    navigate("/staff/course-management");
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        message.error("Vui lòng chỉ chọn file hình ảnh");
        return;
      }

      // Validate file size (maximum 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      setUploadFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    if (!uploadFile) {
      message.error("Vui lòng chọn file hình ảnh trước");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Đang tải ảnh lên...");

    // Create a storage reference with a unique filename
    const storageRef = ref(
      storage,
      `course-images/${Date.now()}-${uploadFile.name}`
    );

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, uploadFile);

    // Monitor upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        message.error("Tải ảnh lên thất bại");
        setUploadStatus("Tải ảnh thất bại");
        setIsUploading(false);
      },
      () => {
        // Upload complete, get download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          form.setFieldsValue({ imageUrl: downloadURL });
          setUploadStatus("Tải ảnh thành công!");
          setIsUploading(false);
          message.success("Tải ảnh lên thành công");
        });
      }
    );
  };

  if (loading) {
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
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
              <span className="ml-1">Trang chủ</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/staff/course-management">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <Card
                          title="Thông tin cơ bản"
                          bordered={false}
                          className="shadow-sm"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Text type="secondary">Mã khóa học</Text>
                              <div className="font-medium">
                                {course.coursePackageId}
                              </div>
                            </div>
                            <div>
                              <Text type="secondary">Loại nhạc cụ</Text>
                              <div>
                                <Tag color="blue">{course.courseTypeName}</Tag>
                              </div>
                            </div>
                            <div>
                              <Text type="secondary">Trạng thái</Text>
                              <div>
                                <Badge
                                  status={
                                    course.status === 0 ? "error" : "success"
                                  }
                                  text={
                                    course.status === 0
                                      ? "Đang xử lý"
                                      : "Đang mở bán"
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Text type="secondary">Giá</Text>
                              <div className="text-red-500 font-medium">
                                {course.price.toLocaleString()} VND
                              </div>
                            </div>
                            <div>
                              <Text type="secondary">Giảm giá</Text>
                              <div>
                                {course.discount > 0 ? (
                                  <Badge
                                    count={`${course.discount}%`}
                                    style={{ backgroundColor: "#52c41a" }}
                                  />
                                ) : (
                                  <Text type="secondary">Không có</Text>
                                )}
                              </div>
                            </div>
                            <div>
                              <Text type="secondary">Đánh giá</Text>
                              <div className="flex items-center gap-2">
                                <Rate
                                  disabled
                                  defaultValue={course.rating}
                                  allowHalf
                                />
                                <Text>{course.rating}/5</Text>
                              </div>
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Text type="secondary">Tiêu đề</Text>
                            <div className="font-medium mt-1">
                              {course.headline}
                            </div>
                          </div>

                          <div className="mt-4">
                            <Text type="secondary">Mô tả</Text>
                            <Paragraph className="mt-1">
                              {course.courseDescription}
                            </Paragraph>
                          </div>
                        </Card>

                        <Card
                          title="Thống kê"
                          bordered={false}
                          className="shadow-sm mt-6"
                        >
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <Title level={3}>
                                {course.courseContents?.length || 0}
                              </Title>
                              <Text>Bài học</Text>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <Title level={3}>
                                {course.feedBacks?.length || 0}
                              </Title>
                              <Text>Đánh giá</Text>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                              <Title level={3}>
                                {course.qnAs?.length || 0}
                              </Title>
                              <Text>Câu hỏi</Text>
                            </div>
                          </div>
                        </Card>
                      </div>

                      <div className="md:col-span-1">
                        <Card
                          title={
                            <div className="flex justify-between items-center">
                              <span>Ảnh khóa học</span>
                              <Button
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() =>
                                  window.open(course.imageUrl, "_blank")
                                }
                              >
                                Xem
                              </Button>
                            </div>
                          }
                          bordered={false}
                          className="shadow-sm"
                        >
                          <Image
                            width="100%"
                            src={course.imageUrl}
                            alt={course.courseName}
                            fallback="https://placehold.co/600x400?text=No+Image"
                          />
                        </Card>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="Nội dung khóa học" key="2">
                    <CourseContent courseId={courseId} />
                  </TabPane>

                  <TabPane tab="Đánh giá" key="3">
                    <Card bordered={false} className="shadow-sm">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <Title level={4} className="mb-0">
                            Tổng quan đánh giá
                          </Title>
                          <div className="flex items-center gap-2">
                            <Rate
                              disabled
                              defaultValue={course.rating}
                              allowHalf
                            />
                            <Text strong>{course.rating}/5</Text>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count =
                              course.feedBacks?.filter(
                                (f) => Math.floor(f.rating) === star
                              ).length || 0;
                            const percentage = course.feedBacks?.length
                              ? (count / course.feedBacks.length) * 100
                              : 0;
                            return (
                              <div
                                key={star}
                                className="flex items-center gap-4"
                              >
                                <div className="w-20 text-right">
                                  <Text>{star} sao</Text>
                                </div>
                                <Progress
                                  percent={percentage}
                                  strokeColor="#1890ff"
                                  size="small"
                                  format={(percent) => `${count} đánh giá`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-6">
                        {course.feedBacks && course.feedBacks.length > 0 ? (
                          course.feedBacks.map((feedback) => (
                            <div
                              key={feedback.feedbackId}
                              className="border-b last:border-b-0 pb-6 last:pb-0"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Text strong>{feedback.email}</Text>
                                  <Text
                                    type="secondary"
                                    className="block text-sm"
                                  >
                                    {feedback.role}
                                  </Text>
                                </div>
                                <Space align="start">
                                  <Rate
                                    disabled
                                    defaultValue={feedback.rating}
                                  />
                                  <Text type="secondary" className="text-sm">
                                    {new Date(
                                      feedback.createdAt
                                    ).toLocaleDateString()}
                                  </Text>
                                </Space>
                              </div>
                              <Paragraph>{feedback.feedbackContent}</Paragraph>
                            </div>
                          ))
                        ) : (
                          <Empty description="Chưa có đánh giá nào" />
                        )}
                      </div>
                    </Card>
                  </TabPane>

                  <TabPane tab="Hỏi đáp" key="4">
                    <Card bordered={false} className="shadow-sm">
                      <div className="space-y-8">
                        {course.qnAs && course.qnAs.length > 0 ? (
                          course.qnAs.map((qna) => (
                            <div
                              key={qna.questionId}
                              className="border-b last:border-b-0 pb-8 last:pb-0"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <Text strong>{qna.email}</Text>
                                  <Text
                                    type="secondary"
                                    className="block text-sm"
                                  >
                                    {qna.role}
                                  </Text>
                                </div>
                                <Text type="secondary" className="text-sm">
                                  {new Date(qna.createdAt).toLocaleDateString()}
                                </Text>
                              </div>
                              <Title level={5} className="mb-2">
                                {qna.title}
                              </Title>
                              <Paragraph>{qna.questionContent}</Paragraph>

                              {qna.replies && qna.replies.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  <Text strong>Trả lời:</Text>
                                  {qna.replies.map((reply, index) => (
                                    <div
                                      key={index}
                                      className="bg-gray-50 p-4 rounded-lg"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <Text strong className="text-sm">
                                          {reply.email}
                                        </Text>
                                        <Text
                                          type="secondary"
                                          className="text-sm"
                                        >
                                          {new Date(
                                            reply.createdAt
                                          ).toLocaleDateString()}
                                        </Text>
                                      </div>
                                      <Paragraph className="mb-0">
                                        {reply.replyContent}
                                      </Paragraph>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <Empty description="Chưa có câu hỏi nào" />
                        )}
                      </div>
                    </Card>
                  </TabPane>
                </Tabs>
              </Card>
            </div>
            <div className="w-full md:w-1/3">
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
            onCancel={() => {
              setModalVisible(false);
              setPreviewImage("");
              setUploadFile(null);
              setUploadProgress(0);
              setUploadStatus("");
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setModalVisible(false);
                  setPreviewImage("");
                  setUploadFile(null);
                  setUploadProgress(0);
                  setUploadStatus("");
                }}
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
                  name="courseTypeId"
                  label={
                    <Space>
                      <TagOutlined /> Loại nhạc cụ
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn loại nhạc cụ" },
                  ]}
                >
                  <Select
                    placeholder="Chọn loại nhạc cụ"
                    onChange={handleInstrumentTypeChange}
                    loading={instrumentTypes.length === 0}
                    showSearch
                    optionFilterProp="children"
                  >
                    {instrumentTypes.map((type) => (
                      <Option key={type.courseTypeId} value={type.courseTypeId}>
                        {type.courseTypeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái" },
                  ]}
                >
                  <Select>
                    <Option value={0}>Đang xử lý</Option>
                    <Option value={1}>Đang mở bán</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="imageUrl"
                  label={
                    <Space>
                      <PictureOutlined /> URL Hình ảnh
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng tải lên hình ảnh" },
                  ]}
                  hidden={true}
                >
                  <Input disabled />
                </Form.Item>
              </div>

              <div className="mb-4 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <PictureOutlined className="mr-2 text-blue-600" />
                  <Text strong>Tải ảnh lên</Text>
                </div>

                <div className="mb-3">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="block w-full text-sm border border-gray-300 rounded-md p-2 hover:border-blue-500 transition-colors"
                  />
                </div>

                {uploadFile && !isUploading && (
                  <Button
                    type="primary"
                    onClick={handleUploadImage}
                    icon={<UploadOutlined />}
                    block
                    className="rounded-md"
                  >
                    Tải ảnh lên
                  </Button>
                )}

                {isUploading && (
                  <div className="mt-2">
                    <Progress
                      percent={uploadProgress}
                      size="small"
                      status="active"
                      strokeColor="#1890ff"
                    />
                    <Text type="secondary" className="block mt-1 text-center">
                      {uploadStatus}
                    </Text>
                  </div>
                )}

                {uploadStatus === "Tải ảnh thành công!" && !isUploading && (
                  <div className="mt-2">
                    <Text type="success">Ảnh đã được tải lên thành công!</Text>
                  </div>
                )}
              </div>

              <div className="mt-4">
                {(previewImage || form.getFieldValue("imageUrl")) && (
                  <div className="text-center">
                    <img
                      src={previewImage || form.getFieldValue("imageUrl")}
                      alt="Preview"
                      className="max-w-full h-auto border rounded-lg shadow-sm"
                      style={{ maxHeight: "200px" }}
                    />
                    <Text type="secondary" className="block mt-2">
                      Xem trước ảnh khóa học
                    </Text>
                  </div>
                )}
              </div>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourseDetail;
