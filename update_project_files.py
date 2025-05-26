import json
import os

# Define the name of the JSON file containing file contents
JSON_FILE_NAME = "content_files.json"
# Define the base directory for resolving file paths (current directory)
BASE_DIRECTORY = os.getcwd()

def update_files_from_json(json_file_path):
    """
    Reads a JSON file containing file update instructions and applies them.

    Each item in the JSON array should be an object with:
    - "file_name": The relative path to the file (e.g., "src/components/MyComponent.jsx").
    - "content": The new content to write to the file.
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            file_updates = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file '{json_file_path}' was not found in the current directory.")
        print(f"Please ensure '{json_file_path}' is in: {BASE_DIRECTORY}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{json_file_path}'. Please check its format.")
        return
    except Exception as e:
        print(f"An unexpected error occurred while reading '{json_file_path}': {e}")
        return

    if not isinstance(file_updates, list):
        print(f"Error: Expected a JSON array in '{json_file_path}', but got {type(file_updates)}.")
        return

    print(f"Processing {len(file_updates)} file updates...\n")

    for item in file_updates:
        if not isinstance(item, dict) or "file_name" not in item or "content" not in item:
            print(f"Skipping invalid item: {item}. Each item must be a dictionary with 'file_name' and 'content' keys.")
            continue

        file_name = item["file_name"]
        content = item["content"]
        
        # Construct the full path relative to the script's location
        full_file_path = os.path.join(BASE_DIRECTORY, file_name)

        try:
            # Ensure the directory exists
            os.makedirs(os.path.dirname(full_file_path), exist_ok=True)

            # Write the new content to the file
            with open(full_file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully updated: {file_name}")

        except IOError as e:
            print(f"Error writing to file '{file_name}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred while processing '{file_name}': {e}")

    print("\nFile update process completed.")

if __name__ == "__main__":
    # Construct the full path to the JSON file
    json_file_full_path = os.path.join(BASE_DIRECTORY, JSON_FILE_NAME)
    update_files_from_json(json_file_full_path)