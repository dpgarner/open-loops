import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store-context';

interface Props {
  projectId: string | null;
  onDone?: () => void;
  placeholder?: string;
}

/** Adds a concrete next action, either to a project or as a standalone action. */
export default function NextActionForm({ projectId, onDone, placeholder }: Props) {
  const store = useStore();
  const [title, setTitle] = useState('');
  const [context, setContext] = useState(store.state.contexts[0] ?? '@computer');
  const [date, setDate] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (projectId) store.defineNextAction(projectId, { title, context, ticklerDate: date || null });
    else store.addAction({ title, context, projectId: null, ticklerDate: date || null });
    setTitle('');
    setDate('');
    onDone?.();
  }

  return (
    <form className="form-row" onSubmit={submit}>
      <input
        className="input grow"
        value={title}
        placeholder={placeholder ?? 'The very next physical step'}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select className="select" value={context} onChange={(e) => setContext(e.target.value)}>
        {store.state.contexts.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="date"
        className="input date"
        value={date}
        aria-label="Resurface on"
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="submit" className="btn small">
        Add
      </button>
    </form>
  );
}
