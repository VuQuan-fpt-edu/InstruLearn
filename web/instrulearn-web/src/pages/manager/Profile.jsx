import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Avatar,
  Descriptions,
  Button,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const ManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.isSucceed) {
          setProfile(response.data.data);
        } else {
          message.error(
            response.data.message || "Không thể tải thông tin cá nhân"
          );
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Đã xảy ra lỗi khi tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Text type="danger">Không thể tải thông tin cá nhân</Text>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Avatar
            size={96}
            icon={<UserOutlined />}
            className="mr-6 bg-purple-700"
          />
          <div>
            <Title level={2} className="mb-1">
              {profile.fullName}
            </Title>
            <Text type="secondary">@{profile.username}</Text>
          </div>
        </div>

        <Descriptions
          title="Thông tin cá nhân"
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              className="bg-purple-700 hover:bg-purple-600"
            >
              Chỉnh sửa
            </Button>
          }
          bordered
        >
          <Descriptions.Item label="Mã quản lý">
            {profile.learnerId || profile.managerId || profile.id}
          </Descriptions.Item>
          <Descriptions.Item label="Tên tài khoản">
            {profile.username}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">{profile.role}</Descriptions.Item>
          <Descriptions.Item label={<MailOutlined />} span={2}>
            {profile.email}
          </Descriptions.Item>
          <Descriptions.Item label={<PhoneOutlined />}>
            {profile.phoneNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ManagerProfile;
