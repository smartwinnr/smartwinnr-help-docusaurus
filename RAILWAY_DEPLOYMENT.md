# Railway Deployment Guide for SmartWinnr Help Documentation

This guide covers deploying the SmartWinnr Help documentation system to Railway, including the static documentation site, AI chatbot API, and ChromaDB vector database.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Vercel      │    │     Railway      │    │  AWS Secrets    │
│                 │    │                  │    │   Manager       │
│ Static Docs     │◄──►│ Chatbot API      │◄──►│                 │
│ (Docusaurus)    │    │ (Node.js/Express)│    │ OpenAI API Key  │
│                 │    │                  │    │                 │
│ help.smartwinnr │    │ Port: 3002       │    │ Secure Storage  │
│ .com            │    │                  │    └─────────────────┘
└─────────────────┘    │ ChromaDB         │
                       │ (Vector DB)      │
                       │ Port: 8000       │
                       │ Persistent Vol   │
                       └──────────────────┘
```

## 🚀 Deployment Steps

### **Step 1: Prepare Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (or create new one)
railway link
```

### **Step 2: Deploy ChromaDB Service**

```bash
# Create ChromaDB service
railway service create chromadb

# Deploy ChromaDB
railway up --service chromadb --dockerfile Dockerfile.chromadb

# Set environment variables for ChromaDB
railway variables set CHROMA_HOST=0.0.0.0 --service chromadb
railway variables set CHROMA_PORT=8000 --service chromadb
railway variables set PERSIST_DIRECTORY=/chroma/data --service chromadb
railway variables set ANONYMIZED_TELEMETRY=False --service chromadb

# Add persistent volume
railway volume create --name chromadb-data --mount-path /chroma/data --service chromadb
```

### **Step 3: Deploy Chatbot API Service**

```bash
# Create Chatbot API service
railway service create chatbot-api

# Deploy Chatbot API
railway up --service chatbot-api --dockerfile Dockerfile.chatbot

# Set environment variables for Chatbot API
railway variables set NODE_ENV=production --service chatbot-api
railway variables set API_PORT=3002 --service chatbot-api
railway variables set CHROMA_HOST=chromadb.railway.internal --service chatbot-api
railway variables set CHROMA_PORT=8000 --service chatbot-api
railway variables set COLLECTION_NAME=smartwinnr_docs --service chatbot-api
railway variables set EMBEDDING_MODEL=text-embedding-3-small --service chatbot-api
railway variables set CHAT_MODEL=gpt-4o-mini --service chatbot-api
railway variables set LOG_LEVEL=info --service chatbot-api

# AWS Secrets Manager configuration
railway variables set AWS_REGION=us-east-1 --service chatbot-api
railway variables set AWS_SECRET_NAME=smartwinnr/openai-api-key --service chatbot-api

# For development/testing only - replace with AWS Secrets Manager in production
railway variables set OPENAI_API_KEY=your_openai_api_key_here --service chatbot-api
```

### **Step 4: Deploy Static Documentation (Alternative Approaches)**

#### **Option A: Deploy to Vercel (Recommended)**
```bash
# Build documentation
npm run build

# Deploy to Vercel
npx vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_CHATBOT_API_URL=https://chatbot-api-production.railway.app
```

#### **Option B: Deploy to Railway (Static Site)**
```bash
# Create documentation service
railway service create docs

# Build and deploy static files
npm run build
railway up --service docs --start-command "npx serve build -p 3000"
```

## 🔧 Environment Configuration

### **AWS Secrets Manager Setup (Production)**

1. **Create Secret in AWS:**
```bash
aws secretsmanager create-secret \
  --name "smartwinnr/openai-api-key" \
  --description "OpenAI API key for SmartWinnr Help chatbot" \
  --secret-string '{"OPENAI_API_KEY":"sk-your-actual-key-here"}'
```

2. **IAM Role Configuration:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:smartwinnr/openai-api-key*"
    }
  ]
}
```

3. **Railway AWS Integration:**
```bash
# Set AWS credentials in Railway
railway variables set AWS_ACCESS_KEY_ID=your_access_key --service chatbot-api
railway variables set AWS_SECRET_ACCESS_KEY=your_secret_key --service chatbot-api
```

### **Production Environment Variables**

#### **Chatbot API Service:**
```bash
NODE_ENV=production
API_PORT=3002
CHROMA_HOST=chromadb.railway.internal
CHROMA_PORT=8000
CORS_ORIGIN=https://help.smartwinnr.com
COLLECTION_NAME=smartwinnr_docs
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
AWS_REGION=us-east-1
AWS_SECRET_NAME=smartwinnr/openai-api-key
LOG_LEVEL=info
```

#### **ChromaDB Service:**
```bash
CHROMA_HOST=0.0.0.0
CHROMA_PORT=8000
PERSIST_DIRECTORY=/chroma/data
ANONYMIZED_TELEMETRY=False
```

## 📋 Post-Deployment Setup

### **1. Index Documentation**
```bash
# After deployment, index the documentation
curl -X POST https://chatbot-api-production.railway.app/api/vector/index
```

### **2. Health Checks**
```bash
# Verify all services are healthy
curl https://chatbot-api-production.railway.app/health
curl https://chromadb-production.railway.app/api/v1/heartbeat
curl https://help.smartwinnr.com
```

### **3. Test Chatbot Functionality**
```bash
curl -X POST https://chatbot-api-production.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is SmartWinnr?","userContext":{"role":"admin"}}'
```

## 🔗 Service URLs

After deployment, your services will be available at:

- **Documentation**: `https://help.smartwinnr.com` (Vercel)
- **Chatbot API**: `https://chatbot-api-production.railway.app`
- **ChromaDB**: `https://chromadb-production.railway.app` (internal)
- **CMS Admin**: `https://help.smartwinnr.com/admin/`

## 💰 Cost Estimation

### **Railway Costs:**
- **Chatbot API**: ~$5-15/month (depending on usage)
- **ChromaDB**: ~$10-20/month (with persistent storage)
- **Total Railway**: ~$15-35/month

### **Additional Costs:**
- **Vercel Pro**: ~$20/month (for team features)
- **AWS Secrets Manager**: ~$0.40/month per secret
- **Total Monthly**: ~$35-55/month

## 🛠️ Maintenance & Monitoring

### **Railway Dashboard:**
- Monitor service health and performance
- View logs and metrics
- Scale services up/down as needed
- Manage environment variables

### **Backup Strategy:**
```bash
# Backup ChromaDB data (run periodically)
railway connect chromadb
# Inside container: tar -czf /backup/chromadb-$(date +%Y%m%d).tar.gz /chroma/data
```

### **Monitoring:**
- **Health Endpoints**: Automated health checks configured
- **Logging**: Centralized logs in Railway dashboard
- **Alerts**: Set up Railway notifications for service failures

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **AWS IAM**: Use least-privilege IAM roles
3. **Railway Access**: Limit team access to production services
4. **CORS**: Properly configure allowed origins
5. **Secrets Rotation**: Regular API key rotation via AWS Secrets Manager

## 🚨 Troubleshooting

### **Common Issues:**

#### **ChromaDB Connection Failed:**
```bash
# Check service logs
railway logs --service chromadb

# Verify internal networking
railway connect chatbot-api
# Inside container: curl http://chromadb.railway.internal:8000/api/v1/heartbeat
```

#### **Missing Environment Variables:**
```bash
# List all variables
railway variables --service chatbot-api

# Add missing variable
railway variables set VARIABLE_NAME=value --service chatbot-api
```

#### **Build Failures:**
```bash
# Check build logs
railway logs --service chatbot-api

# Force rebuild
railway redeploy --service chatbot-api
```

## 📚 Additional Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Docusaurus Deployment**: [docusaurus.io/docs/deployment](https://docusaurus.io/docs/deployment)
- **ChromaDB Documentation**: [docs.trychroma.com](https://docs.trychroma.com)

---

*Last Updated: August 15, 2025*