import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { hydrateSharedCredentials } from "./api/credentials";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

// Pull the latest shared token from the gist before the first request,
// then render. We don't block the UI on it — but starting it early means
// the network round-trip overlaps with React's initial render.
void hydrateSharedCredentials();

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
