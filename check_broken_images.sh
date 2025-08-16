#!/bin/bash

echo "Checking for broken image references..."
echo "======================================"
echo

# Read the image paths and check if files exist
broken_count=0
total_count=0

while IFS= read -r image_path; do
    # Skip empty lines
    if [[ -z "$image_path" ]]; then
        continue
    fi
    
    total_count=$((total_count + 1))
    
    # Convert /img/ path to static/img/ path
    file_path="static${image_path}"
    
    if [[ ! -f "$file_path" ]]; then
        broken_count=$((broken_count + 1))
        echo "BROKEN: $image_path -> $file_path (FILE NOT FOUND)"
    fi
done < image_paths_to_check.txt

echo
echo "Summary:"
echo "========"
echo "Total image references checked: $total_count"
echo "Broken image references found: $broken_count"
echo "Working image references: $((total_count - broken_count))"

if [[ $broken_count -gt 0 ]]; then
    echo
    echo "Now checking which markdown files contain these broken references..."
    echo "================================================================="
fi
