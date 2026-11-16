// Only public respondent URLs are allowed. Never embed a Sheet or an edit URL.
export function googleFormLinks(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || url.port || url.username || url.password) return null;
    if (!/^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(url.pathname)) return null;
    const direct = new URL(url.origin + url.pathname.replace(/\/$/, ''));
    const embedded = new URL(direct);
    embedded.searchParams.set('embedded', 'true');
    return {direct: direct.href, embedded: embedded.href};
  } catch { return null; }
}
