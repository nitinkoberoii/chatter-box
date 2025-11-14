import React, { useState, useRef } from "react";
import "./FileUpload.css";

const FileUpload = ({ onFileSelect, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      txt: "📃",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      zip: "📦",
      rar: "📦",
      mp3: "🎵",
      mp4: "🎬",
      default: "📁",
    };
    return icons[ext] || icons.default;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content file-upload-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Upload File</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div
          className={`drop-zone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input-hidden"
            onChange={handleChange}
          />

          {!selectedFile ? (
            <>
              <div className="upload-icon">📤</div>
              <p className="upload-text">Drag & drop a file here</p>
              <p className="upload-subtext">or click to browse</p>
              <p className="upload-limit">Maximum file size: 10MB</p>
            </>
          ) : (
            <div className="selected-file">
              <div className="file-preview">
                <span className="file-icon-large">
                  {getFileIcon(selectedFile.name)}
                </span>
                <div className="file-details">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-violet"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Send File
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
