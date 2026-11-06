import { readFileSync } from 'fs';
import { join } from 'path';
import { render, screen } from '@testing-library/react';
import HelpPanel from '../src/components/HelpPanel';

/** The first column of every row in the guide's shortcuts table. */
function guideShortcutKeys(): string[] {
  const markdown = readFileSync(join(__dirname, '..', 'USER-GUIDE.md'), 'utf8');
  const start = markdown.indexOf('## Keyboard shortcuts and small conveniences');
  if (start === -1) throw new Error('USER-GUIDE.md no longer has a keyboard shortcuts chapter');
  const next = markdown.indexOf('\n## ', start + 1);
  const chapter = markdown.slice(start, next === -1 ? undefined : next);

  return chapter
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.length > 2)
    .map((cells) => cells[1])
    .filter((key) => key && key.toLowerCase() !== 'key' && !/^-+$/.test(key))
    .map((key) => key.replace(/\*\*/g, '').replace(/\s*\/\s*/g, ' / ').trim());
}

/** The keys the help panel actually renders, not its source. */
function helpShortcutKeys(): string[] {
  render(<HelpPanel onClose={jest.fn()} />);
  return [...screen.getByRole('dialog').querySelectorAll('.keys tbody kbd')].map(
    (key) => key.textContent ?? '',
  );
}

describe('keyboard shortcuts in the guide and the help panel', () => {
  it('lists the same keys in both places', () => {
    const guide = guideShortcutKeys();
    const help = helpShortcutKeys();

    // Guard against the table parser silently finding nothing on both sides.
    expect(guide.length).toBeGreaterThan(0);
    expect([...help].sort()).toEqual([...guide].sort());
  });

  it('explains each shortcut instead of only naming the key', () => {
    render(<HelpPanel onClose={jest.fn()} />);
    const rows = [...screen.getByRole('dialog').querySelectorAll('.keys tbody tr')];

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect((row.lastElementChild?.textContent ?? '').trim().length).toBeGreaterThan(15);
    }
  });
});
