from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from user_manager import UserManager
from file_transfer import FileTransferManager
from voice_chat import VoiceChatManager
import logging
from datetime import datetime
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'chatterbox-secret-key-2025'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=60, ping_interval=25)

# Initialize managers
user_manager = UserManager()
file_manager = FileTransferManager()
voice_manager = VoiceChatManager(udp_port=5001)

# Store socket ID to username mapping
socket_to_user = {}
user_to_socket = {}

# Start voice chat UDP server
voice_manager.start_udp_server()

# HTTP Routes for basic endpoints
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "online_users": len(user_manager.get_online_users())
    })

@app.route('/api/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400
    
    result = user_manager.register_user(username, password)
    logger.info(f"Registration attempt for {username}: {result['message']}")
    
    return jsonify(result), 200 if result['success'] else 400

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400
    
    result = user_manager.login_user(username, password)
    logger.info(f"Login attempt for {username}: {result['message']}")
    
    return jsonify(result), 200 if result['success'] else 401

# Socket.IO Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connection_response', {
        "success": True,
        "message": "Connected to ChatterBox server",
        "socket_id": request.sid
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    socket_id = request.sid
    username = socket_to_user.get(socket_id)
    
    if username:
        user_manager.set_user_offline(username)
        del socket_to_user[socket_id]
        del user_to_socket[username]
        
        # Notify all clients about user going offline
        emit('user_status_changed', {
            "username": username,
            "status": "offline",
            "online_users": user_manager.get_online_users()
        }, broadcast=True)
        
        logger.info(f"User disconnected: {username} ({socket_id})")
    else:
        logger.info(f"Client disconnected: {socket_id}")

@socketio.on('user_online')
def handle_user_online(data):
    """Handle user coming online after login"""
    username = data.get('username')
    socket_id = request.sid
    
    if username:
        user_manager.set_user_online(username, socket_id)
        socket_to_user[socket_id] = username
        user_to_socket[username] = socket_id
        
        logger.info(f"User online: {username} ({socket_id})")
        
        # Send online users list to the new user
        emit('online_users', {
            "users": user_manager.get_online_users()
        })
        
        # Broadcast to all clients that this user is online
        emit('user_status_changed', {
            "username": username,
            "status": "online",
            "online_users": user_manager.get_online_users()
        }, broadcast=True)

@socketio.on('get_online_users')
def handle_get_online_users():
    """Get list of online users"""
    emit('online_users', {
        "users": user_manager.get_online_users()
    })

@socketio.on('private_message')
def handle_private_message(data):
    """Handle private message between users"""
    sender = data.get('sender')
    receiver = data.get('receiver')
    message = data.get('message')
    timestamp = data.get('timestamp', datetime.now().isoformat())
    
    if not all([sender, receiver, message]):
        emit('error', {"message": "Invalid message data"})
        return
    
    # Save message to database
    user_manager.save_message(sender, receiver, message)
    
    # Create message object
    message_data = {
        "sender": sender,
        "receiver": receiver,
        "message": message,
        "timestamp": timestamp,
        "type": "text"
    }
    
    # Send to receiver if online
    receiver_socket = user_to_socket.get(receiver)
    if receiver_socket:
        emit('private_message', message_data, room=receiver_socket)
        logger.info(f"Message sent from {sender} to {receiver}")
    else:
        # Store for offline delivery
        logger.info(f"Message stored for offline user {receiver}")
    
    # Send acknowledgment to sender
    emit('message_sent', {
        "success": True,
        "timestamp": timestamp,
        "receiver": receiver
    })

@socketio.on('file_transfer')
def handle_file_transfer(data):
    """Handle file transfer between users"""
    sender = data.get('sender')
    receiver = data.get('receiver')
    file_name = data.get('file_name')
    file_size = data.get('file_size')
    file_data = data.get('file_data')
    
    if not all([sender, receiver, file_name, file_data]):
        emit('error', {"message": "Invalid file transfer data"})
        return
    
    logger.info(f"File transfer initiated: {file_name} from {sender} to {receiver}")
    
    # Save file
    result = file_manager.receive_file(file_data, file_name, sender, receiver)
    
    if result['success']:
        # Create file message
        file_message = {
            "type": "file",
            "sender": sender,
            "receiver": receiver,
            "file_name": file_name,
            "file_size": file_size,
            "file_data": file_data,
            "timestamp": datetime.now().isoformat()
        }
        
        # Send to receiver if online
        receiver_socket = user_to_socket.get(receiver)
        if receiver_socket:
            emit('file_received', file_message, room=receiver_socket)
            logger.info(f"File sent from {sender} to {receiver}: {file_name}")
        
        # Send acknowledgment to sender
        emit('file_sent', {
            "success": True,
            "file_name": file_name,
            "receiver": receiver
        })
    else:
        emit('error', {"message": f"File transfer failed: {result.get('error', 'Unknown error')}"})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    sender = data.get('sender')
    receiver = data.get('receiver')
    is_typing = data.get('is_typing', True)
    
    receiver_socket = user_to_socket.get(receiver)
    if receiver_socket:
        emit('user_typing', {
            "username": sender,
            "is_typing": is_typing
        }, room=receiver_socket)

@socketio.on('initiate_voice_call')
def handle_initiate_voice_call(data):
    """Handle voice call initiation"""
    caller = data.get('caller')
    receiver = data.get('receiver')
    
    if not all([caller, receiver]):
        emit('error', {"message": "Invalid call data"})
        return
    
    result = voice_manager.initiate_call(caller, receiver)
    
    if result['success']:
        # Notify receiver about incoming call
        receiver_socket = user_to_socket.get(receiver)
        if receiver_socket:
            emit('incoming_call', {
                "call_id": result['call_id'],
                "caller": caller,
                "status": "calling"
            }, room=receiver_socket)
        
        # Send call initiated response to caller
        emit('call_initiated', result)
        logger.info(f"Voice call initiated: {caller} -> {receiver}")
    else:
        emit('error', {"message": "Failed to initiate call"})

@socketio.on('accept_call')
def handle_accept_call(data):
    """Handle call acceptance"""
    call_id = data.get('call_id')
    accepter = data.get('username')
    
    result = voice_manager.accept_call(call_id)
    
    if result['success']:
        call_info = voice_manager.active_calls.get(call_id)
        if call_info:
            caller = call_info['caller']
            
            # Notify caller that call was accepted
            caller_socket = user_to_socket.get(caller)
            if caller_socket:
                emit('call_accepted', {
                    "call_id": call_id,
                    "status": "active",
                    "udp_port": voice_manager.udp_port
                }, room=caller_socket)
            
            # Send acceptance confirmation to accepter
            emit('call_started', {
                "call_id": call_id,
                "status": "active",
                "udp_port": voice_manager.udp_port
            })
            
            logger.info(f"Voice call accepted: {call_id}")

@socketio.on('reject_call')
def handle_reject_call(data):
    """Handle call rejection"""
    call_id = data.get('call_id')
    
    result = voice_manager.reject_call(call_id)
    
    if result['success']:
        call_info = voice_manager.active_calls.get(call_id)
        if call_info:
            caller = call_info['caller']
            
            # Notify caller that call was rejected
            caller_socket = user_to_socket.get(caller)
            if caller_socket:
                emit('call_rejected', {
                    "call_id": call_id,
                    "status": "rejected"
                }, room=caller_socket)
            
            logger.info(f"Voice call rejected: {call_id}")

@socketio.on('end_call')
def handle_end_call(data):
    """Handle call termination"""
    call_id = data.get('call_id')
    username = data.get('username')
    
    result = voice_manager.end_call(call_id)
    
    if result['success']:
        call_info = voice_manager.active_calls.get(call_id)
        if call_info:
            # Notify both parties
            caller = call_info['caller']
            receiver = call_info['receiver']
            
            other_user = receiver if username == caller else caller
            other_socket = user_to_socket.get(other_user)
            
            if other_socket:
                emit('call_ended', {
                    "call_id": call_id,
                    "status": "ended"
                }, room=other_socket)
            
            emit('call_ended', {
                "call_id": call_id,
                "status": "ended"
            })
            
            logger.info(f"Voice call ended: {call_id}")

@socketio.on('register_udp')
def handle_register_udp(data):
    """Register UDP address for voice chat"""
    username = data.get('username')
    
    if username:
        # Client will send UDP registration packet separately
        emit('udp_registration_ready', {
            "udp_port": voice_manager.udp_port
        })

@socketio.on('get_chat_history')
def handle_get_chat_history(data):
    """Get chat history between two users"""
    user1 = data.get('user1')
    user2 = data.get('user2')
    
    if user1 and user2:
        history = user_manager.get_chat_history(user1, user2)
        emit('chat_history', {
            "messages": history
        })

if __name__ == '__main__':
    logger.info("Starting ChatterBox Server...")
    logger.info(f"Socket.IO server on port 5000")
    logger.info(f"Voice chat UDP server on port 5001")
    
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        voice_manager.stop_udp_server()
        logger.info("Server stopped")
