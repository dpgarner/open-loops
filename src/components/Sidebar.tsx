import { useRef } from 'react';
import type { Tab } from '../types';
import { useStore } from '../store-context';
import { activeProjects, availableActions, ticklerDueCount } from '../selectors';
import { build, buildLabel } from '../build';

interface Props {
  tab: Tab;
  onTab: (tab: Tab) => void;
  reviewDue: boolean;
  onHelp: () => void;
}

export default function Sidebar({ tab, onTab, reviewDue, onHelp }: Props) {
  const store = useStore();
  const { state } = store;
  const fileRef = useRef<HTMLInputElement>(null);

  const items: Array<{ id: Tab; label: string; count: number | null; badge?: boolean }> = [
    { id: 'inbox', label: 'Inbox', count: state.inbox.length, badge: state.inbox.length > 0 },
    { id: 'next', label: 'Next actions', count: availableActions(state).length },
    { id: 'projects', label: 'Projects', count: activeProjects(state).length },
    { id: 'waiting', label: 'Waiting for', count: state.waiting.length },
    { id: 'someday', label: 'Someday / maybe', count: state.someday.length },
    {
      id: 'tickler',
      label: 'Tickler',
      count: ticklerDueCount(state) || null,
      badge: ticklerDueCount(state) > 0,
    },
    { id: 'review', label: 'Weekly review', count: null, badge: reviewDue },
  ];

  return (
    <aside className="side">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ◎
        </span>
        <span>
          Open Loops
          <em>getting things done</em>
        </span>
      </div>

      <nav className="nav" aria-label="Lists">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${tab === item.id ? ' on' : ''}`}
            onClick={() => onTab(item.id)}
            aria-current={tab === item.id}
          >
            <span className="nav-label">
              {item.label}
              {item.badge && <i className="dot" aria-label="needs attention" />}
            </span>
            {item.count !== null && <span className="nav-count">{item.count}</span>}
          </button>
        ))}
      </nav>

      <div className="side-foot">
        <div className="data-row">
          <button type="button" className="btn tiny" onClick={store.exportJson}>
            Export
          </button>
          <button type="button" className="btn tiny" onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) store.importJson(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
        <div className="data-row">
          <button type="button" className="btn tiny" onClick={store.loadDemo}>
            Demo data
          </button>
          <button
            type="button"
            className="btn tiny danger"
            onClick={() => {
              if (confirm('Clear every list and start from an empty system?')) store.clearData();
            }}
          >
            Clear data
          </button>
        </div>
        {store.importNotice && (
          <p className={`notice ${store.importNotice.kind}`} role="status">
            <span>{store.importNotice.text}</span>
            <button
              type="button"
              className="btn tiny ghost"
              aria-label="Dismiss message"
              onClick={store.clearNotice}
            >
              ×
            </button>
          </p>
        )}
        <div className="data-row">
          <button type="button" className="btn tiny" onClick={onHelp} aria-haspopup="dialog">
            Help
          </button>
        </div>
        <p className="foot-note">Stored in this browser only. Nothing leaves the machine.</p>
        <p className="build-stamp" title={build ? `Built ${build.at}` : 'Served by the dev server'}>
          {buildLabel(build)}
        </p>
      </div>
    </aside>
  );
}
