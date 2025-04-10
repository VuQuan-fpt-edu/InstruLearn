import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Popconfirm,
  Tooltip,
  Card,
  Typography,
  Divider,
  Select,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const MajorTest = () => {
  const [tests, setTests] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("major-test");

  // Fetch danh sách nhạc cụ
  const fetchInstruments = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Major/get-all"
      );
      if (response.data?.isSucceed) {
        setInstruments(response.data.data || []);
      }
    } catch (error) {
      message.error("Không thể tải danh sách nhạc cụ");
      console.error("Error fetching instruments:", error);
    }
  };

  // Fetch danh sách đề bài
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/MajorTest/get-all"
      );

      // Log response để debug
      console.log("API Response:", response.data);

      // Kiểm tra và xử lý dữ liệu
      if (Array.isArray(response.data)) {
        const formattedTests = response.data
          .map((item) => {
            if (item.isSucceed && item.data) {
              return item.data;
            }
            return null;
          })
          .filter(Boolean);
        setTests(formattedTests);
      } else if (
        response.data?.isSucceed &&
        Array.isArray(response.data.data)
      ) {
        setTests(response.data.data);
      } else {
        setTests([]);
        message.warning("Không có dữ liệu đề bài");
      }
    } catch (error) {
      message.error("Không thể tải danh sách đề bài");
      console.error("Error fetching tests:", error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
    fetchTests();
  }, []);

  // Xử lý thêm mới đề bài
  const handleAdd = () => {
    setEditingTest(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Xử lý chỉnh sửa đề bài
  const handleEdit = (record) => {
    setEditingTest(record);
    form.setFieldsValue({
      majorId: record.majorId,
      majorTestName: record.majorTestName,
    });
    setModalVisible(true);
  };

  // Xử lý xóa đề bài
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/MajorTest/delete/${id}`
      );
      if (response.data?.isSucceed) {
        message.success("Xóa đề bài thành công");
        fetchTests();
      }
    } catch (error) {
      message.error("Không thể xóa đề bài");
      console.error("Error deleting test:", error);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      if (editingTest) {
        // Update
        const response = await axios.put(
          `https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/MajorTest/update/${editingTest.majorTestId}`,
          values
        );
        if (response.data?.isSucceed) {
          message.success("Cập nhật đề bài thành công");
          setModalVisible(false);
          fetchTests();
        }
      } else {
        // Create
        const response = await axios.post(
          "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/MajorTest/create",
          values
        );
        if (response.data?.isSucceed) {
          message.success("Thêm đề bài thành công");
          setModalVisible(false);
          fetchTests();
        }
      }
    } catch (error) {
      message.error(
        editingTest ? "Không thể cập nhật đề bài" : "Không thể thêm đề bài"
      );
      console.error("Error submitting form:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "majorTestId",
      key: "majorTestId",
      width: 80,
    },
    {
      title: "Tên đề bài",
      dataIndex: "majorTestName",
      key: "majorTestName",
    },
    {
      title: "Nhạc cụ",
      dataIndex: "majorId",
      key: "majorId",
      render: (majorId) => {
        const instrument = instruments.find((i) => i.majorId === majorId);
        return instrument ? instrument.majorName : "N/A";
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đề bài này?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.majorTestId)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
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
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Quản lý đề bài</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm đề bài
              </Button>
            </div>
            <Divider />

            <Table
              columns={columns}
              dataSource={tests}
              rowKey="majorTestId"
              loading={loading}
              locale={{
                emptyText: <Empty description="Không có dữ liệu" />,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} đề bài`,
              }}
            />
          </Card>

          <Modal
            title={editingTest ? "Chỉnh sửa đề bài" : "Thêm đề bài mới"}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={500}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {!editingTest && (
                <Form.Item
                  name="majorId"
                  label="Nhạc cụ"
                  rules={[{ required: true, message: "Vui lòng chọn nhạc cụ" }]}
                >
                  <Select placeholder="Chọn nhạc cụ">
                    {instruments.map((instrument) => (
                      <Option
                        key={instrument.majorId}
                        value={instrument.majorId}
                      >
                        {instrument.majorName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item
                name="majorTestName"
                label="Tên đề bài"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đề bài" },
                ]}
              >
                <Input placeholder="Nhập tên đề bài" />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    {editingTest ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MajorTest;
