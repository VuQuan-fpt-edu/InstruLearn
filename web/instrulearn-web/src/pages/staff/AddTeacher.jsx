import React, { useState, useEffect } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  Typography,
  message,
  Space,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const AddTeacher = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("teacher-management");
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Major/get-all"
      );
      const data = await response.json();
      if (data.isSucceed && data.data) {
        setMajors(data.data);
      } else {
        message.error("Không thể tải danh sách nhạc cụ");
      }
    } catch (error) {
      console.error("Error fetching majors:", error);
      message.error("Không thể tải danh sách nhạc cụ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const requestData = {
        majorIds: values.majorIds,
        email: values.email,
        username: values.username,
        fullname: values.fullname,
        password: values.password,
        phoneNumber: values.phoneNumber,
        dateOfEmployment: values.dateOfEmployment.format("YYYY-MM-DD"),
      };

      const response = await fetch(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Teacher/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Thêm giáo viên thành công");
        navigate("/staff/teacher-management");
      } else {
        message.error(data.message || "Không thể thêm giáo viên");
      }
    } catch (error) {
      console.error("Error creating teacher:", error);
      message.error("Có lỗi xảy ra khi thêm giáo viên");
    } finally {
      setSubmitting(false);
    }
  };

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
          <Card className="shadow-md">
            <div className="flex justify-between items-center mb-6">
              <Title level={2}>Thêm giáo viên mới</Title>
              <Button onClick={() => navigate("/staff/teacher-management")}>
                Quay lại
              </Button>
            </div>

            <Spin spinning={loading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="max-w-2xl mx-auto"
              >
                <Form.Item
                  name="fullname"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Item>

                <Form.Item
                  name="dateOfEmployment"
                  label="Ngày bắt đầu làm việc"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  ]}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                  name="majorIds"
                  label="Nhạc cụ"
                  rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn nhạc cụ"
                    prefix={<BookOutlined />}
                  >
                    {majors.map((major) => (
                      <Option key={major.majorId} value={major.majorId}>
                        {major.majorName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Space className="flex justify-end">
                    <Button
                      onClick={() => navigate("/staff/teacher-management")}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                    >
                      Thêm giáo viên
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddTeacher;
