import {profileAliases} from '../src/profile-aliases.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {productAliases} from '../src/products.js';
import {pages,renderPage,sitemap,robots,escape} from './seo.mjs';
const appPages=pages();
const routes=appPages.map(p=>[p.route,p.title,p.description]);
const html=readFileSync('dist/client/index.html','utf8');
if(!html.includes('<div id="root"></div>'))throw new Error('index.html shell is missing the empty #root container');
for(const page of appPages){const folder='dist/client'+page.route;mkdirSync(folder,{recursive:true});writeFileSync(folder+'index.html',renderPage(html,page));}
for(const [oldPath,newPath] of Object.entries({...productAliases,...profileAliases})) {
 const folder='dist/client'+oldPath+'/';mkdirSync(folder,{recursive:true});
 const target=newPath+'/';
 const isProfile=oldPath.startsWith('/team/');
 const redirectTitle=isProfile?'Hancheng Tong | Blux Labs':'Witness System | Blux Labs';
 const redirectMessage=isProfile?'This team profile now uses the name Hancheng Tong.':'This product is now part of Witness System.';
 const redirectLink=isProfile?'Continue to the updated team profile':'Continue to the updated product page';
 writeFileSync(folder+'index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(redirectTitle)}</title><link rel="canonical" href="https://bluxlabs.com${target}"><meta http-equiv="refresh" content="0;url=${target}"></head><body><p>${escape(redirectMessage)} <a href="${target}">${escape(redirectLink)}</a>.</p><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></body></html>`);
}
writeFileSync('dist/client/404.html' ,html.replace(/<title>.*?<\/title>/,'<title>Page not found | Blux Labs</title>').replace('</head>','<meta name="robots" content="noindex" />\n</head>'));
mkdirSync('review',{recursive:true});
// Event pages are authored in public/ and copied intact by Vite.
const standaloneRoutes=['/events/neuroscience-2026/'];
for(const route of standaloneRoutes)readFileSync('dist/client'+route+'index.html','utf8');
writeFileSync('dist/client/sitemap.xml',sitemap([...routes.map(r=>r[0]),...standaloneRoutes]));
writeFileSync('dist/client/robots.txt',robots());
writeFileSync('review/routes.json',JSON.stringify([...routes.map(r=>r[0]),...Object.keys({...productAliases,...profileAliases}).map(p=>p+'/'),...standaloneRoutes],null,2));
console.log(`Prepared ${routes.length} app pages, ${standaloneRoutes.length} standalone event page, sitemap.xml and robots.txt.`);
