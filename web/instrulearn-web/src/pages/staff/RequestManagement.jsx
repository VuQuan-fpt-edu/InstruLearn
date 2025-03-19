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
  Descriptions,
  Divider,
  Row,
  Col,
  Form,
  Input as AntInput,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import SSidebar from "../../components/staff/StaffSidebar";
import SHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Fake data generation
const generateFakeRequests = () => {
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

  const courses = [
    "Khóa học Lập trình Web",
    "Khóa học Lập trình Mobile",
    "Khóa học UI/UX Design",
    "Khóa học Digital Marketing",
    "Khóa học Data Science",
  ];

  const reasons = [
    "Không hài lòng với chất lượng khóa học",
    "Đã đăng ký nhầm khóa học",
    "Không có thời gian học",
    "Gặp vấn đề về tài chính",
    "Muốn chuyển sang khóa học khác",
  ];

  const statuses = ["Pending", "Approved", "Rejected"];
  const types = ["online", "center", "private"];

  return Array.from({ length: 50 }, (_, index) => ({
    requestId: index + 1,
    requesterName: names[Math.floor(Math.random() * names.length)],
    courseName: courses[Math.floor(Math.random() * courses.length)],
    amount: Math.floor(Math.random() * 10000000) + 1000000,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    type: types[Math.floor(Math.random() * types.length)],
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    walletBalance: Math.floor(Math.random() * 5000000),
  }));
};

const RequestManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("refund-requests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(generateFakeRequests());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateRequestStatus = (requestId, newStatus, reason) => {
    const updatedRequests = requests.map((request) =>
      request.requestId === requestId
        ? { ...request, status: newStatus, staffReason: reason }
        : request
    );

    setRequests(updatedRequests);
    message.success("Cập nhật trạng thái yêu cầu thành công");
    setSelectedRequest(null);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleViewRequestDetails = (record) => {
    setSelectedRequest(record);
  };

  const handleActionClick = (type) => {
    setActionType(type);
    setIsModalVisible(true);
  };

  const handleActionSubmit = async () => {
    try {
      const values = await form.validateFields();
      handleUpdateRequestStatus(
        selectedRequest.requestId,
        actionType === "approve" ? "Approved" : "Rejected",
        values.reason
      );
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.requesterName.toLowerCase().includes(searchText.toLowerCase()) ||
      request.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus ? request.status === filterStatus : true;
    const matchesType = filterType ? request.type === filterType : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  const columns = [
    {
      title: "Người yêu cầu",
      dataIndex: "requesterName",
      key: "requesterName",
      render: (text) => <span className="font-medium">{text}</span>,
      sorter: (a, b) => a.requesterName.localeCompare(b.requesterName),
    },
    {
      title: "Loại hình",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeMap = {
          online: { text: "Tự học online", color: "blue" },
          center: { text: "Học tại trung tâm", color: "green" },
          private: { text: "Học 1-1 tại nhà", color: "purple" },
        };
        return <Tag color={typeMap[type].color}>{typeMap[type].text}</Tag>;
      },
      filters: [
        { text: "Tự học online", value: "online" },
        { text: "Học tại trung tâm", value: "center" },
        { text: "Học 1-1 tại nhà", value: "private" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="font-medium">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
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
        const textMap = {
          Pending: "Chờ xử lý",
          Approved: "Đã duyệt",
          Rejected: "Từ chối",
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
      filters: [
        { text: "Chờ xử lý", value: "Pending" },
        { text: "Đã duyệt", value: "Approved" },
        { text: "Từ chối", value: "Rejected" },
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
    <Layout style={{ minHeight: "100vh" }}>
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "all 0.2s",
        }}
      >
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content
          style={{
            margin: "74px 16px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý yêu cầu hoàn tiền</Title>
              <Space>
                <Input
                  placeholder="Tìm kiếm yêu cầu..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder="Loại hình"
                  style={{ width: 150 }}
                  allowClear
                  onChange={(value) => setFilterType(value)}
                >
                  <Option value="online">Tự học online</Option>
                  <Option value="center">Học tại trung tâm</Option>
                  <Option value="private">Học 1-1 tại nhà</Option>
                </Select>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: 120 }}
                  allowClear
                  onChange={(value) => setFilterStatus(value)}
                >
                  <Option value="Pending">Chờ xử lý</Option>
                  <Option value="Approved">Đã duyệt</Option>
                  <Option value="Rejected">Từ chối</Option>
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
            title="Chi tiết yêu cầu hoàn tiền"
            open={!!selectedRequest}
            onCancel={() => {
              setSelectedRequest(null);
              setIsModalVisible(false);
              form.resetFields();
            }}
            footer={[
              <Button
                key="reject"
                icon={<CloseOutlined />}
                danger
                onClick={() => handleActionClick("reject")}
              >
                Từ chối
              </Button>,
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleActionClick("approve")}
              >
                Duyệt
              </Button>,
            ]}
            width={800}
          >
            {selectedRequest && (
              <div>
                <Row gutter={24}>
                  <Col span={12}>
                    <Card title="Thông tin người yêu cầu" bordered={false}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Họ tên">
                          <UserOutlined className="mr-2" />
                          {selectedRequest.requesterName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại hình">
                          {selectedRequest.type === "online" && "Tự học online"}
                          {selectedRequest.type === "center" &&
                            "Học tại trung tâm"}
                          {selectedRequest.type === "private" &&
                            "Học 1-1 tại nhà"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khóa học">
                          {selectedRequest.courseName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số tiền được hoàn">
                          <span className="font-medium">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(selectedRequest.amount)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số dư ví">
                          <span className="font-medium">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(selectedRequest.walletBalance)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Lý do">
                          {selectedRequest.reason}
                        </Descriptions.Item>
                        {selectedRequest.staffReason && (
                          <Descriptions.Item label="Lý do xử lý">
                            <span className="font-medium">
                              {selectedRequest.staffReason}
                            </span>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Thông tin hoàn tiền" bordered={false}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Ngày yêu cầu">
                          <CalendarOutlined className="mr-2" />
                          {new Date(
                            selectedRequest.createdAt
                          ).toLocaleDateString("vi-VN")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức hoàn tiền">
                          <span className="font-medium">Hoàn tiền vào ví</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian xử lý">
                          <span className="text-gray-500">
                            {selectedRequest.status === "Pending"
                              ? "Chưa xử lý"
                              : new Date().toLocaleDateString("vi-VN")}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}
          </Modal>

          {/* Action Reason Modal */}
          <Modal
            title={
              actionType === "approve" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"
            }
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={handleActionSubmit}
            okText={actionType === "approve" ? "Duyệt" : "Từ chối"}
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="reason"
                label="Lý do"
                rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
              >
                <AntInput.TextArea
                  rows={4}
                  placeholder={
                    actionType === "approve"
                      ? "Nhập lý do chấp nhận yêu cầu hoàn tiền"
                      : "Nhập lý do từ chối yêu cầu hoàn tiền"
                  }
                />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RequestManagement;
