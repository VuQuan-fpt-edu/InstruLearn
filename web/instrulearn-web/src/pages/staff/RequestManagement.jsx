import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Input,
  Space,
  Typography,
  Card,
  Tag,
  Tooltip,
  Spin,
  Select,
  Modal,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Fake data generation
const generateFakeRequests = () => {
  const requestTypes = [
    "Đăng ký khóa học",
    "Yêu cầu hủy khóa học",
    "Chuyển lớp",
    "Hỗ trợ kỹ thuật",
    "Giảm học phí",
    "Đăng ký giáo viên",
  ];

  const statuses = ["Pending", "Approved", "Rejected"];

  const names = [
    "Nguyễn Văn A",
    "Trần Thị B",
    "Lê Văn C",
    "Phạm Thị D",
    "Hoàng Văn E",
    "Đặng Thị F",
    "Vũ Văn G",
    "Trương Thị H",
  ];

  return Array.from({ length: 50 }, (_, index) => ({
    requestId: index + 1,
    requesterName: names[Math.floor(Math.random() * names.length)],
    requestType: requestTypes[Math.floor(Math.random() * requestTypes.length)],
    description: `Chi tiết yêu cầu cho ${
      requestTypes[Math.floor(Math.random() * requestTypes.length)]
    }`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  }));
};

const RequestManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call with fake data
    const timer = setTimeout(() => {
      setRequests(generateFakeRequests());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateRequestStatus = (requestId, newStatus) => {
    // Simulate status update
    const updatedRequests = requests.map((request) =>
      request.requestId === requestId
        ? { ...request, status: newStatus }
        : request
    );

    setRequests(updatedRequests);
    message.success("Cập nhật trạng thái yêu cầu thành công");
    setSelectedRequest(null);
  };

  const handleViewRequestDetails = (record) => {
    setSelectedRequest(record);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.requesterName.toLowerCase().includes(searchText.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchText.toLowerCase()) ||
      request.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus ? request.status === filterStatus : true;
    const matchesType = filterType ? request.requestType === filterType : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  const columns = [
    {
      title: "Người gửi",
      dataIndex: "requesterName",
      key: "requesterName",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.requesterName.localeCompare(b.requesterName),
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "requestType",
      key: "requestType",
      render: (type) => <Tag color="blue">{type}</Tag>,
      filters: Array.from(
        new Set(requests.map((request) => request.requestType))
      ).map((type) => ({ text: type, value: type })),
      onFilter: (value, record) => record.requestType === value,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Pending: "orange",
          Approved: "green",
          Rejected: "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Approved", value: "Approved" },
        { text: "Rejected", value: "Rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewRequestDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý yêu cầu</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm yêu cầu..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder="Trạng thái"
                  style={{ width: 120 }}
                  allowClear
                  onChange={(value) => setFilterStatus(value)}
                >
                  <Option value="Pending">Pending</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
                <Tooltip title="Làm mới">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setLoading(true);
                      const timer = setTimeout(() => {
                        setRequests(generateFakeRequests());
                        setLoading(false);
                      }, 500);
                    }}
                  />
                </Tooltip>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredRequests}
                rowKey="requestId"
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng cộng ${total} yêu cầu`,
                }}
              />
            </Spin>
          </Card>

          {/* Request Details Modal */}
          <Modal
            title="Chi tiết yêu cầu"
            open={!!selectedRequest}
            onCancel={() => setSelectedRequest(null)}
            footer={[
              <Button
                key="reject"
                icon={<CloseOutlined />}
                danger
                onClick={() =>
                  handleUpdateRequestStatus(
                    selectedRequest.requestId,
                    "Rejected"
                  )
                }
              >
                Từ chối
              </Button>,
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() =>
                  handleUpdateRequestStatus(
                    selectedRequest.requestId,
                    "Approved"
                  )
                }
              >
                Duyệt
              </Button>,
            ]}
          >
            {selectedRequest && (
              <div>
                <p>
                  <strong>Người gửi:</strong> {selectedRequest.requesterName}
                </p>
                <p>
                  <strong>Loại yêu cầu:</strong> {selectedRequest.requestType}
                </p>
                <p>
                  <strong>Mô tả:</strong> {selectedRequest.description}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {selectedRequest.status}
                </p>
                <p>
                  <strong>Ngày gửi:</strong>{" "}
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RequestManagement;
