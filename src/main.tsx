import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Suppress extension-related console errors in development
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    // Filter out extension connection errors
    if (args[0]?.includes?.('Could not establish connection') ||
        args[0]?.includes?.('Receiving end does not exist')) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
