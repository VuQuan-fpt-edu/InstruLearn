import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Typography, Button, message, Statistic, Alert } from "antd";
import {
  WalletOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          `https://instrulearnapplication.azurewebsites.net/api/wallet/${learnerId}`,
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
        `https://instrulearnapplication.azurewebsites.net/api/wallet/${learnerId}`,
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
    navigate("/profile/topup");
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
    </Card>
  );
};

export default WalletComponent;
