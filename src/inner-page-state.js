export function workflowKeyIndex(key, index, count) {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowDown' || key === 'ArrowRight') return (index + 1) % count;
  if (key === 'ArrowUp' || key === 'ArrowLeft') return (index - 1 + count) % count;
  return null;
}

export function readingPosition(rect, viewportHeight, readingLine) {
  if (rect.height <= 0) return 0;
  const travel = rect.height - (viewportHeight - readingLine);
  if (travel <= 0) return rect.top <= readingLine ? 1 : 0;
  return Math.max(0, Math.min(1, (readingLine - rect.top) / travel));
}
