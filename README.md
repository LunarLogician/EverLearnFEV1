# StudentApp Frontend

Beautiful React-based chat interface with authentication and subscription system.

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will run at `http://localhost:3000`

## Features

✅ **Authentication**
- Beautiful login/register modal
- JWT token management
- Persistent sessions

✅ **Chat Interface**
- Real-time message streaming
- Typing indicator animations
- Smooth message animations
- Auto-scroll to latest messages

✅ **Subscription Paywall**
- Free tier: 3 chats
- Premium plans with more chats
- Beautiful comparison modal

✅ **UI/UX**
- Tailwind CSS styling
- Framer Motion animations
- Responsive design
- Dark theme (ChatGPT-like)

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   ├── context/          # Auth & Chat context
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main app
│   └── main.jsx          # Entry point
├── vite.config.js        # Vite config
├── tailwind.config.js    # Tailwind config
└── index.html            # HTML template
```

## API Integration

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Chat**: `/api/chat` (POST), `/api/chat/history` (GET)
- **Subscription**: `/api/subscription` (GET)

## Build

```bash
npm run build
```

Output in `dist/` folder
