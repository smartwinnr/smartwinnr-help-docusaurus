# SmartWinnr AI Chatbot Setup

## 🤖 Overview

The SmartWinnr AI Chatbot is an intelligent assistant that helps users find information from the documentation using vector search and OpenAI's language models.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- OpenAI API Key
- ChromaDB (will be installed automatically)

### 2. Environment Setup

1. Copy the `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. **Add your OpenAI API key** to `.env`:

   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 4. Start ChromaDB

First, install and start ChromaDB in a separate terminal:

```bash
# Install ChromaDB (one-time setup)
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

### 5. Index Documentation

Before using the chatbot, index your documentation:

```bash
npm run index-docs
```

This will:

- Create embeddings for all documentation files
- Store them in ChromaDB for fast retrieval
- Show indexing progress and statistics

### 6. Start Development Servers

Option A - Run both servers together:

```bash
npm run dev
```

Option B - Run separately:

```bash
# Terminal 1: Docusaurus docs site
npm start

# Terminal 2: Chatbot API server  
npm run chatbot:dev
```

## 🎯 Usage

1. **Access the docs**: http://localhost:3001
2. **Chatbot API**: http://localhost:3002
3. **Health check**: http://localhost:3002/health

The chatbot will appear as a floating widget in the bottom-right corner of the documentation site.

## 🔧 API Endpoints

### Chatbot

- `POST /api/chat` - Send a message to the chatbot
- `GET /api/chat/:id` - Get conversation history
- `DELETE /api/chat/:id` - Clear conversation

### Vector Database

- `GET /api/vector/info` - Collection information
- `POST /api/vector/search` - Search documents directly
- `POST /api/vector/index` - Re-index documentation
- `DELETE /api/vector/clear` - Clear vector database

## 🛠 Configuration

### Environment Variables

#### Local Development

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `OPENAI_API_KEY` | OpenAI API key (local only) | Required |
| `CHROMA_HOST` | ChromaDB host | localhost |
| `CHROMA_PORT` | ChromaDB port | 8000 |
| `API_PORT` | Chatbot API port | 3002 |
| `CHAT_MODEL` | OpenAI chat model | gpt-4o-mini |
| `EMBEDDING_MODEL` | OpenAI embedding model | text-embedding-3-small |

#### Production (AWS)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | production |
| `AWS_REGION` | AWS region | us-east-1 |
| `AWS_SECRET_NAME` | Secrets Manager secret name | smartwinnr/openai-api-key |
| `AWS_SECRET_KEY` | Key name in JSON secret | OPENAI_API_KEY |
| `CORS_ORIGIN` | Allowed CORS origin | https://help.smartwinnr.com |

### Customizing Models

To use different models, update `.env`:

```env
# Use GPT-4 for better quality (more expensive)
CHAT_MODEL=gpt-4

# Use larger embedding model for better search
EMBEDDING_MODEL=text-embedding-3-large
```

## 🧠 How It Works

1. **Document Indexing**: Markdown files are split into chunks and converted to embeddings
2. **Vector Search**: User questions are converted to embeddings and matched with similar content
3. **AI Response**: OpenAI generates responses using relevant documentation as context
4. **Citations**: Responses include citations linking back to source documentation

## 📚 Features

### Current Features

✅ Vector-based semantic search  
✅ OpenAI integration with GPT-4o-mini  
✅ Real-time chat interface  
✅ Citation system with source links  
✅ Conversation memory  
✅ Responsive design  
✅ Dark theme support  

### Coming Soon (when authentication is added)

🔄 Role-based content filtering  
🔄 User-specific chat history  
🔄 Admin analytics dashboard  

## 🐛 Troubleshooting

### ChromaDB Issues

```bash
# If ChromaDB connection fails
ps aux | grep chroma  # Check if running
chroma run --host localhost --port 8000  # Restart
```

### OpenAI API Issues

- Check your API key is valid and has credits
- Verify the model names in `.env` are correct
- Check rate limits if getting 429 errors

### Embedding Issues

```bash
# Re-index documentation if search isn't working
npm run index-docs
```

### Port Conflicts

If ports are in use, update `.env`:

```env
API_PORT=3003  # Change chatbot API port
```

## 📊 Monitoring

Check the health endpoint for service status:

```bash
curl http://localhost:3002/health
```

View collection information:

```bash
curl http://localhost:3002/api/vector/info
```

## 🚀 Production Deployment

### AWS Secrets Manager Setup

1. **Create AWS Secret**:

   ```bash
   aws secretsmanager create-secret \
     --name "smartwinnr/openai-api-key" \
     --secret-string "your_openai_api_key_here" \
     --region us-east-1
   ```

2. **IAM Permissions**: Your EC2/Lambda needs:

   ```json
   {
     "Effect": "Allow",
     "Action": [
       "secretsmanager:GetSecretValue",
       "secretsmanager:DescribeSecret"
     ],
     "Resource": "arn:aws:secretsmanager:*:*:secret:smartwinnr/openai-api-key*"
   }
   ```

3. **Production Environment**:

   ```env
   NODE_ENV=production
   AWS_REGION=us-east-1
   AWS_SECRET_NAME=smartwinnr/openai-api-key
   CORS_ORIGIN=https://help.smartwinnr.com
   ```

4. **Additional Setup**:
   - ChromaDB in persistent mode or managed vector DB
   - Rate limiting for API endpoints
   - SSL/HTTPS with certificates
   - Monitoring and logging (CloudWatch)

📖 **Detailed deployment guide**: See `AWS_DEPLOYMENT_GUIDE.md`

## 🔐 Security Notes

- Never commit `.env` file with real API keys
- Use environment variables in production
- Implement authentication before production deployment
- Consider API rate limiting for production use

## 📈 Cost Optimization

- Use `gpt-4o-mini` for lower costs
- Use `text-embedding-3-small` for embeddings
- Implement response caching for common questions
- Monitor token usage in OpenAI dashboard

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure ChromaDB is running
4. Check the console for error messages
