import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import AdminApp from './App';
import ErrorBoundary from '../../components/common/ErrorBoundary';

if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminApp />
    </ErrorBoundary>
  </StrictMode>
);
