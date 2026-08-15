import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import AgentApp from './App';
import ErrorBoundary from '../../components/common/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AgentApp />
    </ErrorBoundary>
  </StrictMode>
);
