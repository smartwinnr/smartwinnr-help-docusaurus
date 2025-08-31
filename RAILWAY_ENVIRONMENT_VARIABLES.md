# Railway Environment Variables Reference

This document contains all the environment variables for each service in the Railway deployment.

## Project Information

- **Project ID**: `c444ae51-eed3-4b16-b14d-7ebf13e3f317`
- **Project Name**: `smartwinnr_help`
- **Environment**: `production`
- **Environment ID**: `be1f5b5e-79db-44f4-ac3a-fbc3523d7efa`

## 1. ChromaDB Service (`Chroma`)

**Service ID**: `88657d7c-a058-41e5-ba9d-a40d73aeeaec`

### Required Environment Variables

```bash
# Core Configuration
IS_PERSISTENT=True
PORT=8000
CHROMA_HOST_PORT=8000
CHROMA_WORKERS=1
CHROMA_TIMEOUT_KEEP_ALIVE=30
ANONYMIZED_TELEMETRY=False

# CRITICAL: IPv6 binding for Railway internal networking
CHROMA_HOST_ADDR=::

# Authentication (optional)
CHROMA_AUTH_TOKEN_TRANSPORT_HEADER=Authorization

# Railway Internal URLs
CHROMA_PRIVATE_URL=http://chroma.railway.internal

# Volume Configuration
RAILWAY_VOLUME_MOUNT_PATH=/chroma/chroma
```

### Service URLs
- **Public**: `https://chroma-production-ebac.up.railway.app`
- **Internal**: `http://chroma.railway.internal:8000`

## 2. Chatbot API Service (`chatbot-api`)

**Service ID**: `25d8ac64-8cc5-422e-9c85-f93ffd3fca76`

### Required Environment Variables

```bash
# Application Configuration  
NODE_ENV=production
API_PORT=3002
LOG_LEVEL=info

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here  # ⚠️ SECRET - Replace with actual key
CHAT_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small

# ChromaDB Connection (Internal Railway Networking)
CHROMA_HOST=chroma.railway.internal
CHROMA_PORT=8000
CHROMA_SSL=false
COLLECTION_NAME=smartwinnr_docs

# CORS Configuration
CORS_ORIGIN=https://docusaurus-production.up.railway.app
```

### Service URLs
- **Public**: `https://chatbot-api-production-32f8.up.railway.app`
- **Internal**: `http://chatbot-api.railway.internal`

## 3. Docusaurus Service (`docusaurus`)

**Service ID**: `17ed88cc-8660-4c9a-acec-a68a038a1ae7`

### Required Environment Variables

```bash
# Application Configuration
NODE_ENV=production

# API Connection
REACT_APP_API_URL=https://chatbot-api-production-32f8.up.railway.app
```

### Service URLs
- **Public**: `https://docusaurus-production.up.railway.app`
- **Internal**: `http://docusaurus.railway.internal`

## Critical Notes for Railway Deployment

### 1. ChromaDB Internal Networking
```bash
# ⚠️ CRITICAL: Must use IPv6 binding for Railway internal networking
CHROMA_HOST_ADDR=::
```
Without this setting, other services cannot connect to ChromaDB via `chroma.railway.internal`.

### 2. Service Communication
- **Use internal URLs** for service-to-service communication
- **Use public URLs** only for external access
- **Internal networking uses HTTP** (no SSL between services)

### 3. Security
- **Never commit** actual `OPENAI_API_KEY` values
- **Use Railway's environment variable encryption** for secrets
- **Internal networking is private** within Railway's network

## Troubleshooting

### ChromaDB Connection Issues
1. Verify `CHROMA_HOST_ADDR=::` is set on ChromaDB service
2. Ensure chatbot-api uses `CHROMA_HOST=chroma.railway.internal`
3. Check internal networking uses `CHROMA_SSL=false`

### CORS Issues  
1. Verify `CORS_ORIGIN` matches exact Docusaurus domain
2. Update after any domain changes

### API Connection Issues
1. Ensure `REACT_APP_API_URL` points to correct chatbot-api domain
2. Redeploy Docusaurus after API URL changes

## Deployment Commands

```bash
# Deploy chatbot-api service
railway up --service chatbot-api

# Deploy docusaurus service  
railway up --service docusaurus

# View service variables
railway variables --service chatbot-api
railway variables --service docusaurus
railway variables --service 88657d7c-a058-41e5-ba9d-a40d73aeeaec  # ChromaDB

# Update environment variables
railway variables --service chatbot-api --set "KEY=value"
```