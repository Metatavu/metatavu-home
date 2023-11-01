import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";

const container = document.getElementById("root") as HTMLElement;

if (container !== null) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
