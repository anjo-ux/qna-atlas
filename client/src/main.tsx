import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <div className="box-border flex h-dvh min-h-0 w-screen max-w-full flex-col overflow-hidden max-md:pb-[var(--app-mobile-browser-bottom)]">
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <App />
    </div>
  </div>
);
