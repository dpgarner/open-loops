import type { AppState } from './types';

const daysAgo = (n: number): string => new Date(Date.now() - n * 86_400_000).toISOString();

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
 * immediately, and so the "stuck project" state is visible once, on purpose.
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
      },
      {
        id: 'a-venue',
        title: 'Ring the venue about the deposit',
        context: '@calls',
        projectId: 'p-offsite',
        done: false,
        doneAt: null,
        createdAt: daysAgo(7),
      },
      {
        id: 'a-dana',
        title: 'Ask Dana whether she can run the retro session',
        context: '@agenda-Dana',
        projectId: 'p-offsite',
        done: false,
        doneAt: null,
        createdAt: daysAgo(6),
      },
      {
        id: 'a-repro',
        title: 'Reproduce the Safari payment failure on a real device',
        context: '@computer',
        projectId: 'p-checkout',
        done: false,
        doneAt: null,
        createdAt: daysAgo(3),
      },
      {
        id: 'a-logs',
        title: 'Read the last two error-log exports',
        context: '@computer',
        projectId: 'p-checkout',
        done: false,
        doneAt: null,
        createdAt: daysAgo(2),
      },
      {
        id: 'a-keyboard',
        title: 'Pick up the replacement keyboard',
        context: '@errands',
        projectId: null,
        done: false,
        doneAt: null,
        createdAt: daysAgo(5),
      },
      {
        id: 'a-dentist',
        title: 'Book the dentist for a check-up',
        context: '@calls',
        projectId: null,
        done: false,
        doneAt: null,
        createdAt: daysAgo(11),
      },
      {
        id: 'a-dates',
        title: 'Confirm the offsite dates with the venue',
        context: '@calls',
        projectId: 'p-offsite',
        done: true,
        doneAt: daysAgo(4),
        createdAt: daysAgo(10),
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
      },
      {
        id: 's-essay',
        title: 'Write the “small tools” essay',
        note: 'The one about programs that do one job and outlive their authors.',
        createdAt: daysAgo(30),
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
