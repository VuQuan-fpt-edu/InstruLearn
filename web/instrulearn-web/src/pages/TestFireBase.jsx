import React, { useState } from "react";
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

function TestFireBase() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        setFileType("image");
      } else if (selectedFile.type.startsWith("video/")) {
        setFileType("video");
      } else if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileType("document");
      } else {
        setFileType("other");
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      setUploadStatus("Vui lòng chọn file để upload");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadStatus("Đang upload...");
    setFileURL("");

    const folderPath = fileType || "other";
    const storageRef = ref(storage, `uploads/${folderPath}/${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressPercent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progressPercent);
      },
      (error) => {
        setUploadStatus(`Lỗi: ${error.message}`);
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFileURL(downloadURL);
          setUploadStatus("Upload thành công!");
          setIsUploading(false);
        });
      }
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">
        Upload File lên Firebase Storage
      </h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Chọn file (Hình ảnh, Video, Documents)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm border border-gray-300 rounded p-2"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
      </div>

      {file && (
        <div className="mb-4">
          <p className="text-sm">
            <strong>File đã chọn:</strong> {file.name}
          </p>
          <p className="text-sm">
            <strong>Loại:</strong> {fileType}
          </p>
          <p className="text-sm">
            <strong>Kích thước:</strong> {(file.size / 1024 / 1024).toFixed(2)}{" "}
            MB
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-2 px-4 rounded font-medium ${
          !file || isUploading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isUploading ? "Đang Upload..." : "Upload File"}
      </button>

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1 text-center">{progress}%</p>
        </div>
      )}

      {uploadStatus && (
        <div
          className={`mt-4 p-3 rounded ${
            uploadStatus.includes("Lỗi")
              ? "bg-red-100 text-red-700"
              : uploadStatus.includes("thành công")
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <p>{uploadStatus}</p>
        </div>
      )}

      {fileURL && (
        <div className="mt-4">
          <p className="font-medium mb-2">File đã được upload:</p>

          {fileType === "image" && (
            <img
              src={fileURL}
              alt="Uploaded"
              className="w-full h-auto rounded mb-2"
            />
          )}

          {fileType === "video" && (
            <video className="w-full h-auto rounded mb-2" controls>
              <source src={fileURL} />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          )}

          <a
            href={fileURL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Mở file trong tab mới
          </a>
        </div>
      )}
    </div>
  );
}

export default TestFireBase;
