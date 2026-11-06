import { act, fireEvent, render, screen } from '@testing-library/react';
import UpdateBanner from '../src/components/UpdateBanner';
import { UPDATE_READY_EVENT, activateUpdate, watchForUpdates } from '../src/offline-shell';

jest.mock('../src/offline-shell', () => ({
  UPDATE_READY_EVENT: 'open-loops:update-ready',
  watchForUpdates: jest.fn(() => jest.fn()),
  activateUpdate: jest.fn(() => Promise.resolve()),
}));

const mockedActivate = activateUpdate as jest.MockedFunction<typeof activateUpdate>;
const mockedWatch = watchForUpdates as jest.MockedFunction<typeof watchForUpdates>;

/** The worker downloaded a new build and is waiting to take over. */
function announceUpdate() {
  act(() => {
    window.dispatchEvent(new Event(UPDATE_READY_EVENT));
  });
}

describe('update banner', () => {
  beforeEach(() => {
    mockedActivate.mockClear();
    mockedWatch.mockClear();
    mockedWatch.mockImplementation(() => jest.fn());
  });

  it('stays out of the way until a new build is waiting', () => {
    render(<UpdateBanner />);

    expect(screen.queryByRole('status')).toBeNull();
    expect(mockedWatch).toHaveBeenCalledTimes(1);
  });

  it('offers a reload when the worker reports a new build', () => {
    render(<UpdateBanner />);
    announceUpdate();

    const banner = screen.getByRole('status');
    expect(banner.textContent).toContain('A new version of Open Loops is ready.');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
  });

  it('asks the worker to activate when Reload is pressed', async () => {
    render(<UpdateBanner />);
    announceUpdate();

    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));

    expect(mockedActivate).toHaveBeenCalledTimes(1);
    await act(async () => {});
    expect(screen.getByRole('button', { name: 'Reloading…' })).toBeTruthy();
  });

  it('can be dismissed without reloading', () => {
    render(<UpdateBanner />);
    announceUpdate();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss update notice' }));

    expect(screen.queryByRole('status')).toBeNull();
    expect(mockedActivate).not.toHaveBeenCalled();
  });

  it('stops watching for updates when it unmounts', () => {
    const stop = jest.fn();
    mockedWatch.mockReturnValue(stop);

    const { unmount } = render(<UpdateBanner />);
    unmount();

    expect(stop).toHaveBeenCalledTimes(1);
  });
});
