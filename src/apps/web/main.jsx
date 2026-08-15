import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import WebApp from './App';
import ErrorBoundary from '../../components/common/ErrorBoundary';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.warn('SW registration skipped:', err);
    });
  });
} else if ('serviceWorker' in navigator) {
  // In development mode, ensure any existing service worker is unregistered
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <WebApp />
    </ErrorBoundary>
  </StrictMode>
);
