# AuraOne

![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-06B6D4?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)
[![Coverage](https://img.shields.io/badge/coverage-29%25-yellow)](#)

**Sick of app overload?** AuraOne puts your tasks, notes, events, and news in one smart, AI-powered hub. **One app, zero chaos—just pure focus.**

An intelligent personal assistant designed for comprehensive task management, note-taking, event scheduling, and news aggregation.

## ✨ Features

### Core Features
- **User Authentication** - Secure Supabase authentication with email/password
- **Aura Assistant** - AI-powered functional chat-based assistant with Brain Mode
- **Note Management** - Rich text editor with tags and organization
- **Task Management** - Priority-based task tracking with due dates
- **Event Scheduling** - Interactive calendar with event management
- **News Aggregation** - Real-time news from multiple sources
- **Weather Integration** - Current weather and 5-day forecasts
- **Dark/Light Theme** - Seamless theme switching with system preference detection

### User Experience
- Responsive design optimized for desktop, tablet, and mobile
- Real-time updates with Supabase live synchronization
- Smooth animations powered by Framer Motion
- WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for authentication and database)
- API keys for Gemini, OpenRouter, OpenWeatherMap, NewsData.io

### Installation

```bash
# Clone the repository
git clone https://github.com/dhyan2815/AuraOne.git
cd AuraOne

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_OPENWEATHERMAP_API_KEY=your_weather_api_key
VITE_NEWSDATA_API_KEY=your_news_api_key
```

## 🏗️ Architecture

### System Diagrams

**Activity Diagram** - User workflow and decision points:
![Activity Diagram](architecture/activity_diagram.png)

**Data Flow Diagram** - System data movement:
![DFD Diagram](architecture/dfd_diagram.png)

**Entity Relationship Diagram** - Database schema:
![ER Diagram](architecture/er_diagram.png)

**Sequence Diagram** - API interaction flow:
![Sequence Diagram](architecture/sequence_diagram.png)

### Tech Stack
- **Frontend**: React 18.3.1, TypeScript 5.5.3, Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1, Framer Motion 11.0.8
- **Backend**: Supabase (Authentication, PostgreSQL, Realtime)
- **AI**: Google Gemini API (Primary), Open Router (Fallback)
- **APIs**: OpenWeatherMap, NewsData.io
- **UI Components**: Radix UI, Lucide React Icons

### AI Service Architecture
AuraOne features a robust, multi-model AI infrastructure that ensures high availability and intelligent workspace management:

- **Primary Model**: Google Gemini for ultra-fast response generation
- **Fallback Model**: Open Router providing seamless continuity if Gemini limits are reached
- **Brain Mode**: Deep reasoning capabilities for complex strategic planning
- **Command Mode**: Natural language to JSON command parsing for CRUD operations
- **Automatic Fallback**: Intelligent try/catch logic that transparently routes requests

### Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── structure/           # Layout components (Sidebar, Layout)
│   ├── ui/                  # Base UI components (Card, Loader)
│   ├── widgets/             # Dashboard widgets
│   ├── tasks/              # Task-specific components
│   ├── notes/              # Note-specific components
│   └── editor/              # TipTap rich text editor
├── pages/                   # Route components
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useTasks.ts         # Task CRUD operations
│   ├── useNotes.ts         # Note CRUD operations
│   └── useEvents.ts        # Event CRUD operations
├── services/                # External service integrations
│   ├── aiService.ts        # Unified AI service
│   ├── chatHandler.ts      # Chat orchestrator
│   ├── chatSessionService.ts
│   └── supabase.ts         # Supabase client
├── config/                  # Configuration files
│   └── api.ts              # API configuration
└── utils/                  # Utility functions
    └── aiCommandSchema.ts  # Zod validation schemas
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
tests/
└── 2025-05-11-ai-assistant-response-testing/
    ├── ai-service.test.ts   # Main test suite (57 tests)
    └── setup.ts             # Test mocks
```

## 🎯 Features in Detail

### Dashboard
- Weather widget with 5-day forecast
- Task overview with priority indicators
- Calendar widget for upcoming events
- News widget with source attribution

### Aura Assistant
- **Command Mode**: Natural language to CRUD operations
  - Create tasks: "Remind me to buy groceries tomorrow"
  - Read notes: "Show all my notes"
  - Update events: "Reschedule meeting to 3pm"
  - Delete items: "Remove the old task"
- **Brain Mode**: Deep reasoning for complex queries
  - Multi-step analysis
  - Strategic planning
  - Creative tasks

### Notes Management
- TipTap rich text editor with formatting
- Custom tagging system
- Full-text search and filtering
- Real-time sync across devices

### Task Management
- Three priority levels: High, Medium, Low
- Due date tracking with calendar integration
- Complete/pending status management
- AI-powered task recommendations

### Calendar & Events
- Interactive month view with event indicators
- Quick event creation with natural language
- Edit and delete functionality
- Today's schedule view

## 📁 Reports & Documentation

Test reports and documentation are stored in the `reports/` folder:

```
reports/
└── 2025-05-11-ai-assistant-response-testing/
    ├── test-evaluation-analysis.md
    ├── summary-report.md
    ├── brain-mode-report.md
    └── command-mode-report.md
```

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**Dhyan Patel**
- GitHub: [@dhyan2815](https://github.com/dhyan2815)
- LinkedIn: [Dhyan Patel](https://linkedin.com/in/dhyan-patel)
- Portfolio: [Dhyan Dev](https://dhyan-patel.onrender.com)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Amazing UI framework
- [Supabase](https://supabase.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vite](https://vitejs.dev/) - Fast build tooling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Radix UI](https://radix-ui.com/) - Accessible components
- [Zod](https://zod.dev/) - Schema validation
- [Gemini](https://ai.google.dev/) - AI capabilities
- [OpenRouter](https://openrouter.ai/) - AI fallback

---

<div align="center">
  <p><strong>Empower your productivity with AuraOne</strong><br>Created by <a href="https://github.com/dhyan2815">Dhyan Patel</a></p>
  <p>
    <a href="https://aura-one1.web.app/">🌐 Live Demo</a> •
    <a href="https://github.com/dhyan2815/AuraOne/issues">🐛 Report Bug</a> •
    <a href="https://github.com/dhyan2815/AuraOne/issues">💡 Request Feature</a>
  </p>
</div>