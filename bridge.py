import sys
import json
import traceback

# 1. Import your actual backend logic!
from services.services import AppServices

def handle_ytdlp_download(url):
    try:
        # 2. Initialize your services. 
        # Note: We pass None for 'style' because we no longer use ttkbootstrap!
        services = AppServices(style=None) 
        
        # 3. Call your actual download function
        # (Assuming your download function takes a URL string)
        services.dlp_download_service.download(url)

        # 4. If it succeeds, tell Electron
        result = {
            "status": "success",
            "message": f"Successfully triggered download for: {url}",
        }
    except Exception as e:
        # 5. Catch any Python errors and send them cleanly to the UI
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
    else:
        print(json.dumps({"status": "error", "message": "Unknown command"}))

if __name__ == "__main__":
    main()