#!/bin/bash

# SmartWinnr Help Documentation - Railway Deployment Script
# This script automates the deployment process to Railway

set -e

echo "🚀 Starting Railway deployment for SmartWinnr Help Documentation..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Check if project is linked
if ! railway status &> /dev/null; then
    echo "🔗 Please link to your Railway project..."
    echo "Options:"
    echo "1. Create new project: railway init"
    echo "2. Link existing project: railway link"
    read -p "Press Enter after linking your project..."
fi

echo "📦 Skipping typecheck for deployment..."
# npm run typecheck

echo "🗄️ Deploying ChromaDB service..."
# railway service create chromadb 2>/dev/null || echo "ChromaDB service already exists"

# Set ChromaDB environment variables
echo "⚙️ Configuring ChromaDB environment..."
railway variables --set "CHROMA_HOST=0.0.0.0" --service chromadb
railway variables --set "CHROMA_PORT=8000" --service chromadb
railway variables --set "PERSIST_DIRECTORY=/chroma/data" --service chromadb
railway variables --set "ANONYMIZED_TELEMETRY=False" --service chromadb

# Create persistent volume for ChromaDB
echo "💾 Setting up persistent storage..."
railway volume create --name chromadb-data --mount-path /chroma/data --service chromadb 2>/dev/null || echo "Volume already exists"

# Deploy ChromaDB
echo "🚢 Deploying ChromaDB..."
railway up --service chromadb

echo "🤖 Deploying Chatbot API service..."
# railway service create chatbot-api 2>/dev/null || echo "Chatbot API service already exists"

# Set Chatbot API environment variables
echo "⚙️ Configuring Chatbot API environment..."
railway variables --set "NODE_ENV=production" --service chatbot-api
railway variables --set "API_PORT=3002" --service chatbot-api
railway variables --set "CHROMA_HOST=chromadb.railway.internal" --service chatbot-api
railway variables --set "CHROMA_PORT=8000" --service chatbot-api
railway variables --set "COLLECTION_NAME=smartwinnr_docs" --service chatbot-api
railway variables --set "EMBEDDING_MODEL=text-embedding-3-small" --service chatbot-api
railway variables --set "CHAT_MODEL=gpt-4o-mini" --service chatbot-api
railway variables --set "LOG_LEVEL=info" --service chatbot-api

# OpenAI API key from Railway environment variables
echo "⚠️  Make sure to set OPENAI_API_KEY in Railway variables for chatbot-api service"

# Deploy Chatbot API
echo "🚢 Deploying Chatbot API..."
railway up --service chatbot-api

echo "⏳ Waiting for services to start..."
sleep 30

# Get service URLs
CHATBOT_URL=$(railway domain --service chatbot-api 2>/dev/null || echo "No domain assigned")
CHROMADB_URL=$(railway domain --service chromadb 2>/dev/null || echo "Internal service")

echo "✅ Deployment completed!"
echo ""
echo "📋 Service Information:"
echo "🤖 Chatbot API: $CHATBOT_URL"
echo "🗄️ ChromaDB: $CHROMADB_URL"
echo ""
echo "🔧 Next Steps:"
echo "1. Set up your OpenAI API key:"
echo "   railway variables set OPENAI_API_KEY=sk-your-key --service chatbot-api"
echo ""
echo "2. Index your documentation:"
echo "   curl -X POST $CHATBOT_URL/api/vector/index"
echo ""
echo "3. Test the health endpoint:"
echo "   curl $CHATBOT_URL/health"
echo ""
echo "4. Deploy frontend to Vercel:"
echo "   npm run build && npx vercel --prod"
echo ""
echo "🎉 Your SmartWinnr Help Documentation is ready for production!"