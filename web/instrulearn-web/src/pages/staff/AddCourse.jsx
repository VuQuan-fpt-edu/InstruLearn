import React, { useState, useEffect } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  Select,
  message,
  Card,
  Row,
  Col,
  InputNumber,
  Divider,
  Typography,
  Progress,
} from "antd";
import {
  PlusOutlined,
  FileImageOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

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

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

const AddCourse = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("add-course");
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [form] = Form.useForm();

  // Firebase upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    fetchInstrumentTypes();
  }, []);

  const fetchInstrumentTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/get-all"
      );
      if (response.data.isSucceed) {
        setInstrumentTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching instrument types:", error);
      message.error("Không thể tải danh sách loại nhạc cụ");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Ensure all numeric values are actually numbers
      const payload = {
        ...values,
        rating: Number(values.rating),
        price: Number(values.price),
        discount: Number(values.discount),
        typeId: Number(values.typeId),
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/create",
        payload
      );

      if (response.data.isSucceed) {
        message.success("Khóa học đã được thêm thành công!");
        form.resetFields();
        setPreviewImage("");
        setUploadFile(null);
        setUploadProgress(0);
        setUploadStatus("");
      } else {
        message.error(
          `Thêm khóa học thất bại: ${
            response.data.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (error) {
      console.error("Error creating course:", error);
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi thêm khóa học.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
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
          // Set the imageUrl field with the Firebase URL
          form.setFieldsValue({ imageUrl: downloadURL });
          setUploadStatus("Tải ảnh thành công!");
          setIsUploading(false);
          message.success("Tải ảnh lên thành công");
        });
      }
    );
  };

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
          <Card className="shadow-md">
            <Title level={2} className="text-center mb-6">
              Thêm Khóa Học Mới
            </Title>
            <Divider />

            <Form
              layout="vertical"
              form={form}
              onFinish={handleSubmit}
              initialValues={{
                rating: 5,
                discount: 0,
              }}
            >
              <Row gutter={24}>
                <Col xs={24} lg={16}>
                  <Title level={4}>Thông tin cơ bản</Title>

                  <Form.Item
                    name="courseName"
                    label="Tên khóa học"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên khóa học!",
                      },
                      {
                        max: 100,
                        message: "Tên khóa học không quá 100 ký tự!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập tên khóa học" />
                  </Form.Item>

                  <Form.Item
                    name="headline"
                    label="Tiêu đề ngắn gọn"
                    rules={[
                      { max: 120, message: "Tiêu đề không quá 120 ký tự!" },
                    ]}
                  >
                    <Input placeholder="Mô tả ngắn gọn về khóa học" />
                  </Form.Item>

                  <Form.Item
                    name="courseDescription"
                    label="Mô tả chi tiết"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mô tả khóa học!",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={6}
                      placeholder="Mô tả chi tiết về nội dung và lợi ích của khóa học"
                    />
                  </Form.Item>

                  <Form.Item
                    name="typeId"
                    label="Loại nhạc cụ"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại nhạc cụ!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn loại nhạc cụ">
                      {instrumentTypes.map((instrument) => (
                        <Option
                          key={instrument.typeId}
                          value={instrument.typeId}
                        >
                          {instrument.typeName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={8}>
                  <Title level={4}>Thông tin bổ sung</Title>

                  <Form.Item
                    name="price"
                    label="Giá khóa học (VND)"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá khóa học!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      step={10000}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="VD: 1,000,000"
                    />
                  </Form.Item>

                  <Form.Item name="discount" label="Giảm giá (%)">
                    <InputNumber style={{ width: "100%" }} min={0} max={100} />
                  </Form.Item>

                  <Form.Item name="rating" label="Đánh giá ban đầu (0-5)">
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </Form.Item>

                  <Form.Item
                    name="imageUrl"
                    label="URL Hình ảnh"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng tải lên hình ảnh!",
                      },
                    ]}
                    hidden={true}
                  >
                    <Input disabled />
                  </Form.Item>

                  {/* Image upload section */}
                  <div className="mb-4 border rounded-md p-4">
                    <Text strong>Tải ảnh lên</Text>

                    <div className="mt-3 mb-3">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="block w-full text-sm border border-gray-300 rounded p-2"
                      />
                    </div>

                    {uploadFile && !isUploading && (
                      <div className="mt-2 mb-2">
                        <Button
                          type="primary"
                          onClick={handleUploadImage}
                          icon={<UploadOutlined />}
                          block
                        >
                          Tải ảnh lên
                        </Button>
                      </div>
                    )}

                    {isUploading && (
                      <div className="mt-2">
                        <Progress
                          percent={uploadProgress}
                          size="small"
                          status="active"
                        />
                        <Text
                          type="secondary"
                          className="block mt-1 text-center"
                        >
                          {uploadStatus}
                        </Text>
                      </div>
                    )}

                    {uploadStatus === "Tải ảnh thành công!" && !isUploading && (
                      <div className="mt-2">
                        <Text type="success">
                          Ảnh đã được tải lên thành công!
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 mb-4">
                    {previewImage ? (
                      <div className="text-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="max-w-full h-auto border rounded-md"
                          style={{ maxHeight: "200px" }}
                        />
                        <Text type="secondary" className="block mt-2">
                          Xem trước ảnh khóa học
                        </Text>
                      </div>
                    ) : (
                      <div
                        className="border rounded-md flex items-center justify-center"
                        style={{ height: "200px" }}
                      >
                        <div className="text-center text-gray-400">
                          <FileImageOutlined style={{ fontSize: "32px" }} />
                          <p>Chưa có ảnh xem trước</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <Divider />

              <div className="flex justify-center mt-4">
                <Button
                  type="default"
                  className="mr-4"
                  onClick={() => {
                    form.resetFields();
                    setPreviewImage("");
                    setUploadFile(null);
                    setUploadProgress(0);
                    setUploadStatus("");
                  }}
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<PlusOutlined />}
                  disabled={!form.getFieldValue("imageUrl")}
                >
                  Thêm khóa học
                </Button>
              </div>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddCourse;
