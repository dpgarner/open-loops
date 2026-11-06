/**
 * Update plumbing for the offline shell.
 *
 * The worker no longer calls `skipWaiting()` on install, so a new build installs
 * and then waits instead of swapping itself in under a running page. This module
 * notices that waiting worker, tells the UI, and activates it when the user asks
 * to reload.
 */
export const UPDATE_READY_EVENT = 'open-loops:update-ready';

let announced = false;

function announce(): void {
  if (announced) return;
  announced = true;
  window.dispatchEvent(new Event(UPDATE_READY_EVENT));
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
      detach = () => registration.removeEventListener('updatefound', onUpdateFound);
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
