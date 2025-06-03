import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Steps,
  Result,
  Card,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendCode = async (values) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/forgot-password",
        { email: values.email }
      );
      setEmail(values.email);
      message.success("Mã xác nhận đã được gửi đến email của bạn!");
      setCurrentStep(1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Không thể gửi mã xác nhận. Vui lòng thử lại sau!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/reset-password",
        {
          token: values.verificationCode,
          email: email,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }
      );
      setSuccess(true);
      message.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Nhập Email",
      content: (
        <Form
          name="forgotPassword"
          onFinish={handleSendCode}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Gửi mã xác nhận
            </Button>
          </Form.Item>

          {errorMessage && currentStep === 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text type="danger" className="flex items-center">
                <span className="mr-2">⚠️</span>
                {errorMessage}
              </Text>
            </div>
          )}
        </Form>
      ),
    },
    {
      title: "Đặt lại mật khẩu",
      content: (
        <Form
          name="resetPassword"
          onFinish={handleResetPassword}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="verificationCode"
            label="Mã xác nhận"
            rules={[{ required: true, message: "Vui lòng nhập mã xác nhận!" }]}
          >
            <Input
              prefix={<SafetyCertificateOutlined />}
              placeholder="Nhập mã xác nhận"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>

          {errorMessage && currentStep === 1 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text type="danger" className="flex items-center">
                <span className="mr-2">⚠️</span>
                {errorMessage}
              </Text>
            </div>
          )}
        </Form>
      ),
    },
  ];

  if (success) {
    return (
      <Result
        status="success"
        title="Đặt lại mật khẩu thành công!"
        subTitle="Bạn sẽ được chuyển hướng đến trang đăng nhập..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Title level={2} className="text-center">
          Quên mật khẩu
        </Title>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Steps current={currentStep} items={steps} className="mb-8" />
          <div>{steps[currentStep].content}</div>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>
        </Card>
      </div>

      <Row justify="center" className="mt-8">
        <Col>
          <Text type="secondary">
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Đăng ký ngay
            </Link>
          </Text>
        </Col>
      </Row>
    </div>
  );
}
