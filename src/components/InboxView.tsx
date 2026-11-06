import { useState } from 'react';
import { useStore } from '../store-context';
import ClarifyPanel, { type ClarifyMode } from './ClarifyPanel';

export default function InboxView() {
  const store = useStore();
  const [open, setOpen] = useState<{ id: string; mode: ClarifyMode } | null>(null);
  const inbox = store.state.inbox;

  if (!inbox.length) {
    return (
      <div className="empty">
        <h2>Inbox zero</h2>
        <p>Nothing is waiting to be decided. Capture with the bar above, then process it here.</p>
      </div>
    );
  }

  return (
    <ul className="rows">
      {inbox.map((item) => {
        const mode = open && open.id === item.id ? open.mode : null;
        return (
          <li key={item.id} className={`row card${mode ? ' open' : ''}`}>
            <div className="item-main">
              <span className="item-title">{item.text}</span>
              <span className="meta">captured {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="btn tiny"
                onClick={() => setOpen({ id: item.id, mode: 'action' })}
              >
                Next action
              </button>
              <button
                type="button"
                className="btn tiny"
                onClick={() => setOpen({ id: item.id, mode: 'project' })}
              >
                Project
              </button>
              <button
                type="button"
                className="btn tiny"
                onClick={() => setOpen({ id: item.id, mode: 'waiting' })}
              >
                Waiting for
              </button>
              <button
                type="button"
                className="btn tiny"
                onClick={() => setOpen({ id: item.id, mode: 'someday' })}
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
                onDone={() => setOpen(null)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
