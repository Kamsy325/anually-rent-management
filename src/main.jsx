// main.jsx or index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

// Replace with your actual Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "992123334330-nv423seqpkiagbqa4581aipuh8ihi51b.apps.googleusercontent.com";

// Force immediate favicon update in case browser has aggressively cached an older template icon
if (typeof document !== 'undefined') {
  const brandSvg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#3b82f6'/><stop offset='100%' stop-color='#1d4ed8'/></linearGradient></defs><rect width='512' height='512' rx='115' fill='url(#g)'/><rect x='134' y='288' width='64' height='110' rx='32' fill='#ffffff'/><rect x='224' y='224' width='64' height='174' rx='32' fill='#ffffff'/><rect x='314' y='134' width='64' height='264' rx='32' fill='#ffffff'/></svg>";
  const faviconUri = `data:image/svg+xml,${encodeURIComponent(brandSvg)}`;
  const existingIcons = document.querySelectorAll("link[rel*='icon']");
  existingIcons.forEach((el) => {
    el.setAttribute('href', faviconUri);
  });
}

// Register Service Worker for desktop push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] Registration failed:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);