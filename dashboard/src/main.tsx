import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionGlobalConfig } from "motion/react";
import "./index.css";
import App from "./App";
import { LedgerProvider } from "./data/store";
import { STATIC_MODE } from "./lib/motion-mode";

// ?static: render end-states instantly (screenshot/verification aid)
if (STATIC_MODE) {
  MotionGlobalConfig.skipAnimations = true;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LedgerProvider>
      <App />
    </LedgerProvider>
  </StrictMode>,
);
