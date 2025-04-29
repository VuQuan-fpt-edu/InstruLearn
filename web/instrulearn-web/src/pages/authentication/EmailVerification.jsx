import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Modal,
  Result,
  Space,
  Progress,
} from "antd";
import {
  MailOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

export default function EmailVerification() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30); // Bắt đầu với 30s để người dùng phải đợi trước khi gửi lại
  const [email, setEmail] = useState("");
  const [timeoutModalVisible, setTimeoutModalVisible] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(120); // 2 phút cho xác minh email

  useEffect(() => {
    // Lấy email từ state của location (được truyền từ trang Register)
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  useEffect(() => {
    // Đếm ngược thời gian cho phép gửi lại mã
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [countdown]);

  useEffect(() => {
    // Đếm ngược thời gian xác minh email
    if (verificationCountdown > 0) {
      const timer = setTimeout(
        () => setVerificationCountdown(verificationCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else {
      setTimeoutModalVisible(true);
    }
  }, [verificationCountdown]);

  const handleVerify = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/verify-email",
        {
          token: values.verificationCode,
          email: email,
        }
      );

      if (response.data?.isSucceed) {
        setSuccessModalVisible(true);
        form.resetFields();

        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        throw new Error(response.data?.message || "Xác minh không thành công");
      }
    } catch (error) {
      message.error({
        content: `Xác minh thất bại: ${
          error.response?.data?.message || "Mã xác minh không hợp lệ"
        }`,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) {
      message.warning(`Vui lòng đợi ${countdown}s trước khi gửi lại mã`);
      return;
    }

    try {
      setResendLoading(true);
      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Auth/resend-verification",
        {
          email: email,
        }
      );

      if (response.data?.isSucceed) {
        message.success("Mã xác minh mới đã được gửi đến email của bạn");
        setCountdown(30); // Reset về 30s sau khi gửi thành công
      } else {
        throw new Error(
          response.data?.message || "Gửi lại mã không thành công"
        );
      }
    } catch (error) {
      message.error({
        content: `Gửi lại mã thất bại: ${
          error.response?.data?.message || "Vui lòng thử lại sau"
        }`,
        duration: 5,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden">
      <div className="w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <Title level={1} className="text-3xl font-bold mb-3">
              Xác minh email
            </Title>
            <Text type="secondary" className="text-base">
              Vui lòng nhập mã xác minh đã được gửi đến email của bạn
            </Text>
          </div>

          <div className="mb-4">
            <Progress
              percent={(verificationCountdown / 120) * 100}
              status={verificationCountdown < 30 ? "exception" : "active"}
              showInfo={false}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />
            <div className="text-center mt-2">
              <Text type={verificationCountdown < 30 ? "danger" : "secondary"}>
                Thời gian còn lại: {Math.floor(verificationCountdown / 60)}:
                {(verificationCountdown % 60).toString().padStart(2, "0")}
              </Text>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <MailOutlined className="text-blue-500 text-lg mt-1 mr-3" />
              <div>
                <Text strong className="block mb-1">
                  Email xác minh đã được gửi
                </Text>
                <Text className="text-gray-600">
                  Chúng tôi đã gửi mã xác minh đến{" "}
                  <span className="font-medium">{email}</span>. Vui lòng kiểm
                  tra hộp thư đến của bạn.
                </Text>
              </div>
            </div>
          </div>

          <Form
            form={form}
            name="verification_form"
            onFinish={handleVerify}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="verificationCode"
              label="Mã xác minh"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mã xác minh",
                },
                {
                  len: 6,
                  message: "Mã xác minh phải có 6 ký tự",
                },
              ]}
              className="mb-4"
            >
              <Input
                maxLength={6}
                placeholder="Nhập mã 6 chữ số"
                className="rounded-lg py-2 px-4 h-12 text-center text-2xl tracking-widest"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-10 rounded-lg font-medium text-base bg-gradient-to-r from-purple-700 to-purple-900 border-none"
              >
                Xác minh
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Paragraph className="text-gray-500 mb-4">
              Không nhận được mã? Kiểm tra thư mục spam hoặc
            </Paragraph>
            <Button
              type="link"
              onClick={handleResendCode}
              disabled={countdown > 0}
              loading={resendLoading}
              icon={<ReloadOutlined />}
              className={`${
                countdown > 0 ? "text-gray-400" : "text-purple-700"
              }`}
            >
              Gửi lại mã{countdown > 0 ? ` (${countdown}s)` : ""}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-radial-light"></div>

        <div className="text-center z-10 max-w-lg">
          <div className="w-32 h-32 mx-auto mb-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg">
            <MailOutlined className="text-6xl text-white" />
          </div>

          <Title level={2} className="text-white font-semibold mb-5">
            Xác minh email của bạn
          </Title>

          <Paragraph className="text-white text-opacity-85 text-base mb-8 leading-relaxed">
            Xác minh email giúp bảo vệ tài khoản của bạn và cho phép chúng tôi
            gửi thông báo quan trọng về khóa học của bạn.
          </Paragraph>

          <div className="bg-white bg-opacity-10 rounded-xl p-5">
            <Space direction="vertical" className="w-full">
              <div className="flex items-center text-white mb-3">
                <CheckCircleOutlined className="mr-3" />
                <Text className="text-white">Bảo mật tài khoản</Text>
              </div>
              <div className="flex items-center text-white mb-3">
                <CheckCircleOutlined className="mr-3" />
                <Text className="text-white">Nhận thông báo khóa học</Text>
              </div>
              <div className="flex items-center text-white">
                <CheckCircleOutlined className="mr-3" />
                <Text className="text-white">Khôi phục tài khoản dễ dàng</Text>
              </div>
            </Space>
          </div>
        </div>
      </div>

      <Modal
        open={successModalVisible}
        footer={null}
        closable={false}
        centered
        width={400}
        className="rounded-xl"
      >
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-5xl text-green-500" />}
          title={
            <div className="text-xl font-semibold text-gray-800">
              Xác minh email thành công!
            </div>
          }
          subTitle={
            <div className="text-gray-600">
              <p className="mb-2">
                Email của bạn đã được xác minh. Bây giờ bạn có thể đăng nhập vào
                tài khoản của mình.
              </p>
              <p>
                Bạn sẽ được chuyển hướng đến trang đăng nhập sau vài giây...
              </p>
            </div>
          }
          extra={[
            <Button
              key="login"
              type="primary"
              onClick={() => navigate("/login")}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Đăng nhập ngay
            </Button>,
          ]}
        />
      </Modal>

      <Modal
        open={timeoutModalVisible}
        footer={null}
        closable={false}
        centered
        width={400}
        className="rounded-xl"
      >
        <Result
          status="error"
          title="Đã hết thời gian xác minh"
          subTitle={
            <div className="text-gray-600">
              <p className="mb-2">
                Tài khoản của bạn đã bị xóa do không xác minh email trong thời
                gian quy định.
              </p>
              <p>Vui lòng đăng ký lại tài khoản mới.</p>
            </div>
          }
          extra={[
            <Button
              key="register"
              type="primary"
              onClick={() => navigate("/register")}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Đăng ký lại
            </Button>,
          ]}
        />
      </Modal>
    </div>
  );
}
