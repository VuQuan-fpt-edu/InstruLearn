import React from "react";
import { Modal, Button, Avatar, Divider, Row, Col, Typography } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkOutlined,
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
            src={teacher.avatar || "https://via.placeholder.com/150"}
          />
          <div>
            <div className="text-xl font-bold">{teacher.fullname}</div>
            <div className="text-blue-600 font-medium">
              Chuyên môn:{" "}
              {teacher.majors.map((major) => major.majorName).join(", ")}
            </div>
          </div>
        </div>

        <Divider />

        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Kinh nghiệm"
              value={teacher.heading || "Chưa cập nhật"}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Trạng thái"
              value={teacher.isActive === 1 ? "Đang hoạt động" : "Tạm nghỉ"}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Ngày vào nghề"
              value={new Date(teacher.dateOfEmployment).toLocaleDateString(
                "vi-VN"
              )}
              prefix={<StarOutlined />}
            />
          </Col>
        </Row>

        <Divider />

        <div className="space-y-2">
          <div className="flex items-center">
            <PhoneOutlined className="mr-2" />
            <span>{teacher.phoneNumber}</span>
          </div>
          <div className="flex items-center">
            <EnvironmentOutlined className="mr-2" />
            <span>{teacher.address}</span>
          </div>
          {teacher.links && (
            <div className="flex items-center">
              <LinkOutlined className="mr-2" />
              <a href={teacher.links} target="_blank" rel="noopener noreferrer">
                Liên kết mạng xã hội
              </a>
            </div>
          )}
        </div>

        <Divider />

        <div>
          <div className="font-medium mb-2">Giới thiệu:</div>
          <Paragraph>
            {teacher.details || "Chưa có thông tin giới thiệu"}
          </Paragraph>
        </div>
      </div>
    </Modal>
  );
};

export default TeacherModal;
