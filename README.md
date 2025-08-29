# Healer

AI-powered mental health support platform with RAG-based therapeutic guidance.

## Features
- 🤖 RAG-based AI with Gemini 2.0 Flash & Pinecone
- 🎯 Real-time mood detection & sentiment analysis
- 🚨 Crisis detection & intervention protocols
- 📊 Progress tracking & analytics
- 🧘 Therapeutic exercises (CBT, mindfulness, breathing)

## Tech Stack
- **Backend**: Python, FastAPI, MongoDB, Redis
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **AI**: Gemini API, Pinecone, VADER sentiment analysis

## Quick Start

### Prerequisites
- Node.js 18+, Python 3.11+
- MongoDB, Redis (optional)

### Setup
```bash
# Clone & configure
git clone https://github.com/YashiSingh21/Healer.git
cd healer-platform
cp .env.example .env  # Add your API keys

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## API Endpoints
- Auth: `/api/v1/auth/*`
- Chat: `/api/v1/chat/*`
- Mood: `/api/v1/mood/*`
- Resources: `/api/v1/resources/*`

## ⚠️ Disclaimer
Educational support tool only. Not a replacement for professional mental health care.

## Crisis Resources
- **US**: 988 (Suicide & Crisis Lifeline)
- **Text**: HOME to 741741

## License
MIT