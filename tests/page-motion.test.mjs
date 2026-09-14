import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../public/page-motion.js', import.meta.url), 'utf8');
function page(reduced = false) {
  const dataset = {};
  let reveal;
  let swap;
  vm.runInNewContext(source, {
    document: {documentElement: {dataset}},
    window: {
      matchMedia: () => ({matches: reduced}),
      addEventListener: (name, handler) => {
        if (name === 'pagereveal') reveal = handler;
        if (name === 'pageswap') swap = handler;
      },
    },
  });
  return {dataset, reveal, swap};
}

test('ordinary page entry remains idle when native transitions are unavailable', () => {
  const p = page();
  p.reveal({});
  assert.equal(p.dataset.viewTransition, 'idle');
  assert.equal(p.dataset.lastViewTransition, 'none');
});

test('native navigation tracks completion without delaying or starting navigation', async () => {
  const p = page();
  let finish;
  const finished = new Promise(resolve => { finish = resolve; });
  p.reveal({viewTransition: {ready: Promise.resolve(), finished, skipTransition: () => assert.fail('normal motion should run')}});
  assert.equal(p.dataset.viewTransition, 'running');
  finish();
  await finished;
  assert.equal(p.dataset.viewTransition, 'idle');
});

test('reduced motion skips an incoming native animation and returns to idle', async () => {
  const p = page(true);
  let skipped = 0;
  const finished = Promise.resolve();
  p.reveal({viewTransition: {ready: Promise.resolve(), finished, skipTransition: () => { skipped++; }}});
  await finished;
  assert.equal(skipped, 1);
  assert.equal(p.dataset.viewTransition, 'idle');
});

test('a skipped incoming transition handles ready rejection while navigation finishes', async () => {
  const p = page(true);
  let skip;
  const ready = new Promise((_, reject) => { skip = reject; });
  const finished = Promise.resolve();
  p.reveal({viewTransition: {
    ready, finished,
    skipTransition: () => skip(new DOMException('Transition was skipped', 'AbortError')),
  }});
  await finished;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(p.dataset.viewTransition, 'idle');
});

test('hiding the outgoing page handles its separate ready rejection', async () => {
  const p = page();
  assert.equal(typeof p.swap, 'function');
  const ready = Promise.reject(new DOMException('Transition was skipped', 'AbortError'));
  p.swap({viewTransition: {ready}});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(p.dataset.viewTransition, 'idle');
});
