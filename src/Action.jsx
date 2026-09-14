import React from 'react';

// Only the inner layer moves; native links, buttons and their hit areas stay put.
export function Action({as: Element = 'a', className = '', children, ...props}) {
  return <Element {...props} className={`link pointer-action ${className}`} data-pointer-feedback="action">
    <span className="action-content">{children}</span>
  </Element>;
}
