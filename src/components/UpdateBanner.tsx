import { useEffect, useState } from 'react';
import { UPDATE_READY_EVENT, activateUpdate, watchForUpdates } from '../offline-shell';

export default function UpdateBanner() {
  const [ready, setReady] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const stopWatching = watchForUpdates();
    const onReady = () => setReady(true);
    window.addEventListener(UPDATE_READY_EVENT, onReady);
    return () => {
      window.removeEventListener(UPDATE_READY_EVENT, onReady);
      stopWatching();
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="update-banner" role="status">
      <span>A new version of Open Loops is ready.</span>
      <button
        type="button"
        className="btn tiny primary"
        disabled={applying}
        onClick={() => {
          setApplying(true);
          void activateUpdate();
        }}
      >
        {applying ? 'Reloading…' : 'Reload'}
      </button>
      <button
        type="button"
        className="btn tiny ghost"
        aria-label="Dismiss update notice"
        onClick={() => setReady(false)}
      >
        ×
      </button>
    </div>
  );
}
