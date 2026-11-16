import React from 'react';
import {Action} from './Action.jsx';
import {ArrowIcon} from './ArrowIcon.jsx';
import './google-contact.css';

export function GoogleContactForm({links}) {
  return <div className="google-contact">
    <div className="google-contact-intro">
      <p className="eyebrow">Contact Blux</p>
      <h2>Let’s start a conversation.</h2>
      <p>Tell us about your lab, your research, or a collaboration. Your response goes directly to the Blux team.</p>
      <p className="contact-privacy">Google hosts this form. Blux will use your contact details and message to respond to your inquiry. Please do not include sensitive personal or research data.</p>
      <Action href={links.direct} target="_blank" rel="noopener noreferrer">Open form in a new tab <ArrowIcon/></Action>
    </div>
    <iframe className="google-contact-frame" src={links.embedded} title="Blux contact inquiry form" referrerPolicy="strict-origin-when-cross-origin">Open the form using the link above.</iframe>
    <p className="google-contact-help">Wait for the confirmation inside the form after submitting. If it does not load here, use “Open form in a new tab” above.</p>
    <div className="contact-share">
      <img src="/assets/contact/blux-contact-qr.svg" width="144" height="144" alt="QR code for bluxlabs.com/contact/"/>
      <div><h3>Continue on your phone</h3><p>Scan to open this contact page.</p><Action href="/assets/contact/blux-contact-qr.png" download="Blux-Contact-QR.png">Download QR code <span aria-hidden="true">↓</span></Action></div>
    </div>
  </div>;
}
