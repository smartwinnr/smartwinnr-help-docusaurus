# Railway SSH Access Commands

## Service Access Commands

### Docusaurus Service
```bash
railway ssh --project=c444ae51-eed3-4b16-b14d-7ebf13e3f317 --environment=be1f5b5e-79db-44f4-ac3a-fbc3523d7efa --service=17ed88cc-8660-4c9a-acec-a68a038a1ae7
```

### Chatbot-API Service
```bash
railway ssh --project=c444ae51-eed3-4b16-b14d-7ebf13e3f317 --environment=be1f5b5e-79db-44f4-ac3a-fbc3523d7efa --service=25d8ac64-8cc5-422e-9c85-f93ffd3fca76
```

### ChromaDB Service
```bash
railway ssh --project=c444ae51-eed3-4b16-b14d-7ebf13e3f317 --environment=be1f5b5e-79db-44f4-ac3a-fbc3523d7efa --service=88657d7c-a058-41e5-ba9d-a40d73aeeaec
```

## Project Information
- **Project ID**: `c444ae51-eed3-4b16-b14d-7ebf13e3f317`
- **Environment ID**: `be1f5b5e-79db-44f4-ac3a-fbc3523d7efa`

## Service IDs
- **Docusaurus**: `17ed88cc-8660-4c9a-acec-a68a038a1ae7`
- **Chatbot-API**: `25d8ac64-8cc5-422e-9c85-f93ffd3fca76`  
- **ChromaDB**: `88657d7c-a058-41e5-ba9d-a40d73aeeaec`

## Usage Notes
- Use these commands for debugging internal networking
- Test connectivity between services
- Access service logs and environment variables
- Troubleshoot Railway internal networking issues

## Internal Networking Tests
Use SSH access to test internal service connectivity:

### From Docusaurus to Chatbot-API
```bash
# SSH into Docusaurus service, then test:
curl http://chatbot-api.railway.internal/api/vector/embed
```

### From Chatbot-API to ChromaDB
```bash  
# SSH into Chatbot-API service, then test:
curl http://chroma.railway.internal:8000/api/v1/collections
```

### Network Discovery
```bash
# Check available internal hostnames
nslookup chatbot-api.railway.internal
nslookup chroma.railway.internal
```