import {copyFileSync,readFileSync,writeFileSync} from 'node:fs';
copyFileSync('server/contact.js','dist/server/contact.js');
copyFileSync('worker/index.js','dist/server/static.js');
writeFileSync('dist/server/index.js',readFileSync('server/index.js','utf8').replace('../worker/index.js','./static.js'));
console.log('Contact API packaged alongside static serving.');
