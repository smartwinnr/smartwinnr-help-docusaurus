#!/bin/bash

echo "Finding ALL broken image references in markdown files..."
echo "======================================================="
echo

# List of some deleted files from git status (we'll create a comprehensive list)
deleted_files=(
    "static/img/admin/google-image-27eda6ff.png"
    "static/img/admin/google-image-28ecdf3c.png"
    "static/img/admin/google-image-49a03036.png"
    "static/img/admin/google-image-4d989958.png"
    "static/img/admin/google-image-624eb365.png"
    "static/img/admin/google-image-7f94d603.png"
    "static/img/admin/google-image-8907f3e2.png"
    "static/img/admin/google-image-8eef77f4.png"
    "static/img/admin/google-image-9c3d08f2.png"
    "static/img/admin/google-image-a20953a3.png"
    "static/img/admin/google-image-b1299185.png"
    "static/img/admin/google-image-d37fce94.png"
    "static/img/admin/google-image-d3e76ba4.png"
    "static/img/admin/google-image-f42fb7ac.png"
    "static/img/admin/google-image-f95cd58c.png"
    "static/img/admin/support-image-010bf794.png"
    "static/img/admin/support-image-0154e3e0.png"
    "static/img/coaching/google-image-17f76432.png"
    "static/img/coaching/google-image-24bd1ed5.png"
    "static/img/competitions/google-image-0aba0f4d.png"
    "static/img/getting-started/google-image-33a078ae.png"
    "static/img/getting-started/google-image-6be1dafc.png"
    "static/img/learning/google-image-0f71b8fe.png"
    "static/img/quizzes/google-image-109c37f4.png"
    "static/img/reports/google-image-011e1953.png"
)

broken_references=()

for file_path in "${deleted_files[@]}"; do
    # Convert static/img/ path to /img/ path for searching
    img_path="${file_path#static}"
    
    # Check if this image is referenced in any markdown files
    if grep -rq "\\]($img_path)" docs/; then
        broken_references+=("$img_path")
        echo "BROKEN REFERENCE: $img_path"
        echo "Referenced in:"
        grep -rn "\\]($img_path)" docs/ | while IFS=: read -r md_file line content; do
            echo "  - $md_file:$line"
        done
        echo
    fi
done

# Also check for any image references to files that don't exist at all
echo "Checking ALL image references for missing files..."
echo "================================================"

all_missing=()
total_checked=0

# Extract all image references and check if files exist
grep -rho "!\[.*\](\(/img/[^)]*\))" docs/ | sed 's/!\[.*\](\(\/img\/[^)]*\))/\1/' | sort | uniq | while read -r img_path; do
    total_checked=$((total_checked + 1))
    file_path="static${img_path}"
    
    if [[ ! -f "$file_path" ]]; then
        echo "MISSING FILE: $img_path -> $file_path"
        echo "Referenced in:"
        grep -rn "\\]($img_path)" docs/ | while IFS=: read -r md_file line content; do
            echo "  - $md_file:$line"
        done
        echo
    elif [[ ! -s "$file_path" ]]; then
        echo "EMPTY FILE (0 bytes): $img_path -> $file_path"
        echo "Referenced in:"
        grep -rn "\\]($img_path)" docs/ | while IFS=: read -r md_file line content; do
            echo "  - $md_file:$line"
        done
        echo
    fi
done
