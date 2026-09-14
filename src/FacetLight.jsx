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
