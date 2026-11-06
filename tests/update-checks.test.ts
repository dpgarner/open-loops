import { startUpdateChecks } from '../src/offline-shell';

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

describe('update checks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('re-checks on a five minute timer', () => {
    const run = jest.fn();
    const stop = startUpdateChecks(run);

    jest.advanceTimersByTime(FIVE_MINUTES);

    expect(run).toHaveBeenCalledTimes(1);
    stop();
  });

  it('refreshes when the window regains focus, at most once a minute', () => {
    const run = jest.fn();
    const stop = startUpdateChecks(run);

    // A page that has just loaded already checked while registering.
    window.dispatchEvent(new Event('focus'));
    expect(run).not.toHaveBeenCalled();

    jest.advanceTimersByTime(ONE_MINUTE + 1000);
    window.dispatchEvent(new Event('focus'));
    expect(run).toHaveBeenCalledTimes(1);

    // A second focus straight away is swallowed by the gap guard.
    window.dispatchEvent(new Event('focus'));
    expect(run).toHaveBeenCalledTimes(1);

    stop();
  });

  it('ignores visibility changes while the tab is hidden', () => {
    const run = jest.fn();
    const stop = startUpdateChecks(run);
    jest.advanceTimersByTime(ONE_MINUTE + 1000);

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(run).not.toHaveBeenCalled();

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(run).toHaveBeenCalledTimes(1);

    stop();
  });

  it('stops both the timer and the listeners when cleaned up', () => {
    const run = jest.fn();

    startUpdateChecks(run)();

    jest.advanceTimersByTime(30 * ONE_MINUTE);
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));

    expect(run).not.toHaveBeenCalled();
  });
});
