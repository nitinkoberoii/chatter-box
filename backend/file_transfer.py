import os
import base64
import hashlib
from datetime import datetime

class FileTransferManager:
    def __init__(self, upload_dir="uploads"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
        self.active_transfers = {}
        
    def prepare_file_for_transfer(self, file_path):
        """Read and encode file for transfer"""
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            file_name = os.path.basename(file_path)
            file_size = len(file_data)
            file_hash = hashlib.md5(file_data).hexdigest()
            
            # Encode file data to base64 for JSON transfer
            encoded_data = base64.b64encode(file_data).decode('utf-8')
            
            return {
                "success": True,
                "file_name": file_name,
                "file_size": file_size,
                "file_hash": file_hash,
                "file_data": encoded_data,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def receive_file(self, file_data, file_name, sender, receiver):
        """Receive and save file"""
        try:
            # Create user-specific directory
            user_dir = os.path.join(self.upload_dir, receiver)
            os.makedirs(user_dir, exist_ok=True)
            
            # Decode base64 data
            decoded_data = base64.b64decode(file_data)
            
            # Generate unique filename if file exists
            file_path = os.path.join(user_dir, file_name)
            counter = 1
            base_name, extension = os.path.splitext(file_name)
            
            while os.path.exists(file_path):
                new_name = f"{base_name}_{counter}{extension}"
                file_path = os.path.join(user_dir, new_name)
                counter += 1
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(decoded_data)
            
            return {
                "success": True,
                "file_path": file_path,
                "file_name": os.path.basename(file_path),
                "file_size": len(decoded_data)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_file_message(self, sender, receiver, file_name, file_size, file_data):
        """Create a file transfer message"""
        return {
            "type": "file",
            "sender": sender,
            "receiver": receiver,
            "file_name": file_name,
            "file_size": file_size,
            "file_data": file_data,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_file_info(self, file_path):
        """Get information about a file"""
        try:
            if not os.path.exists(file_path):
                return {"success": False, "error": "File not found"}
            
            file_size = os.path.getsize(file_path)
            file_name = os.path.basename(file_path)
            
            return {
                "success": True,
                "file_name": file_name,
                "file_size": file_size,
                "file_path": file_path
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def cleanup_old_files(self, days=7):
        """Clean up files older than specified days"""
        try:
            current_time = datetime.now()
            for root, dirs, files in os.walk(self.upload_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    if (current_time - file_time).days > days:
                        os.remove(file_path)
                        print(f"Removed old file: {file_path}")
        except Exception as e:
            print(f"Error cleaning up files: {e}")
