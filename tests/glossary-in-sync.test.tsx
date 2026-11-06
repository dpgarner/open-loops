import { readFileSync } from 'fs';
import { join } from 'path';
import { render, screen } from '@testing-library/react';
import HelpPanel from '../src/components/HelpPanel';
import GLOSSARY from '../src/glossary.json';

const { renderGlossaryTable } = require('../scripts/docs.cjs') as {
  renderGlossaryTable: (entries: Array<{ term: string; definition: string }>) => string;
};

const guide = () => readFileSync(join(__dirname, '..', 'USER-GUIDE.md'), 'utf8');

describe('glossary', () => {
  it('keeps the guide words table generated from the shared glossary', () => {
    expect(guide()).toContain(
      `<!-- glossary:start -->\n${renderGlossaryTable(GLOSSARY)}\n<!-- glossary:end -->`,
    );
  });

  it('renders the same terms and definitions in the help panel', () => {
    render(<HelpPanel onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');

    const terms = [...dialog.querySelectorAll('.terms dt')].map((node) => node.textContent);
    const definitions = [...dialog.querySelectorAll('.terms dd')].map((node) => node.textContent);

    expect(terms).toEqual(GLOSSARY.map((entry) => entry.term));
    expect(definitions).toEqual(GLOSSARY.map((entry) => entry.definition));
  });
});
