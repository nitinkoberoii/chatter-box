# 💬 ChatterBox - Distributed Chat Application

> A full-stack distributed real-time chat application with file sharing and voice communication capabilities.

![ChatterBox](https://img.shields.io/badge/ChatterBox-v1.0-8b5cf6)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-black)
![License](https://img.shields.io/badge/License-Educational-green)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Quick Setup](#-quick-setup)
- [Detailed Setup Instructions](#-detailed-setup-instructions)
- [Technologies Used](#-technologies-used)

---

## 🌟 Overview

**ChatterBox** is a distributed chat application built for the **Distributed and Parallel Computing** course. It demonstrates real-time communication using WebSocket technology, distributed system architecture, and concurrent client handling.

The application enables users to:

- Exchange instant messages in real-time
- Share files securely between users
- Make voice calls using UDP protocol
- See who's online and available
- Access chat history stored in a distributed database

**Key Highlights:**

- **Distributed Architecture**: Client-server model with concurrent request handling
- **Real-time Communication**: WebSocket (Socket.IO) for instant messaging
- **Low-latency Voice**: UDP protocol for voice transmission
- **Beautiful UI**: Modern, responsive design with white and violet theme
- **Secure**: Password hashing, input validation, and file size limits

---

## ✨ Features

### Core Features

🔐 **User Authentication**

- Secure registration with unique username validation
- Password hashing using bcrypt (12 salt rounds)
- Session-based authentication
- Login/logout functionality

💬 **Real-time Private Messaging**

- Instant message delivery (< 100ms latency)
- One-on-one private conversations
- Message persistence in SQLite database
- Chat history retrieval
- Typing indicators (optional)

📁 **File Sharing**

- Drag & drop file upload interface
- File size limit: 10MB
- Support for multiple file types (.txt, .pdf, .png, .jpg, .zip, .docx, etc.)
- Base64 encoding for secure transfer
- One-click download for received files
- File metadata display (name, size)

🎙️ **Voice Chat**

- UDP-based real-time voice calls
- Call initiation and incoming call notifications
- Accept/Reject call controls
- Mute/Unmute functionality
- Call duration timer
- Audio visualizer animation
- Call status indicators

👥 **User Management**

- Real-time online/offline status
- Online users list with search
- User count badge
- Connection status indicator
- User avatars with initials

🎨 **User Interface**

- Clean, modern design
- White and violet color scheme
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Accessible and intuitive controls
- Custom scrollbars
- Loading states and error handling

---

## 🏗️ Architecture

ChatterBox follows a **distributed client-server architecture** with multiple communication protocols:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  │   Client 1   │  │   Client 2   │  │   Client N   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP/WebSocket   │                  │
          │ (Port 3000)      │                  │
          └──────────────────┴──────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
┌─────────▼─────────────────────────────────────▼─────────┐
│            Server Layer (Python/Flask)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Flask + Flask-SocketIO                   │    │
│  │         (Port 5000 - HTTP/WebSocket)            │    │
│  └─────────────┬────────────────┬──────────────────┘    │
│                │                │                        │
│  ┌─────────────▼──────┐  ┌──────▼──────────────┐       │
│  │  User Manager       │  │  File Transfer      │       │
│  │  - Authentication   │  │  - Base64 Encoding  │       │
│  │  - Session Mgmt     │  │  - Upload/Download  │       │
│  └─────────────┬───────┘  └─────────────────────┘       │
│                │                                         │
│  ┌─────────────▼──────────────────────────────────┐    │
│  │         Voice Chat Manager                      │    │
│  │         (Port 5001 - UDP)                       │    │
│  └─────────────┬───────────────────────────────────┘    │
└────────────────┼──────────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  SQLite Database │
         │  - Users         │
         │  - Chat History  │
         └──────────────────┘
```

### Communication Protocols

1. **HTTP (REST API)**: User registration and login
2. **WebSocket (Socket.IO)**: Real-time messaging and events
3. **UDP**: Low-latency voice data transmission

### Backend Components

- **server.py**: Main Flask-SocketIO application server

  - Handles HTTP endpoints and WebSocket events
  - Manages client connections and routing
  - Coordinates between all modules

- **user_manager.py**: User authentication and database operations

  - User registration with validation
  - Password hashing with bcrypt
  - Login verification
  - SQLite database management
  - Chat history storage and retrieval

- **file_transfer.py**: File sharing functionality

  - File upload and encoding (Base64)
  - File download and decoding
  - File metadata management
  - Storage in user-specific directories

- **voice_chat.py**: UDP voice chat server
  - UDP socket listener on port 5001
  - Audio data relay between users
  - Call state management
  - Threading for non-blocking operation

### Frontend Components

- **App.js**: Main application component with routing
- **SocketContext.js**: Global WebSocket state management
- **Login.js / Register.js**: Authentication UI
- **Dashboard.js**: Main layout with sidebar and chat area
- **ChatWindow.js**: Message display and input interface
- **UserList.js**: Online users sidebar
- **FileUpload.js**: Drag-drop file upload modal
- **VoiceChatPanel.js**: Voice call controls and UI

---

## 🔄 How It Works

### 1. User Authentication Flow

```
User → Frontend → HTTP POST → Backend → Database
                    ↓
              Bcrypt Hash
                    ↓
         Store/Verify Password
                    ↓
              Return Token
                    ↓
           Store in Session
                    ↓
          Redirect to Dashboard
```

### 2. Real-time Messaging Flow

```
User A Types Message
        ↓
  Socket.IO Client Emits 'private_message'
        ↓
  Backend Receives Event
        ↓
  Save to Database
        ↓
  Emit to User B's Socket
        ↓
  User B Receives Message
        ↓
  Display in Chat Window
```

### 3. File Sharing Flow

```
User Selects File
        ↓
  Read File as ArrayBuffer
        ↓
  Convert to Base64
        ↓
  Emit via Socket.IO
        ↓
  Backend Receives
        ↓
  Decode Base64
        ↓
  Save to uploads/username/
        ↓
  Notify Recipient
        ↓
  Download on Click
```

### 4. Voice Chat Flow

```
User A Initiates Call
        ↓
  Socket.IO: 'initiate_voice_call'
        ↓
  Backend Notifies User B
        ↓
  User B Accepts
        ↓
  UDP Connection Established
        ↓
  Audio Data Relay (Port 5001)
        ↓
  Either User Ends Call
        ↓
  Cleanup and Notify
```

## 🚀 Quick Setup

### Prerequisites

Ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** and npm - [Download](https://nodejs.org/)
- **Git** (optional) - [Download](https://git-scm.com/)

### One-Command Setup (Windows PowerShell)

```powershell
# 1. Navigate to project directory
cd "C:\Users\<your-username>\...\ChatterBox"

# 2. Verify prerequisites
.\verify-setup.ps1

# 3. Start backend (Terminal 1)
.\start-backend.ps1

# 4. Start frontend (Terminal 2 - open new terminal)
.\start-frontend.ps1
```

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## 📚 Detailed Setup Instructions

### Step 1: Clone or Download the Project

```powershell
# If using Git
git clone <repository-url>
cd ChatterBox

# Or simply navigate to the extracted folder
cd ChatterBox
```

### Step 2: Backend Setup

#### 2.1 Install Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

**Required packages:**

- flask==3.0.0
- flask-socketio==5.3.5
- flask-cors==4.0.0
- python-socketio==5.10.0
- bcrypt==4.1.2
- pyaudio==0.2.14

#### 2.2 Start the Backend Server

```powershell
python server.py
```

**Expected output:**

```
Voice chat UDP server started on port 5001
2025-11-12 05:03:32 - __main__ - INFO - Starting ChatterBox Server...
2025-11-12 05:03:32 - __main__ - INFO - Socket.IO server on port 5000
2025-11-12 05:03:32 - __main__ - INFO - Voice chat UDP server on port 5001
(34264) wsgi starting up on http://0.0.0.0:5000
```

The backend will be available at:

- **HTTP/WebSocket**: http://localhost:5000
- **UDP Voice**: Port 5001

### Step 3: Frontend Setup

Open a **new terminal** window:

#### 3.1 Install Node Dependencies

```powershell
cd frontend
npm install
```

**This installs:**

- React 18.2
- Socket.IO Client 4.6
- React Router 6.20
- Axios 1.6
- And all dependencies (~1,341 packages)

#### 3.2 Start the Development Server

```powershell
npm start
```

**Expected output:**

```
Compiled successfully!

You can now view chatterbox-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

The app will automatically open in your default browser at **http://localhost:3000**

---

## 🛠️ Technologies Used

### Backend Stack

| Technology      | Version  | Purpose                         |
| --------------- | -------- | ------------------------------- |
| Python          | 3.12+    | Backend programming language    |
| Flask           | 3.0.0    | Web application framework       |
| Flask-SocketIO  | 5.3.5    | WebSocket support for Flask     |
| Flask-CORS      | 4.0.0    | Cross-origin resource sharing   |
| Python-SocketIO | 5.10.0   | Socket.IO Python implementation |
| SQLite          | 3.x      | Embedded relational database    |
| Bcrypt          | 4.1.2    | Password hashing algorithm      |
| PyAudio         | 0.2.14   | Audio I/O library               |
| Socket (UDP)    | Built-in | Voice data transmission         |
| Threading       | Built-in | Concurrent request handling     |

### Frontend Stack

| Technology        | Version | Purpose                  |
| ----------------- | ------- | ------------------------ |
| React             | 18.2.0  | UI framework             |
| React DOM         | 18.2.0  | React rendering          |
| React Router      | 6.20.0  | Client-side routing      |
| Socket.IO Client  | 4.6.0   | WebSocket client library |
| Axios             | 1.6.0   | HTTP request library     |
| Lucide React      | 0.294.0 | Icon library             |
| CSS3              | -       | Styling                  |
| HTML5             | -       | Markup                   |
| JavaScript (ES6+) | -       | Programming language     |

### Development Tools

- **npm** - Package manager for Node.js
- **pip** - Package manager for Python
- **Webpack** - Module bundler (via React Scripts)
- **Babel** - JavaScript transpiler (via React Scripts)
- **ESLint** - JavaScript linter (via React Scripts)

---

## 👥 Contributors

Created for **Distributed and Parallel Computing** course project.

**Project Team:**

- Nitin Kumar Oberoi
- Deewakar Goud
- Anay Pandey

---

## 📄 License

This project is for **educational purposes** as part of the Distributed and Parallel Computing course.

---

## 🙏 Acknowledgments

- **Flask** and **Socket.IO** documentation
- **React** community and documentation
- Course instructors and teaching assistants
- Stack Overflow community
- Open source contributors

---

**Made with ❤️ and lots of ☕ for Distributed and Parallel Computing**

_Last Updated: November 2025_
