# Blux Labs website

React/Vite website for https://bluxlabs.com/. Main is the source of truth. Pushes to main run API, packaging and page-motion tests, build all direct-entry pages, and deploy the static output through GitHub Pages.

## Development

Use Node.js 22 or newer. Run `npm ci`, then `npm run dev`. Source content is in `src/content.json`; Miki Li's statement contains nine body paragraphs from the supplied document. Product narratives are in `src/product-stories.js`; supplied images are in `public/assets`.

## Hosting

GitHub Pages hosts the frontend only. Production builds set `VITE_STATIC_PREVIEW=true` so contact submissions cannot report a false success. Direct email and inquiry copying remain available. See BACKEND.md for a later Node/AWS deployment and Gmail SMTP configuration; credentials must remain outside the repository.

The custom domain remains bluxlabs.com. Both desktop and mobile homepages use the approved spatial facets navigation. Keep direct-entry route generation for subpages.

## Witness product family

`/products/witness-system/` introduces the full product family. Witness Engine is the software and computational core; Witness Rig is the hardware and physical environment, containing Witness Frame, Witness Arena and Witness Sense. The top-level product listing, About page and site navigation present the family under Witness System.

The previous `/products/multi-cam-witness-system/` and `/products/experimental-digital-twin/` URLs redirect to Witness Rig and Witness Engine respectively. `src/products.js` owns this mapping; `scripts/static-pages.mjs` emits direct-entry pages and the compatibility redirects.

The overview and three detail images in `public/assets/products/witness/` are renders of the existing Witness assembly, not product photography or validated hardware specifications. `source-manifest.json` records the model hash and render cameras. Run `blender --background --disable-autoexec /path/to/Witness_Full.blend --python scripts/render-witness.py -- --output /path/to/renders` to regenerate PNG masters; add `--preview` for smaller sample renders. Compress the final masters to WebP for the website. Source models are kept separately and are not modified by the render script.

## Neuroscience 2026 event page

The standalone page at `/events/neuroscience-2026/` is authored in `public/events/neuroscience-2026/index.html` and copied intact by Vite. Its styles, motion, social cover and optimized assets are under `public/assets/events/sfn-2026/`. The confirmed Witness System session is Sunday, November 15, 2026, 4:00–4:30 p.m. EST (Washington, D.C. local time), with Sol Wang at the Focused Product Theater, Aisle 1100, session PROT20. Blux's exhibit booth is 2302. The responsive page includes direct booth/theater links, pause/replay controls and reduced-motion support.

The social cover source is `scripts/sfn-share-source.html` (1200 × 630). Render it with the site's `/assets/` available, then export a JPEG to `public/assets/events/sfn-2026/share-20261104.jpg` and the legacy `share.jpg`. The versioned Open Graph URL gives newly shared links the confirmed session details; social platforms may retain previews for existing posts.

Run `python3 scripts/build-sfn-art.py` to regenerate the inline hero and `hero-scene.svg` from the exact original logo paths. The shared scene keeps the logo and adjoining planes aligned. The event uses a Latin WOFF2 subset of Inter with the included SIL license and 420/840 px WebP versions of the original Miniscope render. Preserve the source logo and product image when updating these display assets. Production continues through the existing `main` GitHub Pages workflow.

## Migration and rollback

The previous Zola website remains in Git history at tag `archive/pre-spatial-website-2026-09-10`. The original main commit was `d40042191dd25dfcabca4bc2d55e1948e87d737c`; the old gh-pages branch is retained. To roll back hosting, switch Pages back to the gh-pages branch until the source is restored. Do not run the old Zola workflow alongside this deployment.

## Rights

Company-owned content: Copyright 2026 Blux Inc. All rights reserved. Third-party notices remain in public/THIRD-PARTY-NOTICES.txt. Earlier revisions retain their historical licensing terms.
