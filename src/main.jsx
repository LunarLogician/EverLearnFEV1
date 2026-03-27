import '@/styles/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initializeAnalytics } from './utils/analytics'

// Initialize Google Analytics
const GA_ID = 'G-J4YNZ2F5XQ'
if (GA_ID) {
  initializeAnalytics(GA_ID)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
