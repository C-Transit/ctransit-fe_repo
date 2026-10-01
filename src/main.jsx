import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// Manage service worker registration
if ('serviceWorker' in navigator) {
  const target = (import.meta.env.VITE_APP_TARGET || '').toLowerCase().trim();
  if (import.meta.env.PROD && (target === 'web' || !target)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.log('SW registration failed: ', err);
      });
    });
  } else if (!import.meta.env.PROD || (target && target !== 'web')) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
