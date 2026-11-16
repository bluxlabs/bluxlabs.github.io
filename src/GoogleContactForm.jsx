import React from 'react';
import {siteUrl} from './site-url.js';
import {Action} from './Action.jsx';
import {ArrowIcon} from './ArrowIcon.jsx';
import './google-contact.css';

export function GoogleContactForm({links}) {
  return <div className="google-contact" id="contact-form">
    <div className="contact-form-shell"><iframe className="google-contact-frame" src={links.embedded} title="Blux contact inquiry form" referrerPolicy="strict-origin-when-cross-origin">Open the form using the link below.</iframe></div>
    <div className="google-contact-support">
      <Action href={links.direct} target="_blank" rel="noopener noreferrer">Open form in a new tab <ArrowIcon/></Action>
      <p className="google-contact-help">If the form does not load, open it in a new tab. After submitting, wait for the confirmation inside the form.</p>
      <p className="contact-privacy">Google hosts this form. Blux uses your contact details and message to respond to your inquiry. Please do not include sensitive personal or research data.</p>
    </div>
  </div>;
}

export function GoogleContactPage({links,onWeChat}) {
  return <section id="contact" className="contact-form-page">
    <div className="contact-page-heading"><p className="eyebrow">Research · Collaboration · Questions</p><h1>Contact <span>Blux.</span></h1><p>Tell us what you’re working on.</p></div>
    <div className="contact-form-layout">
      <GoogleContactForm links={links}/>
      <aside className="contact-secondary" aria-label="Other ways to connect">
        <div className="contact-direct"><p className="eyebrow">Prefer a conversation?</p><h2>Let’s connect.</h2><p>For labs, collaborators, and people asking what comes next.</p><a className="contact-email" href="mailto:sol@bluxlabs.com">sol@bluxlabs.com</a><Action as="button" className="wechat-entry" aria-haspopup="dialog" onClick={onWeChat}>WeChat <ArrowIcon/></Action></div>
        <div className="contact-share"><img src="/assets/contact/blux-contact-qr.svg" width="144" height="144" alt="QR code for bluxlabs.com/contact/"/><div><h3>Share this page</h3><p>Scan to open the contact form.</p><Action href="/assets/contact/blux-contact-qr.png" download="Blux-Contact-QR.png">Download QR code <span aria-hidden="true">↓</span></Action></div></div>
      </aside>
    </div>
  </section>;
}
