import type { AppState } from './types';

const daysAgo = (n: number): string => new Date(Date.now() - n * 86_400_000).toISOString();

/** Date-only key offset by whole days, which is what tickler dates are. */
export function dateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const CONTEXTS = ['@calls', '@computer', '@errands', '@home'];

export function emptyState(): AppState {
  return {
    inbox: [],
    actions: [],
    projects: [],
    waiting: [],
    someday: [],
    contexts: [...CONTEXTS],
    lastReview: null,
    reviews: [],
  };
}

/**
 * A small but realistic set: a team offsite, a flaky-checkout project, and two
 * waiting-for items. It exists so inbox zero and the review flow can be tried
 * immediately, and so the tickler has something to show — one overdue action,
 * one action due in three days, an overdue idea and one due next week.
 */
export function seedState(): AppState {
  return {
    contexts: [...CONTEXTS, '@agenda-Dana', '@agenda-Priya'],
    projects: [
      {
        id: 'p-offsite',
        title: 'Team offsite',
        outcome: 'A booked, agenda’d offsite the team is glad it went to',
        status: 'active',
        createdAt: daysAgo(9),
        completedAt: null,
      },
      {
        id: 'p-checkout',
        title: 'Flaky checkout',
        outcome: 'Checkout succeeds every time on mobile Safari',
        status: 'active',
        createdAt: daysAgo(3),
        completedAt: null,
      },
      {
        id: 'p-taxes',
        title: 'Quarterly estimates',
        outcome: 'Q4 estimates filed and the accountant has what they need',
        status: 'on-hold',
        createdAt: daysAgo(14),
        completedAt: null,
      },
    ],
    actions: [
      {
        id: 'a-deck',
        title: 'Draft three bullet points for the offsite deck',
        context: '@computer',
        projectId: 'p-offsite',
        done: false,
        doneAt: null,
        createdAt: daysAgo(8),
        ticklerDate: null,
      },
      {
        id: 'a-venue',
        title: 'Ring the venue about the deposit',
        context: '@calls',
        projectId: 'p-offsite',
        done: false,
        doneAt: null,
        createdAt: daysAgo(7),
        ticklerDate: null,
      },
      {
        id: 'a-dana',
        title: 'Ask Dana whether she can run the retro session',
        context: '@agenda-Dana',
        projectId: 'p-offsite',
        done: false,
        doneAt: null,
        createdAt: daysAgo(6),
        ticklerDate: null,
      },
      {
        id: 'a-repro',
        title: 'Reproduce the Safari payment failure on a real device',
        context: '@computer',
        projectId: 'p-checkout',
        done: false,
        doneAt: null,
        createdAt: daysAgo(3),
        ticklerDate: null,
      },
      {
        id: 'a-logs',
        title: 'Read the last two error-log exports',
        context: '@computer',
        projectId: 'p-checkout',
        done: false,
        doneAt: null,
        createdAt: daysAgo(2),
        ticklerDate: null,
      },
      {
        id: 'a-keyboard',
        title: 'Pick up the replacement keyboard',
        context: '@errands',
        projectId: null,
        done: false,
        doneAt: null,
        createdAt: daysAgo(5),
        ticklerDate: null,
      },
      {
        id: 'a-dentist',
        title: 'Book the dentist for a check-up',
        context: '@calls',
        projectId: null,
        done: false,
        doneAt: null,
        createdAt: daysAgo(11),
        ticklerDate: null,
      },
      {
        id: 'a-domain',
        title: 'Renew the domain before it lapses',
        context: '@computer',
        projectId: null,
        done: false,
        doneAt: null,
        createdAt: daysAgo(12),
        ticklerDate: dateKey(-2),
      },
      {
        id: 'a-invoice',
        title: 'Chase the venue about the invoice',
        context: '@calls',
        projectId: 'p-offsite',
        done: false,
        doneAt: null,
        createdAt: daysAgo(1),
        ticklerDate: dateKey(3),
      },
      {
        id: 'a-dates',
        title: 'Confirm the offsite dates with the venue',
        context: '@calls',
        projectId: 'p-offsite',
        done: true,
        doneAt: daysAgo(4),
        createdAt: daysAgo(10),
        ticklerDate: null,
      },
    ],
    waiting: [
      {
        id: 'w-contract',
        title: 'Signed contract from the venue',
        person: 'Dana',
        projectId: 'p-offsite',
        since: daysAgo(6),
      },
      {
        id: 'w-refund',
        title: 'Refund confirmation from the card processor',
        person: 'Priya',
        projectId: 'p-checkout',
        since: daysAgo(2),
      },
    ],
    someday: [
      {
        id: 's-sail',
        title: 'Learn to sail',
        note: 'A two-day course somewhere coastal, once the offsite is done.',
        createdAt: daysAgo(20),
        remindOn: dateKey(-1),
      },
      {
        id: 's-essay',
        title: 'Write the “small tools” essay',
        note: 'The one about programs that do one job and outlive their authors.',
        createdAt: daysAgo(30),
        remindOn: dateKey(7),
      },
    ],
    inbox: [
      {
        id: 'i-voicemail',
        text: 'Voicemail from the accountant about Q4 estimates',
        createdAt: daysAgo(1),
      },
      {
        id: 'i-link',
        text: 'Link from Sam: “dead simple scheduling”',
        createdAt: daysAgo(1),
      },
      {
        id: 'i-demo',
        text: 'Idea: a twenty-minute team demo every Friday',
        createdAt: daysAgo(0),
      },
    ],
    lastReview: daysAgo(9),
    reviews: [daysAgo(9)],
  };
}
