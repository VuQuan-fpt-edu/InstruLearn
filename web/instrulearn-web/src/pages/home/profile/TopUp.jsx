import React, { useState } from "react";
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
} from "antd";
import {
  WalletOutlined,
  ReloadOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Text } = Typography;

const TopUp = () => {
  const [topupAmount, setTopupAmount] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTopup = async () => {
    if (!topupAmount || topupAmount < 1000) {
      message.error("Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000đ)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      const response = await axios.post(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/add-funds`,
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

      if (response.data.isSucceed) {
        const { paymentUrl } = response.data.data;
        window.open(paymentUrl, "_blank");
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
            onClick={handleTopup}
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
      </Card>
    </div>
  );
};

export default TopUp;
