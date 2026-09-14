import {Action} from './Action.jsx';
import {ChapterNavigation} from './ChapterNavigation.jsx';
import {ArrowIcon} from './ArrowIcon.jsx';
import {siteUrl,appPath} from './site-url.js';
import React from 'react';
import {WorkflowExplorer} from './WorkflowExplorer.jsx';
import {stories} from './product-stories.js';
import './product-experience.css';
export function ProductExperience({product:p,Demo}){
 const s=stories[p.name];
 return <div className={'product-experience experience-'+s.kind}>
 <section className="experience-hero"><div className="experience-intro"><p className="eyebrow">{s.label} / {p.stage}</p><h1>{p.name}</h1><h2>{s.headline}</h2><p className="experience-deck">{s.intro}</p><div className="experience-actions"><Action href="#workflow">Explore the workflow <span>↓</span></Action><Action href="/contact/">Discuss your research <span><ArrowIcon/></span></Action></div></div>
 {p.media?<figure className="experience-media"><a className="observation-window" data-pointer-feedback="image" href={p.media.src} target="_blank" rel="noreferrer" aria-label={'Open image: '+p.media.alt}><img src={p.media.src} alt={p.media.alt} decoding="async"/></a><figcaption>{p.media.caption}</figcaption></figure>:<div className="agent-diagram" aria-label="Workflow illustration: experimental files, context, processing tools, traceable outputs"><p className="eyebrow">Workflow illustration</p>{['Experimental files','Experimental context','Processing tools','Traceable outputs'].map((label,i)=><div className="agent-node" key={label}><span>0{i+1}</span><strong>{label}</strong>{i<3&&<span className="agent-connector" aria-hidden="true">↓</span>}</div>)}</div>}
 </section>
 <ChapterNavigation hasDemo={Boolean(Demo)}/>
 <section id="research-context" className="research-context"><p className="eyebrow">The research question</p><h2>{s.question}</h2><p>{s.context}</p></section>
 <section id="workflow" className="workflow-section"><div className="workflow-heading"><p className="eyebrow">In the experiment</p><h2>{s.kind==='arena'?'Configure around your task.':'A clearer path through the work.'}</h2><p>{s.kind==='imaging'?'The planned recording workflow.':s.kind==='arena'?'Three parts of the configurable platform.':'Explore the workflow, one step at a time.'}</p></div><WorkflowExplorer story={s}/></section>
 {Demo&&<section id="demonstration" className="product-demonstration"><Demo/></section>}
 <section className="product-difference"><div><p className="eyebrow">The approach</p><h2>{s.difference}</h2></div><div className="comparison"><div><span>Compared with</span><p>{s.comparison}</p></div><div><span>Blux’s approach</span><p>{s.approach}</p></div></div></section>
 <section id="development" className="development-note"><span className="stage">{p.stage}</span><div><h2>Where we are today.</h2><p>{s.stage}</p></div></section>
 <section className="product-inquiry"><p className="eyebrow">Your next experiment</p><h2>{s.cta}</h2><p>{s.prompt}</p><Action href="/contact/">Talk with Blux <span><ArrowIcon/></span></Action></section>
 </div>
}
