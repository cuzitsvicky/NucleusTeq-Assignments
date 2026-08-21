import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'interview-portal',
  clientId: 'basic-crud-client',
});

keycloak.init({ onLoad: 'login-required', checkLoginIframe: false }).then((authenticated) => {
  if (authenticated) {
    createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App keycloak={keycloak} />
      </React.StrictMode>
    );
  } else {
    window.location.reload();
  }
}).catch((err) => {
  console.error("Keycloak initialization failed", err);
  createRoot(document.getElementById('root')).render(
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#fff', background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', maxWidth: '480px' }}>
        <h1 style={{ fontSize: '24px', color: '#f43f5e', marginBottom: '16px' }}>Authentication Service Offline</h1>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>Keycloak identity provider could not be reached. Please check if the Keycloak docker container is running and accessible at <code>http://localhost:8080</code>.</p>
        <button onClick={() => window.location.reload()} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Retry Connection</button>
      </div>
    </div>
  );
});
