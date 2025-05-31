import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Popconfirm,
  Modal,
  Divider,
  Empty,
  Progress,
  Tooltip,
  Badge,
  Input,
} from "antd";
import {
  DollarOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const PaymentManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("payment-management");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    failedAmount: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/WalletTransactions"
      );

      // Lọc chỉ lấy các giao dịch nạp tiền (AddFuns)
      const addFunsTransactions = response.data.filter(
        (transaction) => transaction.transactionType === "AddFuns"
      );

      setTransactions(addFunsTransactions);

      // Tính toán thống kê
      const total = addFunsTransactions.reduce((sum, t) => sum + t.amount, 0);
      const pending = addFunsTransactions
        .filter((t) => t.status === "Pending")
        .reduce((sum, t) => sum + t.amount, 0);
      const completed = addFunsTransactions
        .filter((t) => t.status === "Complete")
        .reduce((sum, t) => sum + t.amount, 0);
      const failed = addFunsTransactions
        .filter((t) => t.status === "Failed")
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingTransactions = addFunsTransactions.filter(
        (t) => t.status === "Pending"
      ).length;
      const completedTransactions = addFunsTransactions.filter(
        (t) => t.status === "Complete"
      ).length;
      const failedTransactions = addFunsTransactions.filter(
        (t) => t.status === "Failed"
      ).length;

      setStatistics({
        totalAmount: total,
        pendingAmount: pending,
        completedAmount: completed,
        failedAmount: failed,
        totalTransactions: addFunsTransactions.length,
        pendingTransactions,
        completedTransactions,
        failedTransactions,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusTag = (status) => {
    switch (status) {
      case "Complete":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã hoàn thành
          </Tag>
        );
      case "Pending":
        return (
          <Tag icon={<SyncOutlined spin />} color="warning">
            Đang chờ
          </Tag>
        );
      case "Failed":
        return (
          <Tag icon={<CloseOutlined />} color="error">
            Từ chối
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    // {
    //   title: "Mã giao dịch",
    //   dataIndex: "transactionId",
    //   key: "transactionId",
    //   width: 200,
    //   ellipsis: true,
    //   render: (text) => (
    //     <Tooltip title={text}>
    //       <div className="font-medium text-blue-600">
    //         {text.substring(0, 10)}...
    //       </div>
    //     </Tooltip>
    //   ),
    // },
    {
      title: "Học viên",
      dataIndex: "learnerFullname",
      key: "learnerFullname",
      width: 150,
      ellipsis: true,
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "signedAmount",
      key: "signedAmount",
      width: 130,
      render: (amount) => (
        <div
          className={`font-medium text-right ${
            amount > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {amount > 0 ? "+" : ""}
          {amount.toLocaleString("vi-VN")} VNĐ
        </div>
      ),
      sorter: (a, b) => a.signedAmount - b.signedAmount,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 150,
      render: (type) => (
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-gray-500" />
          <span>{type}</span>
        </div>
      ),
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 150,
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-gray-500" />
          <span>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        </div>
      ),
      sorter: (a, b) =>
        dayjs(a.transactionDate).unix() - dayjs(b.transactionDate).unix(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Đang chờ", value: "Pending" },
        { text: "Đã hoàn thành", value: "Complete" },
        { text: "Từ chối", value: "Failed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => {
        if (record.status === "Complete") {
          return (
            <Tooltip title="Đã hoàn thành">
              <CheckCircleFilled
                style={{ fontSize: "18px", color: "#52c41a" }}
              />
            </Tooltip>
          );
        } else if (record.status === "Failed") {
          return (
            <Tooltip title="Đã từ chối">
              <CloseOutlined style={{ fontSize: "18px", color: "#ff4d4f" }} />
            </Tooltip>
          );
        } else if (record.status === "Pending") {
          return (
            <Tooltip title="Đang chờ xử lý">
              <SyncOutlined
                spin
                style={{ fontSize: "18px", color: "#faad14" }}
              />
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const getFilteredData = () => {
    let filteredData = [...transactions];

    // Tìm kiếm theo text
    if (searchText) {
      filteredData = filteredData.filter(
        (item) =>
          item.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
          item.learnerFullname.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo khoảng ngày
    if (dateRange && dateRange.length === 2) {
      filteredData = filteredData.filter((item) =>
        dayjs(item.transactionDate).isBetween(
          dateRange[0],
          dateRange[1],
          "day",
          "[]"
        )
      );
    }

    // Lọc theo trạng thái
    if (selectedStatus !== "all") {
      filteredData = filteredData.filter(
        (item) => item.status === selectedStatus
      );
    }

    return filteredData;
  };

  // Tính % trạng thái giao dịch
  const getPendingPercent = () => {
    return statistics.totalTransactions
      ? Math.round(
          (statistics.pendingTransactions / statistics.totalTransactions) * 100
        )
      : 0;
  };

  const getCompletedPercent = () => {
    return statistics.totalTransactions
      ? Math.round(
          (statistics.completedTransactions / statistics.totalTransactions) *
            100
        )
      : 0;
  };

  const getFailedPercent = () => {
    return statistics.totalTransactions
      ? Math.round(
          (statistics.failedTransactions / statistics.totalTransactions) * 100
        )
      : 0;
  };

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <ManagerHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="mb-6">
            <Title level={3}>
              <WalletOutlined className="mr-2" /> Quản lý giao dịch nạp tiền
            </Title>
          </div>

          {/* Thống kê tổng quan */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card
                className="h-full shadow-sm hover:shadow-md transition-all"
                bordered={false}
              >
                <Statistic
                  title={<Text strong>Tổng số tiền giao dịch</Text>}
                  value={statistics.totalAmount}
                  precision={0}
                  valueStyle={{ color: "#1677ff" }}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                />
                <div className="mt-2">
                  <Text type="secondary">
                    {statistics.totalTransactions} giao dịch
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="h-full shadow-sm hover:shadow-md transition-all"
                bordered={false}
              >
                <Statistic
                  title={<Text strong>Số tiền đang chờ xử lý</Text>}
                  value={statistics.pendingAmount}
                  precision={0}
                  valueStyle={{ color: "#faad14" }}
                  prefix={<SyncOutlined spin />}
                  suffix="VNĐ"
                />
                <div className="mt-2">
                  <Progress
                    percent={getPendingPercent()}
                    size="small"
                    status="active"
                    strokeColor="#faad14"
                  />
                  <Text type="secondary">
                    {statistics.pendingTransactions} giao dịch đang chờ
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="h-full shadow-sm hover:shadow-md transition-all"
                bordered={false}
              >
                <Statistic
                  title={<Text strong>Số tiền đã xác nhận</Text>}
                  value={statistics.completedAmount}
                  precision={0}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                  suffix="VNĐ"
                />
                <div className="mt-2">
                  <Progress
                    percent={getCompletedPercent()}
                    size="small"
                    status="success"
                  />
                  <Text type="secondary">
                    {statistics.completedTransactions} giao dịch thành công
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="h-full shadow-sm hover:shadow-md transition-all"
                bordered={false}
              >
                <Statistic
                  title={<Text strong>Số tiền đã từ chối</Text>}
                  value={statistics.failedAmount}
                  precision={0}
                  valueStyle={{ color: "#ff4d4f" }}
                  prefix={<CloseOutlined />}
                  suffix="VNĐ"
                />
                <div className="mt-2">
                  <Progress
                    percent={getFailedPercent()}
                    size="small"
                    status="exception"
                  />
                  <Text type="secondary">
                    {statistics.failedTransactions} giao dịch bị từ chối
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Danh sách giao dịch */}
          <Card className="shadow-sm" bordered={false}>
            <div className="flex justify-between items-center mb-4">
              <Title level={5}>Danh sách giao dịch nạp tiền</Title>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={fetchTransactions}
              >
                Làm mới dữ liệu
              </Button>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Tìm kiếm theo mã giao dịch, tên học viên..."
                onChange={handleSearchChange}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
                allowClear
              />

              <Space>
                <span className="font-medium">Khoảng thời gian:</span>
                <RangePicker
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
              </Space>

              <Select
                defaultValue="all"
                style={{ width: 160 }}
                onChange={handleStatusChange}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Pending">
                  <Badge status="warning" text="Đang chờ" />
                </Option>
                <Option value="Complete">
                  <Badge status="success" text="Đã hoàn thành" />
                </Option>
                <Option value="Failed">
                  <Badge status="error" text="Từ chối" />
                </Option>
              </Select>
            </div>

            <Table
              columns={columns}
              dataSource={getFilteredData()}
              loading={loading}
              rowKey="transactionId"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng số ${total} giao dịch`,
              }}
              rowClassName={(record) =>
                record.status === "Pending"
                  ? "bg-yellow-50"
                  : record.status === "Complete"
                  ? "bg-green-50"
                  : record.status === "Failed"
                  ? "bg-red-50"
                  : ""
              }
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có dữ liệu giao dịch"
                  />
                ),
              }}
              size="middle"
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PaymentManagement;
