import {contactApi} from './server/vite-api.js';
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Vite regenerates the entry tag; retain render blocking for incoming page snapshots.
function renderBlockingEntry() {
  return {
    name: 'blux-render-blocking-entry',
    transformIndexHtml: {
      order: 'post',
      handler: html => html.replace(/<script\b[^>]*type="module"[^>]*>/g,
        tag => tag.includes('blocking=') ? tag : tag.replace('<script', '<script blocking="render"')),
    },
  };
}

function baseLinks({types:t}){return {visitor:{JSXAttribute(p){if(!['href','src'].includes(p.node.name.name))return;const v=p.node.value;if(!v)return;if(t.isStringLiteral(v)&&!v.value.startsWith('/'))return;if(t.isJSXExpressionContainer(v)&&t.isJSXEmptyExpression(v.expression))return;p.node.value=t.jsxExpressionContainer(t.callExpression(t.identifier('siteUrl'),[t.isStringLiteral(v)?v:v.expression]));}}}}
export default defineConfig({
  base:process.env.BUILD_BASE||'/',

  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react({babel:{plugins:[baseLinks]}}), renderBlockingEntry(), contactApi({...loadEnv('development', process.cwd(), ''), ...process.env})],
});
