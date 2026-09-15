// Original logo geometry, with a shared optical surface and a single edge reveal.
export function FacetLightDefinitions({id}) {
  return <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stopColor="#76dfff" />
      <stop offset="48%" stopColor="#35bbed" />
      <stop offset="100%" stopColor="#16a1e3" />
    </linearGradient>
  </defs>;
}

export function FacetLight({shape, transform, gradient}) {
  return <g className="facet-light" transform={transform} aria-hidden="true">
    <path d={shape} fill={`url(#${gradient})`} />
    <path className="facet-light-edge" d={shape} fill="none" stroke="#bdf4ff"
      strokeWidth="1.2" vectorEffect="non-scaling-stroke" pathLength="100" />
  </g>;
}

// A bounded HTML layer lets opacity composite without repainting the full opening SVG.
// These planes only light up after the original unfolding paths reach their destinations.
export function DesktopFacetLight({item, source, transform}) {
  const padding = 8;
  const x = Math.min(...item.points.map(p => p[0])) - padding;
  const y = Math.min(...item.points.map(p => p[1])) - padding;
  const width = Math.max(...item.points.map(p => p[0])) - x + padding;
  const height = Math.max(...item.points.map(p => p[1])) - y + padding;
  const gradient = `facet-light-plane-${item.id}`;
  return <div data-facet-light={item.id} className="facet-light-slot" aria-hidden="true"
    style={{left:`${x / 1122 * 100}%`,top:`${y / 1402 * 100}%`,width:`${width / 1122 * 100}%`,height:`${height / 1402 * 100}%`}}>
    <div className="facet-light facet-light-desktop">
      <svg viewBox={`${x} ${y} ${width} ${height}`} preserveAspectRatio="none">
        <FacetLightDefinitions id={gradient}/>
        <g transform={transform}>
          <path d={source.d} fill={`url(#${gradient})`}/>
          <path className="facet-light-edge" d={source.d} fill="none" stroke="#bdf4ff" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/>
        </g>
      </svg>
    </div>
  </div>;
}
