import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Divider,
  Space,
  Steps,
  message,
  Descriptions,
  Alert,
  Modal,
  Input,
  Form,
  Radio,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Spin,
  Image,
} from "antd";
import {
  CreditCardOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BankOutlined,
  DollarOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const CoursePaymentPage = () => {
  // Thông tin khóa học cần thanh toán
  const [courseInfo, setCourseInfo] = useState({
    id: 123,
    name: "Advanced React Development",
    instructor: "Nguyễn Văn A",
    category: "Web Development",
    price: 599000, // VND
    duration: "8 tuần",
    level: "Trung cấp",
    image: "https://via.placeholder.com/150",
    description:
      "Khóa học React nâng cao cung cấp kiến thức chuyên sâu về React Hooks, Context API, Redux và các kỹ thuật tối ưu hóa hiệu suất.",
  });

  // Thông tin ví người dùng
  const [walletInfo, setWalletInfo] = useState({
    balance: 350000, // VND
    lastRecharge: "2025-03-01",
    transactions: [],
  });

  // Trạng thái của quá trình thanh toán
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  // State cho modal nạp tiền
  const [isRechargeModalVisible, setIsRechargeModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [isProcessingRecharge, setIsProcessingRecharge] = useState(false);

  // Kiểm tra số dư ví
  const isBalanceSufficient = walletInfo.balance >= courseInfo.price;

  // Tính toán số tiền cần nạp thêm
  const requiredAdditionalAmount = isBalanceSufficient
    ? 0
    : courseInfo.price - walletInfo.balance;

  // Xử lý các phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Mở modal nạp tiền
  const showRechargeModal = () => {
    setIsRechargeModalVisible(true);
    setRechargeAmount(requiredAdditionalAmount);
  };

  // Xử lý nạp tiền
  const handleRecharge = () => {
    setIsProcessingRecharge(true);

    // Giả lập quá trình nạp tiền
    setTimeout(() => {
      const newBalance = walletInfo.balance + parseInt(rechargeAmount);
      setWalletInfo({
        ...walletInfo,
        balance: newBalance,
        transactions: [
          {
            id: Date.now(),
            type: "recharge",
            amount: parseInt(rechargeAmount),
            date: new Date().toISOString(),
            status: "completed",
          },
          ...walletInfo.transactions,
        ],
      });
      setIsProcessingRecharge(false);
      setIsRechargeModalVisible(false);
      message.success("Nạp tiền thành công! Số dư ví đã được cập nhật.");
    }, 2000);
  };

  // Xử lý thanh toán
  const handlePayment = () => {
    setIsLoadingPayment(true);

    // Giả lập quá trình thanh toán
    setTimeout(() => {
      if (paymentMethod === "wallet") {
        // Trừ tiền từ ví
        if (isBalanceSufficient) {
          const newBalance = walletInfo.balance - courseInfo.price;
          setWalletInfo({
            ...walletInfo,
            balance: newBalance,
            transactions: [
              {
                id: Date.now(),
                type: "payment",
                courseId: courseInfo.id,
                amount: courseInfo.price,
                date: new Date().toISOString(),
                status: "completed",
              },
              ...walletInfo.transactions,
            ],
          });
          setPaymentSuccess(true);
          setPaymentId(`PAY-${Date.now()}`);
          message.success(
            "Thanh toán thành công! Bạn đã đăng ký khóa học thành công."
          );
        } else {
          message.error(
            "Số dư không đủ để thanh toán. Vui lòng nạp thêm tiền vào ví."
          );
        }
      } else {
        // Xử lý các phương thức thanh toán khác
        setPaymentSuccess(true);
        setPaymentId(`PAY-${Date.now()}`);
        message.success(
          "Thanh toán thành công! Bạn đã đăng ký khóa học thành công."
        );
      }

      setIsLoadingPayment(false);
      setCurrentStep(2);
    }, 3000);
  };

  // Các bước trong quy trình thanh toán
  const steps = [
    {
      title: "Xác nhận thông tin",
      icon: <InfoCircleOutlined />,
    },
    {
      title: "Thanh toán",
      icon: <CreditCardOutlined />,
    },
    {
      title: "Hoàn tất",
      icon: <CheckCircleOutlined />,
    },
  ];

  // Xử lý chuyển bước
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Render nội dung theo từng bước
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="mt-6 mb-4">
            <Row gutter={24}>
              <Col span={8}>
                <Image
                  src={courseInfo.image}
                  alt={courseInfo.name}
                  className="rounded-lg"
                  preview={false}
                />
              </Col>
              <Col span={16}>
                <Title level={4}>{courseInfo.name}</Title>
                <Space direction="horizontal" size="middle" className="mb-4">
                  <Tag color="blue">{courseInfo.category}</Tag>
                  <Tag color="green">{courseInfo.level}</Tag>
                  <Tag color="purple">{courseInfo.duration}</Tag>
                </Space>
                <Paragraph className="mb-4">
                  <Text strong>Giảng viên:</Text> {courseInfo.instructor}
                </Paragraph>
                <Paragraph>{courseInfo.description}</Paragraph>
                <Divider />
                <div className="flex justify-between items-center">
                  <Text strong>Học phí:</Text>
                  <Title level={3} className="text-red-500 m-0">
                    {formatCurrency(courseInfo.price)}
                  </Title>
                </div>
              </Col>
            </Row>
          </Card>
        );

      case 1:
        return (
          <div>
            <Row gutter={24} className="mt-6">
              <Col span={16}>
                <Card title="Phương thức thanh toán" className="mb-4">
                  <Form layout="vertical">
                    <Form.Item>
                      <Radio.Group
                        onChange={handlePaymentMethodChange}
                        value={paymentMethod}
                        className="w-full"
                      >
                        <Space direction="vertical" className="w-full">
                          <Radio
                            value="wallet"
                            className="p-4 w-full border rounded mb-2"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <Text strong>
                                  <WalletOutlined /> Ví của tôi
                                </Text>
                                <div>
                                  <Text type="secondary">
                                    Thanh toán bằng số dư trong ví
                                  </Text>
                                </div>
                              </div>
                              <div>
                                <Tag
                                  color={isBalanceSufficient ? "green" : "red"}
                                >
                                  Số dư: {formatCurrency(walletInfo.balance)}
                                </Tag>
                              </div>
                            </div>
                          </Radio>
                          <Radio
                            value="bank"
                            className="p-4 w-full border rounded mb-2"
                          >
                            <Text strong>
                              <BankOutlined /> Chuyển khoản ngân hàng
                            </Text>
                            <div>
                              <Text type="secondary">
                                Chuyển khoản trực tiếp qua ngân hàng
                              </Text>
                            </div>
                          </Radio>
                          <Radio
                            value="creditCard"
                            className="p-4 w-full border rounded mb-2"
                          >
                            <Text strong>
                              <CreditCardOutlined /> Thẻ tín dụng / Thẻ ghi nợ
                            </Text>
                            <div>
                              <Text type="secondary">
                                Thanh toán bằng Visa, Mastercard, JCB
                              </Text>
                            </div>
                          </Radio>
                          <Radio
                            value="momo"
                            className="p-4 w-full border rounded"
                          >
                            <Text strong>
                              <DollarOutlined /> Ví MoMo
                            </Text>
                            <div>
                              <Text type="secondary">
                                Thanh toán qua ví điện tử MoMo
                              </Text>
                            </div>
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                  </Form>

                  {paymentMethod === "wallet" && !isBalanceSufficient && (
                    <Alert
                      message="Số dư không đủ"
                      description={
                        <div>
                          <p>
                            Số dư hiện tại của bạn không đủ để thanh toán khóa
                            học này.
                          </p>
                          <p>
                            Cần thanh toán: {formatCurrency(courseInfo.price)}
                          </p>
                          <p>
                            Số dư hiện tại: {formatCurrency(walletInfo.balance)}
                          </p>
                          <p>
                            Cần nạp thêm:{" "}
                            {formatCurrency(requiredAdditionalAmount)}
                          </p>
                          <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={showRechargeModal}
                          >
                            Nạp thêm tiền
                          </Button>
                        </div>
                      }
                      type="warning"
                      showIcon
                      className="mt-4"
                    />
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Chi tiết thanh toán" className="mb-4">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Khóa học">
                      {courseInfo.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá gốc">
                      {formatCurrency(courseInfo.price)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giảm giá">
                      {formatCurrency(0)}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label="Tổng thanh toán"
                      className="font-bold"
                    >
                      <Text strong className="text-red-500">
                        {formatCurrency(courseInfo.price)}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  <div className="text-right">
                    <Button
                      type="primary"
                      size="large"
                      onClick={handlePayment}
                      disabled={
                        paymentMethod === "wallet" && !isBalanceSufficient
                      }
                      loading={isLoadingPayment}
                      icon={<LockOutlined />}
                      block
                    >
                      Thanh toán ngay
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div className="text-center py-8">
            {paymentSuccess ? (
              <Card className="mt-6">
                <div className="text-center">
                  <CheckCircleOutlined
                    style={{ fontSize: 72, color: "#52c41a" }}
                  />
                  <Title level={2}>Thanh toán thành công!</Title>
                  <Text>Cảm ơn bạn đã đăng ký khóa học {courseInfo.name}.</Text>

                  <Divider />

                  <Descriptions
                    title="Thông tin thanh toán"
                    bordered
                    layout="vertical"
                    className="mt-4 text-left"
                  >
                    <Descriptions.Item label="Mã thanh toán">
                      {paymentId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức">
                      {paymentMethod === "wallet"
                        ? "Ví của tôi"
                        : paymentMethod === "bank"
                        ? "Chuyển khoản ngân hàng"
                        : paymentMethod === "creditCard"
                        ? "Thẻ tín dụng/ghi nợ"
                        : "Ví MoMo"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày thanh toán">
                      {new Date().toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số tiền">
                      {formatCurrency(courseInfo.price)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color="green">Thành công</Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-8">
                    <Space size="large">
                      <Button type="primary" size="large" href="/learning/123">
                        Bắt đầu học ngay <ArrowRightOutlined />
                      </Button>
                      <Button size="large" href="/my-courses">
                        Xem khóa học của tôi
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
            ) : (
              <div>
                <ExclamationCircleOutlined
                  style={{ fontSize: 72, color: "#ff4d4f" }}
                />
                <Title level={2}>Thanh toán không thành công</Title>
                <Text>
                  Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.
                </Text>
                <div className="mt-4">
                  <Button type="primary" onClick={() => setCurrentStep(1)}>
                    Thử lại
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ShoppingCartOutlined className="text-blue-500 text-xl mr-2" />
          <Title level={3} className="m-0">
            Thanh toán khóa học
          </Title>
        </div>
        <div>
          <Space>
            <WalletOutlined />
            <Text strong>Số dư ví:</Text>
            <Statistic
              value={walletInfo.balance}
              precision={0}
              valueStyle={{
                color: isBalanceSufficient ? "#3f8600" : "#cf1322",
              }}
              suffix="VNĐ"
            />
          </Space>
        </div>
      </div>

      <Card>
        <Steps current={currentStep}>
          {steps.map((step) => (
            <Step key={step.title} title={step.title} icon={step.icon} />
          ))}
        </Steps>
      </Card>

      {renderStepContent()}

      {currentStep < 2 && (
        <div className="flex justify-between mt-4">
          <Button onClick={handlePrevious} disabled={currentStep === 0}>
            Quay lại
          </Button>
          <Button
            type="primary"
            onClick={handleNext}
            disabled={currentStep === 1}
          >
            Tiếp tục
          </Button>
        </div>
      )}

      {/* Modal nạp tiền */}
      <Modal
        title="Nạp tiền vào ví"
        visible={isRechargeModalVisible}
        onCancel={() => setIsRechargeModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsRechargeModalVisible(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isProcessingRecharge}
            onClick={handleRecharge}
          >
            Nạp tiền
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item
            label="Số tiền cần nạp"
            required
            help="Mức tối thiểu là 100,000 VNĐ"
          >
            <Input
              type="number"
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              min={100000}
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
            />
          </Form.Item>

          <Divider />

          <Form.Item label="Phương thức nạp tiền">
            <Radio.Group defaultValue="creditCard">
              <Space direction="vertical">
                <Radio value="creditCard">Thẻ tín dụng / Thẻ ghi nợ</Radio>
                <Radio value="bank">Chuyển khoản ngân hàng</Radio>
                <Radio value="momo">Ví MoMo</Radio>
                <Radio value="zalopay">ZaloPay</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursePaymentPage;
