import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PageLoadingProvider } from './context/PageLoadingContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PageLoadingProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PageLoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
