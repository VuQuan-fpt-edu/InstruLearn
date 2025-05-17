import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  List,
  Tag,
  Spin,
  Empty,
  Button,
  message,
} from "antd";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import axios from "axios";
import dayjs from "dayjs";
import { CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

const StudentNotification = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("student-notification");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/StaffNotification/teacher-change-requests"
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
      await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/mark-as-read/${notificationId}`
      );
      fetchNotifications();
    } catch (error) {
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6" style={{ marginTop: "64px" }}>
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-6 text-white">
                <Title level={2} className="text-center mb-0">
                  Thông báo đổi giáo viên
                </Title>
                <p className="text-center text-blue-100 mt-2">
                  Danh sách các yêu cầu thay đổi giáo viên từ học viên
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
                              {item.teacherChangeReason && (
                                <div className="mb-2 text-red-500">
                                  <b>Lý do thay đổi giáo viên:</b>{" "}
                                  {item.teacherChangeReason}
                                </div>
                              )}
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
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() =>
                                      markAsRead(item.notificationId)
                                    }
                                  >
                                    Đánh dấu đã đọc
                                  </Button>
                                  <Button
                                    type="default"
                                    size="small"
                                    onClick={() =>
                                      navigate(
                                        `/staff/change-all-teacher?learningRegisId=${item.learningRegisId}`
                                      )
                                    }
                                  >
                                    Xử lý đơn
                                  </Button>
                                </div>
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
                    onClick={fetchNotifications}
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

export default StudentNotification;
