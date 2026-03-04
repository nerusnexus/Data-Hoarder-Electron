import sys
import json
import traceback

# Import your actual backend logic
from services.services import AppServices
from services.db.db_manager import get_all_groups, get_channels_by_group

def handle_get_library_data():
    """Fetches all groups and their channels from the SQLite database."""
    try:
        # Initialize services to ensure DB is initialized properly
        services = AppServices() 
        
        # 1. Get groups from DB
        groups = get_all_groups()
        library_tree = []
        
        # 2. Structure the data for JavaScript
        for group in groups:
            group_id = group[0]
            group_name = group[1]
            
            # Fetch channels for this specific group
            channels = get_channels_by_group(group_id)
            channel_list = [{"id": c[0], "name": c[1], "url": c[2]} for c in channels]
            
            library_tree.append({
                "id": group_id,
                "name": group_name,
                "channels": channel_list
            })

        # 3. Send back to Electron
        result = {
            "status": "success",
            "data": library_tree
        }
    except Exception as e:
        result = {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }
    
    print(json.dumps(result))

def handle_ytdlp_download(url):
    """Triggers the yt-dlp download service."""
    try:
        # Initialize services
        services = AppServices() 
        
        # Call your actual download function
        services.dlp_download_service.download(url)

        # If it succeeds, tell Electron
        result = {
            "status": "success",
            "message": f"Successfully triggered download for: {url}",
        }
    except Exception as e:
        # Catch any Python errors and send them cleanly to the UI
        result = {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }
    
    print(json.dumps(result))

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No command provided"}))
        sys.exit(1)

    command = sys.argv[1]

    if command == "ytdlp_download":
        url = sys.argv[2] if len(sys.argv) > 2 else ""
        handle_ytdlp_download(url)
    elif command == "get_library_data":
        handle_get_library_data()
    else:
        print(json.dumps({"status": "error", "message": "Unknown command"}))

if __name__ == "__main__":
    main()