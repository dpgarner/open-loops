import { activateUpdate, watchForUpdates } from '../src/offline-shell';

describe('offline shell helpers without service worker support', () => {
  it('watchForUpdates hands back a no-op cleanup', () => {
    expect('serviceWorker' in navigator).toBe(false);

    const stop = watchForUpdates();

    expect(typeof stop).toBe('function');
    expect(() => stop()).not.toThrow();
  });

  it('activateUpdate does nothing rather than throwing', async () => {
    await expect(activateUpdate()).resolves.toBeUndefined();
  });
});
