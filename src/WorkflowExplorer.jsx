import React, {useRef, useState} from 'react';
import {ArrowIcon} from './ArrowIcon.jsx';
import {workflowKeyIndex} from './inner-page-state.js';

export function WorkflowExplorer({story}) {
  const [{step, direction}, setSelection] = useState({step: 0, direction: 1});
  const controls = useRef(null);
  const choose = next => setSelection(current => next === current.step ? current : {step: next, direction: next > current.step ? 1 : -1});
  function onKeyDown(event, index) {
    const next = workflowKeyIndex(event.key, index, story.steps.length);
    if (next === null) return;
    event.preventDefault();
    choose(next);
    controls.current.querySelectorAll('button')[next].focus();
  }
  return <div className="workflow-layout p3-workflow" style={{'--step-direction': direction}}>
    <div className="workflow-controls" ref={controls} aria-label="Workflow steps" role="group" style={{'--active-step': step, '--step-count': story.steps.length}}>
      <span className="workflow-preview" aria-hidden="true"/>
      <span className="workflow-selection" aria-hidden="true"/>
      {story.steps.map((item, i) => <button type="button" key={item[0]} id={`workflow-step-${i}`} aria-pressed={step === i} aria-controls={`workflow-panel-${i}`} onClick={() => choose(i)} onKeyDown={event => onKeyDown(event, i)}>
        <span>{String(i + 1).padStart(2, '0')}</span><strong>{item[0]}</strong><span aria-hidden="true"><ArrowIcon/></span>
      </button>)}
    </div>
    <div className="workflow-panel-stack">
      {story.steps.map((item, i) => <div key={item[0]} id={`workflow-panel-${i}`} className="workflow-panel" data-selected={step === i} role="region" aria-labelledby={`workflow-step-${i}`} aria-hidden={step !== i} inert={step !== i}>
        <div className="workflow-panel-copy">
          <div className="workflow-panel-index"><p className="eyebrow">{item[0]}</p><span>{String(i + 1).padStart(2, '0')} <small>/ {String(story.steps.length).padStart(2, '0')}</small></span></div>
          <h3>{item[1]}</h3><p>{item[2]}</p>
          <div className="workflow-output"><span>{item[3]}</span><strong>{item[4]}</strong></div>
        </div>
      </div>)}
      <span className="sr-only" role="status">{story.steps[step][0]}: {story.steps[step][1]}</span>
    </div>
  </div>;
}
