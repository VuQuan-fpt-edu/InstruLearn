import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Avatar,
  Typography,
  Spin,
  Form,
  Input,
  Button,
  message,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getCurrentUser } from "../../api/auth";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title, Text } = Typography;

const StaffProfile = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getCurrentUser();
      if (response.isSucceed && response.data) {
        setProfile(response.data);
        form.setFieldsValue({
          staffId: response.data.staffId,
          accountId: response.data.accountId,
          fullname: response.data.fullname,
          email: response.data.email,
          username: response.data.username,
          role: response.data.role,
        });
      } else {
        throw new Error(response.message || "Không thể tải thông tin cá nhân");
      }
    } catch (error) {
      message.error("Không thể tải thông tin cá nhân");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    form.setFieldsValue({
      staffId: profile.staffId,
      accountId: profile.accountId,
      fullname: profile.fullname,
      email: profile.email,
      username: profile.username,
      role: profile.role,
    });
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Implement API call to update profile here
      message.success("Cập nhật thông tin thành công");
      setEditing(false);
      // Refresh profile data
      fetchProfile();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const renderProfileContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        <Card
          className="shadow-md"
          actions={
            editing
              ? [
                  <Button
                    key="save"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                  >
                    Lưu thay đổi
                  </Button>,
                  <Button
                    key="cancel"
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>,
                ]
              : [
                  <Button
                    key="edit"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    Chỉnh sửa
                  </Button>,
                ]
          }
        >
          <div className="flex flex-col items-center mb-6">
            <Avatar
              size={100}
              icon={<UserOutlined />}
              className="mb-4 bg-blue-500"
            />
            <Title level={3} className="m-0">
              {profile?.fullname || "Chưa cập nhật"}
            </Title>
            <Text type="secondary">{profile?.role || "Staff"}</Text>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            disabled={!editing}
            className="max-w-lg mx-auto"
          >
            <Form.Item name="staffId" label="Staff ID">
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>

            <Form.Item name="accountId" label="Account ID">
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>

            <Form.Item
              name="fullname"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Nhập tên đăng nhập"
                disabled
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

            <Form.Item name="role" label="Vai trò">
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  };

  return (
    <Layout className="min-h-screen">
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu="profile"
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu="profile"
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          {renderProfileContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffProfile;
