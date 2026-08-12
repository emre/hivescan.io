import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ChainProvider } from "./hooks/useChain.jsx";
import { MARK } from "./mark.js";
import "./styles.css";

// The mark is still needed at runtime for the CSS-masked header logo.
// The browser-tab and share-preview icons are static files in public/
// (see index.html) — no reason to inject those at runtime too.
document.documentElement.style.setProperty("--mark", `url(${MARK})`);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChainProvider>
      <App />
    </ChainProvider>
  </React.StrictMode>
);
