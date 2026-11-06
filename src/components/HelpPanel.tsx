import { useEffect, useRef } from 'react';
import { build, buildLabel } from '../build';
import SHORTCUTS from '../shortcuts.json';
import RULES from '../rules.json';
import GLOSSARY from '../glossary.json';

interface Props {
  onClose: () => void;
}

const CHOICES: Array<[string, string]> = [
  ['Next action', 'One step you can do. Needs a context; a project and a date are optional.'],
  ['Project', 'Several steps. Name it, say what is true when it is done, add the first action.'],
  ['Waiting for', 'Someone owes you. Their name puts it on their list.'],
  ['Someday', 'A real idea, but not now. Optionally bring it back on a date.'],
  ['Handled', 'It needed no action and no record.'],
  ['Trash', 'It was never real.'],
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
              {GLOSSARY.map(({ term, definition }) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{definition}</dd>
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
              {RULES.dates.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className="help-section">
            <h3>Your data</h3>
            <ul className="help-list">
              {RULES.data.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
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
                {SHORTCUTS.map(({ keys, description }) => (
                  <tr key={keys}>
                    <td>
                      <kbd>{keys}</kbd>
                    </td>
                    <td>{description}</td>
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
