// src/main.jsx (veya src/index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App.jsx';
import { logger } from '@/shared/lib/logger.js';

if (import.meta.env.MODE === 'production') {
  console.log = () => {}; 
  console.info = () => {};
  console.warn = (...args) => logger.warn(...args); 
  console.error = (...args) => logger.error('Unhandled Console Error', args); 
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);