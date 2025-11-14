import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import "./VoiceChatPanel.css";

const VoiceChatPanel = ({ currentUser, onClose }) => {
  const { incomingCall, activeCall, acceptCall, rejectCall, endCall } =
    useSocket();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callState, setCallState] = useState("idle"); // idle, ringing, active

  useEffect(() => {
    if (incomingCall) {
      setCallState("ringing");
      playRingtone();
    } else if (activeCall) {
      setCallState("active");
      stopRingtone();
    } else {
      setCallState("idle");
      stopRingtone();
    }
  }, [incomingCall, activeCall]);

  useEffect(() => {
    let interval;
    if (callState === "active") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const playRingtone = () => {
    // In a real app, play an audio file
    console.log("Playing ringtone...");
  };

  const stopRingtone = () => {
    // In a real app, stop the audio
    console.log("Stopping ringtone...");
  };

  const handleAccept = () => {
    if (incomingCall) {
      acceptCall(incomingCall.call_id);
    }
  };

  const handleReject = () => {
    if (incomingCall) {
      rejectCall(incomingCall.call_id);
      onClose();
    }
  };

  const handleEnd = () => {
    if (activeCall) {
      endCall(activeCall.call_id);
      onClose();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, mute/unmute the microphone
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getCallerName = () => {
    if (incomingCall) {
      return incomingCall.caller;
    }
    if (activeCall) {
      return activeCall.caller === currentUser
        ? activeCall.receiver
        : activeCall.caller;
    }
    return "";
  };

  if (!incomingCall && !activeCall) {
    return null;
  }

  return (
    <div className="voice-chat-overlay">
      <div className="voice-chat-panel">
        {/* Header */}
        <div className="voice-header">
          <h3>Voice Call</h3>
          <button className="close-voice-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Caller Info */}
        <div className="caller-info">
          <div
            className={`caller-avatar ${
              callState === "active" ? "pulsing" : ""
            }`}
          >
            {getCallerName().charAt(0).toUpperCase()}
          </div>
          <h2 className="caller-name">{getCallerName()}</h2>

          {callState === "ringing" && (
            <p className="call-status">Incoming call...</p>
          )}
          {callState === "active" && (
            <p className="call-duration">{formatDuration(callDuration)}</p>
          )}
        </div>

        {/* Call Controls */}
        <div className="voice-controls">
          {callState === "ringing" && (
            <>
              <button className="voice-btn accept-btn" onClick={handleAccept}>
                <span className="btn-icon">📞</span>
                <span className="btn-label">Accept</span>
              </button>
              <button className="voice-btn reject-btn" onClick={handleReject}>
                <span className="btn-icon">❌</span>
                <span className="btn-label">Decline</span>
              </button>
            </>
          )}

          {callState === "active" && (
            <>
              <button
                className={`voice-btn ${isMuted ? "muted-btn" : "mute-btn"}`}
                onClick={toggleMute}
              >
                <span className="btn-icon">{isMuted ? "🔇" : "🎤"}</span>
                <span className="btn-label">{isMuted ? "Unmute" : "Mute"}</span>
              </button>
              <button className="voice-btn end-btn" onClick={handleEnd}>
                <span className="btn-icon">📵</span>
                <span className="btn-label">End Call</span>
              </button>
            </>
          )}
        </div>

        {/* Audio Visualization (placeholder) */}
        {callState === "active" && (
          <div className="audio-visualizer">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatPanel;
