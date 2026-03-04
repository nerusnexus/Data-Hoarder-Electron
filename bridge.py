import sys
import json
import traceback

from services.services import AppServices
from services.db.db_manager import get_all_groups, get_channels_by_group

def handle_get_library_data():
    try:
        # This triggers database_initializer.py via AppServices 
        # config.py will automatically create the Data folder now.
        services = AppServices() 
        
        groups = get_all_groups()
        library_tree = []
        
        for group in groups:
            group_id = group[0]
            group_name = group[1]
            channels = get_channels_by_group(group_id)
            channel_list = [{"id": c[0], "name": c[1], "url": c[2]} for c in channels]
            
            library_tree.append({
                "id": group_id,
                "name": group_name,
                "channels": channel_list
            })

        result = {"status": "success", "data": library_tree}
    except Exception as e:
        result = {"status": "error", "message": str(e), "traceback": traceback.format_exc()}
    
    print(json.dumps(result))

def handle_add_group(group_name):
    try:
        services = AppServices()
        services.add_group_service.add_group(group_name)
        result = {"status": "success"}
    except Exception as e:
        result = {"status": "error", "message": str(e)}
    print(json.dumps(result))

def handle_add_channel(group_name, channel_input):
    try:
        services = AppServices()
        # This mirrors your old AddChannelDialog logic
        services.add_channel_service.add_channel(group_name, channel_input)
        result = {"status": "success"}
    except Exception as e:
        result = {"status": "error", "message": str(e)}
    print(json.dumps(result))

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No command provided"}))
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    if command == "get_library_data":
        handle_get_library_data()
    elif command == "add_group":
        handle_add_group(args[0])
    elif command == "add_channel":
        handle_add_channel(args[0], args[1])
    # You can easily add more commands here in the future:
    # elif command == "start_download":
    #     handle_download(args[0])
    else:
        print(json.dumps({"status": "error", "message": f"Unknown command: {command}"}))

if __name__ == "__main__":
    main()