/**
 * Update plumbing for the offline shell.
 *
 * The worker no longer calls `skipWaiting()` on install, so a new build installs
 * and then waits instead of swapping itself in under a running page. This module
 * notices that waiting worker, tells the UI, and activates it when the user asks
 * to reload.
 */
export const UPDATE_READY_EVENT = 'open-loops:update-ready';

const CHECK_EVERY_MS = 5 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000;

let announced = false;

function announce(): void {
  if (announced) return;
  announced = true;
  window.dispatchEvent(new Event(UPDATE_READY_EVENT));
}

/**
 * Asks the browser to re-fetch the worker on a timer and when the window comes
 * back into view, so a page left open for hours still finds a new build. The
 * browser's own check only runs on navigation (and at most once a day), and the
 * gap guard keeps a flurry of focus and visibility events from hammering it.
 */
export function startUpdateChecks(run: () => void): () => void {
  let last = Date.now();

  const attempt = () => {
    const now = Date.now();
    if (now - last < MIN_GAP_MS) return;
    last = now;
    run();
  };

  const onFocus = () => attempt();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') attempt();
  };

  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisibility);
  const timer = window.setInterval(attempt, CHECK_EVERY_MS);

  return () => {
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisibility);
    window.clearInterval(timer);
  };
}

/** Watches for a downloaded worker that is waiting to take over. */
export function watchForUpdates(): () => void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  let stopped = false;
  let detach = () => {};

  navigator.serviceWorker.ready
    .then((registration) => {
      if (stopped) return;

      const check = () => {
        if (registration.waiting) announce();
      };
      const onUpdateFound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', check);
      };

      registration.addEventListener('updatefound', onUpdateFound);
      const stopChecks = startUpdateChecks(() => {
        void registration.update().catch(() => {
          // Offline, or the registration vanished: nothing to report.
        });
      });
      detach = () => {
        registration.removeEventListener('updatefound', onUpdateFound);
        stopChecks();
      };
      // A worker may already be waiting from an earlier visit.
      check();
    })
    .catch(() => {
      // No worker (or no support): the page simply works as a normal page.
    });

  return () => {
    stopped = true;
    detach();
  };
}

/** Lets the waiting worker take over, then reloads into the new build. */
export async function activateUpdate(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration().catch(() => undefined);
  const waiting = registration?.waiting;

  if (!waiting) {
    window.location.reload();
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  });
  waiting.postMessage({ type: 'SKIP_WAITING' });
}
