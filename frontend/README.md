# AskUni Frontend

Production-grade Next.js frontend for AskUni with streaming chat, source citations, and authentication.

## Features

- 🔐 **Authentication**: JWT-based login/register
- 💬 **Real-time Chat**: Interactive chat interface
- 📚 **Source Citations**: Expandable source attribution for answers
- 📊 **Confidence Scores**: Visual confidence indicators
- ⚡ **Fast & Responsive**: Built on Next.js 14
- 🎨 **Modern UI**: Tailwind CSS + shadcn/ui

## Quick Start

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Pages

- `/` - Landing page
- `/login` - Sign in
- `/register` - Create account
- `/chat` - Main chat interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios

## Project Structure

```
app/
├── page.tsx           # Landing
├── login/             # Auth pages
├── register/
└── chat/              # Chat interface

lib/
├── api.ts             # Axios client
└── store/
    ├── auth.ts        # Auth state
    └── chat.ts        # Chat state

components/
└── ui/                # shadcn components
```

## Usage

1. **Register** an account
2. **Sign in** with credentials
3. **Ask questions** in the chat
4. View **source citations** by expanding accordions
5. Check **confidence scores** on answers
