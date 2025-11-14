import sqlite3
import bcrypt
import json
from datetime import datetime
import os

class UserManager:
    def __init__(self, db_path="database/users.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_database()
        self.online_users = {}  # {username: socket_info}
        
    def init_database(self):
        """Initialize the SQLite database with users table"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT NOT NULL,
                receiver TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def register_user(self, username, password):
        """Register a new user with hashed password"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Hash the password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, password_hash)
            )
            
            conn.commit()
            conn.close()
            return {"success": True, "message": "User registered successfully"}
        except sqlite3.IntegrityError:
            return {"success": False, "message": "Username already exists"}
        except Exception as e:
            return {"success": False, "message": f"Registration failed: {str(e)}"}
    
    def login_user(self, username, password):
        """Authenticate user credentials"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT password_hash FROM users WHERE username = ?",
                (username,)
            )
            
            result = cursor.fetchone()
            
            if result is None:
                return {"success": False, "message": "Username not found"}
            
            password_hash = result[0]
            
            # Verify password
            if bcrypt.checkpw(password.encode('utf-8'), password_hash):
                # Update last login
                cursor.execute(
                    "UPDATE users SET last_login = ? WHERE username = ?",
                    (datetime.now(), username)
                )
                conn.commit()
                conn.close()
                return {"success": True, "message": "Login successful", "username": username}
            else:
                conn.close()
                return {"success": False, "message": "Incorrect password"}
                
        except Exception as e:
            return {"success": False, "message": f"Login failed: {str(e)}"}
    
    def set_user_online(self, username, socket_id):
        """Mark user as online"""
        self.online_users[username] = {
            "socket_id": socket_id,
            "connected_at": datetime.now().isoformat()
        }
        
    def set_user_offline(self, username):
        """Mark user as offline"""
        if username in self.online_users:
            del self.online_users[username]
    
    def get_online_users(self):
        """Get list of currently online users"""
        return list(self.online_users.keys())
    
    def is_user_online(self, username):
        """Check if a user is currently online"""
        return username in self.online_users
    
    def get_user_socket(self, username):
        """Get socket ID for a user"""
        return self.online_users.get(username, {}).get("socket_id")
    
    def save_message(self, sender, receiver, message):
        """Save chat message to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO chat_history (sender, receiver, message) VALUES (?, ?, ?)",
                (sender, receiver, message)
            )
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error saving message: {e}")
            return False
    
    def get_chat_history(self, user1, user2, limit=50):
        """Retrieve chat history between two users"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT sender, receiver, message, timestamp 
                FROM chat_history 
                WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (user1, user2, user2, user1, limit))
            
            messages = cursor.fetchall()
            conn.close()
            
            return [
                {
                    "sender": msg[0],
                    "receiver": msg[1],
                    "message": msg[2],
                    "timestamp": msg[3]
                }
                for msg in reversed(messages)
            ]
        except Exception as e:
            print(f"Error retrieving chat history: {e}")
            return []
