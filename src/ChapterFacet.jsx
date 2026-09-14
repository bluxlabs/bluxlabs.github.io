import React from 'react';
import facets from './brand-facets.json';

// A cropped original Blux logo facet supplies the editorial direction.
export function ChapterFacet() {
  return <svg className="chapter-facet" viewBox="0 0 1000 900" aria-hidden="true" focusable="false">
    <path d={facets[0].d} fill="currentColor"/>
    <path d={facets[4].d} fill="currentColor" opacity=".28"/>
  </svg>;
}
