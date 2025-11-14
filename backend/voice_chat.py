import socket
import threading
import json
from datetime import datetime

class VoiceChatManager:
    def __init__(self, udp_port=5001):
        self.udp_port = udp_port
        self.active_calls = {}  # {call_id: {caller, receiver, status}}
        self.user_udp_addresses = {}  # {username: (ip, port)}
        self.udp_socket = None
        self.running = False
        
    def start_udp_server(self):
        """Start UDP server for voice chat"""
        try:
            self.udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.udp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.udp_socket.bind(('0.0.0.0', self.udp_port))
            self.running = True
            
            print(f"Voice chat UDP server started on port {self.udp_port}")
            
            # Start listening thread
            listen_thread = threading.Thread(target=self.listen_for_voice_data, daemon=True)
            listen_thread.start()
            
            return True
        except Exception as e:
            print(f"Error starting UDP server: {e}")
            return False
    
    def listen_for_voice_data(self):
        """Listen for incoming voice data and relay to recipient"""
        while self.running:
            try:
                data, address = self.udp_socket.recvfrom(4096)
                
                # Check if it's a registration message
                if data.startswith(b'REGISTER:'):
                    username = data.decode('utf-8').split(':', 1)[1]
                    self.user_udp_addresses[username] = address
                    print(f"Registered UDP address for {username}: {address}")
                    continue
                
                # Check if it's voice data with routing info
                if data.startswith(b'VOICE:'):
                    parts = data.split(b':', 3)
                    if len(parts) >= 4:
                        sender = parts[1].decode('utf-8')
                        receiver = parts[2].decode('utf-8')
                        voice_data = parts[3]
                        
                        # Relay voice data to receiver
                        if receiver in self.user_udp_addresses:
                            receiver_address = self.user_udp_addresses[receiver]
                            # Send with sender info
                            relay_data = f"FROM:{sender}:".encode() + voice_data
                            self.udp_socket.sendto(relay_data, receiver_address)
                
            except Exception as e:
                if self.running:
                    print(f"Error in UDP listener: {e}")
    
    def initiate_call(self, caller, receiver):
        """Initiate a voice call between two users"""
        call_id = f"{caller}_{receiver}_{datetime.now().timestamp()}"
        
        self.active_calls[call_id] = {
            "caller": caller,
            "receiver": receiver,
            "status": "calling",
            "started_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "call_id": call_id,
            "caller": caller,
            "receiver": receiver,
            "status": "calling"
        }
    
    def accept_call(self, call_id):
        """Accept an incoming call"""
        if call_id in self.active_calls:
            self.active_calls[call_id]["status"] = "active"
            self.active_calls[call_id]["accepted_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "call_id": call_id,
                "status": "active"
            }
        return {
            "success": False,
            "error": "Call not found"
        }
    
    def reject_call(self, call_id):
        """Reject an incoming call"""
        if call_id in self.active_calls:
            self.active_calls[call_id]["status"] = "rejected"
            return {
                "success": True,
                "call_id": call_id,
                "status": "rejected"
            }
        return {
            "success": False,
            "error": "Call not found"
        }
    
    def end_call(self, call_id):
        """End an active call"""
        if call_id in self.active_calls:
            self.active_calls[call_id]["status"] = "ended"
            self.active_calls[call_id]["ended_at"] = datetime.now().isoformat()
            
            # Remove from active calls after a short delay
            threading.Timer(5.0, lambda: self.active_calls.pop(call_id, None)).start()
            
            return {
                "success": True,
                "call_id": call_id,
                "status": "ended"
            }
        return {
            "success": False,
            "error": "Call not found"
        }
    
    def get_active_call(self, username):
        """Get active call for a user"""
        for call_id, call_info in self.active_calls.items():
            if (call_info["caller"] == username or call_info["receiver"] == username) and \
               call_info["status"] in ["calling", "active"]:
                return {
                    "call_id": call_id,
                    **call_info
                }
        return None
    
    def register_udp_client(self, username, ip, port):
        """Register UDP address for a client"""
        self.user_udp_addresses[username] = (ip, port)
        print(f"Registered UDP client: {username} at {ip}:{port}")
    
    def unregister_udp_client(self, username):
        """Unregister UDP address for a client"""
        if username in self.user_udp_addresses:
            del self.user_udp_addresses[username]
    
    def stop_udp_server(self):
        """Stop the UDP server"""
        self.running = False
        if self.udp_socket:
            self.udp_socket.close()
        print("Voice chat UDP server stopped")
