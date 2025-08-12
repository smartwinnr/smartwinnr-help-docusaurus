# SmartWinnr Help Documentation

A Docusaurus-based documentation site with integrated AI chatbot functionality for SmartWinnr help content. Features a reorganized, user-friendly documentation structure with locally hosted images and automated image management capabilities.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- OpenAI API key for chatbot functionality

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and configure the following variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - Other configuration options as needed (see `.env.example` for details)

## Running the Project

### Development Mode (Recommended)
Run both the documentation site and chatbot server together:
```bash
npm run dev
```

For enhanced development experience with colored output:
```bash
npm run dev:full
```

This will start:
- **Documentation site**: `http://localhost:3000`
- **Chatbot API server**: `http://localhost:3002`

### Individual Components

**Documentation site only:**
```bash
npm run start:docs    # Runs on port 3000
# or
npm start            # Also runs on port 3000
```

**Chatbot server only:**
```bash
npm run chatbot:dev  # Runs on port 3002
```

### Production

**Build for production:**
```bash
npm run build
```

**Serve production build:**
```bash
npm run serve:docs   # Serves on port 3000
# or  
npm run serve        # Also serves on port 3000
```

## Documentation Structure

The documentation has been reorganized into intuitive, workflow-based sections:

### 🚀 **Getting Started** (5 consolidated guides)
- **Account Setup & Login** - Login, password recovery, account troubleshooting
- **Profile & Settings** - Password management, profile customization, language settings
- **App Management** - Updates, version checking, system requirements
- **Manager Features** - Switching between user and manager views
- **About SmartWinnr** - Platform overview and key features

### 📝 **Quiz Management** (3 comprehensive guides)
- **Creating Quizzes** - All question types, manual/automatic quiz creation
- **Quiz Administration** - Settings, permissions, user management
- **Quiz Analytics & Reports** - Performance insights and reporting

### 📚 **Learning & Training** (3 content-focused guides)
- **SmartFeed Management** - Bite-sized content creation and distribution
- **SmartPath Management** - Structured learning journeys and modules
- **Knowledge Hub (KHub)** - Centralized knowledge repository

### Additional Sections
- **🎯 Coaching & Performance**
- **🏆 Competitions & Gamification** 
- **📋 Surveys & Feedback**
- **📊 Reports & Analytics**
- **👥 Administration**
- **🔧 Troubleshooting**

## Image Management System

### Local Image Storage
All documentation images are now hosted locally under `/static/img/` with organized directory structure:
- `/static/img/getting-started/` - Setup and login images
- `/static/img/quizzes/` - Quiz management screenshots
- `/static/img/learning/` - Learning content images
- And more category-specific folders

### Image Migration & Mapping
- **Migration Script**: `/scripts/migrate-images.js` - Automated HelpScout image migration
- **Image Mapping**: `/static/img/image-mapping.json` - Complete image metadata and usage tracking
- **Automated Generation Ready**: Structure supports automated image generation after production pushes

### Running Image Migration
```bash
# Migrate external images to local storage
node scripts/migrate-images.js
```

## Port Configuration

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Documentation** | 3000 | http://localhost:3000 | Docusaurus site |
| **Chatbot API** | 3002 | http://localhost:3002 | AI backend |
| **ChromaDB** | 8000 | http://localhost:8000 | Vector database |

See [PORT_CONFIG.md](./PORT_CONFIG.md) for detailed port configuration and troubleshooting.

## Additional Commands

- **Enhanced development:** `npm run dev:full` (with colored output)
- **Index documentation for chatbot:** `npm run index-docs`
- **Type checking:** `npm run typecheck`
- **Clear Docusaurus cache:** `npm run clear`
- **Migrate images:** `node scripts/migrate-images.js`

### Health Checks
```bash
# Documentation server
curl http://localhost:3000

# Chatbot API health
curl http://localhost:3002/health

# Test chatbot functionality
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is SmartWinnr?"}'
```

## Project Structure

```
├── docs/                           # Documentation content
│   ├── getting-started/            # Consolidated setup guides
│   ├── quizzes/                    # Quiz management workflows  
│   ├── learning/                   # Learning content management
│   └── [other-sections]/           # Additional documentation
├── src/                            # Docusaurus theme and components
├── services/chatbot/               # AI chatbot backend service
├── static/                         # Static assets
│   └── img/                        # Local image storage
│       ├── getting-started/        # Category-organized images
│       ├── quizzes/               
│       ├── learning/              
│       └── image-mapping.json      # Image metadata and tracking
├── scripts/                        # Utility scripts
│   └── migrate-images.js          # Image migration tool
└── sidebars.ts                     # Navigation structure
```

## Automated Screenshot Capture System

**Status: Implementation Ready** | **Full Plan**: [AUTOMATED_SCREENSHOT_CAPTURE.md](./docs/AUTOMATED_SCREENSHOT_CAPTURE.md)

A comprehensive Puppeteer-based system to automatically capture real screenshots from SmartWinnr test environments, replacing outdated HelpScout screenshots with current, accurate UI images.

### System Overview
- **Target Systems**: SmartWinnr Admin Portal + Manager/User Portal
- **Current Scale**: 681 screenshots to be captured and maintained
- **Technology**: Puppeteer with multi-portal authentication
- **Automation Level**: 95% automated capture with quality controls
- **Estimated Timeline**: 4 weeks (3 phases)
- **ROI**: $13,700 annual value, 9-month payback

### Key Features

#### 🎯 **Multi-Portal Screenshot Capture**
- **Admin Portal**: Desktop screenshots (1440x900px) from https://app.smartwinnr.com/
- **Manager/User Portal**: iPad screenshots (1024x768px) from https://web.smartwinnr.com/
- **Authentication**: Dedicated test accounts for each role (Admin, Manager, User)
- **Smart Navigation**: Optimized page navigation and session management

#### 🔄 **Automated Processing**
- **Batch Capture**: Process multiple screenshots efficiently
- **Quality Control**: Automatic validation and optimization
- **Error Handling**: Retry logic and failure recovery
- **Change Detection**: Monitor frontend changes for screenshot updates

#### 📊 **Management & Integration**
- **Mapping Integration**: Seamless integration with existing image-mapping.json
- **File Organization**: Structured storage in `/static/img/screenshots/`
- **Version Control**: Track screenshot changes and enable rollbacks
- **CI/CD Ready**: Designed for future frontend deployment integration

### Implementation Phases

#### **Phase 1: Foundation** (Week 1)
- Puppeteer setup and authentication system
- Basic single screenshot capture for proof of concept
- Credential management and security setup

#### **Phase 2: Batch Processing** (Week 2-3)
- Multi-screenshot capture system
- Image mapping integration and replacement
- Quality control and validation systems

#### **Phase 3: Automation** (Week 4)
- Batch processing for all 681 screenshots
- Change detection and automated triggers
- Monitoring and analytics dashboard

### Technical Specifications

#### **Screenshot Standards**
- **Format**: PNG (lossless compression)
- **Admin Resolution**: 1440x900px (desktop)
- **Manager/User Resolution**: 1024x768px (iPad)
- **Naming**: `[portal]_[section]_[feature]_[view]_[YYYYMMDD].png`

#### **Target Environments**
- **Test Server**: Dedicated test environment with dummy data
- **Admin Portal**: https://app.smartwinnr.com/ (separate system)
- **Manager/User Portal**: https://web.smartwinnr.com/ (unified system)
- **Authentication**: Username/password with dedicated test accounts

#### **Directory Structure**
```
/static/img/screenshots/
├── admin/          # Admin portal screenshots
├── manager/        # Manager view screenshots
├── user/          # User view screenshots
└── screenshot-mapping.json
```

### Current Infrastructure

#### **Screenshot Mapping System**
- **Enhanced Metadata**: Extended image-mapping.json with capture specifications
- **Portal Routing**: Automatic portal and role detection
- **Dependency Tracking**: Manage authentication and page dependencies
- **Quality Metrics**: Capture success rates and validation

#### **Automation-Ready Features**
- **Session Management**: Persistent authentication across captures
- **Smart Selectors**: Flexible element targeting with fallbacks
- **Error Recovery**: Retry logic and alternative capture methods
- **Resource Optimization**: Memory and performance management

### Cost Structure
- **Development**: $10,500 one-time setup
- **Operational**: ~$60/month (hosting, storage, monitoring)
- **Annual Savings**: $13,700 (time savings + maintenance efficiency)
- **Per Screenshot Cost**: <$0.15 total cost including capture and processing

### Rollout Plan
1. **Single Screenshot Pilot**: Proof of concept with one manager portal screenshot
2. **Section Pilot**: Complete "Getting Started" section (10-15 screenshots)
3. **Full Deployment**: All 681 screenshots across both portals
4. **CI/CD Integration**: Automated capture on frontend changes

### Next Steps
1. **Week 1**: Setup Puppeteer, authentication, and single screenshot capture
2. **Week 2**: Implement batch processing and mapping integration
3. **Week 3**: Deploy section pilot and quality validation
4. **Week 4**: Full deployment with monitoring and analytics

*See [AUTOMATED_SCREENSHOT_CAPTURE.md](./docs/AUTOMATED_SCREENSHOT_CAPTURE.md) for complete technical specifications, implementation details, and code examples.*

## Environment Configuration

The project supports both development and production environments:

- **Development:** Uses local OpenAI API key from `.env` file
- **Production:** Fetches API key from AWS Secrets Manager

See `.env.example` for detailed configuration options.

## Contributing

### Documentation Updates
1. Follow the established category structure
2. Use descriptive alt text for images
3. Place images in appropriate `/static/img/[category]/` folders
4. Update image-mapping.json when adding new images

### Image Management
- **New Images**: Add to appropriate category folder
- **External Images**: Use migration script or add manually with proper metadata
- **Naming Convention**: `source-description-hash.extension`
- **Mapping Updates**: Ensure image-mapping.json stays current

## Migration Notes

This documentation has been significantly reorganized from the original HelpScout structure:
- **Eliminated duplicates**: Removed repeated menu items and redundant content
- **Workflow-based organization**: Grouped content by user tasks rather than features
- **Comprehensive guides**: Combined related topics into complete workflows
- **Local image hosting**: Migrated from external hosting to local storage
- **Improved navigation**: Clearer, more intuitive structure for users

The reorganization maintains all original content while dramatically improving discoverability and user experience.