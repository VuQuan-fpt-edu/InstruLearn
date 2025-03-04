import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "antd";
import {
  WalletOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTopupModalVisible, setIsTopupModalVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const learnerId = localStorage.getItem("learnerId");

        if (!token || !learnerId) {
          throw new Error("Bạn chưa đăng nhập");
        }

        setLoading(true);
        const response = await axios.get(
          `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/${learnerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.isSucceed) {
          setWalletData(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Không thể lấy thông tin ví"
          );
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin ví");
        message.error(err.message || "Không thể tải thông tin ví");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleRefreshWallet = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const learnerId = localStorage.getItem("learnerId");

      const response = await axios.get(
        `https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/${learnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSucceed) {
        setWalletData(response.data.data);
        message.success("Đã làm mới thông tin ví");
      }
    } catch (error) {
      message.error("Không thể làm mới thông tin ví");
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = () => {
    setIsTopupModalVisible(true);
  };

  const handleTopupConfirm = async () => {
    if (!topupAmount || topupAmount < 1000) {
      message.error("Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000đ)");
      return;
    }

    try {
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
        const { paymentUrl, transactionId } = response.data.data;

        window.open(paymentUrl, "_blank");

        setIsTopupModalVisible(false);
        setTopupAmount(null);

        message.success("Đang chuyển đến trang thanh toán");
      } else {
        message.error(response.data.message || "Nạp tiền không thành công");
      }
    } catch (error) {
      console.error("Topup error:", error);
      message.error("Có lỗi xảy ra khi nạp tiền");
    }
  };

  if (error) {
    return (
      <Card className="shadow-lg rounded-lg">
        <Alert
          message="Lỗi Truy Cập"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center">
          <WalletOutlined className="text-purple-700 mr-2" />
          <span>Ví của tôi</span>
        </div>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefreshWallet}
          type="text"
        >
          Làm mới
        </Button>
      }
      className="shadow-lg rounded-lg"
    >
      <div className="text-center">
        <Statistic
          title="Số Dư Hiện Tại"
          value={walletData?.balance || 0}
          precision={0}
          suffix="đ"
          valueStyle={{
            color: "#722ed1",
            fontSize: "3rem",
            fontWeight: "bold",
          }}
        />

        <div className="mt-6 flex justify-center space-x-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleTopup}
            size="large"
            className="bg-purple-700 hover:bg-purple-800"
          >
            Nạp Tiền
          </Button>
        </div>
      </div>

      <Modal
        title="Nạp Tiền Vào Ví"
        visible={isTopupModalVisible}
        onOk={handleTopupConfirm}
        onCancel={() => setIsTopupModalVisible(false)}
        okText="Xác Nhận"
        cancelText="Huỷ"
      >
        <Form layout="vertical">
          <Form.Item
            label="Số Tiền Nạp"
            required
            rules={[{ required: true, message: "Vui lòng nhập số tiền nạp" }]}
          >
            <Input
              type="number"
              placeholder="Nhập số tiền muốn nạp (tối thiểu 1,000đ)"
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              addonAfter="đ"
              min={1000}
              step={1000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WalletComponent;
