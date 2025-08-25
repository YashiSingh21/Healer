# 🧠 Healer Platform - RAG-Based Mental Health Support System

> **⚠️ Important Disclaimer**: This platform is designed for educational and supportive purposes only. It is not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately.

## 🌟 Overview

Healer Platform is a comprehensive RAG-based (Retrieval-Augmented Generation) mental health support system that combines cutting-edge AI technology with therapeutic best practices. The platform provides empathetic, evidence-based guidance through real-time mood detection, personalized responses, and crisis intervention protocols.

## ✨ Key Features

### 🤖 AI-Powered Mental Health Support
- **RAG Implementation**: Advanced retrieval system using Pinecone vector database and Gemini 2.0 Flash
- **Personalized Responses**: Context-aware therapeutic guidance based on user history and current state
- **Evidence-Based**: Responses grounded in established mental health practices and research

### 🎯 Real-Time Mood Detection
- **Sentiment Analysis**: Advanced NLP processing using VADER sentiment analysis and custom mood detection
- **Emotional State Tracking**: Multi-dimensional emotion recognition (anxiety, depression, anger, joy, etc.)
- **Progress Monitoring**: Visual mood tracking and trend analysis over time

### 🚨 Crisis Detection & Intervention
- **Automatic Detection**: AI-powered identification of crisis language and risk indicators
- **Immediate Response**: Instant access to crisis resources and emergency contacts
- **De-escalation**: Therapeutic communication techniques for crisis situations
- **Safety Resources**: Integration with national crisis hotlines and emergency services

### 🎨 Therapeutic UI Design
- **Calming Interface**: Therapeutic color schemes and gentle animations
- **Accessibility**: WCAG compliant design with screen reader support
- **Responsive**: Mobile-first design optimized for all devices
- **Dark Mode**: Eye-friendly options for different preferences

### 📊 Progress & Analytics
- **Mood Visualization**: Interactive charts showing emotional trends
- **Session Tracking**: Comprehensive conversation history and analytics
- **Goal Setting**: Personalized therapeutic goals and milestone tracking
- **Insight Generation**: AI-powered insights about mental health patterns

### 🧘 Therapeutic Exercises
- **Breathing Exercises**: Guided 4-7-8 breathing technique with visual cues
- **Mindfulness**: Interactive meditation and grounding exercises
- **CBT Techniques**: Cognitive behavioral therapy exercises and worksheets
- **Coping Strategies**: Personalized recommendations based on user needs

## 🏗️ Architecture

### Backend (Python + FastAPI)
```
backend/
├── app/
│   ├── api/v1/endpoints/       # API route handlers
│   ├── core/                   # Core configuration and utilities
│   ├── models/                 # Pydantic data models
│   ├── mental_health/          # Mental health specific modules
│   ├── rag/                    # RAG implementation
│   ├── utils/                  # Utility functions
│   └── main.py                 # FastAPI application entry point
├── requirements.txt            # Python dependencies
└── scripts/                    # Setup and utility scripts
```

### Frontend (Next.js + TypeScript)
```
frontend/
├── app/                        # Next.js 14 app directory
│   ├── auth/                   # Authentication pages
│   ├── chat/                   # Chat interface
│   ├── dashboard/              # User dashboard
│   ├── mood/                   # Mood tracking
│   └── exercises/              # Therapeutic exercises
├── components/                 # Reusable React components
├── contexts/                   # React contexts
└── package.json                # Node.js dependencies
```

### Database & Infrastructure
- **MongoDB**: Primary database for user data and conversations
- **Pinecone**: Vector database for RAG knowledge retrieval
- **Redis**: Caching and session management
- **FastAPI**: High-performance Python web framework
- **Next.js 14**: Modern React framework with App Router

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**: Required for frontend development
- **Python 3.11+**: Required for backend development
- **MongoDB**: Database server (local or Atlas)
- **Redis**: Caching server (optional but recommended)

### Environment Setup
1. Clone the repository:
```bash
git clone https://github.com/your-repo/healer-platform.git
cd healer-platform
```

2. Copy the environment file and configure your API keys:
```bash
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

3. Required API Keys:
   - **Gemini API Key**: Get from Google AI Studio
   - **Pinecone API Key**: Get from Pinecone console
   - **MongoDB URL**: MongoDB Atlas connection string

### Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Download required NLP models
python -m spacy download en_core_web_sm

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Core Configuration
```env
# AI Model Configuration
GEMINI_API_KEY=your_gemini_api_key_here
MODEL=gemini-2.0-flash-exp

# Database Configuration
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=healer_platform

# Vector Database Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=mental-health-rag
PINECONE_DIMENSION=384

# Security
JWT_SECRET_KEY=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Advanced Configuration
- **Rate Limiting**: Configure request limits per user
- **Crisis Keywords**: Customize crisis detection patterns
- **Therapeutic Categories**: Define custom therapy focus areas
- **Session Timeout**: Configure user session duration

## 🔐 Security & Privacy

### Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse and spam
- **Input Sanitization**: Prevention of injection attacks

### Privacy Features
- **Data Anonymization**: Personal identifiers masked in logs
- **Session Management**: Automatic session expiration
- **Crisis Privacy**: Special handling for crisis intervention data
- **GDPR Compliance**: User data rights and deletion capabilities

### Security Best Practices
- **Secure Headers**: Implementation of security headers
- **CORS Configuration**: Proper cross-origin request handling
- **Environment Variables**: Sensitive data in environment variables
- **Container Security**: Non-root user containers and minimal images

## 🩺 Mental Health Features

### Crisis Intervention Protocol
1. **Detection**: Real-time analysis of user messages for crisis indicators
2. **Classification**: Risk level assessment (low, medium, high, critical)
3. **Response**: Immediate therapeutic response with de-escalation techniques
4. **Resources**: Instant access to crisis hotlines and emergency contacts
5. **Follow-up**: Continued monitoring and support recommendations

### Therapeutic Approaches
- **Cognitive Behavioral Therapy (CBT)**: Thought challenging and behavioral activation
- **Mindfulness-Based Interventions**: Present-moment awareness techniques
- **Dialectical Behavior Therapy (DBT)**: Emotion regulation skills
- **Solution-Focused Therapy**: Goal-oriented problem-solving
- **Trauma-Informed Care**: Sensitive approaches for trauma survivors

### Evidence-Based Resources
- Curated mental health information from reputable sources
- Peer-reviewed research integration
- Clinical best practices implementation
- Therapeutic exercise library with proven effectiveness

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/login          # User login
POST /api/v1/auth/refresh        # Token refresh
POST /api/v1/auth/logout         # User logout
```

### Chat Endpoints
```
POST /api/v1/chat/message        # Send message and get AI response
GET  /api/v1/chat/suggested-prompts  # Get conversation starters
WS   /api/v1/chat/ws/{user_id}   # WebSocket for real-time chat
```

### User Management
```
GET  /api/v1/users/me            # Get current user profile
PUT  /api/v1/users/me            # Update user profile
POST /api/v1/users/concerns      # Update mental health concerns
POST /api/v1/users/goals         # Update therapy goals
```

### Mood & Analytics
```
POST /api/v1/mood/log            # Log current mood
GET  /api/v1/mood/history        # Get mood history
GET  /api/v1/mood/analysis       # Get mood trends analysis
POST /api/v1/mood/check-in       # Daily mental health check-in
```

### Resources & Exercises
```
GET  /api/v1/exercises/          # Get therapeutic exercises
GET  /api/v1/exercises/generate  # Generate personalized exercise
GET  /api/v1/exercises/recommended  # Get AI recommendations
GET  /api/v1/resources/          # Get mental health resources
GET  /api/v1/resources/crisis    # Get crisis intervention resources
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:e2e
```

### Integration Testing
```bash
# Start backend and frontend services
cd backend && uvicorn app.main:app --port 8000 &
cd frontend && npm run dev &

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Deployment

#### Backend Deployment
```bash
# Install production dependencies
pip install -r backend/requirements.txt

# Set production environment variables
export MONGODB_URL="your_mongodb_url"
export GEMINI_API_KEY="your_gemini_api_key"
export PINECONE_API_KEY="your_pinecone_api_key"

# Run with production ASGI server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend Deployment
```bash
cd frontend
npm install
npm run build
npm start
```

#### Infrastructure Setup
1. **Environment Setup**: Configure production environment variables
2. **SSL Certificates**: Set up HTTPS with valid certificates
3. **Database Setup**: Initialize MongoDB and create indexes
4. **Process Management**: Use PM2 or similar for process management
5. **Monitoring**: Set up logging and monitoring systems

### Health Checks
- **Backend Health**: `GET /health` - API service status
- **Database Health**: MongoDB and Redis connectivity
- **AI Service Health**: Gemini API availability
- **Vector DB Health**: Pinecone service status

### Monitoring & Logging
- **Application Logs**: Structured logging with contextual information
- **Error Tracking**: Comprehensive error monitoring and alerting
- **Performance Metrics**: Response times and resource utilization
- **Security Monitoring**: Authentication and access patterns

## 🤝 Contributing

We welcome contributions to improve the mental health support capabilities of this platform. Please read our contributing guidelines and code of conduct.

### Development Guidelines
- Follow mental health best practices and ethical AI principles
- Ensure user privacy and data protection in all changes
- Include comprehensive tests for new features
- Document mental health impacts of changes

## 📋 TODO & Roadmap

### Upcoming Features
- [ ] **Multi-language Support**: Internationalization for global accessibility
- [ ] **Voice Interface**: Speech-to-text and text-to-speech capabilities
- [ ] **Group Support**: Peer support group features
- [ ] **Professional Integration**: Therapist dashboard and referral system
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Wearable Integration**: Heart rate and stress monitoring
- [ ] **Advanced Analytics**: Predictive mental health insights
- [ ] **Telehealth Integration**: Video calling for professional sessions

### Technical Improvements
- [ ] **Performance Optimization**: Advanced caching and CDN integration
- [ ] **Containerization**: Docker deployment for easier scaling
- [ ] **Cloud Deployment**: AWS/GCP/Azure deployment automation
- [ ] **Security Enhancements**: Advanced threat detection
- [ ] **AI Improvements**: Fine-tuned models for mental health
- [ ] **Offline Support**: Progressive web app capabilities

## 📞 Crisis Resources

### United States
- **Suicide & Crisis Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **NAMI Helpline**: 1-800-950-NAMI (6264)
- **SAMHSA National Helpline**: 1-800-662-HELP (4357)

### International
- **International Association for Suicide Prevention**: [https://www.iasp.info/resources/Crisis_Centres/](https://www.iasp.info/resources/Crisis_Centres/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Mental health professionals who provided guidance on therapeutic approaches
- AI/ML researchers advancing the field of computational psychology
- Open source community for foundational technologies
- Mental health advocacy organizations for their resources and insights

---

**Remember**: If you or someone you know is in immediate danger, please contact emergency services (911 in the US) or go to the nearest emergency room. This platform is a support tool and cannot replace professional mental health care.

## 📧 Contact & Support

For questions, support, or collaboration opportunities:
- **Technical Issues**: [GitHub Issues](https://github.com/your-repo/healer-platform/issues)
- **Mental Health Guidance**: Consult with licensed mental health professionals
- **Contributions**: See our [Contributing Guide](CONTRIBUTING.md)
- **Security Issues**: Report to security@healer-platform.com

Built with ❤️ for mental health awareness and support.# Healer
