import {siteUrl,appPath} from './site-url.js';
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { App } from "./App.jsx";
import "./styles.css";
import "./design-language.css";
import "./pointer-feedback.css";
import "./editorial-feedback.css";
import "./facet-navigation.css";
import "./facet-light.css";
import "./inner-pages.css";
import "./about-page.css";

const legacySection = window.location.hash.slice(1);
if (appPath() === '/' && ['about','products','team','statements','contact'].includes(legacySection)) {
  window.location.replace(siteUrl('/' + legacySection + '/'));
}

flushSync(() => createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
));
