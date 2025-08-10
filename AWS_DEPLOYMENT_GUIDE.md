# AWS Deployment Guide for SmartWinnr AI Chatbot

This guide explains how to deploy the SmartWinnr AI Chatbot to AWS with secure secret management.

## 🔐 AWS Secrets Manager Setup

### 1. Create the Secret

Create a secret in AWS Secrets Manager to store your OpenAI API key securely:

#### Option A: Using AWS CLI
```bash
# Create the secret
aws secretsmanager create-secret \
  --name "smartwinnr/openai-api-key" \
  --description "OpenAI API key for SmartWinnr chatbot" \
  --secret-string '{"OPENAI_API_KEY":"your_actual_openai_api_key_here"}' \
  --region us-east-1

# Or create as plain text secret
aws secretsmanager create-secret \
  --name "smartwinnr/openai-api-key" \
  --description "OpenAI API key for SmartWinnr chatbot" \
  --secret-string "your_actual_openai_api_key_here" \
  --region us-east-1
```

#### Option B: Using AWS Console
1. Go to AWS Secrets Manager console
2. Click "Store a new secret"
3. Choose "Other type of secret"
4. Select "Plaintext" and enter your OpenAI API key
5. Name it: `smartwinnr/openai-api-key`
6. Add description: "OpenAI API key for SmartWinnr chatbot"
7. Click "Store"

### 2. IAM Permissions

Your EC2 instance or Lambda function needs these IAM permissions:

#### IAM Policy JSON:
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
      "Resource": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:smartwinnr/openai-api-key*"
    }
  ]
}
```

#### For EC2 Instance:
1. Create an IAM role with the above policy
2. Attach the role to your EC2 instance
3. No additional AWS credentials needed in your application

#### For Lambda Function:
1. Add the permissions to your Lambda execution role
2. No additional AWS credentials needed in your application

## 🚀 Deployment Options

### Option 1: AWS EC2 Deployment

#### 1. Launch EC2 Instance
```bash
# Launch Ubuntu instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxxx \
  --iam-instance-profile Name=smartwinnr-chatbot-role \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=smartwinnr-chatbot}]'
```

#### 2. Setup Environment
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python for ChromaDB
sudo apt-get install -y python3 python3-pip
pip3 install chromadb

# Clone and setup your project
git clone https://gitlab.com/your-repo/smartwinnr-docs.git
cd smartwinnr-docs
npm install
```

#### 3. Production Environment Variables
```bash
# Create production .env file
cat > .env << EOF
NODE_ENV=production
AWS_REGION=us-east-1
AWS_SECRET_NAME=smartwinnr/openai-api-key
CHROMA_HOST=localhost
CHROMA_PORT=8000
API_PORT=3002
CORS_ORIGIN=https://help.smartwinnr.com
COLLECTION_NAME=smartwinnr_docs
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
LOG_LEVEL=info
EOF
```

#### 4. Start Services
```bash
# Start ChromaDB in background
chroma run --host localhost --port 8000 &

# Index documentation
npm run index-docs

# Start production server with PM2
npm install -g pm2
pm2 start "npm run chatbot:start" --name smartwinnr-chatbot
pm2 startup
pm2 save
```

### Option 2: AWS Lambda + API Gateway (Serverless)

#### 1. Package for Lambda
```bash
# Install dependencies
npm install
npm run build

# Create deployment package
zip -r smartwinnr-chatbot.zip . -x "node_modules/chromadb/*" "docs/*" ".git/*"
```

#### 2. Lambda Configuration
- Runtime: Node.js 18.x
- Handler: `services/chatbot/lambda.handler`
- Memory: 1024 MB
- Timeout: 30 seconds
- Environment Variables: Same as EC2 but without ChromaDB settings

#### 3. API Gateway Setup
- Create REST API
- Create resources for chat endpoints
- Configure CORS for your domain

### Option 3: AWS ECS (Container)

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3002
CMD ["npm", "run", "chatbot:start"]
```

#### 2. Deploy to ECS
```bash
# Build and push to ECR
aws ecr create-repository --repository-name smartwinnr-chatbot
docker build -t smartwinnr-chatbot .
docker tag smartwinnr-chatbot:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/smartwinnr-chatbot:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/smartwinnr-chatbot:latest
```

## 🏗️ Infrastructure as Code (Optional)

### CloudFormation Template
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'SmartWinnr Chatbot Infrastructure'

Resources:
  OpenAISecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: smartwinnr/openai-api-key
      Description: OpenAI API key for SmartWinnr chatbot
      SecretString: !Sub |
        {
          "OPENAI_API_KEY": "${OpenAIApiKey}"
        }

  ChatbotRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: ec2.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: SecretsManagerAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - secretsmanager:GetSecretValue
                  - secretsmanager:DescribeSecret
                Resource: !Ref OpenAISecret

Parameters:
  OpenAIApiKey:
    Type: String
    NoEcho: true
    Description: OpenAI API key
```

## 🔧 Production Configuration

### Environment Variables for Production
```bash
# Required for production
NODE_ENV=production
AWS_REGION=us-east-1
AWS_SECRET_NAME=smartwinnr/openai-api-key

# Optional AWS configuration
AWS_SECRET_KEY=OPENAI_API_KEY  # Key name in JSON secret

# Application configuration
API_PORT=3002
CORS_ORIGIN=https://help.smartwinnr.com
COLLECTION_NAME=smartwinnr_docs
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
LOG_LEVEL=info

# ChromaDB configuration (if not using managed vector DB)
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

### SSL/HTTPS Configuration

For production, set up HTTPS:

#### Option A: Application Load Balancer (ALB)
1. Create ALB with SSL certificate
2. Route traffic to your EC2 instances
3. Update CORS_ORIGIN to use https://

#### Option B: CloudFront Distribution
1. Create CloudFront distribution
2. Point origin to your EC2/ECS
3. Use ACM certificate for SSL

## 📊 Monitoring and Logging

### CloudWatch Integration
```javascript
// Add to your server.ts
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';

// Configure logging to CloudWatch
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new WinstonCloudWatch({
      logGroupName: 'smartwinnr-chatbot',
      logStreamName: 'application-logs',
      awsRegion: process.env.AWS_REGION
    })
  ]
});
```

### Health Checks
```bash
# Create health check endpoint
curl https://your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production",
  "services": {
    "vectorService": "ready",
    "chatService": "ready",
    "configService": "ready"
  }
}
```

## 🔄 Secret Rotation

### Automatic Secret Rotation
```bash
# Update secret value
aws secretsmanager update-secret \
  --secret-id smartwinnr/openai-api-key \
  --secret-string "new_openai_api_key_here"

# Refresh secrets in application
curl -X POST https://your-domain.com/api/admin/refresh-secrets
```

### Manual Secret Rotation
1. Update secret in AWS Secrets Manager
2. Call the refresh endpoint or restart application
3. Monitor logs for successful update

## 🛡️ Security Best Practices

### 1. Network Security
- Use VPC with private subnets
- Security groups with minimal required ports
- NAT Gateway for outbound internet access

### 2. IAM Security
- Principle of least privilege
- Use IAM roles, not access keys
- Regular audit of permissions

### 3. Application Security
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration for your domain only
- Secure headers (HSTS, CSP, etc.)

### 4. Secret Management
- Never commit secrets to code
- Use AWS Secrets Manager for all secrets
- Enable secret rotation
- Monitor secret access

## 🚨 Troubleshooting

### Common Issues

#### Secret Access Denied
```bash
# Check IAM permissions
aws sts get-caller-identity

# Test secret access
aws secretsmanager get-secret-value --secret-id smartwinnr/openai-api-key
```

#### ChromaDB Connection Issues
```bash
# Check if ChromaDB is running
ps aux | grep chroma
netstat -tlnp | grep 8000

# Restart ChromaDB
pkill -f chroma
chroma run --host localhost --port 8000 &
```

#### High AWS Costs
1. Monitor OpenAI API usage
2. Implement response caching
3. Use cheaper models (gpt-4o-mini)
4. Set API usage limits

### Monitoring Commands
```bash
# Check application logs
pm2 logs smartwinnr-chatbot

# Monitor API health
watch -n 30 'curl -s https://your-domain.com/health | jq .'

# Check secret retrieval
node -e "import('./services/config/configService.js').then(c => c.configService.initialize())"
```

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs
2. Verify IAM permissions
3. Test secret access manually
4. Monitor API usage and costs
5. Check security group rules

For additional support, consult:
- AWS Secrets Manager documentation
- OpenAI API documentation  
- ChromaDB documentation