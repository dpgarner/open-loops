import { useStore } from '../store';
import { daysSince } from '../selectors';
import type { WaitingItem } from '../types';

export default function WaitingForView() {
  const store = useStore();
  const { state } = store;

  if (!state.waiting.length) {
    return (
      <div className="empty">
        <h2>Nothing waiting</h2>
        <p>When you delegate something, clarify it here so it stops occupying your head.</p>
      </div>
    );
  }

  const groups = new Map<string, WaitingItem[]>();
  for (const item of state.waiting) {
    const list = groups.get(item.person) ?? [];
    list.push(item);
    groups.set(item.person, list);
  }

  return (
    <div className="stack">
      {[...groups.entries()].map(([person, items]) => (
        <section key={person} className="group">
          <h2 className="group-head">
            {person} <span className="meta">{items.length} owed</span>
          </h2>
          <ul className="rows tight">
            {items.map((item) => {
              const age = daysSince(item.since);
              return (
                <li key={item.id} className="row card">
                  <div className="item-main">
                    <span className="item-title">{item.title}</span>
                    <span className={`meta${age >= 7 ? ' late' : ''}`}>
                      waiting {age} day{age === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn tiny" onClick={() => store.receiveWaiting(item.id)}>
                      Received
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
