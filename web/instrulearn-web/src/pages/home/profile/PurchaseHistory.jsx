import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Select,
  Input,
  Space,
  Divider,
  Tooltip,
  Statistic,
  Card,
  Row,
  Col,
  DatePicker,
  Dropdown,
  Menu,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  StarFilled,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Bổ sung nhiều dữ liệu hơn với nhiều thông tin
const enhancedFakeData = [
  {
    id: 1,
    name: "React for Beginners",
    instructor: "Nguyễn Văn A",
    category: "Web Development",
    date: "2025-02-15",
    completionDate: "2025-03-10",
    price: "$49.99",
    status: "Completed",
    paymentMethod: "Credit Card",
    rating: 4.5,
    progress: 100,
    certificate: true,
    orderNumber: "ORD-2025021501",
    invoiceId: "INV-20250215-001",
  },
  {
    id: 2,
    name: "Advanced JavaScript",
    instructor: "Trần Văn B",
    category: "Programming",
    date: "2025-02-10",
    completionDate: null,
    price: "$59.99",
    status: "Processing",
    paymentMethod: "PayPal",
    rating: null,
    progress: 0,
    certificate: false,
    orderNumber: "ORD-2025021001",
    invoiceId: "INV-20250210-001",
  },
  {
    id: 3,
    name: "UI/UX Design Mastery",
    instructor: "Lê Thị C",
    category: "Design",
    date: "2025-01-28",
    completionDate: null,
    price: "$39.99",
    status: "Refunded",
    paymentMethod: "Bank Transfer",
    rating: 2.0,
    progress: 10,
    certificate: false,
    orderNumber: "ORD-2025012801",
    invoiceId: "INV-20250128-001",
  },
  {
    id: 4,
    name: "Python Data Science",
    instructor: "Hoàng Văn D",
    category: "Data Science",
    date: "2025-01-15",
    completionDate: "2025-02-20",
    price: "$69.99",
    status: "Completed",
    paymentMethod: "Credit Card",
    rating: 5.0,
    progress: 100,
    certificate: true,
    orderNumber: "ORD-2025011501",
    invoiceId: "INV-20250115-001",
  },
  {
    id: 5,
    name: "Machine Learning Fundamentals",
    instructor: "Phạm Thị E",
    category: "AI & ML",
    date: "2025-01-05",
    completionDate: null,
    price: "$79.99",
    status: "Processing",
    paymentMethod: "E-wallet",
    rating: null,
    progress: 45,
    certificate: false,
    orderNumber: "ORD-2025010501",
    invoiceId: "INV-20250105-001",
  },
];

const PurchaseHistory = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  const handleCategoryFilterChange = (value) => {
    setFilterCategory(value);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleExportClick = ({ key }) => {
    alert(`Xuất file định dạng: ${key}`);
  };

  // Tính tổng chi tiêu
  const totalSpent = enhancedFakeData
    .filter((item) => item.status !== "Refunded")
    .reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")), 0);

  // Lọc dữ liệu theo nhiều điều kiện
  const filteredData = enhancedFakeData
    .filter((item) => filterStatus === "All" || item.status === filterStatus)
    .filter(
      (item) => filterCategory === "All" || item.category === filterCategory
    )
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchText.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((item) => {
      if (!dateRange || !dateRange[0] || !dateRange[1]) return true;

      const purchaseDate = new Date(item.date);
      return (
        purchaseDate >= dateRange[0].startOf("day").toDate() &&
        purchaseDate <= dateRange[1].endOf("day").toDate()
      );
    });

  // Tạo danh sách các danh mục khóa học duy nhất
  const categories = [
    ...new Set(enhancedFakeData.map((item) => item.category)),
  ];

  const exportMenu = (
    <Menu onClick={handleExportClick}>
      <Menu.Item key="excel" icon={<FileExcelOutlined />}>
        Xuất Excel
      </Menu.Item>
      <Menu.Item key="pdf" icon={<FilePdfOutlined />}>
        Xuất PDF
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 160,
    },
    {
      title: "Khóa học",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Giảng viên",
      dataIndex: "instructor",
      key: "instructor",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: "Ngày mua",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-medium text-green-600">{price}</span>
      ),
      sorter: (a, b) =>
        parseFloat(a.price.replace("$", "")) -
        parseFloat(b.price.replace("$", "")),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color, vietnameseStatus;

        switch (status) {
          case "Completed":
            color = "green";
            vietnameseStatus = "Hoàn tất";
            break;
          case "Processing":
            color = "blue";
            vietnameseStatus = "Đang xử lý";
            break;
          case "Refunded":
            color = "red";
            vietnameseStatus = "Hoàn tiền";
            break;
          default:
            color = "default";
            vietnameseStatus = status;
        }

        return <Tag color={color}>{vietnameseStatus}</Tag>;
      },
      filters: [
        {
          text: "Hoàn tất",
          value: "Completed",
        },
        {
          text: "Đang xử lý",
          value: "Processing",
        },
        {
          text: "Hoàn tiền",
          value: "Refunded",
        },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => {
        let color = "gray";
        if (progress === 100) color = "green";
        else if (progress > 50) color = "blue";
        else if (progress > 0) color = "orange";

        return (
          <Tooltip title={`${progress}% hoàn thành`}>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full bg-${color}-500`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.progress - b.progress,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            className="rounded-lg"
            onClick={() => alert(`Xem khóa học: ${record.name}`)}
          >
            Xem chi tiết
          </Button>
          {record.status !== "Refunded" && (
            <Tooltip title="Tải hóa đơn">
              <Button
                type="default"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => alert(`Tải hóa đơn: ${record.invoiceId}`)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Chi tiết mở rộng khi click vào hàng
  const expandedRowRender = (record) => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <Card size="small" title="Thông tin thanh toán">
              <p>
                <strong>Mã hóa đơn:</strong> {record.invoiceId}
              </p>
              <p>
                <strong>Phương thức:</strong> {record.paymentMethod}
              </p>
              <p>
                <strong>Ngày thanh toán:</strong> {record.date}
              </p>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Thông tin khóa học">
              <p>
                <strong>Danh mục:</strong> {record.category}
              </p>
              <p>
                <strong>Giảng viên:</strong> {record.instructor}
              </p>
              <p>
                <strong>Chứng chỉ:</strong>{" "}
                {record.certificate ? (
                  <Tag color="green">Có sẵn</Tag>
                ) : (
                  <Tag color="orange">Chưa có</Tag>
                )}
              </p>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Trạng thái học tập">
              <p>
                <strong>Tiến độ:</strong> {record.progress}%
              </p>
              <p>
                <strong>Hoàn thành:</strong>{" "}
                {record.completionDate
                  ? record.completionDate
                  : "Chưa hoàn thành"}
              </p>
              <p>
                <strong>Đánh giá:</strong>{" "}
                {record.rating ? (
                  <span>
                    {record.rating}/5 <StarFilled className="text-yellow-400" />
                  </span>
                ) : (
                  "Chưa đánh giá"
                )}
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <HistoryOutlined className="text-blue-500 text-xl mr-2" />
          <h2 className="text-xl font-bold m-0">Lịch sử mua khóa học</h2>
        </div>
        <Dropdown overlay={exportMenu}>
          <Button icon={<DownloadOutlined />}>
            Xuất file <DownloadOutlined />
          </Button>
        </Dropdown>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khóa học đã mua"
              value={enhancedFakeData.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khóa học đã hoàn thành"
              value={
                enhancedFakeData.filter((item) => item.status === "Completed")
                  .length
              }
              suffix={`/${enhancedFakeData.length}`}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng chi tiêu"
              value={totalSpent}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ trung bình"
              value={Math.round(
                enhancedFakeData.reduce((sum, item) => sum + item.progress, 0) /
                  enhancedFakeData.length
              )}
              suffix="%"
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider className="my-4" />

      {/* Bộ lọc nâng cao */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center">
            <FilterOutlined className="mr-2 text-gray-500" />
            <Select
              defaultValue="All"
              onChange={handleFilterChange}
              className="w-40 mr-4"
              placeholder="Trạng thái"
            >
              <Option value="All">Tất cả trạng thái</Option>
              <Option value="Completed">Hoàn tất</Option>
              <Option value="Processing">Đang xử lý</Option>
              <Option value="Refunded">Hoàn tiền</Option>
            </Select>
          </div>

          <div className="flex items-center">
            <Select
              defaultValue="All"
              onChange={handleCategoryFilterChange}
              className="w-48 mr-4"
              placeholder="Danh mục"
            >
              <Option value="All">Tất cả danh mục</Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center">
            <CalendarOutlined className="mr-2 text-gray-500" />
            <RangePicker
              onChange={handleDateRangeChange}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </div>
        </div>

        <Input
          placeholder="Tìm kiếm khóa học, giảng viên, mã đơn hàng..."
          onChange={handleSearch}
          prefix={<SearchOutlined className="text-gray-400" />}
          className="min-w-[300px]"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} khóa học`,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          bordered={false}
          className="purchase-history-table"
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([record.id]);
              } else {
                setExpandedRowKeys([]);
              }
            },
          }}
          summary={(pageData) => {
            const totalPrice = pageData
              .filter((item) => item.status !== "Refunded")
              .reduce(
                (sum, item) => sum + parseFloat(item.price.replace("$", "")),
                0
              );

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <strong>Tổng cộng (trang hiện tại)</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong className="text-green-600">
                    ${totalPrice.toFixed(2)}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>

      <div className="mt-4 flex justify-between text-gray-500 text-sm">
        <div>
          Hiển thị {filteredData.length} khóa học trên tổng số{" "}
          {enhancedFakeData.length} khóa học
        </div>
        <div>
          <QuestionCircleOutlined className="mr-1" />
          Cần hỗ trợ? <a href="#support">Liên hệ với chúng tôi</a>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
