import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import FileUpload from "./FileUpload";
import "./ChatWindow.css";

const ChatWindow = ({ currentUser, selectedUser, onBack }) => {
  const { messages, sendMessage, sendFile, initiateCall } = useSocket();
  const [messageInput, setMessageInput] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessages = messages[selectedUser] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(selectedUser, messageInput);
      setMessageInput("");
    }
  };

  const handleFileSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(",")[1];
      sendFile(selectedUser, file.name, file.size, base64Data);
      setShowFileUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceCall = () => {
    initiateCall(selectedUser);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const downloadFile = (fileName, fileData) => {
    const link = document.createElement("a");
    link.href = `data:application/octet-stream;base64,${fileData}`;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="chat-user-info">
          <div className="avatar avatar-sm">
            {selectedUser.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="chat-username">{selectedUser}</div>
            <div className="chat-status">
              <span className="status-dot status-online"></span>
              Online
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button
            className="icon-btn"
            onClick={handleVoiceCall}
            title="Start voice call"
          >
            📞
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {chatMessages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet</p>
            <span>Start the conversation!</span>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isOwn = msg.sender === currentUser;
            const isFile = msg.type === "file";

            return (
              <div
                key={index}
                className={`message ${isOwn ? "own-message" : "other-message"}`}
              >
                {!isOwn && (
                  <div className="message-avatar">
                    {msg.sender.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="message-content">
                  {isFile ? (
                    <div className="file-message">
                      <div className="file-icon">📁</div>
                      <div className="file-info">
                        <div className="file-name">{msg.file_name}</div>
                        <div className="file-size">
                          {formatFileSize(msg.file_size)}
                        </div>
                      </div>
                      <button
                        className="download-btn"
                        onClick={() =>
                          downloadFile(msg.file_name, msg.file_data)
                        }
                      >
                        ⬇️
                      </button>
                    </div>
                  ) : (
                    <div className="text-message">{msg.message}</div>
                  )}
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <button
          className="attach-btn"
          onClick={() => setShowFileUpload(true)}
          title="Attach file"
        >
          📎
        </button>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            className="message-input"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!messageInput.trim()}
          >
            ➤
          </button>
        </form>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onFileSelect={handleFileSelect}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
