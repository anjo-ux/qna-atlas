import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <div className="h-screen w-screen overflow-hidden">
    <App />
  </div>
);
