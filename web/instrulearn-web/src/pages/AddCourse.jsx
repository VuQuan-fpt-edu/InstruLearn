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
  Upload,
  Divider,
  Typography,
} from "antd";
import { PlusOutlined, FileImageOutlined } from "@ant-design/icons";
import axios from "axios";
import SSidebar from "../components/StaffSidebar";
import SHeader from "../components/StaffHeader";

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
      const response = await axios.post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/create",
        values
      );
      message.success("Khóa học đã được thêm thành công!");
      form.resetFields();
      setPreviewImage("");
    } catch (error) {
      console.error("Error creating course:", error);
      message.error("Có lỗi xảy ra khi thêm khóa học.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info) => {
    if (info.file.status === "done") {
      setPreviewImage(info.file.response.url);
      form.setFieldsValue({ imageUrl: info.file.response.url });
    }
  };

  const handleUrlChange = (e) => {
    setPreviewImage(e.target.value);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
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
                        message: "Vui lòng nhập URL hình ảnh!",
                      },
                      {
                        type: "url",
                        message: "Vui lòng nhập đúng định dạng URL!",
                      },
                    ]}
                  >
                    <Input
                      onChange={handleUrlChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </Form.Item>

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
                  onClick={() => form.resetFields()}
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<PlusOutlined />}
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
