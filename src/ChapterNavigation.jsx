import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {siteUrl} from './site-url.js';

export function ChapterNavigation({hasDemo}) {
  const chapters = [
    ['research-context', 'Research context'],
    ['workflow', 'Workflow'],
    ...(hasDemo ? [['demonstration', 'Demonstration']] : []),
    ['development', 'Development'],
  ];
  const navigation = useRef(null);
  const [active, setActive] = useState(chapters[0][0]);
  const [marker, setMarker] = useState({left: 0, width: 0});

  useEffect(() => {
    const nav = navigation.current;
    const header = document.querySelector('header');
    const sections = chapters.map(([id]) => document.getElementById(id)).filter(Boolean);
    let frame = 0;

    function measure() {
      const headerHeight = Math.ceil(header?.getBoundingClientRect().height || 84);
      const navHeight = Math.ceil(nav.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--site-header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--chapter-nav-height', `${navHeight}px`);
      const readingLine = headerHeight + navHeight + 48;
      let current = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section.id;
      }
      if (current) setActive(current);
    }

    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(nav);
    if (header) resize.observe(header);
    window.addEventListener('scroll', scheduleMeasure, {passive: true});
    window.addEventListener('resize', scheduleMeasure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      document.documentElement.style.removeProperty('--chapter-nav-height');
    };
  }, [hasDemo]);

  useLayoutEffect(() => {
    const nav = navigation.current;
    function positionMarker() {
      const link = nav.querySelector('[aria-current="location"]');
      if (link) setMarker({left: link.offsetLeft, width: link.offsetWidth});
    }
    const resize = new ResizeObserver(positionMarker);
    resize.observe(nav);
    positionMarker();
    return () => resize.disconnect();
  }, [active]);

  return <nav className="product-chapters" aria-label="On this product page" ref={navigation}>
    <span className="chapter-marker" aria-hidden="true" style={{width: marker.width, transform: `translateX(${marker.left}px)`}} />
    {chapters.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{label}</a>)}
  </nav>;
}
