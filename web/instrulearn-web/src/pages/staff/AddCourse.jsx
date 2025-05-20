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
  BookOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  StarOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  useEffect(() => {
    fetchInstrumentTypes();
  }, []);

  const fetchInstrumentTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/CourseType/get-all"
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
    try {
      setLoading(true);
      const formData = {
        courseTypeId: values.typeId,
        courseName: values.courseName,
        courseDescription: values.courseDescription,
        headline: values.headline,
        rating: 0,
        price: values.price,
        discount: values.discount,
        imageUrl: values.imageUrl,
        status: 0, // Mặc định status là 0
      };

      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Course/create",
        formData
      );

      if (response.data.isSucceed) {
        message.success("Thêm khóa học thành công!");
        navigate("/staff/course-management");
      } else {
        throw new Error(response.data.message || "Không thể thêm khóa học!");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      message.error(error.message || "Không thể thêm khóa học!");
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
    <Layout className="min-h-screen bg-gray-50">
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
          className="p-6"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-6 text-white">
                <Title level={2} className="text-center mb-0">
                  Thêm Khóa Học Mới
                </Title>
                <p className="text-center text-blue-100 mt-2">
                  Điền thông tin chi tiết về khóa học
                </p>
              </div>

              <div className="p-6">
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleSubmit}
                  initialValues={{
                    rating: 0,
                    discount: 0,
                    price: 100000,
                  }}
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <Card
                        title={
                          <span className="flex items-center">
                            <BookOutlined className="mr-2 text-blue-600" />
                            Thông tin cơ bản
                          </span>
                        }
                        className="shadow-sm"
                      >
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
                          <Select
                            placeholder="Chọn loại nhạc cụ"
                            className="rounded-md"
                          >
                            {instrumentTypes.map((instrument) => (
                              <Option
                                key={instrument.courseTypeId}
                                value={instrument.courseTypeId}
                              >
                                {instrument.courseTypeName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="courseName"
                          label="Tên khóa học"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên khóa học!",
                            },
                            {
                              max: 50,
                              message: "Tên khóa học không quá 50 ký tự!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập tên khóa học"
                            className="rounded-md"
                            maxLength={50}
                            showCount={{ max: 50 }}
                          />
                        </Form.Item>

                        <Form.Item
                          name="headline"
                          label="Tiêu đề"
                          rules={[
                            {
                              max: 50,
                              message: "Tiêu đề không quá 50 ký tự!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Mô tả ngắn gọn về khóa học"
                            className="rounded-md"
                            maxLength={50}
                            showCount={{ max: 50 }}
                          />
                        </Form.Item>

                        <Form.Item
                          name="courseDescription"
                          label="Mô tả chi tiết"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mô tả khóa học!",
                            },
                            {
                              max: 250,
                              message: "Mô tả chi tiết không quá 250 ký tự!",
                            },
                          ]}
                        >
                          <Input.TextArea
                            rows={6}
                            placeholder="Mô tả chi tiết về nội dung và lợi ích của khóa học"
                            className="rounded-md"
                            maxLength={250}
                            showCount={{ max: 250 }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Card
                        title={
                          <span className="flex items-center">
                            <InfoCircleOutlined className="mr-2 text-blue-600" />
                            Thông tin bổ sung
                          </span>
                        }
                        className="shadow-sm"
                      >
                        <Form.Item
                          name="price"
                          label={
                            <span className="flex items-center">
                              <DollarOutlined className="mr-2" />
                              Giá khóa học (VND)
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập giá khóa học!",
                            },
                            {
                              type: "number",
                              min: 100000,
                              max: 10000000,
                              message:
                                "Giá khóa học phải từ 100.000 đến 10.000.000 VND!",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            min={100000}
                            max={10000000}
                            step={10000}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            placeholder="VD: 1,000,000"
                            className="rounded-md"
                          />
                        </Form.Item>

                        <Form.Item name="discount" label="Giảm giá (%)">
                          <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            max={100}
                            className="rounded-md"
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
                              <Text
                                type="secondary"
                                className="block mt-1 text-center"
                              >
                                {uploadStatus}
                              </Text>
                            </div>
                          )}

                          {uploadStatus === "Tải ảnh thành công!" &&
                            !isUploading && (
                              <div className="mt-2">
                                <Text type="success">
                                  Ảnh đã được tải lên thành công!
                                </Text>
                              </div>
                            )}
                        </div>

                        <div className="mt-4">
                          {previewImage ? (
                            <div className="text-center">
                              <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-full h-auto border rounded-lg shadow-sm"
                                style={{ maxHeight: "200px" }}
                              />
                              <Text type="secondary" className="block mt-2">
                                Xem trước ảnh khóa học
                              </Text>
                            </div>
                          ) : (
                            <div
                              className="border rounded-lg flex items-center justify-center bg-gray-50"
                              style={{ height: "200px" }}
                            >
                              <div className="text-center text-gray-400">
                                <FileImageOutlined
                                  style={{ fontSize: "32px" }}
                                />
                                <p>Chưa có ảnh xem trước</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  <div className="flex justify-center mt-6">
                    <Button
                      type="default"
                      className="mr-4 rounded-md"
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
                      className="rounded-md"
                    >
                      Thêm khóa học
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddCourse;
