import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Button,
  Typography,
  Form,
  Input,
  Select,
  Modal,
  List,
  Tag,
  Upload,
  Progress,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  PaperClipOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Firebase config
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

const CourseContentDetail = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("course-management");
  const [contentDetail, setContentDetail] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [editItemModalVisible, setEditItemModalVisible] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");

  // Firebase upload states
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileURL, setFileURL] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [addItemFileAccept, setAddItemFileAccept] = useState(
    ".pdf,application/pdf"
  );

  const [inputFileKey, setInputFileKey] = useState(Date.now());

  useEffect(() => {
    fetchContentDetail();
    fetchItemTypes();
  }, [contentId]);

  const fetchContentDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/CourseContent/${contentId}`
      );

      if (response.data?.isSucceed && response.data.data) {
        setContentDetail(response.data.data);
        setContentItems(response.data.data.courseContentItems || []);
      } else {
        setContentDetail(response.data || null);
      }
    } catch (error) {
      message.error("Không thể tải chi tiết nội dung khóa học");
      console.error("Error fetching content detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get(
        "https://instrulearnapplication.azurewebsites.net/api/ItemType/get-all"
      );

      if (response.data?.isSucceed && response.data.data) {
        setItemTypes(response.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách loại nội dung");
      console.error("Error fetching item types:", error);
    }
  };

  const handleAddItemTypeChange = (value) => {
    // Tìm tên loại nội dung
    const type = itemTypes.find((t) => t.itemTypeId === value);
    if (type && type.itemTypeName.toLowerCase().includes("video")) {
      setAddItemFileAccept("video/*");
    } else {
      setAddItemFileAccept(".pdf,application/pdf");
    }
    // Không reset file ở đây nữa!
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const itemTypeId = form.getFieldValue("itemTypeId");
      const type = itemTypes.find((t) => t.itemTypeId === itemTypeId);
      console.log("File đã chọn:", selectedFile);
      console.log("itemTypeId:", itemTypeId, "type:", type);
      // Kiểm tra loại file phù hợp
      if (type && type.itemTypeName.toLowerCase().includes("video")) {
        if (!selectedFile.type.startsWith("video/")) {
          message.error("Vui lòng chỉ chọn file video cho loại nội dung này");
          return;
        }
        setFileType("video");
      } else {
        if (selectedFile.type !== "application/pdf") {
          message.error("Vui lòng chỉ chọn file PDF cho loại nội dung này");
          return;
        }
        setFileType("pdf");
      }
      // Validate file size (maximum 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 10MB");
        return;
      }
      setFile(selectedFile);
      setFileURL("");
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewImage("");
      }
    }
  };

  const uploadFileToFirebase = async (uploadFile) => {
    if (!uploadFile) {
      message.error("Vui lòng chọn file trước khi tải lên");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    console.log("Starting upload to Firebase for file:", uploadFile.name);

    return new Promise((resolve, reject) => {
      const folderPath = fileType || "other";
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${uploadFile.name}`;
      const storageRef = ref(
        storage,
        `course_content/${folderPath}/${fileName}`
      );

      const uploadTask = uploadBytesResumable(storageRef, uploadFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log("Upload progress:", progressPercent);
          setUploadProgress(progressPercent);
        },
        (error) => {
          console.error("Upload error:", error);
          setIsUploading(false);
          message.error(`Lỗi tải lên: ${error.message}`);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("Upload complete. Download URL:", downloadURL);
            setFileURL(downloadURL);
            setIsUploading(false);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleAddItem = () => {
    form.resetFields();
    setFile(null);
    setFileType("");
    setFileURL("");
    setUploadProgress(0);
    setPreviewImage("");
    setAddItemModalVisible(true);
    setInputFileKey(Date.now());
  };

  const handleAddItemSubmit = async () => {
    console.log("Đã bấm nút Thêm");
    try {
      const values = await form.validateFields();
      setAddingItem(true);

      const fileFromForm = form.getFieldValue("file");
      console.log("File lấy từ form:", fileFromForm);
      // Log trạng thái trước khi upload
      console.log("Trước khi upload:", { fileFromForm, fileType, fileURL });

      if (!fileFromForm && !fileURL) {
        message.error("Vui lòng chọn file để tải lên");
        setAddingItem(false);
        return;
      }

      let itemDesValue = "";

      // Nếu có file và chưa upload thì upload luôn
      if (fileFromForm && !fileURL) {
        console.log(
          "Chuẩn bị upload file lên Firebase:",
          fileFromForm,
          fileType
        );
        try {
          console.log("Uploading file for new item");
          const fileUrl = await uploadFileToFirebase(fileFromForm);
          if (fileUrl) {
            console.log("File uploaded successfully:", fileUrl);
            itemDesValue = fileUrl;
          } else {
            message.error("Không thể tải file lên");
            setAddingItem(false);
            return;
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          message.error("Lỗi khi tải tệp lên Firebase");
          setAddingItem(false);
          return;
        }
      } else if (fileURL) {
        // Sử dụng URL đã upload trước đó
        itemDesValue = fileURL;
      }

      // Kiểm tra lại một lần nữa xem có itemDes không
      if (!itemDesValue) {
        message.error("Không có đường dẫn file");
        setAddingItem(false);
        return;
      }

      const newItem = {
        itemTypeId: parseInt(values.itemTypeId),
        contentId: parseInt(contentId),
        itemDes: itemDesValue,
      };

      console.log("Submitting new item:", newItem);

      const response = await axios.post(
        "https://instrulearnapplication.azurewebsites.net/api/CourseContentItem/create",
        newItem
      );

      if (response.data?.isSucceed) {
        message.success("Thêm nội dung mới thành công");
        setAddItemModalVisible(false);
        fetchContentDetail();

        // Reset file state
        setFile(null);
        setFileType("");
        setFileURL("");
        setUploadProgress(0);
        setPreviewImage("");
        form.resetFields(["file"]);
      } else {
        message.error(response.data?.message || "Thêm nội dung thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi thêm nội dung");
        console.error("Error adding item:", error);
      }
    } finally {
      setAddingItem(false);
    }
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFile(null);
    setFileType("");
    setFileURL("");
    setUploadProgress(0);
    setPreviewImage("");

    editForm.setFieldsValue({
      itemTypeId: item.itemTypeId,
      itemDes: item.itemDes,
      status: item.status,
    });

    setEditItemModalVisible(true);
  };

  const handleEditItemSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditingItem(true);

      // Kiểm tra xem có file được chọn không
      if (!file && !fileURL && !selectedItem.itemDes) {
        message.error("Vui lòng chọn file để tải lên");
        setEditingItem(false);
        return;
      }

      let itemDesValue = selectedItem.itemDes; // Giữ lại giá trị cũ nếu không có file mới

      // Nếu có file được chọn và chưa upload
      if (file && !fileURL) {
        try {
          console.log("Uploading file for edit item");
          const fileUrl = await uploadFileToFirebase(file);
          if (fileUrl) {
            console.log("File uploaded successfully:", fileUrl);
            itemDesValue = fileUrl;
          } else {
            message.error("Không thể tải file lên");
            setEditingItem(false);
            return;
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          message.error("Lỗi khi tải tệp lên Firebase");
          setEditingItem(false);
          return;
        }
      } else if (fileURL) {
        // Sử dụng URL đã upload trước đó
        itemDesValue = fileURL;
      }

      // Kiểm tra lại một lần nữa xem có itemDes không
      if (!itemDesValue) {
        message.error("Không có đường dẫn file");
        setEditingItem(false);
        return;
      }

      const updatedItem = {
        itemTypeId: parseInt(values.itemTypeId),
        contentId: parseInt(contentId),
        itemDes: itemDesValue,
        status: parseInt(values.status),
      };

      console.log("Updating item:", updatedItem);

      const response = await axios.put(
        `https://instrulearnapplication.azurewebsites.net/api/CourseContentItem/update/${selectedItem.itemId}`,
        updatedItem
      );

      if (response.data?.isSucceed) {
        message.success("Cập nhật nội dung thành công");
        setEditItemModalVisible(false);
        fetchContentDetail();

        // Reset file state
        setFile(null);
        setFileType("");
        setFileURL("");
        setUploadProgress(0);
        setPreviewImage("");
      } else {
        message.error(response.data?.message || "Cập nhật nội dung thất bại");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Lỗi khi cập nhật nội dung");
        console.error("Error updating item:", error);
      }
    } finally {
      setEditingItem(false);
    }
  };

  const getItemTypeLabel = (typeId) => {
    const type = itemTypes.find((t) => t.itemTypeId === typeId);
    return type ? type.itemTypeName : "Không xác định";
  };

  const getItemTypeIcon = (typeId) => {
    const type = itemTypes.find((t) => t.itemTypeId === typeId);
    if (!type) return <FileTextOutlined />;
    const name = type.itemTypeName.toLowerCase();
    if (name.includes("video")) return <VideoCameraOutlined />;
    if (name.includes("pdf")) return <FileTextOutlined />;
    if (name.includes("hình") || name.includes("image"))
      return <FileImageOutlined />;
    return <FileTextOutlined />;
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <FileImageOutlined />;
      case "video":
        return <VideoCameraOutlined />;
      case "document":
        return <FileTextOutlined />;
      default:
        return <PaperClipOutlined />;
    }
  };

  const renderItemContent = (item) => {
    const type = itemTypes.find((t) => t.itemTypeId === item.itemTypeId);
    const name = type?.itemTypeName?.toLowerCase() || "";
    if (name.includes("video")) {
      return (
        <div className="mt-2">
          <div className="mb-2 flex gap-2">
            <Tag color="blue" icon={<VideoCameraOutlined />}>
              Video
            </Tag>
            <Tag color={item.status === 0 ? "error" : "success"}>
              {item.status === 0 ? "Đã khóa" : "Đã mở khóa"}
            </Tag>
          </div>
          <div className="mb-2">
            <video
              src={item.itemDes}
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
              }}
            />
          </div>
        </div>
      );
    } else if (name.includes("pdf")) {
      return (
        <div className="mt-2">
          <div className="mb-2 flex gap-2">
            <Tag color="purple" icon={<FileTextOutlined />}>
              PDF
            </Tag>
            <Tag color={item.status === 0 ? "error" : "success"}>
              {item.status === 0 ? "Đã khóa" : "Đã mở khóa"}
            </Tag>
          </div>
          <Button
            type="link"
            onClick={() => {
              setCurrentPdfUrl(item.itemDes);
              setPdfViewerVisible(true);
            }}
          >
            Xem tài liệu
          </Button>
        </div>
      );
    } else if (name.includes("hình") || name.includes("image")) {
      return (
        <div className="mt-2">
          <div className="mb-2 flex gap-2">
            <Tag color="green" icon={<FileImageOutlined />}>
              Hình ảnh
            </Tag>
            <Tag color={item.status === 0 ? "error" : "success"}>
              {item.status === 0 ? "Đã khóa" : "Đã mở khóa"}
            </Tag>
          </div>
          <div className="mb-2">
            <img
              src={item.itemDes}
              alt="Content"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-2">
          <div className="mb-2 flex gap-2">
            <Tag color="default" icon={<FileTextOutlined />}>
              {type?.itemTypeName || "Khác"}
            </Tag>
            <Tag color={item.status === 0 ? "error" : "success"}>
              {item.status === 0 ? "Đã khóa" : "Đã mở khóa"}
            </Tag>
          </div>
          <Text>{item.itemDes}</Text>
        </div>
      );
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // File preview component for both add and edit modals
  const filePreview = () => {
    if (!file) return null;

    return (
      <div className="mt-4 p-4 border rounded">
        <div className="flex items-center mb-2">
          {getFileTypeIcon(fileType)}
          <span className="ml-2 font-medium">{file.name}</span>
        </div>
        <div className="text-sm text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB · {fileType}
        </div>
        {isUploading && (
          <Progress percent={uploadProgress} size="small" className="mt-2" />
        )}
        {fileURL && (
          <div className="mt-2 text-green-600 text-sm">
            Tệp đã được tải lên thành công!
          </div>
        )}
        {previewImage && fileType === "image" && (
          <div className="mt-3">
            <img
              src={previewImage}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "150px" }}
              className="mt-2 border rounded"
            />
          </div>
        )}
      </div>
    );
  };

  // Manual upload button for both add and edit modals
  const renderUploadButton = () => {
    return (
      <Button
        type="primary"
        onClick={uploadFileToFirebase}
        disabled={!file || isUploading || fileURL}
        loading={isUploading}
        icon={<UploadOutlined />}
        className="mt-2"
      >
        Tải lên Firebase
      </Button>
    );
  };

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
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={goBack}
            className="mb-4 p-0"
          >
            Quay lại danh sách
          </Button>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spin tip="Đang tải chi tiết nội dung..." />
            </div>
          ) : contentDetail ? (
            <div className="space-y-6">
              <Card
                bordered={false}
                className="shadow-md"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOutlined className="mr-2" />
                      <span>Danh sách nội dung</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                    >
                      Thêm nội dung
                    </Button>
                  </div>
                }
              >
                <Title level={3}>{contentDetail.heading}</Title>
                {contentItems.length > 0 ? (
                  <List
                    dataSource={contentItems}
                    renderItem={(item) => (
                      <List.Item
                        key={item.itemId}
                        actions={[
                          <Button
                            icon={<EditOutlined />}
                            type="text"
                            onClick={() => handleEditItem(item)}
                          >
                            Sửa
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getItemTypeIcon(item.itemTypeId)}
                          title={`Nội dung #${item.itemId}`}
                          description={renderItemContent(item)}
                        />
                      </List.Item>
                    )}
                    className="border rounded-lg"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="mb-2">Chưa có nội dung nào</div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                    >
                      Thêm nội dung mới
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <Title level={4} type="danger">
                Không tìm thấy thông tin chi tiết nội dung
              </Title>
              <Button type="primary" onClick={goBack} className="mt-4">
                Quay lại
              </Button>
            </div>
          )}

          {/* Add Item Modal */}
          <Modal
            title="Thêm nội dung mới"
            open={addItemModalVisible}
            onCancel={() => setAddItemModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setAddItemModalVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={addingItem}
                onClick={handleAddItemSubmit}
                disabled={isUploading}
              >
                Thêm
              </Button>,
            ]}
            width={600}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="itemTypeId"
                label="Loại nội dung"
                rules={[
                  { required: true, message: "Vui lòng chọn loại nội dung" },
                ]}
              >
                <Select
                  placeholder="Chọn loại nội dung"
                  onChange={handleAddItemTypeChange}
                >
                  {itemTypes.map((type) => (
                    <Option key={type.itemTypeId} value={type.itemTypeId}>
                      {type.itemTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Tải lên tệp"
                name="file"
                valuePropName="file"
                getValueFromEvent={(e) => {
                  if (
                    e &&
                    e.target &&
                    e.target.files &&
                    e.target.files.length > 0
                  ) {
                    return e.target.files[0];
                  }
                  return null;
                }}
                rules={[
                  { required: true, message: "Vui lòng chọn file để tải lên" },
                ]}
              >
                <input
                  type="file"
                  accept={addItemFileAccept}
                  className="block w-full text-sm border border-gray-300 rounded p-2"
                />
              </Form.Item>

              {/* Show a message about the field being overridden if file is uploaded */}
              {fileURL && (
                <div className="text-green-600 mb-2">
                  <strong>Trạng thái:</strong> Tệp đã được tải lên thành công và
                  sẵn sàng để thêm vào nội dung.
                </div>
              )}
            </Form>
          </Modal>

          {/* Edit Item Modal */}
          <Modal
            title="Chỉnh sửa nội dung"
            open={editItemModalVisible}
            onCancel={() => setEditItemModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setEditItemModalVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={editingItem}
                onClick={handleEditItemSubmit}
                disabled={isUploading}
              >
                Cập nhật
              </Button>,
            ]}
            width={600}
          >
            <Form form={editForm} layout="vertical">
              <Form.Item
                name="itemTypeId"
                label="Loại nội dung"
                rules={[
                  { required: true, message: "Vui lòng chọn loại nội dung" },
                ]}
              >
                <Select placeholder="Chọn loại nội dung">
                  {itemTypes.map((type) => (
                    <Option key={type.itemTypeId} value={type.itemTypeId}>
                      {type.itemTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value={0}>Đã khóa</Option>
                  <Option value={1}>Đã mở khóa</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Tải lên tệp mới">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm border border-gray-300 rounded p-2"
                />
                {file && renderUploadButton()}
                {filePreview()}
              </Form.Item>

              {/* Show a message about upload status */}
              {fileURL && (
                <div className="text-green-600 mb-2">
                  <strong>Trạng thái:</strong> Tệp đã được tải lên thành công và
                  sẵn sàng để cập nhật.
                </div>
              )}

              {selectedItem &&
                selectedItem.itemDes &&
                selectedItem.itemDes.startsWith("http") && (
                  <div className="border p-3 rounded mt-2">
                    <div className="font-medium mb-2">Nội dung hiện tại:</div>
                    {selectedItem.itemTypeId === 1 ? (
                      <img
                        src={selectedItem.itemDes}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "150px" }}
                      />
                    ) : selectedItem.itemTypeId === 2 ? (
                      <video
                        src={selectedItem.itemDes}
                        controls
                        style={{ maxWidth: "100%", maxHeight: "150px" }}
                      />
                    ) : (
                      <a
                        href={selectedItem.itemDes}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem tài liệu hiện tại
                      </a>
                    )}
                  </div>
                )}
            </Form>
          </Modal>

          {/* PDF Viewer Modal */}
          <Modal
            title="Xem tài liệu"
            open={pdfViewerVisible}
            onCancel={() => setPdfViewerVisible(false)}
            width={800}
            footer={null}
            bodyStyle={{ padding: 0 }}
          >
            <iframe
              src={`${currentPdfUrl}#toolbar=0`}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="PDF Viewer"
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourseContentDetail;
