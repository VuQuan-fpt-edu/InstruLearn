import React from "react";
import { Button, Card, Typography } from "antd";
import {
  CheckCircleTwoTone,
  HomeOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Box, Container, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f3e7fa 0%, #e3e6fd 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(80, 36, 180, 0.08)",
            padding: isMobile ? 16 : 32,
            textAlign: "center",
          }}
        >
          <CheckCircleTwoTone
            twoToneColor="#52c41a"
            style={{ fontSize: isMobile ? 64 : 96 }}
          />
          <Title
            level={isMobile ? 3 : 2}
            style={{ marginTop: 24, marginBottom: 8 }}
          >
            Thanh toán thành công!
          </Title>
          <Text type="secondary" style={{ fontSize: isMobile ? 16 : 18 }}>
            Cảm ơn bạn đã sử dụng dịch vụ của InstruLearn.
            <br />
            Giao dịch của bạn đã được xử lý thành công.
          </Text>
          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              type="primary"
              icon={<HomeOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ width: isMobile ? "100%" : 180 }}
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button>
            <Button
              icon={<WalletOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ width: isMobile ? "100%" : 180 }}
              onClick={() => navigate("/profile?tab=wallet")}
            >
              Xem ví của tôi
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;
