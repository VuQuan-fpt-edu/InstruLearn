import React, { useState, useEffect } from "react";
import { Layout, Card, Typography, List, Tag, Spin, Empty, Button } from "antd";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import axios from "axios";
import dayjs from "dayjs";
import { CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { message } from "antd";

const { Content } = Layout;
const { Title } = Typography;

const Notification = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("notification");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    fetchTeacherId();
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchNotifications(teacherId);
    }
  }, [teacherId]);

  const fetchTeacherId = async () => {
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
        setTeacherId(response.data.data.teacherId);
      }
    } catch (error) {
      setTeacherId(null);
    }
  };

  const fetchNotifications = async (teacherId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/teacher/${teacherId}`
      );
      if (response.data?.isSucceed) {
        setNotifications(response.data.data || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/mark-as-read/${notificationId}`
      );
      if (teacherId) fetchNotifications(teacherId);
    } catch (error) {
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <TeacherSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <TeacherHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-6 text-white">
                <Title level={2} className="text-center mb-0">
                  Thông báo từ học viên
                </Title>
                <p className="text-center text-blue-100 mt-2">
                  Danh sách các thông báo liên quan đến giáo viên
                </p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <Spin size="large" />
                  </div>
                ) : (
                  <List
                    dataSource={notifications}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Không có thông báo nào"
                        />
                      ),
                    }}
                    renderItem={(item) => (
                      <List.Item className="bg-white rounded-lg border mb-4 p-4 hover:shadow-md transition-shadow duration-300">
                        <List.Item.Meta
                          title={
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-600">
                                {item.title}
                              </span>
                              <Tag
                                color={
                                  item.status === 0
                                    ? "blue"
                                    : item.status === 1
                                    ? "gold"
                                    : "green"
                                }
                                icon={
                                  item.status === 0 ? (
                                    <EyeOutlined />
                                  ) : item.status === 1 ? (
                                    <CheckCircleOutlined />
                                  ) : (
                                    <CheckCircleOutlined />
                                  )
                                }
                              >
                                {item.status === 0
                                  ? "Chưa đọc"
                                  : item.status === 1
                                  ? "Đã đọc"
                                  : "Đã xử lý"}
                              </Tag>
                            </div>
                          }
                          description={
                            <>
                              <div className="mb-2 text-gray-700">
                                {item.message}
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                <span>
                                  Học viên: <b>{item.learnerName}</b>
                                </span>
                                <span>
                                  Ngày gửi:{" "}
                                  {dayjs(item.createdAt).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                </span>
                                {/* <span>Mã đăng ký: {item.learningRegisId}</span> */}
                              </div>
                              {item.status === 0 && (
                                <Button
                                  type="primary"
                                  size="small"
                                  className="mt-3"
                                  onClick={() =>
                                    markAsRead(item.notificationId)
                                  }
                                >
                                  Đánh dấu đã đọc
                                </Button>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
                <div className="flex justify-center mt-6">
                  <Button
                    type="primary"
                    onClick={() => teacherId && fetchNotifications(teacherId)}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Notification;
