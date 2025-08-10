# SmartWinnr Help Documentation

A Docusaurus-based documentation site with integrated AI chatbot functionality for SmartWinnr help content.

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

This will start:
- Docusaurus documentation site on `http://localhost:3001`
- Chatbot API server on `http://localhost:3002`

### Individual Components

**Documentation site only:**
```bash
npm start
```

**Chatbot server only:**
```bash
npm run chatbot:dev
```

### Production

**Build for production:**
```bash
npm run build
```

**Serve production build:**
```bash
npm run serve
```

## Additional Commands

- **Index documentation for chatbot:** `npm run index-docs`
- **Type checking:** `npm run typecheck`
- **Clear Docusaurus cache:** `npm run clear`

## Project Structure

- `/docs/` - Documentation content
- `/src/` - Docusaurus theme and components
- `/services/chatbot/` - AI chatbot backend service
- `/static/` - Static assets

## Environment Configuration

The project supports both development and production environments:

- **Development:** Uses local OpenAI API key from `.env` file
- **Production:** Fetches API key from AWS Secrets Manager

See `.env.example` for detailed configuration options.