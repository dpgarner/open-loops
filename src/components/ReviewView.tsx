import { useState } from 'react';
import type { Tab } from '../types';
import { useStore } from '../store';
import { activeProjects, daysSince, formatDate, isStuck, nextActionFor } from '../selectors';
import ClarifyPanel, { type ClarifyMode } from './ClarifyPanel';
import NextActionForm from './NextActionForm';

const STEPS = [
  { label: 'Get clear', hint: 'Empty the inbox — decide every item.' },
  { label: 'Get current', hint: 'Every active project has a next action, and nothing waiting has gone quiet.' },
  { label: 'Get creative', hint: 'What is emerging that is not on a list yet?' },
  { label: 'Wrap up', hint: 'Look at the whole system, then log the review.' },
];

export default function ReviewView({ onGoTo }: { onGoTo: (tab: Tab) => void }) {
  const store = useStore();
  const { state } = store;
  const [step, setStep] = useState(0);
  const [clarify, setClarify] = useState<{ id: string; mode: ClarifyMode } | null>(null);
  const [idea, setIdea] = useState('');
  const [logged, setLogged] = useState(false);

  const projects = activeProjects(state);
  const stuck = projects.filter((p) => isStuck(state, p.id));
  const openCount = state.actions.filter((a) => !a.done).length;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="stack">
      <div className="review-top card">
        <div className="steps" role="tablist" aria-label="Review steps">
          {STEPS.map((s, index) => (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={index === step}
              className={`step${index === step ? ' on' : ''}${index < step ? ' past' : ''}`}
              onClick={() => setStep(index)}
            >
              <span className="step-num">{index + 1}</span>
              {s.label}
            </button>
          ))}
        </div>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="meta">
          Step {step + 1} of {STEPS.length} — {STEPS[step].hint}
        </p>
      </div>

      {step === 0 && (
        <section className="group">
          <h2 className="group-head">
            Inbox <span className="meta">{state.inbox.length} to decide</span>
          </h2>
          {state.inbox.length === 0 ? (
            <p className="ok">Inbox is clear — the first box is ticked.</p>
          ) : (
            <ul className="rows tight">
              {state.inbox.map((item) => {
                const mode = clarify && clarify.id === item.id ? clarify.mode : null;
                return (
                  <li key={item.id} className="row card">
                    <div className="item-main">
                      <span className="item-title">{item.text}</span>
                    </div>
                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() => setClarify({ id: item.id, mode: 'action' })}
                      >
                        Next action
                      </button>
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() => setClarify({ id: item.id, mode: 'someday' })}
                      >
                        Someday
                      </button>
                      <button
                        type="button"
                        className="btn tiny ghost"
                        onClick={() => store.handleInbox(item.id)}
                      >
                        Handled
                      </button>
                      <button
                        type="button"
                        className="btn tiny ghost danger-text"
                        onClick={() => store.trashInbox(item.id)}
                      >
                        Trash
                      </button>
                    </div>
                    {mode && (
                      <ClarifyPanel
                        inboxId={item.id}
                        text={item.text}
                        mode={mode}
                        onDone={() => setClarify(null)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {step === 1 && (
        <>
          <section className="group">
            <h2 className="group-head">
              Projects <span className="meta">{projects.length} active, {stuck.length} stuck</span>
            </h2>
            {projects.length === 0 ? (
              <p className="meta">No active projects.</p>
            ) : (
              <ul className="rows tight">
                {projects.map((project) => {
                  const next = nextActionFor(state, project.id);
                  return (
                    <li key={project.id} className={`row card${isStuck(state, project.id) ? ' stuck' : ''}`}>
                      <div className="item-main">
                        <span className="item-title">{project.title}</span>
                        <span className="meta">
                          {next ? `Next: ${next.title}` : 'No next action — stuck'}
                        </span>
                      </div>
                      {!next && <NextActionForm projectId={project.id} placeholder="Define the next action" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="group">
            <h2 className="group-head">
              Waiting for <span className="meta">{state.waiting.length}</span>
            </h2>
            {state.waiting.length === 0 ? (
              <p className="ok">Nobody owes you anything recorded — is that true?</p>
            ) : (
              <ul className="rows tight">
                {state.waiting.map((item) => (
                  <li key={item.id} className="row card">
                    <div className="item-main">
                      <span className="item-title">{item.title}</span>
                      <span className={`meta${daysSince(item.since) >= 7 ? ' late' : ''}`}>
                        {item.person} · {daysSince(item.since)} days
                      </span>
                    </div>
                    <button type="button" className="btn tiny" onClick={() => store.receiveWaiting(item.id)}>
                      Received
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="group">
            <h2 className="group-head">
              Someday / maybe <span className="meta">{state.someday.length} parked</span>
            </h2>
            <p className="meta">Anything still pulling at you should move to the inbox — do that in the Someday list.</p>
            <button type="button" className="btn tiny" onClick={() => onGoTo('someday')}>
              Open someday / maybe
            </button>
          </section>
        </>
      )}

      {step === 2 && (
        <section className="group">
          <h2 className="group-head">Get creative</h2>
          <ul className="prompts">
            <li>What is working that you want more of?</li>
            <li>What has quietly stopped mattering?</li>
            <li>What would make next week feel light?</li>
            <li>What are you avoiding, and what is the first step?</li>
          </ul>
          <textarea
            className="input area"
            rows={5}
            value={idea}
            placeholder="Anything that surfaces — dump it here, then file it."
            onChange={(e) => setIdea(e.target.value)}
          />
          <div className="btn-row">
            <button
              type="button"
              className="btn primary small"
              onClick={() => {
                store.capture(idea);
                setIdea('');
              }}
            >
              Capture to inbox
            </button>
            <button
              type="button"
              className="btn small"
              onClick={() => {
                store.addSomeday(idea, 'From the weekly review');
                setIdea('');
              }}
            >
              Park as someday
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="group">
          <h2 className="group-head">Wrap up</h2>
          <div className="summary">
            <div>
              <strong>{state.inbox.length}</strong>
              <span>in inbox</span>
            </div>
            <div>
              <strong>{openCount}</strong>
              <span>open actions</span>
            </div>
            <div>
              <strong>{projects.length}</strong>
              <span>active projects</span>
            </div>
            <div className={stuck.length ? 'bad' : ''}>
              <strong>{stuck.length}</strong>
              <span>stuck projects</span>
            </div>
            <div>
              <strong>{state.waiting.length}</strong>
              <span>waiting for</span>
            </div>
            <div>
              <strong>{state.someday.length}</strong>
              <span>parked ideas</span>
            </div>
          </div>

          <p className="meta">Previous review: {formatDate(state.lastReview)}</p>

          <button
            type="button"
            className="btn primary"
            onClick={() => {
              store.completeReview();
              setLogged(true);
            }}
          >
            Complete the review
          </button>

          {logged && (
            <p className="ok">
              Review logged for {formatDate(store.state.lastReview)}. The nag clears for seven days.
            </p>
          )}
        </section>
      )}

      <div className="btn-row review-nav">
        <button
          type="button"
          className="btn small"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="btn primary small"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
