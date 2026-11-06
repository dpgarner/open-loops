import { render, screen } from '@testing-library/react';
import Sidebar from '../src/components/Sidebar';
import { StoreProvider } from '../src/store';
import { buildLabel } from '../src/build';

jest.mock('../src/build', () => {
  const actual = jest.requireActual('../src/build');
  return {
    ...actual,
    build: {
      id: 'testbuild',
      at: '2026-11-06T14:32:00.000Z',
      commit: 'be6f971c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60',
      commitUrl:
        'https://github.com/dpgarner/open-loops/commit/be6f971c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60',
    },
  };
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
  it('names the build, its commit and the UTC time in the sidebar footer', () => {
    const { container } = renderSidebar();

    const stamp = container.querySelector('.side-foot .build-stamp');
    expect(stamp?.textContent).toBe('Build testbuild · be6f971 · 2026-11-06 14:32 UTC');
    expect(screen.getByText('Build testbuild · be6f971 · 2026-11-06 14:32 UTC')).toBeTruthy();
  });

  it('links the stamp to the exact commit on GitHub', () => {
    renderSidebar();

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe(
      'https://github.com/dpgarner/open-loops/commit/be6f971c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });

  it('shows the full timestamp and commit in the tooltip', () => {
    const { container } = renderSidebar();

    const stamp = container.querySelector('.build-stamp');
    expect(stamp?.getAttribute('title')).toBe(
      'Built 2026-11-06T14:32:00.000Z from be6f971c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60',
    );
  });

  it('still reads sensibly when the build came from a source zip with no commit', () => {
    expect(buildLabel({ id: 'abc123', at: '2026-01-02T03:04:05.000Z', commit: null, commitUrl: null })).toBe(
      'Build abc123 · 2026-01-02 03:04 UTC',
    );
  });

  it('says so when there is no build id, as in dev and tests', () => {
    expect(buildLabel(null)).toBe('Development build');
  });
});
