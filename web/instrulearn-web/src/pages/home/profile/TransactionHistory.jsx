import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Spin,
  message,
  Statistic,
  Row,
  Col,
  DatePicker,
  Empty,
  Alert,
  Space,
} from "antd";
import {
  WalletOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HistoryOutlined,
  FilterOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalTransactions: 0,
    totalDeposit: 0,
    totalPayment: 0,
    balance: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Cập nhật dữ liệu đã lọc khi transactions hoặc dateRange thay đổi
    filterTransactions();
  }, [transactions, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      if (!token || !learnerId) {
        throw new Error("Vui lòng đăng nhập để xem thông tin");
      }

      const response = await axios.get(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/WalletTransactions/wallet/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const sortedData = response.data.sort(
          (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
        );

        setTransactions(sortedData);
        calculateStatistics(sortedData);
      } else {
        throw new Error("Không thể tải lịch sử giao dịch");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.message || "Không thể tải lịch sử giao dịch");
      message.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const totalDeposit = data
      .filter((t) => t.transactionType === "AddFuns")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayment = data
      .filter((t) => t.transactionType === "Payment")
      .reduce((sum, t) => sum + t.amount, 0);

    // Tính số dư bằng cách lấy tổng số tiền giao dịch dựa vào signedAmount
    const balance = data.reduce((sum, t) => sum + t.signedAmount, 0);

    setStatistics({
      totalTransactions: data.length,
      totalDeposit,
      totalPayment,
      balance,
    });
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Lọc theo ngày nếu có chọn dateRange
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");

      filtered = filtered.filter((transaction) => {
        const transactionDate = dayjs(transaction.transactionDate);
        return (
          transactionDate.isAfter(startDate) &&
          transactionDate.isBefore(endDate)
        );
      });
    }

    setFilteredData(filtered);
    calculateStatistics(filtered);
  };

  const handleResetFilters = () => {
    setDateRange([null, null]);
    setFilteredData(transactions);
    calculateStatistics(transactions);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const getTransactionTypeTag = (type) => {
    if (type === "AddFuns") {
      return (
        <Tag icon={<ArrowUpOutlined />} color="success">
          Nạp tiền
        </Tag>
      );
    } else if (type === "Payment") {
      return (
        <Tag icon={<ArrowDownOutlined />} color="error">
          Thanh toán
        </Tag>
      );
    } else {
      return <Tag color="default">{type}</Tag>;
    }
  };

  const getStatusTag = (status) => {
    if (status === "Complete") {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Hoàn thành
        </Tag>
      );
    } else if (status === "Pending") {
      return <Tag color="warning">Đang xử lý</Tag>;
    } else if (status === "Failed") {
      return <Tag color="error">Thất bại</Tag>;
    } else {
      return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (date) => (
        <span>
          <CalendarOutlined className="mr-2 text-blue-500" />
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      sorter: (a, b) =>
        new Date(b.transactionDate) - new Date(a.transactionDate),
      defaultSortOrder: "descend",
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => getTransactionTypeTag(type),
      filters: [
        { text: "Nạp tiền", value: "AddFuns" },
        { text: "Thanh toán", value: "Payment" },
      ],
      onFilter: (value, record) => record.transactionType === value,
    },
    {
      title: "Mã giao dịch",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (id) => (
        <span className="text-gray-500">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Hoàn thành", value: "Complete" },
        { text: "Đang xử lý", value: "Pending" },
        { text: "Thất bại", value: "Failed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Số tiền",
      dataIndex: "signedAmount",
      key: "signedAmount",
      render: (amount) => {
        const isPositive = amount > 0;
        return (
          <span
            className={`font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {amount.toLocaleString()} VNĐ
          </span>
        );
      },
      sorter: (a, b) => a.signedAmount - b.signedAmount,
    },
  ];

  if (error) {
    return (
      <Card className="shadow-lg rounded-lg">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchTransactions}>Thử lại</Button>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        className="shadow-lg rounded-lg"
        title={
          <div className="flex items-center">
            <HistoryOutlined className="text-purple-700 mr-2" />
            <span className="text-xl">Lịch sử giao dịch</span>
          </div>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTransactions}
            type="primary"
            className="bg-purple-700 hover:bg-purple-800"
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500">
              <Statistic
                title={<span className="text-gray-600">Số dư hiện tại</span>}
                value={statistics.balance}
                valueStyle={{ color: "#722ed1" }}
                prefix={<WalletOutlined />}
                suffix="VNĐ"
                formatter={(value) => `${value.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
              <Statistic
                title={<span className="text-gray-600">Tổng giao dịch</span>}
                value={statistics.totalTransactions}
                valueStyle={{ color: "#1890ff" }}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500">
              <Statistic
                title={<span className="text-gray-600">Tổng nạp tiền</span>}
                value={statistics.totalDeposit}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="VNĐ"
                formatter={(value) => `${value.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-red-500">
              <Statistic
                title={<span className="text-gray-600">Tổng thanh toán</span>}
                value={statistics.totalPayment}
                valueStyle={{ color: "#cf1322" }}
                prefix={<ArrowDownOutlined />}
                suffix="VNĐ"
                formatter={(value) => `${value.toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <FilterOutlined className="text-gray-500 mr-2" />
            <Text strong>Bộ lọc:</Text>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              className="w-full sm:w-auto"
            />
            <Button type="default" onClick={handleResetFilters}>
              Đặt lại
            </Button>
          </Space>
        </div>

        {/* Bảng giao dịch */}
        <Spin spinning={loading}>
          {filteredData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="transactionId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} giao dịch`,
              }}
              className="transaction-table"
              scroll={{ x: true }}
              rowClassName="hover:bg-purple-50 transition-colors duration-300"
            />
          ) : (
            <Empty
              description="Không có giao dịch nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Card>

      <style jsx global>{`
        .transaction-table .ant-table-thead > tr > th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
