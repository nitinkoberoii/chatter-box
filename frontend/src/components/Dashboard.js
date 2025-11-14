import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import VoiceChatPanel from "./VoiceChatPanel";
import "./Dashboard.css";

const Dashboard = ({ currentUser, onLogout }) => {
  const { connected, onlineUsers, getOnlineUsers, incomingCall, activeCall } =
    useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  useEffect(() => {
    if (connected) {
      getOnlineUsers();
    }
  }, [connected, getOnlineUsers]);

  useEffect(() => {
    if (incomingCall || activeCall) {
      setShowVoicePanel(true);
    }
  }, [incomingCall, activeCall]);

  const filteredUsers = onlineUsers.filter((user) =>
    user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (username) => {
    setSelectedUser(username);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-mini">💬</div>
          <h1>ChatterBox</h1>
          <div
            className={`connection-status ${
              connected ? "connected" : "disconnected"
            }`}
          >
            <span className="status-dot"></span>
            <span className="status-text">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="avatar">{currentUser.charAt(0).toUpperCase()}</div>
            <span className="username">{currentUser}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar - User List */}
        <aside className={`sidebar ${selectedUser ? "hidden-mobile" : ""}`}>
          <div className="sidebar-header">
            <h2>Messages</h2>
            <div className="online-count">
              <span className="count-badge">{onlineUsers.length}</span>
              <span>online</span>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <UserList
            users={filteredUsers}
            onUserSelect={handleUserSelect}
            selectedUser={selectedUser}
            currentUser={currentUser}
          />
        </aside>

        {/* Main Chat Area */}
        <main className={`chat-area ${!selectedUser ? "hidden-mobile" : ""}`}>
          {selectedUser ? (
            <ChatWindow
              currentUser={currentUser}
              selectedUser={selectedUser}
              onBack={handleBackToList}
            />
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Select a chat to start messaging</h3>
                <p>Choose a user from the list to begin your conversation</p>
              </div>
            </div>
          )}
        </main>

        {/* Voice Chat Panel */}
        {showVoicePanel && (incomingCall || activeCall) && (
          <VoiceChatPanel
            currentUser={currentUser}
            onClose={() => setShowVoicePanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
