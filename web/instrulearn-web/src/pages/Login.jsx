import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, Divider, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  FacebookOutlined,
  GoogleOutlined,
  ArrowRightOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title, Text, Paragraph } = Typography;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (values) => {
    console.log("Login values:", values);
  };

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-700 to-purple-900 rounded-lg flex items-center justify-center mr-3">
                <PlayCircleOutlined className="text-lg text-white" />
              </div>
              <Text strong className="text-lg">
                InstruLearn
              </Text>
            </div>
            <Title level={1} className="text-3xl font-bold mb-3">
              Chào mừng trở lại
            </Title>
            <Text type="secondary" className="text-base">
              Vui lòng đăng nhập để tiếp tục hành trình âm nhạc của bạn
            </Text>
          </div>

          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
              ]}
              className="mb-4"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg py-2 px-4 h-10"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <div className="flex justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className="text-purple-700">
                  Quên mật khẩu?
                </Link>
              </div>
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                block
                className="h-10 rounded-lg font-medium text-base bg-gradient-to-r from-purple-700 to-purple-900 border-none"
              >
                Đăng nhập
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </Form.Item>

            <Form.Item className="mb-5 text-center">
              <Text>
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-purple-700 font-medium">
                  Đăng ký ngay
                </Link>
              </Text>
            </Form.Item>
          </Form>

          <Divider plain className="my-5">
            <Text type="secondary">Hoặc đăng nhập với</Text>
          </Divider>

          <div className="flex justify-center gap-4 mb-5">
            <Button
              icon={<GoogleOutlined className="text-red-600" />}
              shape="round"
              size="large"
              className="flex items-center justify-center px-4 py-1 h-auto shadow-sm"
            >
              Google
            </Button>
            <Button
              icon={<FacebookOutlined className="text-blue-600" />}
              shape="round"
              size="large"
              className="flex items-center justify-center px-4 py-1 h-auto shadow-sm"
            >
              Facebook
            </Button>
          </div>

          <div className="text-center">
            <Text type="secondary" className="text-xs">
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <Link to="/terms" className="text-purple-700">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link to="/privacy" className="text-purple-700">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="w-1/2 bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10 bg-radial-light"></div>

        <div className="absolute top-1/12 right-1/12 w-20 h-32 rounded-3xl bg-white bg-opacity-10 transform -rotate-12"></div>
        <div className="absolute bottom-1/6 left-1/12 w-32 h-32 rounded-full bg-white bg-opacity-10 transform rotate-12"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-10 rounded-xl bg-white bg-opacity-10 transform -rotate-3"></div>

        {/* Content */}
        <div className="text-center z-10 max-w-lg">
          <div className="w-32 h-32 mx-auto mb-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg">
            <PlayCircleOutlined className="text-6xl text-white" />
          </div>

          <Title level={2} className="text-white font-semibold mb-5">
            Học nhạc cụ dễ dàng và hiệu quả
          </Title>

          <Paragraph className="text-white text-opacity-85 text-base mb-8 leading-relaxed">
            InstruLearn mang đến cho bạn hành trình khám phá âm nhạc với các bài
            học trực quan, hướng dẫn chuyên nghiệp và cộng đồng đam mê.
          </Paragraph>

          {/* Feature list */}
          <div className="text-left mb-8">
            <div className="flex items-start mb-3">
              <VideoCameraOutlined className="text-xl text-white mr-4 mt-1" />
              <div>
                <Text strong className="text-white text-base block mb-1">
                  Bài học video HD chất lượng cao
                </Text>
                <Text className="text-white text-opacity-75 text-sm">
                  Hơn 10,000 video từ các giảng viên âm nhạc hàng đầu
                </Text>
              </div>
            </div>

            <div className="flex items-start mb-3">
              <CustomerServiceOutlined className="text-xl text-white mr-4 mt-1" />
              <div>
                <Text strong className="text-white text-base block mb-1">
                  Phân tích hiệu suất trực tiếp
                </Text>
                <Text className="text-white text-opacity-75 text-sm">
                  Công nghệ AI phân tích và đưa ra phản hồi ngay lập tức
                </Text>
              </div>
            </div>

            <div className="flex items-start">
              <TrophyOutlined className="text-xl text-white mr-4 mt-1" />
              <div>
                <Text strong className="text-white text-base block mb-1">
                  Lộ trình học cá nhân hóa
                </Text>
                <Text className="text-white text-opacity-75 text-sm">
                  Phương pháp học tập được điều chỉnh theo trình độ và mục tiêu
                  của bạn
                </Text>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white bg-opacity-10 rounded-xl p-5 relative">
            <div className="absolute -top-3 left-6 text-4xl text-white text-opacity-30 font-serif leading-none">
              "
            </div>
            <Paragraph className="text-white text-sm italic mb-2">
              Tôi đã học đàn guitar trong 3 tháng với InstruLearn và tiến bộ
              nhanh hơn nhiều so với một năm tự học trước đó.
            </Paragraph>
            <Text className="text-white text-opacity-70 text-sm">
              Minh Tuấn - Học viên đàn guitar
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
