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

### Prerequisites for Local Development

Before running the project locally, ensure you have all required services installed:

#### 1. ChromaDB Installation

**Check if ChromaDB is already installed:**
```bash
which chroma
```

**If not installed, install ChromaDB:**
```bash
# Option A: Using pip
pip install chromadb

# Option B: Using conda
conda install -c conda-forge chromadb

# Option C: Using Docker (alternative)
docker pull chromadb/chroma:0.6.3
```

#### 2. Node.js Dependencies
```bash
npm install
```

#### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env file with your OpenAI API key and other settings
```

### Complete Local Development Setup (All 3 Services)

For the full development experience with AI chatbot functionality, run all three services:

#### Step 1: Start ChromaDB Server
```bash
# Start ChromaDB on port 8000 with local data storage
chroma run --host 0.0.0.0 --port 8000 --path ./chroma_data
```

Keep this terminal open. ChromaDB will display:
```
Connect to Chroma at: http://localhost:8000
Listening on 0.0.0.0:8000
```

#### Step 2: Start Docusaurus + Chatbot (New Terminal)
```bash
# Start both documentation site and chatbot API with colored output
npm run dev:full
```

This will start:
- **Documentation site**: `http://localhost:3000`
- **Chatbot API server**: `http://localhost:3002`
- **ChromaDB connection**: Chatbot will connect to ChromaDB automatically

#### Verify All Services Are Running

| Service | URL | Status Check |
|---------|-----|--------------|
| **Docusaurus** | http://localhost:3000 | Visit in browser |
| **Chatbot API** | http://localhost:3002/health | Should return `{"status":"healthy"}` |
| **ChromaDB** | http://localhost:8000 | Vector database running |

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
# Note: Requires ChromaDB to be running on port 8000
```

**ChromaDB only:**
```bash
chroma run --host 0.0.0.0 --port 8000 --path ./chroma_data
```

### Alternative ChromaDB Setup (Docker)

If you prefer using Docker for ChromaDB:
```bash
# Run ChromaDB with Docker
docker run -d --name chromadb-local -p 8000:8000 \
  -v chromadb_data:/chroma/data \
  -e IS_PERSISTENT=TRUE \
  -e PERSIST_DIRECTORY=/chroma/data \
  chromadb/chroma:0.6.3

# Stop ChromaDB container
docker stop chromadb-local

# Remove ChromaDB container
docker rm chromadb-local
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

### Local Development Troubleshooting

#### Port Conflicts
If you encounter port conflicts:

```bash
# Check what's using a specific port
lsof -ti:3000  # Replace 3000 with your port
lsof -ti:3002
lsof -ti:8000

# Kill process using a port
kill $(lsof -ti:3000)
```

#### ChromaDB Connection Issues
- **Error: "Connection refused"**: Ensure ChromaDB is running on port 8000
- **Error: "Collection not found"**: The chatbot will create the collection automatically on first run
- **Slow startup**: First run may take longer as ChromaDB initializes

#### Common Environment Issues
```bash
# Clear npm cache if needed
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Docusaurus cache
npm run clear
```

#### Health Check Commands
```bash
# Test all services are running
curl http://localhost:3000                  # Docusaurus (returns HTML)
curl http://localhost:3002/health           # Chatbot API health
curl http://localhost:8000/api/v1/version   # ChromaDB (may show deprecation message)

# Test chatbot functionality
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is SmartWinnr?"}'
```

## WYSIWYG Content Management System

### **Access the CMS**
Navigate to the admin interface for user-friendly content editing:
```
http://localhost:3000/admin/          # Development
https://help.smartwinnr.com/admin/    # Production
```

### **CMS Features**
- **📝 WYSIWYG Editor**: Rich text editing with live preview
- **🖼️ Image Management**: Drag & drop image uploads
- **📁 Organized Collections**: Edit docs by category
- **🔄 Git Integration**: Changes saved as Git commits
- **👥 User Permissions**: Access controlled via GitLab
- **📱 Mobile Friendly**: Edit on any device
- **🔍 Search & Filter**: Find content quickly
- **📋 Editorial Workflow**: Draft → Review → Publish

### **Setup Instructions**
1. **GitLab OAuth Setup**: 
   - Go to GitLab → User Settings → Applications
   - Create new application with redirect URI: `https://help.smartwinnr.com/admin/`
   - Copy Application ID to `static/admin/config.yml`

2. **Access Control**: 
   - Only GitLab users with repository access can edit
   - Maintains same security as current Git workflow

### **Content Collections Available**
- 📚 Getting Started (27 files)
- 📝 Quiz & Assessments (51 files) 
- 🎯 MicroLearning & SmartFeeds (19 files)
- 🛤️ Learning & SmartPaths (13 files)
- 📋 Forms & Data Collection (14 files)
- 🧠 Knowledge Hub (8 files)
- 📊 Surveys & Feedback (11 files)
- 📈 Analytics & Reporting (1 file)
- 🏆 Competitions & Gamification (34 files)
- 🎯 Coaching & Performance (19 files)
- ⚙️ Administration (35 files)
- 📱 Mobile & Platform Tools (1 file)
- 🆘 Help & Support (2 files)

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

## 🚀 Production Deployment

### **Railway Deployment (3-Service Architecture)**
Deploy using the correct 3-service architecture on Railway with separate railway config files:

#### **Service Structure:**
```
├── railway.toml              # ChromaDB service configuration
├── railway.chatbot.toml      # Chatbot API service configuration  
├── railway.docs.toml         # Docusaurus docs service configuration
├── Dockerfile.chromadb       # ChromaDB container
├── Dockerfile.chatbot        # Chatbot API container
└── docker/docs/
    ├── Dockerfile.docs       # Docusaurus + Nginx container
    └── nginx.conf           # Nginx proxy configuration
```

#### **Services:**

1. **chromadb** - ChromaDB vector database (IPv6 binding for Railway private network)
2. **chatbot-api** - Node.js chatbot API server (connects to ChromaDB via private network)
3. **docs** - Docusaurus documentation site with Nginx reverse proxy

#### **Deployment Steps:**

**Prerequisites: Use Existing Services**
```bash
# Link project to existing Railway setup
railway link

# Note: chatbot-api service already exists - DO NOT create new services without explicit approval
# Use existing services: chromadb, chatbot-api, docs

# Create persistent volume for ChromaDB data storage if needed
railway volume add --mount-path /chroma/data --service chromadb
```

**⚠️ IMPORTANT:** Do not create new Railway services without explicit approval. The `chatbot-api` service already exists.

**Deploy Each Service:**

1. **Deploy ChromaDB service:**
   ```bash
   railway up --service chromadb
   # Uses railway.toml, creates service with IPv6 binding and persistent volume
   ```

2. **Deploy Chatbot API:**
   ```bash
   # Switch to chatbot-api service
   railway service chatbot-api
   
   # Deploy using chatbot configuration (workaround for --config flag)
   mv railway.toml railway.toml.bak && cp railway.chatbot.toml railway.toml && railway up && mv railway.toml.bak railway.toml
   
   # Set OPENAI_API_KEY in Railway UI after deployment
   # Update CORS_ORIGIN after docs deployment
   ```
   
   **Status**: ✅ **DEPLOYED** - Chatbot API service is now running successfully

3. **Deploy Docs Service:**
   ```bash
   railway up --service docs --config railway.docs.toml
   # Serves Docusaurus with Nginx proxy to chatbot-api
   # Assign public domain in Railway UI after deployment
   ```

#### **Configuration Files:**
- **railway.toml**: ChromaDB service (IPv6 binding, health checks, persistent volume)
- **railway.chatbot.toml**: Chatbot API service (Railway private network variables)
- **railway.docs.toml**: Docusaurus docs service (Nginx proxy configuration)
- **Dockerfile.chromadb**: ChromaDB container configuration
- **Dockerfile.chatbot**: Node.js chatbot container (Debian slim, esbuild rebuild, husky disabled for production)
- **docker/docs/Dockerfile.docs**: Multi-stage build (Node.js build + Nginx serve)
- **docker/docs/nginx.conf**: Reverse proxy configuration for /api → chatbot-api

#### **Volume Management:**
- **chromadb-volume**: 5GB persistent storage mounted at `/chroma/data`
- **IPv6 Networking**: ChromaDB binds to `::` for Railway private network compatibility
- **Service Communication**: `${{chromadb.RAILWAY_PRIVATE_DOMAIN}}` for inter-service connections

#### **Environment Variables Setup:**

**ChromaDB Service Environment Variables (Configured in railway.toml):**
- ✅ `CHROMA_SERVER_HOST=::` (IPv6 for Railway private networking)
- ✅ `CHROMA_SERVER_HTTP_PORT=8000`
- ✅ `PERSIST_DIRECTORY=/chroma/data`
- ✅ `ANONYMIZED_TELEMETRY=False`

**Chatbot API Service Environment Variables:**
- ✅ `API_PORT=3002`
- ✅ `CORS_ORIGIN=https://help.smartwinnr.com`
- ✅ `CHROMA_HOST=chromadb.railway.internal` (Private network connection)
- ✅ `CHROMA_PORT=8000`
- ✅ `OPENAI_API_KEY` - **Configured and working**
- ✅ `NODE_ENV=production`
- ✅ `COLLECTION_NAME=smartwinnr_docs`
- ✅ `EMBEDDING_MODEL=text-embedding-3-small`
- ✅ `CHAT_MODEL=gpt-4o-mini`

**✅ Deployment Complete - Chatbot API Running Successfully**

The chatbot-api service has been deployed and is running with all required environment variables configured.

**Alternative CHROMA_HOST Configuration:**
If Railway variable references don't work on your plan, update manually after first deploy:
```bash
# Get ChromaDB internal host after deployment
railway logs --service chromadb
# Then update chatbot railway.toml with the actual internal host
```

- **zealous-tranquility**: Documentation site configuration

#### **Service Communication:**
- ChromaDB runs independently as vector database on port 8000
- Chatbot API connects to ChromaDB via Railway internal networking
- Documentation site connects to Chatbot API for AI functionality
- Health checks configured for both custom services

#### **Troubleshooting Chatbot API Deployment**

**Common Issues and Solutions:**

1. **npm ci exit code 127 (husky prepare script)**
   ```bash
   # Issue: husky not found during Docker build
   # Solution: Dockerfile.chatbot includes ENV HUSKY=0 and --ignore-scripts
   ```

2. **esbuild platform binary issues**
   ```bash
   # Issue: @esbuild/linux-x64 missing in Alpine
   # Solution: Using Debian slim + npm rebuild esbuild
   ```

3. **Docker Build Configuration**
   - **Base Image**: `node:18-bullseye-slim` (Debian with glibc)
   - **Key Steps**: Husky disabled, esbuild rebuilt for platform compatibility
   - **Production Optimized**: `--omit=dev --ignore-scripts`

**Complete deployment guide**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

### **Vercel Deployment (Frontend)**
Deploy the documentation site to Vercel:

```bash
# Build and deploy
npm run build
npx vercel --prod
```

### **Production Architecture:**
- **Frontend**: Vercel (static site hosting)
- **Backend API**: Railway (chatbot service)
- **Database**: Railway (ChromaDB with persistent storage)
- **Secrets**: AWS Secrets Manager (OpenAI API keys)
- **Cost**: ~$35-55/month total

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
│   ├── admin/                      # CMS configuration
│   │   ├── config.yml             # Decap CMS settings
│   │   └── index.html             # CMS admin interface
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

## Documentation Style Guide & Workflow

This project includes automated validation to ensure all documentation follows the [SmartWinnr Help Document Style Guide](./SmartWinnr-Help-Style-Guide.md).

### Writing New Documentation

1. **Use Templates**: Start with pre-built templates in `/templates/`:
   - `help-document-template.md` - For step-by-step guides
   - `feature-overview-template.md` - For feature introductions
   - `troubleshooting-template.md` - For problem-solving guides

2. **Follow Style Guidelines**: 
   - Action-oriented titles (e.g., "Upload a Training Video")
   - American English spelling
   - Bold UI elements (**Save** button)
   - Positive framing ("Remember to..." not "Don't forget...")
   - Short sentences (15-20 words max)

3. **Automated Validation**: 
   - Run `npm run lint:docs` to check style compliance
   - Run `npm run lint:docs:fix` to auto-fix formatting issues
   - Pre-commit hooks automatically check and fix documentation

### Style Validation System

#### Local Development
```bash
# Check all documentation for style issues
npm run lint:docs

# Automatically fix style issues
npm run lint:docs:fix
```

#### Git Integration
- **Pre-commit Hooks**: Automatically validate and fix documentation before commits
- **GitLab CI/CD**: Merge requests are blocked if documentation fails style checks
- **Custom Rules**: Enforce action-oriented titles, UI formatting, and tone guidelines

#### Custom Style Rules
Our markdownlint configuration includes custom rules that enforce:
- Action-oriented H1 titles
- Bold formatting for UI elements
- Positive framing instead of negative language
- American English spelling
- Sentence length limits for readability

### Contributing

#### Documentation Updates
1. **Start with Templates**: Use appropriate template from `/templates/`
2. **Follow Style Guide**: Adhere to SmartWinnr documentation standards
3. **Use Validation Tools**: Run `npm run lint:docs:fix` before committing
4. **Structured Organization**: Place content in appropriate category folders
5. **Image Management**: Add images to `/static/img/[category]/` folders

#### Image Management
- **New Images**: Add to appropriate category folder
- **External Images**: Use migration script or add manually with proper metadata
- **Naming Convention**: `source-description-hash.extension`
- **Mapping Updates**: Ensure image-mapping.json stays current

#### Quality Assurance
- Pre-commit hooks prevent style violations
- GitLab CI validates all documentation changes
- Automated fixes maintain consistency
- Style guide integration ensures professional quality

## Migration Notes

This documentation has been significantly reorganized from the original HelpScout structure:
- **Eliminated duplicates**: Removed repeated menu items and redundant content
- **Workflow-based organization**: Grouped content by user tasks rather than features
- **Comprehensive guides**: Combined related topics into complete workflows
- **Local image hosting**: Migrated from external hosting to local storage
- **Improved navigation**: Clearer, more intuitive structure for users

The reorganization maintains all original content while dramatically improving discoverability and user experience.