import { useEffect, useRef } from 'react';
import { build, buildLabel } from '../build';

interface Props {
  onClose: () => void;
}

const TERMS: Array<[string, string]> = [
  ['Inbox', 'Things you captured but have not decided about yet. Emptying it means deciding, not doing.'],
  ['Next action', 'One physical step you could take now: "Ring the venue", not "Sort out the offsite".'],
  ['Context', 'Where or with what you would do it — @calls, @computer, @errands, @home.'],
  ['Project', 'Any outcome that needs more than one action.'],
  ['Stuck', 'A project with no open next action. The app says so instead of letting it sit quietly.'],
  ['Waiting for', 'Something another person owes you. The app counts the days.'],
  ['Someday / maybe', 'Ideas that are not commitments yet, parked with a note about why.'],
  ['Tickler', 'The dating system. A dated action waits in Deferred until the morning of its day, then returns.'],
  ['Weekly review', 'A guided pass over the whole system, about once a week.'],
];

const CHOICES: Array<[string, string]> = [
  ['Next action', 'One step you can do. Needs a context; a project and a date are optional.'],
  ['Project', 'Several steps. Name it, say what is true when it is done, add the first action.'],
  ['Waiting for', 'Someone owes you. Their name puts it on their list.'],
  ['Someday', 'A real idea, but not now. Optionally bring it back on a date.'],
  ['Handled', 'It needed no action and no record.'],
  ['Trash', 'It was never real.'],
];

const KEYS: Array<[string, string]> = [
  ['c', 'Jumps to the capture bar from anywhere, unless you are already typing in a field.'],
  ['Enter', 'Files what you typed in the capture bar; adds a context in the New context box.'],
  ['Tab / Shift+Tab', 'Moves between fields and buttons.'],
  ['Space', 'Ticks or unticks a checkbox you have tabbed to.'],
];

/** The short version of the user guide, over the top of whatever is open. */
export default function HelpPanel({ onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="help-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="help-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <header className="help-head">
          <div>
            <h2 id="help-title">How this works</h2>
            <p className="meta">
              Capture, clarify, do, review. The full guide ships with the app as USER-GUIDE.md.
            </p>
          </div>
          <button ref={closeRef} type="button" className="btn tiny" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="help-body">
          <section className="help-section">
            <h3>The words</h3>
            <dl className="terms">
              {TERMS.map(([term, meaning]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="help-section">
            <h3>Emptying the inbox</h3>
            <ul className="help-list">
              {CHOICES.map(([label, text]) => (
                <li key={label}>
                  <strong>{label}</strong> — {text}
                </li>
              ))}
            </ul>
            <p className="help-note">
              <strong>Careful:</strong> Handled and Trash keep no record, and neither can be
              undone.
            </p>
          </section>

          <section className="help-section">
            <h3>Dates</h3>
            <ul className="help-list">
              <li>
                An action dated in the future leaves its context list and waits in{' '}
                <strong>Deferred</strong>. It comes back by itself on the morning of that day.
              </li>
              <li>
                Dated today or earlier, an action also appears in <strong>Tickler → Due now</strong>{' '}
                as "due today" or "N days overdue".
              </li>
              <li>
                <strong>Push a week</strong> moves a date seven days on from today. Days switch at
                your local midnight.
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Your data</h3>
            <ul className="help-list">
              <li>
                Everything is stored in this browser, for this address. There is no account and no
                copy anywhere else.
              </li>
              <li>
                <strong>Export</strong> downloads a backup file; <strong>Import</strong> replaces
                everything with one, so export first if there is anything you would miss.
              </li>
            </ul>
            <p className="help-note">
              <strong>Careful:</strong> Demo data replaces your lists immediately, without asking.
              Clearing browsing data, a private window, another browser or another address means
              starting empty — an export is the only backup.
            </p>
          </section>

          <section className="help-section">
            <h3>Version and updates</h3>
            <p>
              The line at the bottom of the sidebar names the build you are running, shown here
              as{' '}
              <code>
                {build?.commitUrl ? (
                  <a href={build.commitUrl} target="_blank" rel="noreferrer">
                    {buildLabel(build)}
                  </a>
                ) : (
                  buildLabel(build)
                )}
              </code>{' '}
              — its short commit links to that exact change on GitHub, and "Development build"
              means the dev server is serving the page.
            </p>
            <p>
              When a newer build downloads, a banner appears at the bottom of the window. Nothing
              changes until you press <strong>Reload</strong>, so a half-typed capture is safe; the
              × dismisses the notice until next time.
            </p>
          </section>

          <section className="help-section">
            <h3>Shortcuts</h3>
            <table className="keys">
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                {KEYS.map(([key, text]) => (
                  <tr key={key}>
                    <td>
                      <kbd>{key}</kbd>
                    </td>
                    <td>{text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="meta">Esc or Close returns you to what you were doing.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
