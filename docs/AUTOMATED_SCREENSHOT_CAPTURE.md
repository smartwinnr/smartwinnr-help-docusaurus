# Automated Screenshot Capture System

## Overview

This document outlines the comprehensive plan for implementing an automated screenshot capture system for the SmartWinnr Help Documentation. The system will automatically capture real screenshots from the SmartWinnr test environments using Puppeteer to replace existing HelpScout screenshots with current, accurate UI images.

## System Requirements Analysis

### Current State

- **Total Images**: 681 mapped images across documentation
- **Source**: Legacy HelpScout screenshots (outdated)
- **Target Systems**: Two separate SmartWinnr portals
- **Infrastructure**: Existing image mapping system ready for integration

### Target Environments

- **Manager/User Portal**: https://web.smartwinnr.com/ (iPad viewport: 1024x768px)
- **Admin Portal**: https://app.smartwinnr.com/ (Desktop viewport: 1440x900px)
- **Test Accounts**: 3 dedicated accounts (User, Manager, Admin)
- **Authentication**: Username/password with standard session handling

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                Automated Screenshot Capture                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Navigation    │  │   Capture       │  │  Processing │  │
│  │   Controller    │  │    Engine       │  │   Manager   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│           │                     │                   │       │
│           ▼                     ▼                   ▼       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Puppeteer     │  │  Screenshot     │  │   Image     │  │
│  │   Browser       │  │   Capture       │  │ Optimization│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. Navigation Controller

- **Purpose**: Handles authentication and page navigation
- **Features**: Multi-account management, session handling, URL routing
- **Input**: Screenshot requirements, user credentials
- **Output**: Authenticated browser sessions ready for capture

#### 2. Capture Engine

- **Purpose**: Captures screenshots using Puppeteer
- **Features**: Viewport management, element selection, timing control
- **Input**: Page URLs, element selectors, capture specifications
- **Output**: Raw screenshot images

#### 3. Processing Manager

- **Purpose**: Optimizes and organizes captured screenshots
- **Features**: Image optimization, file naming, metadata generation
- **Input**: Raw screenshots, mapping requirements
- **Output**: Processed images with updated documentation

## Implementation Plan

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Environment Setup

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

#### 1.2 Basic Screenshot Capture System

```javascript
// New script: scripts/capture-screenshots.js
class ScreenshotCapture {
  constructor() {
    this.browser = null;
    this.pages = new Map(); // Store authenticated pages
    this.config = {
      admin: {
        url: 'https://app.smartwinnr.com/',
        viewport: { width: 1440, height: 900 },
        credentials: { /* admin credentials */ }
      },
      manager: {
        url: 'https://web.smartwinnr.com/', 
        viewport: { width: 1024, height: 768 },
        credentials: { /* manager credentials */ }
      },
      user: {
        url: 'https://web.smartwinnr.com/',
        viewport: { width: 1024, height: 768 },
        credentials: { /* user credentials */ }
      }
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async authenticateUser(role) {
    const page = await this.browser.newPage();
    const config = this.config[role];
    
    await page.setViewport(config.viewport);
    await page.goto(config.url);
    
    // Handle login flow
    await this.performLogin(page, config.credentials);
    
    this.pages.set(role, page);
    return page;
  }

  async captureScreenshot(role, selector, filename) {
    const page = this.pages.get(role);
    
    // Wait for element to be visible
    await page.waitForSelector(selector);
    
    // Capture screenshot
    const screenshot = await page.screenshot({
      path: `static/img/screenshots/${role}/${filename}`,
      type: 'png',
      fullPage: false
    });
    
    return screenshot;
  }
}
```

#### 1.3 Configuration Management

```javascript
// config/screenshot-config.js
module.exports = {
  environments: {
    test: {
      admin: 'https://app.smartwinnr.com/',
      manager: 'https://web.smartwinnr.com/',
      user: 'https://web.smartwinnr.com/'
    }
  },
  
  credentials: {
    admin: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    },
    manager: {
      username: process.env.MANAGER_USERNAME, 
      password: process.env.MANAGER_PASSWORD
    },
    user: {
      username: process.env.USER_USERNAME,
      password: process.env.USER_PASSWORD
    }
  },

  viewports: {
    admin: { width: 1440, height: 900 },
    manager: { width: 1024, height: 768 },
    user: { width: 1024, height: 768 }
  }
};
```

### Phase 2: Screenshot Mapping & Processing (Week 2)

#### 2.1 Enhanced Image Mapping

```json
{
  "screenshots": [
    {
      "id": "admin_user_management_001",
      "portal": "admin",
      "role": "admin", 
      "url": "/users",
      "selector": ".user-management-container",
      "description": "User management main view",
      "filename": "admin_user-management_main-view_20250110.png",
      "localPath": "/img/screenshots/admin/admin_user-management_main-view_20250110.png",
      "used_in": ["docs/admin/how-to-manage-users.md"],
      "capture_date": "2025-01-10T10:00:00Z",
      "viewport": "desktop",
      "dependencies": ["authenticated_session", "test_data_loaded"]
    }
  ]
}
```

#### 2.2 Automated Mapping Update

```javascript
// scripts/update-screenshot-mapping.js
class ScreenshotMapper {
  async updateMapping(screenshotData) {
    // Read existing image-mapping.json
    // Find corresponding entries by document usage
    // Update with new screenshot paths
    // Maintain backward compatibility
  }

  async replaceInMarkdown(oldImagePath, newImagePath) {
    // Find all markdown files using old image
    // Replace with new screenshot path
    // Update alt text if needed
  }
}
```

#### 2.3 Quality Control System

```javascript
class QualityController {
  async validateScreenshot(imagePath) {
    // Check image dimensions
    // Verify file size (reasonable limits)
    // Detect if page loaded completely
    // Validate no error states visible
  }

  async compareWithPrevious(newImage, previousImage) {
    // Basic image comparison to detect major changes
    // Flag for manual review if significant differences
    // Store comparison metadata
  }
}
```

### Phase 3: Automation & Integration (Week 3-4)

#### 3.1 Batch Processing System

```javascript
// scripts/batch-capture.js
class BatchCapture {
  async processBatch(screenshotList) {
    const results = [];
    
    for (const screenshot of screenshotList) {
      try {
        await this.navigateToPage(screenshot.url);
        await this.waitForPageLoad(screenshot.selector);
        
        const result = await this.captureScreenshot({
          selector: screenshot.selector,
          filename: screenshot.filename,
          role: screenshot.role
        });
        
        results.push({ ...screenshot, status: 'success', result });
        
      } catch (error) {
        results.push({ ...screenshot, status: 'failed', error: error.message });
      }
    }
    
    return results;
  }

  async captureByDocumentSection(section) {
    // Capture all screenshots needed for a specific documentation section
    // Process in optimal order to minimize navigation
    // Handle dependencies between screenshots
  }
}
```

#### 3.2 Change Detection System

```javascript
// scripts/detect-ui-changes.js
class ChangeDetector {
  async detectChanges(repoPath, branch = 'main') {
    // Monitor frontend repository for changes
    // Parse git diff for UI-related modifications
    // Identify which screenshots need updating
    // Generate capture job list
  }

  async analyzeGitDiff(gitDiff) {
    const changedComponents = [];
    // Parse changed files
    // Map to affected documentation sections  
    // Return list of screenshots to update
    return changedComponents;
  }
}
```

#### 3.3 CI/CD Integration (Future)

```yaml
# .github/workflows/screenshot-update.yml
name: Update Screenshots
on:
  repository_dispatch:
    types: [frontend_deployed]

jobs:
  capture_screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Detect required screenshots
        run: node scripts/detect-changes.js
        
      - name: Capture screenshots
        run: node scripts/batch-capture.js
        env:
          ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          MANAGER_USERNAME: ${{ secrets.MANAGER_USERNAME }}
          MANAGER_PASSWORD: ${{ secrets.MANAGER_PASSWORD }}
          USER_USERNAME: ${{ secrets.USER_USERNAME }}
          USER_PASSWORD: ${{ secrets.USER_PASSWORD }}
          
      - name: Create PR with updated screenshots
        run: node scripts/create-screenshot-pr.js
```

## Technical Specifications

### Screenshot Standards

#### **Resolution & Format**

- **Admin Portal (Desktop)**: 1440x900px
- **Manager/User Portal (iPad)**: 1024x768px  
- **Format**: PNG (lossless compression)
- **Quality**: Full quality, optimized for web

#### **File Naming Convention**

```
[portal]_[section]_[feature]_[view]_[YYYYMMDD].png

Examples:
- admin_user-management_add-user_form-view_20250110.png
- manager_quiz-creation_question-types_main-view_20250110.png
- user_dashboard_performance_charts_20250110.png
```

#### **Directory Structure**

```
/static/img/screenshots/
├── admin/                    # Admin portal screenshots
│   ├── user-management/
│   ├── system-config/
│   └── reports/
├── manager/                  # Manager view screenshots  
│   ├── quiz-creation/
│   ├── team-management/
│   └── analytics/
├── user/                     # User view screenshots
│   ├── dashboard/
│   ├── quizzes/
│   └── learning/
└── screenshot-mapping.json   # Screenshot metadata
```

### Puppeteer Configuration

#### **Browser Settings**

```javascript
const browserConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-gpu'
  ],
  defaultViewport: null
};
```

#### **Page Optimization**

```javascript
const pageConfig = {
  waitUntil: 'networkidle2',
  timeout: 30000,
  ignoreHTTPSErrors: true
};
```

#### **Screenshot Options**

```javascript
const screenshotConfig = {
  type: 'png',
  quality: 100,
  fullPage: false,
  omitBackground: false,
  encoding: 'binary'
};
```

## Security & Authentication

### Credential Management

- **Storage**: Environment variables in `.env` file
- **Production**: AWS Secrets Manager integration
- **Rotation**: Monthly credential updates
- **Access Control**: Principle of least privilege

### Session Handling

- **Session Persistence**: Maintain authenticated sessions during batch processing
- **Timeout Handling**: Automatic re-authentication on session expiry
- **Security Headers**: Handle CSRF tokens and security headers
- **Rate Limiting**: Respect application rate limits

## Error Handling & Recovery

### Common Scenarios

```javascript
class ErrorHandler {
  async handleAuthenticationFailure(page, credentials) {
    // Retry login with fresh session
    // Clear cookies and cache
    // Log authentication errors
  }

  async handlePageLoadFailure(page, url) {
    // Retry navigation
    // Check network connectivity
    // Validate URL accessibility
  }

  async handleElementNotFound(page, selector) {
    // Wait for dynamic content
    // Try alternative selectors
    // Capture page state for debugging
  }

  async handleScreenshotFailure(page, options) {
    // Retry with different options
    // Reduce viewport if memory issues
    // Save page HTML for debugging
  }
}
```

### Recovery Strategies

- **Retry Logic**: Exponential backoff for transient failures
- **Fallback Selectors**: Multiple selector options per screenshot
- **Partial Success**: Continue batch processing despite individual failures
- **Manual Review**: Flag complex scenarios for manual capture

## Performance Optimization

### Capture Efficiency

- **Session Reuse**: Maintain authenticated sessions across captures
- **Parallel Processing**: Process multiple screenshots concurrently
- **Smart Navigation**: Optimize page navigation order
- **Resource Management**: Monitor memory usage and cleanup

### Image Optimization

```javascript
// Post-processing optimization
const sharp = require('sharp');

async function optimizeScreenshot(inputPath, outputPath) {
  await sharp(inputPath)
    .png({ quality: 90, compressionLevel: 9 })
    .resize({ fit: 'inside', withoutEnlargement: true })
    .toFile(outputPath);
}
```

## Monitoring & Analytics

### Capture Metrics

- **Success Rate**: Percentage of successful captures
- **Processing Time**: Average time per screenshot  
- **Error Classification**: Types and frequency of failures
- **Resource Usage**: Memory and CPU consumption

### Quality Metrics

- **Image Quality**: File size and visual quality checks
- **Consistency**: Viewport and styling consistency
- **Completeness**: Coverage of required documentation images
- **Freshness**: Time since last capture per image

## Testing Strategy

### Unit Tests

```javascript
// test/screenshot-capture.test.js
describe('Screenshot Capture', () => {
  test('should authenticate admin user', async () => {
    const capture = new ScreenshotCapture();
    await capture.init();
    const page = await capture.authenticateUser('admin');
    expect(page.url()).toContain('app.smartwinnr.com');
  });

  test('should capture valid screenshot', async () => {
    // Test screenshot capture functionality
  });

  test('should handle authentication failure', async () => {
    // Test error handling scenarios
  });
});
```

### Integration Tests

- **End-to-end capture workflow**: Full process from authentication to file save
- **Cross-portal testing**: Verify both admin and manager/user portals
- **Batch processing validation**: Test multiple screenshot captures
- **Error recovery testing**: Simulate and test failure scenarios

## Rollout Plan

### Phase 1: Single Screenshot Pilot (Week 1)

- **Target**: One simple screenshot from manager portal
- **Scope**: Basic authentication and capture
- **Success Criteria**: Successfully capture and save one screenshot
- **Validation**: Manual comparison with existing screenshot

### Phase 2: Section Pilot (Week 2-3)  

- **Target**: Complete "Getting Started" section (estimated 10-15 screenshots)
- **Scope**: Multiple screenshots across different views
- **Success Criteria**: 90% capture success rate, quality validation
- **Validation**: Documentation team review

### Phase 3: Full Deployment (Week 4-8)

- **Target**: All 681 screenshots across all portals
- **Scope**: Complete automation with batch processing
- **Success Criteria**: under 5% manual intervention needed
- **Validation**: Complete documentation refresh

## Cost Analysis

### Development Costs

- **Engineering Time**: 80 hours @ $100/hr = $8,000
- **Infrastructure Setup**: $500 (server setup, tools)
- **Testing & QA**: $1,500
- **Documentation**: $500
- **Total Development**: $10,500

### Operational Costs (Monthly)

- **Server/Hosting**: $30/month (if cloud-hosted)
- **Test Account Maintenance**: $10/month  
- **Storage**: $5/month (screenshots)
- **Monitoring**: $15/month
- **Total Monthly**: $60/month

### ROI Calculation

- **Manual Screenshot Time**: 15 minutes/screenshot × 681 = 170 hours
- **Manual Time Value**: 170 hours × $50/hr = $8,500
- **Maintenance Savings**: 2 hours/week × 52 weeks × $50/hr = $5,200/year
- **Total Annual Value**: $8,500 + $5,200 = $13,700
- **Payback Period**: 9 months

## Risk Mitigation

### Technical Risks

- **Authentication Changes**: Monitor login flow changes, maintain multiple auth methods
- **UI Changes**: Implement flexible selectors, fallback options
- **Performance Issues**: Resource monitoring, scaling options
- **Browser Compatibility**: Test with multiple browser versions

### Operational Risks

- **Test Data Changes**: Coordinate with backend team on test data stability
- **System Downtime**: Schedule captures during stable periods
- **Credential Expiry**: Automated credential validation and alerts
- **Quality Issues**: Manual review process for critical screenshots

## Success Metrics

### Quality Metrics

- **Capture Success Rate**: >95% successful screenshot captures
- **Image Quality Score**: Manual review rating >4.5/5
- **Processing Time**: under 30 seconds per screenshot average
- **Error Rate**: under 5% capture failures

### Efficiency Metrics  

- **Automation Level**: >90% screenshots captured without manual intervention
- **Time Savings**: 80% reduction in screenshot update time
- **Coverage**: 100% of required screenshots captured and updated
- **Freshness**: Screenshots updated within 48 hours of UI changes

## Next Steps

### Immediate Actions (Week 1)

1. **Environment Setup**: Install Puppeteer and dependencies
2. **Credential Setup**: Obtain test account credentials for all three roles
3. **Basic Script**: Create initial authentication and single screenshot capture
4. **Test Capture**: Capture one screenshot from manager portal as proof of concept

### Short Term (Week 2-4)

1. **Batch Processing**: Implement multi-screenshot capture system
2. **Mapping Integration**: Connect with existing image-mapping.json system  
3. **Quality Control**: Add validation and optimization
4. **Documentation Update**: Replace first batch of screenshots

### Long Term (Month 2-3)

1. **CI/CD Integration**: Connect with frontend repository changes
2. **Change Detection**: Automated detection of UI changes
3. **Monitoring Dashboard**: Track capture success and quality metrics
4. **Full Automation**: Complete hands-off screenshot management

---

*This document serves as the master plan for automated screenshot capture. All implementation progress, issues, and system modifications should be documented here.*
