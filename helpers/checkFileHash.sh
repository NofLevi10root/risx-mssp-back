#!/bin/bash

# Check for correct number of arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <json_file> <folder_path>"
    exit 1
fi

# Input arguments 
json_file="$1"
folder_path="$2"

# Check if JSON file exists
if [ ! -f "$json_file" ]; then
    echo "Error: JSON file '$json_file' not found."
    exit 1
fi

# Check if folder exists
if [ ! -d "$folder_path" ]; then
    echo "Error: Folder '$folder_path' not found."
    exit 1
fi

# Initialize strings for mismatched and missing files
mismatched_files=""
missing_files=""

# Iterate through the JSON keys and values
while IFS="=" read -r file hash; do
    # Remove quotes and commas from JSON keys/values
    file=$(echo "$file" | tr -d '"')
    hash=$(echo "$hash" | tr -d '",')

    # Convert hash from JSON to lowercase
    hash=$(echo "$hash" | tr '[:upper:]' '[:lower:]')

    # Construct the full file path
    file_path="$folder_path/$file"

    # Check if the file exists in the folder
    if [ ! -f "$file_path" ]; then
        # Add to missing files
        if [ -z "$missing_files" ]; then
            missing_files="$file"
        else
            missing_files="$missing_files@@@@$file"
        fi
        continue
    fi

    # Calculate the actual hash of the file and convert it to lowercase
    actual_hash=$(sha256sum "$file_path" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')

    # Compare the hashes
    if [ "$actual_hash" != "$hash" ]; then
        # Add to the list of mismatched files
        if [ -z "$mismatched_files" ]; then
            mismatched_files="$file"
        else
            mismatched_files="$mismatched_files@@@@$file"
        fi
    fi
done < <(jq -r 'to_entries[] | "\(.key)=\(.value)"' "$json_file")

# Print missing files
if [ -z "$missing_files" ]; then
    echo "No missing files."
else
    echo "Missing files: $missing_files"
fi

# Print mismatched files
if [ -z "$mismatched_files" ]; then
    echo "No mismatched files."
else
    echo "Mismatched files: $mismatched_files"
fi
