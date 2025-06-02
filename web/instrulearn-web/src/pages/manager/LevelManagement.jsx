import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  notification,
  Popconfirm,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;

const LEVEL_OPTIONS = [
  { value: "Mới bắt đầu", label: "Mới bắt đầu" },
  { value: "Sơ cấp", label: "Sơ cấp" },
  { value: "Trung cấp", label: "Trung cấp" },
  { value: "Nâng cao", label: "Nâng cao" },
];

const LEVEL_ORDER = {
  "Mới bắt đầu": 1,
  "Sơ cấp": 2,
  "Trung cấp": 3,
  "Nâng cao": 4,
};

const LevelManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("One-on-one Level");
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLevel, setEditingLevel] = useState(null);
  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    type: "", // 'success' or 'error'
    message: "",
    description: "",
  });
  const [majors, setMajors] = useState([]);
  const [levelExists, setLevelExists] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedLevelName, setSelectedLevelName] = useState(null);
  const [priceConstraintError, setPriceConstraintError] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

  const showNotification = (type, message, description) => {
    setNotificationModal({
      visible: true,
      type,
      message,
      description,
    });
  };

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/get-all"
      );
      if (response.data) {
        setLevels(response.data.map((item) => item.data));
      }
    } catch (error) {
      notification.error({
        message: "Không thể tải danh sách cấp độ",
        description: error.message,
        placement: "topRight",
        duration: 4.5,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await axios.get(
          "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
        );
        if (res.data && res.data.data) {
          setMajors(res.data.data.filter((m) => m.status === 1));
        }
      } catch (err) {
        // Có thể thêm thông báo lỗi nếu cần
      }
    };
    fetchMajors();
    fetchLevels();
  }, []);

  useEffect(() => {
    if (selectedMajor && selectedLevelName) {
      const exists = levels.some(
        (lv) =>
          lv.majorId === selectedMajor && lv.levelName === selectedLevelName
      );
      setLevelExists(exists);
    } else {
      setLevelExists(false);
    }
  }, [selectedMajor, selectedLevelName, levels]);

  const sortedLevels = [...levels].sort((a, b) => {
    if (a.majorId !== b.majorId) {
      return a.majorId - b.majorId;
    }
    return LEVEL_ORDER[a.levelName] - LEVEL_ORDER[b.levelName];
  });

  const pagedLevels = sortedLevels.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const columns = [
    {
      title: "Chuyên ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (majorId, row, index) => {
        const sameMajorRows = pagedLevels.filter(
          (lv) => lv.majorId === majorId
        );
        const firstIndex = pagedLevels.findIndex(
          (lv) => lv.majorId === majorId
        );
        if (index === firstIndex) {
          return {
            children:
              majors.find((m) => m.majorId === majorId)?.majorName || majorId,
            props: { rowSpan: sameMajorRows.length },
          };
        }
        return { children: null, props: { rowSpan: 0 } };
      },
    },
    {
      title: "Tên cấp độ",
      dataIndex: "levelName",
      key: "levelName",
    },
    {
      title: "Giá",
      dataIndex: "levelPrice",
      key: "levelPrice",
      render: (price) => `${price.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingLevel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      // Thêm API xóa ở đây
      notification.success({
        message: "Thành công",
        description: "Xóa cấp độ thành công",
        placement: "topRight",
        duration: 4.5,
      });
      fetchLevels();
    } catch (error) {
      notification.error({
        message: "Không thể xóa cấp độ",
        description: error.message,
        placement: "topRight",
        duration: 4.5,
      });
    }
  };

  const validateLevelPrice = (majorId, levelName, levelPrice) => {
    // Lấy các cấp độ cùng chuyên ngành
    const sameMajorLevels = levels.filter((lv) => lv.majorId === majorId);
    // Lấy giá các cấp độ khác
    const priceByLevel = {};
    sameMajorLevels.forEach((lv) => {
      priceByLevel[lv.levelName] = lv.levelPrice;
    });
    // Gán giá mới cho cấp độ đang xét
    priceByLevel[levelName] = levelPrice;
    // Kiểm tra ràng buộc
    if (
      (priceByLevel["Nâng cao"] !== undefined &&
        priceByLevel["Trung cấp"] !== undefined &&
        priceByLevel["Nâng cao"] <= priceByLevel["Trung cấp"]) ||
      (priceByLevel["Trung cấp"] !== undefined &&
        priceByLevel["Sơ cấp"] !== undefined &&
        priceByLevel["Trung cấp"] <= priceByLevel["Sơ cấp"]) ||
      (priceByLevel["Sơ cấp"] !== undefined &&
        priceByLevel["Mới bắt đầu"] !== undefined &&
        priceByLevel["Sơ cấp"] <= priceByLevel["Mới bắt đầu"])
    ) {
      return false;
    }
    return true;
  };

  const handleModalOk = async () => {
    if (levelExists) {
      showNotification(
        "error",
        "Trùng cấp độ",
        "Cấp độ này của chuyên ngành đã tồn tại!"
      );
      return;
    }
    try {
      const values = await form.validateFields();
      // Kiểm tra ràng buộc giá giữa các cấp độ
      if (
        !validateLevelPrice(values.majorId, values.levelName, values.levelPrice)
      ) {
        setPriceConstraintError(
          "Giá tiền của các cấp độ phải theo thứ tự: Nâng cao > Trung cấp > Sơ cấp > Mới bắt đầu"
        );
        showNotification(
          "error",
          "Sai thứ tự giá",
          "Giá tiền của các cấp độ phải theo thứ tự: Nâng cao > Trung cấp > Sơ cấp > Mới bắt đầu"
        );
        return;
      } else {
        setPriceConstraintError("");
      }
      if (editingLevel) {
        // Gọi API cập nhật
        const updateData = {
          levelPrice: values.levelPrice,
          syllabusLink: values.syllabusLink || "",
        };
        const response = await axios.put(
          `https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/update/${editingLevel.levelAssignedId}`,
          updateData
        );
        if (
          response.status === 200 ||
          response.status === 204 ||
          response.data.isSucceed === true ||
          (typeof response.data.message === "string" &&
            response.data.message.toLowerCase().includes("success"))
        ) {
          showNotification(
            "success",
            "Cập nhật thành công",
            "Cấp độ đã được cập nhật thành công!"
          );
        } else {
          showNotification(
            "error",
            "Cập nhật thất bại",
            response.data.message || "Không thể cập nhật cấp độ"
          );
        }
      } else {
        // Gọi API tạo mới
        const createData = {
          majorId: values.majorId,
          levelName: values.levelName,
          levelPrice: values.levelPrice,
          syllabusLink: values.syllabusLink || "",
        };
        console.log("Dữ liệu gửi lên:", createData);
        const response = await axios.post(
          "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/create",
          createData
        );
        if (
          response.status === 200 ||
          response.status === 201 ||
          response.data.isSucceed === true ||
          (typeof response.data.message === "string" &&
            response.data.message.toLowerCase().includes("success"))
        ) {
          showNotification(
            "success",
            "Tạo mới thành công",
            "Cấp độ mới đã được tạo thành công!"
          );
        } else {
          showNotification(
            "error",
            "Tạo mới thất bại",
            response.data.message || "Không thể tạo cấp độ mới"
          );
        }
      }
      setModalVisible(false);
      form.resetFields();
      setEditingLevel(null);
      fetchLevels();
    } catch (error) {
      showNotification(
        "error",
        "Lỗi",
        "Có lỗi xảy ra: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <Layout className="min-h-screen">
      <ManagerSidebar
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
        <ManagerHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50" style={{ marginTop: "64px" }}>
          <div style={{ padding: "24px", background: "#fff", borderRadius: 8 }}>
            <div style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingLevel(null);
                  form.resetFields();
                  setLevelExists(false);
                  setSelectedMajor(null);
                  setSelectedLevelName(null);
                  setModalVisible(true);
                }}
              >
                Thêm cấp độ mới
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={pagedLevels}
              loading={loading}
              rowKey="levelAssignedId"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: sortedLevels.length,
                onChange: (page, pageSize) =>
                  setPagination({ current: page, pageSize }),
              }}
            />
            <Modal
              title={editingLevel ? "Sửa cấp độ" : "Thêm cấp độ mới"}
              open={modalVisible}
              onOk={handleModalOk}
              onCancel={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingLevel(null);
              }}
            >
              <Form form={form} layout="vertical">
                {editingLevel ? (
                  <>
                    <Form.Item label="Chuyên ngành">
                      <Input
                        value={
                          majors.find((m) => m.majorId === editingLevel.majorId)
                            ?.majorName || editingLevel.majorId
                        }
                        disabled
                      />
                    </Form.Item>
                    <Form.Item label="Tên cấp độ">
                      <Input value={editingLevel.levelName} disabled />
                    </Form.Item>
                    <Form.Item
                      name="levelPrice"
                      label="Giá cấp độ (VNĐ)"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá cấp độ" },
                        {
                          validator: (_, value) => {
                            // Lấy các cấp độ cùng chuyên ngành
                            const sameMajorLevels = levels.filter(
                              (lv) =>
                                lv.majorId === editingLevel.majorId &&
                                lv.levelAssignedId !==
                                  editingLevel.levelAssignedId
                            );
                            // Lấy giá các cấp độ khác
                            const priceByLevel = {};
                            sameMajorLevels.forEach((lv) => {
                              priceByLevel[lv.levelName] = lv.levelPrice;
                            });
                            // Gán giá mới cho cấp độ đang xét
                            priceByLevel[editingLevel.levelName] = value;
                            // Kiểm tra ràng buộc thứ tự giá
                            if (
                              (priceByLevel["Nâng cao"] !== undefined &&
                                priceByLevel["Trung cấp"] !== undefined &&
                                priceByLevel["Nâng cao"] <=
                                  priceByLevel["Trung cấp"]) ||
                              (priceByLevel["Trung cấp"] !== undefined &&
                                priceByLevel["Sơ cấp"] !== undefined &&
                                priceByLevel["Trung cấp"] <=
                                  priceByLevel["Sơ cấp"]) ||
                              (priceByLevel["Sơ cấp"] !== undefined &&
                                priceByLevel["Mới bắt đầu"] !== undefined &&
                                priceByLevel["Sơ cấp"] <=
                                  priceByLevel["Mới bắt đầu"])
                            ) {
                              return Promise.reject(
                                new Error(
                                  "Giá tiền của các cấp độ phải theo thứ tự: Nâng cao > Trung cấp > Sơ cấp > Mới bắt đầu"
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        min={100000}
                        max={10000000}
                        step={1000}
                        placeholder="Nhập giá từ 100.000 đến 10.000.000"
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ display: "none" }}
                      name="syllabusLink"
                      label="Link giáo trình (syllabusLink)"
                    >
                      <Input />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Form.Item
                      name="majorId"
                      label="Chuyên ngành"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn chuyên ngành",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn chuyên ngành"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(value) => {
                          setSelectedMajor(value);
                          form.setFieldsValue({ levelName: undefined });
                          setSelectedLevelName(null);
                        }}
                      >
                        {majors.map((major) => (
                          <Select.Option
                            key={major.majorId}
                            value={major.majorId}
                          >
                            {major.majorName}
                          </Select.Option>
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
                        disabled={!selectedMajor}
                        onChange={(value) => setSelectedLevelName(value)}
                        value={selectedLevelName}
                      >
                        {LEVEL_OPTIONS.filter((opt) => {
                          if (!selectedMajor) return true;
                          return !levels.some(
                            (lv) =>
                              lv.majorId === selectedMajor &&
                              lv.levelName === opt.value
                          );
                        }).map((opt) => (
                          <Select.Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {levelExists && (
                      <div style={{ color: "red", marginBottom: 12 }}>
                        Cấp độ này của chuyên ngành đã tồn tại!
                      </div>
                    )}
                    <Form.Item
                      name="levelPrice"
                      label="Giá cấp độ (VNĐ)"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá cấp độ" },
                        {
                          validator: (_, value) => {
                            // Lấy các cấp độ cùng chuyên ngành
                            const sameMajorLevels = levels.filter(
                              (lv) =>
                                lv.majorId === selectedMajor &&
                                lv.levelAssignedId !== selectedLevelName
                            );
                            // Lấy giá các cấp độ khác
                            const priceByLevel = {};
                            sameMajorLevels.forEach((lv) => {
                              priceByLevel[lv.levelName] = lv.levelPrice;
                            });
                            // Gán giá mới cho cấp độ đang xét
                            priceByLevel[selectedLevelName] = value;
                            // Kiểm tra ràng buộc thứ tự giá
                            if (
                              (priceByLevel["Nâng cao"] !== undefined &&
                                priceByLevel["Trung cấp"] !== undefined &&
                                priceByLevel["Nâng cao"] <=
                                  priceByLevel["Trung cấp"]) ||
                              (priceByLevel["Trung cấp"] !== undefined &&
                                priceByLevel["Sơ cấp"] !== undefined &&
                                priceByLevel["Trung cấp"] <=
                                  priceByLevel["Sơ cấp"]) ||
                              (priceByLevel["Sơ cấp"] !== undefined &&
                                priceByLevel["Mới bắt đầu"] !== undefined &&
                                priceByLevel["Sơ cấp"] <=
                                  priceByLevel["Mới bắt đầu"])
                            ) {
                              return Promise.reject(
                                new Error(
                                  "Giá tiền của các cấp độ phải theo thứ tự: Nâng cao > Trung cấp > Sơ cấp > Mới bắt đầu"
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        min={100000}
                        max={10000000}
                        step={1000}
                        placeholder="Nhập giá từ 100.000 đến 10.000.000"
                      />
                    </Form.Item>
                    {priceConstraintError && (
                      <div style={{ color: "red", marginBottom: 12 }}>
                        {priceConstraintError}
                      </div>
                    )}
                  </>
                )}
              </Form>
            </Modal>
            <Modal
              open={notificationModal.visible}
              footer={null}
              onCancel={() =>
                setNotificationModal({ ...notificationModal, visible: false })
              }
              width={400}
              centered
            >
              <div style={{ textAlign: "center", padding: "20px" }}>
                {notificationModal.type === "success" ? (
                  <CheckCircleOutlined
                    style={{
                      fontSize: "48px",
                      color: "#52c41a",
                      marginBottom: "16px",
                    }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{
                      fontSize: "48px",
                      color: "#ff4d4f",
                      marginBottom: "16px",
                    }}
                  />
                )}
                <h2 style={{ marginBottom: "8px" }}>
                  {notificationModal.message}
                </h2>
                <p style={{ color: "#666" }}>{notificationModal.description}</p>
                <Button
                  type="primary"
                  onClick={() =>
                    setNotificationModal({
                      ...notificationModal,
                      visible: false,
                    })
                  }
                  style={{ marginTop: "16px" }}
                >
                  Đóng
                </Button>
              </div>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LevelManagement;
