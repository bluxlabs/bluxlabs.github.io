import React, {useEffect, useRef, useState} from 'react';
import {siteUrl} from './site-url.js';
import {readingPosition} from './inner-page-state.js';

export function ReadingProgress({index}) {
  const ref = useRef(null);
  const [active, setActive] = useState('article-opening');
  useEffect(() => {
    const rail = ref.current;
    const article = document.getElementById('article-reading');
    const header = document.querySelector('header');
    const perspective = document.getElementById('article-perspective');
    const related = document.getElementById('article-more');
    let frame = 0;
    function measure() {
      frame = 0;
      const line = (header?.getBoundingClientRect().height || 84) + 64;
      const progress = readingPosition(article.getBoundingClientRect(), innerHeight, line);
      rail.style.setProperty('--reading-progress', progress);
      rail.dataset.progress = Math.round(progress * 100);
      // Include the anchor's breathing room above the reading line.
      const current = related.getBoundingClientRect().top <= innerHeight * .75 ? 'article-more' : perspective.getBoundingClientRect().top <= line + 12 ? 'article-perspective' : 'article-opening';
      setActive(current);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
    const resize = new ResizeObserver(schedule);
    resize.observe(article);
    if (header) resize.observe(header);
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', schedule);
    measure();
    return () => {cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('scroll', schedule); removeEventListener('resize', schedule);};
  }, []);
  return <nav className="reading-rail" ref={ref} aria-label="On this statement">
    <p className="eyebrow">Statement / {index}</p>
    <span className="reading-meter" aria-hidden="true"><span/></span>
    {[['article-opening', 'Opening'], ['article-perspective', 'Perspective'], ['article-more', 'Explore more']].map(([id, title]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{title}</a>)}
  </nav>;
}
