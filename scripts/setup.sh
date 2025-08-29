#!/bin/bash

# Healer Platform Setup Script
echo "🧠 Setting up Healer Platform..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual API keys before continuing!${NC}"
    echo -e "${BLUE}Required keys:${NC}"
    echo "  - GEMINI_API_KEY (Get from Google AI Studio)"
    echo "  - PINECONE_API_KEY (Get from Pinecone console)"
    echo "  - MONGODB_URL (MongoDB Atlas connection string)"
    echo ""
    read -p "Press Enter after updating .env file..." -r
fi

# Validate environment variables
echo -e "${BLUE}Validating environment configuration...${NC}"
source .env

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY is not set or uses default value${NC}"
    exit 1
fi

if [ -z "$PINECONE_API_KEY" ] || [ "$PINECONE_API_KEY" = "your_pinecone_api_key_here" ]; then
    echo -e "${RED}❌ PINECONE_API_KEY is not set or uses default value${NC}"
    exit 1
fi

if [ -z "$MONGODB_URL" ] || [[ "$MONGODB_URL" == *"username:password"* ]]; then
    echo -e "${RED}❌ MONGODB_URL is not properly configured${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration validated${NC}"

# Create necessary directories
echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p logs
mkdir -p docker/nginx/ssl
mkdir -p docker/prometheus
mkdir -p data/mongodb
mkdir -p data/redis

# Generate JWT secret if not set
if [ -z "$JWT_SECRET_KEY" ] || [ "$JWT_SECRET_KEY" = "your-super-secure-jwt-secret-key-change-in-production" ]; then
    echo -e "${YELLOW}Generating JWT secret key...${NC}"
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i.bak "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET/" .env
fi

# Generate encryption key if not set
if [ -z "$ENCRYPTION_KEY" ] || [ "$ENCRYPTION_KEY" = "your-encryption-key-for-sensitive-data-change-in-production" ]; then
    echo -e "${YELLOW}Generating encryption key...${NC}"
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    sed -i.bak "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
fi

# Start the services
echo -e "${BLUE}Starting Healer Platform services...${NC}"
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo -e "${BLUE}Checking service health...${NC}"

# Check backend
if curl -f -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend service is healthy${NC}"
else
    echo -e "${RED}❌ Backend service is not responding${NC}"
fi

# Check frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend service is healthy${NC}"
else
    echo -e "${RED}❌ Frontend service is not responding${NC}"
fi

# Display access information
echo ""
echo -e "${GREEN}🎉 Healer Platform is ready!${NC}"
echo ""
echo -e "${BLUE}Access your application:${NC}"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:8000"
echo "  • API Documentation: http://localhost:8000/docs"
echo "  • Health Check: http://localhost:8000/health"
echo ""
echo -e "${BLUE}View logs:${NC}"
echo "  docker-compose -f docker/docker-compose.yml logs -f"
echo ""
echo -e "${BLUE}Stop services:${NC}"
echo "  docker-compose -f docker/docker-compose.yml down"
echo ""
echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
echo "  • This platform is for educational/support purposes only"
echo "  • Not a replacement for professional mental health care"
echo "  • Crisis resources: Call 988 or text HOME to 741741"
echo ""
echo -e "${GREEN}Happy healing! 💚${NC}"