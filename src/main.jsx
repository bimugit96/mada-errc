import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Admin from './components/Admin.jsx';
import './styles.css';
import './styles/perbelanjaan.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/^\/admin\/?$/.test(window.location.pathname) ? <Admin /> : <App />}
  </React.StrictMode>,
);
