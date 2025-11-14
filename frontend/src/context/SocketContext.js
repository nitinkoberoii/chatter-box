import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children, currentUser }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const SERVER_URL = "http://localhost:5000";
    const newSocket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.id);
      setConnected(true);

      // Notify server that user is online
      if (currentUser) {
        newSocket.emit("user_online", { username: currentUser });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    newSocket.on("connection_response", (data) => {
      console.log("Connection response:", data);
    });

    newSocket.on("online_users", (data) => {
      console.log("Online users:", data.users);
      setOnlineUsers(data.users.filter((user) => user !== currentUser));
    });

    newSocket.on("user_status_changed", (data) => {
      console.log("User status changed:", data);
      setOnlineUsers(data.online_users.filter((user) => user !== currentUser));
    });

    newSocket.on("private_message", (data) => {
      console.log("Private message received:", data);
      const chatKey = data.sender;
      setMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), data],
      }));
    });

    newSocket.on("file_received", (data) => {
      console.log("File received:", data);
      const chatKey = data.sender;
      setMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), data],
      }));
    });

    newSocket.on("incoming_call", (data) => {
      console.log("Incoming call:", data);
      setIncomingCall(data);
    });

    newSocket.on("call_accepted", (data) => {
      console.log("Call accepted:", data);
      setActiveCall(data);
      setIncomingCall(null);
    });

    newSocket.on("call_rejected", (data) => {
      console.log("Call rejected:", data);
      setActiveCall(null);
      setIncomingCall(null);
    });

    newSocket.on("call_ended", (data) => {
      console.log("Call ended:", data);
      setActiveCall(null);
      setIncomingCall(null);
    });

    newSocket.on("error", (data) => {
      console.error("Socket error:", data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser]);

  const sendMessage = (receiver, message) => {
    if (socket && connected) {
      const messageData = {
        sender: currentUser,
        receiver,
        message,
        timestamp: new Date().toISOString(),
      };

      socket.emit("private_message", messageData);

      // Add to local messages
      const chatKey = receiver;
      setMessages((prev) => ({
        ...prev,
        [chatKey]: [
          ...(prev[chatKey] || []),
          { ...messageData, sender: currentUser },
        ],
      }));
    }
  };

  const sendFile = (receiver, fileName, fileSize, fileData) => {
    if (socket && connected) {
      socket.emit("file_transfer", {
        sender: currentUser,
        receiver,
        file_name: fileName,
        file_size: fileSize,
        file_data: fileData,
      });
    }
  };

  const initiateCall = (receiver) => {
    if (socket && connected) {
      socket.emit("initiate_voice_call", {
        caller: currentUser,
        receiver,
      });
    }
  };

  const acceptCall = (callId) => {
    if (socket && connected) {
      socket.emit("accept_call", {
        call_id: callId,
        username: currentUser,
      });
    }
  };

  const rejectCall = (callId) => {
    if (socket && connected) {
      socket.emit("reject_call", {
        call_id: callId,
      });
      setIncomingCall(null);
    }
  };

  const endCall = (callId) => {
    if (socket && connected) {
      socket.emit("end_call", {
        call_id: callId,
        username: currentUser,
      });
      setActiveCall(null);
    }
  };

  const getOnlineUsers = () => {
    if (socket && connected) {
      socket.emit("get_online_users");
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    messages,
    incomingCall,
    activeCall,
    sendMessage,
    sendFile,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getOnlineUsers,
    setMessages,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
