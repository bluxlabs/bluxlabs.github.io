import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {products,productAliases} from '../src/products.js';
const content=JSON.parse(readFileSync('src/content.json','utf8'));
const slug=v=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const escape=v=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes=[['/','Blux Labs','Instruments and software for studying brain activity and behavior.'],...['About','Products','Team','Statements','Contact'].map(n=>['/'+n.toLowerCase()+'/',n+' | Blux Labs',n==='Contact'?'Discuss your research with Blux Labs.':`Explore ${n.toLowerCase()} at Blux Labs.`]),...products.map(p=>['/products/'+slug(p.name)+'/',p.name+' | Blux Labs',p.summary]),...content.people.map(p=>['/team/'+slug(p.name)+'/',p.name+' | Blux Labs',p.name+' — '+p.role+' at Blux Labs.']),...content.statements.map(s=>['/statements/'+slug(s.title)+'/',s.title+' | Blux Labs','A personal perspective by '+s.author+'.'])];
const html=readFileSync('dist/client/index.html','utf8');
for(const [route,title,description]of routes){const folder='dist/client'+route;mkdirSync(folder,{recursive:true});writeFileSync(folder+'index.html',html.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace('</head>',`<meta name="description" content="${escape(description)}" />\n<meta property="og:title" content="${escape(title)}" />\n<meta property="og:description" content="${escape(description)}" />\n</head>`));}
for(const [oldPath,newPath] of Object.entries(productAliases)) {
 const folder='dist/client'+oldPath+'/';mkdirSync(folder,{recursive:true});
 const target=newPath+'/';
 writeFileSync(folder+'index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Witness System | Blux Labs</title><link rel="canonical" href="https://bluxlabs.com${target}"><meta http-equiv="refresh" content="0;url=${target}"></head><body><p>This product is now part of Witness System. <a href="${target}">Continue to the updated product page</a>.</p><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></body></html>`);
}
writeFileSync('dist/client/404.html' ,html.replace('<title>Blux Labs</title>','<title>Page not found | Blux Labs</title>'));
mkdirSync('review',{recursive:true});
// Event pages are authored in public/ and copied intact by Vite.
const standaloneRoutes=['/events/neuroscience-2026/'];
for(const route of standaloneRoutes)readFileSync('dist/client'+route+'index.html','utf8');
writeFileSync('review/routes.json',JSON.stringify([...routes.map(r=>r[0]),...Object.keys(productAliases).map(p=>p+'/'),...standaloneRoutes],null,2));
console.log(`Prepared ${routes.length} app pages and ${standaloneRoutes.length} standalone event page.`);
