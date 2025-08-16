# Broken Image References Report

## Summary

**Total broken image references found: 2**

All broken references are due to **empty image files** (files exist but have 0 bytes).

---

## Detailed Breakdown

### 1. Empty Image Files (0 bytes)

#### `/img/getting-started/google-image-f42fb7ac.png`
- **File Path**: `static/img/getting-started/google-image-f42fb7ac.png`
- **Issue**: File exists but is empty (0 bytes)
- **Referenced in**:
  - `/Users/aninditabanik/node_projects/help_smartwinnr/docs/getting-started/how-can-i-enable-push-notification-for-smartwinnr-app.md` (line 22)
  - `/Users/aninditabanik/node_projects/help_smartwinnr/docs/getting-started/how-can-i-change-my-password-for-smartwinnr.md` (line 18)

#### `/img/quizzes/google-image-78bedb5e.png`
- **File Path**: `static/img/quizzes/google-image-78bedb5e.png`  
- **Issue**: File exists but is empty (0 bytes)
- **Referenced in**:
  - `/Users/aninditabanik/node_projects/help_smartwinnr/docs/quiz-assessments/question-management/how-to-create-a-matching-question.md` (line 65)

---

## Recommended Actions

### For Empty Files:
1. **Replace the empty files** with the actual image content
2. **Source the original images** from backup or original documentation
3. **Alternative**: Replace with appropriate placeholder images if originals are not available
4. **Last resort**: Remove the image references from the markdown files if images are not essential

### Specific Files to Fix:
- `static/img/getting-started/google-image-f42fb7ac.png`
- `static/img/quizzes/google-image-78bedb5e.png`

---

## Notes

- **Total image references checked**: 639 unique image paths
- **Working image references**: 637 (99.7% success rate)
- **Missing files**: 0
- **Empty files**: 2
- All other image references are working correctly

The analysis shows that the documentation has excellent image reference integrity overall, with only 2 out of 639 image references having issues due to empty files.