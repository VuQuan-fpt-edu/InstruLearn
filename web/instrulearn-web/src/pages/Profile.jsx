import { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Divider,
  Spin,
  Alert,
  Button,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Bạn chưa đăng nhập");
        }

        const response = await axios.get(
          "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Auth/Profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.isSucceed) {
          setProfile(response.data.data);
          // Lưu tên người dùng vào localStorage để có thể sử dụng ở các trang khác nếu cần
          if (response.data.data.username) {
            localStorage.setItem("username", response.data.data.username);
          }
        } else {
          throw new Error(
            response.data.message || "Không thể lấy thông tin hồ sơ"
          );
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              onClick={() => (window.location.href = "/login")}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Đăng nhập
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <Card className="shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <Avatar
            size={120}
            icon={<UserOutlined />}
            className="bg-purple-700 mb-4"
          />
          <Title level={2}>{profile.fullName}</Title>
          <Text type="secondary" className="text-lg">
            @{profile.username}
          </Text>
        </div>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card className="h-full" title="Thông tin cá nhân">
              <div className="space-y-6">
                <div className="flex items-center">
                  <UserOutlined className="text-purple-700 text-xl mr-4" />
                  <div>
                    <Text type="secondary">Họ và tên</Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile.fullName}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <MailOutlined className="text-purple-700 text-xl mr-4" />
                  <div>
                    <Text type="secondary">Email</Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile.email}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <PhoneOutlined className="text-purple-700 text-xl mr-4" />
                  <div>
                    <Text type="secondary">Số điện thoại</Text>
                    <div>
                      <Text strong className="text-lg">
                        {profile.phoneNumber}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="h-full" title="Thông tin tài khoản">
              <div className="space-y-6">
                <div>
                  <Text type="secondary">ID học viên</Text>
                  <div>
                    <Text strong className="text-lg">
                      {profile.learnerId}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Tên đăng nhập</Text>
                  <div>
                    <Text strong className="text-lg">
                      {profile.username}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  Cập nhật thông tin
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile;
