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
  Table,
  Space,
  Tooltip,
  Input,
  Select,
} from "antd";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import axios from "axios";
import dayjs from "dayjs";
import { CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const statusMap = {
  0: { color: "blue", text: "Chưa đọc" },
  1: { color: "gold", text: "Đã đọc" },
  2: { color: "green", text: "Đã xử lý" },
};

const StudentNotification = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("student-notification");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
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

  const markAsResolved = async (notificationId) => {
    try {
      await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/StaffNotification/mark-as-resolved/${notificationId}`
      );
      fetchNotifications();
    } catch (error) {
      message.error("Không thể đánh dấu đã xử lý");
    }
  };

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const filteredData = notifications.filter((item) => {
    const matchSearch =
      item.learnerName?.toLowerCase().includes(search.toLowerCase()) ||
      item.teacherChangeReason?.toLowerCase().includes(search.toLowerCase()) ||
      item.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === null ? true : item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: "Học viên",
      dataIndex: "learnerName",
      key: "learnerName",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Lý do đổi giáo viên",
      dataIndex: "teacherChangeReason",
      key: "teacherChangeReason",
      render: (text) => <span className="text-red-500">{text || "-"}</span>,
    },
    {
      title: "Thời gian gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
      filters: [
        { text: "Chưa đọc", value: 0 },
        { text: "Đã đọc", value: 1 },
        { text: "Đã xử lý", value: 2 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status !== 2 && (
            <Tooltip title="Đánh dấu đã xử lý">
              <Button
                type="primary"
                size="small"
                onClick={() => markAsResolved(record.notificationId)}
              >
                Đánh dấu đã xử lý
              </Button>
            </Tooltip>
          )}
          {record.status !== 2 && (
            <Tooltip title="Xử lý đơn">
              <Button
                type="default"
                size="small"
                onClick={() =>
                  navigate(
                    `/staff/change-all-teacher?learningRegisId=${record.learningRegisId}`
                  )
                }
              >
                Xử lý đơn
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

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
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-6 text-white">
                <Title level={2} className="text-center mb-0">
                  Quản lý yêu cầu đổi giáo viên
                </Title>
                <p className="text-center text-blue-100 mt-2">
                  Theo dõi, tìm kiếm và xử lý các yêu cầu thay đổi giáo viên từ
                  học viên
                </p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-4 items-center">
                  <Input.Search
                    placeholder="Tìm kiếm theo tên học viên, lý do..."
                    allowClear
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Select
                    placeholder="Lọc theo trạng thái"
                    allowClear
                    style={{ width: 180 }}
                    onChange={setStatusFilter}
                  >
                    <Option value={0}>Chưa đọc</Option>
                    <Option value={1}>Đã đọc</Option>
                    <Option value={2}>Đã xử lý</Option>
                  </Select>
                  <Button
                    type="primary"
                    onClick={fetchNotifications}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </div>
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="notificationId"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có yêu cầu nào"
                      />
                    ),
                  }}
                />
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentNotification;
