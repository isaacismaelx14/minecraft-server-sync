import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@minerelay/ui/globals.css";
import "./launcher.css"; /* globals.css is imported inside launcher.css */

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
