import assert from 'node:assert/strict';
import test from 'node:test';
import {googleFormLinks} from '../src/contact-form.js';

test('accepts only Google respondent forms and normalizes embedded parameters', () => {
  assert.deepEqual(googleFormLinks('https://docs.google.com/forms/d/e/EXAMPLE_123/viewform?usp=sharing#anchor'), {
    direct: 'https://docs.google.com/forms/d/e/EXAMPLE_123/viewform',
    embedded: 'https://docs.google.com/forms/d/e/EXAMPLE_123/viewform?embedded=true'
  });
  assert.ok(googleFormLinks('https://docs.google.com/forms/d/EXAMPLE/viewform'));
});
test('unconfigured or invalid inputs keep the existing safe fallback', () => {
  for (const value of ['', null, 'not-a-url', 'http://docs.google.com/forms/d/e/id/viewform', 'https://evil.example/forms/d/e/id/viewform', 'https://docs.google.com/spreadsheets/d/id/edit', 'https://docs.google.com/forms/d/e/id/edit', 'https://user@docs.google.com/forms/d/e/id/viewform', 'https://docs.google.com/forms/d/e/id/viewform/extra']) {
    assert.equal(googleFormLinks(value), null, String(value));
  }
});

test('contact form renders after the actual Vite base-link transform', async () => {
  // A successful bundle does not catch missing siteUrl bindings introduced by
  // the JSX baseLinks plugin. Exercise the transformed component at runtime.
  const {createServer} = await import('vite');
  const React = await import('react');
  const {renderToString} = await import('react-dom/server');
  const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  try {
    const {GoogleContactForm, GoogleContactPage} = await server.ssrLoadModule('/src/GoogleContactForm.jsx');
    const links = googleFormLinks('https://docs.google.com/forms/d/e/TEST_ONLY/viewform');
    const markup = renderToString(React.createElement(GoogleContactForm, {links}));
    assert.match(markup, /Blux contact inquiry form/);
    const page = renderToString(React.createElement(GoogleContactPage, {links, onWeChat:()=>{}}));
    assert.match(page, /blux-contact-qr\.svg/);
    assert.ok(page.indexOf('<iframe') < page.indexOf('contact-secondary'), 'Form precedes secondary links for mobile reading order');
    assert.ok(markup.indexOf('<iframe') < markup.indexOf('contact-privacy'), 'Form precedes supporting copy');
    assert.match(markup, /Open form in a new tab/);
    assert.doesNotMatch(markup, /spreadsheets\/d\//);
  } finally {
    await server.close();
  }
});
