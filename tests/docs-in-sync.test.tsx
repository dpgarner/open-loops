import { readFileSync } from 'fs';
import { join } from 'path';
import { render, screen } from '@testing-library/react';
import HelpPanel from '../src/components/HelpPanel';

/**
 * The user guide is the long form; the help panel is the short one. This table is
 * the deliberate bridge: every chapter of USER-GUIDE.md maps either to a help
 * section or to null ("the help stays out of this"). Adding a chapter without
 * touching this table fails the suite, which is the point — new prose should
 * force a decision about the help panel rather than drift away from it.
 */
const CHAPTERS: Array<[chapter: string, helpSection: string | null]> = [
  ['What it is, and what it is not', null],
  ['The words the app uses', 'The words'],
  ['Your first ten minutes', 'Emptying the inbox'],
  ['The screens, one at a time', null],
  ['Dates, and how the tickler decides', 'Dates'],
  ['Install it, and use it offline', 'Version and updates'],
  ['Your data, backups, and how not to lose it', 'Your data'],
  ['Keyboard shortcuts and small conveniences', 'Shortcuts'],
  ['When something looks wrong', null],
  ['If you have used GTD before', null],
];

function guideChapters(): string[] {
  const markdown = readFileSync(join(__dirname, '..', 'USER-GUIDE.md'), 'utf8');
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim());
}

function helpSections(): string[] {
  render(<HelpPanel onClose={jest.fn()} />);
  return [...screen.getByRole('dialog').querySelectorAll('h3')].map(
    (heading) => heading.textContent ?? '',
  );
}

describe('user guide and help panel', () => {
  it('knows every chapter of the guide', () => {
    const known = new Set(CHAPTERS.map(([chapter]) => chapter));
    const unknown = guideChapters().filter((chapter) => !known.has(chapter));

    if (unknown.length > 0) {
      throw new Error(
        `USER-GUIDE.md has chapters this test has no decision for: ${unknown.join('; ')}. ` +
          'Add each to CHAPTERS, mapped to a help section or to null.',
      );
    }
  });

  it('does not keep entries for chapters that no longer exist', () => {
    const chapters = new Set(guideChapters());
    const stale = CHAPTERS.map(([chapter]) => chapter).filter((chapter) => !chapters.has(chapter));

    expect(stale).toEqual([]);
  });

  it('maps every chapter to a help section that is really there', () => {
    const sections = helpSections();
    const mapped = CHAPTERS.flatMap(([, section]) => (section ? [section] : []));

    expect(mapped.filter((section) => !sections.includes(section))).toEqual([]);
  });

  it('leaves no help section without a chapter behind it', () => {
    const sections = helpSections();
    const mapped = new Set(CHAPTERS.flatMap(([, section]) => (section ? [section] : [])));

    expect(sections.filter((section) => !mapped.has(section))).toEqual([]);
  });
});
