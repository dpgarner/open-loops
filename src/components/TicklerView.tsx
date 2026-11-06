import { useStore } from '../store-context';
import {
  dayDelta,
  dueActions,
  dueLabel,
  dueSomeday,
  formatDay,
  nextWeekKey,
  upcomingTickler,
} from '../selectors';

export default function TicklerView() {
  const store = useStore();
  const { state } = store;
  const due = dueActions(state);
  const dueIdeas = dueSomeday(state);
  const upcoming = upcomingTickler(state);
  const quiet = due.length === 0 && dueIdeas.length === 0;

  return (
    <div className="stack">
      <section className="group">
        <h2 className="group-head">
          Due now <span className="meta">{due.length + dueIdeas.length}</span>
        </h2>

        {quiet ? (
          <p className="ok">Nothing has come due. A quiet tickler is a working tickler.</p>
        ) : (
          <ul className="rows tight">
            {due.map((action) => (
              <li key={action.id} className="row card due">
                <label className="check">
                  <input type="checkbox" checked={false} onChange={() => store.toggleAction(action.id)} />
                  <span className="item-title">{action.title}</span>
                  <span className="chip">{action.context}</span>
                </label>
                <div className="btn-row">
                  <span className="meta late">{action.ticklerDate ? dueLabel(action.ticklerDate) : ''}</span>
                  <button
                    type="button"
                    className="btn tiny ghost"
                    onClick={() => store.setActionDate(action.id, nextWeekKey())}
                  >
                    Push a week
                  </button>
                  <button
                    type="button"
                    className="btn tiny ghost"
                    onClick={() => store.setActionDate(action.id, null)}
                  >
                    Clear
                  </button>
                </div>
              </li>
            ))}

            {dueIdeas.map((idea) => (
              <li key={idea.id} className="row card due">
                <div className="item-main">
                  <span className="item-title">{idea.title}</span>
                  <span className="meta">
                    <span className="kind">someday</span> {idea.remindOn ? dueLabel(idea.remindOn) : ''}
                    {idea.note ? ` · ${idea.note}` : ''}
                  </span>
                </div>
                <div className="btn-row">
                  <button type="button" className="btn tiny" onClick={() => store.promoteSomeday(idea.id)}>
                    Move to inbox
                  </button>
                  <button
                    type="button"
                    className="btn tiny ghost"
                    onClick={() => store.setSomedayDate(idea.id, nextWeekKey())}
                  >
                    Push a week
                  </button>
                  <button
                    type="button"
                    className="btn tiny ghost danger-text"
                    onClick={() => store.deleteSomeday(idea.id)}
                  >
                    Let it go
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="group">
        <h2 className="group-head">
          Upcoming <span className="meta">{upcoming.reduce((n, d) => n + d.actions.length + d.someday.length, 0)}</span>
        </h2>

        {upcoming.length === 0 ? (
          <p className="meta">Nothing dated ahead. Use the ⏱ control on an action or a someday idea.</p>
        ) : (
          upcoming.map((day) => (
            <div key={day.date} className="upcoming-day">
              <h3 className="upcoming-head">
                {formatDay(day.date)}
                <span className="meta">
                  {dayDelta(day.date) === 1 ? 'tomorrow' : `in ${dayDelta(day.date)} days`}
                </span>
              </h3>
              <ul className="rows tight">
                {day.actions.map((action) => (
                  <li key={action.id} className="row card">
                    <label className="check">
                      <input type="checkbox" checked={false} onChange={() => store.toggleAction(action.id)} />
                      <span className="item-title">{action.title}</span>
                      <span className="chip">{action.context}</span>
                    </label>
                    <span className="meta">deferred until then</span>
                  </li>
                ))}
                {day.someday.map((idea) => (
                  <li key={idea.id} className="row card">
                    <div className="item-main">
                      <span className="item-title">{idea.title}</span>
                      <span className="meta">
                        <span className="kind">someday</span> resurfaces
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
