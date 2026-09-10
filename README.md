# Blux Labs website

React/Vite website for https://bluxlabs.com/. Main is the source of truth. Pushes to main run tests, build all 24 direct-entry pages, and deploy the static output through GitHub Pages.

## Development

Use Node.js 22 or newer. Run `npm ci`, then `npm run dev`. Source content is in `src/content.json`; Miki Li's statement contains nine body paragraphs from the supplied document. Product narratives are in `src/product-stories.js`; supplied images are in `public/assets`.

## Hosting

GitHub Pages hosts the frontend only. Production builds set `VITE_STATIC_PREVIEW=true` so contact submissions cannot report a false success. Direct email and inquiry copying remain available. See BACKEND.md for a later Node/AWS deployment and Gmail SMTP configuration; credentials must remain outside the repository.

The custom domain remains bluxlabs.com. Both desktop and mobile homepages use the approved spatial facets navigation. Keep direct-entry route generation for subpages.

## Migration and rollback

The previous Zola website remains in Git history at tag `archive/pre-spatial-website-2026-09-10`. The original main commit was `d40042191dd25dfcabca4bc2d55e1948e87d737c`; the old gh-pages branch is retained. To roll back hosting, switch Pages back to the gh-pages branch until the source is restored. Do not run the old Zola workflow alongside this deployment.

## Rights

Company-owned content: Copyright 2026 Blux Inc. All rights reserved. Third-party notices remain in public/THIRD-PARTY-NOTICES.txt. Earlier revisions retain their historical licensing terms.
