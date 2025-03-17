import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import moment from "moment";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const PromotionCodes = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promotionData, setPromotionData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingPromotion, setEditingPromotion] = useState(null);

  // Mock data - thay thế bằng API call thực tế
  const mockData = {
    promotions: [
      {
        id: 1,
        code: "SUMMER2024",
        name: "Giảm giá mùa hè 2024",
        discountType: "percentage",
        discountValue: 20,
        minAmount: 1000000,
        maxDiscount: 2000000,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        usageLimit: 100,
        usedCount: 45,
        isActive: true,
        description: "Giảm 20% cho tất cả khóa học trong mùa hè 2024",
      },
      {
        id: 2,
        code: "WELCOME50K",
        name: "Giảm giá chào mừng",
        discountType: "fixed",
        discountValue: 50000,
        minAmount: 500000,
        maxDiscount: 50000,
        startDate: "2024-03-01",
        endDate: "2024-12-31",
        usageLimit: 200,
        usedCount: 78,
        isActive: true,
        description: "Giảm 50k cho khóa học từ 500k",
      },
    ],
  };

  useEffect(() => {
    fetchPromotionData();
  }, []);

  const fetchPromotionData = async () => {
    setLoading(true);
    try {
      // API call thực tế sẽ được thay thế ở đây
      setTimeout(() => {
        setPromotionData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error("Không thể tải dữ liệu mã khuyến mãi");
      setLoading(false);
    }
  };

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditPromotion = (record) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDeletePromotion = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa mã khuyến mãi này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        // API call xóa mã khuyến mãi
        message.success("Đã xóa mã khuyến mãi thành công!");
        fetchPromotionData();
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      };

      if (editingPromotion) {
        // API call cập nhật mã khuyến mãi
        message.success("Đã cập nhật mã khuyến mãi thành công!");
      } else {
        // API call thêm mã khuyến mãi mới
        message.success("Đã thêm mã khuyến mãi mới thành công!");
      }

      setIsModalVisible(false);
      fetchPromotionData();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <Tag color={type === "percentage" ? "blue" : "green"}>
          {type === "percentage" ? "Phần trăm" : "Số tiền cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị giảm",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) =>
        record.discountType === "percentage"
          ? `${value}%`
          : `${value.toLocaleString()} VND`,
    },
    {
      title: "Khóa học tối thiểu",
      dataIndex: "minAmount",
      key: "minAmount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Giảm giá tối đa",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Thời gian",
      key: "dateRange",
      render: (_, record) => (
        <span>
          {moment(record.startDate).format("DD/MM/YYYY")} -{" "}
          {moment(record.endDate).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Số lần sử dụng",
      key: "usage",
      render: (_, record) => `${record.usedCount}/${record.usageLimit}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Đang hoạt động" : "Đã tắt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditPromotion(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePromotion(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu="PromotionCodes"
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
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="mb-6 flex justify-between items-center">
            <Title level={3}>Quản lý mã khuyến mãi</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPromotion}
            >
              Thêm mã khuyến mãi
            </Button>
          </div>

          {/* Bảng mã khuyến mãi */}
          <Card>
            <div className="mb-4 flex justify-end">
              <Space>
                <Tooltip title="Làm mới">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchPromotionData}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => message.success("Đã xuất báo cáo thành công!")}
                >
                  Xuất báo cáo
                </Button>
              </Space>
            </div>
            <Table
              columns={columns}
              dataSource={promotionData?.promotions}
              loading={loading}
              rowKey="id"
              scroll={{ x: true }}
            />
          </Card>

          {/* Modal thêm/sửa mã khuyến mãi */}
          <Modal
            title={
              editingPromotion
                ? "Chỉnh sửa mã khuyến mãi"
                : "Thêm mã khuyến mãi mới"
            }
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
            width={800}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ isActive: true }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="code"
                    label="Mã khuyến mãi"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mã khuyến mãi",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên khuyến mãi"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên khuyến mãi",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="discountType"
                    label="Loại giảm giá"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại giảm giá",
                      },
                    ]}
                  >
                    <Select>
                      <Option value="percentage">Phần trăm</Option>
                      <Option value="fixed">Số tiền cố định</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="discountValue"
                    label="Giá trị giảm"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá trị giảm" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        form.getFieldValue("discountType") === "percentage"
                          ? `${value}%`
                          : `${value} VND`
                      }
                      parser={(value) =>
                        form.getFieldValue("discountType") === "percentage"
                          ? value.replace("%", "")
                          : value.replace(" VND", "")
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="minAmount"
                    label="Khóa học tối thiểu"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập khóa học tối thiểu",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) => `${value} VND`}
                      parser={(value) => value.replace(" VND", "")}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxDiscount"
                    label="Giảm giá tối đa"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giảm giá tối đa",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) => `${value} VND`}
                      parser={(value) => value.replace(" VND", "")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    label="Ngày bắt đầu"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endDate"
                    label="Ngày kết thúc"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày kết thúc",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="usageLimit"
                    label="Số lần sử dụng tối đa"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lần sử dụng tối đa",
                      },
                    ]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="isActive"
                    label="Trạng thái"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PromotionCodes;
