# AuraOne Architecture Documentation

## Overview

AuraOne is a full-stack personal assistant application built with React, TypeScript, and Supabase. It provides AI-powered task, note, and event management with a fallback chain for resilient AI communication.

---

## Service Overview

### Core Services

| Service | File | Description |
|---------|------|-------------|
| **AI Service** | `src/services/aiService.ts` | Primary AI orchestration using Gemini API with OpenRouter fallback |
| **Chat Handler** | `src/services/chatHandler.ts` | Message processing, command parsing, and error handling |
| **Chat Session** | `src/services/chatSessionService.ts` | Session management and context retention |
| **Supabase** | `src/services/supabase.ts` | Database operations and authentication |

### AI Fallback Chain

The AI service implements a multi-tier fallback strategy:

1. **Primary**: Gemini 2.5 Flash - Fast command processing
2. **Fallback**: OpenRouter - Deep reasoning mode (brain mode)
3. **Retry Logic**: 3 attempts with exponential backoff (2000ms * attempt)

```
User Prompt → AI Service
    ├─→ Brain Mode → OpenRouter → Plain Response
    └─→ Normal Mode → Gemini → Parse/Validate → Execute CRUD → Response
                           ↓ (failure)
                      OpenRouter Fallback → Parse/Validate → Execute CRUD → Response
```

### Command Processing

The AI parses user input into structured commands:

- **create**: Add new task, note, or event
- **read**: Retrieve existing items
- **update**: Modify existing items
- **delete**: Remove items
- **chat**: General conversation (non-CRUD)

---

## State Management

### Global State (React Context)
- **Auth Context**: User authentication state, session management
- **Theme Context**: Light/dark mode preferences

### Local Component State
- UI-specific state (modals, forms, loading states)
- Widget-specific state (weather data, news feeds)

### Data Hooks
- `useTasks`: Task CRUD operations
- `useNotes`: Note CRUD operations
- `useEvents`: Event CRUD operations
- `useAuth`: Authentication state management

---

## Third-Party Integrations

| Service | Purpose | API |
|---------|---------|-----|
| **Gemini AI** | Primary AI processing | Google Generative Language API |
| **OpenRouter** | Fallback / Brain mode | OpenRouter.ai |
| **OpenWeatherMap** | Weather widget | OpenWeather API |
| **NewsData.io** | News widget | NewsData API |
| **Supabase** | Database & Auth | Supabase |

---

## Caching Strategy

### Session Context Caching
- **Chat History (In-Memory)**: The `chatSessionService.ts` maintains session context in memory during active user sessions. This caches recent conversation history for context-aware AI responses.
- **Context Retention**: Session data persists across message exchanges within a single browser session but is not persisted to localStorage or database.
- **Memory Management**: Old messages are retained to provide context window to the AI while avoiding unbounded memory growth.

### Existing Caching Mechanisms
- **React Context**: Auth and Theme contexts are cached in React's context API for fast re-renders
- **API Response Caching**: Widget data (weather, news) can be cached locally to reduce API calls

### Future Caching Plans
- **localStorage**: Persist chat history for session restoration
- **Redis (Backend)**: Server-side caching for frequently accessed data (future Supabase Edge Functions)
- **TTLCache**: Implement time-to-live caching for API responses to reduce redundant calls

---

## Deployment

- **Frontend**: Vercel (React + Vite)
- **Backend**: Supabase (managed database + auth)
- **Configuration**: Environment variables via `.env`

### Required Environment Variables

```
VITE_GEMINI_API_KEY      # Required - Primary AI
VITE_OPENROUTER_API_KEY # Optional - Fallback AI
VITE_WEATHER_API_KEY     # Optional - Weather widget
VITE_NEWS_API_KEY        # Optional - News widget
```

---

## File Structure

```
src/
├── components/          # Reusable UI components
│   ├── structure/       # Layout, Sidebar, Logo
│   ├── widgets/         # Weather, News, Tasks, Calendar
│   ├── notes/           # Note-specific components
│   ├── tasks/           # Task-specific components
│   └── ui/              # Generic UI (Card, Loader)
├── config/
│   └── api.ts           # API configuration & validation
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication
│   ├── useTasks.ts      # Task management
│   ├── useNotes.ts      # Note management
│   └── useEvents.ts     # Event management
├── pages/               # Route components
├── services/            # Core business logic
│   ├── aiService.ts     # AI processing
│   ├── chatHandler.ts  # Message handling
│   ├── chatSessionService.ts  # Session management
│   └── supabase.ts     # Database client
└── utils/
    └── aiCommandSchema.ts  # Zod validation schema
```

---

## Architecture Diagram

See `architecture/ai-fallback-chain.mmd` for the visual fallback chain diagram.