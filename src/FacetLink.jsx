import {ArrowIcon} from './ArrowIcon.jsx';
// The build's JSX URL transform uses this binding for deployment base paths.
import {siteUrl} from './site-url.js';

// One compact navigation label shared by the desktop and mobile facets.
export function FacetLink({item, index, visible, mobile = false}) {
  const title = item.id === 'team' ? 'Team' : item.id === 'contact' ? 'Contact' : item.title;
  const description = item.id === 'contact' ? item.title : item.text;

  return (
    <a
      className={`facet-link facet-link-${item.id}${mobile ? ' facet-link-mobile' : ''}`}
      href={`/${item.id}/`}
      data-facet-entry={item.id}
      tabIndex={visible ? 0 : -1}
    >
      <span className="facet-link-index" aria-hidden="true">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span className="facet-link-rule" />
      </span>
      <div className="facet-link-heading">
        <h2>{title}</h2>
        <span className="facet-link-arrow" aria-hidden="true"><ArrowIcon /></span>
      </div>
      <p>{description}</p>
    </a>
  );
}
