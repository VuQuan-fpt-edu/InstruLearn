// src/pages/manager/LevelFeedbackTemplateManagement.jsx
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
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";

const { Content } = Layout;
const { Title } = Typography;

const LevelFeedbackTemplateManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("level-feedback-template");
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form] = Form.useForm();
  const [criteriaCount, setCriteriaCount] = useState(1);
  const [majors, setMajors] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm] = Form.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchLevels();
    fetchTemplates();
    fetchMajors();
  }, []);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/get-all"
      );
      const formattedLevels = response.data.map((item) => ({
        ...item.data,
        key: item.data.levelAssignedId,
      }));
      setLevels(formattedLevels);
    } catch (error) {
      message.error("Không thể tải danh sách cấp độ");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/LevelFeedbackTemplate/GetAllTemplates"
      );
      setTemplates(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách template");
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
      );
      setMajors(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách chuyên ngành");
    }
  };

  const handleCreateTemplate = (level) => {
    setSelectedLevel(level);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      templateName: "",
      criteria: [
        {
          gradeCategory: "",
          weight: 0,
          description: "",
          displayOrder: 1,
        },
      ],
    });
    setCriteriaCount(1);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        levelId: selectedLevel.levelAssignedId,
        templateName: values.templateName,
        criteria: values.criteria,
      };
      message.loading("Đang tạo template...", 0);
      await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/LevelFeedbackTemplate/CreateTemplate",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      message.destroy();
      setSuccessMessage("Tạo template thành công!");
      setSuccessModalVisible(true);
      setIsModalVisible(false);
      fetchTemplates();
    } catch (error) {
      message.destroy();
      message.error("Tạo template thất bại!");
    }
  };

  const handleViewTemplate = (level) => {
    const template = templates.find((t) => t.levelId === level.levelAssignedId);
    if (template) {
      setSelectedTemplate(template);
      setIsViewModalVisible(true);
    } else {
      message.info("Chưa có template cho cấp độ này");
    }
  };

  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "levelAssignedId",
    //   key: "levelAssignedId",
    //   width: "10%",
    // },
    {
      title: "Tên cấp độ",
      dataIndex: "levelName",
      key: "levelName",
      width: "20%",
    },
    {
      title: "Chuyên ngành",
      dataIndex: "majorId",
      key: "majorId",
      width: "20%",
      render: (majorId) => {
        const major = majors.find((m) => m.majorId === majorId);
        return major ? major.majorName : majorId;
      },
    },
    // {
    //   title: "Giá",
    //   dataIndex: "levelPrice",
    //   key: "levelPrice",
    //   width: "20%",
    //   render: (price) => `${price.toLocaleString()}/Buổi VND`,
    // },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_, record) => {
        const hasTemplate = templates.some(
          (t) => t.levelId === record.levelAssignedId
        );
        return (
          <Space size="middle">
            {hasTemplate ? (
              <Tooltip title="Xem template">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleViewTemplate(record)}
                >
                  Xem template
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="Tạo template chấm điểm">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleCreateTemplate(record)}
                >
                  Tạo template
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
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
            <Title level={3}>
              Quản lý template chấm điểm theo cấp độ (Trung tâm)
            </Title>
          </div>
          {majors.map((major) => {
            const levelsOfMajor = levels.filter(
              (level) => level.majorId === major.majorId
            );
            if (levelsOfMajor.length === 0) return null;
            return (
              <div key={major.majorId} style={{ marginBottom: 32 }}>
                <h2 style={{ margin: "16px 0" }}>{major.majorName}</h2>
                <Card>
                  <Table
                    columns={columns}
                    dataSource={levelsOfMajor}
                    rowKey="levelAssignedId"
                    pagination={false}
                  />
                </Card>
              </div>
            );
          })}
          <Modal
            title={`Tạo template chấm điểm cho cấp độ: ${
              selectedLevel?.levelName || ""
            }`}
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
            width={800}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnClose
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="templateName"
                label="Tên template"
                rules={[
                  { required: true, message: "Vui lòng nhập tên template" },
                  { max: 100, message: "Không quá 100 ký tự" },
                ]}
              >
                <Input
                  placeholder="Nhập tên template"
                  maxLength={100}
                  showCount
                />
              </Form.Item>
              <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>
                Danh sách tiêu chí
              </div>
              <div
                style={{
                  overflowY: "auto",
                  maxHeight: 320,
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  padding: 8,
                  background: "#fafafa",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontWeight: 500,
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 2, paddingRight: 8 }}>Tên hạng mục</div>
                  <div style={{ width: 120, paddingRight: 8 }}>
                    Trọng số (%)
                  </div>
                  <div style={{ flex: 3, paddingRight: 8 }}>Mô tả</div>
                  <div style={{ width: 60 }}></div>
                </div>
                <Form.List name="criteria">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, idx) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "gradeCategory"]}
                            rules={[
                              { required: true, message: "Nhập tên hạng mục" },
                              { max: 100, message: "Không quá 100 ký tự" },
                            ]}
                            style={{
                              flex: 2,
                              marginBottom: 0,
                              paddingRight: 8,
                            }}
                          >
                            <Input
                              placeholder="Tên hạng mục"
                              maxLength={100}
                              showCount
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "weight"]}
                            rules={[
                              { required: true, message: "Nhập trọng số" },
                              {
                                type: "number",
                                min: 1,
                                max: 100,
                                message: "Từ 1 đến 100",
                              },
                            ]}
                            style={{
                              width: 120,
                              marginBottom: 0,
                              paddingRight: 8,
                            }}
                          >
                            <InputNumber
                              min={1}
                              max={100}
                              placeholder="%"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "description"]}
                            rules={[
                              { max: 250, message: "Không quá 250 ký tự" },
                            ]}
                            style={{
                              flex: 3,
                              marginBottom: 0,
                              paddingRight: 8,
                            }}
                          >
                            <Input
                              placeholder="Mô tả"
                              maxLength={250}
                              showCount
                            />
                          </Form.Item>
                          <Button
                            danger
                            size="small"
                            style={{ width: 48 }}
                            onClick={() => {
                              remove(name);
                              setCriteriaCount((prev) => prev - 1);
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      ))}
                      <Form.Item
                        style={{
                          marginBottom: 0,
                          marginTop: 8,
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          type="dashed"
                          onClick={() => {
                            if (fields.length < 10) {
                              add({
                                gradeCategory: "",
                                weight: 1,
                                description: "",
                                displayOrder: fields.length + 1,
                              });
                              setCriteriaCount((prev) => prev + 1);
                            }
                          }}
                          block
                          icon={<PlusOutlined />}
                          disabled={fields.length >= 10}
                          style={{ fontWeight: 600 }}
                        >
                          Thêm tiêu chí{" "}
                          {fields.length >= 10 ? "(Tối đa 10)" : ""}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </Form>
          </Modal>

          {/* Modal xem chi tiết template */}
          <Modal
            title={`Template chấm điểm: ${
              selectedTemplate?.templateName || ""
            }`}
            open={isViewModalVisible}
            onCancel={() => setIsViewModalVisible(false)}
            width={800}
            footer={[
              <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                Đóng
              </Button>,
              selectedTemplate && (
                <Button
                  key="edit"
                  type="primary"
                  onClick={() => {
                    setEditingTemplate(selectedTemplate);
                    setIsEditModalVisible(true);
                    editForm.setFieldsValue({
                      templateName: selectedTemplate.templateName,
                      isActive: selectedTemplate.isActive,
                      criteria: selectedTemplate.criteria.map((c) => ({
                        criterionId: c.criterionId,
                        gradeCategory: c.gradeCategory,
                        weight: c.weight,
                        description: c.description,
                        displayOrder: c.displayOrder,
                      })),
                    });
                  }}
                >
                  Chỉnh sửa
                </Button>
              ),
            ]}
          >
            {selectedTemplate && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Thông tin template
                  </h3>
                  <p>
                    <strong>Cấp độ:</strong> {selectedTemplate.levelName}
                  </p>
                  <p>
                    <strong>Chuyên ngành:</strong> {selectedTemplate.majorName}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Các tiêu chí chấm điểm
                  </h3>
                  <Table
                    dataSource={selectedTemplate.criteria}
                    columns={[
                      {
                        title: "Thứ tự",
                        dataIndex: "displayOrder",
                        key: "displayOrder",
                        width: "10%",
                      },
                      {
                        title: "Hạng mục",
                        dataIndex: "gradeCategory",
                        key: "gradeCategory",
                        width: "25%",
                      },
                      {
                        title: "Trọng số",
                        dataIndex: "weight",
                        key: "weight",
                        width: "15%",
                        render: (weight) => `${weight}%`,
                      },
                      {
                        title: "Mô tả",
                        dataIndex: "description",
                        key: "description",
                      },
                    ]}
                    pagination={false}
                  />
                </div>
              </div>
            )}
          </Modal>

          <Modal
            title={`Chỉnh sửa template: ${editingTemplate?.templateName || ""}`}
            open={isEditModalVisible}
            onOk={async () => {
              try {
                const values = await editForm.validateFields();
                const payload = {
                  templateName: values.templateName,
                  isActive: true,
                  criteria: values.criteria.map((c, idx) => ({
                    ...c,
                    displayOrder: idx + 1,
                  })),
                };
                message.loading("Đang cập nhật template...", 0);
                await axios.put(
                  `https://instrulearnapplication.azurewebsites.net/api/LevelFeedbackTemplate/UpdateTemplate/${editingTemplate.templateId}`,
                  payload,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `${localStorage.getItem("token")}`,
                    },
                  }
                );
                message.destroy();
                setSuccessMessage("Cập nhật template thành công!");
                setSuccessModalVisible(true);
                setIsEditModalVisible(false);
                setIsViewModalVisible(false);
                fetchTemplates();
              } catch (error) {
                message.destroy();
                message.error("Cập nhật template thất bại!");
              }
            }}
            onCancel={() => setIsEditModalVisible(false)}
            width={800}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnClose
          >
            <Form form={editForm} layout="vertical">
              <Form.Item
                name="templateName"
                label="Tên template"
                rules={[
                  { required: true, message: "Vui lòng nhập tên template" },
                  { max: 100, message: "Không quá 100 ký tự" },
                ]}
              >
                <Input
                  placeholder="Nhập tên template"
                  maxLength={100}
                  showCount
                />
              </Form.Item>
              <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>
                Danh sách tiêu chí
              </div>
              <div
                style={{
                  overflowY: "auto",
                  maxHeight: 320,
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  padding: 8,
                  background: "#fafafa",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontWeight: 500,
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 2, paddingRight: 8 }}>Tên hạng mục</div>
                  <div style={{ width: 120, paddingRight: 8 }}>
                    Trọng số (%)
                  </div>
                  <div style={{ flex: 3, paddingRight: 8 }}>Mô tả</div>
                  <div style={{ width: 60 }}></div>
                </div>
                <Form.List name="criteria">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, idx) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "gradeCategory"]}
                            rules={[
                              { required: true, message: "Nhập tên hạng mục" },
                              { max: 100, message: "Không quá 100 ký tự" },
                            ]}
                            style={{
                              flex: 2,
                              marginBottom: 0,
                              paddingRight: 8,
                            }}
                          >
                            <Input
                              placeholder="Tên hạng mục"
                              maxLength={100}
                              showCount
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "weight"]}
                            rules={[
                              { required: true, message: "Nhập trọng số" },
                              {
                                type: "number",
                                min: 1,
                                max: 100,
                                message: "Từ 1 đến 100",
                              },
                            ]}
                            style={{
                              width: 120,
                              marginBottom: 0,
                              paddingRight: 8,
                            }}
                          >
                            <InputNumber
                              min={1}
                              max={100}
                              placeholder="%"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "description"]}
                            rules={[
                              { max: 250, message: "Không quá 250 ký tự" },
                            ]}
                            style={{
                              flex: 3,
                              marginBottom: 0,
                              paddingRight: 8,
                            }}
                          >
                            <Input
                              placeholder="Mô tả"
                              maxLength={250}
                              showCount
                            />
                          </Form.Item>
                          <Button
                            danger
                            size="small"
                            style={{ width: 48 }}
                            onClick={() => remove(name)}
                          >
                            Xóa
                          </Button>
                        </div>
                      ))}
                      <Form.Item
                        style={{
                          marginBottom: 0,
                          marginTop: 8,
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          type="dashed"
                          onClick={() => {
                            if (fields.length < 10) {
                              add({
                                gradeCategory: "",
                                weight: 1,
                                description: "",
                                displayOrder: fields.length + 1,
                              });
                            }
                          }}
                          block
                          icon={<PlusOutlined />}
                          disabled={fields.length >= 10}
                          style={{ fontWeight: 600 }}
                        >
                          Thêm tiêu chí{" "}
                          {fields.length >= 10 ? "(Tối đa 10)" : ""}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </Form>
          </Modal>

          <Modal
            open={successModalVisible}
            onCancel={() => {
              setSuccessModalVisible(false);
              fetchTemplates();
            }}
            footer={null}
            centered
            width={400}
            closable={false}
          >
            <div className="text-center py-6">
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                {successMessage}
              </Typography.Title>
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginBottom: 24 }}
              >
                Hệ thống đã cập nhật thông tin thành công
              </Typography.Text>
              <Button
                type="primary"
                style={{ minWidth: 120, height: 40, borderRadius: 6 }}
                onClick={() => {
                  setSuccessModalVisible(false);
                  fetchTemplates();
                }}
              >
                Đóng
              </Button>
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LevelFeedbackTemplateManagement;
