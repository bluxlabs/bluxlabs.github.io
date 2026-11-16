import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {profileAliases} from '../src/profile-aliases.js';
import {products} from '../src/products.js';
const content=JSON.parse(readFileSync('src/content.json','utf8'));
test('restored name remains associated with the same CTO profile and statement', () => {
 const person=content.people.find(p=>p.name==='Hancheng Tong');
 assert.ok(person);assert.equal(person.role,'CTO');
 assert.ok(person.bio.startsWith('Hancheng Tong is an independent researcher'));
 assert.equal(person.portrait,'/assets/people/even-li-brain-20261020.jpg');
 assert.equal(content.people.filter(p=>p.role==='CTO').length,1);
 assert.equal(content.statements.find(s=>s.title==='Make Cognitive Enhancement a Public Road').author,'Hancheng Tong');
 assert.ok(!content.people.some(p=>p.name==='Even Li'));
});
test('old profile links resolve to restored name, and published render credits agree', () => {
 assert.equal(profileAliases['/team/even-li'],'/team/hancheng-tong');
 assert.equal(profileAliases['/team/chaozhi-li'],'/team/hancheng-tong');
 const media=products.find(p=>p.name==='Miniscope V4').media;
 assert.match(media.alt,/Hancheng Tong/);assert.match(media.caption,/Hancheng Tong/);
 const event=readFileSync('public/events/neuroscience-2026/index.html','utf8');
 assert.match(event,/Model rendering by Hancheng Tong/);assert.doesNotMatch(event,/Even Li/);
});
