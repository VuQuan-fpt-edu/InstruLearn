import React from "react";
import { Modal, Button, Avatar, Divider, Row, Col, Typography } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Paragraph } = Typography;

const Statistic = ({ title, value, prefix, suffix }) => {
  return (
    <div className="text-center">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-medium mt-1">
        {prefix && <span className="mr-1">{prefix}</span>}
        {value}
        {suffix && <span className="ml-1">{suffix}</span>}
      </div>
    </div>
  );
};

const TeacherModal = ({ isVisible, onClose, teacher, onViewProfile }) => {
  if (!teacher) return null;

  return (
    <Modal
      title="Thông tin giáo viên"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button
          key="view-full"
          type="primary"
          onClick={() => {
            onClose();
            onViewProfile(teacher?.teacherId);
          }}
        >
          Xem trang đầy đủ
        </Button>,
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={600}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            size={64}
            src={teacher.image || "https://via.placeholder.com/150"}
          />
          <div>
            <div className="text-xl font-bold">{teacher.name}</div>
            <div className="text-blue-600 font-medium">
              Chuyên môn: {teacher.specialty}
            </div>
          </div>
        </div>

        <Divider />

        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Kinh nghiệm"
              value={teacher.experience || "Chưa cập nhật"}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Đánh giá"
              value={teacher.rating || "N/A"}
              prefix={<StarOutlined />}
              suffix="/5"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Học viên"
              value={teacher.students || 0}
              prefix={<UserOutlined />}
            />
          </Col>
        </Row>

        <Divider />

        <div>
          <div className="font-medium mb-2">Giới thiệu:</div>
          <Paragraph>
            {teacher.description || "Chưa có thông tin giới thiệu"}
          </Paragraph>
        </div>
      </div>
    </Modal>
  );
};

export default TeacherModal;
