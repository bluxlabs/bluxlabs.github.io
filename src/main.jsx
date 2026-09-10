import {siteUrl,appPath} from './site-url.js';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const legacySection = window.location.hash.slice(1);
if (appPath() === '/' && ['about','products','team','statements','contact'].includes(legacySection)) {
  window.location.replace(siteUrl('/' + legacySection + '/'));
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
