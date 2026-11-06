import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store';

export default function NextActionsView() {
  const store = useStore();
  const { state } = store;
  const [title, setTitle] = useState('');
  const [context, setContext] = useState(state.contexts[0] ?? '@computer');
  const [projectId, setProjectId] = useState('');
  const [newContext, setNewContext] = useState('');
  const [showDone, setShowDone] = useState(false);

  const activeProjects = state.projects.filter((p) => p.status === 'active');
  const projectName = (id: string | null) =>
    id ? state.projects.find((p) => p.id === id)?.title ?? null : null;

  const contexts = state.contexts.filter((c) =>
    state.actions.some((a) => a.context === c && (showDone || !a.done)),
  );
  const done = state.actions.filter((a) => a.done);

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    store.addAction({ title, context, projectId: projectId || null });
    setTitle('');
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
          {activeProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
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
        const items = state.actions.filter((a) => a.context === c && (showDone || !a.done));
        return (
          <section key={c} className="group">
            <h2 className="group-head">
              {c} <span className="meta">{items.filter((a) => !a.done).length} open</span>
            </h2>
            <ul className="rows tight">
              {items.map((a) => (
                <li key={a.id} className={`row card${a.done ? ' done' : ''}`}>
                  <label className="check">
                    <input type="checkbox" checked={a.done} onChange={() => store.toggleAction(a.id)} />
                    <span className="item-title">{a.title}</span>
                  </label>
                  <div className="item-side">
                    {projectName(a.projectId) && <span className="chip">{projectName(a.projectId)}</span>}
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

      {showDone && done.length > 0 && (
        <p className="meta">{done.length} completed action{done.length === 1 ? '' : 's'} shown above.</p>
      )}
    </div>
  );
}
