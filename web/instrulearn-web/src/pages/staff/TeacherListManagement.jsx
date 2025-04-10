import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Input,
  Space,
  Typography,
  Card,
  Tag,
  Tooltip,
  Spin,
} from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;

const TeacherListManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("teacher-management");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/TeacherMajor/get-all"
      );

      if (response.data && Array.isArray(response.data)) {
        const teacherMap = new Map();

        response.data.forEach((item) => {
          if (item.isSucceed && item.data) {
            const { teacherId, fullname, majors } = item.data.teacher;
            const teacherMajorId = item.data.teacherMajorId;
            const status = item.data.status;

            if (!teacherMap.has(teacherId)) {
              teacherMap.set(teacherId, {
                key: teacherId,
                teacherId: teacherId,
                fullname: fullname,
                majors: majors.map((major) => ({
                  ...major,
                  teacherMajorId: teacherMajorId,
                  status: status,
                })),
              });
            } else {
              const existingTeacher = teacherMap.get(teacherId);
              existingTeacher.majors.push({
                ...majors[0],
                teacherMajorId: teacherMajorId,
                status: status,
              });
            }
          }
        });

        const formattedTeachers = Array.from(teacherMap.values());
        setTeachers(formattedTeachers);
      } else {
        console.error(
          "API response missing expected data structure:",
          response
        );
        setTeachers([]);
        message.error("Dữ liệu không đúng định dạng");
      }
    } catch (error) {
      console.error("API error:", error);
      message.error("Không thể tải danh sách giáo viên");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    navigate(`/staff/teacher-detail/${record.teacherId}`);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.majors.some((major) =>
        major.majorName.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  const columns = [
    {
      title: "Tên giáo viên",
      dataIndex: "fullname",
      key: "fullname",
      render: (text) => (
        <div className="font-medium text-gray-800 text-base">{text}</div>
      ),
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: "Nhạc cụ",
      dataIndex: "majors",
      key: "majors",
      render: (majors) => (
        <div className="flex flex-wrap gap-2">
          {majors.map((major) => (
            <div
              key={major.majorId}
              className="inline-flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm"
            >
              <span className="px-3 py-1 bg-blue-50 text-blue-600 border-r border-gray-200">
                {major.majorName}
              </span>
              <span
                className={`px-3 py-1 ${
                  major.status === 0
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {major.status === 0 ? "Tạm ngưng" : "Đang dạy"}
              </span>
            </div>
          ))}
        </div>
      ),
      filters: Array.from(
        new Set(teachers.flatMap((t) => t.majors.map((m) => m.majorName)))
      ).map((major) => ({ text: major, value: major })),
      onFilter: (value, record) =>
        record.majors.some((m) => m.majorName === value),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          className="bg-blue-500 hover:bg-blue-600 border-none shadow-md hover:shadow-lg transition-all"
          onClick={() => handleRowClick(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
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
        <Content className="p-8 bg-gray-50" style={{ marginTop: "64px" }}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">
                    Quản lý danh sách giáo viên
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Xem thông tin và trạng thái của giáo viên
                  </p>
                </div>
                <Space size="middle">
                  <Input
                    placeholder="Tìm kiếm giáo viên..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="min-w-[300px] rounded-lg"
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTeachers}
                    className="flex items-center border border-gray-200 hover:border-blue-500 hover:text-blue-500 rounded-lg shadow-sm"
                  >
                    Làm mới
                  </Button>
                </Space>
              </div>
            </div>

            <div className="p-6">
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={filteredTeachers}
                  rowKey="teacherId"
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    className:
                      "cursor-pointer transition-colors hover:bg-blue-50",
                  })}
                  pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (total) => `Tổng cộng ${total} giáo viên`,
                    className: "mt-6",
                  }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                />
              </Spin>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherListManagement;
