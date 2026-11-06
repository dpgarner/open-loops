# Open Loops — a user guide

Open Loops is a page you open in a browser to keep track of everything you have said you
would do. It is one screen with a handful of lists, built around a simple promise: write
things down quickly, decide what each one means once, and then trust the list instead of
your memory.

You do not need to install anything or sign in. There is no account, no server, and
nothing is sent anywhere. Your lists are stored inside the browser you are using.

The method behind it is called Getting Things Done (GTD). You do not need to know it —
this guide explains every word the app uses — but the app is arranged the way that method
works, so a few of its habits will make more sense if you know why they exist.

## What it is, and what it is not

It **is** a capture tool and a set of lists: an inbox for things you have not decided
about yet, next actions you can actually do, projects that need more than one step, things
other people owe you, ideas parked for later, and dated items that resurface by
themselves.

It is **not** a calendar, a reminder app that pings you, or something that syncs between
devices. It runs while the tab is open; when it is closed, nothing happens. The tickler
tells you what is due when you look at it — it will not notify you.

## The words the app uses

| Word | What it means here |
|---|---|
| **Capture** | Writing something down before you decide what to do about it. The bar at the top of every screen does this. |
| **Inbox** | Where captured things wait until you decide. The goal is to empty it — not by doing the work, but by deciding. |
| **Clarify** | The decision itself: is this an action, a project, something someone owes you, a maybe, or nothing? |
| **Next action** | One concrete physical step you could take right now: "Ring the venue about the deposit", not "Sort out the offsite". |
| **Context** | Where or with what you would do an action — `@calls`, `@computer`, `@errands`, `@home`. You look at the list that matches where you are. |
| **Project** | Any outcome that needs more than one action. "Team offsite" is a project; "Draft three bullet points" is an action. |
| **Stuck** | A project with no open next action. It cannot move, so the app says so instead of letting it sit quietly. |
| **Waiting for** | Something another person owes you. Recording it frees your head; the app counts the days. |
| **Someday / maybe** | Ideas that are not commitments. Parked deliberately, with a note about why. |
| **Tickler** | The dating system. A dated action steps out of its list until the morning of that day, then comes back on its own. |
| **Deferred** | The section where actions with a future date wait. They are not forgotten — they are held back. |
| **Weekly review** | A guided pass over the whole system, about once a week, so nothing rots. |

## Your first ten minutes

### 1. Decide what to do with the example data

The first time you open the app it contains a small made-up set: a team offsite, a flaky
checkout, two things other people owe, three inbox items and a few dates. It is there so
the lists are not empty while you find your way around.

Explore it freely. When you are ready for your own system, use **Clear data** in the
sidebar. It asks you to confirm first, and it empties every list — the four default
contexts stay, so you are not left with nothing to file into.

> **Careful:** **Demo data** does *not* ask — it immediately replaces whatever is in the
> app with the example set. If you have real lists, press **Export** first.

### 2. Capture three real things

Click the bar at the top, type one thing, press **Enter**. Repeat. Do not sort them, do
not reword them — a fragment is fine. Capture is meant to be faster than deciding.

From anywhere in the app you can press **c** to jump to that bar, unless you are already
typing in a field.

### 3. Empty the inbox

Open **Inbox**. Each item has the same six choices, and each one removes the item from the
inbox:

- **Next action** — it is one step you can do. You pick a context, optionally attach it to
  a project, and optionally give it a date to resurface.
- **Project** — it needs several steps. You give the project a name, write the outcome
  ("what is true when this is done?"), and the app lets you add the first action straight
  away.
- **Waiting for** — someone else owes you. Put their name in; the item moves to that
  person's list.
- **Someday** — a real idea, but not now. Add a note about why it is parked, and
  optionally a date to bring it back.
- **Handled** — it needed no action and no record. It disappears.
- **Trash** — it was never real. It disappears.

The panel that opens when you choose the first four is a form; **File it** saves your
choice, **Cancel** leaves the item in the inbox untouched. The item's text is copied into
the form so you can trim it rather than retype it.

Two of these choices are permanent: **Handled** and **Trash** keep no record and cannot be
undone.

### 4. Look at where you actually are

Open **Next actions**. Your actions are grouped by context, so you can read only the ones
that fit the moment — the `@calls` list while you have a phone in your hand.

If a context you need is missing, type it in the **New context** box and press **Enter**
(or click **Add context**). Writing `workshop` and writing `@workshop` both work; the app
adds the `@`.

Tick a checkbox when you finish something. It leaves the list and waits under **Show
completed**, where you can tick it back if you did it by mistake.

### 5. Check your projects

Open **Projects**. Each card shows its next open action, so you can see what a project
actually needs from you. A project with nothing next is flagged as **stuck** and offers a
form to name the next step — that flag is the single most useful thing in the app.

When a project is finished, press **Complete**. Its remaining actions are marked done at
the same time rather than left floating.

### 6. Run the review once

Open **Weekly review**. It walks through four steps with **Next** and **Back**, and you can
click any step to jump to it. At the end, **Complete the review** logs the date and the nag
goes quiet for a week. Doing this once on the example data is the fastest way to understand
how the pieces fit.

## The screens, one at a time

### The capture bar

On every screen. Type, **Enter**, done. Blank input is ignored, and spaces around what you
typed are trimmed. Everything lands in the inbox; nothing is filed automatically.

### Inbox

The decision queue. Each row shows when it was captured. Use **Next action**, **Project**,
**Waiting for**, **Someday**, **Handled** or **Trash** as described above. When it is empty
the app says **Inbox zero** — that is the normal, healthy state, not an empty screen to
worry about.

### Next actions

The list you work from during the day.

The form at the top adds an action directly. Choose its context and project, and use the
date box if it should not appear until later.

Actions are grouped by context. A context heading only appears when it has at least one
open action, so the list does not fill with empty groups.

**Deferred** collects actions whose resurface date has not arrived. Each one tells you when
it comes back ("resurfaces in 3 days"). They return to their context list by themselves on
the morning of that day — you do not have to move them.

The **⏱** button on any row sets, changes or clears its date. The **×** deletes the action;
that is immediate and has no undo.

### Projects

One card per outcome, with three sections: **Active**, **On hold**, **Completed**.

An active card shows its next open action with a checkbox, or the **stuck** warning and a
**Define the next action** form. **Put on hold** takes a project out of your active list
without pretending it is finished — on-hold projects are not counted as stuck. **Activate**
brings it back. **Complete** finishes it and closes its open actions.

The form at the top adds a project: a name and the successful outcome. Neither needs to be
clever; "what is true when this is done" is the only question that matters.

### Waiting for

Grouped by person, with a count of how many days each item has been waiting. After a week
the day count is highlighted, which is a gentle nudge to chase it. **Received** clears the
item once it arrives.

### Someday / maybe

Ideas that are not commitments. **Park it** adds one with an optional note and an optional
date to remind you. Each row offers **⏱** to change that date, **Move to inbox** when an
idea starts pulling at you and needs a real decision, and **Let it go** to remove it.

A dated idea keeps its place on this list but is highlighted when its date arrives, so you
see it without having to hunt for it.

### Tickler

The dating view, split in two.

**Due now** lists everything whose date has arrived or passed: actions (with a checkbox and
their context) and ideas. Each action offers **Push a week** and **Clear**; each idea
offers **Move to inbox**, **Push a week** and **Let it go**. When nothing is due, it says
so and means it — a quiet tickler is a working tickler.

**Upcoming** groups everything dated ahead by day, soonest first, with "tomorrow" or "in N
days" beside each date.

The number next to **Tickler** in the sidebar only appears when something is actually due,
so a date in the future never looks like an alarm.

### Weekly review

Four steps, with a progress bar across the top.

1. **Get clear** — the inbox, with the same decisions as the Inbox screen, but only the
   four quick ones: **Next action**, **Someday**, **Handled**, **Trash**. For a project or
   a waiting-for item, do it on the Inbox screen.
2. **Get current** — every active project and its next action (stuck ones offer the form
   inline), the waiting-for list with **Received**, what the tickler has come due, and a
   count of parked ideas with a link to that list.
3. **Get creative** — four prompts and a box to write in, which you can send to the inbox
   with **Capture to inbox** or park with **Park as someday**.
4. **Wrap up** — a summary of the whole system: inbox, open actions, active projects, stuck
   projects, due tickler items, waiting, parked ideas. Then **Complete the review**.

The app asks for a review when one has never been run, or when seven days have passed. A
banner offers **Start the review**, and a dot appears beside **Weekly review** in the
sidebar. Logging a review clears both for a week.

### The sidebar

Counts for each list, plus four buttons at the bottom: **Export**, **Import**, **Demo
data** and **Clear data**. The footnote under them — "Stored in this browser only. Nothing
leaves the machine." — is literally true, and it is also the reason to read the next
section.

## Dates, and how the tickler decides

Dates here are days, not times. A date of the 8th means "the morning of the 8th", and the
switch happens at your computer's local midnight, not at midnight somewhere else.

- An action dated **in the future** leaves its context list and waits in **Deferred**. It
  comes back on its own.
- An action dated **today or earlier** stays where it is and also appears in **Tickler →
  Due now**, labelled "due today", "1 day overdue", "3 days overdue" and so on.
- An idea dated in the future stays on the Someday list, unhighlighted. When its day
  arrives it is highlighted and appears under **Due now**.
- **Push a week** moves a date seven days on from today, which is the usual answer to "not
  this week".

Because dates are days, they do not drift with time zones or with the time of day you set
them.

## Install it, and use it offline

The app needs no account and no server of its own. Open the built app in a
Chromium-based browser (Chrome or Edge), then use the install icon in the
address bar, or **Install Open Loops** from the browser menu. It opens in its own
window like a desktop app, and your data stays exactly where it was: in this
browser's local storage.

The built copy also works without a network. The first visit stores the app shell,
its scripts, styles and icons; after that, opening it offline still shows the full
workspace, and capturing works normally because everything is stored locally.
Drag-and-drop and the rest of the interface are not affected.

Two things worth knowing. The cache belongs to the copy you installed, so it does
not share data with another browser or another machine — export and import JSON if
you need to move between them. And the cache is replaced the next time you load
the app after a rebuild, so run the build again rather than editing files in
place.

When a newer build is available, it downloads in the background and a small banner
appears at the bottom of the window: **Reload** switches to it. Nothing changes
underneath you until you choose that, so you cannot lose a half-typed capture.

`npm run dev` deliberately has no offline cache, so hot reload behaves normally.
Install and offline behaviour come from the production build, which `npm run preview`
serves if you want to try it.

### Which build am I running?

The bottom of the sidebar carries a line like

`Build mw5g933m · be6f971 · 2026-11-06 20:51 UTC`

— the build id, the short commit it was built from, and when it was built, in UTC.
The commit is a link to that exact commit on GitHub, which is the quickest way to see
what changed. **Development build** in that spot means `npm run dev` is serving the
page, so there is no build to compare.

If the update banner is showing, press **Reload** and then read this line again: the id
and commit should have moved to the new build. The id is a build timestamp rather than
a version number, so compare the commit when you need to know exactly what you have.

## Your data, backups, and how not to lose it

Everything you type is saved in your browser's local storage, for the address you opened
the app at. There is no account and no copy anywhere else, which is good for privacy and
bad for accidents.

**Export** downloads a single file named like `open-loops-2026-11-06.json`. That file is
your backup. Keep it wherever you keep other files — it is plain, readable text.

**Import** reads one of those files and restores it. It *replaces* everything currently in
the app rather than merging, so export before you import if there is anything you would
miss. If the file is not valid or is not an Open Loops backup, the app says so and changes
nothing.

Things that will make your lists disappear:

- Clearing your browser's browsing data, especially "cookies and other site data".
- Using a private or incognito window — those forget everything when they close.
- Opening the app in a different browser, or on a different device.
- Opening it at a different address. A browser treats `localhost` and `127.0.0.1`, or a
  different port, as different sites with separate storage.
- Some cleanup and privacy tools, which treat local storage as junk.

None of these can be undone afterwards. A weekly **Export** — say, when you finish the
weekly review — costs a few seconds and covers all of them.

## Keyboard shortcuts and small conveniences

There is one application-wide shortcut, and it is the useful one:

| Key | What it does |
|---|---|
| **c** | Jumps to the capture bar from anywhere, unless you are already typing in a field. |
| **Enter** | Files what you typed in the capture bar; in the **New context** box, adds the context. |
| **Tab** / **Shift+Tab** | Moves between fields and buttons, as in any web page. |
| **Space** | Ticks or unticks a checkbox you have tabbed to. |

Everything else is a click, and every button says what it does. If you forget any of the
above, the **Help** button at the bottom of the sidebar opens a summary over whatever you
were doing — the words, the inbox choices, how dates behave, the backup warning and these
shortcuts — and **Esc** or **Close** puts you back exactly where you were.

A few details that make the app quicker to live with:

- Adding an action with a context that does not exist yet creates the context, so you never
  have to set lists up in advance.
- An action's project name appears as a small label on its row, so you can see why it
  exists without opening the project.
- Completed actions are kept, not deleted. **Show completed** on the Next actions screen
  reveals them with their checkboxes still live, so a mis-tick is one click to fix.
- The **⏱** date picker has a **Clear** button, which is how you remove a date entirely.
- Counts in the sidebar update as you work; none of them is an alarm except the review dot
  and the tickler count.

## When something looks wrong

**An action vanished from my `@computer` list.** It has a future resurface date. Look under
**Deferred** on the Next actions screen, or in the Tickler's **Upcoming** section.

**A project says "stuck" but I know it has actions.** Stuck means it has no *open* action —
they are all ticked, or its only action is deferred by a future date. Add the next step, or
bring the date forward.

**The weekly review keeps nagging.** It counts seven days from the last logged review.
Finish the review to log it; the nag is the point, not a bug.

**The inbox is empty but I expected something to come back.** Only *dated* items return on
their own. **Handled** and **Trash** remove items for good, and **Let it go** removes a
parked idea.

**Import refuses my file.** It only accepts a file this app exported. A different JSON file
— or a spreadsheet or text file renamed to `.json` — is rejected, and nothing is changed.

**It says "due today" but today is nearly over.** Dates are days: an item becomes due at
local midnight and stays due until you do something with it. It will say "1 day overdue"
tomorrow.

**Nothing reminds me.** Correct — there are no notifications. The tickler and the review nag
only exist while the tab is open.

**My lists are suddenly empty.** Usually a different address, a different browser, a private
window, or cleared browsing data. Restore your most recent **Export**; if you never made
one, there is nothing to restore.

## If you have used GTD before

The mapping is direct. Capture is the collection stage. The inbox is processed with the
standard decision tree, and every route out of it is one form. Next actions are physical
steps grouped by context, and a project cannot be active without one — that is the
"stuck" rule, enforced gently with an inline form rather than a block. Waiting-for,
someday/maybe and the tickler are separate lists, and the weekly review is the four-stage
pass (clear, current, creative, wrap up) with the date recorded.

What is missing compared with a full GTD tool: no calendar, no recurring actions, no
attachments, no search, no reference filing, and no sync. The scope is deliberately the
lists and the review.
