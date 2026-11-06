import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store-context';
import { formatDate, isStuck, nextActionFor } from '../selectors';
import NextActionForm from './NextActionForm';

function ProjectCard({ id }: { id: string }) {
  const store = useStore();
  const [defining, setDefining] = useState(false);
  const project = store.state.projects.find((p) => p.id === id);

  if (!project) return null;

  const next = nextActionFor(store.state, id);
  const stuck = isStuck(store.state, id);

  return (
    <li className={`card project${stuck ? ' stuck' : ''}${project.status === 'completed' ? ' done' : ''}`}>
      <div className="item-main">
        <span className="item-title">{project.title}</span>
        {project.outcome && <span className="meta">{project.outcome}</span>}
      </div>

      {project.status === 'completed' ? (
        <p className="meta">Completed {formatDate(project.completedAt)}</p>
      ) : next ? (
        <label className="check">
          <input type="checkbox" checked={false} onChange={() => store.toggleAction(next.id)} />
          <span>{next.title}</span>
          <span className="chip">{next.context}</span>
        </label>
      ) : (
        <div className="stuck-note">
          <span>No next action — this project is stuck.</span>
          {!defining && (
            <button type="button" className="btn tiny" onClick={() => setDefining(true)}>
              Define the next action
            </button>
          )}
        </div>
      )}

      {defining && !next && <NextActionForm projectId={id} onDone={() => setDefining(false)} />}

      <div className="btn-row">
        {project.status !== 'active' && (
          <button
            type="button"
            className="btn tiny"
            onClick={() => store.setProjectStatus(id, 'active')}
          >
            Activate
          </button>
        )}
        {project.status === 'active' && (
          <button
            type="button"
            className="btn tiny ghost"
            onClick={() => store.setProjectStatus(id, 'on-hold')}
          >
            Put on hold
          </button>
        )}
        {project.status !== 'completed' && (
          <button
            type="button"
            className="btn tiny ghost"
            onClick={() => store.setProjectStatus(id, 'completed')}
          >
            Complete
          </button>
        )}
      </div>
    </li>
  );
}

export default function ProjectsView() {
  const store = useStore();
  const [title, setTitle] = useState('');
  const [outcome, setOutcome] = useState('');

  const sections = [
    { key: 'active' as const, label: 'Active' },
    { key: 'on-hold' as const, label: 'On hold' },
    { key: 'completed' as const, label: 'Completed' },
  ];

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    store.addProject({ title, outcome });
    setTitle('');
    setOutcome('');
  }

  return (
    <div className="stack">
      <form className="form-row card" onSubmit={add}>
        <input
          className="input"
          value={title}
          placeholder="New project — an outcome, not a task"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input grow"
          value={outcome}
          placeholder="Successful outcome"
          onChange={(e) => setOutcome(e.target.value)}
        />
        <button type="submit" className="btn primary small">
          Add project
        </button>
      </form>

      {sections.map((section) => {
        const items = store.state.projects.filter((p) => p.status === section.key);
        if (!items.length) return null;
        return (
          <section key={section.key} className="group">
            <h2 className="group-head">
              {section.label} <span className="meta">{items.length}</span>
            </h2>
            <ul className="rows tight">
              {items.map((p) => (
                <ProjectCard key={p.id} id={p.id} />
              ))}
            </ul>
          </section>
        );
      })}

      {store.state.projects.length === 0 && (
        <div className="empty">
          <h2>No projects yet</h2>
          <p>A project is any outcome that needs more than one action.</p>
        </div>
      )}
    </div>
  );
}
