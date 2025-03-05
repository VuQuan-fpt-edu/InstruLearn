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
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { register } from "../../api/auth";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

      message.success("Đăng ký tài khoản thành công!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      if (error.response) {
        message.error(
          `Đăng ký thất bại: ${
            error.response.data.message ||
            "Vui lòng kiểm tra thông tin và thử lại"
          }`
        );
      } else {
        message.error("Đăng ký thất bại: Không thể kết nối với máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden">
      <div className="w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <div className="flex items-center mb-8"></div>

            <Title level={1} className="text-3xl font-bold mb-3">
              Tạo tài khoản mới
            </Title>
            <Text type="secondary" className="text-base">
              Điền thông tin dưới đây để bắt đầu hành trình âm nhạc của bạn
            </Text>
          </div>

          <Form
            form={form}
            name="register_form"
            initialValues={{ remember: true }}
            onFinish={handleRegister}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập của bạn",
                },
              ]}
              className="mb-4"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Nhập tên đăng nhập của bạn"
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ và tên của bạn",
                },
              ]}
              className="mb-4"
            >
              <Input
                prefix={<UserAddOutlined className="text-gray-400" />}
                placeholder="Nhập họ và tên đầy đủ của bạn"
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
              className="mb-4"
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Nhập email của bạn"
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
              className="mb-4"
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="Nhập số điện thoại của bạn"
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              ]}
              className="mb-4"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu của bạn"
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
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
              className="mb-4"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Xác nhận mật khẩu của bạn"
                className="rounded-lg py-2 px-4 h-10"
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
              className="mb-4"
            >
              <Checkbox>
                Tôi đồng ý với{" "}
                <Link to="/terms" className="text-purple-700">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link to="/privacy" className="text-purple-700">
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
                className="h-10 rounded-lg font-medium text-base bg-gradient-to-r from-purple-700 to-purple-900 border-none"
              >
                Đăng ký
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </Form.Item>

            <Form.Item className="mb-5 text-center">
              <Text>
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-purple-700 font-medium">
                  Đăng nhập ngay
                </Link>
              </Text>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="w-1/2 bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
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
    </div>
  );
}
