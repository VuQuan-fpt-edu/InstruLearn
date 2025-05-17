import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  message,
  Statistic,
  Modal,
  Input,
  Form,
  Alert,
  Divider,
  Radio,
  Space,
} from "antd";
import {
  WalletOutlined,
  ReloadOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const { Text } = Typography;

const TopUp = () => {
  const [topupAmount, setTopupAmount] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("payos");
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý callback từ PayOS
  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Lấy URL hiện tại
        const currentUrl = window.location.href;
        console.log("Current URL:", currentUrl);

        // Decode URL trước khi parse
        const decodedSearch = decodeURIComponent(window.location.search);
        console.log("Decoded search:", decodedSearch);

        // Parse URL để lấy tất cả các params
        const urlParams = new URLSearchParams(decodedSearch);

        // Lấy orderCode và status từ URL
        const orderCode = urlParams.get("orderCode");
        const status = urlParams.get("status");

        console.log("Extracted payment info:", { orderCode, status });

        if (orderCode && status) {
          const token = localStorage.getItem("authToken");

          console.log("Calling API with:", {
            orderCode: parseInt(orderCode),
            status: status,
          });

          try {
            // Gọi API cập nhật trạng thái thanh toán
            const response = await axios.put(
              `https://instrulearnapplication.azurewebsites.net/api/wallet/update-payment-status-by-ordercode`,
              {
                orderCode: parseInt(orderCode),
                status: status,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("API Response:", response.data);

            if (response.data.isSucceed) {
              message.success("Cập nhật trạng thái thanh toán thành công");
              // Đợi message hiển thị xong rồi mới chuyển hướng
              setTimeout(() => {
                navigate("/profile");
              }, 1500);
            } else {
              message.error(
                response.data.message ||
                  "Cập nhật trạng thái thanh toán thất bại"
              );
              setTimeout(() => {
                navigate("/profile");
              }, 1500);
            }
          } catch (error) {
            console.error("API call error:", error.response?.data || error);
            message.error("Có lỗi xảy ra khi cập nhật trạng thái thanh toán");
            setTimeout(() => {
              navigate("/profile");
            }, 1500);
          }
        } else {
          console.log("Missing required params:", { orderCode, status });
        }
      } catch (error) {
        console.error("Error processing payment callback:", error);
        message.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
      }
    };

    // Kiểm tra URL ngay khi component mount
    const decodedSearch = decodeURIComponent(window.location.search);
    const urlParams = new URLSearchParams(decodedSearch);

    // Log tất cả các params để debug
    const allParams = {};
    urlParams.forEach((value, key) => {
      allParams[key] = value;
    });
    console.log("All URL params:", allParams);

    // Kiểm tra cụ thể orderCode và status
    const orderCode = urlParams.get("orderCode");
    const status = urlParams.get("status");

    console.log("Payment params check:", {
      orderCode,
      status,
      hasOrderCode: !!orderCode,
      hasStatus: !!status,
    });

    if (orderCode && status) {
      console.log("Found payment params, handling callback...");
      handlePaymentCallback();
    }
  }, [navigate, location.search]); // Thêm location.search vào dependencies

  const handleTopup = async () => {
    if (!topupAmount || topupAmount < 1000) {
      message.error("Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000đ)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      // Tạo returnUrl là URL của trang TopUp
      const returnUrl = `${window.location.origin}/topup`;
      console.log("Return URL:", returnUrl);

      const response = await axios.post(
        `https://instrulearnapplication.azurewebsites.net/api/wallet/add-funds`,
        {
          learnerId: Number(learnerId),
          amount: topupAmount,
          returnUrl: returnUrl, // Thêm returnUrl vào request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        const { paymentUrl } = response.data.data;
        // Chuyển hướng trực tiếp đến trang thanh toán
        window.location.href = paymentUrl;
        message.success("Đang chuyển đến trang thanh toán");
      } else {
        message.error(response.data.message || "Nạp tiền không thành công");
      }
    } catch (error) {
      console.error("Topup error:", error);
      message.error("Có lỗi xảy ra khi nạp tiền");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = async () => {
    if (!topupAmount || topupAmount < 1000) {
      message.error("Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000đ)");
      return;
    }

    setIsPaymentModalVisible(true);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      let response;
      if (paymentMethod === "payos") {
        // Xử lý thanh toán qua PayOS
        const returnUrl = `${window.location.origin}/topup`;
        response = await axios.post(
          `https://instrulearnapplication.azurewebsites.net/api/wallet/add-funds`,
          {
            learnerId: Number(learnerId),
            amount: topupAmount,
            returnUrl: returnUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Xử lý thanh toán qua VNPay
        response = await axios.post(
          `https://instrulearnapplication.azurewebsites.net/api/wallet/add-funds-vnpay`,
          {
            learnerId: Number(learnerId),
            amount: topupAmount,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.isSucceed) {
        const { paymentUrl } = response.data.data;
        setIsPaymentModalVisible(false);
        // Chuyển hướng trực tiếp đến trang thanh toán
        window.location.href = paymentUrl;
        message.success("Đang chuyển đến trang thanh toán");
      } else {
        message.error(response.data.message || "Nạp tiền không thành công");
      }
    } catch (error) {
      console.error("Payment error:", error);
      message.error("Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <Card className="shadow-lg rounded-lg">
        <div className="flex items-center mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            Quay lại
          </Button>
          <div className="flex items-center">
            <WalletOutlined className="text-purple-700 text-2xl mr-2" />
            <Typography.Title level={3} className="!mb-0">
              Nạp tiền vào ví
            </Typography.Title>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 mb-8">
          <div className="text-center">
            <Text className="text-lg text-gray-600 block mb-4">
              Vui lòng nhập số tiền muốn nạp vào ví
            </Text>
            <Form layout="vertical" className="max-w-md mx-auto">
              <Form.Item
                label="Số tiền nạp"
                required
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền nạp" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số tiền muốn nạp (tối thiểu 1,000đ)"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  addonAfter="đ"
                  min={1000}
                  step={1000}
                  size="large"
                />
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="text-center mb-4">
            <Text className="text-lg text-gray-600 block">
              Thông tin thanh toán
            </Text>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text className="text-gray-600">Số tiền nạp:</Text>
              <Text strong className="text-lg text-purple-600">
                {topupAmount ? `${topupAmount.toLocaleString()} đ` : "0 đ"}
              </Text>
            </div>
            <div className="flex justify-between items-center">
              <Text className="text-gray-600">Phí giao dịch:</Text>
              <Text className="text-green-600">Miễn phí</Text>
            </div>
            <Divider />
            <div className="flex justify-between items-center">
              <Text className="text-gray-600">Tổng cộng:</Text>
              <Text strong className="text-xl text-purple-600">
                {topupAmount ? `${topupAmount.toLocaleString()} đ` : "0 đ"}
              </Text>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handlePaymentMethodSelect}
            size="large"
            loading={loading}
            className="bg-purple-700 hover:bg-purple-800 px-8"
          >
            Nạp tiền ngay
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Text className="text-gray-500 block">
            Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán
          </Text>
        </div>

        {/* Modal chọn phương thức thanh toán */}
        <Modal
          title="Chọn phương thức thanh toán"
          open={isPaymentModalVisible}
          onOk={handlePayment}
          onCancel={() => setIsPaymentModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={loading}
        >
          <div className="py-4">
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="payos" className="w-full">
                  <div className="flex items-center justify-between w-full p-3 border rounded-lg">
                    <div>
                      <Text strong>PayOS</Text>
                      <Text className="block text-gray-500">
                        Thanh toán qua PayOS
                      </Text>
                    </div>
                    <img
                      src="https://payos.vn/docs/img/logo.svg"
                      alt="PayOS"
                      className="h-6"
                    />
                  </div>
                </Radio>
                <Radio value="vnpay" className="w-full">
                  <div className="flex items-center justify-between w-full p-3 border rounded-lg">
                    <div>
                      <Text strong>VNPay</Text>
                      <Text className="block text-gray-500">
                        Thanh toán qua VNPay
                      </Text>
                    </div>
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSutP9weqAPNNrV0V616bloZn2fwAdAOHqnFQ&s"
                      alt="VNPay"
                      className="h-6"
                    />
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </div>
          <div className="mt-4">
            <Alert
              message="Thông tin thanh toán"
              description={
                <div>
                  <p>Số tiền: {topupAmount?.toLocaleString()} đ</p>
                  <p>Phí giao dịch: Miễn phí</p>
                </div>
              }
              type="info"
            />
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default TopUp;
