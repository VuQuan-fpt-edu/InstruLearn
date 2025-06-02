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
        `https://instrulearnapplication.azurewebsites.net/api/WalletTransactions/wallet/${learnerId}`,
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
      .filter((t) => t.transactionType === "AddFuns" && t.status === "Complete")
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
      return <Tag color="error">Đã hủy</Tag>;
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
        <div className="flex flex-col">
          <Text className="font-medium">{dayjs(date).format("HH:mm")}</Text>
          <Text type="secondary" className="text-xs">
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
        </div>
      ),
      sorter: (a, b) =>
        new Date(b.transactionDate) - new Date(a.transactionDate),
      defaultSortOrder: "descend",
      width: 100,
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
      width: 120,
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
      width: 120,
    },
    {
      title: "Số tiền",
      dataIndex: "signedAmount",
      key: "signedAmount",
      render: (amount) => {
        const isPositive = amount > 0;
        return (
          <div className="text-right">
            <Text
              strong
              className={`text-base ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {amount.toLocaleString()} VNĐ
            </Text>
          </div>
        );
      },
      sorter: (a, b) => a.signedAmount - b.signedAmount,
      align: "right",
      width: 150,
    },
    {
      title: "Nội dung giao dịch",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (type) => (
        <Text className="text-base">{type || "Không xác định"}</Text>
      ),
      width: 200,
    },
  ];

  // Hàm nhóm giao dịch theo ngày
  const groupTransactionsByDate = (transactions) => {
    const groups = {};
    transactions.forEach((transaction) => {
      const date = dayjs(transaction.transactionDate).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    return groups;
  };

  // Render bảng giao dịch với nhóm theo ngày
  const renderTransactionTable = () => {
    if (filteredData.length === 0) {
      return (
        <Empty
          description="Không có giao dịch nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    const groupedTransactions = groupTransactionsByDate(filteredData);
    const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
      b.localeCompare(a)
    );

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="bg-white rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <Text strong>
                {dayjs(date).format("DD/MM/YYYY")}
                {dayjs(date).isSame(dayjs(), "day") && (
                  <Tag color="blue" className="ml-2">
                    Hôm nay
                  </Tag>
                )}
                {dayjs(date).isSame(dayjs().subtract(1, "day"), "day") && (
                  <Tag color="purple" className="ml-2">
                    Hôm qua
                  </Tag>
                )}
              </Text>
            </div>
            <Table
              columns={columns}
              dataSource={groupedTransactions[date]}
              rowKey="transactionId"
              pagination={false}
              className="transaction-table"
              scroll={{ x: true }}
              rowClassName="hover:bg-purple-50 transition-colors duration-300"
            />
          </div>
        ))}
      </div>
    );
  };

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
          {/* <Col xs={24} sm={12} md={6}>
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
          </Col> */}
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
                title={<span className="text-gray-600">Tổng số tiền nạp</span>}
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
                title={
                  <span className="text-gray-600">Tổng số tiền thanh toán</span>
                }
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
        <Spin spinning={loading}>{renderTransactionTable()}</Spin>
      </Card>

      <style jsx global>{`
        .transaction-table .ant-table-thead > tr > th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .transaction-table .ant-table {
          margin: -1px;
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
