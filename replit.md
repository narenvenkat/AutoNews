# AutoNews - Automated News Content Generation System

## Overview

AutoNews is a comprehensive automated news content generation platform that transforms news articles into video content and publishes them to YouTube. The system fetches trending news articles, generates AI-powered summaries, converts text to speech, creates videos with visual elements, and automatically publishes the final content to social media platforms.

The application is built as a full-stack TypeScript solution with a React frontend for dashboard management and a Node.js/Express backend handling the automated content pipeline. The system is designed to operate autonomously through scheduled jobs while providing manual override capabilities through the web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud deployment
- **Job Scheduling**: Node-cron for automated task execution
- **Authentication**: Session-based authentication with JWT tokens

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following schema structure:
  - Jobs table for tracking content generation workflows
  - Articles table for storing fetched news content
  - Summaries table for AI-generated text summaries
  - Audio files table for TTS-generated voice content
  - Videos table for rendered video assets
  - Publications table for tracking published content
  - Users table for system administration
- **File Storage**: External services for media assets (audio, video, thumbnails)
- **Caching**: In-memory caching for API responses and frequently accessed data

### Microservices Architecture
The system employs a service-oriented architecture with specialized components:

1. **Content Pipeline Services**:
   - GNews service for article fetching with rate limiting and caching
   - NLP service for text summarization and text-to-speech conversion
   - Video service for rendering visual content with audio overlay
   - YouTube service for automated publishing and metadata management

2. **Job Management System**:
   - Scheduler service with cron-based automation
   - Status tracking with progress indicators
   - Error handling and retry mechanisms
   - Manual job creation and management

3. **Dashboard Interface**:
   - Real-time job monitoring with live updates
   - System health checks and metrics display
   - Manual content creation and publishing controls
   - Configuration management for automation parameters

### API Design Patterns
- RESTful API with standardized endpoints following `/api/resource` patterns
- Request/response logging with structured format
- Error handling middleware with consistent error responses
- Health check endpoints for monitoring system status
- Metrics endpoints for operational visibility

## External Dependencies

### News Data APIs
- **GNews API**: Primary news source for article fetching with configurable topics, languages, and regions
- Rate limiting and exponential backoff for API reliability

### AI/ML Services
- **Hugging Face API**: Text summarization using BART model
- **Custom TTS Service**: Text-to-speech conversion (configurable endpoint)
- **Video Rendering Service**: Custom service for video generation with audio overlay

### Publishing Platforms
- **YouTube Data API v3**: Automated video uploading with metadata, thumbnails, and privacy settings
- OAuth 2.0 authentication flow for secure access

### Infrastructure Services
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Railway/Render**: Application hosting platforms for backend services
- **Environment Configuration**: Secure secret management through environment variables

### Development Tools
- **Drizzle Kit**: Database schema migrations and management
- **Vite**: Development server and build tooling
- **ESBuild**: Production bundling for server-side code
- **TypeScript**: Type safety across frontend and backend

### Monitoring and Logging
- **Structured Logging**: Request tracing and error taxonomy
- **Health Checks**: Automated service monitoring
- **Metrics Collection**: Performance and operational metrics
- **Error Tracking**: Centralized error handling and reporting