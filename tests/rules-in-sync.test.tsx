import { readFileSync } from 'fs';
import { join } from 'path';
import { render, screen, within } from '@testing-library/react';
import HelpPanel from '../src/components/HelpPanel';
import RULES from '../src/rules.json';

const { renderBulletList } = require('../scripts/docs.cjs') as {
  renderBulletList: (items: string[]) => string;
};

const guide = () => readFileSync(join(__dirname, '..', 'USER-GUIDE.md'), 'utf8');

describe('date and data rules', () => {
  it('keeps the guide dates block generated from the shared rules', () => {
    expect(guide()).toContain(`<!-- dates:start -->\n${renderBulletList(RULES.dates)}\n<!-- dates:end -->`);
  });

  it('keeps the guide data block generated from the shared rules', () => {
    expect(guide()).toContain(`<!-- data:start -->\n${renderBulletList(RULES.data)}\n<!-- data:end -->`);
  });

  it('renders the same rules in the help panel', () => {
    render(<HelpPanel onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');

    for (const rule of [...RULES.dates, ...RULES.data]) {
      expect(within(dialog).getByText(rule)).toBeTruthy();
    }
  });
});
