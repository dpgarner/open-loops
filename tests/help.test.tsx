import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../src/App';
import HelpPanel from '../src/components/HelpPanel';
import { StoreProvider } from '../src/store';

/** The app with its real store, which is what the sidebar button lives in. */
function renderApp() {
  return render(
    <StoreProvider>
      <App />
    </StoreProvider>,
  );
}

const helpButton = () => screen.getByRole('button', { name: 'Help' });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  // A failed assertion must not leave the scroll lock on for the next test.
  document.body.style.overflow = '';
});

describe('help dialog', () => {
  it('opens from the sidebar button', () => {
    renderApp();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(helpButton().getAttribute('aria-haspopup')).toBe('dialog');

    fireEvent.click(helpButton());

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(within(dialog).getByRole('heading', { name: 'How this works' })).toBeTruthy();
  });

  it('is labelled by its own heading', () => {
    render(<HelpPanel onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    const id = dialog.getAttribute('aria-labelledby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id as string)?.textContent).toBe('How this works');
  });

  it('carries the guide sections: terms, inbox choices, dates, data, shortcuts', () => {
    render(<HelpPanel onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'The words',
      'Emptying the inbox',
      'Dates',
      'Your data',
      'Shortcuts',
    ]);
    expect(dialog.querySelectorAll('.terms dt')).toHaveLength(9);
    // six inbox choices, three date rules, two data rules
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(11);
    // a header row plus c, Enter, Tab and Space
    expect(within(dialog).getAllByRole('row')).toHaveLength(5);
    expect(within(dialog).getAllByText('c', { selector: 'kbd' })).toHaveLength(1);
  });

  it('moves focus to Close when it opens', () => {
    render(<HelpPanel onClose={jest.fn()} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    render(<HelpPanel onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on the Close button', () => {
    const onClose = jest.fn();
    render(<HelpPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes from the backdrop but not from a press inside the panel', () => {
    const onClose = jest.fn();
    render(<HelpPanel onClose={onClose} />);
    const dialog = screen.getByRole('dialog');

    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks page scrolling while open and releases it on close', () => {
    const { unmount } = render(<HelpPanel onClose={jest.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('returns focus to the Help button when Escape dismisses it', () => {
    renderApp();
    helpButton().focus();
    fireEvent.click(helpButton());
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(helpButton());
  });

  it('holds the c shortcut back while it is open, then hands it back', () => {
    renderApp();
    const capture = screen.getByRole('textbox', { name: 'Capture' });
    helpButton().focus();
    fireEvent.click(helpButton());

    fireEvent.keyDown(window, { key: 'c' });
    expect(document.activeElement).not.toBe(capture);

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'c' });
    expect(document.activeElement).toBe(capture);
  });
});
