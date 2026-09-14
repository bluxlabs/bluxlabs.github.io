import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../public/facet-entry.js', import.meta.url), 'utf8');
const key = 'blux-facet-entry';
const pointData = [[100, 200], [500, 100], [500, 600]];

function browser({path = '/', reduced = false, stored, blocked = false} = {}) {
  const handlers = {};
  const values = new Map(stored ? [[key, JSON.stringify(stored)]] : []);
  const properties = new Map();
  const root = {dataset: {}, style: {setProperty: (k, v) => properties.set(k, v), removeProperty: k => properties.delete(k)}};
  const svg = {viewBox: {baseVal: {x: 0, y: 0, width: 1000, height: 1000}}, getBoundingClientRect: () => ({left: 0, top: -100, width: 1000, height: 1000})};
  const group = {dataset: {facetPoints: JSON.stringify(pointData)}, ownerSVGElement: svg};
  const link = {dataset: {facetEntry: 'team'}, href: 'https://blux.test/team/', target: '', hasAttribute: () => false, closest: () => ({querySelector: () => group})};
  const storage = {
    getItem: k => { if (blocked) throw new Error('blocked'); return values.get(k) ?? null; },
    setItem: (k, v) => { if (blocked) throw new Error('blocked'); values.set(k, v); },
    removeItem: k => { if (blocked) throw new Error('blocked'); values.delete(k); },
  };
  const win = {
    location: new URL('https://blux.test' + path), innerWidth: 1000, innerHeight: 1000,
    sessionStorage: storage, matchMedia: () => ({matches: reduced}),
    addEventListener: (name, handler) => { handlers[name] = handler; },
  };
  vm.runInNewContext(source, {URL, Date, document: {documentElement: root, addEventListener: (name, handler) => { handlers[name] = handler; }}, window: win});
  const click = (overrides = {}) => {
    assert.equal(typeof handlers.click, 'function', 'the native click observer is registered');
    handlers.click({button: 0, defaultPrevented: false, target: {closest: () => link}, preventDefault: () => assert.fail('must preserve native navigation'), ...overrides});
  };
  return {handlers, values, properties, root, link, click};
}

test('a normal facet click records its viewport polygon without intercepting navigation', () => {
  const p = browser();
  p.click();
  const entry = JSON.parse(p.values.get(key));
  assert.equal(entry.path, '/team/');
  assert.equal(entry.id, 'team');
  assert.deepEqual(entry.points, [[10, 10], [50, 0], [50, 50]]);
});

test('modified, prevented and new-tab clicks keep their native behavior', () => {
  for (const event of [{ctrlKey: true}, {metaKey: true}, {shiftKey: true}, {altKey: true}, {button: 1}, {defaultPrevented: true}]) {
    const p = browser(); p.click(event); assert.equal(p.values.size, 0);
  }
  const p = browser(); p.link.target = '_blank'; p.click(); assert.equal(p.values.size, 0);
});

test('a matching incoming native transition consumes the origin and cleans up when finished', async () => {
  const p = browser({path: '/team/', stored: {id: 'team', path: '/team/', time: Date.now(), points: [[10, 10], [50, 0], [50, 50]]}});
  assert.equal(typeof p.handlers.pagereveal, 'function', 'incoming geometry is handled');
  let finish;
  const finished = new Promise(resolve => { finish = resolve; });
  p.handlers.pagereveal({viewTransition: {ready: Promise.resolve(), finished}});
  assert.equal(p.root.dataset.facetTransition, 'team');
  assert.match(p.properties.get('--facet-reveal-from'), /^polygon\(/);
  assert.equal(p.values.size, 0);
  finish(); await finished;
  assert.equal(p.root.dataset.facetTransition, undefined);
  assert.equal(p.properties.size, 0);
  assert.equal(p.root.dataset.lastFacetTransition, 'team');
});

test('stale, mismatched and malformed origins cannot affect a later page', () => {
  for (const stored of [
    {id:'team',path:'/team/',time:Date.now()-30000,points:pointData},
    {id:'team',path:'/products/',time:Date.now(),points:pointData},
    {id:'team',path:'/team/',time:Date.now(),points:[['bad', 10],[20, 30],[40, 50]]},
  ]) {
    const p=browser({path:'/team/',stored});
    assert.equal(typeof p.handlers.pagereveal, 'function');
    p.handlers.pagereveal({viewTransition:{ready:Promise.resolve(),finished:Promise.resolve()}});
    assert.equal(p.root.dataset.facetTransition, undefined);
    assert.equal(p.values.size, 0);
  }
});

test('reduced motion and unavailable native transitions discard the optional effect', () => {
  const p=browser({reduced:true});p.click();assert.equal(p.values.size,0);
  const incoming=browser({path:'/team/',stored:{id:'team',path:'/team/',time:Date.now(),points:pointData}});
  assert.equal(typeof incoming.handlers.pagereveal,'function');
  incoming.handlers.pagereveal({});
  assert.equal(incoming.values.size,0);
  assert.equal(incoming.root.dataset.facetTransition,undefined);
});

test('unavailable session storage cannot break a link or page entry', () => {
  const p=browser({blocked:true});
  assert.doesNotThrow(()=>p.click());
  assert.equal(typeof p.handlers.pagereveal,'function');
  assert.doesNotThrow(()=>p.handlers.pagereveal({viewTransition:{ready:Promise.resolve(),finished:Promise.resolve()}}));
});
