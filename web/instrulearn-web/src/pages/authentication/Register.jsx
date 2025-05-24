import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Select,
  message,
  Modal,
  Result,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { register } from "../../api/auth";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Learner/get-all"
      );

      if (response.data?.isSucceed) {
        const emailExists = response.data.data.some(
          (learner) => learner.email === email
        );
        return emailExists;
      }
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      const userData = {
        username: values.username,
        password: values.password,
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phone,
      };

      const response = await register(userData);

      if (response?.isSucceed) {
        message.success("Đăng ký thành công! Vui lòng xác minh email của bạn.");
        form.resetFields();

        navigate("/email-verification", {
          state: {
            email: values.email,
          },
        });
      } else {
        throw new Error(response?.message || "Đăng ký không thành công");
      }
    } catch (error) {
      console.log("Error response:", error.response);

      // Xử lý lỗi từ API
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message;

        // Kiểm tra lỗi email đã tồn tại
        if (errorMessage.toLowerCase().includes("email")) {
          form.setFields([
            {
              name: "email",
              errors: ["Email này đã được sử dụng"],
            },
          ]);
        }

        // Kiểm tra lỗi username đã tồn tại
        if (errorMessage.toLowerCase().includes("người dùng")) {
          form.setFields([
            {
              name: "username",
              errors: ["Tên đăng nhập này đã được sử dụng"],
            },
          ]);
        }

        // Hiển thị thông báo lỗi chung
        message.error({
          content: errorMessage,
          duration: 5,
        });
      } else {
        // Xử lý các lỗi khác
        message.error({
          content: "Đăng ký thất bại: Không thể kết nối với máy chủ",
          duration: 5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left: Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-white shadow-lg z-10">
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <div className="mb-8 text-center">
            <Title
              level={1}
              className="text-3xl md:text-4xl font-bold mb-2 text-purple-800"
            >
              Đăng ký tài khoản
            </Title>
            <Text type="secondary" className="text-base">
              Điền thông tin để bắt đầu hành trình âm nhạc của bạn
            </Text>
          </div>
          <Form
            form={form}
            name="register_form"
            initialValues={{ remember: true }}
            onFinish={handleRegister}
            layout="vertical"
            size="large"
            validateTrigger="onBlur"
            className="space-y-2"
          >
            <Form.Item
              name="username"
              label={<span className="font-semibold">Tên đăng nhập</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập của bạn",
                },
                { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
              ]}
              className="mb-3"
            >
              <Input
                prefix={<UserOutlined className="text-purple-400" />}
                placeholder="Nhập tên đăng nhập của bạn"
                className="rounded-xl py-2 px-4 h-11 border border-purple-200 focus:border-purple-500"
              />
            </Form.Item>
            <Form.Item
              name="fullName"
              label={<span className="font-semibold">Họ và tên</span>}
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên của bạn" },
              ]}
              className="mb-3"
            >
              <Input
                prefix={<UserAddOutlined className="text-purple-400" />}
                placeholder="Nhập họ và tên đầy đủ của bạn"
                className="rounded-xl py-2 px-4 h-11 border border-purple-200 focus:border-purple-500"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={<span className="font-semibold">Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
              className="mb-3"
              validateTrigger="onBlur"
            >
              <Input
                prefix={<MailOutlined className="text-purple-400" />}
                placeholder="Nhập email của bạn"
                className="rounded-xl py-2 px-4 h-11 border border-purple-200 focus:border-purple-500"
              />
            </Form.Item>
            <Form.Item
              name="phone"
              label={<span className="font-semibold">Số điện thoại</span>}
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^0\d{9}$/,
                  message:
                    "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số!",
                },
              ]}
              className="mb-3"
            >
              <Input
                prefix={<PhoneOutlined className="text-purple-400" />}
                placeholder="Nhập số điện thoại của bạn"
                className="rounded-xl py-2 px-4 h-11 border border-purple-200 focus:border-purple-500"
                maxLength={10}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className="font-semibold">Mật khẩu</span>}
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              ]}
              className="mb-3"
            >
              <Input.Password
                prefix={<LockOutlined className="text-purple-400" />}
                placeholder="Nhập mật khẩu của bạn"
                className="rounded-xl py-2 px-4 h-11 border border-purple-200 focus:border-purple-500"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={<span className="font-semibold">Xác nhận mật khẩu</span>}
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
              className="mb-3"
            >
              <Input.Password
                prefix={<LockOutlined className="text-purple-400" />}
                placeholder="Xác nhận mật khẩu của bạn"
                className="rounded-xl py-2 px-4 h-11 border border-purple-200 focus:border-purple-500"
              />
            </Form.Item>
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Bạn phải đồng ý với điều khoản dịch vụ")
                        ),
                },
              ]}
              className="mb-3"
            >
              <Checkbox>
                Tôi đồng ý với{" "}
                <Link
                  to="/terms"
                  className="text-purple-700 font-semibold underline"
                >
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link
                  to="/privacy"
                  className="text-purple-700 font-semibold underline"
                >
                  Chính sách bảo mật
                </Link>
              </Checkbox>
            </Form.Item>
            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-700 to-indigo-700 border-none shadow-md hover:from-purple-800 hover:to-indigo-800 transition-all"
                style={{ fontSize: 18 }}
              >
                Đăng ký
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </Form.Item>
            <Form.Item className="mb-2 text-center">
              <Text>
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-purple-700 font-semibold underline"
                >
                  Đăng nhập ngay
                </Link>
              </Text>
            </Form.Item>
          </Form>
        </div>
      </div>
      {/* Right: Banner/Info */}
      <div className="flex-1 bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[600px]">
        <div className="absolute inset-0 opacity-10 bg-radial-light"></div>
        <div className="absolute top-1/12 right-1/12 w-20 h-32 rounded-3xl bg-white bg-opacity-10 transform -rotate-12"></div>
        <div className="absolute bottom-1/6 left-1/12 w-32 h-32 rounded-full bg-white bg-opacity-10 transform rotate-12"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-10 rounded-xl bg-white bg-opacity-10 transform -rotate-3"></div>
        <div className="text-center z-10 max-w-lg">
          <div className="w-32 h-32 mx-auto mb-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg">
            <PlayCircleOutlined className="text-6xl text-white" />
          </div>
          <Title level={2} className="text-white font-semibold mb-5">
            Bắt đầu hành trình âm nhạc của bạn
          </Title>
          <Paragraph className="text-white text-opacity-85 text-base mb-8 leading-relaxed">
            Đăng ký tài khoản InstruLearn để mở khóa hơn 10,000 bài học chất
            lượng cao, nhận phản hồi thời gian thực và kết nối với cộng đồng
            người học toàn cầu.
          </Paragraph>
          <div className="text-left mb-8">
            <div className="flex items-start mb-3">
              <VideoCameraOutlined className="text-xl text-white mr-4 mt-1" />
              <div>
                <Text strong className="text-white text-base block mb-1">
                  Học mọi lúc, mọi nơi
                </Text>
                <Text className="text-white text-opacity-75 text-sm">
                  Truy cập từ máy tính, điện thoại hoặc máy tính bảng
                </Text>
              </div>
            </div>
            <div className="flex items-start mb-3">
              <CustomerServiceOutlined className="text-xl text-white mr-4 mt-1" />
              <div>
                <Text strong className="text-white text-base block mb-1">
                  Hỗ trợ 1-1 với giáo viên
                </Text>
                <Text className="text-white text-opacity-75 text-sm">
                  Đặt lịch học trực tuyến với các giáo viên chuyên nghiệp
                </Text>
              </div>
            </div>
            <div className="flex items-start">
              <TrophyOutlined className="text-xl text-white mr-4 mt-1" />
              <div>
                <Text strong className="text-white text-base block mb-1">
                  Thử thách và phần thưởng
                </Text>
                <Text className="text-white text-opacity-75 text-sm">
                  Nhận huy hiệu khi hoàn thành các thử thách học tập
                </Text>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-5 relative">
            <div className="absolute -top-3 left-6 text-4xl text-white text-opacity-30 font-serif leading-none">
              "
            </div>
            <Paragraph className="text-white text-sm italic mb-2">
              InstruLearn giúp tôi thực hiện được ước mơ chơi piano từ nhỏ. Giao
              diện dễ sử dụng và cách giảng dạy rõ ràng là điểm mạnh của nền
              tảng này.
            </Paragraph>
            <Text className="text-white text-opacity-70 text-sm">
              Hoàng Linh - Học viên piano
            </Text>
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
              Đăng ký thành công!
            </div>
          }
          subTitle={
            <div className="text-gray-600">
              <p className="mb-2">
                Chào mừng bạn đến với InstruLearn! Tài khoản của bạn đã được tạo
                thành công.
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
    </div>
  );
}
