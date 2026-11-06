import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store-context';

export type ClarifyMode = 'action' | 'project' | 'waiting' | 'someday';

interface Props {
  inboxId: string;
  text: string;
  mode: ClarifyMode;
  onDone: () => void;
}

const MODE_LABEL: Record<ClarifyMode, string> = {
  action: 'Next action',
  project: 'Project',
  waiting: 'Waiting for',
  someday: 'Someday / maybe',
};

/** The clarify step: every path out of the inbox is one form, so nothing gets stranded. */
export default function ClarifyPanel({ inboxId, text, mode, onDone }: Props) {
  const store = useStore();
  const [title, setTitle] = useState(text);
  const [context, setContext] = useState(store.state.contexts[0] ?? '@computer');
  const [projectId, setProjectId] = useState('');
  const [outcome, setOutcome] = useState('');
  const [firstAction, setFirstAction] = useState('');
  const [person, setPerson] = useState('');
  const [note, setNote] = useState('');

  const active = store.state.projects.filter((p) => p.status === 'active');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (mode === 'action') {
      store.clarifyNextAction(inboxId, { title, context, projectId: projectId || null });
    } else if (mode === 'project') {
      store.clarifyProject(inboxId, { title, outcome, firstActionTitle: firstAction, context });
    } else if (mode === 'waiting') {
      store.clarifyWaiting(inboxId, { title, person });
    } else {
      store.clarifySomeday(inboxId, title, note);
    }
    onDone();
  }

  return (
    <form className="panel" onSubmit={submit}>
      <p className="panel-head">{MODE_LABEL[mode]}</p>

      <label className="field">
        <span>{mode === 'project' ? 'Project name' : 'What exactly'}</span>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </label>

      {mode === 'action' && (
        <>
          <label className="field">
            <span>Context</span>
            <select className="input" value={context} onChange={(e) => setContext(e.target.value)}>
              {store.state.contexts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Project (optional)</span>
            <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">— none —</option>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {mode === 'project' && (
        <>
          <label className="field">
            <span>Successful outcome</span>
            <input
              className="input"
              value={outcome}
              placeholder="What is true when this is done?"
              onChange={(e) => setOutcome(e.target.value)}
            />
          </label>
          <label className="field">
            <span>First action (optional)</span>
            <input
              className="input"
              value={firstAction}
              placeholder="The very next physical step"
              onChange={(e) => setFirstAction(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Context for that action</span>
            <select className="input" value={context} onChange={(e) => setContext(e.target.value)}>
              {store.state.contexts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {mode === 'waiting' && (
        <label className="field">
          <span>Who owes it</span>
          <input
            className="input"
            value={person}
            placeholder="Name"
            onChange={(e) => setPerson(e.target.value)}
          />
        </label>
      )}

      {mode === 'someday' && (
        <label className="field">
          <span>Note (optional)</span>
          <input
            className="input"
            value={note}
            placeholder="Why it is parked"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      )}

      <div className="btn-row">
        <button type="submit" className="btn primary small">
          File it
        </button>
        <button type="button" className="btn tiny ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
