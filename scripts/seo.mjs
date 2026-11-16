// Build-time SEO for the static GitHub Pages output.
// Each route gets real metadata, JSON-LD and a crawlable HTML fallback inside #root.
// createRoot() replaces the fallback when the app mounts, so the rendered site is unchanged.
import {readFileSync} from 'node:fs';
import {products} from '../src/products.js';
import {stories} from '../src/product-stories.js';

export const SITE = 'https://bluxlabs.com';
const content = JSON.parse(readFileSync(new URL('../src/content.json', import.meta.url), 'utf8'));
const DEFAULT_IMAGE = '/assets/events/sfn-2026/share-20261104.jpg';
const SAME_AS = ['https://www.linkedin.com/company/blux-inc/', 'https://x.com/BluxInc', 'https://github.com/bluxlabs'];
const TAGLINE = 'Neuroscience instruments and software for studying brain activity and behavior: Miniscope V4 neural imaging, Witness System 3D behavior tracking and the Blux Research Agent.';
const ABOUT = [
  'Blux is a neurotechnology company developing tools for neuroscience labs in universities and pharma, helping researchers study brain activity and behavior.',
  'Our work brings measurement, recording and analysis together, with research agents helping reduce the operational work between a question and its evidence.',
  'Our mission is to accelerate brain research and safely increase the bandwidth between the brain, computers and the world.',
];

export const slug = v => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const escape = v => String(v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const abs = path => SITE + path;
const clip = (text, max = 158) => { const t = text.replace(/\s+/g, ' ').trim(); return t.length <= max ? t : t.slice(0, t.lastIndexOf(' ', max - 1)) + '…'; };
const para = text => `<p>${escape(text)}</p>`;
const link = (href, text) => `<a href="${escape(href)}">${escape(text)}</a>`;
const list = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

const productUrl = p => '/products/' + slug(p.name) + '/';
const personUrl = p => '/team/' + slug(p.name) + '/';
const statementUrl = s => '/statements/' + slug(s.title) + '/';
const topProducts = products.filter(p => !p.parent);

const organization = {
  '@type': 'Organization', '@id': SITE + '/#organization', name: 'Blux Inc.', alternateName: 'Blux Labs', url: SITE + '/',
  logo: abs('/assets/logo.svg'), email: 'sol@bluxlabs.com', description: TAGLINE, sameAs: SAME_AS,
  address: {'@type': 'PostalAddress', addressLocality: 'Irvine', addressRegion: 'CA', addressCountry: 'US'},
  founder: {'@type': 'Person', name: 'Sol Wang'},
};
const breadcrumbs = trail => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...trail].map(([name, path], i) => ({'@type': 'ListItem', position: i + 1, name, item: abs(path)})),
});
const productList = () => list(topProducts.map(p => `${link(productUrl(p), p.name)} — ${escape(p.summary)}`));

function productPage(p) {
  const story = stories[p.name] || {};
  const children = products.filter(c => c.parent === p.name);
  const image = p.media?.src || DEFAULT_IMAGE;
  const description = clip(`${p.name} by Blux Labs: ${story.intro || p.body}`);
  const body = [
    `<h1>${escape(p.name)}</h1>`, `<p>${escape(p.category)} · ${escape(p.stage)}</p>`,
    para(p.summary), story.intro ? para(story.intro) : '', para(p.body), para(p.detail),
    story.approach ? para(story.approach) : '', story.stage ? para(story.stage) : '',
    p.media ? `<img src="${escape(image)}" alt="${escape(p.media.alt)}">` : '',
    children.length ? `<h2>Part of ${escape(p.name)}</h2>` + list(children.map(c => `${link(productUrl(c), c.name)} — ${escape(c.summary)}`)) : '',
    p.parent ? para(`Part of ${p.parent}.`) + link(productUrl(products.find(x => x.name === p.parent)), p.parent) : '',
    `<p>${link('/contact/', 'Discuss your research with Blux')}</p>`,
  ].join('');
  const trail = [['Products', '/products/'], ...(p.parent ? [[p.parent, productUrl(products.find(x => x.name === p.parent))]] : []), [p.name, productUrl(p)]];
  return {
    route: productUrl(p), title: `${p.name} — ${p.category.split(' / ')[1]} | Blux Labs`, description, image, type: 'product', body,
    jsonld: [{'@type': 'Product', name: p.name, description: clip(story.intro || p.body, 300), image: abs(image), category: p.category.split(' / ')[1],
      brand: {'@type': 'Brand', name: 'Blux'}, manufacturer: {'@id': organization['@id']}, url: abs(productUrl(p))}, breadcrumbs(trail)],
  };
}

function personPage(p) {
  const first = p.bio.split(/\n\n|(?<=\.)\s/)[0];
  const authored = content.statements.filter(s => s.author === p.name);
  return {
    route: personUrl(p), title: `${p.name}, ${p.role} | Blux Labs`, description: clip(`${p.name} is ${p.role} at Blux Labs. ${first}`), image: p.portrait, type: 'profile',
    body: `<h1>${escape(p.name)}</h1><p>${escape(p.role)}, Blux Inc.</p>${p.bio.split('\n\n').map(para).join('')}`
      + (authored.length ? '<h2>Statements</h2>' + list(authored.map(s => link(statementUrl(s), s.title))) : '')
      + `<p>${link('/team/', 'Meet the Blux team')}</p>`,
    jsonld: [{'@type': 'Person', name: p.name, jobTitle: p.role, description: clip(p.bio, 300), image: abs(p.portrait), worksFor: {'@id': organization['@id']}, url: abs(personUrl(p))},
      breadcrumbs([['Team', '/team/'], [p.name, personUrl(p)]])],
  };
}

function statementPage(s) {
  const author = content.people.find(p => p.name === s.author);
  return {
    route: statementUrl(s), title: `${s.title} — ${s.author} | Blux Labs`, description: clip(s.intro), image: author?.portrait || DEFAULT_IMAGE, type: 'article',
    body: `<article><h1>${escape(s.title)}</h1><p>By ${author ? link(personUrl(author), s.author) : escape(s.author)}${author ? ', ' + escape(author.role) : ''}</p>${para(s.intro)}${s.body.map(para).join('')}</article><p>${link('/statements/', 'All statements')}</p>`,
    jsonld: [{'@type': 'Article', headline: s.title, description: clip(s.intro, 300), image: abs(author?.portrait || DEFAULT_IMAGE),
      author: {'@type': 'Person', name: s.author, ...(author ? {url: abs(personUrl(author))} : {})}, publisher: {'@id': organization['@id']}, mainEntityOfPage: abs(statementUrl(s))},
      breadcrumbs([['Statements', '/statements/'], [s.title, statementUrl(s)]])],
  };
}

export function pages() {
  return [
    {route: '/', title: 'Blux Labs — Miniscope Neural Imaging & 3D Behavior Tracking for Neuroscience', description: clip(TAGLINE), type: 'website',
      body: `<h1>Blux Labs: instruments first. Then the interface.</h1>${para(TAGLINE)}${ABOUT.map(para).join('')}<h2>Products</h2>${productList()}<h2>Company</h2>${list([link('/about/', 'About Blux'), link('/team/', 'Our team'), link('/statements/', 'Statements'), link('/events/neuroscience-2026/', 'Blux at Neuroscience 2026 (SfN), Booth 2302'), link('/contact/', 'Contact')])}`,
      jsonld: [organization, {'@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'Blux Labs', publisher: {'@id': organization['@id']}}]},
    {route: '/about/', title: 'About Blux — Neurotechnology Tools for Brain and Behavior Research | Blux Labs', description: clip(ABOUT.join(' ')), type: 'website',
      body: `<h1>About Blux</h1>${ABOUT.map(para).join('')}${para('We see today’s instruments as a starting point toward whole-brain interfaces—a long-term research direction.')}<h2>Products</h2>${productList()}`,
      jsonld: [breadcrumbs([['About', '/about/']])]},
    {route: '/products/', title: 'Products — Miniscope V4, Witness System & Research Agent | Blux Labs', description: clip('Blux products for neuroscience labs: ' + topProducts.map(p => `${p.name} (${p.summary.replace(/\.$/, '')})`).join('; ') + '.'), type: 'website',
      body: `<h1>Blux products</h1>${list(products.map(p => `<h2>${link(productUrl(p), p.name)}</h2>${para(p.category + ' · ' + p.stage)}${para(p.summary)}${para(p.body)}`))}`,
      jsonld: [{'@type': 'ItemList', itemListElement: products.map((p, i) => ({'@type': 'ListItem', position: i + 1, url: abs(productUrl(p)), name: p.name}))}, breadcrumbs([['Products', '/products/']])]},
    {route: '/team/', title: 'Team — The People Behind Blux Neuroscience Instruments | Blux Labs', description: clip('Meet the Blux team: ' + content.people.map(p => `${p.name} (${p.role})`).join(', ') + '.'), type: 'website',
      body: `<h1>The Blux team</h1>${list(content.people.map(p => `${link(personUrl(p), p.name)} — ${escape(p.role)}`))}`,
      jsonld: [breadcrumbs([['Team', '/team/']])]},
    {route: '/statements/', title: 'Statements — Perspectives from the Blux Team | Blux Labs', description: clip('Personal perspectives from the Blux team on neurotechnology, brain–computer interfaces and research: ' + content.statements.map(s => s.title).join('; ') + '.'), type: 'website',
      body: `<h1>Statements</h1>${list(content.statements.map(s => `${link(statementUrl(s), s.title)} — ${escape(s.author)}`))}`,
      jsonld: [breadcrumbs([['Statements', '/statements/']])]},
    {route: '/contact/', title: 'Contact Blux — Discuss Your Neuroscience Research | Blux Labs', description: 'Tell Blux about your recording or behavior experiment, setup requirements or research workflow. Email sol@bluxlabs.com.', type: 'website',
      body: `<h1>Contact Blux</h1>${para('Tell us about your experiment, the equipment your laboratory needs, or the research workflow you want to automate.')}<p><a href="mailto:sol@bluxlabs.com">sol@bluxlabs.com</a></p>`,
      jsonld: [breadcrumbs([['Contact', '/contact/']])]},
    ...products.map(productPage), ...content.people.map(personPage), ...content.statements.map(statementPage),
  ];
}

export function headTags(page) {
  const url = abs(page.route), image = abs(page.image || DEFAULT_IMAGE);
  const graph = {'@context': 'https://schema.org', '@graph': page.jsonld.some(n => n['@id'] === organization['@id']) ? page.jsonld : [organization, ...page.jsonld]};
  return [
    `<meta name="description" content="${escape(page.description)}" />`,
    `<link rel="canonical" href="${escape(url)}" />`,
    `<meta property="og:type" content="${page.type === 'article' ? 'article' : page.type === 'profile' ? 'profile' : 'website'}" />`,
    `<meta property="og:site_name" content="Blux Labs" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${escape(url)}" />`,
    `<meta property="og:image" content="${escape(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@BluxInc" />`,
    `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`,
  ].join('\n');
}

export function renderPage(shell, page) {
  return shell
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace('</head>', headTags(page) + '\n</head>')
    .replace('<div id="root"></div>', `<div id="root"><main class="seo-fallback">${page.body}</main></div>`);
}

export function sitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r => `  <url><loc>${escape(abs(r))}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
}

export const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
