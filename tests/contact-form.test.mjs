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
