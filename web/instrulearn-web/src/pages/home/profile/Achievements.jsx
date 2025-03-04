import React from "react";
import { Card, Typography, Row, Col, Divider } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Achievements = ({ achievements }) => {
  return (
    <Card className="shadow-sm border border-gray-100">
      <Title level={4} className="mb-6">
        Thành tích đạt được ({achievements.length})
      </Title>
      <Row gutter={[16, 16]}>
        {achievements.map((achievement) => (
          <Col xs={24} sm={12} md={8} key={achievement.id}>
            <Card
              className="bg-gray-50 hover:shadow-md transition-all duration-300 border border-gray-200 h-full"
              hoverable
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 bg-purple-100 p-4 rounded-full text-purple-700 text-3xl">
                  {achievement.icon}
                </div>
                <Title level={4} className="mb-1">
                  {achievement.name}
                </Title>
                <Text type="secondary" className="mb-3">
                  Đạt được: {achievement.date}
                </Text>
                <Divider className="my-3" />
                <Text className="text-gray-600">{achievement.description}</Text>
              </div>
            </Card>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8}>
          <Card className="border-dashed border-2 border-gray-300 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
            <div className="text-center p-6">
              <div className="bg-gray-200 rounded-full p-4 inline-block mb-4">
                <TrophyOutlined className="text-3xl text-gray-500" />
              </div>
              <Title level={5} className="text-gray-600 mb-1">
                Thành tích tiếp theo
              </Title>
              <Text className="text-gray-500 block">
                Hoàn thành thêm bài học để mở khoá thành tích mới
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default Achievements;
