/*
 * Writes the generated blocks in USER-GUIDE.md from the shared JSON sources the
 * in-app help also renders:
 *
 *   src/shortcuts.json -> the keyboard shortcut table
 *   src/rules.json     -> the date rules and the data rules
 *   src/glossary.json  -> the words table
 *
 * Run `npm run docs` after editing any of them; `node scripts/docs.cjs --check`
 * fails and names the stale block. The test suite runs the equivalent check.
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const GUIDE = join(ROOT, 'USER-GUIDE.md');

const shortcuts = JSON.parse(readFileSync(join(ROOT, 'src', 'shortcuts.json'), 'utf8'));
const rules = JSON.parse(readFileSync(join(ROOT, 'src', 'rules.json'), 'utf8'));
const glossary = JSON.parse(readFileSync(join(ROOT, 'src', 'glossary.json'), 'utf8'));

const BLOCKS = [
  {
    name: 'glossary',
    start: '<!-- glossary:start -->',
    end: '<!-- glossary:end -->',
    body: renderGlossaryTable(glossary),
  },
  {
    name: 'shortcuts',
    start: '<!-- shortcuts:start -->',
    end: '<!-- shortcuts:end -->',
    body: renderShortcutTable(shortcuts),
  },
  { name: 'dates', start: '<!-- dates:start -->', end: '<!-- dates:end -->', body: renderBulletList(rules.dates) },
  { name: 'data', start: '<!-- data:start -->', end: '<!-- data:end -->', body: renderBulletList(rules.data) },
];

/** `Tab / Shift+Tab` renders as `**Tab** / **Shift+Tab**`, matching the old table. */
function boldKeys(keys) {
  return keys
    .split('/')
    .map((part) => `**${part.trim()}**`)
    .join(' / ');
}

function renderGlossaryTable(entries) {
  const lines = ['| Word | What it means here |', '|---|---|'];
  for (const { term, definition } of entries) {
    lines.push(`| **${term}** | ${definition} |`);
  }
  return lines.join('\n');
}

function renderShortcutTable(list) {
  const lines = ['| Key | What it does |', '|---|---|'];
  for (const { keys, description } of list) {
    lines.push(`| ${boldKeys(keys)} | ${description} |`);
  }
  return lines.join('\n');
}

function renderBulletList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function replaceBlock(markdown, block) {
  const start = markdown.indexOf(block.start);
  const end = markdown.indexOf(block.end);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`USER-GUIDE.md is missing the ${block.start} / ${block.end} markers`);
  }
  return `${markdown.slice(0, start + block.start.length)}\n${block.body}\n${markdown.slice(end)}`;
}

function currentBody(markdown, block) {
  const start = markdown.indexOf(block.start);
  const end = markdown.indexOf(block.end);
  if (start === -1 || end === -1) return null;
  return markdown.slice(start + block.start.length, end).trim();
}

function main() {
  const markdown = readFileSync(GUIDE, 'utf8');
  let next = markdown;
  for (const block of BLOCKS) next = replaceBlock(next, block);

  if (process.argv.includes('--check')) {
    const stale = BLOCKS.filter((block) => currentBody(markdown, block) !== block.body.trim()).map(
      (block) => block.name,
    );
    if (stale.length > 0) {
      console.error(`USER-GUIDE.md is out of date for: ${stale.join(', ')}. Run: npm run docs`);
      process.exit(1);
    }
    console.log('Generated guide blocks are up to date.');
    return;
  }

  writeFileSync(GUIDE, next);
  console.log(`Generated guide blocks written: ${BLOCKS.map((block) => block.name).join(', ')}`);
}

module.exports = { renderGlossaryTable, renderShortcutTable, renderBulletList, replaceBlock };

if (require.main === module) main();
