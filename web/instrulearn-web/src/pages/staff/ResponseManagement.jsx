import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Typography,
  Card,
  Tag,
  Space,
  Tooltip,
  Spin,
  Modal,
} from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import axios from "axios";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;

const ResponseManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("response-management");
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/get-all"
      );
      if (response.data?.isSucceed) {
        setFeedbacks(response.data.data || []);
      } else {
        setFeedbacks([]);
      }
    } catch (error) {
      message.error("Không thể tải danh sách phản hồi");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "feedbackId",
      key: "feedbackId",
      width: 60,
      align: "center",
    },
    {
      title: "Học viên",
      dataIndex: "learnerName",
      key: "learnerName",
      width: 150,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 150,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : ""),
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "completedAt",
      key: "completedAt",
      width: 140,
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : ""),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (val) => {
        if (val === 0) return <Tag color="default">Chưa bắt đầu</Tag>;
        if (val === 1) return <Tag color="processing">Đang diễn ra</Tag>;
        if (val === 2) return <Tag color="success">Hoàn thành</Tag>;
        return <Tag color="default">Không xác định</Tag>;
      },
    },
    {
      title: "Nhận xét",
      dataIndex: "additionalComments",
      key: "additionalComments",
      width: 200,
      render: (val) =>
        val ? (
          <span>{val}</span>
        ) : (
          <span className="text-gray-400">Không có</span>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedFeedback(record);
              setModalVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedMenu={selectedMenu}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="p-6 min-h-screen bg-gray-50"
          style={{ marginTop: "64px" }}
        >
          <Card style={{ borderRadius: 12, padding: 16 }}>
            <div className="flex justify-between items-center mb-4">
              <Title level={3} style={{ margin: 0 }}>
                Quản lý phản hồi từ học viên
              </Title>
              <Space>
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchFeedbacks} />
                </Tooltip>
              </Space>
            </div>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={feedbacks}
                rowKey="feedbackId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} phản hồi`,
                }}
                style={{ borderRadius: 12 }}
              />
            </Spin>
          </Card>
          <Modal
            title="Chi tiết phản hồi"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={700}
            centered
          >
            {selectedFeedback && (
              <div>
                <div className="mb-2">
                  <b>Học viên:</b> {selectedFeedback.learnerName}
                </div>
                <div className="mb-2">
                  <b>Giáo viên:</b> {selectedFeedback.teacherName}
                </div>
                <div className="mb-2">
                  <b>Ngày gửi:</b>{" "}
                  {dayjs(selectedFeedback.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>
                <div className="mb-2">
                  <b>Ngày hoàn thành:</b>{" "}
                  {selectedFeedback.completedAt
                    ? dayjs(selectedFeedback.completedAt).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "-"}
                </div>

                <div className="mb-2">
                  <b>Nhận xét:</b>{" "}
                  {selectedFeedback.additionalComments || (
                    <span className="text-gray-400">Không có</span>
                  )}
                </div>
                <div className="mb-2">
                  <b>Các câu trả lời:</b>
                  <ul className="list-disc pl-6 mt-2">
                    {selectedFeedback.answers &&
                    selectedFeedback.answers.length > 0 ? (
                      selectedFeedback.answers.map((ans) => (
                        <li key={ans.answerId} className="mb-1">
                          <b>{ans.questionText}:</b>{" "}
                          <span className="text-green-700">
                            {ans.selectedOptionText}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">Không có câu trả lời</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ResponseManagement;
