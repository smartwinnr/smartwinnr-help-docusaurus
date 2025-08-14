# Port Configuration

## Default Port Assignment

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Documentation Server** | 3000 | http://localhost:3000 | Docusaurus documentation site |
| **Chatbot API Server** | 3002 | http://localhost:3002 | AI chatbot backend service |
| **ChromaDB** | 8000 | http://localhost:8000 | Vector database (if running locally) |

## Environment Variables

### Development (.env)

```bash
# Server Configuration
API_PORT=3002
CORS_ORIGIN=http://localhost:3000

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

### Production

```bash
API_PORT=3002
CORS_ORIGIN=https://help.smartwinnr.com
```

## npm Scripts

### Development Commands

```bash
# Start both services (recommended)
npm run dev

# Start with colored output and service names
npm run dev:full

# Start services individually
npm run start:docs    # Documentation only on port 3000
npm run chatbot:dev   # Chatbot only on port 3002
```

### Production Commands

```bash
# Build and serve documentation
npm run build
npm run serve:docs    # Serves on port 3000

# Start production chatbot
npm run chatbot:start # Starts on port 3002
```

## Port Conflicts

If you encounter port conflicts:

### Documentation Server (Port 3000)

```bash
# Use a different port
docusaurus start --port 3001
```

### Chatbot Server (Port 3002)

```bash
# Change API_PORT in .env file
API_PORT=3003

# Or set environment variable
API_PORT=3003 npm run chatbot:dev
```

### Update Frontend Configuration

If you change the chatbot port, update the frontend configuration in:

- `src/components/ChatBot/ChatBot.tsx` (API_BASE_URL)
- Update CORS_ORIGIN in .env to match documentation port

## Health Checks

```bash
# Documentation server
curl http://localhost:3000

# Chatbot API server
curl http://localhost:3002/health

# Test chat endpoint
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```
