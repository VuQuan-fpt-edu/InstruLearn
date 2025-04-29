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
  Progress,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UploadOutlined,
  FileOutlined,
  DownloadOutlined,
  WarningOutlined,
  PaperClipOutlined,
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
const { Option } = Select;

// Định nghĩa thứ tự và giá tối thiểu của các cấp độ
const LEVEL_ORDER = {
  "Mới bắt đầu": 1,
  "Sơ cấp": 2,
  "Trung cấp": 3,
  "Nâng cao": 4,
};

const MIN_PRICE_DIFFERENCE = 50000; // Chênh lệch giá tối thiểu giữa các cấp độ

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4EaRe-CrB3u7lYm2HZmHqIjE6E_PtaFM",
  authDomain: "sdn-project-aba8a.firebaseapp.com",
  projectId: "sdn-project-aba8a",
  storageBucket: "sdn-project-aba8a.appspot.com",
  messagingSenderId: "953028355031",
  appId: "1:953028355031:web:7dfc4f2a85c932e507e192",
  measurementId: "G-63KQ2X3RCL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileURL, setFileURL] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentLevelName, setCurrentLevelName] = useState("");
  const [viewerError, setViewerError] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deletingLevelRecord, setDeletingLevelRecord] = useState(null);

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
        "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/get-all"
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
        "https://instrulearnapplication.azurewebsites.net/api/Major/get-all"
      );
      setMajors(response.data.data);
    } catch (error) {
      console.error("Error fetching majors:", error);
      message.error("Không thể tải danh sách chuyên ngành");
    }
  };

  const handleAddLevel = () => {
    console.log("Mở modal thêm mới");
    // Đảm bảo reset form trước khi mở modal thêm mới
    resetFormState();
    setIsModalVisible(true);
  };

  const handleEditLevel = (record) => {
    console.log("Mở modal chỉnh sửa", record);
    // Reset form trước khi thiết lập giá trị mới
    resetFormState();

    // Thiết lập giá trị cho form chỉnh sửa
    setEditingLevel(record);
    setSelectedMajor(record.majorId);
    form.setFieldsValue({
      ...record,
      syllabusLink: record.syllabusLink || "",
    });

    // Cập nhật các giới hạn giá nếu cần
    updatePriceConstraints(record.majorId);

    // Mở modal
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

  const handleDeleteLevel = (record) => {
    console.log(
      "handleDeleteLevel called, preparing delete confirmation for record:",
      record
    );
    setDeletingLevelRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingLevelRecord) return;

    const recordToDelete = deletingLevelRecord;
    console.log(
      `Xác nhận xóa cấp độ với ID: ${recordToDelete.levelAssignedId}`
    );
    setIsDeleteConfirmVisible(false); // Đóng modal xác nhận trước
    message.loading("Đang xóa...", 0);

    try {
      const response = await axios.delete(
        `https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/delete/${recordToDelete.levelAssignedId}`
      );
      message.destroy(); // Xóa thông báo loading

      console.log("API Delete Response:", response.data);

      if (response.data && response.data.isSucceed) {
        message.success("Xóa cấp độ thành công");
        setDeletingLevelRecord(null); // Reset record đang xóa
        fetchLevels(); // Tải lại danh sách cấp độ
      } else {
        message.error(
          response.data?.message ||
            "Không thể xóa cấp độ. Kiểm tra xem cấp độ có đang được sử dụng không."
        );
        setDeletingLevelRecord(null); // Reset record đang xóa
      }
    } catch (error) {
      message.destroy(); // Xóa thông báo loading
      setDeletingLevelRecord(null); // Reset record đang xóa
      console.error("Lỗi khi xóa cấp độ:", error);
      // Hiển thị thông báo lỗi chi tiết hơn từ server nếu có
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Headers:", error.response.headers);
        message.error(
          `Lỗi ${error.response.status}: ${
            error.response.data?.message ||
            error.response.data ||
            "Không thể xóa cấp độ. Vui lòng thử lại."
          }`
        );
      } else if (error.request) {
        console.error("Error Request:", error.request);
        message.error(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        console.error("Error Message:", error.message);
        message.error(`Lỗi: ${error.message}`);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type (PDF hoặc Word)
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

      // Validate file size (maximum 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 10MB");
        return;
      }

      setFile(selectedFile);
      setFileURL(""); // Reset file URL khi chọn file mới
      setFileType(fileType.includes("pdf") ? "pdf" : "word");

      // Hiển thị thông tin file được chọn
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
            console.error("Upload error:", error);
            setIsUploading(false);
            message.error(`Lỗi tải lên: ${error.message}`);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setFileURL(downloadURL);
              form.setFieldsValue({ syllabusLink: downloadURL });
              setIsUploading(false);
              message.success("Tải file lên thành công");
              resolve(downloadURL);
            } catch (error) {
              console.error("Error getting download URL:", error);
              message.error("Không thể lấy đường dẫn tải xuống");
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error initializing upload:", error);
      setIsUploading(false);
      message.error("Lỗi khởi tạo upload");
      return null;
    }
  };

  const handleDownloadFile = async (url, fileType) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split("/").pop().split("?")[0];
      const decodedFileName = decodeURIComponent(
        fileName.replace("syllabus%2F", "")
      );

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = decodedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      message.success("Đang tải xuống file...");
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Không thể tải xuống file. Vui lòng thử lại sau.");
    }
  };

  const isValidFirebaseUrl = (url) => {
    return url && url.startsWith("https://firebasestorage.googleapis.com/");
  };

  const getFileTypeInfo = (url) => {
    if (!url) return { icon: null, color: "", text: "", type: "" };

    // Xử lý URL từ Firebase
    if (url.includes("firebasestorage.googleapis.com")) {
      // Lấy tên file từ URL Firebase (nằm giữa /o/ và ?)
      const fileNameMatch = url.match(/\/o\/([^?]+)/);
      if (fileNameMatch) {
        const fileName = decodeURIComponent(
          fileNameMatch[1].replace("syllabus%2F", "")
        );
        const extension = fileName.split(".").pop().toLowerCase();

        if (extension === "pdf") {
          return {
            icon: <FileOutlined style={{ fontSize: "16px" }} />,
            color: "#ff4d4f",
            text: "PDF",
            type: "pdf",
          };
        } else if (["doc", "docx"].includes(extension)) {
          return {
            icon: <FileOutlined style={{ fontSize: "16px" }} />,
            color: "#1890ff",
            text: "Word",
            type: "word",
          };
        }
      }
    }

    // Xử lý đường dẫn thông thường
    const extension = url.split(".").pop().toLowerCase();
    if (extension === "pdf") {
      return {
        icon: <FileOutlined style={{ fontSize: "16px" }} />,
        color: "#ff4d4f",
        text: "PDF",
        type: "pdf",
      };
    } else if (["doc", "docx"].includes(extension)) {
      return {
        icon: <FileOutlined style={{ fontSize: "16px" }} />,
        color: "#1890ff",
        text: "Word",
        type: "word",
      };
    }

    return {
      icon: <FileOutlined style={{ fontSize: "16px" }} />,
      color: "default",
      text: "Tệp",
      type: "other",
    };
  };

  // File preview component
  const filePreview = () => {
    if (!file) return null;

    return (
      <div className="mt-4 p-4 border rounded">
        <div className="flex items-center mb-2">
          <PaperClipOutlined />
          <span className="ml-2 font-medium">{file.name}</span>
        </div>
        <div className="text-sm text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB · {fileType.toUpperCase()}
        </div>
        {isUploading && (
          <Progress percent={uploadProgress} size="small" className="mt-2" />
        )}
        {fileURL && (
          <div className="mt-2 text-green-600 text-sm">
            Tệp đã được tải lên thành công!
          </div>
        )}
      </div>
    );
  };

  const handleViewFile = (url, levelName) => {
    const extension = url.split(".").pop().toLowerCase();
    setFileType(extension === "pdf" ? "pdf" : "word");
    setCurrentPdfUrl(url);
    setCurrentLevelName(levelName);
    setViewerError(false);
    setIsPdfModalVisible(true);
  };

  const handleViewerError = () => {
    setViewerError(true);
  };

  const resetFormState = () => {
    // Reset các state liên quan đến file
    setFile(null);
    setFileURL("");
    setFileType("");
    setUploadProgress(0);
    setIsUploading(false);

    // Reset form
    form.resetFields();

    // Reset editing state
    setEditingLevel(null);
    setSelectedMajor(null);
  };

  // Tạo hàm mới để đóng modal an toàn
  const closeModal = () => {
    console.log("Đóng modal hoàn toàn");
    setIsModalVisible(false);
    setTimeout(() => {
      resetFormState();
    }, 300);
  };

  // Cập nhật hàm handleModalCancel để gọi closeModal
  const handleModalCancel = () => {
    console.log("handleModalCancel được gọi");
    // Hiển thị xác nhận nếu đang có file được chọn nhưng chưa lưu
    if (file && !fileURL) {
      Modal.confirm({
        title: "Xác nhận hủy",
        content:
          "Bạn có file đang được chọn chưa được tải lên. Bạn có chắc muốn hủy không?",
        okText: "Có",
        cancelText: "Không",
        onOk() {
          closeModal();
        },
      });
    } else {
      closeModal();
    }
  };

  const handleModalOk = async () => {
    console.log("handleModalOk được gọi");

    // Kiểm tra tính hợp lệ của form
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      // Đóng modal ngay lập tức (cách tiếp cận triệt để)
      setIsModalVisible(false);

      if (editingLevel) {
        // Khi cập nhật, chỉ gửi các trường cần thiết theo API
        const updateData = {
          levelName: values.levelName,
          syllabusLink: editingLevel.syllabusLink || "",
        };

        console.log("Cập nhật cấp độ với dữ liệu:", updateData);

        message.loading("Đang cập nhật...", 0);
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

          message.destroy(); // Xóa thông báo loading
          console.log("API Response:", response.data);

          if (response.data && response.data.isSucceed) {
            message.success("Cập nhật cấp độ thành công");
            setIsModalVisible(false); // Đóng modal
            fetchLevels(); // Cập nhật lại danh sách
          } else {
            message.error(response.data?.message || "Cập nhật thất bại");
          }
        } catch (error) {
          message.destroy(); // Xóa thông báo loading
          console.error("Lỗi khi cập nhật cấp độ:", error);
          message.error(
            error.response?.data?.message || "Có lỗi xảy ra khi cập nhật cấp độ"
          );
        }
      } else {
        // Thêm mới cấp độ
        message.loading("Đang thêm mới...", 0);
        try {
          // Đảm bảo syllabusLink luôn có giá trị (chuỗi rỗng nếu không có file)
          const createData = {
            ...values,
            syllabusLink: "",
          };
          const response = await axios.post(
            "https://instrulearnapplication.azurewebsites.net/api/LevelAssigned/create",
            createData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );

          message.destroy(); // Xóa thông báo loading
          console.log("API Response:", response.data);

          if (response.data && response.data.isSucceed) {
            message.success("Thêm cấp độ mới thành công");
            setIsModalVisible(false); // Đóng modal
            fetchLevels(); // Cập nhật lại danh sách
          } else {
            message.error(response.data?.message || "Thêm mới thất bại");
          }
        } catch (error) {
          message.destroy(); // Xóa thông báo loading
          console.error("Lỗi khi thêm mới cấp độ:", error);
          message.error(
            error.response?.data?.message || "Có lỗi xảy ra khi thêm cấp độ mới"
          );
        }
      }
    } catch (validationError) {
      console.error("Lỗi khi xác thực form:", validationError);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập");
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
      width: "20%",
    },
    {
      title: "Chuyên ngành",
      dataIndex: "majorId",
      key: "majorId",
      width: "20%",
      render: (majorId) => {
        const major = majors.find((m) => m.majorId === majorId);
        return major ? major.majorName : "N/A";
      },
    },
    {
      title: "Giá",
      dataIndex: "levelPrice",
      key: "levelPrice",
      width: "20%",
      render: (price) => `${price.toLocaleString()}/Buổi VND`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
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
              onClick={() => {
                console.log(
                  "Delete button onClick triggered for record:",
                  record
                );
                handleDeleteLevel(record);
              }}
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
            onCancel={handleModalCancel}
            destroyOnClose={true}
            maskClosable={false}
            keyboard={false} // Vô hiệu hóa đóng modal bằng phím Esc
            closable={true} // Hiển thị nút X ở góc
            okButtonProps={{ disabled: isUploading }}
            okText="Lưu"
            cancelText="Hủy"
            afterClose={() => {
              console.log("Modal afterClose event");
              resetFormState();
            }}
            width={700} // Tăng kích thước modal
            centered={true} // Hiển thị ở giữa màn hình
            className="level-modal" // Thêm class để dễ debug
          >
            <Form form={form} layout="vertical">
              {/* Trường Chuyên ngành - chỉ hiển thị và cho phép chọn khi thêm mới */}
              <Form.Item
                name="majorId"
                label="Chuyên ngành"
                rules={[
                  {
                    required: !editingLevel,
                    message: "Vui lòng chọn chuyên ngành",
                  },
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

              {/* Trường Tên cấp độ - luôn cho phép chỉnh sửa */}
              <Form.Item
                name="levelName"
                label="Tên cấp độ"
                rules={[
                  { required: true, message: "Vui lòng chọn tên cấp độ" },
                ]}
              >
                {editingLevel ? (
                  <Input placeholder="Nhập tên cấp độ" />
                ) : (
                  <Select
                    placeholder="Chọn tên cấp độ"
                    disabled={!selectedMajor}
                    onChange={handleLevelNameChange}
                  >
                    {availableLevels.map((level) => (
                      <Option key={level} value={level}>
                        {level}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              {/* Trường Giá/Buổi - chỉ hiển thị và cho phép nhập khi thêm mới */}
              {!editingLevel && (
                <Form.Item
                  name="levelPrice"
                  label="Giá/Buổi"
                  rules={[
                    { required: !editingLevel, message: "Vui lòng nhập giá" },
                    {
                      validator: (_, value) => {
                        if (!editingLevel) {
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
              )}
            </Form>
          </Modal>

          {/* Modal xác nhận xóa */}
          <Modal
            title="Xác nhận xóa"
            open={isDeleteConfirmVisible}
            onOk={confirmDelete}
            onCancel={() => {
              setIsDeleteConfirmVisible(false);
              setDeletingLevelRecord(null);
              console.log("Đã hủy thao tác xóa");
            }}
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            centered
          >
            <p>
              Bạn có chắc chắn muốn xóa cấp độ{" "}
              <strong>{deletingLevelRecord?.levelName}</strong> không?
            </p>
            <p>Hành động này không thể hoàn tác.</p>
          </Modal>

          {/* Modal xem file */}
          <Modal
            title={`Giáo trình cấp độ ${currentLevelName}`}
            open={isPdfModalVisible}
            onCancel={() => {
              setIsPdfModalVisible(false);
              setViewerError(false);
            }}
            width={1000}
            footer={[
              <Button
                key="download"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => window.open(currentPdfUrl, "_blank")}
              >
                Tải xuống
              </Button>,
              <Button
                key="close"
                onClick={() => {
                  setIsPdfModalVisible(false);
                  setViewerError(false);
                }}
              >
                Đóng
              </Button>,
            ]}
            bodyStyle={{ height: "80vh", padding: 0 }}
          >
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              {viewerError ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-red-500 mb-4">
                    <WarningOutlined style={{ fontSize: "32px" }} />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Không thể hiển thị file. Vui lòng tải xuống để xem.
                  </p>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(currentPdfUrl, "_blank")}
                  >
                    Tải xuống
                  </Button>
                </div>
              ) : (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    currentPdfUrl
                  )}&embedded=true`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  onError={handleViewerError}
                  title="File Viewer"
                />
              )}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: viewerError ? "none" : "block",
                }}
              >
                <Spin size="large" />
              </div>
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LevelManagement;
