# Open Loops

A local-first GTD workspace: capture, clarify, organise and review in one screen.
Vite + React + TypeScript, `localStorage` for persistence, no backend and no auth.

Not a developer? Read the [user guide](USER-GUIDE.md) — it explains the vocabulary, a
first run, backups and shortcuts without any setup instructions.

    npm install
    npm run dev     # http://127.0.0.1:5179

`npm run build` runs `tsc --noEmit` and then the production bundle, so a type
error fails the build rather than shipping.

`npm test` runs the Jest suite in `tests/` — the store's operations and
persistence, the import/export path, the project rules, and the tickler date
logic (including the midnight boundary). `npm run test:watch` keeps it running, and
`npm run test:coverage` prints a coverage table and writes a browsable report to
`coverage/` (git-ignored).

GitHub Actions runs `npm test` and `npm run build` on every push to `main` — see
`.github/workflows/ci.yml`.

## Which problem each screen solves

- **Capture** — the bar sits on every screen; `Enter` files it to the inbox, and
  `c` jumps there from anywhere outside a text field. Capture first, judge later.
- **Inbox** — every item offers the GTD decision tree in one click: **next
  action** (with its context and optional project), **project** (name plus the
  successful outcome and an optional first action), **waiting for** (who owes
  it), **someday**, **handled**, or **trash**. Each choice empties the inbox, so
  inbox zero is reachable rather than aspirational.
- **Next actions** — one concrete physical step per row, grouped by context
  (`@calls`, `@computer`, `@errands`, `@home`, `@agenda-…`), with inline context
  creation. Completed actions hide behind a toggle.
- **Projects** — every active card shows its next open action with a checkbox.
  A project with no next action is flagged as **stuck** and offers an inline form
  to define one, because an outcome without a next step is the thing people get
  stuck on. Active, on hold and completed sections; completing a project closes
  its remaining actions instead of orphaning them.
- **Waiting for** — grouped by person, showing how many days each item has been
  waiting, with **Received** to clear it.
- **Someday / maybe** — parked ideas with a reason; promote one back to the inbox
  when it starts pulling at you.
- **Tickler** — the ⏱ control on any action or someday idea sets a date. A dated
  action leaves its context list and sits in **Deferred** until the morning of
  that day, then returns on its own; a dated idea keeps its place on the someday
  list but stops needing to be checked by hand. The Tickler view collects what
  has come **due now** (tick it off, promote it, push it out a week) and what is
  **upcoming**, grouped by day. Its sidebar count only appears when something is
  actually due, so a quiet tickler stays quiet. The weekly review has a tickler
  block in *get current* and a due figure in the wrap-up.
- **Weekly review** — four steps with a progress bar: *get clear* (process the
  inbox inline), *get current* (every project's next action, the waiting-for
  list, the someday list), *get creative* (a dump box plus prompts that can file
  to the inbox or to someday), and *wrap up* (a summary of the whole system and
  **Complete the review**, which logs the date). A banner and a sidebar dot nag
  once seven days have passed.

## Data

Tickler dates are stored as local date-only keys (`YYYY-MM-DD`), so "due today"
changes at local midnight rather than drifting with a stored timestamp.

Everything lives in this browser. `Export` downloads a JSON backup and `Import`
restores one; **Demo data** reloads the seeded example set (a team offsite, a
flaky-checkout project, two waiting-for items) and **Clear data** empties the
system. Nothing leaves the machine — the dev server binds loopback only.

## Install and offline

The production build is installable: `public/manifest.webmanifest` declares a
standalone app with 192px and 512px icons, and `public/sw.js` precaches the shell
plus hashed build assets so a built copy opens without a network. The worker is
registered only in production builds (`import.meta.env.PROD`), so `npm run dev`
stays uncached and hot reload keeps working. Rebuild to pick up a change: hashed
asset names change, and the worker replaces its old caches on activation.

A new build does not swap itself in under a running page. It installs and waits,
and the app shows a small "a new version is ready" banner with a **Reload** button
(`src/components/UpdateBanner.tsx`, `src/offline-shell.ts`). Each build stamps a
fresh id into `dist/sw.js`, so an asset-only rebuild is still detected as an
update. The page re-checks when the window regains focus and every five minutes
(throttled to one check a minute), because the browser's own check only runs on
navigation and at most once a day.

## Recovered

The original build lived in an ephemeral cloud sandbox and no copy survived on
disk. This is a rebuild from that project's specification, keeping its scope:
the app name, the clarify decision tree, the next-action gate on projects, the
four-step review with its seven-day nag, and JSON export/import.
