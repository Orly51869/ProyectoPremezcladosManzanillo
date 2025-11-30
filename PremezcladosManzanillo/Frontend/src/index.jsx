// Archivo: src/index.js
// Punto de entrada de la aplicación React. Monta el componente `App` en el DOM.
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "./styles.css";

import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));

// Log para verificar las variables de entorno de Auth0
console.log("Auth0 Domain:", import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN);
console.log("Auth0 Client ID:", import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID);

root.render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://premezclados-api.com",
        scope: "openid profile email read:permissions"
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
