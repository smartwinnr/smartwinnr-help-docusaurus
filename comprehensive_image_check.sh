#!/bin/bash

echo "Comprehensive Image Reference Check"
echo "=================================="
echo

broken_images=()
empty_images=()
working_images=()

# Check each unique image path
while IFS= read -r image_path; do
    # Skip empty lines
    if [[ -z "$image_path" ]]; then
        continue
    fi
    
    # Convert /img/ path to static/img/ path
    file_path="static${image_path}"
    
    if [[ ! -f "$file_path" ]]; then
        broken_images+=("$image_path")
    elif [[ ! -s "$file_path" ]]; then
        # File exists but is empty (size 0)
        empty_images+=("$image_path")
    else
        working_images+=("$image_path")
    fi
done < image_paths_to_check.txt

echo "SUMMARY:"
echo "========"
echo "Total unique image references: $((${#broken_images[@]} + ${#empty_images[@]} + ${#working_images[@]}))"
echo "Missing files: ${#broken_images[@]}"
echo "Empty files (0 bytes): ${#empty_images[@]}"
echo "Working files: ${#working_images[@]}"
echo

# Report broken images
if [[ ${#broken_images[@]} -gt 0 ]]; then
    echo "MISSING IMAGE FILES:"
    echo "==================="
    for img in "${broken_images[@]}"; do
        echo "- $img"
    done
    echo
fi

# Report empty images
if [[ ${#empty_images[@]} -gt 0 ]]; then
    echo "EMPTY IMAGE FILES (0 bytes):"
    echo "============================"
    for img in "${empty_images[@]}"; do
        echo "- $img"
    done
    echo
fi

# Now find which markdown files reference broken or empty images
all_problematic=("${broken_images[@]}" "${empty_images[@]}")

if [[ ${#all_problematic[@]} -gt 0 ]]; then
    echo "MARKDOWN FILES WITH BROKEN IMAGE REFERENCES:"
    echo "============================================"
    
    for img in "${all_problematic[@]}"; do
        echo
        echo "Image: $img"
        echo "Referenced in:"
        # Use grep to find files that reference this image
        grep -rn "\\]($img)" docs/ | while IFS=: read -r file line content; do
            echo "  - $file:$line"
        done
    done
fi
