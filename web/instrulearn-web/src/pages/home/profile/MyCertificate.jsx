import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Spin,
  Empty,
  message,
  Button,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const MyCertificate = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const learnerId = localStorage.getItem("learnerId");
      if (!learnerId) {
        message.error("Không tìm thấy thông tin người dùng");
        setLoading(false);
        return;
      }
      const res = await fetch(
        `https://instrulearnapplication.azurewebsites.net/api/Certification/GetByLearnerId/${learnerId}`
      );
      const data = await res.json();
      if (data.isSucceed) {
        // Lọc bỏ chứng chỉ có tên chứa TEMPORARY
        const filtered = data.data.filter(
          (c) => !c.certificationName.includes("TEMPORARY")
        );
        setCertificates(filtered);
      } else {
        message.error(data.message || "Không thể lấy chứng chỉ");
      }
    } catch (err) {
      message.error("Lỗi khi tải chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên chứng chỉ",
      dataIndex: "certificationName",
      key: "certificationName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Ngày cấp",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      render: (subject) => <Tag color="blue">{subject}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/certificate/${record.certificationId}`)}
        >
          Xem chứng chỉ
        </Button>
      ),
    },
  ];

  return (
    <Card title={<Title level={4}>Chứng chỉ của tôi</Title>}>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" />
        </div>
      ) : certificates.length === 0 ? (
        <Empty description="Bạn chưa có chứng chỉ nào" />
      ) : (
        <Table
          dataSource={certificates}
          columns={columns}
          rowKey="certificationId"
          pagination={false}
        />
      )}
    </Card>
  );
};

export default MyCertificate;
