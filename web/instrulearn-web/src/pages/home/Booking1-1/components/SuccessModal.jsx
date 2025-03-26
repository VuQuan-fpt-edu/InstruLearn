import React from "react";
import { Modal, Button, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Paragraph } = Typography;

const SuccessModal = ({ visible, onClose, bookingDetails }) => {
  if (!bookingDetails) return null;

  const getTimeLearningText = (minutes) => {
    return `${minutes} phút`;
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 32 }} />
          <div className="text-xl mt-2">Đăng ký thành công!</div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Quay về trang chủ
        </Button>,
      ]}
      width={500}
    >
      <div className="space-y-4 mt-4">
        <Paragraph>
          Yêu cầu đặt lịch học của bạn đã được gửi thành công. Chúng tôi sẽ liên
          hệ với bạn trong vòng 24 giờ để xác nhận lịch học.
        </Paragraph>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="font-medium mb-2">Thông tin đặt lịch:</div>
          <ul className="space-y-2">
            <li>
              <strong>Nhạc cụ:</strong> {bookingDetails.instrument}
            </li>
            <li>
              <strong>Giáo viên:</strong> {bookingDetails.teacherName}
            </li>
            <li>
              <strong>Ngày bắt đầu:</strong>{" "}
              {dayjs(bookingDetails.startDay).format("DD/MM/YYYY")}
            </li>
            <li>
              <strong>Lịch học:</strong> {bookingDetails.bookingDays}
            </li>
            <li>
              <strong>Thời gian:</strong>{" "}
              {dayjs(bookingDetails.bookingSlot).format("HH:mm")} giờ
            </li>
            <li>
              <strong>Thời lượng mỗi buổi:</strong>{" "}
              {getTimeLearningText(bookingDetails.timeLearning)}
            </li>
            <li>
              <strong>Số buổi:</strong> {bookingDetails.numberOfSlots} buổi
            </li>
            <li>
              <strong>Yêu cầu học:</strong> {bookingDetails.learningRequest}
            </li>
          </ul>
        </div>

        <Paragraph>
          Vui lòng kiểm tra email để xác nhận thông tin đặt lịch. Nếu có bất kỳ
          thay đổi nào, hãy liên hệ với chúng tôi qua số điện thoại{" "}
          <a href="tel:19001234">1900 1234</a>.
        </Paragraph>
      </div>
    </Modal>
  );
};

export default SuccessModal;
