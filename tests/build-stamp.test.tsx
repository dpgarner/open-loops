import { render, screen } from '@testing-library/react';
import Sidebar from '../src/components/Sidebar';
import { StoreProvider } from '../src/store';
import { buildLabel } from '../src/build';

jest.mock('../src/build', () => {
  const actual = jest.requireActual('../src/build');
  return { ...actual, build: { id: 'testbuild', at: '2026-11-06T14:32:00.000Z' } };
});

function renderSidebar() {
  return render(
    <StoreProvider>
      <Sidebar tab="inbox" onTab={jest.fn()} reviewDue={false} onHelp={jest.fn()} />
    </StoreProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('build stamp', () => {
  it('names the running build and its UTC time in the sidebar footer', () => {
    const { container } = renderSidebar();

    const stamp = container.querySelector('.side-foot .build-stamp');
    expect(stamp?.textContent).toBe('Build testbuild · 2026-11-06 14:32 UTC');
    expect(screen.getByText('Build testbuild · 2026-11-06 14:32 UTC')).toBeTruthy();
  });

  it('mentions the full timestamp in the tooltip', () => {
    const { container } = renderSidebar();

    const stamp = container.querySelector('.build-stamp');
    expect(stamp?.getAttribute('title')).toBe('Built 2026-11-06T14:32:00.000Z');
  });

  it('says so when there is no build id, as in dev and tests', () => {
    expect(buildLabel(null)).toBe('Development build');
  });

  it('formats id and time without depending on the machine locale', () => {
    expect(buildLabel({ id: 'abc123', at: '2026-01-02T03:04:05.000Z' })).toBe(
      'Build abc123 · 2026-01-02 03:04 UTC',
    );
  });
});
