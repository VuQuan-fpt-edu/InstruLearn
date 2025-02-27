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
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "0 0 50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ width: "480px", maxWidth: "100%" }}>
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "50px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  background: "linear-gradient(135deg, #7B2CBF, #5A189A)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                }}
              >
                <PlayCircleOutlined
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
              <Text strong style={{ fontSize: "18px" }}>
                InstruLearn
              </Text>
            </div>

            <Title
              level={1}
              style={{
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Chào mừng trở lại
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
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
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Nhập tên đăng nhập của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  height: "50px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  height: "50px",
                }}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" style={{ color: "#7B2CBF" }}>
                  Quên mật khẩu?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  height: "50px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "16px",
                  background: "linear-gradient(to right, #7B2CBF, #5A189A)",
                  border: "none",
                }}
              >
                Đăng nhập
                <ArrowRightOutlined style={{ marginLeft: "8px" }} />
              </Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: "32px", textAlign: "center" }}>
              <Text>
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  style={{ color: "#7B2CBF", fontWeight: "500" }}
                >
                  Đăng ký ngay
                </Link>
              </Text>
            </Form.Item>
          </Form>

          <Divider plain style={{ margin: "0 0 24px" }}>
            <Text type="secondary">Hoặc đăng nhập với</Text>
          </Divider>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            <Button
              icon={<GoogleOutlined style={{ color: "#DB4437" }} />}
              shape="round"
              size="large"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 20px",
                height: "auto",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              Google
            </Button>
            <Button
              icon={<FacebookOutlined style={{ color: "#1877F2" }} />}
              shape="round"
              size="large"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 20px",
                height: "auto",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              Facebook
            </Button>
          </div>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <Link to="/terms" style={{ color: "#7B2CBF" }}>
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link to="/privacy" style={{ color: "#7B2CBF" }}>
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi
            </Text>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: "0 0 50%",
          background: "linear-gradient(135deg, #7B2CBF, #3A0CA3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `
              radial-gradient(circle at 85% 15%, rgba(255,255,255,0.8) 0%, transparent 15%),
              radial-gradient(circle at 15% 85%, rgba(255,255,255,0.6) 0%, transparent 15%)
            `,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "80px",
            height: "150px",
            borderRadius: "40px",
            background: "rgba(255, 255, 255, 0.1)",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "12%",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            background: "rgba(255, 255, 255, 0.1)",
            transform: "rotate(20deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "18%",
            width: "160px",
            height: "40px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            transform: "rotate(-5deg)",
          }}
        />

        <div
          style={{
            textAlign: "center",
            zIndex: 1,
            maxWidth: "500px",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto 40px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <PlayCircleOutlined style={{ fontSize: "64px", color: "white" }} />
          </div>

          <Title
            level={2}
            style={{
              color: "white",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Học nhạc cụ dễ dàng và hiệu quả
          </Title>

          <Paragraph
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "16px",
              marginBottom: "40px",
              lineHeight: "1.8",
            }}
          >
            InstruLearn mang đến cho bạn hành trình khám phá âm nhạc với các bài
            học trực quan, hướng dẫn chuyên nghiệp và cộng đồng đam mê.
          </Paragraph>

          {/* Feature list */}
          <div style={{ textAlign: "left", marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <VideoCameraOutlined
                style={{
                  fontSize: "24px",
                  color: "white",
                  marginRight: "16px",
                  marginTop: "2px",
                }}
              />
              <div>
                <Text
                  strong
                  style={{
                    color: "white",
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Bài học video HD chất lượng cao
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: "14px",
                  }}
                >
                  Hơn 10,000 video từ các giảng viên âm nhạc hàng đầu
                </Text>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <CustomerServiceOutlined
                style={{
                  fontSize: "24px",
                  color: "white",
                  marginRight: "16px",
                  marginTop: "2px",
                }}
              />
              <div>
                <Text
                  strong
                  style={{
                    color: "white",
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Phân tích hiệu suất trực tiếp
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: "14px",
                  }}
                >
                  Công nghệ AI phân tích và đưa ra phản hồi ngay lập tức
                </Text>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <TrophyOutlined
                style={{
                  fontSize: "24px",
                  color: "white",
                  marginRight: "16px",
                  marginTop: "2px",
                }}
              />
              <div>
                <Text
                  strong
                  style={{
                    color: "white",
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Lộ trình học cá nhân hóa
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: "14px",
                  }}
                >
                  Phương pháp học tập được điều chỉnh theo trình độ và mục tiêu
                  của bạn
                </Text>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "20px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "24px",
                fontSize: "40px",
                color: "rgba(255, 255, 255, 0.3)",
                fontFamily: "serif",
                lineHeight: 1,
              }}
            >
              "
            </div>
            <Paragraph
              style={{
                color: "white",
                fontSize: "15px",
                fontStyle: "italic",
                margin: "0 0 10px",
              }}
            >
              Tôi đã học đàn guitar trong 3 tháng với InstruLearn và tiến bộ
              nhanh hơn nhiều so với một năm tự học trước đó.
            </Paragraph>
            <Text
              style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px" }}
            >
              Minh Tuấn - Học viên đàn guitar
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
