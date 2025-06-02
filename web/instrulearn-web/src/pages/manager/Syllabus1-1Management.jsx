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
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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

const Syllabus1_1Management = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("Syllabus 1-1");
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLevel, setEditingLevel] = useState(null);
  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    type: "",
    message: "",
    description: "",
  });
  const [majors, setMajors] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
  const [pdfModal, setPdfModal] = useState({ visible: false, url: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

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
      } catch (err) {}
    };
    fetchMajors();
    fetchLevels();
  }, []);

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
    // {
    //   title: "Giá",
    //   dataIndex: "levelPrice",
    //   key: "levelPrice",
    //   render: (price) => `${price.toLocaleString("vi-VN")} VNĐ`,
    // },
    {
      title: "Link giáo trình",
      dataIndex: "syllabusLink",
      key: "syllabusLink",
      render: (link) =>
        link && link !== null && link !== "" ? (
          <>
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setPdfModal({ visible: true, url: link })}
              style={{ marginRight: 8 }}
            >
              Xem giáo trình
            </Button>
            {/* <a href={link} target="_blank" rel="noopener noreferrer">
              (Tải về)
            </a> */}
          </>
        ) : (
          <span style={{ color: "#888" }}>Chưa có giáo trình</span>
        ),
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
    setUploadedFileName("");
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
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

  // Upload PDF lên Firebase
  const handleUploadPDF = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      message.error("Chỉ cho phép tải lên file PDF!");
      return false;
    }
    setUploading(true);
    setUploadedFileName("");
    const storageRef = ref(storage, `syllabus-pdf/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        setUploading(false);
        setUploadedFileName("");
        message.error("Tải file thất bại: " + error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        form.setFieldsValue({ syllabusLink: downloadURL });
        setUploading(false);
        setUploadedFileName(file.name);
        message.success("Tải file PDF thành công!");
      }
    );
    return false; // Ngăn antd upload tự động
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingLevel) {
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
              title={"Sửa cấp độ"}
              open={modalVisible}
              onOk={handleModalOk}
              onCancel={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingLevel(null);
              }}
            >
              <Form form={form} layout="vertical">
                <Form.Item label="Chuyên ngành">
                  <Input
                    value={
                      majors.find((m) => m.majorId === editingLevel?.majorId)
                        ?.majorName || editingLevel?.majorId
                    }
                    disabled
                  />
                </Form.Item>
                <Form.Item label="Tên cấp độ">
                  <Input value={editingLevel?.levelName} disabled />
                </Form.Item>
                <Form.Item
                  name="levelPrice"
                  label="Giá cấp độ (VNĐ)"
                  style={{ display: "none" }}
                  rules={[
                    { required: true, message: "Vui lòng nhập giá cấp độ" },
                    {
                      validator: (_, value) => {
                        const sameMajorLevels = levels.filter(
                          (lv) =>
                            lv.majorId === editingLevel.majorId &&
                            lv.levelAssignedId !== editingLevel.levelAssignedId
                        );
                        const priceByLevel = {};
                        sameMajorLevels.forEach((lv) => {
                          priceByLevel[lv.levelName] = lv.levelPrice;
                        });
                        priceByLevel[editingLevel.levelName] = value;
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
                <Form.Item name="syllabusLink" label="Link giáo trình (PDF)">
                  <Input
                    placeholder="Dán link hoặc tải file PDF lên"
                    addonAfter={
                      <Upload
                        showUploadList={false}
                        beforeUpload={handleUploadPDF}
                        accept="application/pdf"
                        disabled={uploading}
                      >
                        <Button icon={<UploadOutlined />} loading={uploading}>
                          Tải PDF
                        </Button>
                      </Upload>
                    }
                  />
                </Form.Item>
                {uploadedFileName && (
                  <div style={{ color: "green", marginBottom: 8 }}>
                    Đã tải lên: <b>{uploadedFileName}</b>
                  </div>
                )}
                {form.getFieldValue("syllabusLink") && (
                  <Button
                    icon={<EyeOutlined />}
                    style={{ marginTop: 8, marginBottom: 8 }}
                    onClick={() =>
                      setPdfModal({
                        visible: true,
                        url: form.getFieldValue("syllabusLink"),
                      })
                    }
                  >
                    Xem trước giáo trình PDF
                  </Button>
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
            <Modal
              open={pdfModal.visible}
              footer={null}
              onCancel={() => setPdfModal({ visible: false, url: "" })}
              width={800}
              centered
              zIndex={2000}
            >
              <div style={{ height: 600 }}>
                <iframe
                  src={pdfModal.url}
                  title="Xem giáo trình PDF"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                />
              </div>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Syllabus1_1Management;
