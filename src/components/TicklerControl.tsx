import { useState } from 'react';
import { formatDay } from '../selectors';

interface Props {
  date: string | null;
  onChange: (date: string | null) => void;
}

/** The one control used everywhere a tickler date can be set: ⏱ opens a date field. */
export default function TicklerControl({ date, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="tickler">
      <button
        type="button"
        className={`btn tiny ghost${date ? ' dated' : ''}`}
        aria-expanded={open}
        aria-label={date ? `Resurface date ${formatDay(date)}` : 'Set a resurface date'}
        title={date ? `Resurface ${formatDay(date)}` : 'Resurface on a date'}
        onClick={() => setOpen((v) => !v)}
      >
        {date ? `⏱ ${formatDay(date)}` : '⏱'}
      </button>

      {open && (
        <span className="tickler-pop" role="group" aria-label="Resurface date">
          <input
            type="date"
            className="input date"
            value={date ?? ''}
            onChange={(event) => onChange(event.target.value || null)}
            aria-label="Resurface date"
          />
          {date && (
            <button
              type="button"
              className="btn tiny ghost"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              Clear
            </button>
          )}
          <button type="button" className="btn tiny ghost" onClick={() => setOpen(false)}>
            Done
          </button>
        </span>
      )}
    </span>
  );
}
