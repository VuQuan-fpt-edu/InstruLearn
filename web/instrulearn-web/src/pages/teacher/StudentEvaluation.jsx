import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Table,
  Button,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Tag,
  Avatar,
} from "antd";
import { UserOutlined, StarOutlined } from "@ant-design/icons";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import QuizIcon from "@mui/icons-material/Quiz";
import DoneIcon from "@mui/icons-material/Done";
import { blue, green, red } from "@mui/material/colors";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const StudentEvaluation = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("evaluation");
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEval, setSelectedEval] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [form] = Form.useForm();
  const [teacherId, setTeacherId] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  useEffect(() => {
    const fetchProfileAndEvaluations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Auth/Profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data?.isSucceed) {
          setTeacherId(res.data.data.teacherId);
          fetchEvaluations(res.data.data.teacherId);
        } else {
          message.error("Không thể lấy thông tin giáo viên");
        }
      } catch (err) {
        message.error("Không thể lấy thông tin giáo viên");
      }
    };
    fetchProfileAndEvaluations();
  }, []);

  const fetchEvaluations = async (teacherId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/by-teacher/${teacherId}`
      );
      if (res.data?.isSucceed) {
        setEvaluations(res.data.data || []);
      }
    } catch (err) {
      message.error("Không thể tải danh sách học viên cần đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (record) => {
    setSelectedEval(record);

    // Điều kiện: chưa đánh giá
    const isNotEvaluated =
      record.status !== 2 &&
      (!record.answers || record.answers.length === 0 || !record.completedAt);

    setViewOnly(!isNotEvaluated);

    if (isNotEvaluated) {
      try {
        const res = await axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/questions/active"
        );
        setQuestions(res.data.data || []);
        setModalVisible(true);
        form.resetFields();
      } catch (err) {
        message.error("Không thể tải câu hỏi đánh giá");
      }
    } else {
      setQuestions(
        record.answers.map((ans) => ({
          evaluationQuestionId: ans.evaluationQuestionId,
          questionText: ans.questionText,
          options: [
            {
              evaluationOptionId: ans.selectedOptionId,
              optionText: ans.selectedOptionText,
            },
          ],
        }))
      );
      setModalVisible(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const answers = questions.map((q) => ({
        evaluationQuestionId: q.evaluationQuestionId,
        selectedOptionId: values[`question_${q.evaluationQuestionId}`],
      }));
      await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/submit-evaluation-feedback",
        {
          learningRegistrationId: selectedEval.learningRegistrationId,
          learnerId: selectedEval.learnerId,
          goalsAchieved: values.goalsAchieved,
          answers,
        }
      );
      message.success("Đánh giá thành công!");
      setModalVisible(false);
      fetchEvaluations(teacherId);
    } catch (err) {
      message.error("Vui lòng điền đầy đủ thông tin!");
    }
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "learnerName",
      key: "learnerName",
      render: (text, record) => (
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
    { title: "Chuyên ngành", dataIndex: "majorName", key: "majorName" },
    {
      title: "Yêu cầu học",
      dataIndex: "learningRequest",
      key: "learningRequest",
      render: (text) => (
        <span style={{ color: "#1976d2", fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: "Số buổi",
      render: (_, r) => (
        <span
          style={{ fontWeight: 500 }}
        >{`${r.completedSessions}/${r.totalSessions}`}</span>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => {
        const isNotEvaluated =
          record.status !== 2 &&
          (!record.answers ||
            record.answers.length === 0 ||
            !record.completedAt);

        return isNotEvaluated ? (
          <Button type="primary" onClick={() => handleEvaluate(record)}>
            Đánh giá
          </Button>
        ) : (
          <Button type="default" onClick={() => handleEvaluate(record)}>
            Xem lại đánh giá
          </Button>
        );
      },
    },
  ];

  return (
    <Layout className="min-h-screen" style={{ background: "#f6f8fa" }}>
      <TeacherSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <TeacherHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content
          className="p-6"
          style={{ minHeight: "100vh", background: "#f6f8fa" }}
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
                Đánh giá học viên (1-1)
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
              dataSource={evaluations}
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
                  Đánh giá học viên: {selectedEval?.learnerName}
                </span>
              </div>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={!viewOnly ? handleSubmit : () => setModalVisible(false)}
            okText={viewOnly ? "Đóng" : "Gửi đánh giá"}
            cancelButtonProps={{
              style: { display: viewOnly ? "none" : undefined },
            }}
            width={600}
            centered
          >
            <Form form={form} layout="vertical">
              {viewOnly ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontWeight: 500, fontSize: 16 }}>
                      Học viên đã đạt mục tiêu chưa?
                    </span>
                    <Tag
                      color={selectedEval?.goalsAchieved ? "success" : "error"}
                      style={{
                        marginLeft: 12,
                        fontSize: 15,
                        padding: "4px 16px",
                        borderRadius: 16,
                      }}
                      icon={
                        selectedEval?.goalsAchieved ? (
                          <CheckCircleIcon style={{ color: green[600] }} />
                        ) : (
                          <HighlightOffIcon style={{ color: red[600] }} />
                        )
                      }
                    >
                      {selectedEval?.goalsAchieved ? "Đạt" : "Chưa đạt"}
                    </Tag>
                  </div>
                  <div
                    style={{
                      background: "#f5f7fa",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    {selectedEval?.answers?.map((ans) => (
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
                <>
                  <Form.Item
                    name="goalsAchieved"
                    label={
                      <span style={{ fontWeight: 500, fontSize: 16 }}>
                        Học viên đã đạt mục tiêu chưa?
                      </span>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn" }]}
                  >
                    <Select>
                      <Option value={true}>Đạt</Option>
                      <Option value={false}>Chưa đạt</Option>
                    </Select>
                  </Form.Item>
                  <div
                    style={{
                      background: "#f5f7fa",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    {questions.map((q) => (
                      <Form.Item
                        key={q.evaluationQuestionId}
                        name={`question_${q.evaluationQuestionId}`}
                        label={
                          <span style={{ fontWeight: 500, fontSize: 15 }}>
                            <QuizIcon
                              style={{ color: blue[400], marginRight: 6 }}
                            />
                            {q.questionText}
                          </span>
                        }
                        rules={[
                          { required: true, message: "Vui lòng chọn đáp án" },
                        ]}
                      >
                        <Select>
                          {q.options.map((opt) => (
                            <Option
                              key={opt.evaluationOptionId}
                              value={opt.evaluationOptionId}
                            >
                              {opt.optionText}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ))}
                  </div>
                </>
              )}
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentEvaluation;
