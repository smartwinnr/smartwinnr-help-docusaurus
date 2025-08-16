#!/bin/bash

echo "FINAL COMPREHENSIVE BROKEN IMAGE REFERENCE REPORT"
echo "================================================="
echo

# Create arrays to store results
missing_files=()
empty_files=()
total_broken_refs=0

echo "1. CHECKING ALL IMAGE REFERENCES IN MARKDOWN FILES"
echo "=================================================="

# Extract all unique image references from markdown files
all_img_refs=$(grep -rho "!\[.*\](\(/img/[^)]*\))" docs/ | sed 's/!\[.*\](\(\/img\/[^)]*\))/\1/' | sort | uniq)

for img_path in $all_img_refs; do
    file_path="static${img_path}"
    
    if [[ ! -f "$file_path" ]]; then
        missing_files+=("$img_path")
        echo "❌ MISSING: $img_path"
    elif [[ ! -s "$file_path" ]]; then
        empty_files+=("$img_path") 
        echo "⚠️  EMPTY (0 bytes): $img_path"
    fi
done

echo
echo "2. SUMMARY OF BROKEN REFERENCES"
echo "==============================="
echo "Total missing image files: ${#missing_files[@]}"
echo "Total empty image files: ${#empty_files[@]}"
echo "Total problematic references: $((${#missing_files[@]} + ${#empty_files[@]}))"

echo
echo "3. DETAILED BREAKDOWN BY MARKDOWN FILE"
echo "======================================"

all_problematic=("${missing_files[@]}" "${empty_files[@]}")

for img_path in "${all_problematic[@]}"; do
    echo
    if [[ ! -f "static${img_path}" ]]; then
        echo "🔴 MISSING FILE: $img_path"
    else
        echo "🟡 EMPTY FILE: $img_path (exists but 0 bytes)"
    fi
    
    echo "   Referenced in the following markdown files:"
    
    # Find all markdown files that reference this image
    grep -rn "\\]($img_path)" docs/ | while IFS=: read -r md_file line content; do
        # Skip backup files for cleaner output
        if [[ ! "$md_file" == *.backup-* ]]; then
            echo "   📄 $md_file (line $line)"
            total_broken_refs=$((total_broken_refs + 1))
        fi
    done
done

echo
echo "4. RECOMMENDED ACTIONS"
echo "====================="
if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "For MISSING files:"
    echo "- Locate the original images and place them in the correct static/img/ directory"
    echo "- Or update the markdown files to use alternative images"
    echo "- Or remove the broken image references"
fi

if [[ ${#empty_files[@]} -gt 0 ]]; then
    echo "For EMPTY files:"
    echo "- Replace the 0-byte files with the actual image content"
    echo "- These files exist but contain no data"
fi

echo
echo "Files requiring attention:"
for img_path in "${all_problematic[@]}"; do
    echo "- static${img_path}"
done
