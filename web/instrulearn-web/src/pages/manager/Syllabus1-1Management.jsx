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
  Spin,
  Tag,
  Upload,
  Progress,
  Input,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  UploadOutlined,
  FileOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
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

const { Content } = Layout;
const { Title } = Typography;

// Firebase config giống trang LevelManagement
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

const Syllabus11Management = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("syllabus");
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLevel, setEditingLevel] = useState(null);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileURL, setFileURL] = useState("");

  useEffect(() => {
    fetchLevels();
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
      message.error("Không thể tải danh sách giáo trình");
    } finally {
      setLoading(false);
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

  const handleEditSyllabus = (record) => {
    setEditingLevel(record);
    setFile(null);
    setFileURL("");
    setFileType("");
    setUploadProgress(0);
    setIsUploading(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      if (
        !fileType.includes("pdf") &&
        !fileType.includes("msword") &&
        !fileType.includes(
          "openxmlformats-officedocument.wordprocessingml.document"
        )
      ) {
        message.error("Vui lòng chỉ chọn file PDF hoặc Word");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 10MB");
        return;
      }
      setFile(selectedFile);
      setFileURL("");
      setFileType(fileType.includes("pdf") ? "pdf" : "word");
      message.info(
        `Đã chọn file ${fileType.includes("pdf") ? "PDF" : "Word"}: ${
          selectedFile.name
        }`
      );
    }
  };

  const uploadFileToFirebase = async () => {
    if (!file) {
      message.error("Vui lòng chọn file trước khi tải lên");
      return null;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `syllabus/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => {
            setIsUploading(false);
            message.error(`Lỗi tải lên: ${error.message}`);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setFileURL(downloadURL);
              setIsUploading(false);
              message.success("Tải file lên thành công");
              resolve(downloadURL);
            } catch (error) {
              message.error("Không thể lấy đường dẫn tải xuống");
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setIsUploading(false);
      message.error("Lỗi khởi tạo upload");
      return null;
    }
  };

  const handleModalOk = async () => {
    try {
      if (!file) {
        message.error("Vui lòng chọn file giáo trình để tải lên");
        return;
      }
      message.loading("Đang tải file lên và cập nhật...", 0);
      let syllabusLink = fileURL;
      // Luôn upload file mới nếu có
      if (file) {
        syllabusLink = await uploadFileToFirebase();
        if (!syllabusLink) {
          message.destroy();
          return;
        }
      }
      if (editingLevel) {
        // Gọi API cập nhật syllabusLink
        const updateData = {
          levelName: editingLevel.levelName, // Giữ nguyên
          syllabusLink,
        };
        try {
          const response = await axios.put(
            `https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/update/${editingLevel.levelAssignedId}`,
            updateData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          message.destroy();
          if (response.data && response.data.isSucceed) {
            message.success("Cập nhật giáo trình thành công");
            setIsModalVisible(false);
            fetchLevels();
          } else {
            message.error(response.data?.message || "Cập nhật thất bại");
          }
        } catch (error) {
          message.destroy();
          message.error(
            error.response?.data?.message ||
              "Có lỗi xảy ra khi cập nhật giáo trình"
          );
        }
      }
    } catch (error) {
      message.destroy();
      message.error("Có lỗi xảy ra khi xác thực dữ liệu");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "levelAssignedId",
      key: "levelAssignedId",
      width: "10%",
    },
    {
      title: "Tên cấp độ",
      dataIndex: "levelName",
      key: "levelName",
      width: "25%",
    },
    {
      title: "Chuyên ngành",
      dataIndex: "majorId",
      key: "majorId",
      width: "25%",
      render: (majorId) => {
        const major = majors.find((m) => m.majorId === majorId);
        return major ? major.majorName : "N/A";
      },
    },
    {
      title: "Giáo trình",
      dataIndex: "syllabusLink",
      key: "syllabusLink",
      width: "30%",
      render: (syllabusLink) => {
        if (!syllabusLink) {
          return <Tag color="warning">Chưa có</Tag>;
        }
        const extension = syllabusLink.split(".").pop().toLowerCase();
        const isPdf = extension === "pdf";
        const isWord = ["doc", "docx"].includes(extension);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileOutlined style={{ color: isPdf ? "#ff4d4f" : "#1890ff" }} />
            <span style={{ color: isPdf ? "#ff4d4f" : "#1890ff" }}>
              {isPdf ? "Tài liệu PDF" : isWord ? "Tài liệu Word" : "Tệp"}
            </span>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => window.open(syllabusLink, "_blank")}
              style={{
                background: isPdf ? "#ff4d4f" : "#1890ff",
                borderColor: isPdf ? "#ff4d4f" : "#1890ff",
              }}
            >
              Tải xuống
            </Button>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Thêm/Chỉnh sửa giáo trình">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEditSyllabus(record)}
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
        <Content className="p-6 bg-gray-50" style={{ marginTop: "64px" }}>
          <div className="mb-6">
            <Title level={3}>Quản lý giáo trình</Title>
          </div>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Space>
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
                  showTotal: (total) => `Tổng số ${total} giáo trình`,
                }}
              />
            </Spin>
          </Card>
          <Modal
            title={"Thêm/Chỉnh sửa giáo trình"}
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
            destroyOnClose={true}
            maskClosable={false}
            keyboard={false}
            closable={true}
            okButtonProps={{ disabled: isUploading }}
            okText="Lưu"
            cancelText="Hủy"
            width={600}
            centered={true}
          >
            <Form form={form} layout="vertical">
              <Form.Item label="Tên cấp độ">
                <Input value={editingLevel?.levelName || ""} disabled />
              </Form.Item>
              <Form.Item label="Chuyên ngành">
                <Input
                  value={
                    majors.find((m) => m.majorId === editingLevel?.majorId)
                      ?.majorName || ""
                  }
                  disabled
                />
              </Form.Item>
              <Form.Item label="Tải giáo trình lên" required>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                  className="block w-full text-sm border border-gray-300 rounded-md p-2 hover:border-blue-500 transition-colors"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Hỗ trợ file PDF và Word (doc, docx). Tối đa 10MB.
                </div>
                {file && !isUploading && !fileURL && (
                  <div className="mt-2">
                    <span>{file.name}</span>
                  </div>
                )}
                {isUploading && (
                  <div className="mt-2">
                    <Progress
                      percent={uploadProgress}
                      size="small"
                      status="active"
                      strokeColor="#1890ff"
                    />
                    <div className="text-center text-gray-500 mt-1">
                      Đang tải file lên... {uploadProgress}%
                    </div>
                  </div>
                )}
                {fileURL && (
                  <div className="mt-2 text-green-600 text-sm">
                    File đã tải lên thành công!
                  </div>
                )}
              </Form.Item>
              {editingLevel?.syllabusLink && !file && !fileURL && (
                <Form.Item label="Giáo trình hiện tại">
                  <a
                    href={editingLevel.syllabusLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadOutlined /> Xem file hiện tại
                  </a>
                </Form.Item>
              )}
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Syllabus11Management;
