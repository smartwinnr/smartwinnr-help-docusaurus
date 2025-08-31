# Railway Deployment Guide

This guide explains how to deploy your SmartWinnr Help project to Railway with 3 services: ChromaDB, Chatbot API, and Docusaurus.

## Prerequisites

- Railway CLI installed and authenticated
- Railway project `smartwinnr_help` created with 3 services:
  - `chroma` (ChromaDB - set up manually)
  - `chatbot-api` 
  - `docusaurus`

## Service URLs

- **Docusaurus (Frontend)**: https://docusaurus-production.up.railway.app
- **Chatbot API**: https://chatbot-api-production-32f8.up.railway.app  
- **ChromaDB**: https://chroma-production-ebac.up.railway.app

## Deployment Steps

### 1. ChromaDB Service (Manual Setup)

**⚠️ IMPORTANT**: ChromaDB service is set up manually using Railway's official ChromaDB template.
- **Template**: Use Railway's official ChromaDB template from https://railway.com/deploy/kbvIRV
- **Service Name**: `Chroma`
- **No repository connection needed**

**Critical Configuration for Railway Internal Networking:**
```
CHROMA_HOST_ADDR=::
```
**Note**: This IPv6 binding (`::`) is essential for Railway's internal networking to work between services.

### Complete ChromaDB Environment Variables
```bash
IS_PERSISTENT=True
PORT=8000
CHROMA_HOST_PORT=8000
CHROMA_HOST_ADDR=::  # ⚠️ CRITICAL for internal networking
CHROMA_WORKERS=1
CHROMA_TIMEOUT_KEEP_ALIVE=30
ANONYMIZED_TELEMETRY=False
CHROMA_AUTH_TOKEN_TRANSPORT_HEADER=Authorization
CHROMA_PRIVATE_URL=http://chroma.railway.internal
```

### 2. Chatbot API Service

**Repository Setup:**
- Connect your GitHub repository to the `chatbot-api` service  
- Set the **Root Directory** to: `/`
- Set the **Dockerfile Path** to: `Dockerfile.chatbot`

**Environment Variables:**
```bash
NODE_ENV=production
LOG_LEVEL=info
API_PORT=3002
OPENAI_API_KEY=your_actual_openai_api_key
CHROMA_HOST=chroma.railway.internal
CHROMA_PORT=8000
CHROMA_SSL=false
CORS_ORIGIN=https://docusaurus-production.up.railway.app
COLLECTION_NAME=smartwinnr_docs
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
```

**⚠️ Critical Notes:**
- Replace `your_actual_openai_api_key` with your real OpenAI API key
- Use `chroma.railway.internal` (NOT `chromadb.railway.internal`) 
- Set `CHROMA_SSL=false` for internal HTTP communication
- Update `CORS_ORIGIN` with actual Docusaurus domain

**Port:** 3002

### 3. Docusaurus Service

**Repository Setup:**
- Connect your GitHub repository to the `docusaurus` service
- Set the **Root Directory** to: `/`  
- Set the **Dockerfile Path** to: `Dockerfile.docusaurus`

**Environment Variables:**
```bash
NODE_ENV=production
REACT_APP_API_URL=https://chatbot-api-production-32f8.up.railway.app
```

**Port:** 3000

## Post-Deployment Configuration

### 1. Update CORS Configuration
After all services are deployed and you have the actual domains:

1. Go to your `chatbot-api` service settings
2. Update the `CORS_ORIGIN` environment variable with the actual docusaurus domain
3. Redeploy the chatbot-api service

### 2. Update API URL
After the chatbot-api service is deployed:

1. Go to your `docusaurus` service settings  
2. Update the `REACT_APP_API_URL` environment variable with the actual chatbot-api domain
3. Redeploy the docusaurus service

### 3. Initialize Vector Database
After all services are running, you need to populate the ChromaDB with your documentation:

1. Use Railway CLI to connect to your chatbot-api service
2. Run the indexing command:
   ```bash
   railway run --service chatbot-api npm run index-docs
   ```

## Service Dependencies

The services should be deployed in this order:
1. **ChromaDB** (first - no dependencies)
2. **Chatbot API** (second - depends on ChromaDB)  
3. **Docusaurus** (third - depends on Chatbot API)

## Monitoring

- Check Railway service logs for any deployment issues
- Test the chatbot functionality on your deployed docusaurus site
- Monitor ChromaDB connections in the chatbot-api logs

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure the `CORS_ORIGIN` in chatbot-api matches the exact docusaurus domain
2. **ChromaDB Connection**: Verify `CHROMA_HOST=chromadb.railway.internal` (use your actual service name)
3. **API Not Found**: Ensure `REACT_APP_API_URL` in docusaurus points to the correct chatbot-api domain
4. **Environment Variables**: Double-check all environment variables are set correctly in each service

### Railway CLI Commands:
```bash
# View service logs
railway logs --service chromadb
railway logs --service chatbot-api  
railway logs --service docusaurus

# Run commands in service context
railway run --service chatbot-api npm run index-docs
```

## Security Notes

- Never commit your actual `OPENAI_API_KEY` to the repository
- Use Railway's environment variable encryption for sensitive data
- Regularly rotate your OpenAI API key