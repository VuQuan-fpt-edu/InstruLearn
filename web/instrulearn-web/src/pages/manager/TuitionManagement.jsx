import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Button,
  Select,
  Modal,
  Tooltip,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import MTypography from "@mui/material/Typography";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const TuitionManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("tuition-management");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classPaymentStatus, setClassPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    learner: null,
  });
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Class/get-all"
      );
      setClasses(res.data?.data || res.data || []);
    } catch (e) {
      setClasses([]);
      message.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassPaymentStatus = async (classId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/Payment/class-payment-status/${classId}`
      );
      setClassPaymentStatus(res.data?.data || null);
    } catch (e) {
      setClassPaymentStatus(null);
      message.error("Không thể tải trạng thái thanh toán lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (value) => {
    setSelectedClassId(value);
    setClassPaymentStatus(null);
    fetchClassPaymentStatus(value);
  };

  const handleConfirmPayment = (learner) => {
    setConfirmModal({ visible: true, learner });
  };

  const doConfirmPayment = async () => {
    if (!confirmModal.learner) return;
    try {
      setConfirming(true);
      await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/Payment/confirm-class-remaining-payment",
        {
          learnerId: confirmModal.learner.learnerId,
          classId: selectedClassId,
        }
      );
      setConfirmModal({ visible: false, learner: null });
      setSuccessModal(true);
    } catch (e) {
      message.error(e?.response?.data?.message || "Xác nhận thất bại");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
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
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50" style={{ marginTop: 64 }}>
          <Box maxWidth={1200} mx="auto">
            <MTypography variant="h4" fontWeight={700} mb={3} color="#1677ff">
              <DollarOutlined style={{ marginRight: 8 }} /> Quản lý học phí lớp
              học
            </MTypography>
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={2}>
                  <MTypography fontWeight={600}>Chọn lớp:</MTypography>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Select
                    showSearch
                    style={{ width: "100%", maxWidth: 400 }}
                    placeholder="Chọn lớp học"
                    onChange={handleClassChange}
                    loading={loading}
                    value={selectedClassId}
                    filterOption={(input, option) =>
                      (option?.children ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {classes.map((c) => (
                      <Option key={c.classId} value={c.classId}>
                        {c.className} | GV: {c.teacherName} | Trình độ:{" "}
                        {c.levelName}
                      </Option>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            </Paper>

            {classPaymentStatus && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={2}
                    sx={{ p: 3, borderRadius: 3, minHeight: 400 }}
                  >
                    <MTypography
                      variant="h6"
                      fontWeight={700}
                      color="#faad14"
                      mb={2}
                    >
                      Học viên đã đóng 10%
                    </MTypography>
                    <Divider sx={{ mb: 2 }} />
                    <Table
                      columns={[
                        {
                          title: "Học viên",
                          dataIndex: "learnerName",
                          key: "learnerName",
                          render: (text) => <b>{text}</b>,
                        },
                        {
                          title: "Số tiền đã đóng",
                          dataIndex: "amountPaid",
                          key: "amountPaid",
                          render: (value) => (
                            <span style={{ color: "#1677ff", fontWeight: 600 }}>
                              {value?.toLocaleString()} VNĐ
                            </span>
                          ),
                        },
                        {
                          title: "% đã đóng",
                          dataIndex: "paymentPercentage",
                          key: "paymentPercentage",
                        },
                        {
                          title: "Còn lại",
                          dataIndex: "remainingAmount",
                          key: "remainingAmount",
                          render: (value) => (
                            <span style={{ color: "#faad14", fontWeight: 600 }}>
                              {value?.toLocaleString()} VNĐ
                            </span>
                          ),
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => (
                            <Tag
                              color={status === "Accepted" ? "blue" : "default"}
                            >
                              {status === "Accepted" ? "Đã đóng 10%" : status}
                            </Tag>
                          ),
                        },
                        {
                          title: "Hành động",
                          key: "action",
                          render: (_, record) => (
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() => handleConfirmPayment(record)}
                            >
                              Xác nhận đủ
                            </Button>
                          ),
                        },
                      ]}
                      dataSource={
                        classPaymentStatus.partiallyPaidLearners || []
                      }
                      rowKey="learnerId"
                      pagination={false}
                      locale={{ emptyText: "Không có học viên nào" }}
                      size="middle"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={2}
                    sx={{ p: 3, borderRadius: 3, minHeight: 400 }}
                  >
                    <MTypography
                      variant="h6"
                      fontWeight={700}
                      color="#52c41a"
                      mb={2}
                    >
                      Học viên đã thanh toán đủ
                    </MTypography>
                    <Divider sx={{ mb: 2 }} />
                    <Table
                      columns={[
                        {
                          title: "Học viên",
                          dataIndex: "learnerName",
                          key: "learnerName",
                          render: (text) => <b>{text}</b>,
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          key: "status",
                          render: () => (
                            <Tag color="success">
                              <CheckCircleOutlined /> Đã thanh toán đủ
                            </Tag>
                          ),
                        },
                      ]}
                      dataSource={classPaymentStatus.fullyPaidLearners || []}
                      rowKey="learnerId"
                      pagination={false}
                      locale={{ emptyText: "Không có học viên nào" }}
                      size="middle"
                    />
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Modal xác nhận thanh toán đủ */}
            <Modal
              open={confirmModal.visible}
              onCancel={() =>
                setConfirmModal({ visible: false, learner: null })
              }
              onOk={doConfirmPayment}
              okText="Xác nhận thanh toán đủ"
              confirmLoading={confirming}
              cancelText="Hủy"
              title="Xác nhận thanh toán đủ cho học viên"
              centered
            >
              <div>
                Bạn có chắc chắn muốn xác nhận học viên{" "}
                <b>{confirmModal.learner?.learnerName}</b> đã thanh toán đủ học
                phí?
              </div>
            </Modal>
            {/* Modal thành công */}
            <Modal
              open={successModal}
              onCancel={() => {
                setSuccessModal(false);
                fetchClassPaymentStatus(selectedClassId);
              }}
              footer={[
                <Button
                  key="close"
                  type="primary"
                  onClick={() => {
                    setSuccessModal(false);
                    fetchClassPaymentStatus(selectedClassId);
                  }}
                >
                  Đóng
                </Button>,
              ]}
              centered
            >
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
                />
                <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                  Xác nhận thanh toán đủ thành công!
                </div>
                <div>Trạng thái học phí của học viên đã được cập nhật.</div>
              </div>
            </Modal>
          </Box>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TuitionManagement;
