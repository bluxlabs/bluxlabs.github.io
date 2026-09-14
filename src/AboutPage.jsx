import React from 'react';
import {siteUrl} from './site-url.js';
import {Action} from './Action.jsx';
import {ArrowIcon} from './ArrowIcon.jsx';
import {ChapterFacet} from './ChapterFacet.jsx';
import {products} from './products.js';

const productUrl = product => '/products/' + product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';

export function AboutPage() {
  const instrument = products[0];
  return <section id="about" className="about-page">
    <div className="about-hero">
      <div className="about-hero-copy">
        <p className="section-label">Company / About Blux</p>
        <h1>Instruments<br/>and software<br/><span>for neuroscience.</span></h1>
        <p className="about-deck">Blux is a neurotechnology company developing tools for neuroscience labs in universities and pharma, helping researchers study brain activity and behavior.</p>
        <div className="about-actions">
          <Action className="about-primary" href="/products/">Explore our products <ArrowIcon/></Action>
          <Action href="/team/">Meet the team <ArrowIcon/></Action>
        </div>
      </div>
      <figure className="about-instrument">
        <a className="about-instrument-link observation-window" data-pointer-feedback="image" href={productUrl(instrument)} aria-label={`Explore ${instrument.name}`}>
          <div className="about-instrument-image"><img src={instrument.media.src} alt={instrument.media.alt} width="1254" height="1254" decoding="async"/></div>
          <div className="about-instrument-caption"><div><span>{instrument.stage}</span><strong>{instrument.name}</strong></div><ArrowIcon/></div>
        </a>
        <figcaption>{instrument.media.caption}</figcaption>
      </figure>
    </div>

    <section className="about-building" aria-labelledby="about-building-title">
      <div className="about-section-heading"><div><p className="eyebrow">Our work today</p><h2 id="about-building-title">What we’re building.</h2></div><p>Four research tools,<br/> all in development.</p></div>
      <div className="about-tool-band">
        {products.map(product => <a className="about-tool-link" key={product.name} href={productUrl(product)}>
          <span className="about-tool-index">{product.category.split(' / ')[0]}<ArrowIcon/></span>
          <h3>{product.category.split(' / ')[1]}</h3>
          <p>{product.name}</p>
          <span className="about-tool-stage">{product.stage}</span>
        </a>)}
      </div>
    </section>

    <section className="about-purpose" aria-label="Our purpose and direction">
      <div className="about-purpose-now">
        <p className="eyebrow">Why we build</p>
        <h2>More time<br/>for research.</h2>
        <p>We want to make experiments easier to repeat and results easier to build on.</p>
        <p>Our work brings measurement, recording and analysis together, with research agents helping reduce the operational work between a question and its evidence.</p>
      </div>
      <div className="about-purpose-next">
        <ChapterFacet/>
        <p className="eyebrow">Our long-term direction</p>
        <h2>Beyond today’s<br/>instruments.</h2>
        <p>Our mission is to accelerate brain research and safely increase the bandwidth between the brain, computers and the world.</p>
        <p>We see today’s instruments as a starting point toward whole-brain interfaces—a long-term research direction.</p>
        <Action href="/statements/">Read our perspectives <ArrowIcon/></Action>
      </div>
    </section>
  </section>;
}
