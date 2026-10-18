// Initialize the application's React rendering root, mount HTML container hooks, and bind Router providers.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Render the strict-mode React application component tree inside the root DOM element.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position='bottom-center'
        reverseOrder={false}
        containerClassName='lm-toaster'
        toastOptions={{
          className: 'lm-toast',
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#7FCB5A',
              secondary: '#1F211E',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#FF8A73',
              secondary: '#1F211E',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);