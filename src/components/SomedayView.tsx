import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store-context';
import { dueLabel, isDue } from '../selectors';
import TicklerControl from './TicklerControl';

export default function SomedayView() {
  const store = useStore();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    store.addSomeday(title, note, date || null);
    setTitle('');
    setNote('');
    setDate('');
  }

  return (
    <div className="stack">
      <form className="form-row card" onSubmit={add}>
        <input
          className="input"
          value={title}
          placeholder="Park an idea for later"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input grow"
          value={note}
          placeholder="Why it is parked (optional)"
          onChange={(e) => setNote(e.target.value)}
        />
        <input
          type="date"
          className="input date"
          value={date}
          aria-label="Remind me on"
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit" className="btn primary small">
          Park it
        </button>
      </form>

      {store.state.someday.length === 0 ? (
        <div className="empty">
          <h2>Nothing parked</h2>
          <p>Ideas that are not commitments yet belong here rather than in your head.</p>
        </div>
      ) : (
        <ul className="rows">
          {store.state.someday.map((item) => (
            <li key={item.id} className={`row card${isDue(item.remindOn) ? ' due' : ''}`}>
              <div className="item-main">
                <span className="item-title">{item.title}</span>
                {(item.note || item.remindOn) && (
                  <span className="meta">
                    {item.remindOn ? `resurfaces ${dueLabel(item.remindOn)}` : ''}
                    {item.remindOn && item.note ? ' · ' : ''}
                    {item.note}
                  </span>
                )}
              </div>
              <div className="btn-row">
                <TicklerControl date={item.remindOn} onChange={(d) => store.setSomedayDate(item.id, d)} />
                <button type="button" className="btn tiny" onClick={() => store.promoteSomeday(item.id)}>
                  Move to inbox
                </button>
                <button
                  type="button"
                  className="btn tiny ghost danger-text"
                  onClick={() => store.deleteSomeday(item.id)}
                >
                  Let it go
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
