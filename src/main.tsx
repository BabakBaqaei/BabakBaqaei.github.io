import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Land on the hero, not wherever the last visit stopped.
 *
 * The browser restores scroll position on reload, and with a full-screen hero
 * that means a refresh drops you into the middle of the page with the portrait
 * scrolled off the top — it reads as if the hero were missing. Anchors still
 * work: a URL with a hash is left alone.
 */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
if (!window.location.hash) {
  window.scrollTo(0, 0);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
