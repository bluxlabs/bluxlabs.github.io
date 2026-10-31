import React from 'react';
import {Action} from './Action.jsx';
import {ArrowIcon} from './ArrowIcon.jsx';
import {witnessLayers} from './witness.js';
import {siteUrl} from './site-url.js';
import './witness.css';

export function WitnessLayers({detailed = false}) {
  return <section className={'witness-layers' + (detailed ? ' witness-layers-detailed' : '')} id="hardware-layers" aria-labelledby="hardware-layers-title">
    <div className="witness-section-heading">
      <div><p className="eyebrow">Inside Witness Rig</p><h2 id="hardware-layers-title">One physical setup.<br/>Three connected layers.</h2></div>
      <p>Structure, experimental space and acquisition each have a defined role.</p>
    </div>
    <div className="witness-layer-grid">
      {witnessLayers.map((layer, i) => <article className="witness-layer reveal" id={detailed ? layer.id : undefined} key={layer.id}>
        <figure><img src={layer.image} alt={layer.alt} width="1600" height="1100" loading="lazy" decoding="async"/><figcaption>{layer.caption}</figcaption></figure>
        <div className="witness-layer-copy"><p className="eyebrow"><span>0{i + 1}</span> {layer.label}</p><h3>{layer.name}</h3><p>{layer.summary}</p>
          {detailed ? <p>{layer.detail}</p> : <Action href={'/products/witness-rig/#' + layer.id}>Explore {layer.name.replace('Witness ', '')} <ArrowIcon/></Action>}
        </div>
      </article>)}
    </div>
    <p className="witness-render-note">Images rendered from the Witness 3D assembly model. Shown configuration is illustrative; the system remains in development.</p>
  </section>;
}

function WitnessMap() {
  return <section className="witness-architecture" id="architecture" aria-labelledby="witness-architecture-title">
    <div className="witness-section-heading"><div><p className="eyebrow">System architecture</p><h2 id="witness-architecture-title">Software and hardware.<br/>One Witness System.</h2></div><p>Follow the computation in Engine.<br/>Explore the physical experiment in Rig.</p></div>
    <div className="witness-tree">
      <div className="witness-tree-root"><span>Witness System</span><small>The complete system</small></div>
      <ul className="witness-branches">
        <li className="witness-branch"><a className="witness-branch-head" href="/products/witness-engine/"><span className="eyebrow">Software layer</span><h3>Witness Engine</h3><p>Computation &amp; algorithms</p><ArrowIcon/></a><p className="witness-branch-note">From experimental recordings to subject-focused data, 3D reconstruction and interactive review.</p></li>
        <li className="witness-branch"><a className="witness-branch-head" href="/products/witness-rig/"><span className="eyebrow">Hardware layer</span><h3>Witness Rig</h3><p>Physical setup &amp; environment</p><ArrowIcon/></a>
          <ul className="witness-tree-leaves">{witnessLayers.map(layer => <li key={layer.id}><a href={'/products/witness-rig/#' + layer.id}><strong>{layer.name}</strong><span>{layer.label}</span><ArrowIcon/></a></li>)}</ul>
        </li>
      </ul>
    </div>
  </section>;
}

export function WitnessSystemExperience() {
  return <div className="witness-system">
    <section className="witness-hero">
      <div className="witness-hero-copy"><p className="eyebrow">Behavioral research / In development</p><h1>Witness System</h1><h2>The experiment,<br/><span>connected.</span></h2><p className="witness-deck">The software that interprets the experiment. The hardware that makes it observable. Witness brings both into one system for behavioral research.</p><div className="witness-hero-actions"><Action href="#architecture">Explore the system <span>↓</span></Action><Action href="/contact/">Discuss your experiment <ArrowIcon/></Action></div></div>
      <figure className="witness-hero-image"><img src="/assets/products/witness/overview.webp" alt="Full 3D model render of Witness Rig: modular frame, central glass arena and surrounding camera mounts." width="1400" height="1600" fetchPriority="high"/><figcaption>Witness Rig · Full assembly model render</figcaption></figure>
    </section>
    <WitnessMap/>
    <section className="witness-engine-section" id="engine" aria-labelledby="witness-engine-title">
      <div className="witness-engine-copy"><p className="eyebrow">Software / Witness Engine</p><h2 id="witness-engine-title">Give recordings<br/>a spatial context.</h2><p>Witness Engine is the computational and algorithmic core. Its digital-twin workflow connects experimental recordings, subject extraction and animated 3D reconstruction for interactive review.</p><ul><li>Prepare subject masks and keypoint annotations.</li><li>Reconstruct movement within the experimental scene.</li><li>Replay the experiment from different viewpoints.</li></ul><Action href="/products/witness-engine/">Explore Witness Engine <ArrowIcon/></Action></div>
      <figure><img src="/assets/products/digital-twin.webp" alt="Existing digital-twin prototype scene showing the camera rig and an animal representation." loading="lazy" decoding="async"/><figcaption>Witness Engine · Digital-twin prototype scene</figcaption></figure>
    </section>
    <WitnessLayers/>
    <section className="witness-next"><div><p className="eyebrow">Prototype development</p><h2>Build around your<br/>research question.</h2><p>Hardware configuration and software workflows are being developed and tested. Talk with us about your arena, recording requirements and analysis needs.</p></div><Action href="/contact/">Talk with Blux <ArrowIcon/></Action></section>
  </div>;
}
