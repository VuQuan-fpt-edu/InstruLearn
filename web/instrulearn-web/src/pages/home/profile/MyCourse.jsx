import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Tag, Empty, message, Spin } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const TeacherEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const learnerId = localStorage.getItem("learnerId");
      const token = localStorage.getItem("authToken");
      if (!learnerId || !token) {
        message.error("Vui lòng đăng nhập để xem đánh giá");
        return;
      }
      const res = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/by-learner/${learnerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.isSucceed) {
        setEvaluations(res.data.data || []);
      } else {
        setEvaluations([]);
      }
    } catch (err) {
      setEvaluations([]);
      message.error("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin tip="Đang tải đánh giá..." />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100">
      <Title level={4} className="mb-6">
        Đánh giá của giáo viên về bạn
      </Title>
      {evaluations.length > 0 ? (
        <div className="space-y-6">
          {evaluations.map((evalItem) => (
            <Card
              key={evalItem.evaluationFeedbackId}
              className="bg-gray-50 border border-gray-200 mb-4"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <div className="flex items-center mb-2">
                    <UserOutlined className="mr-2 text-blue-500" />
                    <Text strong>Giáo viên:</Text> {evalItem.teacherName}
                  </div>
                  <div className="mb-1">
                    <BookOutlined className="mr-2 text-green-500" />
                    <Text strong>Chuyên ngành:</Text> {evalItem.majorName}
                  </div>
                  <div className="mb-1">
                    <Text strong>Yêu cầu học:</Text> {evalItem.learningRequest}
                  </div>
                  <div className="mb-1">
                    <Text strong>Số buổi:</Text> {evalItem.completedSessions}/
                    {evalItem.totalSessions}
                  </div>
                  <div className="mb-1">
                    <CalendarOutlined className="mr-2 text-gray-500" />
                    <Text strong>Ngày đánh giá:</Text>{" "}
                    {evalItem.completedAt
                      ? dayjs(evalItem.completedAt).format("DD/MM/YYYY HH:mm")
                      : "Chưa đánh giá"}
                  </div>
                  <div className="mb-1">
                    <Text strong>Trạng thái:</Text>{" "}
                    {evalItem.status === 2 ? (
                      <Tag color="success">Đã đánh giá</Tag>
                    ) : (
                      <Tag color="default">Chưa đánh giá</Tag>
                    )}
                  </div>
                  <div className="mb-1">
                    <Text strong>Mục tiêu:</Text>
                    {evalItem.goalsAchieved ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Đạt
                      </Tag>
                    ) : (
                      <Tag color="error" icon={<CloseCircleOutlined />}>
                        Chưa đạt
                      </Tag>
                    )}
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="bg-white rounded-lg p-3">
                    <Text strong>Câu hỏi & Đáp án:</Text>
                    {evalItem.answers && evalItem.answers.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {evalItem.answers.map((ans) => (
                          <li key={ans.evaluationAnswerId}>
                            <div className="font-medium">
                              {ans.questionText}
                            </div>
                            <Tag color="blue">{ans.selectedOptionText}</Tag>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 mt-2">
                        Chưa có câu hỏi đánh giá
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          description="Chưa có đánh giá nào từ giáo viên"
          className="py-12"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default TeacherEvaluations;
