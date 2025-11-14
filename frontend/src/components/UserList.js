import React from "react";
import "./UserList.css";

const UserList = ({ users, onUserSelect, selectedUser }) => {
  if (users.length === 0) {
    return (
      <div className="user-list-empty">
        <p>No users online</p>
        <span>🔍</span>
      </div>
    );
  }

  return (
    <div className="user-list">
      {users.map((user) => (
        <div
          key={user}
          className={`user-item ${selectedUser === user ? "active" : ""}`}
          onClick={() => onUserSelect(user)}
        >
          <div className="user-avatar">
            {user.charAt(0).toUpperCase()}
            <span className="status-indicator status-online"></span>
          </div>
          <div className="user-details">
            <div className="user-name">{user}</div>
            <div className="user-status">Online</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
