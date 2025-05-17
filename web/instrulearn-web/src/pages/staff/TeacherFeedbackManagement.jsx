import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Table,
  Button,
  Modal,
  Tag,
  Spin,
  Avatar,
} from "antd";
import { StarOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";
import StaffHeader from "../../components/staff/StaffHeader";
import StaffSidebar from "../../components/staff/StaffSidebar";
import axios from "axios";
import QuizIcon from "@mui/icons-material/Quiz";
import DoneIcon from "@mui/icons-material/Done";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { blue, green } from "@mui/material/colors";

const { Content } = Layout;
const { Title } = Typography;

const TeacherFeedbackManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(
    "teacher-feedback-management"
  );
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/get-all"
      );
      if (res.data?.isSucceed) {
        setFeedbacks(res.data.data || []);
      }
    } catch (err) {
      // eslint-disable-next-line
      message.error("Không thể tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedFeedback(record);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "learnerName",
      key: "learnerName",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ background: "#e3f2fd", color: "#1976d2" }}
          />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{text}</span>
        </div>
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "completedAt",
      key: "completedAt",
      render: (date) =>
        date ? (
          new Date(date).toLocaleString("vi-VN")
        ) : (
          <span style={{ color: "#aaa" }}>Chưa hoàn thành</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (val) =>
        val === 2 ? (
          <Tag color="success">Đã đánh giá</Tag>
        ) : (
          <Tag color="default">Chưa đánh giá</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          type="primary"
          ghost
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen" style={{ background: "#f6f8fa" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout>
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="p-6"
          style={{
            minHeight: "100vh",
            background: "#f6f8fa",
            marginLeft: collapsed ? 80 : 250,
            transition: "all 0.2s",
            marginTop: "64px",
          }}
        >
          <Card
            className="mb-6 shadow-lg"
            style={{ borderRadius: 18, padding: 24, background: "#fff" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <StarOutlined style={{ fontSize: 32, color: "#1976d2" }} />
              <Title
                level={3}
                style={{ margin: 0, fontWeight: 700, color: "#222" }}
              >
                Quản lý phản hồi giáo viên với học viên
              </Title>
            </div>
          </Card>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px #e3f2fd",
              background: "#fff",
            }}
          >
            <Table
              columns={columns}
              dataSource={feedbacks}
              rowKey="evaluationFeedbackId"
              loading={loading}
              pagination={{
                position: ["bottomCenter"],
                style: { marginTop: 24 },
              }}
              bordered={false}
              rowClassName={() => "hover-row"}
            />
          </Card>
          <style>{`
            .hover-row:hover td {
              background: #f0f7ff !important;
              transition: background 0.2s;
            }
          `}</style>
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <QuizIcon style={{ color: blue[700], fontSize: 32 }} />
                <span style={{ fontWeight: 600, fontSize: 22 }}>
                  Chi tiết phản hồi: {selectedFeedback?.learnerName}
                </span>
              </div>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={() => setModalVisible(false)}
            okText="Đóng"
            width={600}
            centered
          >
            {selectedFeedback ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontWeight: 500, fontSize: 16 }}>
                    Học viên đã đạt mục tiêu chưa?
                  </span>
                  <Tag
                    color={
                      selectedFeedback?.goalsAchieved ? "success" : "error"
                    }
                    style={{
                      marginLeft: 12,
                      fontSize: 15,
                      padding: "4px 16px",
                      borderRadius: 16,
                    }}
                    icon={
                      selectedFeedback?.goalsAchieved ? (
                        <CheckCircleIcon style={{ color: green[600] }} />
                      ) : (
                        <HighlightOffIcon style={{ color: "#f44336" }} />
                      )
                    }
                  >
                    {selectedFeedback?.goalsAchieved ? "Đạt" : "Chưa đạt"}
                  </Tag>
                </div>
                <div
                  style={{
                    background: "#f5f7fa",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  {selectedFeedback?.answers?.map((ans) => (
                    <div
                      key={ans.evaluationAnswerId}
                      style={{
                        marginBottom: 18,
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        <QuizIcon
                          style={{ color: blue[400], marginRight: 6 }}
                        />
                        {ans.questionText}
                      </div>
                      <Tag
                        color="processing"
                        style={{
                          fontSize: 14,
                          padding: "4px 16px",
                          borderRadius: 16,
                          marginTop: 4,
                          background: "#e3f2fd",
                          color: "#1976d2",
                          border: "none",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        icon={
                          <DoneIcon
                            style={{ color: green[600], marginRight: 4 }}
                          />
                        }
                      >
                        {ans.selectedOptionText}
                      </Tag>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Spin />
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherFeedbackManagement;
