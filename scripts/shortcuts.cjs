/*
 * Writes the keyboard shortcut table in USER-GUIDE.md from src/shortcuts.json,
 * the same list the in-app help renders. Run `npm run docs:shortcuts` after
 * editing the JSON; `node scripts/shortcuts.cjs --check` fails if the guide is
 * out of date (the test suite runs the equivalent check).
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'src', 'shortcuts.json');
const GUIDE = join(ROOT, 'USER-GUIDE.md');

const START = '<!-- shortcuts:start -->';
const END = '<!-- shortcuts:end -->';

/** `Tab / Shift+Tab` renders as `**Tab** / **Shift+Tab**`, matching the old table. */
function boldKeys(keys) {
  return keys
    .split('/')
    .map((part) => `**${part.trim()}**`)
    .join(' / ');
}

function renderShortcutTable(shortcuts) {
  const lines = ['| Key | What it does |', '|---|---|'];
  for (const { keys, description } of shortcuts) {
    lines.push(`| ${boldKeys(keys)} | ${description} |`);
  }
  return lines.join('\n');
}

function replaceBlock(markdown, table) {
  const start = markdown.indexOf(START);
  const end = markdown.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('USER-GUIDE.md is missing the <!-- shortcuts:start/end --> markers');
  }
  return `${markdown.slice(0, start + START.length)}\n${table}\n${markdown.slice(end)}`;
}

function main() {
  const shortcuts = JSON.parse(readFileSync(SOURCE, 'utf8'));
  const markdown = readFileSync(GUIDE, 'utf8');
  const next = replaceBlock(markdown, renderShortcutTable(shortcuts));

  if (process.argv.includes('--check')) {
    if (next !== markdown) {
      console.error(
        'The shortcut table in USER-GUIDE.md is out of date. Run: npm run docs:shortcuts',
      );
      process.exit(1);
    }
    console.log('Shortcut table is up to date.');
    return;
  }

  writeFileSync(GUIDE, next);
  console.log('Shortcut table written to USER-GUIDE.md');
}

module.exports = { renderShortcutTable, replaceBlock };

if (require.main === module) main();
