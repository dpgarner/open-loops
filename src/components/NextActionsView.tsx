import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store-context';
import { availableActions, deferredActions, dueLabel, formatDay } from '../selectors';
import TicklerControl from './TicklerControl';

export default function NextActionsView() {
  const store = useStore();
  const { state } = store;
  const [title, setTitle] = useState('');
  const [context, setContext] = useState(state.contexts[0] ?? '@computer');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState('');
  const [newContext, setNewContext] = useState('');
  const [showDone, setShowDone] = useState(false);

  const activeList = state.projects.filter((p) => p.status === 'active');
  const available = availableActions(state);
  const deferred = [...deferredActions(state)].sort((a, b) =>
    (a.ticklerDate ?? '') < (b.ticklerDate ?? '') ? -1 : 1,
  );
  const done = state.actions.filter((a) => a.done);
  const projectName = (id: string | null) =>
    id ? state.projects.find((p) => p.id === id)?.title ?? null : null;
  const contexts = state.contexts.filter((c) => available.some((a) => a.context === c));

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    store.addAction({ title, context, projectId: projectId || null, ticklerDate: date || null });
    setTitle('');
    setDate('');
  }

  return (
    <div className="stack">
      <form className="form-row card" onSubmit={add}>
        <input
          className="input grow"
          value={title}
          placeholder="Add a next action — one physical step"
          onChange={(e) => setTitle(e.target.value)}
        />
        <select className="select" value={context} onChange={(e) => setContext(e.target.value)}>
          {state.contexts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">— no project —</option>
          {activeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input date"
          value={date}
          aria-label="Resurface on"
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit" className="btn primary small">
          Add
        </button>
      </form>

      <div className="form-row plain">
        <input
          className="input"
          value={newContext}
          placeholder="New context, e.g. @workshop"
          onChange={(e) => setNewContext(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            store.addContext(newContext);
            setNewContext('');
          }}
        />
        <button
          type="button"
          className="btn tiny"
          onClick={() => {
            store.addContext(newContext);
            setNewContext('');
          }}
        >
          Add context
        </button>
        <label className="toggle">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Show completed
        </label>
      </div>

      {contexts.length === 0 && (
        <div className="empty">
          <h2>No open actions</h2>
          <p>Add one above, or clarify something out of the inbox.</p>
        </div>
      )}

      {contexts.map((c) => {
        const items = available.filter((a) => a.context === c);
        return (
          <section key={c} className="group">
            <h2 className="group-head">
              {c} <span className="meta">{items.length} open</span>
            </h2>
            <ul className="rows tight">
              {items.map((a) => (
                <li key={a.id} className="row card">
                  <label className="check">
                    <input type="checkbox" checked={false} onChange={() => store.toggleAction(a.id)} />
                    <span className="item-title">{a.title}</span>
                  </label>
                  <div className="item-side">
                    {projectName(a.projectId) && <span className="chip">{projectName(a.projectId)}</span>}
                    <TicklerControl date={a.ticklerDate} onChange={(d) => store.setActionDate(a.id, d)} />
                    <button
                      type="button"
                      className="btn tiny ghost"
                      title="Delete action"
                      onClick={() => store.deleteAction(a.id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {deferred.length > 0 && (
        <section className="group">
          <h2 className="group-head">
            Deferred <span className="meta">{deferred.length}</span>
          </h2>
          <p className="meta">
            Dated actions stay out of their context list until their day, then come back on their own.
          </p>
          <ul className="rows tight">
            {deferred.map((a) => (
              <li key={a.id} className="row card">
                <label className="check">
                  <input type="checkbox" checked={false} onChange={() => store.toggleAction(a.id)} />
                  <span className="item-title">{a.title}</span>
                  <span className="chip">{a.context}</span>
                </label>
                <div className="item-side">
                  <span className="meta">
                    resurfaces {formatDay(a.ticklerDate ?? '')} · {dueLabel(a.ticklerDate ?? '')}
                  </span>
                  <TicklerControl date={a.ticklerDate} onChange={(d) => store.setActionDate(a.id, d)} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showDone && done.length > 0 && (
        <section className="group">
          <h2 className="group-head">
            Completed <span className="meta">{done.length}</span>
          </h2>
          <ul className="rows tight">
            {done.map((a) => (
              <li key={a.id} className="row card done">
                <label className="check">
                  <input type="checkbox" checked onChange={() => store.toggleAction(a.id)} />
                  <span className="item-title">{a.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
