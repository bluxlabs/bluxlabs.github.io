import assert from 'node:assert/strict';
import test from 'node:test';
import {workflowKeyIndex, readingPosition} from '../src/inner-page-state.js';

test('workflow keyboard selection wraps and supports first and last steps', () => {
  assert.equal(workflowKeyIndex('ArrowRight', 2, 3), 0);
  assert.equal(workflowKeyIndex('ArrowUp', 0, 3), 2);
  assert.equal(workflowKeyIndex('End', 0, 3), 2);
  assert.equal(workflowKeyIndex('Home', 2, 3), 0);
  assert.equal(workflowKeyIndex('Tab', 1, 3), null);
  assert.equal(workflowKeyIndex('ArrowLeft', 0, 1), 0);
});

test('reading progress begins at the reading line and completes when the bottom is visible', () => {
  assert.equal(readingPosition({top: 500, height: 2000}, 900, 140), 0);
  assert.equal(readingPosition({top: 140, height: 2000}, 900, 140), 0);
  assert.equal(readingPosition({top: -480, height: 2000}, 900, 140), .5);
  assert.equal(readingPosition({top: -1100, height: 2000}, 900, 140), 1);
  assert.equal(readingPosition({top: -1700, height: 2000}, 900, 140), 1);
});

test('short or absent reading areas never create invalid progress', () => {
  assert.equal(readingPosition({top: 150, height: 300}, 900, 140), 0);
  assert.equal(readingPosition({top: 140, height: 300}, 900, 140), 1);
  assert.equal(readingPosition({top: 0, height: 0}, 900, 140), 0);
});
