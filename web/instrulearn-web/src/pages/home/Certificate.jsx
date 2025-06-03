import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Row,
  Col,
  Tag,
  Button,
  Divider,
  message,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box } from "@mui/material";

const { Title, Text } = Typography;
const playfair = `'Playfair Display', serif`;
const roboto = `'Roboto', 'Helvetica Neue', Arial, 'Liberation Sans', sans-serif`;

const Certificate = () => {
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCertificate(id);
    } else {
      message.error("Không tìm thấy chứng chỉ");
      setLoading(false);
    }
  }, [id]);

  const fetchCertificate = async (certId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Certification/${certId}`
      );
      const data = await res.json();
      if (data.isSucceed && data.data) {
        setCertificate(data.data);
      } else {
        message.error(data.message || "Không thể lấy chứng chỉ");
      }
    } catch (err) {
      message.error("Lỗi khi tải chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Text type="danger">Không tìm thấy chứng chỉ</Text>
      </div>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f7f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: roboto,
      }}
    >
      <Card
        bordered={false}
        style={{
          maxWidth: 800,
          width: "100%",
          boxShadow: "0 8px 32px #0002",
          borderRadius: 36,
          border: "6px solid #FFD700",
          background:
            "linear-gradient(135deg, #fffbe6 0%, #fff 60%, #f7f7f7 100%)",
          padding: 0,
        }}
        className="certificate-card"
        bodyStyle={{ padding: 0 }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 7 },
            textAlign: "center",
            fontFamily: roboto,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ color: "#52c41a", fontSize: 70, mb: 2 }}
          />
          <Title
            level={1}
            style={{
              color: "#1a237e",
              fontFamily: playfair,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 0,
              marginTop: 8,
              fontSize: 48,
              textShadow: "0 2px 8px #ffd70055",
            }}
          >
            GIẤY CHỨNG NHẬN
          </Title>
          <Text
            style={{
              color: "#888",
              fontSize: 22,
              fontFamily: roboto,
              marginBottom: 16,
              display: "block",
              letterSpacing: 1,
            }}
          >
            Chứng chỉ của InstruLearn
          </Text>
          <Divider
            style={{
              borderColor: "#FFD700",
              margin: "18px 0 32px 0",
              borderWidth: 2,
            }}
          />
          <Title
            level={3}
            style={{
              color: "#222",
              fontFamily: playfair,
              fontWeight: 600,
              marginBottom: 36,
              fontSize: 30,
              textShadow: "0 1px 4px #ffd70033",
            }}
          >
            {certificate.certificationName}
          </Title>
          <Row gutter={[32, 32]} justify="center" style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} className="text-center">
              <Text
                strong
                style={{ fontSize: 20, color: "#333", fontFamily: roboto }}
              >
                Học viên
              </Text>
              <div
                style={{
                  fontSize: 26,
                  marginTop: 4,
                  fontFamily: playfair,
                  color: "#1a237e",
                  fontWeight: 600,
                }}
              >
                {certificate.learner?.fullName || "-"}
              </div>
            </Col>
            <Col xs={24} sm={12} className="text-center">
              <Text
                strong
                style={{ fontSize: 20, color: "#333", fontFamily: roboto }}
              >
                Giáo viên
              </Text>
              <div
                style={{
                  fontSize: 22,
                  marginTop: 4,
                  fontFamily: playfair,
                  color: "#333",
                  fontWeight: 500,
                }}
              >
                {certificate.teacherName}
              </div>
            </Col>
            <Col xs={24} sm={12} className="text-center">
              <Text
                strong
                style={{ fontSize: 20, color: "#333", fontFamily: roboto }}
              >
                Môn học
              </Text>
              <div style={{ marginTop: 4 }}>
                <Tag
                  color="#1a237e"
                  style={{
                    fontSize: 20,
                    padding: "6px 32px",
                    borderRadius: 10,
                    background: "#e3eaff",
                    color: "#1a237e",
                    fontWeight: 600,
                  }}
                >
                  {certificate.subject}
                </Tag>
              </div>
            </Col>
            <Col xs={24} sm={12} className="text-center">
              <Text
                strong
                style={{ fontSize: 20, color: "#333", fontFamily: roboto }}
              >
                Ngày cấp
              </Text>
              <div
                style={{
                  fontSize: 20,
                  marginTop: 4,
                  fontFamily: playfair,
                  color: "#333",
                  fontWeight: 500,
                }}
              >
                {dayjs(certificate.issueDate).format("DD/MM/YYYY")}
              </div>
            </Col>
          </Row>
          <Divider
            style={{
              borderColor: "#FFD700",
              margin: "32px 0 16px 0",
              borderWidth: 2,
            }}
          />
          <div className="text-center mt-8">
            <Button
              type="primary"
              size="large"
              style={{
                borderRadius: 24,
                fontWeight: 600,
                fontSize: 20,
                padding: "8px 48px",
                background: "linear-gradient(90deg,#ffd700 0%,#ffb300 100%)",
                color: "#222",
                border: "none",
                boxShadow: "0 2px 8px #ffd70044",
              }}
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          </div>
        </Box>
      </Card>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap');
        .certificate-card {
          box-shadow: 0 8px 32px #0002 !important;
        }
      `}</style>
    </Box>
  );
};

export default Certificate;
