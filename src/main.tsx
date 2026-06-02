import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { hydrateSharedCredentials, startTokenAutoRefresh } from "./api/credentials";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

// Pull the latest shared token from the gist before the first request,
// then keep the bearer alive proactively (boot refresh + every 10 min +
// on focus / visibility-change). We don't block the UI on either — the
// scheduler waits for hydration so the first refresh uses the freshest
// gist value.
void hydrateSharedCredentials().then(() => {
  startTokenAutoRefresh();
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
