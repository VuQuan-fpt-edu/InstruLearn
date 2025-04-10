import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Table,
  Space,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Định nghĩa thứ tự và giá tối thiểu của các cấp độ
const LEVEL_ORDER = {
  "Mới bắt đầu": 1,
  "Sơ cấp": 2,
  "Trung cấp": 3,
  "Nâng cao": 4,
};

const MIN_PRICE_DIFFERENCE = 50000; // Chênh lệch giá tối thiểu giữa các cấp độ

const LevelManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("level");
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLevel, setEditingLevel] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [minPrice, setMinPrice] = useState(100000);
  const [maxPrice, setMaxPrice] = useState(500000);

  useEffect(() => {
    fetchLevels();
    fetchMajors();
  }, []);

  // Cập nhật danh sách cấp độ có sẵn khi chọn chuyên ngành
  useEffect(() => {
    if (selectedMajor) {
      updateAvailableLevels(selectedMajor);
    }
  }, [selectedMajor, levels]);

  // Hàm cập nhật danh sách cấp độ có sẵn
  const updateAvailableLevels = (majorId) => {
    const existingLevels = levels.filter((level) => level.majorId === majorId);
    const allLevels = ["Mới bắt đầu", "Sơ cấp", "Trung cấp", "Nâng cao"];
    const availableLevelNames = allLevels.filter(
      (levelName) =>
        !existingLevels.some((level) => level.levelName === levelName)
    );
    setAvailableLevels(availableLevelNames);

    // Cập nhật giá tối thiểu dựa trên cấp độ hiện có
    updatePriceConstraints(majorId);
  };

  // Hàm cập nhật ràng buộc giá
  const updatePriceConstraints = (majorId) => {
    const existingLevels = levels.filter((level) => level.majorId === majorId);
    const selectedLevelName = form.getFieldValue("levelName");

    if (!selectedLevelName) {
      setMinPrice(100000);
      setMaxPrice(500000);
      return;
    }

    const selectedLevelOrder = LEVEL_ORDER[selectedLevelName];
    let minPrice = 100000;
    let maxPrice = 500000;

    // Tìm giá của cấp độ thấp hơn gần nhất
    const lowerLevel = existingLevels
      .filter((level) => LEVEL_ORDER[level.levelName] < selectedLevelOrder)
      .sort((a, b) => LEVEL_ORDER[b.levelName] - LEVEL_ORDER[a.levelName])[0];

    // Tìm giá của cấp độ cao hơn gần nhất
    const higherLevel = existingLevels
      .filter((level) => LEVEL_ORDER[level.levelName] > selectedLevelOrder)
      .sort((a, b) => LEVEL_ORDER[a.levelName] - LEVEL_ORDER[b.levelName])[0];

    if (lowerLevel) {
      minPrice = lowerLevel.levelPrice + MIN_PRICE_DIFFERENCE;
    }

    if (higherLevel) {
      maxPrice = higherLevel.levelPrice - MIN_PRICE_DIFFERENCE;
    }

    setMinPrice(minPrice);
    setMaxPrice(maxPrice);

    // Cập nhật giá trong form nếu giá hiện tại không nằm trong khoảng hợp lệ
    const currentPrice = form.getFieldValue("levelPrice");
    if (currentPrice < minPrice) {
      form.setFieldsValue({ levelPrice: minPrice });
    } else if (currentPrice > maxPrice) {
      form.setFieldsValue({ levelPrice: maxPrice });
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LevelAssigned/get-all"
      );
      const formattedLevels = response.data.map((item) => ({
        ...item.data,
        key: item.data.levelAssignedId,
      }));
      setLevels(formattedLevels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      message.error("Không thể tải danh sách cấp độ");
    } finally {
      setLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Major/get-all"
      );
      setMajors(response.data.data);
    } catch (error) {
      console.error("Error fetching majors:", error);
      message.error("Không thể tải danh sách chuyên ngành");
    }
  };

  const handleAddLevel = () => {
    setEditingLevel(null);
    form.resetFields();
    setSelectedMajor(null);
    setAvailableLevels([]);
    setMinPrice(100000);
    setMaxPrice(500000);
    setIsModalVisible(true);
  };

  const handleEditLevel = (record) => {
    setEditingLevel(record);
    setSelectedMajor(record.majorId);
    form.setFieldsValue(record);
    updatePriceConstraints(record.majorId);
    setIsModalVisible(true);
  };

  const handleMajorChange = (value) => {
    setSelectedMajor(value);
    form.setFieldsValue({ levelName: undefined }); // Reset cấp độ khi đổi chuyên ngành
  };

  const handleLevelNameChange = (value) => {
    if (selectedMajor) {
      updatePriceConstraints(selectedMajor);
    }
  };

  const handleDeleteLevel = async (record) => {
    try {
      // Gọi API xóa cấp độ
      message.success("Xóa cấp độ thành công");
      fetchLevels();
    } catch (error) {
      console.error("Error deleting level:", error);
      message.error("Không thể xóa cấp độ");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingLevel) {
        // Gọi API cập nhật cấp độ
        message.success("Cập nhật cấp độ thành công");
      } else {
        // Gọi API tạo cấp độ mới
        await axios.post(
          "https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/LevelAssigned/create",
          values
        );
        message.success("Thêm cấp độ thành công");
      }
      setIsModalVisible(false);
      fetchLevels();
    } catch (error) {
      console.error("Error saving level:", error);
      message.error("Không thể lưu cấp độ");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "levelAssignedId",
      key: "levelAssignedId",
    },
    {
      title: "Tên cấp độ",
      dataIndex: "levelName",
      key: "levelName",
    },
    {
      title: "Chuyên ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (majorId) => {
        const major = majors.find((m) => m.majorId === majorId);
        return major ? major.majorName : "N/A";
      },
    },
    {
      title: "Giá",
      dataIndex: "levelPrice",
      key: "levelPrice",
      render: (price) => `${price.toLocaleString()} VND`,
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
              onClick={() => handleEditLevel(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteLevel(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "all 0.2s",
        }}
      >
        <ManagerHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content
          className="p-6 bg-gray-50"
          style={{
            marginTop: "64px",
          }}
        >
          <div className="mb-6">
            <Title level={3}>Quản lý cấp độ</Title>
          </div>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddLevel}
                >
                  Thêm cấp độ
                </Button>
                <Tooltip title="Làm mới">
                  <Button icon={<ReloadOutlined />} onClick={fetchLevels} />
                </Tooltip>
              </Space>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={levels}
                rowKey="levelAssignedId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} cấp độ`,
                }}
              />
            </Spin>
          </Card>

          <Modal
            title={editingLevel ? "Chỉnh sửa cấp độ" : "Thêm cấp độ mới"}
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="majorId"
                label="Chuyên ngành"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên ngành" },
                ]}
              >
                <Select
                  onChange={handleMajorChange}
                  disabled={!!editingLevel}
                  placeholder="Chọn chuyên ngành"
                >
                  {majors.map((major) => (
                    <Option key={major.majorId} value={major.majorId}>
                      {major.majorName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="levelName"
                label="Tên cấp độ"
                rules={[
                  { required: true, message: "Vui lòng chọn tên cấp độ" },
                ]}
              >
                <Select
                  placeholder="Chọn tên cấp độ"
                  disabled={!selectedMajor || !!editingLevel}
                  onChange={handleLevelNameChange}
                >
                  {availableLevels.map((level) => (
                    <Option key={level} value={level}>
                      {level}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="levelPrice"
                label="Giá"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  {
                    validator: (_, value) => {
                      if (value < minPrice) {
                        return Promise.reject(
                          `Giá phải lớn hơn hoặc bằng ${minPrice.toLocaleString()} VND`
                        );
                      }
                      if (value > maxPrice) {
                        return Promise.reject(
                          `Giá phải nhỏ hơn hoặc bằng ${maxPrice.toLocaleString()} VND`
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                tooltip={`Giá phải từ ${minPrice.toLocaleString()} VND đến ${maxPrice.toLocaleString()} VND`}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={minPrice}
                  max={maxPrice}
                  step={10000}
                  keyboard={false}
                  placeholder="Nhập giá"
                />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LevelManagement;
