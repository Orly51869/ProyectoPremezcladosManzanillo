// Archivo: src/index.js
// Punto de entrada de la aplicación React. Monta el componente `App` en el DOM.
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Auth0ProviderWithNavigate from "./components/Auth0ProviderWithNavigate";
import "./styles.css";

import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));

// Variables de entorno de Auth0
const auth0Domain = import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID;

// Log para verificar las variables de entorno de Auth0
console.log("Auth0 Domain:", auth0Domain);
console.log("Auth0 Client ID:", auth0ClientId);

// Validar que las variables de entorno estén definidas
if (!auth0Domain || !auth0ClientId) {
  const errorMessage = `
    ⚠️ ERROR: Variables de entorno de Auth0 no configuradas
    
    Por favor, crea un archivo .env en la carpeta Frontend/ con:
    
    VITE_REACT_APP_AUTH0_DOMAIN=tu-dominio.auth0.com
    VITE_REACT_APP_AUTH0_CLIENT_ID=tu-client-id
    VITE_REACT_APP_API_URL=http://localhost:3001
    
    Luego reinicia el servidor de desarrollo.
  `;

  root.render(
    <div style={{
      padding: '2rem',
      fontFamily: 'monospace',
      backgroundColor: '#1a1a1a',
      color: '#ff6b6b',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{errorMessage}</pre>
    </div>
  );
} else {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <App />
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </StrictMode>
  );
}
